// 系统调试脚本
const https = require('https')
const http = require('http')

// 测试数据库连接
async function testDatabase() {
  console.log('🧪 测试数据库连接...')
  
  try {
    const response = await fetch('http://localhost:3000/api/test-db')
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ 数据库连接测试成功:', data)
    } else {
      console.log('❌ 数据库连接测试失败:', data)
    }
  } catch (error) {
    console.error('❌ 无法连接到测试API:', error.message)
  }
}

// 测试报告生成API
async function testReportGeneration() {
  console.log('\n🧪 测试报告生成API...')
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-user-id'
      },
      body: JSON.stringify({
        stockData: {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 150,
          marketCap: 2500000000000,
          peRatio: 25,
          amount: 1000000
        },
        locale: 'en'
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ 报告生成API测试成功')
    } else {
      console.log('❌ 报告生成API测试失败:', data)
    }
  } catch (error) {
    console.error('❌ 无法连接到报告生成API:', error.message)
  }
}

// 测试环境变量
function testEnvironmentVariables() {
  console.log('\n🧪 测试环境变量...')
  
  const requiredVars = [
    'OPUS4_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`)
    } else {
      console.log(`❌ ${varName}: 未设置`)
    }
  })
}

// 主函数
async function main() {
  console.log('🔍 开始系统调试...\n')
  
  // 测试环境变量
  testEnvironmentVariables()
  
  // 等待一下让服务器启动
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 测试数据库
  await testDatabase()
  
  // 测试报告生成
  await testReportGeneration()
  
  console.log('\n🎯 系统调试完成!')
}

// 运行调试
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main }
