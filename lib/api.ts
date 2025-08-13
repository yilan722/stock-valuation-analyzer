import axios from 'axios'
import { Opus4Request, Opus4Response, StockData, ValuationReportData } from '@/types'

const OPUS4_API_URL = 'https://api.nuwaapi.com'
const OPUS4_API_KEY = process.env.OPUS4_API_KEY!

// 创建axios实例
const opus4Api = axios.create({
  baseURL: OPUS4_API_URL,
  headers: {
    'Authorization': `Bearer ${OPUS4_API_KEY}`,
    'Content-Type': 'application/json',
  },
})

export const generateValuationReport = async (
  stockData: StockData,
  financialData: any
): Promise<ValuationReportData> => {
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

  try {
    const request: Opus4Request = {
      model: 'opus4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000
    }

    const response = await opus4Api.post<Opus4Response>('/v1/chat/completions', request)
    
    const content = response.data.choices[0].message.content
    const reportData = JSON.parse(content) as ValuationReportData
    
    return reportData
  } catch (error) {
    console.error('Error calling Opus4 API:', error)
    throw new Error('Failed to generate valuation report')
  }
}

export const fetchStockData = async (ticker: string): Promise<StockData> => {
  // 这里可以集成真实的股票数据API
  // 目前使用模拟数据
  return {
    symbol: ticker.toUpperCase(),
    name: `${ticker.toUpperCase()} Company Inc.`,
    price: Math.random() * 200 + 50,
    marketCap: Math.random() * 10000000000 + 1000000000,
    peRatio: Math.random() * 30 + 10,
    amount: Math.random() * 5000000 + 1000000,
    volume: Math.random() * 10000000 + 1000000,
    change: Number(((Math.random() - 0.5) * 10).toFixed(2)),
    changePercent: Number(((Math.random() - 0.5) * 10).toFixed(2)),
    // Data source: Generated mock data
    // Last updated: ${new Date().toISOString().split('T')[0]}
  }
} 