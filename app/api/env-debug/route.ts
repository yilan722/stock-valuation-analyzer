import { NextResponse } from 'next/server'

export async function GET() {
  // 直接显示所有环境变量状态
  const envStatus = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    
    // Tushare 相关
    TUSHARE_TOKEN: {
      exists: !!process.env.TUSHARE_TOKEN,
      length: process.env.TUSHARE_TOKEN?.length || 0,
      preview: process.env.TUSHARE_TOKEN ? `${process.env.TUSHARE_TOKEN.substring(0, 12)}...` : 'undefined',
      fullValue: process.env.TUSHARE_TOKEN || 'NOT_SET'
    },
    
    // Perplexity 相关
    PERPLEXITY_API_KEY: {
      exists: !!process.env.PERPLEXITY_API_KEY,
      length: process.env.PERPLEXITY_API_KEY?.length || 0,
      preview: process.env.PERPLEXITY_API_KEY ? `${process.env.PERPLEXITY_API_KEY.substring(0, 12)}...` : 'undefined',
      fullValue: process.env.PERPLEXITY_API_KEY || 'NOT_SET'
    },
    
    // Supabase 相关
    SUPABASE: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
      serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT_SET'
    },
    
    // 所有环境变量（仅显示相关的前缀）
    allEnvVars: Object.keys(process.env)
      .filter(key => key.includes('TUSHARE') || key.includes('PERPLEXITY') || key.includes('SUPABASE'))
      .reduce((acc, key) => {
        acc[key] = process.env[key] ? 'SET' : 'NOT_SET'
        return acc
      }, {} as Record<string, string>)
  }
  
  return NextResponse.json(envStatus)
}
