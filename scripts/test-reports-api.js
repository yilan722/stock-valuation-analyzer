// 测试reports API
// 使用内置fetch (Node.js 18+)

async function testReportsAPI() {
  console.log('🧪 测试reports API...\n')
  
  try {
    // 测试GET方法 - 获取用户报告
    console.log('🔍 测试GET /api/reports...')
    
    const userId = '84402fbd-e3b0-4b0d-a349-e8306e7a6b5a' // 从调试面板获取的用户ID
    
    const getResponse = await fetch(`http://localhost:3000/api/reports?userId=${userId}`)
    const getData = await getResponse.json()
    
    console.log('📊 GET响应状态:', getResponse.status)
    console.log('📊 GET响应数据:', getData)
    
    if (getResponse.ok) {
      console.log('✅ GET /api/reports 测试成功!')
      console.log(`   报告数量: ${getData.count || 0}`)
    } else {
      console.log('❌ GET /api/reports 测试失败:', getData.error)
    }
    
    // 测试POST方法 - 创建新报告
    console.log('\n🔍 测试POST /api/reports...')
    
    const testReport = {
      userId: userId,
      stockSymbol: 'TEST',
      stockName: 'Test Company',
      reportData: {
        fundamentalAnalysis: '<p>Test analysis</p>',
        businessSegments: '<p>Test segments</p>',
        growthCatalysts: '<p>Test catalysts</p>',
        valuationAnalysis: '<p>Test valuation</p>'
      }
    }
    
    const postResponse = await fetch('http://localhost:3000/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testReport)
    })
    
    const postData = await postResponse.json()
    
    console.log('📊 POST响应状态:', postResponse.status)
    console.log('📊 POST响应数据:', postData)
    
    if (postResponse.ok) {
      console.log('✅ POST /api/reports 测试成功!')
      console.log(`   新报告ID: ${postData.data?.id}`)
    } else {
      console.log('❌ POST /api/reports 测试失败:', postData.error)
    }
    
    // 再次测试GET，看是否有新报告
    console.log('\n🔍 再次测试GET /api/reports...')
    
    const getResponse2 = await fetch(`http://localhost:3000/api/reports?userId=${userId}`)
    const getData2 = await getResponse2.json()
    
    console.log('📊 第二次GET响应状态:', getResponse2.status)
    console.log('📊 第二次GET响应数据:', getData2)
    
    if (getResponse2.ok) {
      console.log('✅ 第二次GET测试成功!')
      console.log(`   报告数量: ${getData2.count || 0}`)
      if (getData2.count > 0) {
        console.log(`   最新报告: ${getData2.data[0]?.stock_symbol} - ${getData2.data[0]?.stock_name}`)
      }
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  }
}

// 运行测试
if (require.main === module) {
  console.log('⚠️  注意: 请确保开发服务器正在运行 (npm run dev)\n')
  
  testReportsAPI().catch(console.error)
}

module.exports = { testReportsAPI }
