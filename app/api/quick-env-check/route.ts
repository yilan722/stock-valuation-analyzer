import { NextResponse } from 'next/server'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // 快速检查环境变量
    const envCheck = {
      timestamp: new Date().toISOString(),
      responseTime: 0,
      environment: {
        hasPerplexityKey: !!process.env.PERPLEXITY_API_KEY,
        hasTushareToken: !!process.env.TUSHARE_TOKEN,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV || 'unknown'
      },
      tushareToken: {
        length: process.env.TUSHARE_TOKEN?.length || 0,
        preview: process.env.TUSHARE_TOKEN ? `${process.env.TUSHARE_TOKEN.substring(0, 8)}...` : 'undefined'
      },
      perplexityKey: {
        length: process.env.PERPLEXITY_API_KEY?.length || 0,
        preview: process.env.PERPLEXITY_API_KEY ? `${process.env.PERPLEXITY_API_KEY.substring(0, 8)}...` : 'undefined'
      }
    }
    
    envCheck.responseTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      message: 'Environment check completed',
      ...envCheck
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      responseTime: Date.now() - startTime
    }, { status: 500 })
  }
}
