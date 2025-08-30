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

// 功能开关配置
export interface FeatureFlags {
  ENABLE_PERSONAL_RESEARCH: boolean
  ENABLE_MULTI_COMPANY_ANALYSIS: boolean
}

export function getFeatureFlags(): FeatureFlags {
  return {
    ENABLE_PERSONAL_RESEARCH: process.env.NEXT_PUBLIC_ENABLE_PERSONAL_RESEARCH === 'true',
    ENABLE_MULTI_COMPANY_ANALYSIS: process.env.NEXT_PUBLIC_ENABLE_MULTI_COMPANY_ANALYSIS === 'true',
  }
}

export const AI_MODELS = {
  REPORT_GENERATION_MODEL: process.env.REPORT_GENERATION_MODEL || 'claude-opus-4-1-20250805',
  PERSONAL_RESEARCH_MODEL: process.env.PERSONAL_RESEARCH_MODEL || 'gemini-2.5-pro',
  MULTI_COMPANY_ANALYSIS_MODEL: process.env.MULTI_COMPANY_ANALYSIS_MODEL || 'gemini-2.5-pro',
  CHAT_ANALYSIS_MODEL: process.env.CHAT_ANALYSIS_MODEL || 'gemini-2.5-pro',
  AI_DISCUSSION_MODEL: process.env.AI_DISCUSSION_MODEL || 'gemini-2.5-pro',
  AI_SUMMARY_MODEL: process.env.AI_SUMMARY_MODEL || 'gemini-2.5-pro'
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
    ALIPAY_PRIVATE_KEY: getEnvVar('ALIPAY_APP_ID'),
    ALIPAY_PUBLIC_KEY: getEnvVar('ALIPAY_PUBLIC_KEY'),
  }
} 