import axios from 'axios'
import { StockData } from '../types'

// Yahoo Finance API (免费) - 使用更完整的端点
export const fetchYahooStockData = async (ticker: string): Promise<StockData> => {
  try {
    // 使用更完整的Yahoo Finance端点
    const response = await axios.get(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail,financialData,defaultKeyStatistics`)
    
    if (response.data.quoteSummary && response.data.quoteSummary.result && response.data.quoteSummary.result[0]) {
      const result = response.data.quoteSummary.result[0]
      const summaryDetail = result.summaryDetail
      const financialData = result.financialData
      const defaultKeyStatistics = result.defaultKeyStatistics
      
      // 获取基本信息
      const price = summaryDetail.previousClose || 0
      const currentPrice = summaryDetail.regularMarketPrice || price
      const marketCap = summaryDetail.marketCap || 0
      const volume = summaryDetail.volume || 0
      const peRatio = financialData?.forwardPE || financialData?.trailingPE || 0
      
      // 检查必要的数据
      if (!marketCap || marketCap === 0) {
        throw new Error('Market cap data not available from Yahoo Finance API')
      }
      
      if (!peRatio || peRatio === 0) {
        throw new Error('P/E ratio data not available from Yahoo Finance API')
      }
      
      if (!volume || volume === 0) {
        throw new Error('Volume data not available from Yahoo Finance API')
      }
      
      return {
        symbol: ticker,
        name: ticker,
        price: currentPrice,
        marketCap: marketCap,
        peRatio: peRatio,
        amount: volume,
        volume: volume,
        change: currentPrice - price,
        changePercent: ((currentPrice - price) / price) * 100
      }
    }
    
    throw new Error('No data found')
  } catch (error) {
    console.error('Error fetching Yahoo Finance data:', error)
    throw error
  }
}

// Alpha Vantage API (需要API key)
export const fetchAlphaVantageData = async (ticker: string, apiKey: string): Promise<StockData> => {
  try {
    const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`)
    
    if (response.data['Global Quote']) {
      const quote = response.data['Global Quote']
      
      return {
        symbol: ticker,
        name: ticker,
        price: parseFloat(quote['05. price']),
        marketCap: parseFloat(quote['07. market cap']) || 0,
        peRatio: parseFloat(quote['09. price to earnings ratio']) || 0,
        amount: parseInt(quote['06. volume']),
        volume: parseInt(quote['06. volume']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
      }
    }
    
    throw new Error('No data found')
  } catch (error) {
    console.error('Error fetching Alpha Vantage data:', error)
    throw error
  }
} 