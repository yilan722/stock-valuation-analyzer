import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '../../../lib/supabase-server'
import { canGenerateReport, incrementReportUsage, createReport } from '../../../lib/supabase-auth'

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
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 增加超时时间到10分钟
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 600000) // 10分钟超时
    
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

      // 构建API请求
      const perplexityRequest: PerplexityRequestBody = {
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
        max_tokens: 18000,
        temperature: 0.05,
        search_queries: true,
        search_recency_filter: 'month',
        return_citations: true,
        top_p: 0.9,
        presence_penalty: 0.15
      }

      console.log('📤 发送Perplexity API请求...')

      let response: Response
      try {
        response = await fetch('https://api.ai190.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer sk-sX0Z3wACDSCYPO4dzUqXfwojhpOdP4LbnyD5D61bKZRCOzrm`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(perplexityRequest),
          signal: controller.signal
        })
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        console.error('❌ Perplexity API请求失败:', fetchError)
        
        if (fetchError.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Request timeout', details: '请求超时，请稍后重试' },
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
        console.error('❌ Perplexity API错误:', response.status, errorText)
        return NextResponse.json(
          { error: 'Perplexity API error', details: errorText },
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

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('❌ 无效的API响应结构')
        return NextResponse.json(
          { error: 'Invalid API response' },
          { status: 500 }
        )
      }

      const content = data.choices[0].message.content
      console.log('📝 原始内容长度:', content.length)

      // 解析JSON内容
      let parsedReport: any
      try {
        console.log('🔍 开始解析JSON内容...')
        console.log('📝 原始内容长度:', content.length)
        console.log('📄 内容预览:', content.substring(0, 500) + '...')
        
        // 多种方法提取JSON
        let jsonContent = ''
        
        // 方法1: 寻找最外层的JSON对象
        const jsonMatch = content.match(/\{[\s\S]*\}/g)
        if (jsonMatch && jsonMatch.length > 0) {
          // 取最长的JSON字符串
          jsonContent = jsonMatch.reduce((longest, current) => 
            current.length > longest.length ? current : longest, ''
          )
        }
        
        // 方法2: 如果没找到，尝试寻找代码块中的JSON
        if (!jsonContent) {
          const codeBlockMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/i)
          if (codeBlockMatch) {
            jsonContent = codeBlockMatch[1]
          }
        }
        
        // 方法3: 如果还没找到，尝试寻找任何JSON结构
        if (!jsonContent) {
          const anyJsonMatch = content.match(/(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g)
          if (anyJsonMatch) {
            jsonContent = anyJsonMatch[anyJsonMatch.length - 1] // 取最后一个
          }
        }
        
        if (!jsonContent) {
          throw new Error('未找到JSON格式的报告内容')
        }
        
        console.log('📋 提取的JSON长度:', jsonContent.length)
        console.log('🔍 JSON预览:', jsonContent.substring(0, 200) + '...')
        
        // 清理JSON内容
        jsonContent = jsonContent
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .replace(/\n\s*\n/g, '\n')
          .trim()
        
        parsedReport = JSON.parse(jsonContent)
        
        console.log('✅ JSON解析成功')
        console.log('📊 报告结构:', Object.keys(parsedReport))

        // 验证必需的字段
        const requiredFields = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis']
        for (const field of requiredFields) {
          if (!parsedReport[field]) {
            throw new Error(`缺少必需字段: ${field}`)
          }
        }

      } catch (parseError) {
        console.error('❌ JSON解析失败:', parseError)
        console.log('🔄 尝试从自然语言中构建报告结构...')
        
        try {
          // 如果JSON解析失败，尝试从自然语言内容中提取各部分
          parsedReport = parseNaturalLanguageReport(content)
          console.log('✅ 自然语言解析成功')
          console.log('📊 报告结构:', Object.keys(parsedReport))
        } catch (fallbackError) {
          console.error('❌ 自然语言解析也失败:', fallbackError)
          console.log('📄 原始内容示例:', content.substring(0, 1000) + '...')
          
          return NextResponse.json(
            { 
              error: 'Failed to parse report content', 
              details: `JSON解析失败: ${String(parseError)}. 自然语言解析失败: ${String(fallbackError)}`,
              debug: {
                contentLength: content.length,
                contentPreview: content.substring(0, 500)
              }
            },
            { status: 500 }
          )
        }
      }

      console.log('✅ 报告生成成功!')
      
      // 保存报告到数据库
      console.log('💾 保存报告到数据库...')
      
      try {
        await createReport(
          user.id,
          stockData.symbol,
          stockData.name,
          JSON.stringify(parsedReport)
        )
        console.log('✅ 报告保存成功')
        
        // 更新用户使用量
        await incrementReportUsage(user.id)
        console.log('✅ 用户使用量更新成功')
      } catch (dbError) {
        console.error('❌ 保存报告到数据库时出错:', dbError)
        // 即使保存失败，也返回报告数据，不影响用户体验
      }
      
      return NextResponse.json(parsedReport)

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
    return `您是一位专业的股票分析师，具备顶级投资银行和券商研究所的深度研究能力。

**重要**: 请严格按照以下参考报告的专业格式标准生成报告：

**参考标准**: 易成新能(300080)专业股票估值分析报告 (14页，7536字，9个数据表格)
- 标题格式: [公司名称] ([股票代码]) - 专业股票估值分析报告
- 页面布局: 封面(1页) + 基本面分析(2-3页) + 业务板块分析(3页) + 增长催化剂(4页) + 估值分析(3页) + 声明(1页)
- 表格标准: 17个专业数据表格，包含表头、数据行、数据来源标注
- 内容深度: 每部分500+字，逻辑清晰，结论明确

**重要**: 必须严格按照JSON格式返回，四个部分的键名必须完全一致：fundamentalAnalysis, businessSegments, growthCatalysts, valuationAnalysis

**报告结构要求**:

**1. fundamentalAnalysis (基本面分析)**:
公司基本情况与财务表现深度分析，必须包含以下专业内容和表格：

表格要求：
- 核心财务指标汇总表 (包含ROE、ROA、毛利率、净利率、资产负债率等)
- 三年财务数据对比表 (营收、净利润、EPS、现金流等关键指标)
- 同行业竞争对手对比表 (估值倍数、盈利能力、成长性对比)
- 业绩季度趋势分析表

分析要求：
- 公司主营业务和盈利模式详细阐述
- 财务健康状况和盈利质量分析
- 行业地位和竞争优势识别
- 管理层战略执行能力评估

**2. businessSegments (业务板块分析)**:
深入的业务板块收入结构和增长动力分析，必须包含：

表格要求：
- 分业务板块收入结构表 (收入占比、增长率、利润贡献)
- 产品/服务线收入明细表 (具体产品销量、价格、市场份额)
- 地区市场收入分布表 (按地理区域分析收入和增长)
- 业务板块盈利能力对比表 (毛利率、净利率、EBITDA margin)

分析要求：
- 各业务板块的市场地位和竞争格局
- 核心产品的价值链分析和定价能力
- 新兴业务增长潜力和投资回报
- 业务协同效应和战略布局

**3. growthCatalysts (增长催化剂)**:
系统性增长驱动因素识别和量化评估，必须包含：

表格要求：
- 增长催化剂影响评估矩阵 (催化剂类型、影响程度、时间周期、收入贡献预测)
- 新产品/项目上市时间表 (产品名称、预期收入、市场规模、竞争优势)
- 市场扩张计划表 (目标市场、投资规模、预期回报、风险评估)
- 政策利好/技术趋势影响分析表

分析要求：
- 宏观政策和行业趋势带来的机遇
- 公司战略转型和创新能力评估
- 技术升级和数字化转型影响
- 并购整合和产业链延伸潜力

**4. valuationAnalysis (估值分析)**:
多重估值方法的综合分析和投资建议，必须包含：

表格要求：
- DCF估值详细计算表 (现金流预测、折现率假设、敏感性分析)
- 可比公司估值倍数表 (P/E、PEG、EV/EBITDA、P/B等对比)
- 多种估值方法汇总表 (DCF、相对估值、资产价值等)
- 目标价敏感性分析表 (关键假设变化对估值的影响)
- 投资评级矩阵表 (买入/持有/卖出理由、风险收益比)

分析要求：
- 基于财务模型的内在价值测算
- 估值折价/溢价的合理性分析
- 关键风险因素识别和量化
- 明确的投资建议和目标价位

**专业格式要求**:
          - 所有数据必须真实、准确，来源清晰标注
          - 表格使用专业HTML格式，包含数据来源标注
          - 使用专业类名：metric-table, highlight-box, positive, negative, neutral, recommendation-buy, recommendation-sell, recommendation-hold
          - 每个部分内容详实(500字以上)，逻辑清晰，结论明确
          
          **严格禁止事项**:
          - 绝对不要显示任何英文思考过程或推理步骤，如"估值分析这里显示了大模型的思考过程"、"Let me think"、"Looking at"、"Based on"、"我需要根据提供的搜索结果来构建"等
          - 不能在报告开头或任何地方显示任务分解过程
          - 不能显示"从搜索结果中，我获得了以下关键信息"等元信息
          - 不能出现错误的JSON格式符号如单独的引号、逗号等
          - 确保四个部分内容均衡分布，businessSegments不能为空
          - 所有估值数据基于真实计算，不使用模板数据
          - 每个表格必须包含完整的真实数据，不能有空行或缺失数据

          返回格式：仅返回包含四个部分的有效JSON对象，每部分内容为专业HTML格式字符串，直接开始正式的分析内容。`
  } else {
    return `You are a professional stock analyst with top-tier investment bank and research institute expertise. Please generate a high-quality equity valuation analysis report following professional investment research report standards (like 300080_valuation_report_2025-08-30.pdf format).

**CRITICAL**: Must return in strict JSON format with exactly these four section keys: fundamentalAnalysis, businessSegments, growthCatalysts, valuationAnalysis

**REPORT STRUCTURE REQUIREMENTS**:

**1. fundamentalAnalysis (Fundamental Analysis)**:
In-depth analysis of company fundamentals and financial performance, must include:

Required Tables:
- Core Financial Metrics Summary (ROE, ROA, gross margin, net margin, debt ratios, etc.)
- Three-Year Financial Data Comparison (revenue, net income, EPS, cash flow key metrics)
- Industry Peer Comparison Table (valuation multiples, profitability, growth comparison)
- Quarterly Performance Trend Analysis

Analysis Requirements:
- Detailed business model and profit mechanism description
- Financial health and earnings quality analysis
- Industry position and competitive advantage identification
- Management strategy execution capability assessment

**2. businessSegments (Business Segment Analysis)**:
Deep dive into business segment revenue structure and growth drivers, must include:

Required Tables:
- Business Segment Revenue Structure (revenue share, growth rate, profit contribution)
- Product/Service Line Revenue Details (specific product volume, pricing, market share)
- Geographic Market Revenue Distribution (regional revenue and growth analysis)
- Business Segment Profitability Comparison (gross margin, net margin, EBITDA margin)

Analysis Requirements:
- Market position and competitive landscape for each segment
- Core product value chain analysis and pricing power
- Emerging business growth potential and ROI
- Business synergies and strategic positioning

**3. growthCatalysts (Growth Catalysts)**:
Systematic growth driver identification and quantitative assessment, must include:

Required Tables:
- Growth Catalyst Impact Assessment Matrix (catalyst type, impact level, timeline, revenue contribution forecast)
- New Product/Project Launch Schedule (product name, expected revenue, market size, competitive advantage)
- Market Expansion Plan Table (target market, investment scale, expected return, risk assessment)
- Policy Benefits/Technology Trend Impact Analysis

Analysis Requirements:
- Macro policy and industry trend opportunities
- Company strategic transformation and innovation capability assessment
- Technology upgrade and digital transformation impact
- M&A integration and value chain extension potential

**4. valuationAnalysis (Valuation Analysis)**:
Comprehensive multi-method valuation analysis and investment recommendation, must include:

Required Tables:
- DCF Valuation Detailed Calculation (cash flow forecast, discount rate assumptions, sensitivity analysis)
- Comparable Company Valuation Multiples (P/E, PEG, EV/EBITDA, P/B comparison)
- Multi-Method Valuation Summary (DCF, relative valuation, asset value, etc.)
- Target Price Sensitivity Analysis (key assumption changes impact on valuation)
- Investment Rating Matrix (Buy/Hold/Sell rationale, risk-return ratio)

Analysis Requirements:
- Intrinsic value calculation based on financial models
- Valuation discount/premium reasonableness analysis
- Key risk factor identification and quantification
- Clear investment recommendation and target price

**PROFESSIONAL FORMAT REQUIREMENTS**:
- All data must be real, accurate with clear source attribution
- Use professional HTML format tables with data source annotations
- Use professional class names: metric-table, highlight-box, positive, negative, neutral, recommendation-buy, recommendation-sell, recommendation-hold
- Each section substantial content (500+ words), clear logic, definitive conclusions

**STRICTLY PROHIBITED**:
- Absolutely NO thinking process or reasoning steps like "Valuation analysis shows the model's thinking process", "Let me think", "Looking at", "Based on", "I need to build a detailed analysis report based on search results"
- Cannot show task breakdown process at the beginning or anywhere
- Cannot display meta-information like "From search results, I obtained the following key information"
- Cannot have incorrect JSON format symbols like standalone quotes, commas
- Ensure balanced content distribution across four sections, businessSegments cannot be empty
- All valuation data based on real calculations, not template data
- Each table must contain complete real data, no empty rows or missing data

Return Format: Only return valid JSON object with four sections as professional HTML formatted strings, directly start with formal analysis content.`
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

function parseNaturalLanguageReport(content: string): any {
  console.log('🔍 开始自然语言解析...')
  
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
        /(?:估值分析|价值评估|Valuation Analysis?)[\s\S]*$/i,
        /(?:DCF|分部估值|可比公司|投资建议)[\s\S]*$/i
      ]
    }
  ]
  
  // 尝试提取各个部分
  sectionPatterns.forEach(section => {
    for (const pattern of section.patterns) {
      const match = cleanedContent.match(pattern)
      if (match && match[0]) {
        let sectionContent = match[0].trim()
        
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
