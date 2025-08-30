// 测试认证修复
const testAuthFix = async () => {
  console.log('🔧 测试认证修复...')
  
  try {
    // 使用测试数据
    const testStockData = {
      name: '易成新能',
      symbol: '300080',
      price: '4.2',
      marketCap: '20.69亿',
      peRatio: '20.69',
      amount: '4.2万元'
    }
    
    console.log(`📊 测试股票: ${testStockData.name} (${testStockData.symbol})`)
    
    console.log('\n🔬 修复内容:')
    console.log('✅ 移除了不存在的verifyJwt函数')
    console.log('✅ 使用createApiSupabaseClient进行认证')
    console.log('✅ 采用与旧API相同的用户验证方式')
    console.log('✅ 直接从数据库查询用户信息')
    
    const startTime = Date.now()
    
    const reportResponse = await fetch('http://localhost:3001/api/generate-report-perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 84402fbd-e3b0-4b0d-a349-e8306e7a6b5a'
      },
      body: JSON.stringify({
        stockData: testStockData,
        locale: 'zh'
      })
    })
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    console.log(`\n📡 API响应状态: ${reportResponse.status}`)
    
    if (reportResponse.ok) {
      const reportData = await reportResponse.json()
      console.log(`✅ 报告生成成功! 耗时: ${(responseTime/1000).toFixed(1)}秒`)
      
      // 验证报告结构
      const hasValidStructure = reportData.fundamentalAnalysis && 
                               reportData.businessSegments && 
                               reportData.growthCatalysts && 
                               reportData.valuationAnalysis
      
      console.log(`📊 报告结构完整: ${hasValidStructure ? '✅' : '❌'}`)
      
      if (hasValidStructure) {
        console.log('\n📋 报告各部分长度:')
        const sections = [
          { name: 'fundamentalAnalysis', title: '基本面分析' },
          { name: 'businessSegments', title: '业务细分分析' },
          { name: 'growthCatalysts', title: '增长催化剂' },
          { name: 'valuationAnalysis', title: '估值分析' }
        ]
        
        sections.forEach((section, index) => {
          const length = reportData[section.name]?.length || 0
          console.log(`   ${index + 1}. ${section.title}: ${length.toLocaleString()} 字符`)
        })
        
        console.log('\n🎉 认证修复成功! API正常工作!')
      }
      
    } else {
      const errorData = await reportResponse.json()
      console.log('❌ 报告生成失败:', errorData)
      
      // 分析错误类型
      if (reportResponse.status === 500) {
        console.log('🔍 服务器错误 - 可能仍有代码问题')
        if (errorData.details && errorData.details.includes('is not a function')) {
          console.log('   - 仍然有函数导入问题')
        }
      } else if (reportResponse.status === 401) {
        console.log('🔍 认证错误 - Token可能无效')
      } else if (reportResponse.status === 403) {
        console.log('🔍 权限错误 - 用户可能没有生成报告的权限')
      }
    }
    
    console.log('\n🎯 修复效果总结:')
    console.log('=' * 50)
    
    if (reportResponse.ok) {
      console.log('✅ 认证问题已修复')
      console.log('✅ API可以正常工作')
      console.log('✅ 报告生成和保存功能正常')
    } else {
      console.log('⚠️ 仍有问题需要进一步调试')
      console.log('请检查错误信息以确定下一步修复方向')
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
testAuthFix()
