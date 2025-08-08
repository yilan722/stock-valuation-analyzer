import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { Opus4Request, Opus4Response, ValuationReportData } from '../../../types'

const OPUS4_API_URL = process.env.OPUS4_API_URL || 'https://api.nuwaapi.com'
const OPUS4_API_KEY = process.env.OPUS4_API_KEY || 'sk-GNBf5QFmnepeBZddwH612o5vEJQFMq6z8gUAyre7tAIrGeA8'

export async function POST(request: NextRequest) {
  try {
    const { stockData, financialData } = await request.json()

    const systemPrompt = `You are a professional financial analyst specializing in stock valuation. 
    Your task is to generate a comprehensive valuation report for a company based on the provided data.
    
    The report should include:
    1. Basic company information and market metrics
    2. Business segment analysis with revenue breakdown
    3. Growth catalysts and opportunities
    4. Detailed valuation analysis using multiple methods (DCF, P/E, P/B ratios)
    
    Provide specific, data-driven insights without generic statements. Include actual numbers and percentages where possible.`

    const userPrompt = `Please analyze the following stock data and generate a professional valuation report:
    
    Stock Symbol: ${stockData.symbol}
    Company Name: ${stockData.name}
    Current Price: $${stockData.price}
    Market Cap: $${stockData.marketCap.toLocaleString()}
    P/E Ratio: ${stockData.peRatio}
    
    Financial Data: ${JSON.stringify(financialData, null, 2)}
    
    Please provide a structured analysis with:
    1. Company overview and market position
    2. Business segment breakdown with revenue and growth metrics
    3. Key growth catalysts and opportunities
    4. Valuation analysis with target price and recommendation
    5. Supporting data tables and metrics
    
    Format the response as a JSON object with the following structure:
    {
      "basicInfo": {
        "companyName": "string",
        "ticker": "string", 
        "currentPrice": number,
        "marketCap": number,
        "peRatio": number,
        "description": "string"
      },
      "businessSegments": [
        {
          "name": "string",
          "revenue": number,
          "growth": number,
          "margin": number
        }
      ],
      "growthCatalysts": ["string"],
      "valuation": {
        "dcfValue": number,
        "peBasedValue": number,
        "pbBasedValue": number,
        "targetPrice": number,
        "recommendation": "BUY|HOLD|SELL",
        "reasoning": "string"
      }
    }`

    // 尝试使用不同的模型
    const models = ['claude-opus-4-20250514', 'opus4', 'gpt-4', 'gpt-3.5-turbo']
    let response: any = null
    let content = ''

    for (const model of models) {
      try {
        const opus4Request: Opus4Request = {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 4000
        }

        response = await axios.post<Opus4Response>(
          `${OPUS4_API_URL}/v1/chat/completions`,
          opus4Request,
          {
            headers: {
              'Authorization': `Bearer ${OPUS4_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000
          }
        )

        content = response.data.choices[0].message.content
        break
      } catch (error) {
        console.log(`Model ${model} failed, trying next...`)
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
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate valuation report' },
      { status: 500 }
    )
  }
} 