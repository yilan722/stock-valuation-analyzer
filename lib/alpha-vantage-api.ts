import axios from 'axios'
import { StockData } from '../types'

// Alpha Vantage API (免费版本)
const ALPHA_VANTAGE_API_KEY = 'XOLA7URKC0XQJQK2' // 免费API key
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query'

export const fetchAlphaVantageStockData = async (ticker: string): Promise<StockData> => {
  try {
    // 获取股票基本信息
    const response = await axios.get(`${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`)
    
    if (response.data['Global Quote']) {
      const quote = response.data['Global Quote']
      
      // 获取公司信息
      const overviewResponse = await axios.get(`${ALPHA_VANTAGE_BASE_URL}?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`)
      
      let companyName = ticker
      let marketCap = 0
      let peRatio = 0
      
      if (overviewResponse.data && overviewResponse.data.Name) {
        const overview = overviewResponse.data
        companyName = overview.Name
        marketCap = parseFloat(overview.MarketCapitalization) || 0
        peRatio = parseFloat(overview.PERatio) || 0
      }
      
      // 检查必要的数据
      if (!marketCap || marketCap === 0) {
        throw new Error('Market cap data not available from Alpha Vantage API')
      }
      
      if (!peRatio || peRatio === 0) {
        throw new Error('P/E ratio data not available from Alpha Vantage API')
      }
      
      const volume = parseInt(quote['06. volume']) || 0
      if (!volume || volume === 0) {
        throw new Error('Volume data not available from Alpha Vantage API')
      }
      
      const currentPrice = parseFloat(quote['05. price'])
      const previousClose = parseFloat(quote['08. previous close'])
      const change = parseFloat(quote['09. change'])
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''))
      
      return {
        symbol: ticker,
        name: companyName,
        price: currentPrice,
        marketCap: marketCap,
        peRatio: peRatio,
        volume: volume,
        change: change,
        changePercent: changePercent
      }
    }
    
    throw new Error('No data found')
  } catch (error) {
    console.error('Error fetching Alpha Vantage data:', error)
    throw error
  }
} 