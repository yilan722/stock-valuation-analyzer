import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // 检查环境变量
    const envCheck = {
      perplexityApiKey: process.env.PERPLEXITY_API_KEY ? '✅ 已设置' : '❌ 未设置',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置',
      tushareToken: process.env.TUSHARE_TOKEN ? '✅ 已设置' : '❌ 未设置',
    }
    
    // 简单的Perplexity API测试
    let perplexityTest = null
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        console.log('🧪 测试Perplexity API连接...')
        
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
                content: 'Hello, this is a quick test. Please respond with "Test successful".'
              }
            ],
            max_tokens: 20
          }),
          signal: AbortSignal.timeout(10000) // 10秒超时
        })
        
        console.log('📡 Perplexity API响应状态:', testResponse.status)
        
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
        console.error('❌ Perplexity API测试失败:', error)
        perplexityTest = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      envCheck,
      perplexityTest,
      message: '快速测试完成'
    })
    
  } catch (error) {
    console.error('快速测试错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
