import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase'
import { canGenerateReport, incrementReportUsage, createReport } from '../../../lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
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

    const { stockData, locale } = await request.json()

    if (!stockData) {
      return NextResponse.json(
        { error: 'Stock data is required' },
        { status: 400 }
      )
    }

    // Generate report using Opus4 API
    const models = ['claude-opus-4-20250514', 'opus4', 'gpt-4', 'gpt-3.5-turbo']
    let reportData = null
    let lastError: Error | null = null

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`)
        
        const response = await fetch('https://api.nuwaapi.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer sk-GNBf5QFmnepeBZddwH612o5vEJQFMq6z8gUAyre7tAIrGeA8`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: `You are a professional stock analyst. Generate a comprehensive valuation report in ${locale === 'zh' ? 'Chinese' : 'English'} for the given stock data. The report should include:

1. Fundamental Analysis (fundamentalAnalysis): Company overview, key financial metrics, latest quarterly/annual performance
2. Business Segments Analysis (businessSegments): Revenue breakdown, segment performance, market analysis
3. Growth Catalysts (growthCatalysts): Growth drivers, opportunities, strategic initiatives
4. Valuation Analysis (valuationAnalysis): DCF analysis, comparable company analysis, target price, investment recommendation

Use the latest 2024 annual and 2025 quarterly financial data. Display "Trading Amount" instead of "Volume".

Format each section as HTML with professional styling using classes like 'metric-table', 'highlight-box', 'positive', 'negative', 'neutral', 'recommendation-buy', 'recommendation-sell', 'recommendation-hold'.

Return a valid JSON object with these four sections as HTML strings.`
              },
              {
                role: 'user',
                content: `Generate a professional stock valuation report for ${stockData.name} (${stockData.symbol}) with the following data:
- Current Price: $${stockData.price}
- Market Cap: $${stockData.marketCap}
- P/E Ratio: ${stockData.peRatio}
- Trading Amount: $${stockData.amount}

Please provide a comprehensive analysis in ${locale === 'zh' ? 'Chinese' : 'English'}.`
              }
            ],
            temperature: 0.7,
            max_tokens: 4000
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`API Error for ${model}:`, errorText)
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
            
            reportData = JSON.parse(jsonString)
            console.log(`Successfully generated report using ${model}`)
            break
          } catch (parseError) {
            console.error(`Error parsing AI response:`, parseError)
            console.log('Raw content:', content)
            lastError = new Error('Failed to parse AI response')
            continue
          }
        } else {
          lastError = new Error('Invalid response format from AI API')
          continue
        }
      } catch (error) {
        console.error(`Error with model ${model}:`, error)
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