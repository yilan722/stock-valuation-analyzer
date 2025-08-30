// 报告生成成本计算器
// 基于当前Perplexity API配置计算实际成本

class ReportCostCalculator {
  constructor() {
    // Perplexity API定价 (基于搜索结果估算)
    this.pricing = {
      requestCost: 0.005,           // $0.005 per request
      tokenCostPerMillion: 2.0,     // $2.0 per million tokens (sonar-deep-research估算)
    }
    
    // 典型报告Token使用量 (基于我们的配置)
    this.tokenUsage = {
      systemPrompt: 800,           // System prompt tokens
      userPrompt: 200,             // User prompt tokens  
      stockData: 100,              // Stock data tokens
      searchProcessing: 500,       // Search query processing
      citations: 1000,             // Citations and references
      
      // 输出部分 (JSON格式，4个部分)
      fundamentalAnalysis: 3000,
      businessSegments: 3000,
      growthCatalysts: 3000,
      valuationAnalysis: 3000,
      jsonStructure: 1000,         // JSON structure + HTML markup
    }
  }
  
  // 计算总输入Token数
  getTotalInputTokens() {
    return this.tokenUsage.systemPrompt + 
           this.tokenUsage.userPrompt + 
           this.tokenUsage.stockData +
           this.tokenUsage.searchProcessing
  }
  
  // 计算总输出Token数
  getTotalOutputTokens() {
    return this.tokenUsage.fundamentalAnalysis +
           this.tokenUsage.businessSegments +
           this.tokenUsage.growthCatalysts +
           this.tokenUsage.valuationAnalysis +
           this.tokenUsage.jsonStructure +
           this.tokenUsage.citations
  }
  
  // 计算总Token数
  getTotalTokens() {
    return this.getTotalInputTokens() + this.getTotalOutputTokens()
  }
  
  // 计算Token成本
  getTokenCost() {
    const totalTokens = this.getTotalTokens()
    return (totalTokens / 1000000) * this.pricing.tokenCostPerMillion
  }
  
  // 计算请求成本
  getRequestCost() {
    return this.pricing.requestCost
  }
  
  // 计算总成本
  getTotalCost() {
    return this.getRequestCost() + this.getTokenCost()
  }
  
  // 生成详细的成本报告
  generateCostReport() {
    const inputTokens = this.getTotalInputTokens()
    const outputTokens = this.getTotalOutputTokens()
    const totalTokens = this.getTotalTokens()
    const tokenCost = this.getTokenCost()
    const requestCost = this.getRequestCost()
    const totalCost = this.getTotalCost()
    
    return {
      tokenBreakdown: {
        input: {
          systemPrompt: this.tokenUsage.systemPrompt,
          userPrompt: this.tokenUsage.userPrompt,
          stockData: this.tokenUsage.stockData,
          searchProcessing: this.tokenUsage.searchProcessing,
          total: inputTokens
        },
        output: {
          fundamentalAnalysis: this.tokenUsage.fundamentalAnalysis,
          businessSegments: this.tokenUsage.businessSegments,
          growthCatalysts: this.tokenUsage.growthCatalysts,
          valuationAnalysis: this.tokenUsage.valuationAnalysis,
          jsonStructure: this.tokenUsage.jsonStructure,
          citations: this.tokenUsage.citations,
          total: outputTokens
        },
        total: totalTokens
      },
      costBreakdown: {
        requestCost: requestCost,
        tokenCost: tokenCost,
        total: totalCost
      },
      costInCurrency: {
        usd: totalCost,
        cny: totalCost * 7.2, // 假设汇率1 USD = 7.2 CNY
        cents: totalCost * 100
      },
      efficiency: {
        costPerToken: totalCost / totalTokens,
        costPerOutputToken: totalCost / outputTokens,
        tokensPerDollar: totalTokens / totalCost
      }
    }
  }
  
  // 计算规模化成本
  calculateScaleCosts(reportCounts) {
    const singleReportCost = this.getTotalCost()
    
    return reportCounts.map(count => ({
      reportCount: count,
      totalCost: singleReportCost * count,
      costPerReport: singleReportCost,
      monthlyCost: singleReportCost * count * 30, // 假设每天生成这么多报告
      breakdown: {
        requestCosts: this.getRequestCost() * count,
        tokenCosts: this.getTokenCost() * count
      }
    }))
  }
  
  // 建议的用户定价
  suggestUserPricing() {
    const apiCost = this.getTotalCost()
    
    return {
      apiCost: apiCost,
      suggestedPricing: {
        basic: {
          price: 0.99,
          markup: Math.round((0.99 / apiCost) * 100) / 100,
          profit: 0.99 - apiCost,
          profitMargin: Math.round(((0.99 - apiCost) / 0.99) * 100)
        },
        professional: {
          price: 2.99,
          markup: Math.round((2.99 / apiCost) * 100) / 100,
          profit: 2.99 - apiCost,
          profitMargin: Math.round(((2.99 - apiCost) / 2.99) * 100)
        },
        enterprise: {
          price: 9.99,
          markup: Math.round((9.99 / apiCost) * 100) / 100,
          profit: 9.99 - apiCost,
          profitMargin: Math.round(((9.99 - apiCost) / 9.99) * 100)
        }
      }
    }
  }
}

// 使用示例和测试
function runCostAnalysis() {
  console.log('📊 报告生成成本分析')
  console.log('=' * 50)
  
  const calculator = new ReportCostCalculator()
  const report = calculator.generateCostReport()
  
  console.log('\n🔢 Token使用量分析:')
  console.log(`输入Token: ${report.tokenBreakdown.input.total.toLocaleString()}`)
  console.log(`输出Token: ${report.tokenBreakdown.output.total.toLocaleString()}`)
  console.log(`总Token: ${report.tokenBreakdown.total.toLocaleString()}`)
  
  console.log('\n💰 成本分析:')
  console.log(`请求成本: $${report.costBreakdown.requestCost.toFixed(4)}`)
  console.log(`Token成本: $${report.costBreakdown.tokenCost.toFixed(4)}`)
  console.log(`总成本: $${report.costBreakdown.total.toFixed(4)}`)
  console.log(`人民币成本: ¥${report.costInCurrency.cny.toFixed(3)}`)
  
  console.log('\n📈 效率指标:')
  console.log(`每Token成本: $${report.efficiency.costPerToken.toFixed(6)}`)
  console.log(`每输出Token成本: $${report.efficiency.costPerOutputToken.toFixed(6)}`)
  console.log(`每美元Token数: ${Math.round(report.efficiency.tokensPerDollar).toLocaleString()}`)
  
  console.log('\n📊 规模化成本:')
  const scaleCosts = calculator.calculateScaleCosts([10, 100, 1000, 10000])
  scaleCosts.forEach(scale => {
    console.log(`${scale.reportCount.toLocaleString()}篇报告: $${scale.totalCost.toFixed(2)} (平均$${scale.costPerReport.toFixed(4)}/篇)`)
  })
  
  console.log('\n💡 建议定价策略:')
  const pricing = calculator.suggestUserPricing()
  Object.entries(pricing.suggestedPricing).forEach(([tier, data]) => {
    console.log(`${tier}: $${data.price} (${data.markup}x markup, ${data.profitMargin}% profit margin)`)
  })
  
  return report
}

// 如果直接运行此文件，执行分析
if (typeof module !== 'undefined' && require.main === module) {
  runCostAnalysis()
}

module.exports = { ReportCostCalculator, runCostAnalysis }
