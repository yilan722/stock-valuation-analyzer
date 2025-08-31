/**
 * Perplexity Sonar Pro API 服务
 */

import { PERPLEXITY_CONFIG } from '../perplexity-config'

export interface PerplexityRequestBody {
  model: string
  input: string  // 使用input字段而不是messages
  max_tokens?: number
  temperature?: number
  search_queries?: boolean
  search_recency_filter?: string
  return_citations?: boolean
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
    const requestBody: PerplexityRequestBody = {
      model,
      input: `${systemPrompt}\n\n${userPrompt}`, // 合并system和user prompt到input字段
      ...PERPLEXITY_CONFIG.DEFAULT_PARAMS
    }

    // o4-mini-deep-research模型使用v1/responses端点
    const endpoint = `${this.baseUrl}${PERPLEXITY_CONFIG.ENDPOINTS.CHAT}`

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
