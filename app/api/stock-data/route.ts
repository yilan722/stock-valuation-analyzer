import { NextRequest, NextResponse } from 'next/server'
import { StockData } from '@/types'

// 模拟股票数据 - 包含美股和A股
const mockStockData: Record<string, StockData> = {
  // 美股
  'AAPL': {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    marketCap: 2750000000000,
    peRatio: 28.5,
    amount: 45000000,
    volume: 250000000,
    change: 2.15,
    changePercent: 1.24,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  'MSFT': {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 338.11,
    marketCap: 2510000000000,
    peRatio: 32.1,
    amount: 22000000,
    volume: 65000000,
    change: -1.23,
    changePercent: -0.36,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  'GOOGL': {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    marketCap: 1790000000000,
    peRatio: 25.8,
    amount: 18000000,
    volume: 18000000,
    change: 0.87,
    changePercent: 0.61,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  'AMZN': {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 145.24,
    marketCap: 1510000000000,
    peRatio: 45.2,
    amount: 35000000,
    volume: 35000000,
    change: 3.45,
    changePercent: 2.43,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  'TSLA': {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.50,
    marketCap: 789000000000,
    peRatio: 78.9,
    amount: 55000000,
    volume: 55000000,
    change: -5.20,
    changePercent: -2.05,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  // A股
  '000001': {
    symbol: '000001',
    name: '平安银行',
    price: 12.85,
    marketCap: 248000000000,
    peRatio: 8.5,
    amount: 125000000,
    volume: 125000000,
    change: 0.15,
    changePercent: 1.18,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  '000002': {
    symbol: '000002',
    name: '万科A',
    price: 18.32,
    marketCap: 203000000000,
    peRatio: 12.3,
    amount: 89000000,
    volume: 89000000,
    change: -0.28,
    changePercent: -1.51,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  '600036': {
    symbol: '600036',
    name: '招商银行',
    price: 35.67,
    marketCap: 901000000000,
    peRatio: 9.8,
    amount: 45000000,
    volume: 45000000,
    change: 0.67,
    changePercent: 1.91,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  '600519': {
    symbol: '600519',
    name: '贵州茅台',
    price: 1689.00,
    marketCap: 2120000000000,
    peRatio: 32.5,
    amount: 2800000,
    volume: 2800000,
    change: 25.00,
    changePercent: 1.50,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  '000858': {
    symbol: '000858',
    name: '五粮液',
    price: 156.80,
    marketCap: 609000000000,
    peRatio: 28.7,
    amount: 8500000,
    volume: 8500000,
    change: 2.80,
    changePercent: 1.82,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  '002415': {
    symbol: '002415',
    name: '海康威视',
    price: 32.45,
    marketCap: 304000000000,
    peRatio: 18.9,
    amount: 15000000,
    volume: 15000000,
    change: -0.55,
    changePercent: -1.67,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  '300059': {
    symbol: '300059',
    name: '东方财富',
    price: 18.45,
    marketCap: 285000000000,
    peRatio: 25.3,
    amount: 35000000,
    volume: 35000000,
    change: 0.45,
    changePercent: 2.50,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  '300366': {
    symbol: '300366',
    name: '创意信息',
    price: 8.45,
    marketCap: 45000000000,
    peRatio: 35.2,
    amount: 25000000,
    volume: 25000000,
    change: 0.15,
    changePercent: 1.81,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  '688133': {
    symbol: '688133',
    name: '泰坦科技',
    price: 45.67,
    marketCap: 18500000000,
    peRatio: 45.2,
    amount: 850000,
    volume: 850000,
    change: 1.67,
    changePercent: 3.80,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')?.toUpperCase()

  if (!ticker) {
    return NextResponse.json(
      { error: 'Ticker parameter is required' },
      { status: 400 }
    )
  }

  // 判断是A股还是其他市场
  const isAStock = /^[0-9]{6}$/.test(ticker) || ticker.startsWith('688') || ticker.startsWith('300')
  
  try {
    if (isAStock) {
      // 使用Tushare API获取A股数据
      try {
        const { fetchAStockData } = await import('@/lib/tushare-api')
        const aStockData = await fetchAStockData(ticker)
        return NextResponse.json(aStockData)
      } catch (aStockError) {
        console.error(`Tushare API failed for ${ticker}:`, aStockError)
        return NextResponse.json(
          { error: `A股 ${ticker} 数据获取失败，可能是停牌或数据源暂时不可用。请稍后重试。` },
          { status: 500 }
        )
      }
    } else {
      // 使用Alpha Vantage API获取美股数据
      try {
        const { fetchAlphaVantageStockData } = await import('@/lib/alpha-vantage-api')
        const alphaVantageData = await fetchAlphaVantageStockData(ticker)
        return NextResponse.json(alphaVantageData)
      } catch (alphaVantageError) {
        console.error(`Alpha Vantage API failed for ${ticker}:`, alphaVantageError)
        
        // 尝试使用Opus4 API作为备选
        try {
          const { fetchOtherMarketStockData } = await import('@/lib/opus4-stock-api')
          const opus4Data = await fetchOtherMarketStockData(ticker)
          return NextResponse.json(opus4Data)
        } catch (opus4Error) {
          console.error(`Opus4 API also failed for ${ticker}:`, opus4Error)
          return NextResponse.json(
            { error: `美股 ${ticker} 数据获取失败。可能原因：1) 股票代码不存在 2) 股票已退市 3) 数据源暂时不可用。请检查股票代码或稍后重试。` },
            { status: 500 }
          )
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error in stock data API:', error)
    return NextResponse.json(
      { error: `获取 ${ticker} 数据时发生未知错误，请稍后重试。` },
      { status: 500 }
    )
  }
} 