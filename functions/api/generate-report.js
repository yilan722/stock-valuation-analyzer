// Cloudflare Pages Function for report generation
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { stockData, locale = 'zh' } = await request.json();
    
    const perplexityApiKey = env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      return new Response(JSON.stringify({ error: 'PERPLEXITY_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 创建报告生成请求
    const reportRequest = {
      model: 'sonar-deep-research',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的股票分析师。请生成一个专业的股票分析报告，包含基本面分析、业务分析、增长催化剂和估值分析四个部分。请用JSON格式返回，键名为：fundamentalAnalysis, businessSegments, growthCatalysts, valuationAnalysis。'
        },
        {
          role: 'user',
          content: `请为股票 ${stockData.symbol} (${stockData.name}) 生成专业的深度分析报告。当前价格: ${stockData.price}。请用中文回答，内容要专业详细，使用sonar-deep-research模型进行深度研究。`
        }
      ],
      max_tokens: 15000,
      temperature: 0.05,
      top_p: 0.9,
      presence_penalty: 0.15
    };

    // 调用Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.content || '无法生成报告内容';

    // 尝试解析JSON格式的报告
    let reportContent;
    try {
      reportContent = JSON.parse(content);
    } catch {
      // 如果不是JSON格式，创建默认结构
      reportContent = {
        fundamentalAnalysis: `<h3>基本面分析</h3><p>${content}</p>`,
        businessSegments: `<h3>业务分析</h3><p>基于当前市场数据的业务分析。</p>`,
        growthCatalysts: `<h3>增长催化剂</h3><p>潜在的增长驱动因素分析。</p>`,
        valuationAnalysis: `<h3>估值分析</h3><p>基于当前价格的投资建议。</p>`
      };
    }

    return new Response(JSON.stringify({
      ...reportContent,
      metadata: {
        timestamp: new Date().toISOString(),
        model: 'sonar-deep-research',
        cloudflareMode: true
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return new Response(JSON.stringify({
      error: '报告生成失败',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
