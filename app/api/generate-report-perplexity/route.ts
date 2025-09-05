import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '../../../lib/supabase-server'
import { canGenerateReport, incrementReportUsage, createReport } from '../../../lib/supabase-auth'

// 强制动态渲染，因为使用了request.headers和数据库操作
export const dynamic = 'force-dynamic'

// Vercel配置 - 13分钟超时（确保兼容性）
export const maxDuration = 800

interface StockData {
  symbol: string
  name: string
  price: string
  marketCap: string
  peRatio: string
  amount: string
}

interface PerplexityRequestBody {
  model: string
  messages: Array<{
    role: string
    content: string
  }>
  max_tokens?: number
  temperature?: number
  search_queries?: boolean
  search_recency_filter?: string
  return_citations?: boolean
  top_p?: number
  presence_penalty?: number
}

interface PerplexityResponse {
  choices?: Array<{
    message: {
      content: string
    }
  }>
  text?: string
  content?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 增加超时时间到15分钟，确保有足够时间生成高质量报告
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 900000) // 15分钟超时（Vercel Pro支持）
    
    try {
      console.log('🚀 开始生成报告...')
      
      // 用户认证
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Missing or invalid Authorization header' },
          { status: 401 }
        )
      }

      const userId = authHeader.replace('Bearer ', '')
      console.log('🔍 用户ID:', userId)

      // 验证用户
      const supabase = createApiSupabaseClient(request)
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        console.error('❌ 用户验证失败:', userError)
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // 检查用户是否可以生成报告
      const canGenerate = await canGenerateReport(user.id)
      if (!canGenerate.canGenerate) {
        return NextResponse.json(
          { error: 'Report generation limit reached', details: canGenerate.reason },
          { status: 403 }
        )
      }

      // 获取请求数据
      const { stockData, locale = 'zh' } = await request.json()
      console.log('📊 股票数据:', stockData)
      console.log('🌍 语言设置:', locale)

      if (!stockData) {
        return NextResponse.json(
          { error: 'Missing stock data' },
          { status: 400 }
        )
      }

      // 构建API请求 - 使用Perplexity Sonar Deep Research模型
      const perplexityRequest = {
        model: 'sonar-deep-research',
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(locale)
          },
          {
            role: 'user',
            content: buildDetailedUserPrompt(stockData, locale)
          }
        ],
        max_tokens: 15000,
        temperature: 0.05,
        search_queries: true,
        search_recency_filter: 'month',
        return_citations: true,
        top_p: 0.9,
        presence_penalty: 0.15
      }

      console.log('📤 发送Perplexity Sonar Deep Research API请求...')

      let response: Response
      try {
        // 使用Perplexity API端点
        const perplexityApiKey = process.env.PERPLEXITY_API_KEY
        if (!perplexityApiKey) {
          throw new Error('PERPLEXITY_API_KEY environment variable is not set')
        }
        
        response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(perplexityRequest),
          signal: controller.signal
        })
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        console.error('❌ Perplexity API请求失败:', fetchError)
        
        if (fetchError.name === 'AbortError') {
          console.error('⏰ 请求超时，已使用时间:', Date.now() - startTime, 'ms')
          return NextResponse.json(
            { 
              error: 'Request timeout', 
              details: '报告生成超时，请稍后重试。Vercel Pro支持最长15分钟执行时间。',
              timeout: true,
              elapsedTime: Date.now() - startTime
            },
            { status: 408 }
          )
        }
        
        if (fetchError.message.includes('fetch failed')) {
          return NextResponse.json(
            { error: 'Network error', details: '网络连接失败，请检查网络连接后重试' },
            { status: 503 }
          )
        }
        
        throw fetchError
      }

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Perplexity API错误:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          timestamp: new Date().toISOString()
        })
        
        // 确保返回有效的JSON格式
        let errorDetails
        try {
          errorDetails = JSON.parse(errorText)
        } catch {
          errorDetails = { message: errorText }
        }
        
        return NextResponse.json(
          { 
            error: 'Perplexity API error', 
            details: errorDetails,
            status: response.status,
            timestamp: new Date().toISOString()
          },
          { status: response.status }
        )
      }

      const data: PerplexityResponse = await response.json()
      console.log('✅ 收到Perplexity响应')

      // 监控token使用量
      const tokensUsed = data.usage?.total_tokens || 0
      const estimatedCost = (tokensUsed / 1000000) * 2.0 // $2.0 per 1M tokens
      console.log(`💰 Token使用: ${tokensUsed}, 预估成本: $${estimatedCost.toFixed(4)}`)
      
      if (estimatedCost > 0.8) {
        console.warn(`⚠️ 成本超出预期: $${estimatedCost.toFixed(4)} > $0.8`)
      }

      if (!data.choices && !data.content) {
        console.error('❌ 无效的API响应结构')
        return NextResponse.json(
          { error: 'Invalid API response' },
          { status: 500 }
        )
      }

      const content = data.choices?.[0]?.message?.content || data.content || ''
      console.log('📝 原始内容长度:', content.length)

      // 解析AI响应
      let reportContent: any
      try {
        // 尝试解析JSON响应
        const responseText = data.choices?.[0]?.message?.content || data.text || data.content || ''
        
        // 首先尝试直接解析
        try {
          reportContent = JSON.parse(responseText)
        } catch (parseError) {
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = responseText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              reportContent = JSON.parse(jsonMatch[0])
            } catch (secondParseError) {
              // 如果还是失败，使用自然语言解析
              reportContent = parseNaturalLanguageReport(responseText, locale)
            }
          } else {
            // 如果没有找到JSON，使用自然语言解析
            reportContent = parseNaturalLanguageReport(responseText, locale)
          }
        }
      } catch (parseError) {
        console.error('❌ 解析AI响应失败:', parseError)
        
        // 最后的备选方案：使用自然语言解析
        const responseText = data.choices?.[0]?.message?.content || data.text || data.content || ''
        reportContent = parseNaturalLanguageReport(responseText, locale)
      }

      console.log('✅ 报告生成成功!')
      
      // 保存报告到数据库
      console.log('💾 保存报告到数据库...')
      
      try {
        await createReport(
          user.id,
          stockData.symbol,
          stockData.name,
          JSON.stringify(reportContent)
        )
        console.log('✅ 报告保存成功')
        
        // 更新用户使用量
        await incrementReportUsage(user.id)
        console.log('✅ 用户使用量更新成功')
      } catch (dbError) {
        console.error('❌ 保存报告到数据库时出错:', dbError)
        // 即使保存失败，也返回报告数据，不影响用户体验
      }
      
      return NextResponse.json(reportContent)

    } catch (error) {
      clearTimeout(timeoutId)
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('❌ 报告生成失败:', errorMessage)
      
      // 确保返回正确的JSON格式
      return NextResponse.json({
        error: '报告生成失败',
        details: errorMessage,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }, { status: 500 })
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ 报告生成失败:', errorMessage)
    
    // 确保返回正确的JSON格式
    return NextResponse.json({
      error: '报告生成失败',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }, { status: 500 })
  }
}

