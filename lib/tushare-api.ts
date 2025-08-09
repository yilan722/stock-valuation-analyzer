import axios from 'axios'
import { StockData } from '../types'

const TUSHARE_TOKEN = '37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9'
const TUSHARE_API_URL = 'http://api.tushare.pro'

export const fetchAStockData = async (ticker: string): Promise<StockData> => {
  // 判断是深市还是沪市
  const isShanghai = ticker.startsWith('6') || ticker.startsWith('9')
  const marketSuffix = isShanghai ? '.SH' : '.SZ'
  
  // 首先获取公司基本信息（包括中文名称）
  let companyName = `${ticker} (A股)`
  try {
    const basicInfo = await fetchStockBasicInfo(ticker, marketSuffix)
    if (basicInfo && basicInfo.name) {
      companyName = basicInfo.name
    }
  } catch (basicError) {
    console.log('Failed to fetch basic info, using default name')
  }

  try {
    // 获取实时行情数据
    const dailyResponse = await axios.post(TUSHARE_API_URL, {
      api_name: 'daily',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: `${ticker}${marketSuffix}`
      },
      fields: 'ts_code,trade_date,open,high,low,close,vol,amount'
    })

    if (!dailyResponse.data.data || !dailyResponse.data.data.items || dailyResponse.data.data.items.length === 0) {
      throw new Error('No daily data found')
    }

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
    const volume = parseInt(latestData[volIndex]) || 0
    const amount = parseFloat(latestData[amountIndex]) || 0
    const tradeDate = latestData[tradeDateIndex]
    const change = currentPrice - openPrice
    const changePercent = (change / openPrice) * 100

    console.log(`Processing ${ticker}: price=${currentPrice}, amount=${amount}, trade_date=${tradeDate}`)

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
      console.log(`Failed to fetch basic financial data for ${ticker}:`, (basicError as Error).message)
    }

    // 如果P/E为0或null，尝试通过income API计算
    if (!peRatio || peRatio === 0) {
      try {
        const incomeResponse = await axios.post(TUSHARE_API_URL, {
          api_name: 'income',
          token: TUSHARE_TOKEN,
          params: {
            ts_code: `${ticker}${marketSuffix}`
          },
          fields: 'ts_code,ann_date,end_date,revenue,n_income'
        })

        if (incomeResponse.data.data && incomeResponse.data.data.items && incomeResponse.data.data.items.length > 0) {
          const incomeData = incomeResponse.data.data.items[0]
          const incomeFields = incomeResponse.data.data.fields
          
          const netIncomeIndex = incomeFields.indexOf('n_income')
          const netIncome = parseFloat(incomeData[netIncomeIndex]) || 0
          
          // 计算P/E比率：市值 / 净利润
          if (netIncome > 0 && marketCap > 0) {
            peRatio = (marketCap * 10000) / (netIncome * 10000) // 转换为元
            console.log(`Calculated P/E for ${ticker}: ${peRatio}`)
          }
        }
      } catch (incomeError) {
        console.log(`Failed to fetch income data for P/E calculation for ${ticker}:`, (incomeError as Error).message)
      }
    }

    // 检查必要的数据
    if (!marketCap || marketCap === 0) {
      throw new Error('Market cap data not available from Tushare API')
    }

    if (!peRatio || peRatio === 0) {
      // 如果P/E仍然为0，使用一个默认值而不是报错
      console.log(`Using default P/E for ${ticker}`)
      peRatio = 15.0 // 使用行业平均P/E作为默认值
    }

    if (!amount || amount === 0) {
      throw new Error('Amount data not available from Tushare API')
    }

    return {
      symbol: ticker,
      name: companyName,
      price: currentPrice,
      marketCap: marketCap * 10000, // Tushare返回的是万元，转换为元
      peRatio: peRatio,
      amount: amount, // 成交额（万元）
      change: change,
      changePercent: changePercent
    }
  } catch (error) {
    console.error('Error fetching A-stock data from Tushare:', error)
    throw error // 不再返回模拟数据，直接抛出错误
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