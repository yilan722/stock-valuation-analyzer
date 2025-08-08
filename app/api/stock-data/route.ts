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
    volume: 45000000,
    change: 2.15,
    changePercent: 1.24
  },
  'MSFT': {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 338.11,
    marketCap: 2510000000000,
    peRatio: 32.1,
    volume: 22000000,
    change: -1.23,
    changePercent: -0.36
  },
  'GOOGL': {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    marketCap: 1790000000000,
    peRatio: 25.8,
    volume: 18000000,
    change: 0.87,
    changePercent: 0.61
  },
  'AMZN': {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 145.24,
    marketCap: 1510000000000,
    peRatio: 45.2,
    volume: 35000000,
    change: 3.45,
    changePercent: 2.43
  },
  'TSLA': {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.50,
    marketCap: 789000000000,
    peRatio: 78.9,
    volume: 55000000,
    change: -5.20,
    changePercent: -2.05
  },
  // A股
  '000001': {
    symbol: '000001',
    name: '平安银行',
    price: 12.85,
    marketCap: 248000000000,
    peRatio: 8.5,
    volume: 125000000,
    change: 0.15,
    changePercent: 1.18
  },
  '000002': {
    symbol: '000002',
    name: '万科A',
    price: 18.32,
    marketCap: 203000000000,
    peRatio: 12.3,
    volume: 89000000,
    change: -0.28,
    changePercent: -1.51
  },
  '600036': {
    symbol: '600036',
    name: '招商银行',
    price: 35.67,
    marketCap: 901000000000,
    peRatio: 9.8,
    volume: 45000000,
    change: 0.67,
    changePercent: 1.91
  },
  '600519': {
    symbol: '600519',
    name: '贵州茅台',
    price: 1689.00,
    marketCap: 2120000000000,
    peRatio: 32.5,
    volume: 2800000,
    change: 25.00,
    changePercent: 1.50
  },
  '000858': {
    symbol: '000858',
    name: '五粮液',
    price: 156.80,
    marketCap: 609000000000,
    peRatio: 28.7,
    volume: 8500000,
    change: 2.80,
    changePercent: 1.82
  },
  '002415': {
    symbol: '002415',
    name: '海康威视',
    price: 32.45,
    marketCap: 304000000000,
    peRatio: 18.9,
    volume: 15000000,
    change: -0.55,
    changePercent: -1.67
  },
  '300059': {
    symbol: '300059',
    name: '东方财富',
    price: 18.45,
    marketCap: 285000000000,
    peRatio: 25.3,
    volume: 35000000,
    change: 0.45,
    changePercent: 2.50
  },
  '300366': {
    symbol: '300366',
    name: '创意信息',
    price: 8.45,
    marketCap: 45000000000,
    peRatio: 35.2,
    volume: 25000000,
    change: 0.15,
    changePercent: 1.81
  },
  '688133': {
    symbol: '688133',
    name: '泰坦科技',
    price: 45.67,
    marketCap: 18500000000,
    peRatio: 45.2,
    volume: 850000,
    change: 1.67,
    changePercent: 3.80
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
      const { fetchAStockData } = await import('@/lib/tushare-api')
      const aStockData = await fetchAStockData(ticker)
      return NextResponse.json(aStockData)
    } else {
      // 使用Alpha Vantage API获取美股数据
      const { fetchAlphaVantageStockData } = await import('@/lib/alpha-vantage-api')
      const alphaVantageData = await fetchAlphaVantageStockData(ticker)
      return NextResponse.json(alphaVantageData)
    }
  } catch (error) {
    console.error('Error fetching real-time data:', error)
    return NextResponse.json(
      { error: `Failed to fetch data for ${ticker}. Please try again later.` },
      { status: 500 }
    )
  }
} 