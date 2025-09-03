import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🚀 开始简化报告生成...')
    
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
    
    // 创建简化的请求
    const simpleRequest = {
      model: 'sonar-deep-research',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的股票分析师。请生成一个简化的股票分析报告，包含基本信息、财务分析和投资建议。'
        },
        {
          role: 'user',
          content: `请为股票 ${stockData.symbol} (${stockData.name}) 生成一个简化的分析报告。当前价格: ${stockData.price}。请用中文回答，内容要简洁明了。`
        }
      ],
      max_tokens: 1000, // 减少token数量
      temperature: 0.7
    }
    
    console.log('📤 发送简化的Perplexity API请求...')
    
    // 使用较短的超时时间
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simpleRequest),
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
      
      // 创建简化的报告格式
      const reportContent = {
        fundamentalAnalysis: `<h3>基本面分析</h3><p>${content}</p>`,
        businessSegments: `<h3>业务分析</h3><p>基于当前市场数据的业务分析。</p>`,
        growthCatalysts: `<h3>增长催化剂</h3><p>潜在的增长驱动因素分析。</p>`,
        valuationAnalysis: `<h3>估值分析</h3><p>基于当前价格的投资建议。</p>`
      }
      
      const responseTime = Date.now() - startTime
      console.log(`✅ 简化报告生成完成，耗时: ${responseTime}ms`)
      
      return NextResponse.json({
        ...reportContent,
        metadata: {
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          model: 'sonar-deep-research',
          simplified: true
        }
      })
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      console.error('❌ API请求失败:', fetchError)
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          error: 'Request timeout',
          details: '请求超时，请稍后重试',
          timestamp: new Date().toISOString()
        }, { status: 408 })
      }
      
      throw fetchError
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ 简化报告生成失败:', errorMessage)
    
    return NextResponse.json({
      error: '报告生成失败',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }, { status: 500 })
  }
}
