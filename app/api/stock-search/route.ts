import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染，因为使用了request.url
export const dynamic = 'force-dynamic'

interface StockSearchResult {
  symbol: string
  name: string
  price?: number
  change?: number
  changePercent?: number
  marketCap?: number
  volume?: number
  source?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = query.trim().toUpperCase()
    
    // 判断是否为A股搜索（纯数字或包含中文）
    const isAStockSearch = /^[0-9]+$/.test(searchTerm) || /[\u4e00-\u9fff]/.test(searchTerm)
    
    let results: StockSearchResult[] = []
    let source = ''
    
    if (isAStockSearch) {
      console.log(`🔍 检测到A股搜索: ${searchTerm}`)
      // A股搜索：使用Tushare API
      try {
        console.log('🔄 使用Tushare API搜索A股...')
        const tushareResults = await searchTushare(searchTerm)
        console.log('🔍 Tushare搜索结果:', tushareResults)
        if (tushareResults.length > 0) {
          results = tushareResults
          source = 'tushare'
          console.log(`✅ Tushare搜索成功，返回${results.length}个结果`)
        }
      } catch (error) {
        console.log('❌ Tushare搜索失败:', error)
      }
      
      // 如果Tushare失败，尝试yfinance作为备用
      if (results.length === 0) {
        try {
          const yfinanceResults = await searchYFinance(searchTerm)
          if (yfinanceResults.length > 0) {
            results = yfinanceResults
            source = 'yfinance'
            console.log(`✅ yfinance搜索成功，返回${results.length}个结果`)
          }
        } catch (yfinanceError) {
          console.log('YFinance搜索也失败:', yfinanceError)
        }
      }
    } else {
      // 美股/港股搜索：使用yfinance
      results = await searchYFinance(searchTerm)
      if (results.length > 0) {
        source = 'yfinance'
        console.log(`✅ yfinance搜索成功，返回${results.length}个结果`)
      }
    }
    
    if (results.length > 0) {
      return NextResponse.json({ results, source })
    }

    console.log(`❌ 未找到相关股票: ${searchTerm}`)
    return NextResponse.json({ results: [] })

  } catch (error) {
    console.error('Stock search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function searchTushare(searchTerm: string): Promise<StockSearchResult[]> {
  try {
    // 使用Tushare API搜索A股
    const { fetchStockBasicInfo } = await import('@/lib/tushare-api')
    
    // 尝试不同的市场后缀
    const markets = ['.SZ', '.SH']
    const results: StockSearchResult[] = []
    
    for (const market of markets) {
      try {
        const basicInfo = await fetchStockBasicInfo(searchTerm, market)
        if (basicInfo && basicInfo.name) {
          results.push({
            symbol: searchTerm,
            name: basicInfo.name,
            source: 'tushare'
          })
          break // 找到第一个匹配的就停止
        }
      } catch (error) {
        // 继续尝试下一个市场
        continue
      }
    }
    
    return results
  } catch (error) {
    console.error('Tushare search error:', error)
    return []
  }
}

async function searchYFinance(searchTerm: string): Promise<StockSearchResult[]> {
  try {
    // 直接使用YFinance API搜索美股/港股
    console.log('🔄 使用YFinance API搜索:', searchTerm)
    
    // 构建YFinance搜索URL
    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(searchTerm)}&quotesCount=5&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&newsQueryId=news_ss_symbols&enableCb=false&enableNavLinks=false&enableEnhancedTrivialQuery=false`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`YFinance API请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔍 YFinance搜索响应:', data)
    
    if (data.quotes && Array.isArray(data.quotes)) {
      const results = data.quotes.map((quote: any) => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || 'Unknown Company',
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        marketCap: quote.marketCap || 0,
        volume: quote.regularMarketVolume || 0,
        source: 'yfinance'
      }))
      
      console.log('✅ YFinance搜索成功，返回结果:', results)
      return results
    }
    
    console.log('⚠️ YFinance未返回有效结果')
    return []
    
  } catch (error) {
    console.error('YFinance搜索错误:', error)
    return []
  }
}




