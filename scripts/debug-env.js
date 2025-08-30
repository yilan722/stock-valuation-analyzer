require('dotenv').config()

console.log('🔍 调试环境变量配置...\n')

// 检查 Supabase 相关环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('📋 Supabase 配置:')
console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
if (supabaseUrl) {
  console.log('    URL:', supabaseUrl)
}
console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌')
if (supabaseAnonKey) {
  console.log('    Key 前20字符:', supabaseAnonKey.substring(0, 20) + '...')
}
console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
if (supabaseServiceKey) {
  console.log('    Key 前20字符:', supabaseServiceKey.substring(0, 20) + '...')
}

// 检查其他重要环境变量
console.log('\n📋 其他重要配置:')
console.log('  NODE_ENV:', process.env.NODE_ENV || '未设置')
console.log('  NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || '未设置')

// 测试 Supabase 连接
console.log('\n🔐 测试 Supabase 连接...')

if (supabaseUrl && supabaseAnonKey) {
  const { createClient } = require('@supabase/supabase-js')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
    
    console.log('✅ Supabase 客户端创建成功')
    
    // 测试登录
    console.log('🧪 测试登录...')
    supabase.auth.signInWithPassword({
      email: 'liuyilan72@outlook.com',
      password: 'Test123456!'
    }).then(({ data, error }) => {
      if (error) {
        console.log('❌ 登录测试失败:', error.message)
        console.log('   错误代码:', error.status)
        console.log('   错误详情:', error)
      } else {
        console.log('✅ 登录测试成功!')
        console.log('   用户ID:', data.user.id)
        console.log('   邮箱:', data.user.email)
      }
    }).catch(error => {
      console.log('❌ 登录测试异常:', error.message)
    })
    
  } catch (error) {
    console.log('❌ Supabase 客户端创建失败:', error.message)
  }
} else {
  console.log('❌ 缺少必要的 Supabase 环境变量')
}

console.log('\n🔍 环境变量调试完成')
