const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// 创建 Supabase 客户端（使用服务角色密钥）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetPassword() {
  console.log('🔐 开始密码重置测试...')
  console.log('📧 目标邮箱: liuyilan72@outlook.com')
  
  try {
    // 1. 查找用户
    console.log('\n1️⃣ 查找用户...')
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ 获取用户列表失败:', listError.message)
      return
    }

    const targetUser = users.find(user => user.email === 'liuyilan72@outlook.com')
    
    if (!targetUser) {
      console.error('❌ 用户不存在')
      return
    }

    console.log('✅ 找到用户:', targetUser.id)
    console.log('📧 邮箱:', targetUser.email)
    console.log('📅 创建时间:', targetUser.created_at)

    // 2. 生成新密码
    const newPassword = 'Test123456!'
    console.log('\n2️⃣ 设置新密码:', newPassword)

    // 3. 更新用户密码
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('❌ 密码更新失败:', updateError.message)
      return
    }

    console.log('✅ 密码更新成功!')

    // 4. 测试新密码登录
    console.log('\n3️⃣ 测试新密码登录...')
    
    // 创建匿名客户端来测试登录
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })

    const { data: signInData, error: signInError } = await anonSupabase.auth.signInWithPassword({
      email: 'liuyilan72@outlook.com',
      password: newPassword
    })

    if (signInError) {
      console.error('❌ 新密码登录失败:', signInError.message)
      return
    }

    console.log('✅ 新密码登录成功!')
    console.log('👤 用户ID:', signInData.user.id)
    console.log('📧 邮箱:', signInData.user.email)

    // 5. 测试登出
    console.log('\n4️⃣ 测试登出...')
    const { error: signOutError } = await anonSupabase.auth.signOut()
    
    if (signOutError) {
      console.error('❌ 登出失败:', signOutError.message)
    } else {
      console.log('✅ 登出成功!')
    }

    console.log('\n🎉 密码重置测试完成!')
    console.log('📝 新密码:', newPassword)
    console.log('💡 请使用这个密码进行登录测试')

  } catch (error) {
    console.error('💥 测试过程中发生错误:', error.message)
  }
}

// 运行测试
resetPassword()


