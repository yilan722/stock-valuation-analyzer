import { StockData } from '@/types'

// 模拟实时数据API
export const fetchRealTimeStockData = async (ticker: string): Promise<StockData> => {
  // 这里可以集成真实的股票数据API，如：
  // - Alpha Vantage API
  // - Yahoo Finance API
  // - 东方财富API (A股)
  // - 新浪财经API
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 根据股票代码判断是美股还是A股
    const isAStock = /^[0-9]{6}$/.test(ticker) || ticker.startsWith('688') || ticker.startsWith('300')
    
    if (isAStock) {
      // A股数据
      return {
        symbol: ticker,
        name: `${ticker} (A股)`,
        price: Math.random() * 100 + 10,
        marketCap: Math.random() * 100000000000 + 10000000000,
        peRatio: Math.random() * 50 + 5,
        amount: Math.random() * 100000000 + 10000000,
        change: (Math.random() - 0.5) * 5,
        changePercent: (Math.random() - 0.5) * 10
      }
    } else {
      // 美股数据
      return {
        symbol: ticker,
        name: `${ticker} (美股)`,
        price: Math.random() * 200 + 50,
        marketCap: Math.random() * 10000000000 + 1000000000,
        peRatio: Math.random() * 30 + 10,
        amount: Math.random() * 5000000 + 1000000,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 10
      }
    }
  } catch (error) {
    console.error('Error fetching real-time data:', error)
    throw new Error('Failed to fetch real-time stock data')
  }
}

// 获取股票市场信息
export const getMarketInfo = (ticker: string) => {
  if (/^[0-9]{6}$/.test(ticker) || ticker.startsWith('688') || ticker.startsWith('300')) {
    return {
      market: 'A股',
      exchange: ticker.startsWith('688') ? '科创板' : ticker.startsWith('300') ? '创业板' : '主板',
      currency: 'CNY'
    }
  } else {
    return {
      market: '美股',
      exchange: 'NASDAQ/NYSE',
      currency: 'USD'
    }
  }
} 