import { NextRequest, NextResponse } from 'next/server'

// 使用Edge Runtime，可能有不同的超时限制
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🚀 开始Edge报告生成...')
    
    // 获取请求数据
    const { stockData, locale = 'zh' } = await request.json()
    console.log('📊 股票数据:', stockData)
    
    // 检查环境变量
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY
    if (!perplexityApiKey) {
      return NextResponse.json({
        error: 'PERPLEXITY_API_KEY environment variable is not set',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    // 创建完整的报告生成请求
    const fullRequest = {
      model: 'sonar-deep-research',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的股票分析师。请生成一个专业的股票分析报告，包含基本面分析、业务分析、增长催化剂和估值分析四个部分。请用JSON格式返回，键名为：fundamentalAnalysis, businessSegments, growthCatalysts, valuationAnalysis。内容要专业详细，使用深度研究。'
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
    }
    
    console.log('📤 发送Edge Perplexity API请求...')
    
    // Edge Runtime可能有不同的超时限制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25秒超时
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullRequest),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Perplexity API错误:', response.status, errorText)
        return NextResponse.json({
          error: 'Perplexity API error',
          details: errorText,
          status: response.status,
          timestamp: new Date().toISOString()
        }, { status: response.status })
      }
      
      const data = await response.json()
      console.log('✅ 收到Perplexity响应')
      
      // 提取内容
      const content = data.choices?.[0]?.message?.content || data.content || '无法生成报告内容'
      
      // 尝试解析JSON格式的报告
      let reportContent
      try {
        reportContent = JSON.parse(content)
      } catch {
        // 如果不是JSON格式，创建默认结构
        reportContent = {
          fundamentalAnalysis: `<h3>基本面分析</h3><p>${content}</p>`,
          businessSegments: `<h3>业务分析</h3><p>基于当前市场数据的业务分析。</p>`,
          growthCatalysts: `<h3>增长催化剂</h3><p>潜在的增长驱动因素分析。</p>`,
          valuationAnalysis: `<h3>估值分析</h3><p>基于当前价格的投资建议。</p>`
        }
      }
      
      const responseTime = Date.now() - startTime
      console.log(`✅ Edge报告生成完成，耗时: ${responseTime}ms`)
      
      return NextResponse.json({
        ...reportContent,
        metadata: {
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          model: 'sonar-deep-research',
          edgeMode: true
        }
      })
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      console.error('❌ API请求失败:', fetchError)
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          error: 'Request timeout',
          details: 'Edge Runtime请求超时。',
          timestamp: new Date().toISOString()
        }, { status: 408 })
      }
      
      throw fetchError
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Edge报告生成失败:', errorMessage)
    
    return NextResponse.json({
      error: '报告生成失败',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }, { status: 500 })
  }
}
