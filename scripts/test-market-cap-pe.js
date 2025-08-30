const axios = require('axios')

// 专门测试市值和P/E比率获取
async function testMarketCapAndPE() {
  console.log('🧪 专门测试市值和P/E比率获取...\n')
  
  const testTickers = ['SBET', 'AAPL', 'MSFT', 'TSLA', 'NVDA']
  
  for (const ticker of testTickers) {
    console.log(`\n🔍 测试股票: ${ticker}`)
    console.log('='.repeat(50))
    
    try {
      // 测试我们的API端点
      const response = await axios.get(`http://localhost:3000/api/stock-data?ticker=${ticker}`)
      
      if (response.data && !response.data.error) {
        const data = response.data
        console.log('✅ API调用成功:')
        console.log(`   股票代码: ${data.symbol}`)
        console.log(`   公司名称: ${data.name}`)
        console.log(`   当前价格: $${data.price}`)
        console.log(`   涨跌幅: ${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`)
        console.log(`   成交量: ${data.volume.toLocaleString()}`)
        console.log(`   成交额: $${(data.amount / 1000000).toFixed(2)}M`)
        
        // 重点检查市值和P/E
        console.log('\n📊 关键财务指标:')
        if (data.marketCap > 0) {
          console.log(`   ✅ 市值: $${(data.marketCap / 1000000000).toFixed(2)}B`)
        } else {
          console.log(`   ❌ 市值: $${data.marketCap} (获取失败)`)
        }
        
        if (data.peRatio > 0) {
          console.log(`   ✅ P/E比率: ${data.peRatio.toFixed(2)}`)
        } else {
          console.log(`   ❌ P/E比率: ${data.peRatio} (获取失败)`)
        }
        
      } else {
        console.log('❌ API返回错误:', response.data.error)
      }
      
    } catch (error) {
      console.log('❌ API调用失败:', error.message)
      
      if (error.response) {
        console.log('   状态码:', error.response.status)
        console.log('   错误信息:', error.response.data?.error || '未知错误')
      }
    }
    
    // 等待一下再测试下一个
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log('\n🎯 测试完成!')
}

// 直接测试Yahoo Finance API
async function testYahooFinanceDirectly() {
  console.log('\n🔍 直接测试Yahoo Finance API...\n')
  
  const ticker = 'AAPL'
  console.log(`📊 测试 ${ticker} 的原始API响应:`)
  
  try {
    // 测试Quote API
    console.log('\n1️⃣ Quote API:')
    const quoteResponse = await axios.get(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,marketCap,trailingPE,forwardPE,regularMarketPreviousClose,sharesOutstanding`)
    
    if (quoteResponse.data?.quoteResponse?.result?.[0]) {
      const result = quoteResponse.data.quoteResponse.result[0]
      console.log('   市值:', result.marketCap)
      console.log('   Trailing P/E:', result.trailingPE)
      console.log('   Forward P/E:', result.forwardPE)
      console.log('   流通股数:', result.sharesOutstanding)
    }
    
    // 测试Chart API
    console.log('\n2️⃣ Chart API:')
    const chartResponse = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d&includePrePost=false`)
    
    if (chartResponse.data?.chart?.result?.[0]) {
      const meta = chartResponse.data.chart.result[0].meta
      console.log('   市值:', meta.marketCap)
      console.log('   Trailing P/E:', meta.trailingPE)
      console.log('   Forward P/E:', meta.forwardPE)
    }
    
    // 测试Summary API
    console.log('\n3️⃣ Summary API:')
    const summaryResponse = await axios.get(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail,financialData,defaultKeyStatistics`)
    
    if (summaryResponse.data?.quoteSummary?.result?.[0]) {
      const result = summaryResponse.data.quoteSummary.result[0]
      console.log('   市值:', result.summaryDetail?.marketCap)
      console.log('   Forward P/E:', result.financialData?.forwardPE)
      console.log('   Trailing P/E:', result.financialData?.trailingPE)
    }
    
  } catch (error) {
    console.log('❌ 直接API测试失败:', error.message)
  }
}

// 主测试函数
async function main() {
  try {
    await testMarketCapAndPE()
    await testYahooFinanceDirectly()
  } catch (error) {
    console.error('测试过程中发生错误:', error.message)
  }
}

// 运行测试
if (require.main === module) {
  main()
}

module.exports = { testMarketCapAndPE, testYahooFinanceDirectly }
