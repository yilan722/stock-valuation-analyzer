// 验证报告问题修复效果
const testReportFixVerification = async () => {
  console.log('🔧 验证报告问题修复效果...')
  
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
    
    console.log('\n🔬 本次修复内容:')
    console.log('✅ 移除了所有硬编码表格函数 (generateDCFTable, generateValuationSummaryTable)')
    console.log('✅ 强化了System Prompt禁止英文思考过程')
    console.log('✅ 要求基于真实数据计算估值，不使用模板数据')
    console.log('✅ 确保四个部分内容均衡，businessSegments不为空')
    console.log('✅ 表格数据必须与文字分析完全一致')
    
    const startTime = Date.now()
    
    const reportResponse = await fetch('http://localhost:3001/api/generate-report-perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-user-id-12345'
      },
      body: JSON.stringify({
        stockData: testStockData,
        locale: 'zh'
      })
    })
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    if (reportResponse.ok) {
      const reportData = await reportResponse.json()
      console.log(`✅ 报告生成成功! 耗时: ${(responseTime/1000).toFixed(1)}秒`)
      
      // 详细验证修复效果
      console.log('\n📋 问题修复验证:')
      
      const sections = [
        { name: 'fundamentalAnalysis', title: '基本面分析' },
        { name: 'businessSegments', title: '业务细分分析' },
        { name: 'growthCatalysts', title: '增长催化剂' },
        { name: 'valuationAnalysis', title: '估值分析' }
      ]
      
      let issuesFound = []
      let fixedIssues = []
      
      sections.forEach((section, index) => {
        const content = reportData[section.name] || ''
        const length = content.length
        
        console.log(`\n📊 ${index + 1}. ${section.title}:`)
        console.log(`   内容长度: ${length} 字符`)
        
        // 问题1: 检查英文思考过程
        const hasEnglishThinking = /Let me think|Looking at|Based on|I need to|I will|However,|Therefore,/i.test(content)
        if (hasEnglishThinking) {
          issuesFound.push(`${section.title}: 仍有英文思考过程`)
          console.log(`   英文思考过程: ❌ 仍存在`)
        } else {
          fixedIssues.push(`${section.title}: 英文思考过程已清除`)
          console.log(`   英文思考过程: ✅ 已清除`)
        }
        
        // 问题2: 检查业务细分是否为空
        if (section.name === 'businessSegments') {
          const hasBusinessContent = content.includes('收入') || content.includes('业务') || content.includes('板块') || content.includes('营收')
          const hasSubstantialContent = length > 500 && hasBusinessContent
          if (!hasSubstantialContent) {
            issuesFound.push(`业务细分: 内容为空或过少`)
            console.log(`   业务内容: ❌ 空或不足`)
          } else {
            fixedIssues.push(`业务细分: 内容完整`)
            console.log(`   业务内容: ✅ 完整`)
          }
        }
        
        // 问题3: 检查估值表格是否使用了硬编码数据
        if (section.name === 'valuationAnalysis') {
          const hasHardcodedValues = content.includes('8.20') || content.includes('7.80') || content.includes('7.20') || content.includes('26.15')
          if (hasHardcodedValues) {
            issuesFound.push(`估值分析: 仍使用硬编码数据`)
            console.log(`   硬编码数据: ❌ 仍存在 (8.20, 7.80, 7.20, 26.15)`)
          } else {
            fixedIssues.push(`估值分析: 使用真实计算数据`)
            console.log(`   硬编码数据: ✅ 已移除`)
          }
          
          // 检查是否有合理的估值数据
          const hasValuationData = content.includes('DCF') || content.includes('P/E') || content.includes('目标价')
          if (hasValuationData) {
            console.log(`   估值内容: ✅ 包含估值分析`)
          } else {
            console.log(`   估值内容: ❌ 缺少估值分析`)
          }
        }
        
        // 问题4: 检查表格数量
        const tableCount = (content.match(/<table|class=".*metric-table/g) || []).length
        if (tableCount >= 2) {
          fixedIssues.push(`${section.title}: 表格数量充足`)
          console.log(`   表格数量: ✅ ${tableCount}个`)
        } else {
          issuesFound.push(`${section.title}: 表格数量不足`)
          console.log(`   表格数量: ❌ 仅${tableCount}个`)
        }
        
        // 显示内容预览
        const preview = content.replace(/<[^>]*>/g, '').substring(0, 120)
        console.log(`   内容预览: ${preview}...`)
      })
      
      // 总体评估
      console.log('\n🎯 修复效果总结:')
      console.log('=' * 60)
      console.log(`✅ 已修复问题数量: ${fixedIssues.length}`)
      console.log(`❌ 仍存在问题数量: ${issuesFound.length}`)
      
      if (fixedIssues.length > 0) {
        console.log('\n✅ 已修复的问题:')
        fixedIssues.forEach(fix => console.log(`   - ${fix}`))
      }
      
      if (issuesFound.length > 0) {
        console.log('\n❌ 仍存在的问题:')
        issuesFound.forEach(issue => console.log(`   - ${issue}`))
      }
      
      // 修复成功度评估
      const totalChecks = fixedIssues.length + issuesFound.length
      const successRate = totalChecks > 0 ? Math.round((fixedIssues.length / totalChecks) * 100) : 0
      
      console.log(`\n📊 修复成功率: ${successRate}%`)
      
      if (successRate >= 90) {
        console.log('🎉 修复效果优秀! 报告质量显著改善!')
      } else if (successRate >= 70) {
        console.log('👍 修复效果良好，但仍需进一步优化')
      } else if (successRate >= 50) {
        console.log('⚠️ 修复效果一般，需要进一步调整')
      } else {
        console.log('❌ 修复效果不佳，需要重新检查配置')
      }
      
      // 检查是否还有其他配置问题
      if (issuesFound.length > 0) {
        console.log('\n🔧 建议进一步检查:')
        console.log('1. 确认API调用没有缓存旧的配置')
        console.log('2. 检查模型参数设置是否正确')
        console.log('3. 验证prompt是否被正确传递给模型')
        console.log('4. 考虑增加更强的约束条件')
      }
      
    } else {
      const errorData = await reportResponse.json()
      console.log('❌ 报告生成失败:', reportResponse.status)
      console.log('错误详情:', errorData)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
testReportFixVerification()
