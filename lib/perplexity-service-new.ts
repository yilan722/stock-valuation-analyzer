/**
 * Perplexity API 服务
 */

import { getPerplexityApiKey, PERPLEXITY_CONFIG } from '../perplexity-config-new'

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
  search_recency_filter?: string
  return_citations?: boolean
  top_p?: number
  frequency_penalty?: number
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
      
      // 使用Deep Research配置
      const requestParams: PerplexityRequest = {
        model: 'sonar', // Sonar Deep Research模型
        messages,
        max_tokens: 12000, // 更高的token限制支持深度研究
        temperature: 0.2, // 更低的温度确保准确性
        search_queries: true,
        search_recency_filter: 'month', // 搜索最近一个月的信息
        return_citations: true, // 返回引用信息
        top_p: 0.9, // 控制输出的多样性
        frequency_penalty: 0.1 // 减少重复内容
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
      return `你是一位专业的股票分析师和研究员，具备深度研究能力。你必须进行广泛深入的网络搜索，综合专家级的分析洞察。

**关键要求：**
1. **最新信息收集**：搜索最近30-90天的新闻、财报、公告和市场发展
2. **深度数据分析**：提供详细的财务数据、比率分析和趋势对比
3. **表格化展示**：尽量使用表格展示关键数据，包括：
   - 财务指标对比表（多年/多季度）
   - 估值指标对比表（与同行对比）
   - 业务指标分析表
   - 风险评估表
4. **数据来源**：所有数据点必须包含时间戳和具体来源
5. **专业分析**：提供投资级别的深度分析和建议

**输出格式要求：**
严格按照以下格式输出，每个部分必须包含丰富的表格数据：

## 1. 基本面分析
[包含最新财务数据表格、关键指标对比表]

## 2. 业务细分分析  
[包含收入构成表格、业务指标表]

## 3. 增长催化剂
[包含增长因子表格、市场机会分析表]

## 4. 估值分析
[包含估值方法对比表、目标价分析表]

确保每个部分都包含具体的数据表格和专业分析。`
    } else {
      return `You are a professional stock analyst and researcher with deep research capabilities. You MUST conduct extensive web searches and synthesize expert-level insights.

**Key Requirements:**
1. **Latest Information**: Search for recent 30-90 day news, earnings, announcements, and market developments
2. **Deep Data Analysis**: Provide detailed financial data, ratio analysis, and trend comparisons
3. **Table Presentation**: Use tables extensively for key data including:
   - Financial metrics comparison tables (multi-year/quarter)
   - Valuation metrics vs peers tables
   - Business metrics analysis tables
   - Risk assessment tables
4. **Data Sources**: All data points MUST include timestamps and specific sources
5. **Professional Analysis**: Provide investment-grade deep analysis and recommendations

**Output Format Requirements:**
Strictly follow this format with rich table data in each section:

## 1. Fundamental Analysis
[Include latest financial data tables, key metrics comparison tables]

## 2. Business Segments Analysis
[Include revenue breakdown tables, business metrics tables]

## 3. Growth Catalysts
[Include growth factor tables, market opportunity analysis tables]

## 4. Valuation Analysis
[Include valuation method comparison tables, target price analysis tables]

Ensure each section contains specific data tables and professional analysis.`
    }
  }

  private buildUserPrompt(stockData: any, locale: string): string {
    const isChinese = locale === 'zh'
    
    const stockInfo = isChinese ? 
      `当前股票数据：价格$${stockData.price}，市值$${stockData.marketCap}，市盈率${stockData.peRatio}，成交量${stockData.amount || 'N/A'}` :
      `Current Stock Data: Price $${stockData.price}, Market Cap $${stockData.marketCap}, P/E ${stockData.peRatio}, Volume ${stockData.amount || 'N/A'}`

    if (isChinese) {
      return `${stockInfo}

请为 ${stockData.name} (${stockData.symbol}) 进行深度研究，生成全面、专业的股票估值报告。

**要求：**
1. **深度搜索**：搜索最新的财报、新闻、分析师报告和市场数据
2. **表格展示**：大量使用表格展示数据，包括：
   - 最近3-5年/季度的关键财务指标对比表
   - 与同行业公司的估值指标对比表  
   - 收入和利润构成分析表
   - 风险因素评估表
   - 目标价和建议汇总表
3. **数据完整性**：确保所有数据都有明确的时间戳和来源
4. **专业分析**：提供投资银行级别的深度分析

严格按照以下格式输出：

## 1. 基本面分析
[包含最新财务数据表格、关键指标历史对比表、同行对比表]

## 2. 业务细分分析
[包含详细的收入构成表、各业务线指标表、市场份额表]

## 3. 增长催化剂  
[包含增长因子量化表、市场机会评估表、风险评估表]

## 4. 估值分析
[包含多种估值方法对比表、目标价区间表、投资建议表]

请用中文生成报告，确保内容详尽、数据丰富、表格完整。`
    } else {
      return `${stockInfo}

Please conduct deep research and generate a comprehensive, professional stock valuation report for ${stockData.name} (${stockData.symbol}).

**Requirements:**
1. **Deep Search**: Search for latest earnings, news, analyst reports, and market data
2. **Table Presentation**: Extensively use tables for data display, including:
   - 3-5 year/quarter key financial metrics comparison tables
   - Valuation metrics comparison with industry peers tables
   - Revenue and profit breakdown analysis tables
   - Risk factor assessment tables
   - Target price and recommendation summary tables
3. **Data Integrity**: Ensure all data has clear timestamps and sources
4. **Professional Analysis**: Provide investment banking level deep analysis

Strictly follow this format:

## 1. Fundamental Analysis
[Include latest financial data tables, key metrics historical comparison tables, peer comparison tables]

## 2. Business Segments Analysis
[Include detailed revenue breakdown tables, business line metrics tables, market share tables]

## 3. Growth Catalysts
[Include growth factor quantification tables, market opportunity assessment tables, risk assessment tables]

## 4. Valuation Analysis
[Include multiple valuation methods comparison tables, target price range tables, investment recommendation tables]

Please generate the report in English with comprehensive content, rich data, and complete tables.`
    }
  }
}

export const createPerplexityService = (): PerplexityService => {
  return new PerplexityService()
}
