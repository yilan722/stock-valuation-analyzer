import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 简单检查环境变量
    const token = process.env.TUSHARE_TOKEN
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none',
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('TUSHARE') || 
        key.includes('SUPABASE') || 
        key.includes('PERPLEXITY')
      )
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check environment',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
