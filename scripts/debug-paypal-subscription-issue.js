require('dotenv').config();
const https = require('https');

// PayPal沙盒环境配置
const PAYPAL_CONFIG = {
  SANDBOX_BASE_URL: 'https://api-m.sandbox.paypal.com',
  CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET
};

// 深入诊断PayPal订阅问题
async function debugPayPalSubscriptionIssue() {
  console.log('🔍 开始深入诊断PayPal订阅付款方式问题...\n');
  
  try {
    // 获取访问令牌
    console.log('🔑 获取PayPal访问令牌...');
    const accessToken = await getPayPalAccessToken();
    console.log(`   ✅ 访问令牌获取成功\n`);
    
    // 诊断1: 检查沙盒账户状态
    console.log('👤 诊断1: 检查沙盒账户状态...');
    await checkSandboxAccountStatus(accessToken);
    
    // 诊断2: 检查测试卡详细信息
    console.log('\n💳 诊断2: 检查测试卡详细信息...');
    await checkTestCardDetails(accessToken);
    
    // 诊断3: 检查订阅详细状态
    console.log('\n📋 诊断3: 检查订阅详细状态...');
    await checkSubscriptionDetails(accessToken);
    
    // 诊断4: 尝试创建新的测试订阅
    console.log('\n🧪 诊断4: 尝试创建新的测试订阅...');
    await createTestSubscription(accessToken);
    
    console.log('\n🎯 诊断完成！请查看上面的详细信息。');
    
  } catch (error) {
    console.error('❌ 诊断失败:', error.message);
    console.error('   详细错误:', error);
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

// 检查沙盒账户状态
function checkSandboxAccountStatus(accessToken) {
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

// 检查测试卡详细信息
function checkTestCardDetails(accessToken) {
  return new Promise((resolve) => {
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
              console.log('   ✅ 找到测试卡');
              response.credit_cards.forEach((card, index) => {
                console.log(`   💳 卡片 ${index + 1}:`);
                console.log(`      - 品牌: ${card.brand}`);
                console.log(`      - 卡号: ****${card.last4}`);
                console.log(`      - 类型: ${card.type}`);
                console.log(`      - 状态: ${card.state}`);
                console.log(`      - 创建时间: ${card.create_time}`);
              });
            } else {
              console.log('   ⚠️ 未找到测试卡');
              console.log('   💡 建议: 在PayPal沙盒环境中生成新的测试卡');
            }
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

// 检查订阅详细状态
function checkSubscriptionDetails(accessToken) {
  return new Promise((resolve) => {
    // 从日志中获取的订阅ID
    const subscriptionIds = [
      'I-6MYYD7MRDUCV',
      'I-X6T1NCF192E2'
    ];
    
    console.log(`   📋 检查 ${subscriptionIds.length} 个订阅的详细信息...`);
    
    subscriptionIds.forEach(async (subscriptionId) => {
      try {
        const details = await getSubscriptionDetails(accessToken, subscriptionId);
        if (details) {
          console.log(`   🔍 订阅 ${subscriptionId}:`);
          console.log(`      - 状态: ${details.status}`);
          console.log(`      - 计划ID: ${details.plan_id}`);
          console.log(`      - 创建时间: ${details.create_time}`);
          console.log(`      - 开始时间: ${details.start_time}`);
          console.log(`      - 数量: ${details.quantity}`);
          
          if (details.billing_info) {
            console.log(`      - 计费信息: ${JSON.stringify(details.billing_info)}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ 订阅 ${subscriptionId} 详情查询失败: ${error.message}`);
      }
    });
    
    setTimeout(resolve, 3000); // 等待异步查询完成
  });
}

// 获取订阅详细信息
function getSubscriptionDetails(accessToken, subscriptionId) {
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
            resolve(response);
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

// 尝试创建新的测试订阅
function createTestSubscription(accessToken) {
  return new Promise(async (resolve) => {
    try {
      console.log('   🏷️ 创建测试产品...');
      const productId = await createProduct(accessToken);
      console.log(`      ✅ 产品ID: ${productId}`);
      
      console.log('   📋 创建测试计费计划...');
      const planId = await createBillingPlan(accessToken, productId, 'Debug Plan', 0.01);
      console.log(`      ✅ 计费计划ID: ${planId}`);
      
      console.log('   💳 创建测试订阅...');
      const subscription = await createSubscription(accessToken, planId);
      console.log(`      ✅ 订阅创建成功: ${subscription.id}`);
      console.log(`      ✅ 订阅状态: ${subscription.status}`);
      
      const approvalLink = subscription.links?.find(l => l.rel === 'approve')?.href;
      if (approvalLink) {
        console.log(`      🔗 批准链接: ${approvalLink}`);
        console.log('      💡 请使用这个链接测试付款方式设置');
      }
      
    } catch (error) {
      console.log(`   ❌ 测试订阅创建失败: ${error.message}`);
    }
    resolve();
  });
}

// 创建产品
function createProduct(accessToken) {
  return new Promise((resolve, reject) => {
    const productData = JSON.stringify({
      name: 'Debug Test Product',
      description: 'Product for debugging subscription issues',
      type: 'SERVICE',
      category: 'SOFTWARE'
    });
    
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: '/v1/catalogs/products',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(productData),
        'Prefer': 'return=representation'
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
          if (response.id) {
            resolve(response.id);
          } else {
            reject(new Error(`创建产品失败: ${response.message || '未知错误'}`));
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`));
    });
    
    req.write(productData);
    req.end();
  });
}

// 创建计费计划
function createBillingPlan(accessToken, productId, planName, amount) {
  return new Promise((resolve, reject) => {
    const planData = JSON.stringify({
      product_id: productId,
      name: planName,
      description: `${planName} - Debug test plan`,
      type: 'FIXED',
      billing_cycles: [{
        frequency: {
          interval_unit: 'MONTH',
          interval_count: 1
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: {
          fixed_price: {
            value: amount.toString(),
            currency_code: 'USD'
          }
        }
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: '0',
          currency_code: 'USD'
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      }
    });
    
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: '/v1/billing/plans',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(planData),
        'Prefer': 'return=representation'
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
          if (response.id) {
            resolve(response.id);
          } else {
            reject(new Error(`创建计费计划失败: ${response.message || '未知错误'}`));
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`));
    });
    
    req.write(planData);
    req.end();
  });
}

// 创建订阅
function createSubscription(accessToken, planId) {
  return new Promise((resolve, reject) => {
    const subscriptionData = JSON.stringify({
      plan_id: planId,
      start_time: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      subscriber: {
        name: {
          given_name: 'Debug',
          surname: 'Test'
        },
        email_address: 'debug@test.com'
      },
      application_context: {
        brand_name: 'Opus4 Debug',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }
    });
    
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: '/v1/billing/subscriptions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(subscriptionData),
        'Prefer': 'return=representation'
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
          if (response.id) {
            resolve(response);
          } else {
            reject(new Error(`创建订阅失败: ${response.message || '未知错误'}`));
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`));
    });
    
    req.write(subscriptionData);
    req.end();
  });
}

// 运行诊断
if (require.main === module) {
  debugPayPalSubscriptionIssue();
}

module.exports = { debugPayPalSubscriptionIssue }; 