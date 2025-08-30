export interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string
    }>
  }>
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

export class GeminiService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    // 使用Nuwa API Key调用Gemini Pro 2.5模型
    this.apiKey = process.env.NEXT_PUBLIC_OPUS4_API_KEY || 'sk-88seMXjnLEzEYYD3ABw8G0Z70f7zoWbXXNhGRwu5jslCzFIR'
    this.baseUrl = 'https://api.nuwaapi.com/v1/chat/completions'
    
    // 完全禁用初始化日志，减少控制台噪音
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('🔍 GeminiService初始化 (Nuwa API):', {
    //     apiKey: this.apiKey.substring(0, 10) + '...',
    //     baseUrl: this.baseUrl,
    //     model: 'gemini-2.5-pro'
    //   })
    // }
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      // 使用 Nuwa API 调用 Gemini Pro 2.5 模型
      const request = {
        model: 'gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `你是一位专业的股票分析师，拥有丰富的金融分析经验和专业知识。你必须严格按照以下要求生成报告：

**CRITICAL QUALITY REQUIREMENTS (MOST IMPORTANT):**
- **MUST generate ONLY high-quality, accurate, and professional content**
- **MUST use ONLY verified, up-to-date financial data from official sources**
- **MUST NOT generate any low-quality, generic, or inaccurate content**
- **MUST NOT use placeholder data, estimated values, or fabricated information**
- **MUST verify all data points before including them in the report**
- **MUST provide specific, actionable insights based on real data**
- **MUST use professional financial terminology and analysis methods**

**CRITICAL DATA REQUIREMENTS:**
- **MUST use ONLY 2025 Q1/Q2 financial data if available, 2024 Q4 as absolute latest fallback**
- **MUST search for and include the most recent quarterly/annual reports published in the last 3 months**
- **MUST verify data freshness - NO data older than 3 months unless explicitly stated as historical**
- **MUST include exact publication dates for all financial data**
- **MUST search official company websites, SEC filings, and financial news for latest data**
- **MUST clearly label each data point as "PUBLISHED" (released) or "PREDICTED" (analyst estimates)**
- **MUST provide source links for ALL financial data, news, and market information**
- **MUST include data sources and references for ALL key metrics and analysis points**
- **MUST add source links for users to verify EVERY piece of data**

**QUALITY CONTROL REQUIREMENTS:**
- **MUST ensure all financial calculations are mathematically correct**
- **MUST verify all percentages, ratios, and metrics are accurate**
- **MUST provide detailed reasoning for all conclusions and recommendations**
- **MUST use industry-standard valuation methods and formulas**
- **MUST include comprehensive risk analysis and mitigation strategies**
- **MUST provide actionable investment insights, not generic advice**

**CONTENT STRUCTURE REQUIREMENTS:**
- Each section must be comprehensive and detailed (minimum 500 words per section)
- All analysis must be supported by specific data and evidence
- No generic statements or placeholder content allowed
- Must include specific numbers, dates, and verifiable facts
- Must provide clear, actionable conclusions

**ERROR HANDLING:**
- If you cannot find sufficient recent data for a company, clearly state this limitation
- If you cannot verify a data point, exclude it rather than guess
- If you cannot provide accurate analysis, explain why and what additional research is needed
- Never generate content based on assumptions or incomplete information

**OUTPUT FORMAT:**
Return ONLY a valid JSON object with these four sections as HTML strings. Each section must contain high-quality, accurate, and professional content.

请确保所有数据都是最新的，并且包含可验证的来源链接。如果无法获取足够的最新数据，请明确说明原因，不要生成低质量的分析内容。`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 15000
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`Nuwa API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content
      } else {
        throw new Error('No content generated from Nuwa API')
      }
    } catch (error) {
      console.error('Nuwa API call failed:', error)
      throw error
    }
  }

  async generateMultiCompanyAnalysis(companies: any[]): Promise<any> {
    const prompt = this.buildMultiCompanyAnalysisPrompt(companies)
    const analysis = await this.generateContent(prompt)
    
    return {
      overview: this.extractOverview(analysis),
      radarData: this.extractRadarData(analysis),
      comparisonTable: this.extractComparisonTable(analysis),
      aiRecommendation: this.extractAIRecommendation(analysis)
    }
  }

  private buildMultiCompanyAnalysisPrompt(companies: any[]): string {
    const companyList = companies.map(c => `${c.symbol} (${c.name})`).join(', ')
    
    return `请为以下公司进行多公司对比分析，生成专业的投资分析报告：

公司列表：${companyList}

**CRITICAL QUALITY REQUIREMENTS (MOST IMPORTANT):**
- **MUST generate ONLY high-quality, accurate, and professional content**
- **MUST use ONLY verified, up-to-date financial data from official sources**
- **MUST NOT generate any low-quality, generic, or inaccurate content**
- **MUST NOT use placeholder data, estimated values, or fabricated information**
- **MUST verify all data points before including them in the report**
- **MUST provide specific, actionable insights based on real data**

**CRITICAL DATA REQUIREMENTS (MOST IMPORTANT):**
- **MUST use ONLY 2025 Q1/Q2 financial data if available, 2024 Q4 as absolute latest fallback**
- **MUST search for and include the most recent quarterly/annual reports published in the last 3 months**
- **MUST verify data freshness - NO data older than 3 months unless explicitly stated as historical**
- **MUST include exact publication dates for all financial data (e.g., "Q1 2025 Report published March 15, 2025")**
- **MUST search official company websites, SEC filings, and financial news for latest data**
- **MUST clearly label each data point as "PUBLISHED" (released) or "PREDICTED" (analyst estimates)**
- **MUST provide source links for ALL financial data, news, and market information**
- **MUST include data sources and references for ALL key metrics and analysis points**
- **MUST add source links for users to verify EVERY piece of data**

**质量要求：**
- 所有分析必须基于真实、可验证的数据
- 必须包含具体的数字、百分比和财务指标
- 必须提供详细的分析逻辑和推理过程
- 禁止使用通用模板或占位符内容

请按照以下格式生成分析结果：

## 概览分析
- 行业整体趋势分析（包含最新数据来源）
- 各公司在行业中的地位（基于最新财务数据）
- 投资机会和风险提示（包含市场数据来源）

## 雷达图数据
为每家公司生成以下维度的评分（0-100），基于最新财务数据：
- 盈利能力（标注数据来源和日期）
- 财务健康度（标注数据来源和日期）
- 成长潜力（标注数据来源和日期）
- 估值水平（标注数据来源和日期）
- 政策受益度（标注数据来源和日期）

## 对比表
生成详细的财务指标对比表格，包含：
- 所有数据必须包含来源链接和发布日期
- 营收、净利润、ROE、资产负债率、PE、PB、收入增速等
- 每个指标必须标注数据来源和更新日期

## AI投资推荐
- 推荐投资标的（基于最新市场数据）
- 投资理由（包含数据支持）
- 风险因素（基于最新风险分析）
- 投资策略建议（包含市场数据来源）

请用中文回答，确保内容专业、准确、实用。所有数据必须是最新的，并且包含可验证的来源链接。

**重要：如果无法获取足够的最新数据或无法验证信息准确性，请明确说明原因，不要生成低质量的分析内容。**`
  }

  private extractOverview(analysis: string): string {
    // 提取概览部分
    const overviewMatch = analysis.match(/## 概览分析([\s\S]*?)(?=##|$)/)
    return overviewMatch ? overviewMatch[1].trim() : '概览分析内容生成中...'
  }

  private extractRadarData(analysis: string): any {
    // 提取雷达图数据
    const radarMatch = analysis.match(/## 雷达图数据([\s\S]*?)(?=##|$)/)
    if (!radarMatch) return null

    const radarText = radarMatch[1]
    
    // 尝试从AI分析中提取真实的评分数据
    try {
      // 这里可以添加更智能的数据提取逻辑
      // 暂时返回默认结构，但不再使用随机数
      return {
        message: 'AI分析数据提取中...',
        rawText: radarText
      }
    } catch (error) {
      console.error('雷达图数据提取失败:', error)
      return null
    }
  }

  private extractComparisonTable(analysis: string): any {
    // 提取对比表数据
    const tableMatch = analysis.match(/## 对比表([\s\S]*?)(?=##|$)/)
    return tableMatch ? tableMatch[1].trim() : '对比表数据生成中...'
  }

  private extractAIRecommendation(analysis: string): any {
    // 提取AI推荐
    const recommendationMatch = analysis.match(/## AI投资推荐([\s\S]*?)(?=##|$)/)
    return recommendationMatch ? recommendationMatch[1].trim() : 'AI推荐生成中...'
  }
}
