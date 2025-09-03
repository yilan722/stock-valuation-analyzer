/**
 * Perplexity API 配置
 * 提供强大的网络搜索和内容生成能力
 */

export const PERPLEXITY_CONFIG = {
  API_BASE_URL: 'https://api.perplexity.ai',
  API_KEY: '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',
  
  MODELS: {
    SONAR_DEEP_RESEARCH: 'sonar-deep-research',  // 使用Perplexity Sonar Deep Research模型
    SONAR_PRO: 'sonar-pro',
    SONAR_MEDIUM: 'sonar-medium',
    SONAR_LARGE: 'sonar-large'
  },
  
  // 使用Perplexity的聊天完成端点
  ENDPOINTS: {
    CHAT: '/chat/completions',  // Perplexity格式
    MODELS: '/v1/models'         // 获取模型列表
  },
  
  // 标准OpenAI模型的参数
  CHAT_PARAMS: {
    max_tokens: 18000,
    temperature: 0.05,
    top_p: 0.9,
    presence_penalty: 0.15
  }
}

/**
 * 验证Perplexity配置
 */
export const validatePerplexityConfig = (): boolean => {
  const apiKey = PERPLEXITY_CONFIG.API_KEY
  if (!apiKey || apiKey === 'your_perplexity_api_key_here') {
    console.error('❌ Perplexity API密钥未配置')
    return false
  }
  
  if (!apiKey.startsWith('pplx-')) {
    console.error('❌ Perplexity API密钥格式不正确')
    return false
  }
  
  console.log('✅ Perplexity配置验证通过')
  return true
}

/**
 * 获取Perplexity API密钥
 */
export const getPerplexityApiKey = (): string => {
  const apiKey = PERPLEXITY_CONFIG.API_KEY
  if (!apiKey || apiKey === 'your_perplexity_api_key_here') {
    throw new Error('Perplexity API密钥未配置')
  }
  return apiKey
}

export default PERPLEXITY_CONFIG
