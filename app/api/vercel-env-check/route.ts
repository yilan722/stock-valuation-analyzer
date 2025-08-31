import { NextResponse } from 'next/server'

export async function GET() {
  const startTime = Date.now()
  
  // 详细的环境变量检查
  const envCheck = {
    timestamp: new Date().toISOString(),
    responseTime: 0,
    deployment: {
      environment: process.env.NODE_ENV || 'unknown',
      vercel: process.env.VERCEL ? 'true' : 'false',
      vercelEnv: process.env.VERCEL_ENV || 'unknown',
      vercelUrl: process.env.VERCEL_URL || 'not_set'
    },
    
    // 关键环境变量详细检查
    criticalEnvVars: {
      TUSHARE_TOKEN: {
        exists: !!process.env.TUSHARE_TOKEN,
        length: process.env.TUSHARE_TOKEN?.length || 0,
        preview: process.env.TUSHARE_TOKEN ? `${process.env.TUSHARE_TOKEN.substring(0, 8)}...` : 'NOT_SET',
        hasSpaces: process.env.TUSHARE_TOKEN?.includes(' ') || false,
        hasNewlines: process.env.TUSHARE_TOKEN?.includes('\n') || false,
        startsWithQuote: process.env.TUSHARE_TOKEN?.startsWith('"') || false,
        endsWithQuote: process.env.TUSHARE_TOKEN?.endsWith('"') || false,
        rawValue: process.env.TUSHARE_TOKEN || 'NOT_SET'
      },
      
      PERPLEXITY_API_KEY: {
        exists: !!process.env.PERPLEXITY_API_KEY,
        length: process.env.PERPLEXITY_API_KEY?.length || 0,
        preview: process.env.PERPLEXITY_API_KEY ? `${process.env.PERPLEXITY_API_KEY.substring(0, 8)}...` : 'NOT_SET',
        hasSpaces: process.env.PERPLEXITY_API_KEY?.includes(' ') || false,
        hasNewlines: process.env.PERPLEXITY_API_KEY?.includes('\n') || false,
        startsWithQuote: process.env.PERPLEXITY_API_KEY?.startsWith('"') || false,
        endsWithQuote: process.env.PERPLEXITY_API_KEY?.endsWith('"') || false,
        rawValue: process.env.PERPLEXITY_API_KEY || 'NOT_SET'
      }
    },
    
    // 所有环境变量（仅显示相关的）
    allRelevantEnvVars: Object.keys(process.env)
      .filter(key => 
        key.includes('TUSHARE') || 
        key.includes('PERPLEXITY') || 
        key.includes('SUPABASE') ||
        key.includes('VERCEL')
      )
      .reduce((acc, key) => {
        const value = process.env[key]
        acc[key] = {
          exists: !!value,
          length: value?.length || 0,
          preview: value ? `${value.substring(0, 20)}...` : 'NOT_SET',
          hasSpaces: value?.includes(' ') || false,
          hasNewlines: value?.includes('\n') || false
        }
        return acc
      }, {} as Record<string, any>),
    
    // 环境变量总数
    totalEnvVars: Object.keys(process.env).length,
    
    // 诊断建议
    diagnosis: [] as string[]
  }
  
  // 自动诊断
  if (!envCheck.criticalEnvVars.TUSHARE_TOKEN.exists) {
    envCheck.diagnosis.push('❌ TUSHARE_TOKEN 未设置 - 这是A股数据获取失败的根本原因')
  } else {
    if (envCheck.criticalEnvVars.TUSHARE_TOKEN.hasSpaces) {
      envCheck.diagnosis.push('⚠️ TUSHARE_TOKEN 包含空格 - 可能导致API调用失败')
    }
    if (envCheck.criticalEnvVars.TUSHARE_TOKEN.hasNewlines) {
      envCheck.diagnosis.push('⚠️ TUSHARE_TOKEN 包含换行符 - 可能导致API调用失败')
    }
    if (envCheck.criticalEnvVars.TUSHARE_TOKEN.startsWithQuote || envCheck.criticalEnvVars.TUSHARE_TOKEN.endsWithQuote) {
      envCheck.diagnosis.push('⚠️ TUSHARE_TOKEN 包含引号 - 可能导致API调用失败')
    }
  }
  
  if (!envCheck.criticalEnvVars.PERPLEXITY_API_KEY.exists) {
    envCheck.diagnosis.push('❌ PERPLEXITY_API_KEY 未设置 - 报告生成功能将无法使用')
  }
  
  if (envCheck.deployment.vercel === 'false') {
    envCheck.diagnosis.push('⚠️ 当前不在Vercel环境中运行')
  }
  
  if (envCheck.diagnosis.length === 0) {
    envCheck.diagnosis.push('✅ 所有关键环境变量都已正确设置')
  }
  
  envCheck.responseTime = Date.now() - startTime
  
  return NextResponse.json(envCheck)
}
