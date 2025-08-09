/**
 * 环境变量验证工具
 * 用于确保所有必需的环境变量都已正确设置
 */

export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'TUSHARE_TOKEN',
    'ALPHA_VANTAGE_API_KEY',
    'ALIPAY_APP_ID',
    'ALIPAY_PRIVATE_KEY',
    'ALIPAY_PUBLIC_KEY',
  ]
  
  const missing: string[] = []
  
  for (const var_name of required) {
    if (!process.env[var_name]) {
      missing.push(var_name)
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  return true
}

export function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`)
  }
  return value
}

// 环境变量类型定义
export interface EnvConfig {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  TUSHARE_TOKEN: string
  ALPHA_VANTAGE_API_KEY: string
  ALIPAY_APP_ID: string
  ALIPAY_PRIVATE_KEY: string
  ALIPAY_PUBLIC_KEY: string
}

export function getEnvConfig(): EnvConfig {
  validateEnv()
  
  return {
    SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    TUSHARE_TOKEN: getEnvVar('TUSHARE_TOKEN'),
    ALPHA_VANTAGE_API_KEY: getEnvVar('ALPHA_VANTAGE_API_KEY'),
    ALIPAY_APP_ID: getEnvVar('ALIPAY_APP_ID'),
    ALIPAY_PRIVATE_KEY: getEnvVar('ALIPAY_PRIVATE_KEY'),
    ALIPAY_PUBLIC_KEY: getEnvVar('ALIPAY_PUBLIC_KEY'),
  }
} 