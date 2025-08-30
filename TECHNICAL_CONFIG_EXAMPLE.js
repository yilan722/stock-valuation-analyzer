// 股票估值报告生成 - 技术配置示例
// 记录当前优化后的完整配置，包括API参数、Prompt等

/**
 * Perplexity API 调用配置
 * 优化后的参数设置，确保生成高质量报告
 */
const PERPLEXITY_CONFIG = {
  model: 'sonar-deep-research',        // 学术级深度研究模型
  max_tokens: 20000,                   // 支持长篇详细分析
  temperature: 0.05,                   // 极低温度确保精确性
  search_queries: true,                // 启用深度搜索
  search_recency_filter: 'month',      // 搜索最近一个月信息 (修复了quarter错误)
  return_citations: true,              // 返回学术级引用
  top_p: 0.9,                         // 聚焦输出
  presence_penalty: 0.15               // 增强分析深度
}

/**
 * System Prompt 构建函数
 * 优化后的提示词，解决了4个核心问题
 */
function buildOptimizedSystemPrompt(locale) {
  const isChinese = locale === 'zh'
  
  if (isChinese) {
    return `您是一位在基本面分析和估值方面具有专业知识的股票分析师,具备投资银行级别的深度研究能力。请根据给定的股票数据，生成一份全面、详细的估值报告。

报告结构 (请以有效 JSON 格式返回，并使用以下确切的键名)：

fundamentalAnalysis (基本面分析):
- 公司概览和商业模式
- 关键财务指标 (市盈率P/E, 市净率P/B, 净资产收益率ROE, 资产收益率ROA, 负债比率)
- 最新季度/年度业绩与同比比较
- 营收增长、利润率、现金流分析
- 行业地位和竞争优势

businessSegments (业务板块):
- 按业务板块划分的详细收入明细
- 业务板块业绩分析与增长率
- 区域收入分布
- 按业务板块划分的市场份额分析
- 业务板块盈利能力和利润率
- 未来业务板块增长预测

growthCatalysts (增长催化剂):
- 主要增长驱动因素和市场机遇
- 战略举措和扩张计划
- 新产品/服务发布
- 市场扩张机会
- 技术投资和研发
- 监管利好或利空
- 竞争优势和护城河

valuationAnalysis (估值分析):
- DCF (现金流折现) 分析及详细假设
- 可比公司分析 (市盈率P/E, 企业价值/息税折旧摊销前利润EV/EBITDA, 市销率P/S)
- 适用时的分部加总估值 (Sum-of-parts valuation)
- 采用多种方法计算目标价格
- 风险调整回报分析
- 投资建议 (买入/持有/卖出) 及理由
- 主要风险和缓解因素

要求：
- 使用最新的 2024 年度和 2025 季度财务数据
- 显示"Trading Amount"（交易金额）而非"Volume"（交易量）
- 包含具体的数字、百分比和数据点
- 提供详细分析及支持性证据
- 使用专业的 HTML 样式，并带有以下类名：'metric-table', 'highlight-box', 'positive', 'negative', 'neutral', 'recommendation-buy', 'recommendation-sell', 'recommendation-hold'
- 确保 JSON 格式正确且有效
- 每个部分都应全面且详细 (每个部分最少 500 字)
- 每个部分必须包含至少2-3个数据表格来支撑分析
- 所有表格数据必须与文字分析内容相匹配，不能出现矛盾
- 绝对不要显示任何英文思考过程或推理步骤
- 确保四个部分内容均衡分布，每个部分都有实质性内容
- businessSegments部分必须包含详细的业务收入细分和增长数据
- valuationAnalysis部分的估值表格必须使用准确的财务计算结果
- 仅返回一个包含这四个部分的有效 JSON 对象，内容为 HTML 字符串。`
  } else {
    return `You are a professional stock analyst with expertise in fundamental analysis and valuation. Generate a comprehensive, detailed valuation report in ${locale === 'zh' ? 'Chinese' : 'English'} for the given stock data.

REPORT STRUCTURE (return as valid JSON with these exact keys):

fundamentalAnalysis:
- Company overview and business model
- Key financial metrics (P/E, P/B, ROE, ROA, debt ratios)
- Latest quarterly/annual performance with year-over-year comparisons
- Revenue growth, profit margins, cash flow analysis
- Industry position and competitive advantages

businessSegments:
- Detailed revenue breakdown by business segments
- Segment performance analysis with growth rates
- Geographic revenue distribution
- Market share analysis by segment
- Segment profitability and margins
- Future segment growth projections

growthCatalysts:
- Primary growth drivers and market opportunities
- Strategic initiatives and expansion plans
- New product/service launches
- Market expansion opportunities
- Technology investments and R&D
- Regulatory tailwinds or headwinds
- Competitive advantages and moats

valuationAnalysis:
- DCF analysis with detailed assumptions
- Comparable company analysis (P/E, EV/EBITDA, P/S ratios)
- Sum-of-parts valuation if applicable
- Target price calculation with multiple methodologies
- Risk-adjusted return analysis
- Investment recommendation (BUY/HOLD/SELL) with rationale
- Key risks and mitigating factors

REQUIREMENTS:
- Use latest 2024 annual and 2025 quarterly financial data
- Display "Trading Amount" instead of "Volume"
- Include specific numbers, percentages, and data points
- Provide detailed analysis with supporting evidence
- Use professional HTML styling with classes: 'metric-table', 'highlight-box', 'positive', 'negative', 'neutral', 'recommendation-buy', 'recommendation-sell', 'recommendation-hold'
- Ensure JSON is properly formatted and valid
- Each section should be comprehensive and detailed (minimum 500 words per section)
- Each section MUST include at least 2-3 data tables to support the analysis
- All table data MUST match and be consistent with the text analysis content
- NEVER show any English thinking process or reasoning steps
- Ensure balanced content distribution across all four sections with substantial content
- businessSegments section MUST include detailed business revenue breakdown and growth data
- valuationAnalysis section valuation tables MUST use accurate financial calculation results
- Return ONLY a valid JSON object with these four sections as HTML strings.`
  }
}

