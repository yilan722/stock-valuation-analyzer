import axios from 'axios'
import { StockData } from '../types'

// 稳定的Yahoo Finance API实现
export class StableYahooFinanceAPI {
  private static instance: StableYahooFinanceAPI
  private retryCount = 0
  private maxRetries = 3
  private cache = new Map<string, { data: StockData; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5分钟缓存

  static getInstance(): StableYahooFinanceAPI {
    if (!StableYahooFinanceAPI.instance) {
      StableYahooFinanceAPI.instance = new StableYahooFinanceAPI()
    }
    return StableYahooFinanceAPI.instance
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

      console.log(`🔍 获取股票数据: ${ticker}`)
      
      // 添加延迟，避免请求过于频繁
      await this.delay(1000)
      
      // 尝试多个数据源，按优先级排序
      const data = await this.tryMultipleDataSources(ticker)
      
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

  // 尝试多个数据源
  private async tryMultipleDataSources(ticker: string): Promise<StockData> {
    const dataSources = [
      () => this.fetchFromYahooQuoteAPI(ticker),
      () => this.fetchFromYahooChartAPI(ticker),
      () => this.fetchFromYahooSummaryAPI(ticker),
      () => this.fetchFromYahooSearchAPI(ticker)
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
        console.log(`⚠️ 数据源 ${i + 1} 失败:`, error instanceof Error ? error.message : String(error))
        continue
      }
    }

    throw new Error('所有数据源都失败了')
  }

  // 1. Yahoo Finance Quote API (最稳定)
  private async fetchFromYahooQuoteAPI(ticker: string): Promise<StockData> {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,marketCap,trailingPE,forwardPE,regularMarketPreviousClose,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,sharesOutstanding`
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (response.data?.quoteResponse?.result?.[0]) {
      const result = response.data.quoteResponse.result[0]
      
      const currentPrice = result.regularMarketPrice?.raw || result.regularMarketPrice || 0
      const previousClose = result.regularMarketPreviousClose?.raw || result.regularMarketPreviousClose || 0
      const change = result.regularMarketChange?.raw || result.regularMarketChange || 0
      const changePercent = result.regularMarketChangePercent?.raw || result.regularMarketChangePercent || 0
      const volume = result.regularMarketVolume?.raw || result.regularMarketVolume || 0
      
      // 获取市值 - 优先使用API返回的市值，如果没有则计算
      let marketCap = result.marketCap?.raw || result.marketCap || 0
      if (!marketCap && result.sharesOutstanding?.raw && currentPrice) {
        marketCap = result.sharesOutstanding.raw * currentPrice
      }
      
      // 获取P/E比率 - 优先使用trailingPE，如果没有则使用forwardPE
      let peRatio = result.trailingPE?.raw || result.forwardPE?.raw || result.trailingPE || result.forwardPE || 0

      console.log(`📊 ${ticker} 原始数据:`, {
        marketCap: result.marketCap,
        trailingPE: result.trailingPE,
        forwardPE: result.forwardPE,
        sharesOutstanding: result.sharesOutstanding
      })

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

    throw new Error('Quote API返回数据格式错误')
  }

  // 2. Yahoo Finance Chart API (备用)
  private async fetchFromYahooChartAPI(ticker: string): Promise<StockData> {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d&includePrePost=false&includeAdjustedClose=true`
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (response.data?.chart?.result?.[0]) {
      const result = response.data.chart.result[0]
      const meta = result.meta
      const quote = result.indicators.quote[0]
      
      const currentPrice = meta.regularMarketPrice || 0
      const previousClose = meta.previousClose || 0
      const change = currentPrice - previousClose
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
      const volume = quote.volume ? quote.volume[quote.volume.length - 1] : 0
      
      // 获取市值和P/E比率
      let marketCap = meta.marketCap || 0
      let peRatio = meta.trailingPE || meta.forwardPE || 0
      
      // 如果Chart API没有市值，尝试从Summary API获取
      if (!marketCap || !peRatio) {
        try {
          const summaryData = await this.fetchFromYahooSummaryAPI(ticker)
          if (summaryData.marketCap > 0) marketCap = summaryData.marketCap
          if (summaryData.peRatio > 0) peRatio = summaryData.peRatio
        } catch (summaryError) {
          console.log(`⚠️ 无法从Summary API获取补充数据: ${summaryError instanceof Error ? summaryError.message : String(summaryError)}`)
        }
      }

      console.log(`📊 ${ticker} Chart API数据:`, {
        marketCap: meta.marketCap,
        trailingPE: meta.trailingPE,
        forwardPE: meta.forwardPE,
        currentPrice,
        volume
      })

      return {
        symbol: ticker,
        name: meta.symbol || ticker,
        price: currentPrice,
        marketCap: marketCap,
        peRatio: peRatio,
        amount: volume * currentPrice,
        volume: volume,
        change: change,
        changePercent: changePercent
      }
    }

    throw new Error('Chart API返回数据格式错误')
  }

  // 3. Yahoo Finance Summary API (详细数据)
  private async fetchFromYahooSummaryAPI(ticker: string): Promise<StockData> {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail,financialData,defaultKeyStatistics`
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (response.data?.quoteSummary?.result?.[0]) {
      const result = response.data.quoteSummary.result[0]
      const summaryDetail = result.summaryDetail
      const financialData = result.financialData
      
      const currentPrice = summaryDetail.regularMarketPrice || summaryDetail.previousClose || 0
      const previousClose = summaryDetail.previousClose || 0
      const change = currentPrice - previousClose
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
      const volume = summaryDetail.volume || 0
      const marketCap = summaryDetail.marketCap || 0
      const peRatio = financialData?.forwardPE || financialData?.trailingPE || 0

      return {
        symbol: ticker,
        name: ticker,
        price: currentPrice,
        marketCap: marketCap,
        peRatio: peRatio,
        amount: volume * currentPrice,
        volume: volume,
        change: change,
        changePercent: changePercent
      }
    }

    throw new Error('Summary API返回数据格式错误')
  }

  // 4. Yahoo Finance Search API (最后备用)
  private async fetchFromYahooSearchAPI(ticker: string): Promise<StockData> {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${ticker}&quotesCount=1&newsCount=0`
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (response.data?.quotes?.[0]) {
      const quote = response.data.quotes[0]
      
      // 搜索API通常只有基本信息，需要结合其他API
      const currentPrice = quote.regularMarketPrice || 0
      const previousClose = quote.regularMarketPreviousClose || 0
      const change = currentPrice - previousClose
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

      return {
        symbol: ticker,
        name: quote.longName || quote.shortName || ticker,
        price: currentPrice,
        marketCap: 0, // 搜索API没有市值
        peRatio: 0,   // 搜索API没有P/E
        amount: 0,    // 搜索API没有成交量
        volume: 0,
        change: change,
        changePercent: changePercent
      }
    }

    throw new Error('Search API返回数据格式错误')
  }

  // 验证股票数据
  private validateStockData(data: StockData): boolean {
    return (
      data.price > 0 &&
      Boolean(data.symbol) &&
      Boolean(data.name) &&
      typeof data.change === 'number' &&
      typeof data.changePercent === 'number'
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

  // 获取默认股票数据（当所有API都失败时）
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

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 导出单例实例
export const stableYahooFinanceAPI = StableYahooFinanceAPI.getInstance()

// 便捷函数
export const fetchStockData = (ticker: string) => stableYahooFinanceAPI.fetchStockData(ticker)
