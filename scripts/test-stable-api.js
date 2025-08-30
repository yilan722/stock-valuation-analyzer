const axios = require('axios')

// 测试稳定的股票数据API
async function testStableAPI() {
  console.log('🧪 测试稳定的股票数据API...\n')
  
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
        console.log(`   市值: $${(data.marketCap / 1000000000).toFixed(2)}B`)
        console.log(`   P/E比率: ${data.peRatio.toFixed(2)}`)
        console.log(`   成交量: ${data.volume.toLocaleString()}`)
        console.log(`   成交额: $${(data.amount / 1000000).toFixed(2)}M`)
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
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n🎯 测试完成!')
}

// 测试Yahoo Finance API的稳定性
async function testYahooFinanceStability() {
  console.log('\n🔒 测试Yahoo Finance API稳定性...\n')
  
  const ticker = 'AAPL'
  const testCount = 5
  
  console.log(`📊 连续测试 ${ticker} ${testCount} 次，检查数据一致性...`)
  
  const results = []
  
  for (let i = 0; i < testCount; i++) {
    try {
      const response = await axios.get(`http://localhost:3000/api/stock-data?ticker=${ticker}`)
      
      if (response.data && !response.data.error) {
        const data = response.data
        results.push({
          test: i + 1,
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          volume: data.volume,
          marketCap: data.marketCap,
          peRatio: data.peRatio
        })
        
        console.log(`✅ 测试 ${i + 1}: 价格=$${data.price}, 涨跌=${data.change}, 成交量=${data.volume.toLocaleString()}`)
      } else {
        console.log(`❌ 测试 ${i + 1}: API错误`)
      }
      
    } catch (error) {
      console.log(`❌ 测试 ${i + 1}: 失败 - ${error.message}`)
    }
    
    // 等待2秒再测试
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // 分析结果一致性
  if (results.length > 1) {
    console.log('\n📈 数据一致性分析:')
    
    const prices = results.map(r => r.price)
    const priceVariation = Math.max(...prices) - Math.min(...prices)
    console.log(`   价格变化范围: $${priceVariation.toFixed(2)}`)
    
    const volumes = results.map(r => r.volume)
    const volumeVariation = Math.max(...volumes) - Math.min(...volumes)
    console.log(`   成交量变化范围: ${volumeVariation.toLocaleString()}`)
    
    if (priceVariation < 0.01 && volumeVariation < 1000) {
      console.log('✅ 数据非常稳定')
    } else if (priceVariation < 0.1 && volumeVariation < 10000) {
      console.log('⚠️ 数据基本稳定')
    } else {
      console.log('❌ 数据不够稳定')
    }
  }
}

// 主测试函数
async function main() {
  try {
    await testStableAPI()
    await testYahooFinanceStability()
  } catch (error) {
    console.error('测试过程中发生错误:', error.message)
  }
}

// 运行测试
if (require.main === module) {
  main()
}

module.exports = { testStableAPI, testYahooFinanceStability }
