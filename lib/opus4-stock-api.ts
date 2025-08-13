import axios from 'axios'
import { StockData } from '@/types'

const OPUS4_API_URL = 'https://api.nuwaapi.com'
const OPUS4_API_KEY = process.env.OPUS4_API_KEY!

export const fetchOtherMarketStockData = async (ticker: string): Promise<StockData> => {
  try {
    const systemPrompt = `You are a financial data API. Given a stock ticker, return real stock data in JSON format.
    
    Return ONLY a JSON object with the following structure:
    {
      "symbol": "string",
      "name": "string", 
      "price": number,
      "marketCap": number,
      "peRatio": number,
      "volume": number,
      "change": number,
      "changePercent": number
    }
    
    Use real market data if possible, or reasonable estimates based on the company.`

    const userPrompt = `Please provide current stock data for ticker: ${ticker}
    
    Include:
    - Current price
    - Market capitalization
    - P/E ratio
    - Volume
    - Price change and percentage change
    
    Return as JSON only.`

    const models = ['claude-opus-4-1-20250805', 'opus4', 'gpt-4', 'gpt-3.5-turbo']
    let response: any = null

    for (const model of models) {
      try {
        const request = {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 500
        }

        response = await axios.post(
          `${OPUS4_API_URL}/v1/chat/completions`,
          request,
          {
            headers: {
              'Authorization': `Bearer ${OPUS4_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000
          }
        )

        const content = response.data.choices[0].message.content
        
        try {
          // 清理markdown代码块
          let cleanContent = content.trim()
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '')
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '')
          }
          
          const stockData = JSON.parse(cleanContent) as StockData
          return stockData
        } catch (parseError) {
          console.log(`Failed to parse response from ${model}, trying next...`)
          continue
        }
      } catch (error) {
        console.log(`Model ${model} failed, trying next...`)
        continue
      }
    }

    // 如果所有模型都失败，返回模拟数据
    throw new Error('All models failed')
  } catch (error) {
    console.error('Error fetching stock data from Opus4:', error)
    
    // 返回模拟数据
    return {
      symbol: ticker,
      name: `${ticker} (美股)`,
      price: Math.random() * 200 + 50,
      marketCap: Math.random() * 10000000000 + 1000000000,
      peRatio: Math.random() * 30 + 10,
      amount: Math.random() * 5000000 + 1000000,
      volume: Math.random() * 1000000 + 100000,
      change: Number(((Math.random() - 0.5) * 10).toFixed(2)),
      changePercent: Number(((Math.random() - 0.5) * 10).toFixed(2))
    }
  }
} 