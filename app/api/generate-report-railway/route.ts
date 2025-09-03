import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🚀 开始Railway报告生成...')
    
    // 获取请求数据
    const { stockData, locale = 'zh' } = await request.json()
    console.log('📊 股票数据:', stockData)
    
    // 使用外部Railway服务（需要您部署一个简单的API服务）
    const railwayApiUrl = process.env.RAILWAY_API_URL || 'https://your-railway-app.railway.app'
    
    console.log('📤 发送到Railway API服务...')
    
    // 使用较短的超时时间，因为外部服务会处理长时间请求
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8秒超时
    
    try {
      const response = await fetch(`${railwayApiUrl}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          stockData,
          locale,
          model: 'sonar-deep-research',
          maxTokens: 18000
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Railway API错误:', response.status, errorText)
        return NextResponse.json({
          error: 'Railway API error',
          details: errorText,
          status: response.status,
          timestamp: new Date().toISOString()
        }, { status: response.status })
      }
      
      const data = await response.json()
      console.log('✅ 收到Railway响应')
      
      const responseTime = Date.now() - startTime
      console.log(`✅ Railway报告生成完成，耗时: ${responseTime}ms`)
      
      return NextResponse.json({
        ...data,
        metadata: {
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          model: 'sonar-deep-research',
          railwayMode: true
        }
      })
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      console.error('❌ Railway API请求失败:', fetchError)
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          error: 'Request timeout',
          details: 'Railway API请求超时。',
          timestamp: new Date().toISOString()
        }, { status: 408 })
      }
      
      throw fetchError
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Railway报告生成失败:', errorMessage)
    
    return NextResponse.json({
      error: '报告生成失败',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }, { status: 500 })
  }
}
