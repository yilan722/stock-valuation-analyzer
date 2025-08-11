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
            'Authorization': `Bearer sk-88seMXjnLEzEYYD3ABw8G0Z70f7zoWbXXNhGRwu5jslCzFIR`
          },
          body: JSON.stringify({
            model: 'claude-opus-4-1-20250805',
            messages: [
              {
                role: 'system',
                content: `You are a professional stock analyst with expertise in fundamental analysis and valuation. Generate a comprehensive, detailed valuation report in ${locale === 'zh' ? 'Chinese' : 'English'} for the given stock data.

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
   - Primary growth drivers and market opportunities
   - Strategic initiatives and expansion plans
   - New product/service launches
   - Market expansion opportunities
   - Technology investments and R&D
   - Regulatory tailwinds or headwinds
   - Competitive advantages and moats

4. valuationAnalysis: 
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
      return NextResponse.json(
        { error: 'Failed to generate report' },
        { status: 500 }
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