const axios = require('axios')

// 测试SBET报告生成，确保包含ETH和mNAV分析
async function testSBETReport() {
  console.log('🧪 测试SBET报告生成...\n')
  
  try {
    // 1. 先获取SBET的股票数据
    console.log('🔍 步骤1: 获取SBET股票数据...')
    const stockResponse = await axios.get('http://localhost:3000/api/stock-data?ticker=SBET')
    
    if (stockResponse.data && !stockResponse.data.error) {
      const stockData = stockResponse.data
      console.log('✅ SBET股票数据获取成功:')
      console.log(`   股票代码: ${stockData.symbol}`)
      console.log(`   公司名称: ${stockData.name}`)
      console.log(`   当前价格: $${stockData.price}`)
      console.log(`   市值: $${(stockData.marketCap / 1000000).toFixed(2)}M`)
      console.log(`   P/E比率: ${stockData.peRatio}`)
      
      // 2. 生成SBET分析报告
      console.log('\n🔍 步骤2: 生成SBET分析报告...')
      const reportResponse = await axios.post('http://localhost:3000/api/generate-report', {
        stockData,
        locale: 'en'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_USER_ID || 'test-user'}`
        }
      })
      
      if (reportResponse.data) {
        const report = reportResponse.data
        console.log('✅ SBET报告生成成功!')
        
        // 3. 检查报告内容质量
        console.log('\n📋 报告结构检查:')
        const sections = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis']
        sections.forEach(section => {
          if (report[section]) {
            console.log(`   ✅ ${section}`)
          } else {
            console.log(`   ❌ ${section} 缺失`)
          }
        })
        
        // 4. 检查ETH和mNAV相关内容
        console.log('\n🔍 ETH和mNAV内容检查:')
        const reportText = JSON.stringify(report).toLowerCase()
        
        // ETH相关检查
        const ethKeywords = ['eth', 'ethereum', 'ether']
        const hasEthContent = ethKeywords.some(keyword => reportText.includes(keyword))
        console.log(`   ETH相关内容: ${hasEthContent ? '✅ 包含' : '❌ 缺失'}`)
        
        // mNAV相关检查
        const mnavKeywords = ['mnav', 'modified net asset value', 'net asset value']
        const hasMnavContent = mnavKeywords.some(keyword => reportText.includes(keyword))
        console.log(`   mNAV相关内容: ${hasMnavContent ? '✅ 包含' : '❌ 缺失'}`)
        
        // 加密货币相关检查
        const cryptoKeywords = ['crypto', 'cryptocurrency', 'digital asset', 'blockchain']
        const hasCryptoContent = cryptoKeywords.some(keyword => reportText.includes(keyword))
        console.log(`   加密货币相关内容: ${hasCryptoContent ? '✅ 包含' : '❌ 缺失'}`)
        
        // 持仓相关检查
        const holdingsKeywords = ['holdings', 'reserves', 'accumulation', 'strategy']
        const hasHoldingsContent = holdingsKeywords.some(keyword => reportText.includes(keyword))
        console.log(`   持仓策略相关内容: ${hasHoldingsContent ? '✅ 包含' : '❌ 缺失'}`)
        
        // 5. 详细内容分析
        console.log('\n📊 详细内容分析:')
        
        if (report.growthCatalysts) {
          const growthText = report.growthCatalysts.toLowerCase()
          console.log('   增长催化剂部分:')
          console.log(`     - ETH相关内容: ${ethKeywords.some(k => growthText.includes(k)) ? '✅' : '❌'}`)
          console.log(`     - 加密货币策略: ${cryptoKeywords.some(k => growthText.includes(k)) ? '✅' : '❌'}`)
        }
        
        if (report.valuationAnalysis) {
          const valuationText = report.valuationAnalysis.toLowerCase()
          console.log('   估值分析部分:')
          console.log(`     - mNAV计算: ${mnavKeywords.some(k => valuationText.includes(k)) ? '✅' : '❌'}`)
          console.log(`     - ETH价格影响: ${ethKeywords.some(k => valuationText.includes(k)) ? '✅' : '❌'}`)
        }
        
        // 6. 内容长度和质量评估
        console.log('\n📏 内容质量评估:')
        const totalLength = JSON.stringify(report).length
        console.log(`   总内容长度: ${totalLength} 字符`)
        
        if (totalLength > 15000) {
          console.log('   ✅ 内容非常详细')
        } else if (totalLength > 10000) {
          console.log('   ✅ 内容详细')
        } else if (totalLength > 5000) {
          console.log('   ⚠️ 内容一般')
        } else {
          console.log('   ❌ 内容过少')
        }
        
        // 7. 问题诊断
        console.log('\n🔍 问题诊断:')
        if (!hasEthContent) {
          console.log('   ❌ 问题: 缺少ETH相关内容')
          console.log('   💡 建议: 检查prompt中的ETH要求是否明确')
        }
        
        if (!hasMnavContent) {
          console.log('   ❌ 问题: 缺少mNAV相关内容')
          console.log('   💡 建议: 检查prompt中的mNAV要求是否明确')
        }
        
        if (!hasCryptoContent) {
          console.log('   ❌ 问题: 缺少加密货币相关内容')
          console.log('   💡 建议: 检查prompt中的加密货币要求是否明确')
        }
        
        // 8. 改进建议
        console.log('\n💡 改进建议:')
        if (!hasEthContent || !hasMnavContent) {
          console.log('   1. 确保prompt中包含明确的ETH和mNAV要求')
          console.log('   2. 在系统提示中强调加密货币公司的特殊分析要求')
          console.log('   3. 添加具体的mNAV计算公式和要求')
          console.log('   4. 要求搜索最新的ETH价格和公司持仓信息')
        }
        
        console.log('\n🎯 测试完成!')
        
      } else {
        console.log('❌ 报告生成失败:', reportResponse.data?.error)
      }
      
    } else {
      console.log('❌ SBET股票数据获取失败')
    }
    
  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message)
    
    if (error.response) {
      console.log('   状态码:', error.response.status)
      console.log('   错误信息:', error.response.data?.error || '未知错误')
    }
  }
}

// 运行测试
if (require.main === module) {
  testSBETReport()
}

module.exports = { testSBETReport }
