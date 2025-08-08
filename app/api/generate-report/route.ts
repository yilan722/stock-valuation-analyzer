import { NextRequest, NextResponse } from 'next/server'
import { StockData, ValuationReportData } from '../../../types'

const OPUS4_API_URL = 'https://api.nuwaapi.com/v1/chat/completions'
const OPUS4_API_KEY = 'sk-GNBf5QFmnepeBZddwH612o5vEJQFMq6z8gUAyre7tAIrGeA8'

export async function POST(request: NextRequest) {
  try {
    const { stockData, locale } = await request.json()

    if (!stockData) {
      return NextResponse.json(
        { error: 'Stock data is required' },
        { status: 400 }
      )
    }

    const isEnglish = locale === 'en'
    
    const prompt = isEnglish ? 
      `Generate a comprehensive stock valuation analysis report for ${stockData.name} (${stockData.symbol}) with the following data:
      
      Current Price: $${stockData.price}
      Market Cap: $${(stockData.marketCap / 1e9).toFixed(2)}B
      P/E Ratio: ${stockData.peRatio}
      Volume: ${(stockData.volume / 1e6).toFixed(2)}M
      Change: ${stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)

      Please provide a detailed analysis in the following JSON format:
      {
        "fundamentalAnalysis": "HTML content with fundamental analysis including company overview, latest financials, and key metrics",
        "businessSegments": "HTML content with business segment analysis and revenue breakdown",
        "growthCatalysts": "HTML content with growth catalysts and future opportunities",
        "valuationAnalysis": "HTML content with detailed valuation methodology and investment recommendation"
      }

      Make the analysis professional, data-driven, and include specific valuation logic. Use proper HTML formatting with tables, lists, and emphasis where appropriate.` :
      
      `为${stockData.name} (${stockData.symbol})生成一份全面的股票估值分析报告，数据如下：
      
      当前价格: $${stockData.price}
      市值: $${(stockData.marketCap / 1e9).toFixed(2)}B
      市盈率: ${stockData.peRatio}
      成交量: ${(stockData.volume / 1e6).toFixed(2)}M
      涨跌幅: ${stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)

      请提供详细分析，使用以下JSON格式：
      {
        "fundamentalAnalysis": "基本面分析的HTML内容，包括公司概况、最新财务数据和关键指标",
        "businessSegments": "业务细分分析的HTML内容，包括收入分解",
        "growthCatalysts": "增长催化剂的HTML内容，包括未来机会",
        "valuationAnalysis": "详细估值方法和投资建议的HTML内容"
      }

      使分析专业、数据驱动，并包含具体的估值逻辑。使用适当的HTML格式，包括表格、列表和重点强调。`

    const models = ['claude-opus-4-20250514', 'opus4', 'gpt-4', 'gpt-3.5-turbo']
    let content: string | null = null

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`)
        
        const response = await fetch(OPUS4_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPUS4_API_KEY}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 4000,
            temperature: 0.7
          })
        })

        if (!response.ok) {
          console.log(`Model ${model} failed with status: ${response.status}`)
          const errorText = await response.text()
          console.log(`Error response: ${errorText}`)
          continue
        }

        const data = await response.json()
        content = data.choices?.[0]?.message?.content

        if (content) {
          console.log(`Successfully generated report using ${model}`)
          break
        }
      } catch (error) {
        console.log(`Error with model ${model}:`, error)
        continue
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate report. All AI models are unavailable.' },
        { status: 500 }
      )
    }

    try {
      // 清理markdown代码块
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '')
      }
      
      const reportData = JSON.parse(cleanContent) as ValuationReportData
      return NextResponse.json(reportData)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw content:', content)
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 