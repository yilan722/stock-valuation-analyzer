/**
 * Perplexity Sonar Pro API 服务
 */

import { PERPLEXITY_CONFIG } from '../perplexity-config'

export interface PerplexityRequestBody {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
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
    const requestBody: PerplexityRequestBody = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      ...PERPLEXITY_CONFIG.CHAT_PARAMS
    }

    // 使用标准的OpenAI聊天完成端点
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
