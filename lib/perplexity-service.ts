/**
 * Perplexity Sonar Pro API 服务
 */

import { getPerplexityApiKey, PERPLEXITY_CONFIG } from '../perplexity-config'

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PerplexityRequest {
  model: string
  messages: PerplexityMessage[]
  max_tokens?: number
  temperature?: number
  search_queries?: boolean
}

export interface PerplexityResponse {
  id: string
  choices: Array<{
    message: { content: string }
  }>
  usage?: { total_tokens: number }
}

export class PerplexityService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = getPerplexityApiKey()
    this.baseUrl = PERPLEXITY_CONFIG.BASE_URL
  }

  async generateStockReport(stockData: any, locale: string = 'en'): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(locale)
      const userPrompt = this.buildUserPrompt(stockData, locale)
      
      const messages: PerplexityMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
      
      const requestParams: PerplexityRequest = {
        model: PERPLEXITY_CONFIG.MODELS.SONAR_PRO,
        messages,
        max_tokens: 4000,
        temperature: 0.7,
        search_queries: true
      }
      
      const response = await this.callPerplexityAPI(requestParams)
      
      if (response?.choices?.[0]?.message?.content) {
        return response.choices[0].message.content
      } else {
        throw new Error('API响应格式错误')
      }
      
    } catch (error) {
      console.error('生成报告失败:', error)
      throw error
    }
  }

  private async callPerplexityAPI(requestParams: PerplexityRequest): Promise<PerplexityResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestParams)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  }

  private buildSystemPrompt(locale: string): string {
    const isChinese = locale === 'zh'
    
    if (isChinese) {
      return `你是专业股票分析师，必须搜索网络获取最新信息，包含最近30-90天的新闻和发展动态。分析最近价格变动及其催化剂。对于加密货币公司，研究ETH/BTC持仓并计算mNAV。所有数据点必须包含时间戳和来源。`
    } else {
      return `You are a professional stock analyst. You MUST search the web for the LATEST information, including recent news and developments from the last 30-90 days. Analyze recent price movements and their catalysts. For crypto companies, research ETH/BTC holdings and calculate mNAV. ALL data points MUST include timestamps and sources.`
    }
  }

  private buildUserPrompt(stockData: any, locale: string): string {
    const isChinese = locale === 'zh'
    
    const stockInfo = isChinese ? 
      `股票数据：价格$${stockData.price}，市值$${stockData.marketCap}，市盈率${stockData.peRatio}` :
      `STOCK DATA: Price $${stockData.price}, Market Cap $${stockData.marketCap}, P/E ${stockData.peRatio}`

    return `${stockInfo}

请为 ${stockData.name} (${stockData.symbol}) 生成全面、专业的股票估值报告，质量要达到专业投资研究报告水平。

请用${isChinese ? '中文' : 'English'}提供分析。`
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): string[] {
    return Object.values(PERPLEXITY_CONFIG.MODELS)
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 测试Perplexity API连接...')
      
      const testMessage: PerplexityMessage = {
        role: 'user',
        content: 'Hello, please respond with "API connection successful"'
      }
      
      const requestParams: PerplexityRequest = {
        model: 'pplx-70b-online',
        messages: [testMessage],
        max_tokens: 50,
        temperature: 0.1
      }
      
      const response = await this.callPerplexityAPI(requestParams)
      
      if (response && response.choices && response.choices[0]) {
        console.log('✅ Perplexity API连接测试成功')
        return true
      } else {
        console.log('❌ Perplexity API连接测试失败')
        return false
      }
      
    } catch (error) {
      console.error('❌ Perplexity API连接测试失败:', error)
      return false
    }
  }
}

export const createPerplexityService = (): PerplexityService => {
  return new PerplexityService()
}
