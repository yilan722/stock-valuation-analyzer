require('dotenv').config();
const https = require('https');

// PayPal沙盒环境配置
const PAYPAL_CONFIG = {
  SANDBOX_BASE_URL: 'https://api-m.sandbox.paypal.com',
  CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET
};

// 测试PayPal账户状态
async function testPayPalAccount() {
  console.log('🧪 开始测试PayPal沙盒账户状态...\n');
  
  try {
    // 获取访问令牌
    console.log('🔑 获取PayPal访问令牌...');
    const accessToken = await getPayPalAccessToken();
    console.log(`   ✅ 访问令牌获取成功\n`);
    
    // 测试1: 检查账户信息
    console.log('👤 测试1: 检查账户信息...');
    await testAccountInfo(accessToken);
    
    // 测试2: 检查付款方式
    console.log('\n💳 测试2: 检查付款方式...');
    await testPaymentMethods(accessToken);
    
    // 测试3: 检查订阅状态
    console.log('\n📋 测试3: 检查订阅状态...');
    await testSubscriptionStatus(accessToken);
    
    console.log('\n🎉 账户状态测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
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

// 测试账户信息
function testAccountInfo(accessToken) {
  return new Promise((resolve, reject) => {
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
          } else {
            console.log(`   ⚠️ 账户信息获取失败: ${res.statusCode}`);
          }
          resolve();
        } catch (error) {
          console.log(`   ⚠️ 解析账户信息失败: ${error.message}`);
          resolve();
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ⚠️ 账户信息请求失败: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

// 测试付款方式
function testPaymentMethods(accessToken) {
  return new Promise((resolve, reject) => {
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
              console.log('   ✅ 找到付款方式');
              response.credit_cards.forEach((card, index) => {
                console.log(`   💳 卡片 ${index + 1}: ${card.brand} ****${card.last4}`);
              });
            } else {
              console.log('   ⚠️ 未找到付款方式');
            }
          } else {
            console.log(`   ⚠️ 付款方式查询失败: ${res.statusCode}`);
          }
          resolve();
        } catch (error) {
          console.log(`   ⚠️ 解析付款方式失败: ${error.message}`);
          resolve();
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ⚠️ 付款方式请求失败: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

// 测试订阅状态
function testSubscriptionStatus(accessToken) {
  return new Promise((resolve, reject) => {
    // 从日志中获取的订阅ID
    const subscriptionIds = [
      'I-6MYYD7MRDUCV',
      'I-X6T1NCF192E2'
    ];
    
    console.log(`   📋 检查 ${subscriptionIds.length} 个订阅...`);
    
    subscriptionIds.forEach(async (subscriptionId) => {
      try {
        const status = await getSubscriptionStatus(accessToken, subscriptionId);
        console.log(`   🔍 订阅 ${subscriptionId}: ${status}`);
      } catch (error) {
        console.log(`   ❌ 订阅 ${subscriptionId} 状态查询失败: ${error.message}`);
      }
    });
    
    setTimeout(resolve, 2000); // 等待异步查询完成
  });
}

// 获取订阅状态
function getSubscriptionStatus(accessToken, subscriptionId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: `/v1/billing/subscriptions/${subscriptionId}`,
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
            resolve(response.status);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// 运行测试
if (require.main === module) {
  testPayPalAccount();
}

module.exports = { testPayPalAccount }; 