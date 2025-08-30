const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// 创建 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 缺少必要的环境变量')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})

async function testLogin() {
  console.log('🔐 开始测试登录功能...')
  console.log('📧 测试邮箱: liuyilan72@outlook.com')
  
  try {
    // 1. 测试登录
    console.log('\n1️⃣ 测试登录...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'liuyilan72@outlook.com',
      password: 'Test123456!' // 使用重置后的密码
    })

    if (signInError) {
      console.error('❌ 登录失败:', signInError.message)
      return
    }

    console.log('✅ 登录成功!')
    console.log('👤 用户ID:', signInData.user.id)
    console.log('📧 邮箱:', signInData.user.email)

    // 2. 获取用户会话
    console.log('\n2️⃣ 获取用户会话...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ 获取会话失败:', sessionError.message)
      return
    }

    if (session) {
      console.log('✅ 会话获取成功!')
      console.log('🔑 访问令牌:', session.access_token ? '✅' : '❌')
      console.log('🔄 刷新令牌:', session.refresh_token ? '✅' : '❌')
    } else {
      console.log('⚠️ 没有活动会话')
    }

    // 3. 测试用户资料查询
    console.log('\n3️⃣ 测试用户资料查询...')
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user.id)
      .single()

    if (profileError) {
      console.error('❌ 用户资料查询失败:', profileError.message)
    } else {
      console.log('✅ 用户资料查询成功!')
      console.log('📊 免费报告使用次数:', profile.free_reports_used)
      console.log('💳 付费报告使用次数:', profile.paid_reports_used)
    }

    // 4. 测试白名单状态
    console.log('\n4️⃣ 测试白名单状态...')
    const { data: whitelist, error: whitelistError } = await supabase
      .from('whitelist_users')
      .select('*')
      .eq('email', 'liuyilan72@outlook.com')
      .single()

    if (whitelistError) {
      console.error('❌ 白名单查询失败:', whitelistError.message)
    } else {
      console.log('✅ 白名单查询成功!')
      console.log('🎯 每日报告限制:', whitelist.daily_report_limit)
      console.log('💎 每日免费积分:', whitelist.daily_free_credits)
      console.log('📅 积分重置日期:', whitelist.credits_reset_date)
    }

    // 5. 测试登出
    console.log('\n5️⃣ 测试登出...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('❌ 登出失败:', signOutError.message)
    } else {
      console.log('✅ 登出成功!')
    }

    console.log('\n🎉 所有测试完成!')

  } catch (error) {
    console.error('💥 测试过程中发生错误:', error.message)
  }
}

// 运行测试
testLogin()
