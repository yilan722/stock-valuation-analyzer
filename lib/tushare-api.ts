import axios from 'axios'
import { StockData } from '../types'

const TUSHARE_TOKEN = process.env.TUSHARE_TOKEN || '37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9'
const TUSHARE_API_URL = 'https://api.tushare.pro'

// A股模拟数据作为备用方案
const aStockMockData: Record<string, StockData> = {
  '300080': {
    symbol: '300080',
    name: '易成新能',
    price: 4.2,
    marketCap: 15600000000,
    peRatio: 18.5,
    amount: 45000000,
    volume: 107142857,
    change: 0.12,
    changePercent: 2.94,
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
  },
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
  },
  '300726': {
    symbol: '300726',
    name: '宏达电子',
    price: 12.34,
    marketCap: 52000000000,
    peRatio: 28.5,
    amount: 68000000,
    volume: 68000000,
    change: 0.45,
    changePercent: 3.78,
  }
}

export const fetchAStockData = async (ticker: string): Promise<StockData> => {
  console.log(`🚀 开始获取 A股 ${ticker} 数据...`)
  console.log('🔑 使用的 Token:', TUSHARE_TOKEN ? `${TUSHARE_TOKEN.substring(0, 8)}...` : 'undefined')
  
  // 判断是深市还是沪市
  const isShanghai = ticker.startsWith('6') || ticker.startsWith('9')
  const marketSuffix = isShanghai ? '.SH' : '.SZ'
  console.log(`📍 市场判断: ${ticker} -> ${ticker}${marketSuffix}`)
  
  // 首先获取公司基本信息（包括中文名称）
  let companyName = `${ticker} (A股)`
  try {
    console.log(`🔍 获取 ${ticker} 基本信息...`)
    const basicInfo = await fetchStockBasicInfo(ticker, marketSuffix)
    if (basicInfo && basicInfo.name) {
      companyName = basicInfo.name
      console.log(`✅ 获取到公司名称: ${companyName}`)
    } else {
      console.log(`⚠️ 未获取到 ${ticker} 的公司名称，使用默认名称`)
    }
  } catch (basicError) {
    const errorMessage = basicError instanceof Error ? basicError.message : String(basicError)
    console.log(`❌ 获取基本信息失败: ${errorMessage}`)
  }

  try {
    // 获取实时行情数据 - 修复字段名
    const dailyResponse = await axios.post(TUSHARE_API_URL, {
      api_name: 'daily',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: `${ticker}${marketSuffix}`,
        limit: 1  // 只获取最新一天的数据
      },
      fields: 'ts_code,trade_date,open,high,low,close,vol,amount'
    }, {
      timeout: 10000,  // 10秒超时
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Opus4ModelValuation/1.0'
      }
    })

    console.log('Daily API response:', dailyResponse.data)

    // 检查API响应状态
    if (dailyResponse.data.code !== 0) {
      console.error(`❌ Tushare API error: ${dailyResponse.data.msg || 'Unknown error'}`)
      throw new Error(`Tushare API error: ${dailyResponse.data.msg || 'Unknown error'}`)
    }

    if (!dailyResponse.data.data || !dailyResponse.data.data.items || dailyResponse.data.data.items.length === 0) {
      console.error('❌ No daily data found in response')
      throw new Error('No daily data found')
    }

    console.log('✅ Daily data validation passed')

    const latestData = dailyResponse.data.data.items[0]
    const fields = dailyResponse.data.data.fields
    
    // 找到对应的字段索引
    const closeIndex = fields.indexOf('close')
    const volIndex = fields.indexOf('vol')
    const openIndex = fields.indexOf('open')
    const amountIndex = fields.indexOf('amount')
    const tradeDateIndex = fields.indexOf('trade_date')
    
    const currentPrice = parseFloat(latestData[closeIndex])
    const openPrice = parseFloat(latestData[openIndex])
    const volume = parseInt(latestData[volIndex]) || 0  // 成交量（股数）
    const amount = parseFloat(latestData[amountIndex]) || 0  // 成交额（万元）
    const tradeDate = latestData[tradeDateIndex]
    const change = currentPrice - openPrice
    const changePercent = (change / openPrice) * 100

    console.log(`Processing ${ticker}: price=${currentPrice}, volume=${volume}, amount=${amount}, trade_date=${tradeDate}`)

    // 获取基本面数据（市值、P/E等）
    let marketCap = 0
    let peRatio = 0
    
    try {
      const basicResponse = await axios.post(TUSHARE_API_URL, {
        api_name: 'daily_basic',
        token: TUSHARE_TOKEN,
        params: {
          ts_code: `${ticker}${marketSuffix}`,
          trade_date: tradeDate
        },
        fields: 'ts_code,trade_date,total_mv,pe,pb,ps,dv_ratio,dv_ttm'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Opus4ModelValuation/1.0'
        }
      })

      if (basicResponse.data.data && basicResponse.data.data.items && basicResponse.data.data.items.length > 0) {
        const basicData = basicResponse.data.data.items[0]
        const basicFields = basicResponse.data.data.fields
        
        const totalMvIndex = basicFields.indexOf('total_mv')
        const peIndex = basicFields.indexOf('pe')
        
        marketCap = parseFloat(basicData[totalMvIndex]) || 0
        peRatio = parseFloat(basicData[peIndex]) || 0
        
        console.log(`Basic data for ${ticker}: marketCap=${marketCap}, peRatio=${peRatio}`)
      } else {
        console.log(`No basic data found for ${ticker} on ${tradeDate}`)
      }
    } catch (basicError) {
      const errorMessage = basicError instanceof Error ? basicError.message : String(basicError)
      console.log(`Failed to fetch basic financial data for ${ticker}:`, errorMessage)
    }

    // 如果P/E为0或null，尝试通过income API计算
    if (!peRatio || peRatio === 0) {
      try {
        const incomeResponse = await axios.post(TUSHARE_API_URL, {
          api_name: 'income',
          token: TUSHARE_TOKEN,
          params: {
            ts_code: `${ticker}${marketSuffix}`,
            limit: 1  // 只获取最新一年的数据
          },
          fields: 'ts_code,ann_date,end_date,revenue,n_income'
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Opus4ModelValuation/1.0'
          }
        })

        if (incomeResponse.data.data && incomeResponse.data.data.items && incomeResponse.data.data.items.length > 0) {
          const incomeData = incomeResponse.data.data.items[0]
          const incomeFields = incomeResponse.data.data.fields
          
          const revenueIndex = incomeFields.indexOf('revenue')
          const netIncomeIndex = incomeFields.indexOf('n_income')
          
          const revenue = parseFloat(incomeData[revenueIndex]) || 0
          const netIncome = parseFloat(incomeData[netIncomeIndex]) || 0
          
          if (netIncome > 0) {
            // 使用市值和净利润计算P/E
            peRatio = (marketCap * 10000) / netIncome
            console.log(`Calculated P/E for ${ticker}: ${peRatio}`)
          }
        }
      } catch (incomeError) {
        const errorMessage = incomeError instanceof Error ? incomeError.message : String(incomeError)
        console.log(`Failed to fetch income data for ${ticker}:`, errorMessage)
      }
    }

    // 修复市值单位问题 - tushare返回的市值单位是万元，需要转换为元
    const correctedMarketCap = marketCap > 0 ? marketCap * 10000 : 0
    
    // 如果市值异常大，使用价格和流通股数估算
    let finalMarketCap = correctedMarketCap
    if (correctedMarketCap > 1000000000000000) { // 如果超过1万亿
      console.warn(`市值异常大: ${correctedMarketCap}，使用估算值`)
      // 使用价格 * 流通股数估算（假设流通股数为1亿股）
      finalMarketCap = currentPrice * 100000000
    }
    
    return {
      symbol: ticker,
      name: companyName,
      price: currentPrice,
      marketCap: finalMarketCap,
      peRatio: peRatio || 0,
      amount: amount / 10000, // 转换为万元
      volume: volume,
      change: change,
      changePercent: changePercent
    }

  } catch (error) {
    console.error(`❌ Tushare API 调用失败 for ${ticker}:`)
    
    // 安全的错误处理
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorName = error instanceof Error ? error.constructor.name : 'Unknown'
    
    console.error('错误类型:', errorName)
    console.error('错误消息:', errorMessage)
    
    if (axios.isAxiosError(error)) {
      console.error('响应状态:', error.response?.status)
      console.error('响应数据:', error.response?.data)
      console.error('请求配置:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      })
    }
    
    // 记录详细的 API 调用信息
    console.error('API 调用详情:', {
      token: TUSHARE_TOKEN ? `${TUSHARE_TOKEN.substring(0, 8)}...` : 'undefined',
      url: TUSHARE_API_URL,
      tsCode: `${ticker}${marketSuffix}`,
      hasEnvToken: !!process.env.TUSHARE_TOKEN
    })
    
    // 不使用 mock 数据，直接抛出详细错误
    throw new Error(`Tushare API 调用失败: ${errorMessage}. 请检查网络连接和 API 配置。`)
  }
}

export const fetchStockBasicInfo = async (ticker: string, marketSuffix: string = '.SZ') => {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'stock_basic',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: `${ticker}${marketSuffix}`
      },
      fields: 'ts_code,symbol,name,area,industry,market,list_date'
    })

    if (response.data.data && response.data.data.items && response.data.data.items.length > 0) {
      const item = response.data.data.items[0]
      const fields = response.data.data.fields
      
      // 找到name字段的索引
      const nameIndex = fields.indexOf('name')
      
      return {
        name: item[nameIndex]
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching basic info:', error)
    return null
  }
}

export const fetchFinancialData = async (ticker: string) => {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'income',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: `${ticker}.SZ`
      },
      fields: 'ts_code,ann_date,end_date,revenue,n_income'
    })

    return response.data.data
  } catch (error) {
    console.error('Error fetching financial data:', error)
    return null
  }
} 