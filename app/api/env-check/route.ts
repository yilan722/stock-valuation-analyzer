import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 检查关键环境变量
    const envCheck = {
      // Supabase配置
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置',
      },
      
      // Perplexity配置
      perplexity: {
        apiKey: process.env.PERPLEXITY_API_KEY ? '✅ 已设置' : '❌ 未设置',
      },
      
      // 其他配置
      app: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL ? '✅ 已设置' : '❌ 未设置',
        nodeEnv: process.env.NODE_ENV || '❌ 未设置',
      },
      
      // 可选配置
      optional: {
        tushare: process.env.TUSHARE_TOKEN ? '✅ 已设置' : '⚠️ 未设置 (可选)',
        alphaVantage: process.env.ALPHA_VANTAGE_API_KEY ? '✅ 已设置' : '⚠️ 未设置 (可选)',
        paypal: process.env.PAYPAL_CLIENT_ID ? '✅ 已设置' : '⚠️ 未设置 (可选)',
      }
    }
    
    // 检查是否有关键环境变量缺失
    const criticalMissing = []
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) criticalMissing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) criticalMissing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if (!process.env.PERPLEXITY_API_KEY) criticalMissing.push('PERPLEXITY_API_KEY')
    
    const status = criticalMissing.length === 0 ? 'healthy' : 'unhealthy'
    
    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      criticalMissing,
      envCheck,
      message: criticalMissing.length === 0 
        ? '所有关键环境变量已正确设置' 
        : `缺少关键环境变量: ${criticalMissing.join(', ')}`
    })
    
  } catch (error) {
    console.error('环境变量检查错误:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
