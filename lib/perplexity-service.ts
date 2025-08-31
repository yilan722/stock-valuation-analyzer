/**
 * Perplexity Sonar Pro API 服务
 */

import { PERPLEXITY_CONFIG } from '../perplexity-config'

export interface PerplexityRequestBody {
  model: string
  messages?: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  input?: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  presence_penalty?: number
}

export interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage?: {
    total_tokens: number
  }
}

export class PerplexityService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = PERPLEXITY_CONFIG.API_KEY
    this.baseUrl = PERPLEXITY_CONFIG.API_BASE_URL
  }

  async generateReport(
    systemPrompt: string,
    userPrompt: string,
    model: string = PERPLEXITY_CONFIG.MODELS.SONAR_DEEP_RESEARCH
  ): Promise<PerplexityResponse> {
    // 根据模型类型选择端点和格式
    const isResponsesModel = model === 'o3-deep-research'
    
    let requestBody: PerplexityRequestBody
    let endpoint: string
    
    if (isResponsesModel) {
      // o3-deep-research模型使用v1/responses端点
      requestBody = {
        model,
        input: `${systemPrompt}\n\n${userPrompt}`, // 合并到input字段
        ...PERPLEXITY_CONFIG.RESPONSES_PARAMS
      }
      endpoint = `${this.baseUrl}${PERPLEXITY_CONFIG.ENDPOINTS.RESPONSES}`
    } else {
      // 其他模型使用标准OpenAI格式
      requestBody = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        ...PERPLEXITY_CONFIG.CHAT_PARAMS
      }
      endpoint = `${this.baseUrl}${PERPLEXITY_CONFIG.ENDPOINTS.CHAT}`
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }
}
