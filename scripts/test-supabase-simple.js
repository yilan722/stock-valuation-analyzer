require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 简单 Supabase 连接测试');
console.log('========================');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseAnonKey ? '✅ 已设置' : '❌ 未设置'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ 环境变量未正确设置');
  process.exit(1);
}

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔄 测试基本连接...');
    
    // 测试数据库连接
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`❌ 数据库连接失败: ${error.message}`);
    } else {
      console.log('✅ 数据库连接成功');
    }
    
    // 测试认证连接
    console.log('\n🔄 测试认证连接...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log(`❌ 认证连接失败: ${authError.message}`);
    } else {
      console.log('✅ 认证连接成功');
    }
    
  } catch (error) {
    console.error('💥 测试过程中出现异常:', error.message);
  }
}

// 运行测试
testConnection().then(() => {
  console.log('\n✅ 测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});



