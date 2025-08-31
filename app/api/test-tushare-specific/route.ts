import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker') || '300777'
  
  console.log(`🔍 开始测试 Tushare API for ${ticker}`)
  
  const result = {
    timestamp: new Date().toISOString(),
    ticker,
    environment: {
      hasToken: !!process.env.TUSHARE_TOKEN,
      tokenLength: process.env.TUSHARE_TOKEN?.length || 0,
      tokenPreview: process.env.TUSHARE_TOKEN ? `${process.env.TUSHARE_TOKEN.substring(0, 12)}...` : 'undefined'
    },
    testResults: {} as any
  }

  try {
    // 测试1: 基本信息API
    console.log(`📋 测试1: 获取 ${ticker} 基本信息...`)
    const basicInfoResponse = await fetch('https://api.tushare.pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Opus4ModelValuation/1.0'
      },
      body: JSON.stringify({
        api_name: 'stock_basic',
        token: process.env.TUSHARE_TOKEN,
        params: {
          ts_code: `${ticker}.SZ`
        },
        fields: 'ts_code,symbol,name,area,industry,market,list_date'
      })
    })

    const basicInfoData = await basicInfoResponse.json()
    result.testResults.basicInfo = {
      status: basicInfoResponse.status,
      data: basicInfoData,
      success: basicInfoData.code === 0
    }
    console.log(`✅ 基本信息API测试完成:`, basicInfoData)

    // 测试2: 日线数据API
    console.log(`📊 测试2: 获取 ${ticker} 日线数据...`)
    const dailyResponse = await fetch('https://api.tushare.pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Opus4ModelValuation/1.0'
      },
      body: JSON.stringify({
        api_name: 'daily',
        token: process.env.TUSHARE_TOKEN,
        params: {
          ts_code: `${ticker}.SZ`,
          limit: 1
        },
        fields: 'ts_code,trade_date,open,high,low,close,vol,amount'
      })
    })

    const dailyData = await dailyResponse.json()
    result.testResults.dailyData = {
      status: dailyResponse.status,
      data: dailyData,
      success: dailyData.code === 0
    }
    console.log(`✅ 日线数据API测试完成:`, dailyData)

    // 测试3: 基本面数据API
    console.log(`💰 测试3: 获取 ${ticker} 基本面数据...`)
    const basicFinancialResponse = await fetch('https://api.tushare.pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Opus4ModelValuation/1.0'
      },
      body: JSON.stringify({
        api_name: 'daily_basic',
        token: process.env.TUSHARE_TOKEN,
        params: {
          ts_code: `${ticker}.SZ`,
          trade_date: '20250110' // 使用最近的交易日
        },
        fields: 'ts_code,trade_date,total_mv,pe,pb,ps,dv_ratio,dv_ttm'
      })
    })

    const basicFinancialData = await basicFinancialResponse.json()
    result.testResults.basicFinancial = {
      status: basicFinancialResponse.status,
      data: basicFinancialData,
      success: basicFinancialData.code === 0
    }
    console.log(`✅ 基本面数据API测试完成:`, basicFinancialData)

    // 总结
    const allSuccess = Object.values(result.testResults).every((test: any) => test.success)
    result.summary = {
      allTestsPassed: allSuccess,
      totalTests: Object.keys(result.testResults).length,
      passedTests: Object.values(result.testResults).filter((test: any) => test.success).length
    }

    console.log(`🎯 测试总结: ${result.summary.passedTests}/${result.summary.totalTests} 通过`)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error(`❌ Tushare API 测试失败:`, error)
    
    result.error = {
      message: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    }
    
    return NextResponse.json(result, { status: 500 })
  }
}
