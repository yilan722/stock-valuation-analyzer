// 测试专业报告标准实施
const testProfessionalStandard = async () => {
  console.log('📋 测试专业报告标准实施...')
  
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
    
    console.log('\n🔬 新的专业标准要求:')
    console.log('✅ 每个部分必须包含2-3个核心数据表格')
    console.log('✅ 基本面分析: 财务指标表 + 同行对比表 + 历史趋势表')
    console.log('✅ 业务细分: 收入结构表 + 增长率对比表 + 市场份额表')
    console.log('✅ 增长催化剂: 催化剂评估表 + 时间规划表 + 风险机会矩阵')
    console.log('✅ 估值分析: DCF计算表 + 可比公司表 + 目标价汇总表')
    console.log('✅ 所有表格数据与文字分析完全一致')
    console.log('✅ 绝对不显示英文思考过程')
    
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
    console.log(`⏱️ 响应时间: ${(responseTime/1000).toFixed(1)}秒`)
    
    if (reportResponse.ok) {
      const reportData = await reportResponse.json()
      console.log('✅ 报告生成成功!')
      
      // 详细验证专业标准实施
      console.log('\n📋 专业标准验证:')
      
      const sections = [
        { 
          name: 'fundamentalAnalysis', 
          title: '基本面分析',
          requiredTables: ['财务指标', '同行', '历史趋势'],
          minTables: 3
        },
        { 
          name: 'businessSegments', 
          title: '业务细分分析',
          requiredTables: ['收入结构', '增长率', '市场份额'],
          minTables: 3
        },
        { 
          name: 'growthCatalysts', 
          title: '增长催化剂',
          requiredTables: ['催化剂评估', '时间规划', '风险机会'],
          minTables: 3
        },
        { 
          name: 'valuationAnalysis', 
          title: '估值分析',
          requiredTables: ['DCF', '可比公司', '目标价'],
          minTables: 3
        }
      ]
      
      let totalScore = 0
      let maxScore = sections.length * 100
      
      sections.forEach((section, index) => {
        const content = reportData[section.name] || ''
        const length = content.length
        let sectionScore = 0
        
        console.log(`\n📊 ${index + 1}. ${section.title}:`)
        
        // 1. 内容长度检查 (25分)
        const meetsLength = length >= 500
        if (meetsLength) sectionScore += 25
        console.log(`   长度: ${length} 字符 ${meetsLength ? '✅' : '❌'} (25分)`)
        
        // 2. 表格数量检查 (25分)
        const tableCount = (content.match(/<table|class=".*metric-table/g) || []).length
        const hasEnoughTables = tableCount >= section.minTables
        if (hasEnoughTables) sectionScore += 25
        console.log(`   表格数量: ${tableCount}个 ${hasEnoughTables ? '✅' : '❌'} (需要${section.minTables}个，25分)`)
        
        // 3. 必需表格内容检查 (30分)
        let requiredTableScore = 0
        section.requiredTables.forEach(tableType => {
          const hasTable = content.includes(tableType) || 
                           (tableType === 'DCF' && content.includes('现金流')) ||
                           (tableType === '可比公司' && content.includes('对比')) ||
                           (tableType === '目标价' && content.includes('估值'))
          if (hasTable) requiredTableScore += 10
          console.log(`     ${tableType}表格: ${hasTable ? '✅' : '❌'} (10分)`)
        })
        sectionScore += requiredTableScore
        
        // 4. 英文思考过程检查 (10分)
        const hasEnglishThinking = /Let me think|Looking at|Based on|I need to|However,|Therefore,/i.test(content)
        if (!hasEnglishThinking) sectionScore += 10
        console.log(`   英文思考过程: ${hasEnglishThinking ? '❌ 存在' : '✅ 无'} (10分)`)
        
        // 5. 数据一致性检查 (10分)
        const hasInconsistentData = content.includes('26.15') && !content.includes('4.2') // 检查是否有硬编码数据
        if (!hasInconsistentData) sectionScore += 10
        console.log(`   数据一致性: ${hasInconsistentData ? '❌ 不一致' : '✅ 一致'} (10分)`)
        
        console.log(`   ${section.title}得分: ${sectionScore}/100`)
        totalScore += sectionScore
      })
      
      // 整体评估
      const overallScore = Math.round((totalScore / maxScore) * 100)
      console.log(`\n🎯 专业标准总评分: ${totalScore}/${maxScore} (${overallScore}%)`)
      
      if (overallScore >= 90) {
        console.log('🏆 优秀! 完全符合专业投资研究报告标准')
      } else if (overallScore >= 75) {
        console.log('👍 良好! 基本符合专业标准，有小幅改进空间')
      } else if (overallScore >= 60) {
        console.log('⚠️ 及格! 需要进一步优化以达到专业标准')
      } else {
        console.log('❌ 不及格! 需要大幅改进才能达到专业标准')
      }
      
      // 具体改进建议
      console.log('\n📝 改进建议:')
      if (overallScore < 90) {
        console.log('1. 确保每个部分都有足够的数据表格支撑')
        console.log('2. 检查表格内容是否与文字分析一致')
        console.log('3. 完全消除英文思考过程显示')
        console.log('4. 增加专业术语和投资分析深度')
      } else {
        console.log('报告质量优秀，符合专业投资研究标准！')
      }
      
    } else {
      const errorData = await reportResponse.json()
      console.log('❌ 报告生成失败:', errorData)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
testProfessionalStandard()
