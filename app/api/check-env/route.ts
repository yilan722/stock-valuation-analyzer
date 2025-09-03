import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 检查所有关键环境变量
    const envCheck = {
      // Supabase配置
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置',
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL || 'undefined',
        anonKeyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'undefined'
      },
      
      // Tushare配置
      tushare: {
        token: process.env.TUSHARE_TOKEN ? '✅ 已设置' : '❌ 未设置',
        tokenValue: process.env.TUSHARE_TOKEN ? `${process.env.TUSHARE_TOKEN.substring(0, 10)}...` : 'undefined',
        tokenLength: process.env.TUSHARE_TOKEN?.length || 0
      },
      
      // Perplexity配置
      perplexity: {
        apiKey: process.env.PERPLEXITY_API_KEY ? '✅ 已设置' : '❌ 未设置',
        apiKeyValue: process.env.PERPLEXITY_API_KEY ? `${process.env.PERPLEXITY_API_KEY.substring(0, 10)}...` : 'undefined'
      },
      
      // 应用配置
      app: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL ? '✅ 已设置' : '❌ 未设置',
        nodeEnv: process.env.NODE_ENV || '❌ 未设置',
        baseUrlValue: process.env.NEXT_PUBLIC_BASE_URL || 'undefined'
      }
    }
    
    // 检查是否有关键环境变量缺失
    const criticalMissing = []
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) criticalMissing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) criticalMissing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if (!process.env.TUSHARE_TOKEN) criticalMissing.push('TUSHARE_TOKEN')
    if (!process.env.PERPLEXITY_API_KEY) criticalMissing.push('PERPLEXITY_API_KEY')
    
    const status = criticalMissing.length === 0 ? 'healthy' : 'unhealthy'
    
    // 测试Tushare API连接
    let tushareTest = null
    if (process.env.TUSHARE_TOKEN) {
      try {
        const axios = require('axios')
        const response = await axios.post('https://api.tushare.pro', {
          api_name: 'stock_basic',
          token: process.env.TUSHARE_TOKEN,
          params: {
            ts_code: '300080.SZ'
          },
          fields: 'ts_code,symbol,name'
        }, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        tushareTest = {
          status: 'success',
          response: response.data
        }
      } catch (error) {
        tushareTest = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
    
    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      criticalMissing,
      envCheck,
      tushareTest,
      message: criticalMissing.length === 0 
        ? '所有关键环境变量已正确设置' 
        : `缺少关键环境变量: ${criticalMissing.join(', ')}`
    })
    
  } catch (error) {
    console.error('环境检查错误:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
