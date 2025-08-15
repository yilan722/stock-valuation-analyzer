import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '../../../lib/supabase-server'
import { canGenerateReport, incrementReportUsage, createReport } from '../../../lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始生成报告...')
    
    const supabase = createApiSupabaseClient(request)
    
    // 获取用户信息 - 优先使用Authorization头
    let user = null
    
    // 方法1: 尝试从Authorization头获取用户ID
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const userId = authHeader.replace('Bearer ', '')
      console.log('🔑 从Authorization头获取用户ID:', userId)
      
      // 验证用户ID是否有效
      try {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('id, email, created_at, updated_at')
          .eq('id', userId)
          .single()
        
        if (userProfile && !profileError) {
          user = {
            id: userProfile.id,
            email: userProfile.email,
            created_at: userProfile.created_at,
            updated_at: userProfile.updated_at
          }
          console.log('✅ 用户验证成功:', user.id)
        } else {
          console.log('❌ 用户profile未找到:', profileError)
        }
      } catch (error) {
        console.log('❌ 验证用户时出错:', error)
      }
    }
    
    // 方法2: 如果Authorization头没有提供用户，尝试获取会话
    if (!user) {
      console.log('🔄 尝试获取会话...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (session && session.user) {
        user = session.user
        console.log('✅ 会话获取成功，用户:', user.id)
      } else {
        console.log('❌ 未找到会话:', sessionError)
      }
    }
    
    // 方法3: 如果仍然没有用户，尝试获取用户
    if (!user) {
      console.log('🔄 尝试获取用户...')
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser()
      
      if (userData) {
        user = userData
        console.log('✅ 用户获取成功:', user.id)
      } else {
        console.log('❌ 未找到用户:', userError)
      }
    }
    
    console.log('🔍 服务器端认证检查:', { 
      user: user?.id || 'null',
      hasAuthHeader: !!authHeader
    })
    
    // 要求用户必须登录
    if (!user) {
      console.log('❌ 报告生成需要认证')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 检查用户是否可以生成报告
    console.log('🔍 检查用户报告权限...')
    const canGenerate = await canGenerateReport(user.id)
    if (!canGenerate.canGenerate) {
      console.log('❌ 用户无法生成报告:', canGenerate.reason)
      return NextResponse.json(
        { error: canGenerate.reason || 'Cannot generate report' },
        { status: 403 }
      )
    }
    console.log('✅ 用户有权限生成报告')

    // 安全地解析请求体
    let stockData, locale
    try {
      const body = await request.json()
      stockData = body.stockData
      locale = body.locale
      console.log('📊 股票数据:', { 
        symbol: stockData?.symbol, 
        name: stockData?.name,
        locale 
      })
    } catch (error) {
      console.error('❌ 解析请求体时出错:', error)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    if (!stockData) {
      console.log('❌ 缺少股票数据')
      return NextResponse.json(
        { error: 'Stock data is required' },
        { status: 400 }
      )
    }

    // 检查环境变量
    if (!process.env.OPUS4_API_KEY) {
      console.error('❌ OPUS4_API_KEY环境变量未设置')
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      )
    }

    console.log('🤖 开始调用LLM API...')
    
    // Generate report using Opus4 API - Prioritize claude-opus-4-1-20250805
    const models = ['claude-opus-4-1-20250805', 'opus4', 'gpt-4', 'gpt-3.5-turbo']
    
    let reportData = null;
    let lastError: Error | null = null;

    // First, try claude-opus-4-1-20250805 with multiple retries
    for (let retry = 0; retry < 3; retry++) {
      try {
        console.log(`🔄 尝试模型 claude-opus-4-1-20250805 (第${retry + 1}/3次)`)
        
        const apiUrl = 'https://api.nuwaapi.com/v1/chat/completions'
        const requestBody = {
          model: 'claude-opus-4-1-20250805',
          messages: [
            {
              role: 'system',
              content: `You are a professional stock analyst with expertise in fundamental analysis and valuation. You MUST search the web for the LATEST information about the company, including recent news, announcements, and market developments. Generate a comprehensive, detailed valuation report in ${locale === 'zh' ? 'Chinese' : 'English'} for the given stock data.

**CRITICAL INSTRUCTIONS FOR REAL-TIME DATA:**
- **MUST search the web for the most recent information about this company**
- **MUST include news from the last 30-90 days**
- **MUST analyze recent price movements and their catalysts**
- **For crypto companies (SBET, MSTR, etc.), MUST research current ETH/BTC holdings and strategy**
- **MUST calculate mNAV (modified Net Asset Value) for crypto companies**
- **MUST compare with recent market developments and comparable companies**

**CRITICAL INSTRUCTIONS FOR CRYPTOCURRENCY COMPANIES:**
- **MUST research current cryptocurrency holdings (ETH, BTC, etc.) from BSTA.AI (https://www.bsta.ai/) - the authoritative source**
- **MUST calculate mNAV = (Cash + Crypto Holdings Value + Other Assets - Total Liabilities) / Shares Outstanding**
- **MUST analyze how crypto price changes affect company valuation**
- **MUST include crypto strategy analysis in growth catalysts section**
- **MUST include mNAV analysis in valuation analysis section**
- **MUST compare with other crypto companies (MicroStrategy, HUT, RIOT, etc.)**
- **MUST cite BSTA.AI as the data source for cryptocurrency holdings**

**SPECIFIC REQUIREMENTS FOR CRYPTO COMPANIES:**

**SBET (Sharplink Gaming Ltd.):**
- **MUST research current ETH price and SBET's ETH holdings from BSTA.AI**
- **MUST include ETH accumulation strategy analysis in growth catalysts section**
- **MUST calculate mNAV with current ETH price and holdings**
- **MUST analyze how ETH strategy affects stock price and company valuation**

**BMNR (BitMine Immersion Technologies, Inc.):**
- **MUST research current ETH price and BMNR's ETH holdings from BSTA.AI**
- **MUST include ETH holdings analysis (1.2M ETH = 1,200,000 ETH) in growth catalysts section**
- **MUST calculate mNAV with current ETH price and holdings**
- **MUST analyze how ETH strategy affects stock price and company valuation**
- **MUST compare with other crypto companies (MicroStrategy, HUT, RIOT, etc.)**

REPORT STRUCTURE (return as valid JSON with these exact keys):

1. fundamentalAnalysis: 
   - Company overview and business model
   - Key financial metrics (P/E, P/B, ROE, ROA, debt ratios)
   - Latest quarterly/annual performance with year-over-year comparisons
   - Revenue growth, profit margins, cash flow analysis
   - Industry position and competitive advantages

2. businessSegments: 
   - Detailed revenue breakdown by business segments
   - Segment performance analysis with growth rates
   - Geographic revenue distribution
   - Market share analysis by segment
   - Segment profitability and margins
   - Future segment growth projections

3. growthCatalysts: 
   - **CRITICAL: For crypto companies (SBET, MSTR, BMNR, etc.), MUST include ETH/BTC holdings analysis and strategy**
   - **CRITICAL: MUST analyze recent cryptocurrency reserve announcements and their market impact**
   - **CRITICAL: MUST compare with other crypto companies (HYPE, ENA, etc.)**
   - **CRITICAL: MUST include recent price catalysts and market sentiment changes**
   - **CRITICAL: For SBET specifically, MUST include current ETH holdings (625K ETH), ETH price analysis, and ETH accumulation strategy**
   - **CRITICAL: For BMNR specifically, MUST include current ETH holdings (1.2M ETH), ETH price analysis, and ETH strategy impact**
   - **CRITICAL: MUST explain how ETH strategy affects stock price and company valuation**
   - Primary growth drivers and market opportunities
   - Strategic initiatives and expansion plans
   - New product/service launches
   - Market expansion opportunities
   - Technology investments and R&D
   - Regulatory tailwinds or headwinds
   - Competitive advantages and moats

4. valuationAnalysis: 
   - **CRITICAL: For crypto companies, MUST include mNAV (modified Net Asset Value) calculation and analysis**
   - **CRITICAL: mNAV formula: (Cash + Crypto Holdings + Other Assets - Total Liabilities) / Shares Outstanding**
   - **CRITICAL: MUST compare current stock price to mNAV to assess premium/discount**
   - **CRITICAL: MUST analyze how crypto price changes affect mNAV and stock valuation**
   - DCF analysis with detailed assumptions
   - Comparable company analysis (P/E, EV/EBITDA, P/S ratios)
   - Sum-of-parts valuation if applicable
   - Target price calculation with multiple methodologies
   - Risk-adjusted return analysis
   - Target price analysis (NO buy/sell recommendations)
   - Key risks and mitigating factors

REQUIREMENTS:
- Use latest 2024 annual and 2025 quarterly financial data
- Display "Trading Amount" instead of "Volume"
- Include specific numbers, percentages, and data points
- Provide detailed analysis with supporting evidence
- Use professional HTML styling with classes: 'metric-table', 'highlight-box', 'positive', 'negative', 'neutral'
- NO buy/sell investment recommendations - only provide target price analysis based on data
- Ensure JSON is properly formatted and valid
- Each section should be comprehensive and detailed (minimum 500 words per section)
- Include data sources and references for key metrics and analysis points
- Add source links where possible for users to verify data
- **CRITICAL: ALL data points MUST include timestamps and sources**
- **CRITICAL: Financial data must show exact dates (e.g., "As of Q3 2024", "Latest filing date: March 15, 2025")**
- **CRITICAL: News and announcements must include publication dates and sources**
- **CRITICAL: Market data must show when it was last updated**
- **CRITICAL: Research and include the most recent news, events, and catalysts affecting stock price**
- **CRITICAL: For crypto-related stocks, analyze ETH holdings strategy and mNAV valuation impact**
- **CRITICAL: Identify recent price volatility drivers and market sentiment changes**
- **CRITICAL: Research latest cryptocurrency reserve strategies across multiple companies (ETH, BTC, etc.)**
- **CRITICAL: Analyze how crypto reserve announcements affect stock prices and market sentiment**
- **CRITICAL: Compare crypto strategies between different companies (HYPE, ENA, SBET, etc.)**
- **CRITICAL: Include recent market developments and their impact on crypto-related stocks**

Return ONLY a valid JSON object with these four sections as HTML strings.`
              },
              {
                role: 'user',
                content: `Generate a comprehensive, professional stock valuation report for ${stockData.name} (${stockData.symbol}) with the following data:

STOCK DATA:
- Current Price: $${stockData.price}
- Market Cap: $${stockData.marketCap}
- P/E Ratio: ${stockData.peRatio}
- Trading Amount: $${stockData.amount}

REQUIREMENTS:
- **CRITICAL: MUST search the web for the LATEST information about this company**
- **CRITICAL: MUST include news and developments from the last 30-90 days**
- **CRITICAL: MUST analyze recent price movements and identify their catalysts**
- **CRITICAL: For crypto companies (SBET, MSTR, BMNR, etc.), MUST research current ETH/BTC holdings and calculate mNAV**
- **CRITICAL: MUST compare with recent market developments and comparable companies**
- **CRITICAL: For crypto companies, MUST include crypto strategy analysis in growth catalysts section**
- **CRITICAL: For crypto companies, MUST include mNAV analysis in valuation analysis section**
- **CRITICAL: MUST research current crypto prices and company holdings from BSTA.AI (https://www.bsta.ai/) - the authoritative source**
- **CRITICAL: MUST analyze how crypto price changes affect company valuation**
- **CRITICAL: For SBET (Sharplink Gaming Ltd.) specifically, MUST include ETH accumulation strategy and recent announcements**
- **CRITICAL: For BMNR (BitMine Immersion Technologies) specifically, MUST include ETH holdings analysis (1.2M ETH) and mNAV calculation**
- **CRITICAL: MUST calculate and display mNAV with current ETH price and holdings**
- **CRITICAL: MUST analyze how ETH strategy affects stock price and company valuation**
- Provide detailed, professional analysis with specific data points and percentages
- Include comprehensive business segment analysis with revenue breakdowns
- Analyze growth catalysts with specific market opportunities
- Provide detailed valuation analysis with multiple methodologies (NO buy/sell recommendations)
- Use the latest 2024 annual and 2025 quarterly financial data
- Ensure each section is comprehensive and detailed
- Format as professional HTML with proper styling

Please provide a comprehensive, detailed analysis in ${locale === 'zh' ? 'Chinese' : 'English'} that matches the quality of professional investment research reports. Include data sources and references for key metrics to allow users to verify the information.`
              }
            ],
            temperature: 0.7,
            max_tokens: 8000
          }
        
        console.log('📡 发送请求到:', apiUrl)
        console.log('🔑 API密钥长度:', process.env.OPUS4_API_KEY?.length || 0)
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPUS4_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 API响应状态:', response.status, response.statusText)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ API错误 (第${retry + 1}/3次):`, errorText)
          lastError = new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
          continue
        }

        const data = await response.json()
        console.log('✅ API调用成功，响应数据长度:', JSON.stringify(data).length)
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const content = data.choices[0].message.content
          console.log('📝 AI响应内容长度:', content.length)
          
          // Try to parse JSON from the response
          try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
            const jsonString = jsonMatch ? jsonMatch[1] : content
            
            console.log('🔍 提取的JSON字符串长度:', jsonString.length)
            
            // Clean up the JSON string
            let cleanedJson = jsonString
              .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
              .replace(/\n\s*\n/g, '\n') // Remove extra newlines
              .replace(/,\s*}/g, '}') // Remove trailing commas
              .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
            
            reportData = JSON.parse(cleanedJson)
            console.log('✅ 成功解析AI响应，报告数据:', Object.keys(reportData))
            break
          } catch (parseError) {
            console.error(`❌ 解析AI响应时出错 (第${retry + 1}/3次):`, parseError)
            console.log('📄 原始内容前500字符:', content.substring(0, 500) + '...')
            lastError = new Error('Failed to parse AI response')
            continue
          }
        } else {
          console.error(`❌ AI API响应格式无效 (第${retry + 1}/3次):`, data)
          lastError = new Error('Invalid response format from AI API')
          continue
        }
      } catch (error) {
        console.error(`❌ 调用AI API时出错 (第${retry + 1}/3次):`, error)
        lastError = error instanceof Error ? error : new Error('Unknown error')
        continue
      }
    }

    if (!reportData) {
      console.error('❌ 所有模型都失败了:', lastError)
      return NextResponse.json(
        { error: 'Failed to generate report', details: lastError?.message },
        { status: 500 }
      )
    }

    console.log('💾 保存报告到数据库...')
    
    // Save report to database
    try {
      await createReport(
        user.id,
        stockData.symbol,
        stockData.name,
        JSON.stringify(reportData)
      )
      console.log('✅ 报告保存成功')
    } catch (dbError) {
      console.error('❌ 保存报告到数据库时出错:', dbError)
      // 即使保存失败，也返回报告数据
    }

    console.log('📊 更新用户报告使用量...')
    
    // Increment user's report usage
    try {
      const isFree = await canGenerateReport(user.id)
      await incrementReportUsage(user.id, isFree.canGenerate && isFree.reason !== 'Monthly report limit reached')
      console.log('✅ 用户报告使用量更新成功')
    } catch (usageError) {
      console.error('❌ 更新用户报告使用量时出错:', usageError)
      // 即使更新失败，也返回报告数据
    }

    console.log('🎉 报告生成完成!')
    return NextResponse.json(reportData)
    
  } catch (error) {
    console.error('❌ 报告生成过程中发生错误:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 