import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { stockData, locale = 'zh' } = await request.json()
    
    console.log('🧪 测试报告生成API...')
    console.log('📊 股票数据:', stockData)
    console.log('🌐 语言:', locale)
    
    // 检查环境变量
    const envCheck = {
      perplexityApiKey: process.env.PERPLEXITY_API_KEY ? '✅ 已设置' : '❌ 未设置',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置',
    }
    
    // 测试Perplexity API连接
    let perplexityTest = null
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        const testResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar-deep-research',
            messages: [
              {
                role: 'user',
                content: 'Hello, this is a test message. Please respond with "Test successful".'
              }
            ],
            max_tokens: 50
          }),
          signal: AbortSignal.timeout(30000) // 30秒超时
        })
        
        if (testResponse.ok) {
          const testData = await testResponse.json()
          perplexityTest = {
            status: 'success',
            response: testData
          }
        } else {
          const errorText = await testResponse.text()
          perplexityTest = {
            status: 'error',
            statusCode: testResponse.status,
            error: errorText
          }
        }
      } catch (error) {
        perplexityTest = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      envCheck,
      perplexityTest,
      stockData,
      locale,
      message: '测试完成'
    })
    
  } catch (error) {
    console.error('测试API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
