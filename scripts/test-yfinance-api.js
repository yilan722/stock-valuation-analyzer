const axios = require('axios')

// 测试yfinance API
async function testYFinanceAPI() {
  console.log('🧪 测试yfinance API...\n')
  
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

// 直接测试yfinance API
async function testYFinanceDirectly() {
  console.log('\n🔍 直接测试yfinance API...\n')
  
  const ticker = 'AAPL'
  console.log(`📊 测试 ${ticker} 的yfinance API响应:`)
  
  try {
    const response = await axios.get(`https://yfinance-api.vercel.app/api/quote?symbol=${ticker}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    })
    
    if (response.data && response.data.success) {
      const quote = response.data.quote
      console.log('✅ yfinance API响应成功:')
      console.log('   价格:', quote.regularMarketPrice || quote.currentPrice)
      console.log('   前收盘:', quote.regularMarketPreviousClose || quote.previousClose)
      console.log('   成交量:', quote.regularMarketVolume || quote.volume)
      console.log('   市值:', quote.marketCap)
      console.log('   Trailing P/E:', quote.trailingPE)
      console.log('   Forward P/E:', quote.forwardPE)
      console.log('   公司名称:', quote.longName || quote.shortName)
    } else {
      console.log('❌ yfinance API响应格式错误:', response.data)
    }
    
  } catch (error) {
    console.log('❌ 直接yfinance API测试失败:', error.message)
    
    if (error.response) {
      console.log('   状态码:', error.response.status)
      console.log('   响应数据:', error.response.data)
    }
  }
}

// 主测试函数
async function main() {
  try {
    await testYFinanceAPI()
    await testYFinanceDirectly()
  } catch (error) {
    console.error('测试过程中发生错误:', error.message)
  }
}

// 运行测试
if (require.main === module) {
  main()
}

module.exports = { testYFinanceAPI, testYFinanceDirectly }
