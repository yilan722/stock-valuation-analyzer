#!/usr/bin/env node

/**
 * Insight Refinery 功能测试脚本
 * 用于验证API端点的基本功能
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
const TEST_USER_ID = 'test-user-123'
const TEST_REPORT_ID = 'test-report-456'

// 测试数据
const testData = {
  reportId: TEST_REPORT_ID,
  userId: TEST_USER_ID,
  reportTitle: '测试公司 (TEST) 估值分析报告'
}

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 测试函数
async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    const response = await fetch(url, options)
    const result = await response.json()
    
    if (response.ok) {
      log(`✅ ${method} ${endpoint} - 成功`, 'green')
      return result
    } else {
      log(`❌ ${method} ${endpoint} - 失败: ${result.error}`, 'red')
      return null
    }
  } catch (error) {
    log(`❌ ${method} ${endpoint} - 错误: ${error.message}`, 'red')
    return null
  }
}

// 主测试流程
async function runTests() {
  log('🚀 开始 Insight Refinery 功能测试', 'blue')
  log('=' * 50, 'blue')
  
  // 1. 测试开始讨论会话
  log('\n📝 测试1: 开始讨论会话', 'yellow')
  const sessionResult = await testAPI('/api/insight-refinery/start-session', 'POST', {
    reportId: testData.reportId,
    userId: testData.userId
  })
  
  if (!sessionResult) {
    log('❌ 无法创建讨论会话，终止测试', 'red')
    return
  }
  
  const sessionId = sessionResult.sessionId
  log(`📋 会话ID: ${sessionId}`, 'blue')
  
  // 2. 测试提问功能
  log('\n💬 测试2: 提问功能', 'yellow')
  const questionResult = await testAPI('/api/insight-refinery/ask-question', 'POST', {
    sessionId: sessionId,
    question: '这个公司的财务状况如何？'
  })
  
  if (questionResult) {
    log(`🤖 AI回答: ${questionResult.aiResponse.substring(0, 100)}...`, 'blue')
  }
  
  // 3. 测试洞察合成
  log('\n🧠 测试3: 洞察合成', 'yellow')
  const synthesisResult = await testAPI('/api/insight-refinery/synthesize-insights', 'POST', {
    sessionId: sessionId
  })
  
  if (synthesisResult) {
    log(`📊 合成洞察ID: ${synthesisResult.synthesisId}`, 'blue')
    log(`📝 讨论摘要: ${synthesisResult.discussionSummary.substring(0, 100)}...`, 'blue')
  }
  
  // 4. 测试报告进化生成
  log('\n🔄 测试4: 报告进化生成', 'yellow')
  if (synthesisResult) {
    const evolutionResult = await testAPI('/api/insight-refinery/generate-evolution', 'POST', {
      originalReportId: testData.reportId,
      synthesisId: synthesisResult.synthesisId
    })
    
    if (evolutionResult) {
      log(`📈 进化报告ID: ${evolutionResult.evolutionId}`, 'blue')
      log(`📋 版本: ${evolutionResult.version}`, 'blue')
    }
  }
  
  // 5. 测试版本对比
  log('\n🔍 测试5: 版本对比', 'yellow')
  if (synthesisResult && sessionResult) {
    const comparisonResult = await testAPI('/api/insight-refinery/compare-versions', 'POST', {
      originalReportId: testData.reportId,
      evolvedReportId: testData.reportId // 这里应该使用进化后的报告ID
    })
    
    if (comparisonResult) {
      log(`📊 相似度: ${Math.round(comparisonResult.similarityScore * 100)}%`, 'blue')
      log(`🔍 变更数量: ${comparisonResult.highlightedChanges.length}`, 'blue')
    }
  }
  
  // 6. 测试Hub功能
  log('\n📁 测试6: Hub功能', 'yellow')
  const hubResult = await testAPI(`/api/insight-refinery/hub/${testData.userId}`)
  if (hubResult) {
    log(`📂 文件夹数量: ${hubResult.folders.length}`, 'blue')
  }
  
  // 7. 测试统计功能
  log('\n📊 测试7: 统计功能', 'yellow')
  const statsResult = await testAPI(`/api/insight-refinery/stats/${testData.userId}`)
  if (statsResult) {
    log(`📈 总报告数: ${statsResult.totalReports}`, 'blue')
    log(`💬 讨论会话数: ${statsResult.totalDiscussions}`, 'blue')
    log(`🔬 Insight Refinery报告数: ${statsResult.insightRefineryReports}`, 'blue')
  }
  
  log('\n🎉 测试完成！', 'green')
  log('=' * 50, 'green')
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { runTests, testAPI }



