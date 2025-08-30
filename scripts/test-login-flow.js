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

async function testLoginFlow() {
  console.log('🧪 开始测试登录流程...\n')
  
  try {
    // 1. 检查当前会话
    console.log('1️⃣ 检查当前会话...')
    const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ 获取会话失败:', sessionError.message)
      return
    }
    
    console.log('📋 初始会话状态:', initialSession ? '已登录' : '未登录')
    
    // 2. 尝试登录
    console.log('\n2️⃣ 尝试登录...')
    const testEmail = 'test@example.com'
    const testPassword = 'testpassword123'
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (signInError) {
      console.log('ℹ️ 登录失败 (预期):', signInError.message)
      
      // 3. 尝试注册
      console.log('\n3️⃣ 尝试注册新用户...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Test User'
          }
        }
      })
      
      if (signUpError) {
        console.error('❌ 注册失败:', signUpError.message)
        return
      }
      
      console.log('✅ 注册成功:', signUpData.user?.id)
      
      // 4. 检查用户表
      console.log('\n4️⃣ 检查用户表...')
      if (signUpData.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', signUpData.user.id)
          .single()
        
        if (profileError) {
          console.log('ℹ️ 用户profile不存在 (可能需要手动创建):', profileError.message)
        } else {
          console.log('✅ 用户profile已存在:', userProfile)
        }
      }
      
      // 5. 再次尝试登录
      console.log('\n5️⃣ 再次尝试登录...')
      const { data: retrySignInData, error: retrySignInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (retrySignInError) {
        console.error('❌ 重试登录失败:', retrySignInError.message)
        return
      }
      
      console.log('✅ 重试登录成功:', retrySignInData.user?.id)
    } else {
      console.log('✅ 登录成功:', signInData.user?.id)
    }
    
    // 6. 验证会话
    console.log('\n6️⃣ 验证会话...')
    const { data: { session: finalSession }, error: finalSessionError } = await supabase.auth.getSession()
    
    if (finalSessionError) {
      console.error('❌ 获取最终会话失败:', finalSessionError.message)
      return
    }
    
    console.log('📋 最终会话状态:', finalSession ? '已登录' : '未登录')
    
    if (finalSession) {
      console.log('👤 用户ID:', finalSession.user.id)
      console.log('📧 邮箱:', finalSession.user.email)
      console.log('📅 创建时间:', finalSession.user.created_at)
    }
    
    // 7. 测试登出
    console.log('\n7️⃣ 测试登出...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('❌ 登出失败:', signOutError.message)
      return
    }
    
    console.log('✅ 登出成功')
    
    // 8. 最终验证
    console.log('\n8️⃣ 最终验证...')
    const { data: { session: afterSignOutSession } } = await supabase.auth.getSession()
    console.log('📋 登出后会话状态:', afterSignOutSession ? '仍登录' : '已登出')
    
    console.log('\n🎉 登录流程测试完成!')
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error)
  }
}

// 运行测试
testLoginFlow()

