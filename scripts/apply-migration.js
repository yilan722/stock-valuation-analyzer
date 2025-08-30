const { createClient } = require('@supabase/supabase-js')

// 配置
const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDYzMjI1MywiZXhwIjoyMDcwMjA4MjUzfQ.TYomlDXMETtWVXPcyoL8kDdRga4cw48cJmmQnfxmWkI'

// 创建服务端客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('🔧 开始应用数据库迁移...\n')
  
  try {
    // 读取迁移文件
    const fs = require('fs')
    const path = require('path')
    
    const migrationPath = path.join(__dirname, '../supabase/migrations/007_add_user_profile_trigger.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📋 迁移SQL内容:')
    console.log(migrationSQL)
    console.log('\n' + '='.repeat(50) + '\n')
    
    // 执行迁移
    console.log('🚀 执行迁移...')
    
    // 分割SQL语句并逐个执行
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`📝 执行语句 ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.log(`⚠️ 语句 ${i + 1} 执行结果:`, error.message)
        } else {
          console.log(`✅ 语句 ${i + 1} 执行成功`)
        }
      } catch (err) {
        console.log(`⚠️ 语句 ${i + 1} 执行异常:`, err.message)
      }
    }
    
    console.log('\n🎉 迁移应用完成!')
    
    // 测试触发器是否工作
    console.log('\n🧪 测试触发器...')
    
    // 创建一个测试用户
    const { data: testUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'trigger-test@example.com',
      password: 'testpassword123',
      user_metadata: { name: 'Trigger Test User' }
    })
    
    if (createError) {
      console.log('⚠️ 创建测试用户失败:', createError.message)
    } else {
      console.log('✅ 测试用户创建成功:', testUser.user.id)
      
      // 检查profile是否自动创建
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', testUser.user.id)
        .single()
      
      if (profileError) {
        console.log('❌ Profile自动创建失败:', profileError.message)
      } else {
        console.log('✅ Profile自动创建成功:', profile)
      }
      
      // 清理测试用户
      const { error: deleteError } = await supabase.auth.admin.deleteUser(testUser.user.id)
      if (deleteError) {
        console.log('⚠️ 清理测试用户失败:', deleteError.message)
      } else {
        console.log('🧹 测试用户清理完成')
      }
    }
    
  } catch (error) {
    console.error('💥 迁移过程中发生错误:', error)
  }
}

// 运行迁移
applyMigration()

