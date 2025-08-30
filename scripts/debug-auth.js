const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})

async function debugAuth() {
  console.log('🔍 开始调试认证流程...\n')
  
  try {
    // 测试登录
    console.log('1️⃣ 测试登录...')
    const testEmail = 'debug-test@example.com'
    const testPassword = 'testpassword123'
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (signInError) {
      console.log('登录失败:', signInError.message)
      
      // 尝试注册
      console.log('2️⃣ 尝试注册...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: { data: { name: 'Debug User' } }
      })
      
      if (signUpError) {
        console.error('注册失败:', signUpError.message)
        return
      }
      
      console.log('注册成功:', signUpData.user?.id)
      
      // 等待后再次登录
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (retryError) {
        console.error('重试登录失败:', retryError.message)
        return
      }
      
      console.log('重试登录成功:', retryData.user?.id)
    } else {
      console.log('登录成功:', signInData.user?.id)
    }
    
    // 检查会话
    const { data: { session } } = await supabase.auth.getSession()
    console.log('会话状态:', session ? '已登录' : '未登录')
    
    if (session) {
      console.log('用户ID:', session.user.id)
      console.log('邮箱:', session.user.email)
    }
    
    // 登出
    await supabase.auth.signOut()
    console.log('登出完成')
    
  } catch (error) {
    console.error('错误:', error)
  }
}

debugAuth()
