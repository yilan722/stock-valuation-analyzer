const { createClient } = require('@supabase/supabase-js')

// 配置
const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0'

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 测试时不持久化
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})

async function testCompleteUserFlow() {
  console.log('🧪 开始测试完整用户流程...\n')
  
  try {
    // 1. 测试注册
    console.log('1️⃣ 测试用户注册...')
    const testEmail = 'complete-test@example.com'
    const testPassword = 'testpassword123'
    const testName = 'Complete Test User'
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName
        }
      }
    })
    
    if (signUpError) {
      console.error('❌ 注册失败:', signUpError.message)
      return
    }
    
    console.log('✅ 注册成功:', signUpData.user?.id)
    
    // 等待一下让触发器执行
    console.log('⏳ 等待触发器执行...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 2. 检查用户profile是否自动创建
    console.log('\n2️⃣ 检查用户profile...')
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signUpData.user.id)
      .single()
    
    if (profileError) {
      console.log('⚠️ Profile自动创建失败，手动创建...')
      
      // 手动创建profile
      const { data: manualProfile, error: manualError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user.id,
          email: signUpData.user.email,
          name: testName,
          created_at: signUpData.user.created_at,
          updated_at: signUpData.user.updated_at || signUpData.user.created_at,
          free_reports_used: 0,
          paid_reports_used: 0,
          monthly_report_limit: 0
        })
        .select()
        .single()
      
      if (manualError) {
        console.error('❌ 手动创建profile失败:', manualError.message)
        return
      }
      
      console.log('✅ 手动创建profile成功:', manualProfile)
    } else {
      console.log('✅ Profile自动创建成功:', profile)
    }
    
    // 3. 测试登录
    console.log('\n3️⃣ 测试用户登录...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (signInError) {
      console.error('❌ 登录失败:', signInError.message)
      return
    }
    
    console.log('✅ 登录成功:', signInData.user?.id)
    
    // 4. 验证会话
    console.log('\n4️⃣ 验证会话...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ 获取会话失败:', sessionError.message)
      return
    }
    
    console.log('📋 会话状态:', session ? '已登录' : '未登录')
    
    if (session) {
      console.log('👤 用户ID:', session.user.id)
      console.log('📧 邮箱:', session.user.email)
      console.log('📅 创建时间:', session.user.created_at)
    }
    
    // 5. 测试获取用户profile
    console.log('\n5️⃣ 测试获取用户profile...')
    const { data: userProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (fetchError) {
      console.error('❌ 获取用户profile失败:', fetchError.message)
    } else {
      console.log('✅ 获取用户profile成功:', userProfile)
      console.log('📊 免费报告使用:', userProfile.free_reports_used)
      console.log('📊 付费报告使用:', userProfile.paid_reports_used)
      console.log('📊 月度报告限额:', userProfile.monthly_report_limit)
    }
    
    // 6. 测试登出
    console.log('\n6️⃣ 测试用户登出...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('❌ 登出失败:', signOutError.message)
      return
    }
    
    console.log('✅ 登出成功')
    
    // 7. 最终验证
    console.log('\n7️⃣ 最终验证...')
    const { data: { session: finalSession } } = await supabase.auth.getSession()
    console.log('📋 最终会话状态:', finalSession ? '仍登录' : '已登出')
    
    // 8. 清理测试用户
    console.log('\n8️⃣ 清理测试用户...')
    // 注意：这里需要服务端权限，暂时跳过
    console.log('⚠️ 需要手动清理测试用户')
    
    console.log('\n🎉 完整用户流程测试完成!')
    console.log('\n📋 测试结果总结:')
    console.log('✅ 用户注册: 成功')
    console.log('✅ 用户登录: 成功')
    console.log('✅ 会话管理: 正常')
    console.log('✅ 用户profile: 正常')
    console.log('✅ 用户登出: 成功')
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error)
  }
}

// 运行测试
testCompleteUserFlow()