/**
 * User Prompt 构建函数
 * 统一的用户提示词，支持中英文动态切换
 */
function buildOptimizedUserPrompt(stockData, locale) {
  return `Generate a comprehensive, professional stock valuation report for ${stockData.name} (${stockData.symbol}) with the following data:

STOCK DATA:
- Current Price: ${stockData.price}
- Market Cap: ${stockData.marketCap}
- P/E Ratio: ${stockData.peRatio}
- Trading Amount: ${stockData.amount}

REQUIREMENTS:
- Provide detailed, professional analysis with specific data points and percentages
- Include comprehensive business segment analysis with revenue breakdowns
- Analyze growth catalysts with specific market opportunities
- Provide detailed valuation analysis with multiple methodologies
- Use the latest annual and quarterly financial data, or current stock price, p/e, trading volume data
- Ensure each section is comprehensive and detailed
- Format as professional HTML with proper styling

Please provide a comprehensive, detailed analysis in ${locale === 'zh' ? 'Chinese' : 'English'} that matches the quality of professional investment research reports. 针对中英文报告分别使用对应的语言`
}

/**
 * 完整的 API 调用示例
 */
async function generateOptimizedReport(stockData, locale = 'zh') {
  const apiKey = process.env.PERPLEXITY_API_KEY
  const systemPrompt = buildOptimizedSystemPrompt(locale)
  const userPrompt = buildOptimizedUserPrompt(stockData, locale)
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      ...PERPLEXITY_CONFIG,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  
  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

/**
 * 质量验证函数
 * 验证生成的报告是否符合质量标准
 */
function validateReportQuality(reportData) {
  const sections = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis']
  const issues = []
  
  // 检查基本结构
  for (const section of sections) {
    if (!reportData[section]) {
      issues.push(`缺少 ${section} 部分`)
      continue
    }
    
    const content = reportData[section]
    
    // 检查内容长度
    if (content.length < 500) {
      issues.push(`${section} 内容过短 (${content.length} 字符)`)
    }
    
    // 检查表格数量
    const tableCount = (content.match(/<table|class=".*metric-table/g) || []).length
    if (tableCount < 2) {
      issues.push(`${section} 表格数量不足 (${tableCount} 个)`)
    }
    
    // 检查英文思考过程
    if (/Let me think|I need to|Looking at|Based on/.test(content)) {
      issues.push(`${section} 包含英文思考过程`)
    }
  }
  
  // 检查业务细分特殊要求
  if (reportData.businessSegments) {
    const businessContent = reportData.businessSegments
    if (!businessContent.includes('收入') && !businessContent.includes('业务')) {
      issues.push('businessSegments 缺少业务收入数据')
    }
  }
  
  // 检查估值分析特殊要求
  if (reportData.valuationAnalysis) {
    const valuationContent = reportData.valuationAnalysis
    if (!valuationContent.includes('DCF') || !valuationContent.includes('目标价')) {
      issues.push('valuationAnalysis 缺少关键估值数据')
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues,
    score: Math.max(0, 100 - issues.length * 10)
  }
}

/**
 * 使用示例
 */
const exampleUsage = async () => {
  const stockData = {
    name: '易成新能',
    symbol: '300080',
    price: '4.2',
    marketCap: '20.69亿',
    peRatio: '20.69',
    amount: '4.2万元'
  }
  
  try {
    const report = await generateOptimizedReport(stockData, 'zh')
    const validation = validateReportQuality(report)
    
    console.log('报告生成成功:', validation.score, '分')
    if (!validation.isValid) {
      console.log('质量问题:', validation.issues)
    }
    
    return report
  } catch (error) {
    console.error('生成失败:', error)
  }
}

// 导出配置
module.exports = {
  PERPLEXITY_CONFIG,
  buildOptimizedSystemPrompt,
  buildOptimizedUserPrompt,
  generateOptimizedReport,
  validateReportQuality,
  exampleUsage
}

/**
 * 关键改进记录：
 * 
 * 1. 修复了 search_recency_filter 从 'quarter' 到 'month'
 * 2. 增强了 System Prompt 的质量控制要求
 * 3. 明确禁止英文思考过程显示
 * 4. 强制要求业务细分部分有实质内容
 * 5. 要求估值表格使用准确的财务数据
 * 6. 每个部分至少包含2-3个数据表格
 * 7. 确保表格数据与文字分析内容匹配
 * 
 * 此配置已验证可生成高质量投资研究报告！
 */
