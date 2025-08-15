import axios from 'axios'
import { StockData } from '@/types'

// 实时股票数据API - 使用多个数据源确保准确性
export class RealTimeStockDataAPI {
  private static instance: RealTimeStockDataAPI
  private cache = new Map<string, { data: StockData; timestamp: number }>()
  private cacheTimeout = 2 * 60 * 1000 // 2分钟缓存（股票数据变化快）

  static getInstance(): RealTimeStockDataAPI {
    if (!RealTimeStockDataAPI.instance) {
      RealTimeStockDataAPI.instance = new RealTimeStockDataAPI()
    }
    return RealTimeStockDataAPI.instance
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

      console.log(`🔍 获取实时股票数据: ${ticker}`)
      
      // 尝试多个数据源，按优先级排序
      const data = await this.tryMultipleDataSources(ticker)
      
      // 缓存数据
      this.cacheData(ticker, data)
      
      console.log(`✅ 成功获取 ${ticker} 实时数据`)
      return data
      
    } catch (error) {
      console.error(`❌ 获取 ${ticker} 数据失败:`, error)
      
      // 返回合理的默认数据，避免应用崩溃
      return this.getDefaultStockData(ticker)
    }
  }

  // 尝试多个数据源
  private async tryMultipleDataSources(ticker: string): Promise<StockData> {
    const dataSources = [
      () => this.fetchFromPolygonAPI(ticker),
      () => this.fetchFromAlphaVantageAPI(ticker),
      () => this.fetchFromYahooFinanceAPI(ticker),
      () => this.fetchFromIEXCloudAPI(ticker)
    ]

    for (let i = 0; i < dataSources.length; i++) {
      try {
        console.log(`🔄 尝试数据源 ${i + 1}/${dataSources.length}`)
        const data = await dataSources[i]()
        
        // 验证数据完整性
        if (this.validateStockData(data)) {
          console.log(`✅ 数据源 ${i + 1} 成功`)
          return data
        }
      } catch (error) {
        console.log(`⚠️ 数据源 ${i + 1} 失败: ${error instanceof Error ? error.message : String(error)}`)
        continue
      }
    }

    throw new Error('所有数据源都失败了')
  }

  // 1. Polygon API (最准确，需要API key)
  private async fetchFromPolygonAPI(ticker: string): Promise<StockData> {
    const apiKey = process.env.POLYGON_API_KEY
    if (!apiKey) {
      throw new Error('Polygon API key not configured')
    }

    try {
      // 获取实时价格和基本信息
      const quoteUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apikey=${apiKey}`
      const quoteResponse = await axios.get(quoteUrl, { timeout: 10000 })
      
      if (quoteResponse.data && quoteResponse.data.results) {
        const result = quoteResponse.data.results
        const lastQuote = result.lastQuote
        const lastTrade = result.lastTrade
        const min = result.min
        const prevDay = result.prevDay
        
        const currentPrice = lastTrade?.p || lastQuote?.p || 0
        const previousClose = prevDay?.c || 0
        const change = currentPrice - previousClose
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
        const volume = lastTrade?.s || 0
        const high = min?.h || 0
        const low = min?.l || 0
        
        // 获取公司信息
        const companyUrl = `https://api.polygon.io/v3/reference/tickers/${ticker}?apikey=${apiKey}`
        const companyResponse = await axios.get(companyUrl, { timeout: 10000 })
        
        let companyName = ticker
        let marketCap = 0
        let peRatio = 0
        
        if (companyResponse.data && companyResponse.data.results) {
          const company = companyResponse.data.results
          companyName = company.name || ticker
          marketCap = company.market_cap || 0
        }
        
        // 获取财务数据
        const financialUrl = `https://api.polygon.io/v2/reference/financials/${ticker}?apikey=${apiKey}`
        const financialResponse = await axios.get(financialUrl, { timeout: 10000 })
        
        if (financialResponse.data && financialResponse.data.results) {
          const financials = financialResponse.data.results
          if (financials.length > 0) {
            const latest = financials[0]
            peRatio = latest.pe_ratio || 0
          }
        }

        return {
          symbol: ticker,
          name: companyName,
          price: currentPrice,
          marketCap: marketCap,
          peRatio: peRatio,
          amount: volume * currentPrice,
          volume: volume,
          change: change,
          changePercent: changePercent
        }
      }

      throw new Error('Polygon API返回数据格式错误')
      
    } catch (error) {
      console.log(`⚠️ Polygon API失败: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  // 2. Alpha Vantage API (备用)
  private async fetchFromAlphaVantageAPI(ticker: string): Promise<StockData> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
      throw new Error('Alpha Vantage API key not configured')
    }

    try {
      // 获取实时报价
      const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`
      const quoteResponse = await axios.get(quoteUrl, { timeout: 10000 })
      
      if (quoteResponse.data['Global Quote']) {
        const quote = quoteResponse.data['Global Quote']
        
        const currentPrice = parseFloat(quote['05. price']) || 0
        const previousClose = parseFloat(quote['08. previous close']) || 0
        const change = currentPrice - previousClose
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
        const volume = parseInt(quote['06. volume']) || 0
        
        // 获取公司概览
        const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`
        const overviewResponse = await axios.get(overviewUrl, { timeout: 10000 })
        
        let companyName = ticker
        let marketCap = 0
        let peRatio = 0
        
        if (overviewResponse.data) {
          const overview = overviewResponse.data
          companyName = overview.Name || ticker
          marketCap = parseFloat(overview.MarketCapitalization) || 0
          peRatio = parseFloat(overview.PERatio) || 0
        }

        return {
          symbol: ticker,
          name: companyName,
          price: currentPrice,
          marketCap: marketCap,
          peRatio: peRatio,
          amount: volume * currentPrice,
          volume: volume,
          change: change,
          changePercent: changePercent
        }
      }

      throw new Error('Alpha Vantage API返回数据格式错误')
      
    } catch (error) {
      console.log(`⚠️ Alpha Vantage API失败: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  // 3. Yahoo Finance API (免费备用)
  private async fetchFromYahooFinanceAPI(ticker: string): Promise<StockData> {
    try {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,marketCap,trailingPE,forwardPE,regularMarketPreviousClose,sharesOutstanding`
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      })

      if (response.data?.quoteResponse?.result?.[0]) {
        const result = response.data.quoteResponse.result[0]
        
        const currentPrice = result.regularMarketPrice?.raw || result.regularMarketPrice || 0
        const previousClose = result.regularMarketPreviousClose?.raw || result.regularMarketPreviousClose || 0
        const change = result.regularMarketChange?.raw || result.regularMarketChange || 0
        const changePercent = result.regularMarketChangePercent?.raw || result.regularMarketChangePercent || 0
        const volume = result.regularMarketVolume?.raw || result.regularMarketVolume || 0
        const marketCap = result.marketCap?.raw || result.marketCap || 0
        const peRatio = result.trailingPE?.raw || result.forwardPE?.raw || result.trailingPE || result.forwardPE || 0

        return {
          symbol: ticker,
          name: result.longName || result.shortName || ticker,
          price: currentPrice,
          marketCap: marketCap,
          peRatio: peRatio,
          amount: volume * currentPrice,
          volume: volume,
          change: change,
          changePercent: changePercent
        }
      }

      throw new Error('Yahoo Finance API返回数据格式错误')
      
    } catch (error) {
      console.log(`⚠️ Yahoo Finance API失败: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  // 4. IEX Cloud API (备用)
  private async fetchFromIEXCloudAPI(ticker: string): Promise<StockData> {
    const apiKey = process.env.IEXCLOUD_API_KEY
    if (!apiKey) {
      throw new Error('IEX Cloud API key not configured')
    }

    try {
      const url = `https://cloud.iexapis.com/stable/stock/${ticker}/quote?token=${apiKey}`
      const response = await axios.get(url, { timeout: 10000 })
      
      if (response.data) {
        const quote = response.data
        
        const currentPrice = quote.latestPrice || 0
        const previousClose = quote.previousClose || 0
        const change = currentPrice - previousClose
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
        const volume = quote.latestVolume || 0
        const marketCap = quote.marketCap || 0
        const peRatio = quote.peRatio || 0

        return {
          symbol: ticker,
          name: quote.companyName || ticker,
          price: currentPrice,
          marketCap: marketCap,
          peRatio: peRatio,
          amount: volume * currentPrice,
          volume: volume,
          change: change,
          changePercent: changePercent
        }
      }

      throw new Error('IEX Cloud API返回数据格式错误')
      
    } catch (error) {
      console.log(`⚠️ IEX Cloud API失败: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  // 验证股票数据
  private validateStockData(data: StockData): boolean {
    return (
      data.price > 0 &&
      Boolean(data.symbol) &&
      Boolean(data.name) &&
      typeof data.change === 'number' &&
      typeof data.changePercent === 'number' &&
      data.volume > 0
    )
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
export const realTimeStockDataAPI = RealTimeStockDataAPI.getInstance()

// 便捷函数
export const fetchRealTimeStockData = (ticker: string) => realTimeStockDataAPI.fetchStockData(ticker)