function buildSystemPrompt(locale: string): string {
  const isChinese = locale === 'zh'
  
  if (isChinese) {
    return `您是一位在基本面分析和估值方面具有专业知识的股票分析师,具备投资银行级别的深度研究能力。请根据给定的股票数据，生成一份全面、详细的估值报告。

报告结构 (请以有效 JSON 格式返回，并使用以下确切的键名)：

fundamentalAnalysis (基本面分析) - 必须包含以下内容：
- 公司概览和商业模式（必须包含公司简介、主营业务、盈利模式）
- 关键财务指标 (市盈率P/E, 市净率P/B, 净资产收益率ROE, 资产收益率ROA, 负债比率)（必须包含具体数值和行业对比）
- 最新季度/年度业绩与同比比较（必须包含具体财务数据和增长率）
- 营收增长、利润率、现金流分析（必须包含历史趋势和预测）
- 行业地位和竞争优势（必须包含市场份额、竞争格局分析）
- 必须包含2-3个数据表格：核心财务指标表、业绩对比表、行业对比表

businessSegments (业务板块) - 必须包含以下内容：
- 按业务板块划分的详细收入明细（必须包含具体数字和百分比）
- 各业务板块业绩分析与增长率（必须包含同比、环比数据）
- 区域收入分布（必须包含地理区域收入占比）
- 按业务板块划分的市场份额分析（必须包含竞争对手对比）
- 业务板块盈利能力和利润率（必须包含毛利率、净利率对比）
- 未来业务板块增长预测（必须包含具体预测数据）
- 必须包含2-3个数据表格：收入结构表、业务板块表现表、区域分布表

growthCatalysts (增长催化剂) - 必须包含以下内容：
- 主要增长驱动因素和市场机遇（必须包含具体市场数据和机会量化）
- 战略举措和扩张计划（必须包含具体时间表和投资金额）
- 新产品/服务发布（必须包含产品名称、预期收入、发布时间）
- 市场扩张机会（必须包含目标市场、预期收入贡献）
- 技术投资和研发（必须包含研发投入、技术突破点）
- 监管利好或利空（必须包含具体政策影响分析）
- 竞争优势和护城河（必须包含具体竞争优势分析）
- 必须包含2-3个数据表格：增长催化剂影响表、新产品时间表、市场机会评估表

valuationAnalysis (估值分析) - 必须包含以下内容：
- DCF (现金流折现) 分析及详细假设（必须包含关键假设和计算结果）
- 可比公司分析 (市盈率P/E, 企业价值/息税折旧摊销前利润EV/EBITDA, 市销率P/S)（必须包含3-5家可比公司对比）
- 采用多种方法计算目标价格（必须包含DCF、相对估值、资产价值等方法）
- 投资建议 (买入/持有/卖出) 及理由（必须包含明确的投资评级和理由）
- 主要风险和缓解因素（必须包含关键风险识别和应对措施）
- 必须包含2-3个数据表格：DCF估值表、可比公司估值表、目标价汇总表

🔑 核心要求：
- 使用最新的财务数据（比如今天是2025年9月5号，应该搜索2024年年报和2025年Q1,Q2的财报）；搜索最新相关信息，进行对估值变化的深度分析
- 显示"Trading Amount"（交易金额）而非"Volume"（交易量）
- 包含具体的数字、百分比和数据点
- 提供详细分析及支持性证据

📊 专业格式要求（参考300053_valuation_report_2025-09-03.pdf）：
- 使用专业的HTML样式，严格按照以下类名：'report-title', 'section-title', 'subsection-title', 'metric-table', 'highlight-box', 'positive', 'negative', 'neutral', 'recommendation-buy', 'recommendation-sell', 'recommendation-hold'
- 报告标题使用大标题格式：<h1>公司名称 (股票代码) 估值分析报告</h1>
- 每个主要部分使用二级标题：<h2>1. 基本面分析</h2>
- 子部分使用三级标题：<h3>1.1 公司概况</h3>
- 数据表格使用专业格式：表头粗体，数据对齐，边框清晰
- 重要数据使用高亮框突出显示
- 百分比和趋势使用颜色编码（绿色=正面，红色=负面，灰色=中性）
- 投资建议使用醒目的标签样式

📋 内容结构要求：
- 确保 JSON 格式正确且有效
- 每个部分都应全面且详细 (每个部分最少 500 字)
- 每个部分必须包含至少2-3个数据表格来支撑分析
- 所有表格数据必须与文字分析内容相匹配，不能出现矛盾
- 绝对不要显示任何英文思考过程或推理步骤

⚠️ 重要：四个部分内容必须均衡分配，严格遵循以下要求：
- fundamentalAnalysis: 专注于公司基本面和财务指标分析
- businessSegments: 专注于业务板块收入结构、区域分布、市场份额分析
- growthCatalysts: 专注于增长驱动因素、战略举措、市场机会分析
- valuationAnalysis: 专注于估值方法、目标价格、投资建议分析

🚫 严格禁止：
- 不同部分之间内容重复或交叉
- 业务细分部分内容过于简单（必须详细分析各业务板块）
- 增长催化剂部分内容过于简单（必须详细分析增长驱动因素）
- 估值分析部分内容过多（控制在合理范围内）
- 任何部分内容为空或过于简短

- 仅返回一个包含这四个部分的有效 JSON 对象，内容为 HTML 字符串。`
  } else {
    return `You are a professional stock analyst with expertise in fundamental analysis and valuation, possessing investment bank-level deep research capabilities. Please generate a comprehensive and detailed valuation report based on the given stock data.

Report Structure (Please return in valid JSON format with these exact keys):

fundamentalAnalysis (Fundamental Analysis) - Must include:
- Company overview and business model (must include company description, main business, profit model)
- Key financial metrics (P/E ratio, P/B ratio, ROE, ROA, debt ratios) (must include specific values and industry comparison)
- Latest quarterly/annual performance vs. year-over-year comparison (must include specific financial data and growth rates)
- Revenue growth, profit margins, cash flow analysis (must include historical trends and forecasts)
- Industry position and competitive advantages (must include market share, competitive landscape analysis)
- Must include 2-3 data tables: core financial metrics table, performance comparison table, industry comparison table

businessSegments (Business Segments) - Must include:
- Detailed revenue breakdown by business segment (must include specific numbers and percentages)
- Business segment performance analysis and growth rates (must include YoY, QoQ data)
- Regional revenue distribution (must include geographic revenue share)
- Market share analysis by business segment (must include competitor comparison)
- Business segment profitability and profit margins (must include gross margin, net margin comparison)
- Future business segment growth projections (must include specific forecast data)
- Must include 2-3 data tables: revenue structure table, business segment performance table, regional distribution table

growthCatalysts (Growth Catalysts) - Must include:
- Major growth drivers and market opportunities (must include specific market data and opportunity quantification)
- Strategic initiatives and expansion plans (must include specific timelines and investment amounts)
- New product/service launches (must include product names, expected revenue, launch dates)
- Market expansion opportunities (must include target markets, expected revenue contribution)
- Technology investments and R&D (must include R&D investment, technology breakthrough points)
- Regulatory benefits or headwinds (must include specific policy impact analysis)
- Competitive advantages and moats (must include specific competitive advantage analysis)
- Must include 2-3 data tables: growth catalyst impact table, new product timeline table, market opportunity assessment table

valuationAnalysis (Valuation Analysis) - Must include:
- DCF (Discounted Cash Flow) analysis with detailed assumptions (must include key assumptions and calculation results)
- Comparable company analysis (P/E, EV/EBITDA, P/S ratios) (must include 3-5 comparable companies)
- Target price calculation using multiple methods (must include DCF, relative valuation, asset value methods)
- Investment recommendation (Buy/Hold/Sell) with rationale (must include clear investment rating and reasoning)
- Key risks and mitigation factors (must include key risk identification and response measures)
- Must include 2-3 data tables: DCF valuation table, comparable company valuation table, target price summary table

🔑 Core Requirements:
- Use the latest financial data (e.g., if today is September 5, 2025, search for 2024 annual reports and 2025 Q1, Q2 earnings); search for the latest relevant information for deep analysis of valuation changes
- Display "Trading Amount" instead of "Volume"
- Include specific numbers, percentages, and data points
- Provide detailed analysis with supporting evidence

📊 Professional Format Requirements (Reference: 300053_valuation_report_2025-09-03.pdf):
- Use professional HTML styling with these exact class names: 'report-title', 'section-title', 'subsection-title', 'metric-table', 'highlight-box', 'positive', 'negative', 'neutral', 'recommendation-buy', 'recommendation-sell', 'recommendation-hold'
- Report title format: <h1>Company Name (Ticker) Valuation Analysis Report</h1>
- Main sections use h2: <h2>1. Fundamental Analysis</h2>
- Subsections use h3: <h3>1.1 Company Overview</h3>
- Data tables use professional format: bold headers, aligned data, clear borders
- Important data highlighted in boxes
- Percentages and trends color-coded (green=positive, red=negative, gray=neutral)
- Investment recommendations use prominent label styles

📋 Content Structure Requirements:
- Ensure correct and valid JSON format
- Each section should be comprehensive and detailed (minimum 500 words per section)
- Each section must include at least 2-3 data tables to support analysis
- All table data must match the written analysis content, no contradictions
- Absolutely NO English thinking process or reasoning steps

⚠️ Important: Four sections must be balanced, strictly following these requirements:
- fundamentalAnalysis: Focus on company fundamentals and financial metrics analysis
- businessSegments: Focus on business segment revenue structure, regional distribution, market share analysis
- growthCatalysts: Focus on growth drivers, strategic initiatives, market opportunity analysis
- valuationAnalysis: Focus on valuation methods, target price, investment recommendation analysis

🚫 Strictly Prohibited:
- Content duplication or overlap between different sections
- Business segments section content too simple (must include detailed analysis of each business segment)
- Growth catalysts section content too simple (must include detailed analysis of growth drivers)
- Valuation analysis section content too extensive (keep within reasonable scope)
- Any section content empty or too brief

- Return only a valid JSON object containing these four sections, with content as HTML strings.`
  }
}

