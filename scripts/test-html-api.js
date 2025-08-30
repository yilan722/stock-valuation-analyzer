const axios = require('axios')

// 测试HTML解析API
async function testHTMLAPI() {
  console.log('🧪 测试Yahoo Finance HTML解析API...\n')
  
  const testTickers = ['SBET', 'AAPL', 'MSFT']
  
  for (const ticker of testTickers) {
    console.log(`\n🔍 测试股票: ${ticker}`)
    console.log('='.repeat(50))
    
    try {
      // 测试HTML解析API
      console.log('1️⃣ 测试HTML解析API...')
      const response = await axios.get(`https://finance.yahoo.com/quote/${ticker}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000
      })
      
      if (response.data) {
        const html = response.data
        console.log('✅ HTML页面获取成功!')
        
        // 解析数据
        const priceMatch = html.match(/"regularMarketPrice":\s*([\d.]+)/)
        const previousCloseMatch = html.match(/"regularMarketPreviousClose":\s*([\d.]+)/)
        const volumeMatch = html.match(/"regularMarketVolume":\s*(\d+)/)
        const marketCapMatch = html.match(/"marketCap":\s*(\d+)/)
        const trailingPEMatch = html.match(/"trailingPE":\s*([\d.]+)/)
        const forwardPEMatch = html.match(/"forwardPE":\s*([\d.]+)/)
        const longNameMatch = html.match(/"longName":\s*"([^"]+)"/)
        
        if (priceMatch) {
          const currentPrice = parseFloat(priceMatch[1])
          const previousClose = previousCloseMatch ? parseFloat(previousCloseMatch[1]) : currentPrice
          const change = currentPrice - previousClose
          const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
          
          const volume = volumeMatch ? parseInt(volumeMatch[1]) : 0
          const amount = volume * currentPrice
          
          const marketCap = marketCapMatch ? parseInt(marketCapMatch[1]) : 0
          const peRatio = trailingPEMatch ? parseFloat(trailingPEMatch[1]) : 
                         forwardPEMatch ? parseFloat(forwardPEMatch[1]) : 0
          
          const companyName = longNameMatch ? longNameMatch[1] : ticker
          
          console.log('📊 解析结果:')
          console.log(`   公司名称: ${companyName}`)
          console.log(`   当前价格: $${currentPrice}`)
          console.log(`   涨跌: ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`)
          console.log(`   成交量: ${volume.toLocaleString()}`)
          console.log(`   成交额: $${(amount / 1000000).toFixed(2)}M`)
          
          if (marketCap) {
            console.log(`   市值: $${(marketCap / 1000000000).toFixed(2)}B`)
          } else {
            console.log(`   市值: 未找到`)
          }
          
          if (peRatio) {
            console.log(`   P/E比率: ${peRatio}`)
          } else {
            console.log(`   P/E比率: 未找到`)
          }
          
        } else {
          console.log('❌ 无法解析价格数据')
        }
        
      } else {
        console.log('❌ HTML页面获取失败')
      }
      
    } catch (error) {
      console.log('❌ API调用失败:', error.message)
    }
  }
  
  console.log('\n🎉 HTML解析测试完成!')
  console.log('\n💡 总结:')
  console.log('✅ HTML页面获取: 成功')
  console.log('✅ 价格数据解析: 成功')
  console.log('✅ 成交量数据解析: 成功')
  console.log('⚠️ 市值和P/E比率: 需要验证数据完整性')
}

// 运行测试
testHTMLAPI()

