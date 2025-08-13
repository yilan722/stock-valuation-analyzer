import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '../../../lib/supabase-server'
import { canGenerateReport, incrementReportUsage, createReport } from '../../../lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = createApiSupabaseClient(request)
    
    // 获取用户信息 - 优先使用Authorization头
    let user = null
    
    // 方法1: 尝试从Authorization头获取用户ID
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const userId = authHeader.replace('Bearer ', '')
      console.log('User ID found in Authorization header:', userId)
      
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
          console.log('User verified from Authorization header:', user.id)
        } else {
          console.log('User profile not found for ID:', userId)
        }
      } catch (error) {
        console.log('Error verifying user from Authorization header:', error)
      }
    }
    
    // 方法2: 如果Authorization头没有提供用户，尝试获取会话
    if (!user) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (session && session.user) {
        user = session.user
        console.log('Session found, user:', user.id)
      } else {
        console.log('No session found')
      }
    }
    
    // 方法3: 如果仍然没有用户，尝试获取用户
    if (!user) {
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser()
      
      if (userData) {
        user = userData
        console.log('User found via getUser:', user.id)
      } else {
        console.log('No user found via getUser')
      }
    }
    
    console.log('Server-side auth check:', { 
      user: user?.id || 'null'
    })
    
    // 要求用户必须登录
    if (!user) {
      console.log('Authentication required for report generation')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user can generate report
    const canGenerate = await canGenerateReport(user.id)
    if (!canGenerate.canGenerate) {
      return NextResponse.json(
        { error: canGenerate.reason || 'Cannot generate report' },
        { status: 403 }
      )
    }

    // 安全地解析请求体
    let stockData, locale
    try {
      const body = await request.json()
      stockData = body.stockData
      locale = body.locale
    } catch (error) {
      console.error('Error parsing request body:', error)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    if (!stockData) {
      return NextResponse.json(
        { error: 'Stock data is required' },
        { status: 400 }
      )
    }

    // Generate report using Opus4 API - Prioritize claude-opus-4-1-20250805
    const models = ['claude-opus-4-1-20250805', 'opus4', 'gpt-4', 'gpt-3.5-turbo']
    
    let reportData = null;
    let lastError: Error | null = null;

    // First, try claude-opus-4-1-20250805 with multiple retries
    for (let retry = 0; retry < 3; retry++) {
      try {
        console.log(`Trying preferred model claude-opus-4-1-20250805 (attempt ${retry + 1}/3)`);
        const response = await fetch('https://api.nuwaapi.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPUS4_API_KEY}`
          },
          body: JSON.stringify({
            model: 'claude-opus-4-1-20250805',
            messages: [
              {
                role: 'system',
                content: `You are a professional stock analyst with expertise in fundamental analysis and valuation. You MUST actively search for and use the MOST RECENT financial data available for the given company.

CRITICAL REQUIREMENTS:
- You MUST search for and use the LATEST available financial reports (2025 Q1/Q2, 2024 annual, or most recent available)
- NEVER use outdated data from 2024 Q3 or earlier unless it's the most recent available
- If 2025 Q1/Q2 data is available, use that. If not, use 2024 annual data
- Always specify the exact reporting period and date for ALL financial metrics
- Search for the most recent quarterly earnings, annual reports, and financial statements

REPORT STRUCTURE (return as valid JSON with these exact keys):

1. fundamentalAnalysis: 
   - Company overview and business model
   - Key financial metrics (P/E, P/B, ROE, ROA, debt ratios) with EXACT reporting dates
   - LATEST quarterly/annual performance with year-over-year comparisons (specify exact periods)
   - Revenue growth, profit margins, cash flow analysis with filing dates
   - Industry position and competitive advantages with latest data

2. businessSegments: 
   - Detailed revenue breakdown by business segments with reporting periods
   - Segment performance analysis with growth rates and data dates
   - Geographic revenue distribution with latest available data
   - Market share analysis by segment with source and date
   - Segment profitability and margins with financial period
   - Future segment growth projections with projection date

3. growthCatalysts: 
   - Primary growth drivers and market opportunities with latest announcement dates
   - Strategic initiatives and expansion plans with announcement dates
   - New product/service launches with launch dates
   - Market expansion opportunities with latest developments
   - Technology investments and R&D with investment dates
   - Regulatory tailwinds or headwinds with latest updates
   - Competitive advantages and moats with current assessment

4. valuationAnalysis: 
   - DCF analysis with detailed assumptions and calculation date
   - Comparable company analysis (P/E, EV/EBITDA, P/S ratios) with latest data
   - Sum-of-parts valuation if applicable with valuation date
   - Target price calculation with multiple methodologies and calculation date
   - Risk-adjusted return analysis with latest data
   - Target price analysis (NO buy/sell recommendations) with analysis date
   - Key risks and mitigating factors with latest assessment

MANDATORY REQUIREMENTS:
- ALWAYS search for and use the MOST RECENT financial data available
- Specify exact reporting periods for ALL financial metrics (e.g., "Q1 2025", "2024 Annual Report")
- Include data sources and filing dates for ALL financial information
- Use professional HTML styling with classes: 'metric-table', 'highlight-box', 'positive', 'negative', 'neutral'
- NO buy/sell investment recommendations - only provide target price analysis based on data
- Ensure JSON is properly formatted and valid
- Each section should be comprehensive and detailed (minimum 500 words per section)
- Add source links where possible for users to verify data

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

CRITICAL REQUIREMENTS:
- You MUST actively search for and use the MOST RECENT financial data available
- Search for 2025 Q1/Q2 earnings reports, 2024 annual reports, or most recent available
- NEVER use outdated data from 2024 Q3 or earlier unless it's the most recent available
- Always specify exact reporting periods and filing dates for ALL financial metrics
- Include data sources and links for verification

ANALYSIS REQUIREMENTS:
- Provide detailed, professional analysis with specific data points and percentages
- Include comprehensive business segment analysis with revenue breakdowns and reporting periods
- Analyze growth catalysts with specific market opportunities and announcement dates
- Provide detailed valuation analysis with multiple methodologies (NO buy/sell recommendations)
- Use the latest available financial data with exact dates
- Ensure each section is comprehensive and detailed
- Format as professional HTML with proper styling

Please provide a comprehensive, detailed analysis in ${locale === 'zh' ? 'Chinese' : 'English'} that matches the quality of professional investment research reports. The analysis MUST use the most recent financial data available and include specific dates and sources for all information.`
              }
            ],
            temperature: 0.7,
            max_tokens: 8000
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`API Error for claude-opus-4-1-20250805 (attempt ${retry + 1}/3):`, errorText)
          lastError = new Error(`API Error: ${response.status} ${response.statusText}`)
          continue
        }

        const data = await response.json()
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const content = data.choices[0].message.content
          
          // Try to parse JSON from the response
          try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
            const jsonString = jsonMatch ? jsonMatch[1] : content
            
            // Clean up the JSON string
            let cleanedJson = jsonString
              .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
              .replace(/\n\s*\n/g, '\n') // Remove extra newlines
              .replace(/,\s*}/g, '}') // Remove trailing commas
              .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
            
            reportData = JSON.parse(cleanedJson)
            console.log(`Successfully generated report using claude-opus-4-1-20250805`)
            break
          } catch (parseError) {
            console.error(`Error parsing AI response:`, parseError)
            console.log('Raw content:', content.substring(0, 500) + '...')
            lastError = new Error('Failed to parse AI response')
            continue
          }
        } else {
          lastError = new Error('Invalid response format from AI API')
          continue
        }
      } catch (error) {
        console.error(`Error with claude-opus-4-1-20250805 (attempt ${retry + 1}/3):`, error)
        lastError = error instanceof Error ? error : new Error('Unknown error')
        continue
      }
    }

    if (!reportData) {
      console.error('All models failed:', lastError)
      
      // 提供更详细的错误信息
      let errorMessage = 'Failed to generate report'
      let statusCode = 500
      
      if (lastError?.message?.includes('Token amount has been exhausted')) {
        errorMessage = 'API quota exhausted. Please try again later or contact support.'
        statusCode = 429 // Too Many Requests
      } else if (lastError?.message?.includes('fetch failed') || lastError?.message?.includes('SocketError')) {
        errorMessage = 'Network connection issue. Please check your internet connection and try again.'
        statusCode = 503 // Service Unavailable
      } else if (lastError?.message?.includes('401 Unauthorized')) {
        errorMessage = 'API authentication failed. Please contact support.'
        statusCode = 401
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: lastError?.message || 'Unknown error',
          retryAfter: statusCode === 429 ? 3600 : undefined // 1 hour for quota issues
        },
        { status: statusCode }
      )
    }

    // Save report to database
    await createReport(
      user.id,
      stockData.symbol,
      stockData.name,
      JSON.stringify(reportData)
    )

    // Increment user's report usage
    const isFree = await canGenerateReport(user.id)
    await incrementReportUsage(user.id, isFree.canGenerate && isFree.reason !== 'Monthly report limit reached')

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 