/**
 * Perplexity API 配置
 */

export const PERPLEXITY_CONFIG = {
  API_KEY: process.env.PERPLEXITY_API_KEY || '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',
  BASE_URL: 'https://api.perplexity.ai/chat/completions',
  
  MODELS: {
    SONAR_DEEP_RESEARCH: 'sonar', // Sonar Deep Research - 最强大的研究模型
    SONAR_PRO: 'sonar-pro',
    SONAR_MEDIUM: 'sonar-medium',
    SONAR_LARGE: 'sonar-large',
    LLAMA_3_1_8B: 'llama-3.1-8b-instruct',
    LLAMA_3_1_70B: 'llama-3.1-70b-instruct'
  },
  
  DEFAULT_PARAMS: {
    model: 'sonar', // 使用Sonar Deep Research模型
    max_tokens: 8000, // 增加token限制以支持更详细的研究
    temperature: 0.3, // 降低温度以获得更准确的研究结果
    search_queries: true,
    search_recency_filter: 'month', // 搜索最近一个月的信息
    return_citations: true // 返回引用信息
  },
  
  // Deep Research 专用配置
  DEEP_RESEARCH_PARAMS: {
    model: 'sonar',
    max_tokens: 12000, // 更高的token限制支持深度研究
    temperature: 0.2, // 更低的温度确保准确性
    search_queries: true,
    search_recency_filter: 'month',
    return_citations: true,
    top_p: 0.9, // 控制输出的多样性
    frequency_penalty: 0.1 // 减少重复内容
  }
}

export const getPerplexityApiKey = (): string => {
  const apiKey = PERPLEXITY_CONFIG.API_KEY
  if (!apiKey || apiKey === 'your_perplexity_api_key_here') {
    throw new Error('Perplexity API密钥未配置')
  }
  return apiKey
}
