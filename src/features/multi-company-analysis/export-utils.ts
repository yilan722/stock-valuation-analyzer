import { MultiCompanyAnalysis } from '../../../types'

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'json'
  includeCharts: boolean
  includeRecommendations: boolean
  watermark?: string
}

export interface TemplateData {
  id: string
  name: string
  companies: string[]
  createdAt: Date
  lastUsed?: Date
  usageCount: number
}

export class ExportUtils {
  /**
   * 导出分析结果为PDF
   */
  static async exportToPDF(analysis: MultiCompanyAnalysis, options: ExportOptions): Promise<Blob> {
    // 这里应该使用实际的PDF生成库，如jsPDF或react-pdf
    // 目前返回模拟的Blob
    const content = this.generatePDFContent(analysis, options)
    
    // 模拟PDF生成
    return new Blob([content], { type: 'application/pdf' })
  }

  /**
   * 导出分析结果为Excel
   */
  static async exportToExcel(analysis: MultiCompanyAnalysis, options: ExportOptions): Promise<Blob> {
    // 这里应该使用实际的Excel生成库，如xlsx
    const content = this.generateExcelContent(analysis, options)
    
    return new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  }

  /**
   * 导出分析结果为JSON
   */
  static exportToJSON(analysis: MultiCompanyAnalysis, options: ExportOptions): Blob {
    const content = JSON.stringify(analysis, null, 2)
    return new Blob([content], { type: 'application/json' })
  }

  /**
   * 保存分析模板
   */
  static saveTemplate(analysis: MultiCompanyAnalysis, templateName: string): TemplateData {
    const template: TemplateData = {
      id: `template_${Date.now()}`,
      name: templateName,
      companies: analysis.companies.map(c => c.symbol),
      createdAt: new Date(),
      usageCount: 1
    }

    // 保存到本地存储
    this.saveTemplateToStorage(template)
    
    return template
  }

  /**
   * 加载保存的模板
   */
  static loadTemplates(): TemplateData[] {
    try {
      const templates = localStorage.getItem('multiCompanyTemplates')
      return templates ? JSON.parse(templates) : []
    } catch (error) {
      console.error('Failed to load templates:', error)
      return []
    }
  }

  /**
   * 删除模板
   */
  static deleteTemplate(templateId: string): boolean {
    try {
      const templates = this.loadTemplates()
      const filteredTemplates = templates.filter(t => t.id !== templateId)
      localStorage.setItem('multiCompanyTemplates', JSON.stringify(filteredTemplates))
      return true
    } catch (error) {
      console.error('Failed to delete template:', error)
      return false
    }
  }

  /**
   * 生成分享链接
   */
  static generateShareLink(analysis: MultiCompanyAnalysis): string {
    const shareData = {
      id: analysis.id,
      companies: analysis.companies.map(c => c.symbol),
      createdAt: analysis.createdAt.toISOString(),
      templateName: analysis.templateName
    }

    const encodedData = btoa(JSON.stringify(shareData))
    return `${window.location.origin}/share/${encodedData}`
  }

  /**
   * 解析分享链接
   */
  static parseShareLink(shareUrl: string): any {
    try {
      const encodedData = shareUrl.split('/share/')[1]
      if (!encodedData) return null
      
      const decodedData = atob(encodedData)
      return JSON.parse(decodedData)
    } catch (error) {
      console.error('Failed to parse share link:', error)
      return null
    }
  }

  /**
   * 生成PDF内容
   */
  private static generatePDFContent(analysis: MultiCompanyAnalysis, options: ExportOptions): string {
    let content = `
      <html>
        <head>
          <title>多公司对比分析报告</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .company-table { width: 100%; border-collapse: collapse; }
            .company-table th, .company-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .company-table th { background-color: #f2f2f2; }
            .recommendation { background-color: #e8f4fd; padding: 15px; border-radius: 5px; }
            .risk-factors { background-color: #fff3cd; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>多公司对比分析报告</h1>
            <p>生成时间: ${analysis.createdAt.toLocaleString('zh-CN')}</p>
            ${options.watermark ? `<p>${options.watermark}</p>` : ''}
          </div>

          <div class="section">
            <h2>分析公司列表</h2>
            <table class="company-table">
              <thead>
                <tr>
                  <th>公司代码</th>
                  <th>公司名称</th>
                  <th>目标价</th>
                  <th>上涨空间</th>
                  <th>PE比率</th>
                  <th>ROE</th>
                </tr>
              </thead>
              <tbody>
                ${analysis.companies.map(company => `
                  <tr>
                    <td>${company.symbol}</td>
                    <td>${company.name}</td>
                    <td>$${company.keyMetrics.targetPrice.toFixed(2)}</td>
                    <td>${company.keyMetrics.upsidePotential.toFixed(1)}%</td>
                    <td>${company.keyMetrics.peRatio.toFixed(2)}</td>
                    <td>${company.keyMetrics.roe.toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          ${options.includeRecommendations ? `
            <div class="section">
              <h2>AI推荐</h2>
              <div class="recommendation">
                <h3>首选标的: ${analysis.aiRecommendation.topPick}</h3>
                <p><strong>推荐理由:</strong> ${analysis.aiRecommendation.reasoning}</p>
              </div>
            </div>
          ` : ''}

          <div class="section">
            <h2>风险提示</h2>
            <div class="risk-factors">
              <ul>
                ${analysis.aiRecommendation.riskFactors.map(risk => `<li>${risk}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="section">
            <p><em>本报告由AI系统生成，仅供参考，不构成投资建议。投资有风险，入市需谨慎。</em></p>
          </div>
        </body>
      </html>
    `

    return content
  }

  /**
   * 生成Excel内容
   */
  private static generateExcelContent(analysis: MultiCompanyAnalysis, options: ExportOptions): string {
    // 这里应该生成实际的Excel文件内容
    // 目前返回CSV格式作为示例
    const headers = ['公司代码', '公司名称', '目标价', '上涨空间', 'PE比率', 'PB比率', 'ROE', '债务权益比']
    const rows = analysis.companies.map(company => [
      company.symbol,
      company.name,
      company.keyMetrics.targetPrice.toFixed(2),
      `${company.keyMetrics.upsidePotential.toFixed(1)}%`,
      company.keyMetrics.peRatio.toFixed(2),
      company.keyMetrics.pbRatio.toFixed(2),
      `${company.keyMetrics.roe.toFixed(1)}%`,
      company.keyMetrics.debtToEquity.toFixed(2)
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    return csvContent
  }

  /**
   * 保存模板到本地存储
   */
  private static saveTemplateToStorage(template: TemplateData): void {
    try {
      const templates = this.loadTemplates()
      const existingIndex = templates.findIndex(t => t.id === template.id)
      
      if (existingIndex >= 0) {
        templates[existingIndex] = { ...template, usageCount: template.usageCount + 1, lastUsed: new Date() }
      } else {
        templates.push(template)
      }
      
      localStorage.setItem('multiCompanyTemplates', JSON.stringify(templates))
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }

  /**
   * 获取文件下载链接
   */
  static getDownloadLink(blob: Blob, filename: string): string {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return url
  }

  /**
   * 复制到剪贴板
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }
}




