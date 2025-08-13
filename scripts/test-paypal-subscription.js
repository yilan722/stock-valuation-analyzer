require('dotenv').config();
const https = require('https');

// PayPal沙盒环境配置
const PAYPAL_CONFIG = {
  SANDBOX_BASE_URL: 'https://api-m.sandbox.paypal.com',
  CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET
};

// 测试PayPal订阅功能
async function testPayPalSubscription() {
  console.log('🧪 开始测试PayPal订阅功能...\n');
  
  // 检查环境变量
  console.log('📋 环境变量检查:');
  console.log(`   CLIENT_ID: ${PAYPAL_CONFIG.CLIENT_ID ? '✅ 已设置' : '❌ 未设置'}`);
  console.log(`   CLIENT_SECRET: ${PAYPAL_CONFIG.CLIENT_SECRET ? '✅ 已设置' : '❌ 未设置'}`);
  console.log(`   BASE_URL: ${PAYPAL_CONFIG.SANDBOX_BASE_URL}\n`);
  
  if (!PAYPAL_CONFIG.CLIENT_ID || !PAYPAL_CONFIG.CLIENT_SECRET) {
    console.log('❌ PayPal凭据未配置，无法继续测试');
    return;
  }
  
  try {
    // 测试1: 获取访问令牌
    console.log('🔑 测试1: 获取PayPal访问令牌...');
    const accessToken = await getPayPalAccessToken();
    console.log(`   ✅ 访问令牌获取成功: ${accessToken.substring(0, 20)}...\n`);
    
    // 测试2: 创建或获取产品
    console.log('🏷️ 测试2: 创建/获取PayPal产品...');
    const productId = await createOrGetProduct(accessToken);
    console.log(`   ✅ 产品ID: ${productId}\n`);
    
    // 测试3: 创建计费计划
    console.log('📋 测试3: 创建计费计划...');
    const planId = await createBillingPlan(accessToken, productId, 'Standard Plan', 29.99);
    console.log(`   ✅ 计费计划ID: ${planId}\n`);
    
    // 测试4: 创建订阅
    console.log('💳 测试4: 创建订阅...');
    const subscription = await createSubscription(accessToken, planId);
    console.log(`   ✅ 订阅创建成功: ${subscription.id}`);
    console.log(`   ✅ 订阅状态: ${subscription.status}`);
    console.log(`   ✅ 批准链接: ${subscription.links?.find(l => l.rel === 'approve')?.href}\n`);
    
    console.log('🎉 所有订阅测试通过！PayPal订阅功能工作正常。');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
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

// 创建或获取产品
function createOrGetProduct(accessToken) {
  return new Promise((resolve, reject) => {
    const productData = JSON.stringify({
      name: 'Opus4 Model Valuation Subscription',
      description: 'AI-powered stock analysis and valuation reports',
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
      description: `${planName} - Monthly subscription for Opus4 Model Valuation`,
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
      start_time: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      subscriber: {
        name: {
          given_name: 'Test',
          surname: 'User'
        },
        email_address: 'test@example.com'
      },
      application_context: {
        brand_name: 'Opus4 Model Valuation',
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

// 运行测试
if (require.main === module) {
  testPayPalSubscription();
}

module.exports = { testPayPalSubscription }; 