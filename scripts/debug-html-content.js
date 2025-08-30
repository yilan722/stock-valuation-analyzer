const axios = require('axios')
const fs = require('fs')

// 调试HTML内容结构
async function debugHTMLContent() {
  console.log('🔍 调试Yahoo Finance HTML内容结构...\n')
  
  const ticker = 'AAPL'
  
  try {
    console.log(`1️⃣ 获取 ${ticker} 的HTML页面...`)
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
      
      // 保存HTML到文件以便分析
      fs.writeFileSync(`debug_${ticker}_html.txt`, html)
      console.log(`📁 HTML已保存到 debug_${ticker}_html.txt`)
      
      // 尝试不同的正则表达式模式
      console.log('\n2️⃣ 尝试不同的数据提取模式...')
      
      // 模式1: 查找包含价格信息的script标签
      const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g)
      if (scriptMatches) {
        console.log(`✅ 找到 ${scriptMatches.length} 个script标签`)
        
        // 查找包含价格数据的script
        for (let i = 0; i < scriptMatches.length; i++) {
          const script = scriptMatches[i]
          if (script.includes('regularMarketPrice') || script.includes('marketCap') || script.includes('trailingPE')) {
            console.log(`\n📜 Script ${i + 1} 包含价格数据:`)
            console.log(script.substring(0, 500) + '...')
            
            // 尝试提取数据
            const priceMatch = script.match(/"regularMarketPrice":\s*([\d.]+)/)
            const marketCapMatch = script.match(/"marketCap":\s*(\d+)/)
            const peMatch = script.match(/"trailingPE":\s*([\d.]+)/)
            
            if (priceMatch) console.log(`   价格: $${priceMatch[1]}`)
            if (marketCapMatch) console.log(`   市值: $${(parseInt(marketCapMatch[1]) / 1000000000).toFixed(2)}B`)
            if (peMatch) console.log(`   P/E比率: ${peMatch[1]}`)
          }
        }
      }
      
      // 模式2: 查找JSON数据
      const jsonMatches = html.match(/\{[^{}]*"regularMarketPrice"[^{}]*\}/g)
      if (jsonMatches) {
        console.log(`\n✅ 找到 ${jsonMatches.length} 个包含价格的JSON片段`)
        jsonMatches.forEach((match, index) => {
          console.log(`\n📊 JSON片段 ${index + 1}:`)
          console.log(match)
        })
      }
      
      // 模式3: 查找特定的数据属性
      console.log('\n3️⃣ 查找页面中的数据属性...')
      const dataMatches = html.match(/data-test="[^"]*"[^>]*>/g)
      if (dataMatches) {
        console.log(`✅ 找到 ${dataMatches.length} 个data-test属性`)
        dataMatches.slice(0, 10).forEach(match => {
          console.log(`   ${match}`)
        })
      }
      
    } else {
      console.log('❌ HTML页面获取失败')
    }
    
  } catch (error) {
    console.log('❌ API调用失败:', error.message)
  }
  
  console.log('\n🎉 HTML调试完成!')
  console.log('\n💡 下一步:')
  console.log('1. 检查保存的HTML文件')
  console.log('2. 分析实际的数据结构')
  console.log('3. 更新正则表达式模式')
}

// 运行调试
debugHTMLContent()
