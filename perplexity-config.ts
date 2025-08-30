/**
 * Perplexity API 配置
 * 提供强大的网络搜索和内容生成能力
 */

export const PERPLEXITY_CONFIG = {
  // Perplexity API 配置
  API_KEY: process.env.PERPLEXITY_API_KEY || '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',
  BASE_URL: 'https://api.perplexity.ai/chat/completions',
  
  // 模型配置 - 根据最新官方文档更新
  MODELS: {
    // Sonar模型
    SONAR_DEEP_RESEARCH: 'sonar', // Sonar Deep Research - 最强大的研究模型
    SONAR_PRO: 'sonar-pro',
    SONAR_MEDIUM: 'sonar-medium',
    SONAR_LARGE: 'sonar-large',
    // 最新可用的模型
    LLAMA_3_1_8B: 'llama-3.1-8b-instruct',
    LLAMA_3_1_70B: 'llama-3.1-70b-instruct',
    LLAMA_3_1_8B_CHAT: 'llama-3.1-8b-chat',
    LLAMA_3_1_70B_CHAT: 'llama-3.1-70b-chat',
    LLAMA_3_1_8B_ONLINE: 'llama-3.1-8b-online',
    LLAMA_3_1_70B_ONLINE: 'llama-3.1-70b-online',
    // 备用模型
    MIXTRAL_8X7B: 'mixtral-8x7b-instruct',
    CODELLAMA_34B: 'codellama-34b-instruct',
    CODELLAMA_70B: 'codellama-70b-instruct'
  },
  
  // 默认参数
  DEFAULT_PARAMS: {
    model: 'llama-3.1-8b-instruct', // 使用8B模型
    max_tokens: 4000,
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    presence_penalty: 0.1,
    frequency_penalty: 0.1
  },
  
  // 搜索配置
  SEARCH_CONFIG: {
    search_queries: true, // 启用网络搜索
    include_images: false, // 不包含图片
    include_domains: [], // 允许的域名
    exclude_domains: [] // 排除的域名
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
