import { UserInput, VersionedReport, ValuationReportData } from '../../../types'
import { getFeatureFlags } from '../../../lib/env'

export interface ReportGenerationRequest {
  stockSymbol: string
  originalReport: ValuationReportData
  userInsights: string
  userId: string
}

export interface ReportGenerationResponse {
  success: boolean
  versionedReport?: VersionedReport
  error?: string
}

export class ReportGenerationAgent {
  private featureFlags = getFeatureFlags()

  constructor() {
    if (!this.featureFlags.ENABLE_PERSONAL_RESEARCH) {
      throw new Error('Personal research feature is not enabled')
    }
  }

  /**
   * 生成个性化更新报告
   */
  async generatePersonalizedReport(
    request: ReportGenerationRequest
  ): Promise<ReportGenerationResponse> {
    try {
      // 1. 验证输入
      this.validateRequest(request)

      // 2. 构建增强的提示词
      const enhancedPrompt = this.buildEnhancedPrompt(request)

      // 3. 调用AI模型生成报告
      const aiResponse = await this.callAIModel(enhancedPrompt)

      // 4. 解析AI响应并提取变化
      const changes = this.extractChanges(request.originalReport, aiResponse)

      // 5. 创建版本化报告
      const versionedReport: VersionedReport = {
        id: this.generateId(),
        originalReportId: this.generateId(), // 这里应该使用原始报告的ID
        userInputId: this.generateId(), // 这里应该使用用户输入的ID
        version: this.generateVersion(),
        reportData: aiResponse,
        changes,
        createdAt: new Date()
      }

      return {
        success: true,
        versionedReport
      }
    } catch (error) {
      console.error('Report generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * 验证请求参数
   */
  private validateRequest(request: ReportGenerationRequest): void {
    if (!request.stockSymbol?.trim()) {
      throw new Error('Stock symbol is required')
    }
    if (!request.userInsights?.trim()) {
      throw new Error('User insights are required')
    }
    if (!request.userId?.trim()) {
      throw new Error('User ID is required')
    }
    if (!request.originalReport) {
      throw new Error('Original report is required')
    }
  }

  /**
   * 构建增强的提示词
   */
  private buildEnhancedPrompt(request: ReportGenerationRequest): string {
    const { stockSymbol, originalReport, userInsights } = request

    return `
你是一位专业的股票分析师，需要根据用户提供的新信息重新分析 ${stockSymbol} 股票。

原始报告信息：
${JSON.stringify(originalReport, null, 2)}

用户新增见解：
${userInsights}

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

请基于用户提供的新信息，重新生成一份完整的股票分析报告。要求：

1. 分析用户信息对基本面的影响（包含最新数据来源）
2. 重新计算估值指标（DCF、PE、PB等），基于最新财务数据
3. 更新投资建议（包含市场数据支持）
4. 明确指出哪些变化是由用户提供的信息引起的
5. 所有数据必须包含来源链接和发布日期
6. 确保使用最新的财务和市场数据

请以JSON格式返回，包含以下字段：
- fundamentalAnalysis: 基本面分析（包含数据来源）
- businessSegments: 业务分析（包含数据来源）
- growthCatalysts: 增长催化剂（包含数据来源）
- valuationAnalysis: 估值分析（包含数据来源）
- changes: 变化说明（包含数据支持）
- valuationImpact: 估值影响（包含计算依据）

所有数据必须是最新的，并且包含可验证的来源链接。`
  }

  /**
   * 调用AI模型
   */
  private async callAIModel(prompt: string): Promise<ValuationReportData> {
    // 这里应该调用实际的AI模型API
    // 目前返回模拟数据
    return {
      fundamentalAnalysis: '基于用户提供的新信息，公司基本面发生了显著变化...',
      businessSegments: '业务结构分析已更新...',
      growthCatalysts: '增长催化剂重新评估...',
      valuationAnalysis: '估值模型已根据新信息调整...'
    }
  }

  /**
   * 提取变化信息
   */
  private extractChanges(
    originalReport: ValuationReportData,
    newReport: ValuationReportData
  ): VersionedReport['changes'] {
    // 这里应该实现更智能的变化检测算法
    return {
      fundamentalChanges: [
        '根据用户提供的信息，公司基本面发生了显著变化',
        '财务指标已重新评估',
        '业务前景分析已更新'
      ],
      valuationImpact: {
        dcfChange: 15.5, // 示例数据
        peChange: 2.3,
        pbChange: 0.8,
        targetPriceChange: 25.0,
        reasoning: '基于用户提供的新信息，公司估值模型已调整，目标价相应上调'
      }
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成版本号
   */
  private generateVersion(): string {
    const timestamp = new Date().toISOString().split('T')[0]
    return `v${timestamp}_${Date.now().toString().slice(-6)}`
  }

  /**
   * 保存用户输入
   */
  async saveUserInput(userInput: Omit<UserInput, 'id' | 'createdAt'>): Promise<UserInput> {
    // 这里应该实现数据库保存逻辑
    return {
      ...userInput,
      id: this.generateId(),
      createdAt: new Date(),
      status: 'pending'
    }
  }

  /**
   * 保存版本化报告
   */
  async saveVersionedReport(report: VersionedReport): Promise<void> {
    // 这里应该实现数据库保存逻辑
    console.log('Saving versioned report:', report)
  }
}
