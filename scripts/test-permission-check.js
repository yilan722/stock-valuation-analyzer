const { createClient } = require('@supabase/supabase-js')

// 使用环境变量配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0'

console.log('🔍 测试Supabase权限检查...')
console.log('🔍 Supabase URL:', supabaseUrl)
console.log('🔍 用户ID: 84402fbd-e3b0-4b0d-a349-e8306e7a6b5a')

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function testPermissionCheck() {
  try {
    const userId = '84402fbd-e3b0-4b0d-a349-e8306e7a6b5a'
    
    console.log('📋 步骤1: 查询用户资料...')
    const startTime = Date.now()
    
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`⏱️ 查询耗时: ${duration}ms`)
    console.log('📋 用户资料查询结果:', { 
      success: !profileError, 
      error: profileError?.message,
      data: userProfile ? '存在' : '不存在'
    })
    
    if (profileError) {
      console.error('❌ 用户资料查询失败:', profileError)
      return
    }
    
    if (!userProfile) {
      console.log('❌ 用户不存在')
      return
    }
    
    console.log('📧 用户邮箱:', userProfile.email)
    
    console.log('📋 步骤2: 查询白名单状态...')
    const whitelistStartTime = Date.now()
    
    const { data: whitelistUser, error: whitelistError } = await supabase
      .from('whitelist_users')
      .select('*')
      .eq('email', userProfile.email)
      .single()
    
    const whitelistEndTime = Date.now()
    const whitelistDuration = whitelistEndTime - whitelistStartTime
    
    console.log(`⏱️ 白名单查询耗时: ${whitelistDuration}ms`)
    console.log('📋 白名单查询结果:', { 
      success: !whitelistError, 
      error: whitelistError?.message,
      data: whitelistUser ? '在白名单中' : '不在白名单中'
    })
    
    if (whitelistUser && !whitelistError) {
      console.log('✅ 用户在白名单中:', {
        email: whitelistUser.email,
        dailyFreeCredits: whitelistUser.daily_free_credits,
        creditsResetDate: whitelistUser.credits_reset_date
      })
    } else {
      console.log('ℹ️ 用户不在白名单中')
    }
    
  } catch (error) {
    console.error('💥 测试失败:', error)
  }
}

testPermissionCheck()
