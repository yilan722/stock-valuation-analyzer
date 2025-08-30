const axios = require('axios')

// 测试Yahoo Finance API数据获取
async function testYahooFinance() {
  console.log('🧪 测试Yahoo Finance API数据获取...\n')
  
  const testTickers = ['SBET', 'AAPL', 'MSFT']
  
  for (const ticker of testTickers) {
    console.log(`\n🔍 测试股票: ${ticker}`)
    console.log('='.repeat(50))
    
    try {
      // 测试基础API
      console.log('1️⃣ 测试基础Yahoo Finance API...')
      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`)
      
      if (response.data && response.data.chart && response.data.chart.result) {
        const result = response.data.chart.result[0]
        const meta = result.meta
        const quote = result.indicators.quote[0]
        
        const currentPrice = meta.regularMarketPrice || 0
        const previousClose = meta.previousClose || 0
        const change = currentPrice - previousClose
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
        const volume = quote.volume ? quote.volume[quote.volume.length - 1] : 0
        const amount = volume * currentPrice
        
        console.log('✅ 基础数据获取成功:')
        console.log(`   价格: $${currentPrice}`)
        console.log(`   涨跌: ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`)
        console.log(`   成交量: ${volume.toLocaleString()}`)
        console.log(`   成交额: $${(amount / 1000000).toFixed(2)}M`)
        
        // 测试quote API
        console.log('\n2️⃣ 测试quote API...')
        try {
          const quoteResponse = await axios.get(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`)
          
          if (quoteResponse.data && quoteResponse.data.quoteResponse && quoteResponse.data.quoteResponse.result) {
            const quoteData = quoteResponse.data.quoteResponse.result[0]
            
            console.log('✅ quote API获取成功:')
            console.log(`   市值: $${(quoteData.marketCap / 1000000000).toFixed(2)}B`)
            console.log(`   P/E比率: ${quoteData.trailingPE || 'N/A'}`)
            console.log(`   预期P/E: ${quoteData.forwardPE || 'N/A'}`)
          }
        } catch (quoteError) {
          console.log('⚠️ quote API失败:', quoteError.message)
        }
        
        // 测试financialData API
        console.log('\n3️⃣ 测试financialData API...')
        try {
          const financialResponse = await axios.get(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=financialData`)
          
          if (financialResponse.data && financialResponse.data.quoteSummary && financialResponse.data.quoteSummary.result) {
            const financialData = financialResponse.data.quoteSummary.result[0]?.financialData
            
            if (financialData) {
              console.log('✅ financialData API获取成功:')
              console.log(`   市值: $${(financialData.marketCap / 1000000000).toFixed(2)}B`)
              console.log(`   P/E比率: ${financialData.forwardPE || 'N/A'}`)
              console.log(`   预期P/E: ${financialData.forwardPE || 'N/A'}`)
            }
          }
        } catch (financialError) {
          console.log('⚠️ financialData API失败:', financialError.message)
        }
        
      } else {
        console.log('❌ 基础数据获取失败')
      }
      
    } catch (error) {
      console.log('❌ API调用失败:', error.message)
    }
  }
  
  console.log('\n🎉 测试完成!')
}

// 运行测试
testYahooFinance()
