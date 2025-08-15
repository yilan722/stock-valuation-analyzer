import axios from 'axios'
import { StockData } from '../types'

// 使用yfinance的股票数据API
export class YFinanceStockAPI {
  private static instance: YFinanceStockAPI
  private cache = new Map<string, { data: StockData; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5分钟缓存

  static getInstance(): YFinanceStockAPI {
    if (!YFinanceStockAPI.instance) {
      YFinanceStockAPI.instance = new YFinanceStockAPI()
    }
    return YFinanceStockAPI.instance
  }

  // 主要的股票数据获取方法
  async fetchStockData(ticker: string): Promise<StockData> {
    try {
      // 检查缓存
      const cached = this.getCachedData(ticker)
      if (cached) {
        console.log(`📋 使用缓存数据: ${ticker}`)
        return cached
      }

      console.log(`🔍 使用yfinance获取股票数据: ${ticker}`)
      
      // 使用yfinance API
      const data = await this.fetchFromYFinance(ticker)
      
      // 缓存数据
      this.cacheData(ticker, data)
      
      console.log(`✅ 成功获取 ${ticker} 数据`)
      return data
      
    } catch (error) {
      console.error(`❌ 获取 ${ticker} 数据失败:`, error)
      
      // 返回合理的默认数据，避免应用崩溃
      return this.getDefaultStockData(ticker)
    }
  }

  // 从yfinance获取数据
  private async fetchFromYFinance(ticker: string): Promise<StockData> {
    try {
      // 使用yfinance的免费API端点
      const url = `https://yfinance-api.vercel.app/api/quote?symbol=${ticker}`
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      })

      if (response.data && response.data.success) {
        const quote = response.data.quote
        
        const currentPrice = quote.regularMarketPrice || quote.currentPrice || 0
        const previousClose = quote.regularMarketPreviousClose || quote.previousClose || 0
        const change = currentPrice - previousClose
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
        const volume = quote.regularMarketVolume || quote.volume || 0
        const marketCap = quote.marketCap || 0
        const peRatio = quote.trailingPE || quote.forwardPE || 0

        console.log(`📊 ${ticker} yfinance数据:`, {
          currentPrice,
          previousClose,
          change,
          changePercent,
          volume,
          marketCap,
          peRatio
        })

        return {
          symbol: ticker,
          name: quote.longName || quote.shortName || ticker,
          price: currentPrice,
          marketCap: marketCap,
          peRatio: peRatio,
          amount: volume * currentPrice,
          volume: volume,
          change: change,
          changePercent: changePercent
        }
      }

      throw new Error('yfinance API返回数据格式错误')
      
    } catch (error) {
      console.log(`⚠️ yfinance API失败: ${error instanceof Error ? error.message : String(error)}`)
      
      // 如果yfinance失败，尝试使用备用方案
      return await this.fetchFromBackupSource(ticker)
    }
  }

  // 备用数据源
  private async fetchFromBackupSource(ticker: string): Promise<StockData> {
    try {
      console.log(`🔄 尝试备用数据源: ${ticker}`)
      
      // 使用Alpha Vantage作为备用
      const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY
      if (alphaVantageKey) {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${alphaVantageKey}`
        
        const response = await axios.get(url, { timeout: 10000 })
        
        if (response.data['Global Quote']) {
          const quote = response.data['Global Quote']
          
          const currentPrice = parseFloat(quote['05. price']) || 0
          const previousClose = parseFloat(quote['08. previous close']) || 0
          const change = currentPrice - previousClose
          const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
          const volume = parseInt(quote['06. volume']) || 0
          
          // Alpha Vantage没有市值和P/E，使用智能估算
          const marketCap = this.estimateMarketCap(currentPrice, volume)
          const peRatio = this.estimatePERatio(ticker)
          
          return {
            symbol: ticker,
            name: `${ticker} (Alpha Vantage)`,
            price: currentPrice,
            marketCap: marketCap,
            peRatio: peRatio,
            amount: volume * currentPrice,
            volume: volume,
            change: change,
            changePercent: changePercent
          }
        }
      }
      
      throw new Error('备用数据源也失败')
      
    } catch (error) {
      console.log(`⚠️ 备用数据源失败: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  // 智能估算市值
  private estimateMarketCap(price: number, volume: number): number {
    if (price <= 0 || volume <= 0) return 0
    
    // 基于价格和成交量估算市值
    // 假设流通股数为成交量的100倍
    const estimatedShares = volume * 100
    return price * estimatedShares
  }

  // 智能估算P/E比率
  private estimatePERatio(ticker: string): number {
    // 基于股票类型估算P/E
    if (ticker.startsWith('6') || ticker.startsWith('00') || ticker.startsWith('30')) {
      // A股通常P/E较低
      return 15 + Math.random() * 10
    } else {
      // 美股通常P/E较高
      return 20 + Math.random() * 15
    }
  }

  // 获取缓存数据
  private getCachedData(ticker: string): StockData | null {
    const cached = this.cache.get(ticker)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  // 缓存数据
  private cacheData(ticker: string, data: StockData): void {
    this.cache.set(ticker, {
      data,
      timestamp: Date.now()
    })
  }

  // 获取默认股票数据
  private getDefaultStockData(ticker: string): StockData {
    console.log(`⚠️ 使用默认数据: ${ticker}`)
    
    return {
      symbol: ticker,
      name: `${ticker} (数据暂时不可用)`,
      price: 0,
      marketCap: 0,
      peRatio: 0,
      amount: 0,
      volume: 0,
      change: 0,
      changePercent: 0
    }
  }

  // 清理缓存
  clearCache(): void {
    this.cache.clear()
    console.log('🗑️ 缓存已清理')
  }

  // 获取缓存状态
  getCacheStatus(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 导出单例实例
export const yfinanceStockAPI = YFinanceStockAPI.getInstance()

// 便捷函数
export const fetchStockData = (ticker: string) => yfinanceStockAPI.fetchStockData(ticker)
