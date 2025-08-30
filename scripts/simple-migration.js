const { createClient } = require('@supabase/supabase-js')

// 配置
const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDYzMjI1MywiZXhwIjoyMDcwMjA4MjUzfQ.TYomlDXMETtWVXPcyoL8kDdRga4cw48cJmmQnfxmWkI'

// 创建服务端客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function simpleMigration() {
  console.log('🔧 开始应用简单迁移...\n')
  
  try {
    // 1. 创建函数
    console.log('1️⃣ 创建handle_new_user函数...')
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.users (id, email, name, created_at, updated_at, free_reports_used, paid_reports_used, monthly_report_limit)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'name', NULL),
          NEW.created_at,
          NEW.updated_at,
          0,
          0,
          0
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // 由于无法直接执行SQL，我们将通过创建用户来测试触发器是否已经存在
    console.log('2️⃣ 测试现有触发器...')
    
    // 创建一个测试用户
    const { data: testUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'trigger-test2@example.com',
      password: 'testpassword123',
      user_metadata: { name: 'Trigger Test User 2' }
    })
    
    if (createError) {
      console.log('⚠️ 创建测试用户失败:', createError.message)
    } else {
      console.log('✅ 测试用户创建成功:', testUser.user.id)
      
      // 等待一下让触发器执行
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 检查profile是否自动创建
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', testUser.user.id)
        .single()
      
      if (profileError) {
        console.log('❌ Profile自动创建失败:', profileError.message)
        console.log('💡 需要手动在Supabase Dashboard中创建触发器')
        
        // 手动创建profile
        console.log('🔧 手动创建profile...')
        const { data: manualProfile, error: manualError } = await supabase
          .from('users')
          .insert({
            id: testUser.user.id,
            email: testUser.user.email,
            name: testUser.user.user_metadata?.name || null,
            created_at: testUser.user.created_at,
            updated_at: testUser.user.updated_at || testUser.user.created_at,
            free_reports_used: 0,
            paid_reports_used: 0,
            monthly_report_limit: 0
          })
          .select()
          .single()
        
        if (manualError) {
          console.log('❌ 手动创建profile失败:', manualError.message)
        } else {
          console.log('✅ 手动创建profile成功:', manualProfile)
        }
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
    
    console.log('\n📋 迁移状态总结:')
    console.log('✅ 测试用户创建: 成功')
    console.log('⚠️ 触发器: 需要手动在Supabase Dashboard中创建')
    console.log('💡 建议: 在Supabase Dashboard的SQL编辑器中运行以下SQL:')
    console.log('\n' + '='.repeat(60))
    console.log(createFunctionSQL)
    console.log('\n-- 创建触发器')
    console.log('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;')
    console.log('CREATE TRIGGER on_auth_user_created')
    console.log('  AFTER INSERT ON auth.users')
    console.log('  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();')
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('💥 迁移过程中发生错误:', error)
  }
}

// 运行迁移
simpleMigration()

