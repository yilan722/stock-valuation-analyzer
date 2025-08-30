const { createClient } = require('@supabase/supabase-js')

// 配置
const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDYzMjI1MywiZXhwIjoyMDcwMjA4MjUzfQ.TYomlDXMETtWVXPcyoL8kDdRga4cw48cJmmQnfxmWkI'

// 创建服务端客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixExistingUsers() {
  console.log('🔧 开始修复现有用户...\n')
  
  try {
    // 1. 获取所有认证用户
    console.log('1️⃣ 获取所有认证用户...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ 获取认证用户失败:', authError.message)
      return
    }
    
    console.log(`📋 找到 ${authUsers.users.length} 个认证用户`)
    
    // 2. 获取所有profile用户
    console.log('\n2️⃣ 获取所有profile用户...')
    const { data: profileUsers, error: profileError } = await supabase
      .from('users')
      .select('id')
    
    if (profileError) {
      console.error('❌ 获取profile用户失败:', profileError.message)
      return
    }
    
    const profileUserIds = new Set(profileUsers.map(u => u.id))
    console.log(`📋 找到 ${profileUsers.length} 个profile用户`)
    
    // 3. 找出需要创建profile的用户
    const usersNeedingProfile = authUsers.users.filter(user => !profileUserIds.has(user.id))
    console.log(`\n3️⃣ 需要创建profile的用户: ${usersNeedingProfile.length} 个`)
    
    if (usersNeedingProfile.length === 0) {
      console.log('✅ 所有用户都有profile，无需修复')
      return
    }
    
    // 4. 为每个用户创建profile
    console.log('\n4️⃣ 开始创建用户profile...')
    let successCount = 0
    let errorCount = 0
    
    for (const user of usersNeedingProfile) {
      try {
        console.log(`📝 为用户 ${user.email} 创建profile...`)
        
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || null,
            created_at: user.created_at,
            updated_at: user.updated_at || user.created_at,
            free_reports_used: 0,
            paid_reports_used: 0,
            monthly_report_limit: 0
          })
          .select()
          .single()
        
        if (insertError) {
          console.error(`❌ 创建profile失败 (${user.email}):`, insertError.message)
          errorCount++
        } else {
          console.log(`✅ Profile创建成功 (${user.email}):`, newProfile.id)
          successCount++
        }
        
        // 添加延迟避免过快请求
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`💥 处理用户 ${user.email} 时发生错误:`, error.message)
        errorCount++
      }
    }
    
    // 5. 总结
    console.log('\n' + '='.repeat(50))
    console.log('📊 修复结果总结:')
    console.log(`✅ 成功创建: ${successCount} 个`)
    console.log(`❌ 失败: ${errorCount} 个`)
    console.log(`📋 总计处理: ${usersNeedingProfile.length} 个`)
    console.log('='.repeat(50))
    
    if (errorCount > 0) {
      console.log('\n⚠️ 部分用户profile创建失败，请检查错误日志')
    } else {
      console.log('\n🎉 所有用户profile创建成功!')
    }
    
  } catch (error) {
    console.error('💥 修复过程中发生错误:', error)
  }
}

// 运行修复
fixExistingUsers()

