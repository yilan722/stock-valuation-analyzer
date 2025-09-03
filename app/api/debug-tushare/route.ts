import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get('ticker') || '300080'

    const TUSHARE_TOKEN = process.env.TUSHARE_TOKEN || '37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9'
    const TUSHARE_API_URL = 'https://api.tushare.pro'

    console.log(`🔍 调试Tushare API for ${ticker}`)
    console.log(`🔑 Token: ${TUSHARE_TOKEN ? `${TUSHARE_TOKEN.substring(0, 8)}...` : 'undefined'}`)

    // 判断市场
    const isShanghai = ticker.startsWith('6') || ticker.startsWith('9')
    const marketSuffix = isShanghai ? '.SH' : '.SZ'
    const tsCode = `${ticker}${marketSuffix}`

    console.log(`📍 市场判断: ${ticker} -> ${tsCode}`)

    const debugInfo = {
      ticker,
      tsCode,
      marketSuffix,
      hasToken: !!TUSHARE_TOKEN,
      tokenLength: TUSHARE_TOKEN?.length || 0,
      tests: [] as any[]
    }

    // 测试1: 获取基本信息
    try {
      console.log(`🧪 测试1: 获取基本信息...`)
      const basicResponse = await axios.post(TUSHARE_API_URL, {
        api_name: 'stock_basic',
        token: TUSHARE_TOKEN,
        params: {
          ts_code: tsCode
        },
        fields: 'ts_code,symbol,name,area,industry,market,list_date'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Opus4ModelValuation/1.0'
        }
      })

      console.log('Basic API response:', basicResponse.data)
      debugInfo.tests.push({
        test: '基本信息API',
        status: 'success',
        response: basicResponse.data
      })
    } catch (error) {
      console.error('基本信息API失败:', error)
      debugInfo.tests.push({
        test: '基本信息API',
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      })
    }

    // 测试2: 获取日线数据
    try {
      console.log(`🧪 测试2: 获取日线数据...`)
      const dailyResponse = await axios.post(TUSHARE_API_URL, {
        api_name: 'daily',
        token: TUSHARE_TOKEN,
        params: {
          ts_code: tsCode,
          limit: 1
        },
        fields: 'ts_code,trade_date,open,high,low,close,vol,amount'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Opus4ModelValuation/1.0'
        }
      })

      console.log('Daily API response:', dailyResponse.data)
      debugInfo.tests.push({
        test: '日线数据API',
        status: 'success',
        response: dailyResponse.data
      })
    } catch (error) {
      console.error('日线数据API失败:', error)
      debugInfo.tests.push({
        test: '日线数据API',
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      })
    }

    // 测试3: 获取基本面数据
    try {
      console.log(`🧪 测试3: 获取基本面数据...`)
      const basicResponse = await axios.post(TUSHARE_API_URL, {
        api_name: 'daily_basic',
        token: TUSHARE_TOKEN,
        params: {
          ts_code: tsCode,
          limit: 1
        },
        fields: 'ts_code,trade_date,total_mv,pe,pb,ps'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Opus4ModelValuation/1.0'
        }
      })

      console.log('Daily Basic API response:', basicResponse.data)
      debugInfo.tests.push({
        test: '基本面数据API',
        status: 'success',
        response: basicResponse.data
      })
    } catch (error) {
      console.error('基本面数据API失败:', error)
      debugInfo.tests.push({
        test: '基本面数据API',
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...debugInfo
    })

  } catch (error) {
    console.error('调试API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
