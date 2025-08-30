const axios = require('axios')

// 测试认证状态修复
async function testAuthFix() {
  console.log('🧪 测试认证状态修复...\n')
  
  try {
    // 1. 测试页面加载
    console.log('🔍 步骤1: 测试页面加载...')
    const pageResponse = await axios.get('http://localhost:3000/en')
    
    if (pageResponse.status === 200) {
      console.log('✅ 页面加载成功')
      
      // 检查页面内容
      const pageContent = pageResponse.data
      if (pageContent.includes('processing')) {
        console.log('⚠️ 页面仍然显示processing状态')
      } else {
        console.log('✅ 页面没有显示processing状态')
      }
      
      // 检查用户状态相关的JavaScript
      if (pageContent.includes('useAuth') || pageContent.includes('userLoading')) {
        console.log('✅ 页面包含用户状态管理代码')
      } else {
        console.log('⚠️ 页面缺少用户状态管理代码')
      }
      
    } else {
      console.log('❌ 页面加载失败:', pageResponse.status)
    }
    
    // 2. 测试API端点
    console.log('\n🔍 步骤2: 测试API端点...')
    
    try {
      const apiResponse = await axios.get('http://localhost:3000/api/stock-data?ticker=AAPL')
      console.log('✅ 股票数据API正常')
    } catch (error) {
      console.log('⚠️ 股票数据API测试失败:', error.message)
    }
    
    console.log('\n🎯 测试完成!')
    console.log('\n💡 修复建议:')
    console.log('1. 确保应用已重启')
    console.log('2. 检查浏览器控制台是否有错误')
    console.log('3. 验证用户认证状态是否正确更新')
    console.log('4. 检查loading状态是否正确重置')
    
  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message)
  }
}

// 运行测试
if (require.main === module) {
  testAuthFix()
}

module.exports = { testAuthFix }

