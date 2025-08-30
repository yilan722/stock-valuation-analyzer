const axios = require('axios')

// 测试不同的方法获取Yahoo Finance详细信息
async function testAdvancedYahooFinance() {
  console.log('🧪 测试高级Yahoo Finance数据获取方法...\n')
  
  const testTickers = ['SBET', 'AAPL']
  
  for (const ticker of testTickers) {
    console.log(`\n🔍 测试股票: ${ticker}`)
    console.log('='.repeat(50))
    
    // 方法1: 使用不同的User-Agent
    console.log('1️⃣ 方法1: 模拟浏览器User-Agent...')
    try {
      const response = await axios.get(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail,defaultKeyStatistics`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      })
      
      if (response.data && response.data.quoteSummary && response.data.quoteSummary.result) {
        console.log('✅ 方法1成功!')
        const summary = response.data.quoteSummary.result[0]?.summaryDetail
        if (summary) {
          console.log(`   市值: $${(summary.marketCap / 1000000000).toFixed(2)}B`)
          console.log(`   P/E比率: ${summary.trailingPE}`)
        }
      }
    } catch (error) {
      console.log('❌ 方法1失败:', error.message)
    }
    
    // 方法2: 使用不同的API端点
    console.log('\n2️⃣ 方法2: 尝试不同的API端点...')
    try {
      const response = await axios.get(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail,defaultKeyStatistics`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      if (response.data && response.data.quoteSummary && response.data.quoteSummary.result) {
        console.log('✅ 方法2成功!')
        const summary = response.data.quoteSummary.result[0]?.summaryDetail
        if (summary) {
          console.log(`   市值: $${(summary.marketCap / 1000000000).toFixed(2)}B`)
          console.log(`   P/E比率: ${summary.trailingPE}`)
        }
      }
    } catch (error) {
      console.log('❌ 方法2失败:', error.message)
    }
    
    // 方法3: 使用quote API
    console.log('\n3️⃣ 方法3: 尝试quote API...')
    try {
      const response = await axios.get(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      if (response.data && response.data.quoteResponse && response.data.quoteResponse.result) {
        console.log('✅ 方法3成功!')
        const quote = response.data.quoteResponse.result[0]
        console.log(`   市值: $${(quote.marketCap / 1000000000).toFixed(2)}B`)
        console.log(`   P/E比率: ${quote.trailingPE}`)
      }
    } catch (error) {
      console.log('❌ 方法3失败:', error.message)
    }
    
    // 方法4: 使用不同的模块组合
    console.log('\n4️⃣ 方法4: 尝试不同的模块组合...')
    try {
      const response = await axios.get(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=financialData,keyStatistics`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      if (response.data && response.data.quoteSummary && response.data.quoteSummary.result) {
        console.log('✅ 方法4成功!')
        const financialData = response.data.quoteSummary.result[0]?.financialData
        const keyStats = response.data.quoteSummary.result[1]?.keyStatistics
        
        if (financialData) {
          console.log(`   市值: $${(financialData.marketCap / 1000000000).toFixed(2)}B`)
          console.log(`   P/E比率: ${financialData.forwardPE}`)
        }
      }
    } catch (error) {
      console.log('❌ 方法4失败:', error.message)
    }
    
    // 方法5: 尝试获取完整的股票页面
    console.log('\n5️⃣ 方法5: 尝试获取完整股票页面...')
    try {
      const response = await axios.get(`https://finance.yahoo.com/quote/${ticker}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      if (response.data) {
        console.log('✅ 方法5成功! 获取到HTML页面')
        // 尝试从HTML中提取数据
        const html = response.data
        
        // 查找市值数据
        const marketCapMatch = html.match(/"marketCap":\s*(\d+)/)
        if (marketCapMatch) {
          const marketCap = parseInt(marketCapMatch[1])
          console.log(`   市值: $${(marketCap / 1000000000).toFixed(2)}B`)
        }
        
        // 查找P/E比率数据
        const peMatch = html.match(/"trailingPE":\s*([\d.]+)/)
        if (peMatch) {
          const peRatio = parseFloat(peMatch[1])
          console.log(`   P/E比率: ${peRatio}`)
        }
      }
    } catch (error) {
      console.log('❌ 方法5失败:', error.message)
    }
  }
  
  console.log('\n🎉 高级测试完成!')
}

// 运行测试
testAdvancedYahooFinance()

