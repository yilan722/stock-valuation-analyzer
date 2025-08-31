import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 调试 Tushare 配置...')
    
    // 检查环境变量
    const token = process.env.TUSHARE_TOKEN
    const hasEnvToken = !!process.env.TUSHARE_TOKEN
    const tokenPreview = token ? `${token.substring(0, 8)}...` : 'undefined'
    
    console.log('环境变量状态:', {
      hasEnvToken,
      tokenPreview,
      tokenLength: token?.length || 0,
      nodeEnv: process.env.NODE_ENV
    })

    // 测试 API 调用
    const testResponse = await axios.post('https://api.tushare.pro', {
      api_name: 'daily',
      token: token,
      params: {
        ts_code: '300777.SZ',
        limit: 1
      },
      fields: 'ts_code,trade_date,close'
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DebugTest/1.0'
      }
    })

    const apiResult = {
      code: testResponse.data.code,
      message: testResponse.data.msg || 'success',
      hasData: !!(testResponse.data.data?.items?.length),
      itemCount: testResponse.data.data?.items?.length || 0
    }

    if (testResponse.data.code === 0 && testResponse.data.data?.items?.length > 0) {
      const item = testResponse.data.data.items[0]
      apiResult.stockPrice = item[2] // close price
    }

    return NextResponse.json({
      success: true,
      environment: {
        hasEnvToken,
        tokenPreview,
        tokenLength: token?.length || 0,
        nodeEnv: process.env.NODE_ENV
      },
      apiTest: apiResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('调试过程中发生错误:', error)
    
    const errorInfo = {
      type: error.constructor.name,
      message: error instanceof Error ? error.message : String(error)
    }

    if (axios.isAxiosError(error)) {
      errorInfo.status = error.response?.status
      errorInfo.responseData = error.response?.data
    }

    return NextResponse.json({
      success: false,
      error: errorInfo,
      environment: {
        hasEnvToken: !!process.env.TUSHARE_TOKEN,
        tokenPreview: process.env.TUSHARE_TOKEN ? `${process.env.TUSHARE_TOKEN.substring(0, 8)}...` : 'undefined',
        nodeEnv: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
