// 真实用户认证测试脚本
const { createClient } = require('@supabase/supabase-js')

// 从环境变量获取Supabase配置
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 缺少Supabase环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 测试真实用户登录
async function testRealAuth() {
  console.log('🔐 开始真实用户认证测试...\n')
  
  try {
    // 1. 测试登录
    console.log('🔍 步骤1: 测试用户登录...')
    
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'liuyilan72@outlook.com',
      password: 'your_password_here' // 需要替换为真实密码
    })
    
    if (signInError) {
      console.log('❌ 登录失败:', signInError.message)
      console.log('💡 请检查密码是否正确')
      return
    }
    
    if (user) {
      console.log('✅ 登录成功，用户ID:', user.id)
      
      // 2. 测试报告生成API
      console.log('\n🔍 步骤2: 测试报告生成API...')
      
      const response = await fetch('http://localhost:3000/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          stockData: {
            symbol: 'SBET',
            name: 'Sharplink Gaming Ltd.',
            price: 2.5,
            marketCap: 25000000,
            peRatio: 15,
            amount: 1000000
          },
          locale: 'en'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ 报告生成API测试成功!')
        console.log('📊 报告包含以下部分:', Object.keys(data))
      } else {
        console.log('❌ 报告生成API测试失败:', data)
      }
      
      // 3. 测试Report Hub数据加载
      console.log('\n🔍 步骤3: 测试Report Hub数据加载...')
      
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (reportsError) {
        console.log('❌ 加载报告失败:', reportsError.message)
      } else {
        console.log('✅ 成功加载报告，数量:', reports?.length || 0)
        if (reports && reports.length > 0) {
          console.log('📄 最新报告:', {
            symbol: reports[0].stock_symbol,
            name: reports[0].stock_name,
            created: reports[0].created_at
          })
        }
      }
      
    } else {
      console.log('❌ 登录后未获取到用户信息')
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  } finally {
    // 清理：登出用户
    await supabase.auth.signOut()
    console.log('\n🧹 测试完成，用户已登出')
  }
}

// 运行测试
if (require.main === module) {
  console.log('⚠️  注意: 请确保在运行此脚本前:')
  console.log('   1. 开发服务器正在运行 (npm run dev)')
  console.log('   2. 在.env文件中设置了正确的密码')
  console.log('   3. 替换脚本中的密码为真实密码\n')
  
  testRealAuth().catch(console.error)
}

module.exports = { testRealAuth }
