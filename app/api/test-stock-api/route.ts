import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get('ticker')?.toUpperCase()

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      )
    }

    // 检查环境变量
    const envCheck = {
      tushareToken: process.env.TUSHARE_TOKEN ? '✅ 已设置' : '❌ 未设置',
      tushareTokenLength: process.env.TUSHARE_TOKEN?.length || 0,
      nodeEnv: process.env.NODE_ENV,
    }

    // 判断股票类型
    const isAStock = /^[0-9]{6}$/.test(ticker) || ticker.startsWith('688') || ticker.startsWith('300')
    const isHKStock = ticker.includes('.HK') || ticker.includes('.hk') || /^[0-9]{4,5}$/.test(ticker)
    const isUSStock = /^[A-Z]{1,5}$/.test(ticker)

    let testResult = {
      ticker,
      stockType: {
        isAStock,
        isHKStock,
        isUSStock
      },
      envCheck,
      tests: [] as any[]
    }

    // 测试A股API
    if (isAStock) {
      try {
        console.log(`🧪 测试A股API: ${ticker}`)
        const { fetchAStockData } = await import('@/lib/tushare-api')
        const result = await fetchAStockData(ticker)
        testResult.tests.push({
          api: 'Tushare A股API',
          status: 'success',
          data: result
        })
      } catch (error) {
        testResult.tests.push({
          api: 'Tushare A股API',
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    // 测试美股API
    if (isUSStock) {
      try {
        console.log(`🧪 测试美股API: ${ticker}`)
        const { fetchYahooFinanceFallback } = await import('@/lib/yahoo-finance-html-api')
        const result = await fetchYahooFinanceFallback(ticker)
        testResult.tests.push({
          api: 'Yahoo Finance美股API',
          status: 'success',
          data: result
        })
      } catch (error) {
        testResult.tests.push({
          api: 'Yahoo Finance美股API',
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    // 测试港股API
    if (isHKStock) {
      try {
        console.log(`🧪 测试港股API: ${ticker}`)
        const { fetchHKStockData } = await import('@/lib/hk-stock-api')
        const result = await fetchHKStockData(ticker)
        testResult.tests.push({
          api: '港股API',
          status: 'success',
          data: result
        })
      } catch (error) {
        testResult.tests.push({
          api: '港股API',
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...testResult
    })

  } catch (error) {
    console.error('测试API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
