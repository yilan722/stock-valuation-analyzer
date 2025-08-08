const axios = require('axios')

const TUSHARE_TOKEN = '37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9'
const TUSHARE_API_URL = 'http://api.tushare.pro'

async function testFixedData(ticker) {
  console.log(`Testing fixed data for ${ticker}...`)
  
  try {
    // 获取实时行情数据
    const dailyResponse = await axios.post(TUSHARE_API_URL, {
      api_name: 'daily',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: `${ticker}.SZ`
      },
      fields: 'ts_code,trade_date,open,high,low,close,vol,amount'
    })

    if (!dailyResponse.data.data || !dailyResponse.data.data.items || dailyResponse.data.data.items.length === 0) {
      console.log('No daily data found')
      return
    }

    const latestData = dailyResponse.data.data.items[0]
    const fields = dailyResponse.data.data.fields
    
    const closeIndex = fields.indexOf('close')
    const volIndex = fields.indexOf('vol')
    const openIndex = fields.indexOf('open')
    const tradeDateIndex = fields.indexOf('trade_date')
    
    const currentPrice = parseFloat(latestData[closeIndex])
    const volume = parseInt(latestData[volIndex]) || 0
    const tradeDate = latestData[tradeDateIndex]
    
    console.log(`Price: ${currentPrice}`)
    console.log(`Volume: ${volume}`)
    console.log(`Trade Date: ${tradeDate}`)

    // 获取基本面数据
    let marketCap = 0
    let peRatio = 0
    
    try {
      const basicResponse = await axios.post(TUSHARE_API_URL, {
        api_name: 'daily_basic',
        token: TUSHARE_TOKEN,
        params: {
          ts_code: `${ticker}.SZ`,
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
        
        console.log(`Market Cap (万元): ${marketCap}`)
        console.log(`Market Cap (元): ${marketCap * 10000}`)
        console.log(`P/E Ratio (from daily_basic): ${peRatio}`)
      }
    } catch (basicError) {
      console.log('daily_basic failed:', basicError.message)
    }

    // 如果P/E为0，尝试通过income API计算
    if (!peRatio || peRatio === 0) {
      try {
        const incomeResponse = await axios.post(TUSHARE_API_URL, {
          api_name: 'income',
          token: TUSHARE_TOKEN,
          params: {
            ts_code: `${ticker}.SZ`
          },
          fields: 'ts_code,ann_date,end_date,revenue,n_income'
        })

        if (incomeResponse.data.data && incomeResponse.data.data.items && incomeResponse.data.data.items.length > 0) {
          const incomeData = incomeResponse.data.data.items[0]
          const incomeFields = incomeResponse.data.data.fields
          
          const netIncomeIndex = incomeFields.indexOf('n_income')
          const netIncome = parseFloat(incomeData[netIncomeIndex]) || 0
          
          console.log(`Net Income: ${netIncome}`)
          
          // 计算P/E比率：市值 / 净利润
          if (netIncome > 0 && marketCap > 0) {
            peRatio = (marketCap * 10000) / (netIncome * 10000) // 转换为元
            console.log(`Calculated P/E Ratio: ${peRatio.toFixed(2)}`)
          }
        }
      } catch (incomeError) {
        console.log('income failed:', incomeError.message)
      }
    }

    console.log('\n--- Final Results ---')
    console.log(`Price: $${currentPrice}`)
    console.log(`Market Cap: $${(marketCap * 10000 / 1000000000).toFixed(2)}B`)
    console.log(`P/E Ratio: ${peRatio.toFixed(2)}`)
    console.log(`Volume: ${(volume / 1000).toFixed(2)}K`)
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

// 测试几个股票
testFixedData('002915') // 中欣氟材
testFixedData('300366') // 创意信息 