const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function quickTest() {
  console.log('🧪 快速测试认证...')
  
  try {
    // 测试登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    
    if (error) {
      console.error('❌ 登录失败:', error.message)
      return
    }
    
    console.log('✅ 登录成功:', data.user?.id)
    
    // 检查会话
    const { data: { session } } = await supabase.auth.getSession()
    console.log('📋 会话状态:', session ? '已登录' : '未登录')
    
    // 登出
    await supabase.auth.signOut()
    console.log('👋 登出完成')
    
  } catch (error) {
    console.error('💥 错误:', error)
  }
}

quickTest()

