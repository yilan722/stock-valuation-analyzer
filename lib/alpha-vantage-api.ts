import axios from 'axios'
import { StockData } from '../types'

// Alpha Vantage API
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query'

if (!ALPHA_VANTAGE_API_KEY) {
  throw new Error('Missing Alpha Vantage API key. Please set ALPHA_VANTAGE_API_KEY environment variable.')
}

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
      
      // 使用更宽松的数据验证，当数据不可用时使用默认值
      if (!marketCap || marketCap === 0) {
        console.log(`Market cap not available for ${ticker}, using default value`)
        marketCap = 1000000000 // 默认10亿美元市值
      }
      
      if (!peRatio || peRatio === 0) {
        console.log(`P/E ratio not available for ${ticker}, using default value`)
        peRatio = 15.0 // 默认15倍P/E
      }
      
      const volume = parseInt(quote['06. volume']) || 0
      const currentPrice = parseFloat(quote['05. price'])
      
      // 计算成交额：成交量 * 当前价格
      let amount = volume * currentPrice
      
      if (!amount || amount === 0) {
        console.log(`Amount data not available for ${ticker}, using default value`)
        // 使用一个合理的默认成交额
        amount = 1000000 // 默认100万美元成交额
      }
      
      const previousClose = parseFloat(quote['08. previous close']) || 0
      const change = parseFloat(quote['09. change']) || 0
      const changePercent = quote['10. change percent'] ? parseFloat(quote['10. change percent'].replace('%', '')) : 0
      
      return {
        symbol: ticker,
        name: companyName,
        price: currentPrice,
        marketCap: marketCap,
        peRatio: peRatio,
        amount: amount, // 成交额（美元）
        volume: volume, // 成交量
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