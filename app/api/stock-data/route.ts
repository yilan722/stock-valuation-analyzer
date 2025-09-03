import { NextRequest, NextResponse } from 'next/server'
import { StockData } from '@/types'
// 移除akshare-api引用，只使用tushare和yfinance

// 强制动态渲染，因为使用了request.url
export const dynamic = 'force-dynamic'

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
  },
  // 港股示例
  '1347': {
    symbol: '1347',
    name: '华虹半导体',
    price: 18.82,
    marketCap: 24500000000,
    peRatio: 12.4,
    amount: 1250000000,
    volume: 66400000,
    change: -0.32,
    changePercent: -1.67,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  '0700': {
    symbol: '0700',
    name: '腾讯控股',
    price: 285.60,
    marketCap: 2680000000000,
    peRatio: 18.5,
    amount: 8500000000,
    volume: 29800000,
    change: 2.40,
    changePercent: 0.85,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  },
  '9988': {
    symbol: '9988',
    name: '阿里巴巴-SW',
    price: 78.90,
    marketCap: 789000000000,
    peRatio: 22.3,
    amount: 3200000000,
    volume: 40500000,
    change: -1.10,
    changePercent: -1.37,
    // Data source: Mock data for demonstration
    // Last updated: 2025-08-11
  }
}

// A股公司名称映射表 - 修复yfinance无法识别中文名称的问题
const A_STOCK_NAME_MAP: Record<string, string> = {
  '300080': '易成新能',
  '001979': '招商蛇口',
  '300777': '中简科技',
  '002244': '滨江集团',
  '000001': '平安银行',
  '000002': '万科A',
  '600036': '招商银行',
  '600519': '贵州茅台',
  '000858': '五粮液',
  '002415': '海康威视',
  '300059': '东方财富',
  '300366': '创意信息',
  '688133': '泰坦科技'
}

// 为300080添加mock数据
mockStockData['300080'] = {
  symbol: '300080',
  name: '易成新能',
  price: 4.2,
  marketCap: 15600000000,
  peRatio: 18.5,
  amount: 45000000,
  volume: 107142857,
  change: 0.12,
  changePercent: 2.94,
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

  // 判断股票类型
  const isAStock = /^[0-9]{6}$/.test(ticker) || ticker.startsWith('688') || ticker.startsWith('300')
  // 港股识别：只识别明确包含.HK的代码，避免与A股冲突
  const isHKStock = ticker.includes('.HK') || ticker.includes('.hk')
  // 美股识别：纯字母代码
  const isUSStock = /^[A-Z]{1,5}$/.test(ticker)
  
  try {
    if (isAStock) {
      // 使用tushare API获取A股数据（唯一稳定数据源）
      try {
        console.log(`🔄 使用tushare获取A股 ${ticker} 数据...`)
        const { fetchAStockData: fetchTushareData } = await import('@/lib/tushare-api')
        const tushareData = await fetchTushareData(ticker)
        
        // tushare应该直接返回中文公司名称，不需要手动修复
        console.log(`✅ tushare返回的公司名称: ${tushareData.name}`)
        
        console.log(`✅ tushare API成功获取A股 ${ticker} 数据`)
        return NextResponse.json(tushareData)
      } catch (tushareError) {
        const errorMessage = tushareError instanceof Error ? tushareError.message : String(tushareError)
        
        console.error(`❌ Tushare API 失败 for ${ticker}:`, {
          error: errorMessage,
          ticker: ticker,
          timestamp: new Date().toISOString(),
          hasToken: !!process.env.TUSHARE_TOKEN,
          tokenLength: process.env.TUSHARE_TOKEN?.length || 0
        })
        
        // 检查是否有模拟数据可用
        if (mockStockData[ticker]) {
          console.log(`🔄 使用模拟数据作为备用方案 for ${ticker}`)
          return NextResponse.json(mockStockData[ticker])
        }
        
        // 返回404而不是500，这样前端会正确处理
        return NextResponse.json(
          { 
            error: `A股 ${ticker} 数据获取失败`,
            details: errorMessage,
            debug: {
              ticker,
              hasToken: !!process.env.TUSHARE_TOKEN,
              tokenLength: process.env.TUSHARE_TOKEN?.length || 0
            }
          },
          { status: 404 }
        )
      }
    } else if (isHKStock) {
      // 使用港股API获取港股数据
      try {
        const { fetchHKStockData } = await import('@/lib/hk-stock-api')
        const hkStockData = await fetchHKStockData(ticker)
        return NextResponse.json(hkStockData)
      } catch (hkStockError) {
        console.error(`HK Stock API failed for ${ticker}:`, hkStockError)
        return NextResponse.json(
          { error: `港股 ${ticker} 数据获取失败，可能是停牌或数据源暂时不可用。请稍后重试。` },
          { status: 500 }
        )
      }
    } else if (isUSStock) {
      // 使用实时股票数据API获取美股数据
      try {
        // 优先使用Yahoo Finance基础API（免费且现在正常工作）
        try {
          const { fetchYahooFinanceFallback } = await import('@/lib/yahoo-finance-html-api')
          const yahooData = await fetchYahooFinanceFallback(ticker)
          console.log(`✅ Yahoo Finance基础API成功获取 ${ticker} 数据`)
          return NextResponse.json(yahooData)
        } catch (yahooError) {
          console.log(`⚠️ Yahoo Finance基础API失败，尝试其他数据源:`, yahooError)
          
          // 备用方案1：使用实时股票数据API
          try {
            const { fetchRealTimeStockData } = await import('@/lib/real-time-stock-data')
            const realTimeData = await fetchRealTimeStockData(ticker)
            console.log(`✅ 实时数据API成功获取 ${ticker} 数据`)
            return NextResponse.json(realTimeData)
          } catch (realTimeError) {
            console.error(`实时数据API失败 for ${ticker}:`, realTimeError)
            
            // 备用方案2：使用Opus4 API
            try {
              const { fetchOtherMarketStockData } = await import('@/lib/opus4-stock-api')
              const opus4Data = await fetchOtherMarketStockData(ticker)
              console.log(`✅ Opus4 API成功获取 ${ticker} 数据`)
              return NextResponse.json(opus4Data)
            } catch (opus4Error) {
              console.error(`Opus4 API也失败 for ${ticker}:`, opus4Error)
              return NextResponse.json(
                { error: `美股 ${ticker} 数据获取失败。可能原因：1) 股票代码不存在 2) 股票已退市 3) 数据源暂时不可用。请检查股票代码或稍后重试。` },
                { status: 500 }
              )
            }
          }
        }
      } catch (error) {
        console.error(`美股数据获取完全失败 for ${ticker}:`, error)
        return NextResponse.json(
          { error: `美股 ${ticker} 数据获取失败，请稍后重试。` },
          { status: 500 }
        )
      }
    } else {
      // 无法识别的股票代码
      console.error(`无法识别的股票代码: ${ticker}`)
      return NextResponse.json(
        { 
          error: `无法识别的股票代码: ${ticker}`,
          suggestion: '请检查股票代码格式：A股(6位数字)、美股(1-5位字母)、港股(代码.HK)'
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Unexpected error in stock data API:', error)
    return NextResponse.json(
      { error: `获取 ${ticker} 数据时发生未知错误，请稍后重试。` },
      { status: 500 }
    )
  }
} 