function buildDetailedUserPrompt(stockData: any, locale: string): string {
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

function parseNaturalLanguageReport(content: string, locale: string): any {
  console.log('🔍 开始自然语言解析...')
  
  // 首先尝试解析JSON格式
  try {
    // 清理内容，移除可能的JSON包装
    let jsonContent = content.trim()
    
    // 如果内容被包装在代码块中，提取JSON部分
    if (jsonContent.includes('```json')) {
      const jsonMatch = jsonContent.match(/```json\s*(\{[\s\S]*\})\s*```/)
      if (jsonMatch) {
        jsonContent = jsonMatch[1]
      }
    }
    
    // 如果内容以{开始，尝试直接解析JSON
    if (jsonContent.startsWith('{')) {
      const parsed = JSON.parse(jsonContent)
      console.log('✅ 成功解析JSON格式')
      return parsed
    }
  } catch (error) {
    console.log('⚠️ JSON解析失败，尝试自然语言解析')
  }
  
  // 如果JSON解析失败，进行自然语言解析
  // 首先清理内容，移除思考过程和元信息
  let cleanedContent = content
    // 移除思考过程段落
    .replace(/估值分析这里显示了大模型的思考过程.*?(?=\n|$)/g, '')
    .replace(/我需要根据提供的搜索结果来构建.*?(?=\n|$)/g, '')
    .replace(/从搜索结果中，我获得了以下关键信息[\s\S]*?(?=\*\*|$)/g, '')
    .replace(/基于搜索结果和市场数据[\s\S]*?(?=```|$)/g, '')
    // 移除错误的JSON符号
    .replace(/```json\s*\{/g, '')
    .replace(/^"[,\s]*$/gm, '')
    .replace(/^[,\s]*$/gm, '')
    // 移除孤立的引号和逗号
    .replace(/^[\s"]*,[\s"]*$/gm, '')
    .replace(/^[\s"]*$\n/gm, '')
    .trim()
  
  console.log('🧹 内容清理完成，长度:', cleanedContent.length)
  
  // 创建默认的报告结构
  const report: { [key: string]: string } = {
    fundamentalAnalysis: '',
    businessSegments: '',
    growthCatalysts: '',
    valuationAnalysis: ''
  }
  
    // 定义章节模式（中英文）- 更精确的模式匹配
  const sectionPatterns = [
    {
      key: 'fundamentalAnalysis',
      patterns: [
        /"fundamentalAnalysis":\s*"([^"]*(?:"[^"]*"[^"]*)*)"(?=\s*,\s*"businessSegments")/,
        /(?:基本面分析|Fundamental Analysis)[\s\S]*?(?=(?:业务板块|Business Segments?)|(?:增长催化剂|Growth Catalysts?)|(?:估值分析|Valuation Analysis)|$)/i,
        /(?:公司基本情况|财务表现|核心财务指标)[\s\S]*?(?=(?:业务|Business)|(?:增长|Growth)|(?:估值|Valuation)|$)/i
      ]
    },
    {
      key: 'businessSegments',  
      patterns: [
        /"businessSegments":\s*"([^"]*(?:"[^"]*"[^"]*)*)"(?=\s*,\s*"growthCatalysts")/,
        /(?:业务板块|业务细分|Business Segments?)[\s\S]*?(?=(?:增长催化剂|Growth Catalysts?)|(?:估值分析|Valuation Analysis)|$)/i,
        /(?:分业务板块|产品线|地区市场|盈利能力对比)[\s\S]*?(?=(?:增长|Growth)|(?:估值|Valuation)|$)/i
      ]
    },
    {
      key: 'growthCatalysts',
      patterns: [
        /"growthCatalysts":\s*"([^"]*(?:"[^"]*"[^"]*)*)"(?=\s*,\s*"valuationAnalysis")/,
        /(?:增长催化剂|增长驱动|Growth Catalysts?)[\s\S]*?(?=(?:估值分析|Valuation Analysis)|$)/i,
        /(?:增长催化剂影响评估|新产品|市场扩张|政策支持)[\s\S]*?(?=(?:估值|Valuation)|$)/i
      ]
    },
    {
      key: 'valuationAnalysis',
      patterns: [
        /"valuationAnalysis":\s*"([^"]*(?:"[^"]*"[^"]*)*)"[^}]*$/,
        /(?:估值分析|价值评估|Valuation Analysis?)[\s\S]*?(?=$)/i,
        /(?:DCF|分部估值|可比公司|投资建议)[\s\S]*?(?=$)/i
      ]
    }
  ]
  
  // 尝试提取各个部分
  sectionPatterns.forEach(section => {
    for (const pattern of section.patterns) {
      const match = cleanedContent.match(pattern)
      if (match && match[0]) {
        let sectionContent = match[0].trim()
        
        // 清理JSON格式符号
        sectionContent = sectionContent
          .replace(/^"[^"]*":\s*"/, '') // 移除开头的 "key": "
          .replace(/"\s*,\s*$/, '') // 移除结尾的 ",
          .replace(/"\s*}\s*$/, '') // 移除结尾的 "}
          .replace(/\\"/g, '"') // 转换转义引号
          .replace(/\\n/g, '\n') // 转换换行符
          .replace(/\\t/g, '\t') // 转换制表符
          .trim()
        
        // 清理章节标题
        sectionContent = sectionContent
          .replace(/^##\s*\d*\.?\s*/m, '')
          .replace(/^#+\s*/gm, '<h3>')
          .replace(/(<h3>.*?)$/gm, '$1</h3>')
          .trim()
        
        if (sectionContent.length > 100) { // 至少100字符才认为是有效内容
          report[section.key] = sectionContent
          console.log(`✅ 找到 ${section.key}: ${sectionContent.length} 字符`)
          break
        }
      }
    }
  })
  
  // 如果某些部分没有找到，尝试简单分割
  const missingKeys = Object.keys(report).filter(key => !report[key] || report[key].length < 100)
  
  if (missingKeys.length > 0) {
    console.log('⚠️ 缺少部分，尝试简单分割:', missingKeys)
    
    // 按段落分割内容
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 100)
    
    missingKeys.forEach((key, index) => {
      if (paragraphs[index]) {
        report[key] = paragraphs[index].trim()
        console.log(`🔄 补充 ${key}: ${paragraphs[index].length} 字符`)
      }
    })
  }
  
  // 如果还有空的部分，用默认内容填充
  Object.keys(report).forEach(key => {
    if (!report[key] || report[key].length < 50) {
      report[key] = `<h3>${key.replace(/([A-Z])/g, ' $1').trim()}</h3><p>暂时无法获取此部分的详细信息，请稍后重试。</p>`
      console.log(`⚠️ 使用默认内容填充 ${key}`)
    }
  })
  
  console.log('✅ 自然语言解析完成')
  return report
}
