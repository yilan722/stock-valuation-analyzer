require('dotenv').config();
const https = require('https');

// PayPal沙盒环境配置
const PAYPAL_CONFIG = {
  SANDBOX_BASE_URL: 'https://api-m.sandbox.paypal.com',
  CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET
};

// 检查沙盒账户权限
async function checkSandboxPermissions() {
  console.log('🔍 检查PayPal沙盒账户权限...\n');
  
  try {
    // 获取访问令牌
    console.log('🔑 获取PayPal访问令牌...');
    const accessToken = await getPayPalAccessToken();
    console.log(`   ✅ 访问令牌获取成功\n`);
    
    // 检查1: 账户基本信息
    console.log('👤 检查1: 账户基本信息...');
    await checkAccountInfo(accessToken);
    
    // 检查2: 账户权限
    console.log('\n🔐 检查2: 账户权限...');
    await checkAccountPermissions(accessToken);
    
    // 检查3: 测试卡生成权限
    console.log('\n💳 检查3: 测试卡生成权限...');
    await checkCardGenerationPermissions(accessToken);
    
    // 检查4: 订阅功能权限
    console.log('\n📋 检查4: 订阅功能权限...');
    await checkSubscriptionPermissions(accessToken);
    
    console.log('\n🎯 权限检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

// 获取PayPal访问令牌
function getPayPalAccessToken() {
  return new Promise((resolve, reject) => {
    const postData = 'grant_type=client_credentials';
    
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: '/v1/oauth2/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CONFIG.CLIENT_ID}:${PAYPAL_CONFIG.CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error(`获取访问令牌失败: ${response.error_description || '未知错误'}`));
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`));
    });
    
    req.write(postData);
    req.end();
  });
}

// 检查账户基本信息
function checkAccountInfo(accessToken) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: '/v1/identity/oauth2/userinfo',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            console.log('   ✅ 账户信息获取成功');
            console.log(`   📧 邮箱: ${response.email || 'N/A'}`);
            console.log(`   🆔 账户ID: ${response.account_id || 'N/A'}`);
            console.log(`   🔐 账户类型: ${response.account_type || 'N/A'}`);
            console.log(`   🌍 地区: ${response.locale || 'N/A'}`);
            console.log(`   🔗 账户链接: ${response.account_id ? `https://www.sandbox.paypal.com/myaccount/summary` : 'N/A'}`);
          } else {
            console.log(`   ⚠️ 账户信息获取失败: ${res.statusCode}`);
          }
        } catch (error) {
          console.log(`   ⚠️ 解析账户信息失败: ${error.message}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ⚠️ 账户信息请求失败: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

// 检查账户权限
function checkAccountPermissions(accessToken) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: '/v1/identity/oauth2/userinfo?schema=paypalv1.1',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            console.log('   ✅ 扩展账户信息获取成功');
            
            if (response.verified_account) {
              console.log(`   ✅ 账户已验证: ${response.verified_account}`);
            }
            
            if (response.payer_id) {
              console.log(`   🆔 付款人ID: ${response.payer_id}`);
            }
            
            if (response.address) {
              console.log(`   🏠 地址信息: 已设置`);
            }
            
          } else {
            console.log(`   ⚠️ 扩展账户信息获取失败: ${res.statusCode}`);
          }
        } catch (error) {
          console.log(`   ⚠️ 解析扩展账户信息失败: ${error.message}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ⚠️ 扩展账户信息请求失败: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

// 检查测试卡生成权限
function checkCardGenerationPermissions(accessToken) {
  return new Promise((resolve) => {
    console.log('   💳 检查测试卡相关权限...');
    
    // 尝试获取现有卡片
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: '/v1/vault/credit-cards',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            if (response.credit_cards && response.credit_cards.length > 0) {
              console.log(`   ✅ 找到 ${response.credit_cards.length} 张测试卡`);
              console.log('   💡 说明: 账户有测试卡生成权限');
            } else {
              console.log('   ⚠️ 未找到测试卡');
              console.log('   💡 可能原因:');
              console.log('      - 账户权限不足');
              console.log('      - 沙盒环境配置问题');
              console.log('      - 需要重新激活沙盒账户');
            }
          } else if (res.statusCode === 403) {
            console.log('   ❌ 权限不足: 无法访问测试卡功能');
            console.log('   💡 建议: 检查沙盒账户状态');
          } else {
            console.log(`   ⚠️ 测试卡查询失败: ${res.statusCode}`);
          }
        } catch (error) {
          console.log(`   ⚠️ 解析测试卡信息失败: ${error.message}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ⚠️ 测试卡请求失败: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

// 检查订阅功能权限
function checkSubscriptionPermissions(accessToken) {
  return new Promise((resolve) => {
    console.log('   📋 检查订阅功能权限...');
    
    // 尝试获取订阅列表
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: '/v1/billing/subscriptions',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            console.log(`   ✅ 订阅功能正常: 找到 ${response.subscriptions?.length || 0} 个订阅`);
            console.log('   💡 说明: 账户有订阅管理权限');
          } else if (res.statusCode === 403) {
            console.log('   ❌ 权限不足: 无法访问订阅功能');
          } else {
            console.log(`   ⚠️ 订阅功能检查失败: ${res.statusCode}`);
          }
        } catch (error) {
          console.log(`   ⚠️ 解析订阅信息失败: ${error.message}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ⚠️ 订阅功能请求失败: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

// 运行检查
if (require.main === module) {
  checkSandboxPermissions();
}

module.exports = { checkSandboxPermissions }; 