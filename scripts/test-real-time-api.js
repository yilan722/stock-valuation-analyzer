const axios = require('axios')

// 测试实时股票数据API
async function testRealTimeAPI() {
  console.log('🧪 测试实时股票数据API...\n')
  
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
        
        // 数据质量评估
        console.log('\n🔍 数据质量评估:')
        const dataQuality = assessDataQuality(data)
        console.log(`   数据质量: ${dataQuality.score}/10`)
        console.log(`   评估结果: ${dataQuality.assessment}`)
        
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

// 评估数据质量
function assessDataQuality(data) {
  let score = 0
  let issues = []
  
  // 价格数据质量
  if (data.price > 0) {
    score += 2
  } else {
    issues.push('价格数据缺失')
  }
  
  // 涨跌幅数据质量
  if (typeof data.change === 'number' && typeof data.changePercent === 'number') {
    score += 2
  } else {
    issues.push('涨跌幅数据缺失')
  }
  
  // 成交量数据质量
  if (data.volume > 0) {
    score += 1
  } else {
    issues.push('成交量数据缺失')
  }
  
  // 成交额数据质量
  if (data.amount > 0) {
    score += 1
  } else {
    issues.push('成交额数据缺失')
  }
  
  // 市值数据质量
  if (data.marketCap > 0) {
    score += 2
  } else {
    issues.push('市值数据缺失')
  }
  
  // P/E比率数据质量
  if (data.peRatio > 0) {
    score += 2
  } else {
    issues.push('P/E比率数据缺失')
  }
  
  // 数据合理性检查
  if (data.price > 0 && data.volume > 0) {
    const calculatedAmount = data.price * data.volume
    const amountDiff = Math.abs(calculatedAmount - data.amount) / calculatedAmount
    
    if (amountDiff < 0.01) {
      score += 1
    } else {
      issues.push('成交额计算不准确')
    }
  }
  
  // 评估结果
  let assessment = ''
  if (score >= 9) {
    assessment = '优秀 - 数据完整且准确'
  } else if (score >= 7) {
    assessment = '良好 - 数据基本完整'
  } else if (score >= 5) {
    assessment = '一般 - 数据部分缺失'
  } else {
    assessment = '较差 - 数据严重缺失'
  }
  
  if (issues.length > 0) {
    assessment += ` (问题: ${issues.join(', ')})`
  }
  
  return { score, assessment, issues }
}

// 测试报告生成
async function testReportGeneration() {
  console.log('\n📊 测试报告生成...\n')
  
  const testTicker = 'AAPL'
  console.log(`🔍 测试股票: ${testTicker}`)
  
  try {
    // 先获取股票数据
    const stockResponse = await axios.get(`http://localhost:3000/api/stock-data?ticker=${testTicker}`)
    
    if (stockResponse.data && !stockResponse.data.error) {
      const stockData = stockResponse.data
      console.log('✅ 股票数据获取成功，开始生成报告...')
      
      // 生成报告
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
        console.log('✅ 报告生成成功!')
        console.log('\n📋 报告结构:')
        
        if (report.fundamentalAnalysis) {
          console.log('   ✅ 基本面分析')
        }
        if (report.businessSegments) {
          console.log('   ✅ 业务细分')
        }
        if (report.growthCatalysts) {
          console.log('   ✅ 增长催化剂')
        }
        if (report.valuationAnalysis) {
          console.log('   ✅ 估值分析')
        }
        
        // 检查报告内容质量
        const contentLength = JSON.stringify(report).length
        console.log(`\n📏 报告内容长度: ${contentLength} 字符`)
        
        if (contentLength > 10000) {
          console.log('   ✅ 报告内容详细')
        } else if (contentLength > 5000) {
          console.log('   ⚠️ 报告内容一般')
        } else {
          console.log('   ❌ 报告内容过少')
        }
        
      } else {
        console.log('❌ 报告生成失败:', reportResponse.data?.error)
      }
      
    } else {
      console.log('❌ 股票数据获取失败')
    }
    
  } catch (error) {
    console.log('❌ 报告生成测试失败:', error.message)
    
    if (error.response) {
      console.log('   状态码:', error.response.status)
      console.log('   错误信息:', error.response.data?.error || '未知错误')
    }
  }
}

// 主测试函数
async function main() {
  try {
    await testRealTimeAPI()
    await testReportGeneration()
  } catch (error) {
    console.error('测试过程中发生错误:', error.message)
  }
}

// 运行测试
if (require.main === module) {
  main()
}

module.exports = { testRealTimeAPI, testReportGeneration, assessDataQuality }
