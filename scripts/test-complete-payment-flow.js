require('dotenv').config();
const https = require('https');

// PayPal沙盒环境配置
const PAYPAL_CONFIG = {
  SANDBOX_BASE_URL: 'https://api-m.sandbox.paypal.com',
  CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET
};

// 测试完整支付流程
async function testCompletePaymentFlow() {
  console.log('🧪 开始测试完整PayPal支付流程...\n');
  
  try {
    // 步骤1: 获取访问令牌
    console.log('🔑 步骤1: 获取PayPal访问令牌...');
    const accessToken = await getPayPalAccessToken();
    console.log(`   ✅ 访问令牌获取成功\n`);
    
    // 步骤2: 创建产品
    console.log('🏷️ 步骤2: 创建PayPal产品...');
    const productId = await createProduct(accessToken);
    console.log(`   ✅ 产品创建成功: ${productId}\n`);
    
    // 步骤3: 创建计费计划
    console.log('📋 步骤3: 创建计费计划...');
    const planId = await createBillingPlan(accessToken, productId, 'Test Plan', 1.00);
    console.log(`   ✅ 计费计划创建成功: ${planId}\n`);
    
    // 步骤4: 创建订阅
    console.log('💳 步骤4: 创建订阅...');
    const subscription = await createSubscription(accessToken, planId);
    console.log(`   ✅ 订阅创建成功: ${subscription.id}`);
    console.log(`   ✅ 订阅状态: ${subscription.status}`);
    
    // 步骤5: 获取批准链接
    const approvalLink = subscription.links?.find(l => l.rel === 'approve')?.href;
    if (approvalLink) {
      console.log(`   ✅ 批准链接: ${approvalLink}\n`);
      
      // 步骤6: 模拟用户批准流程
      console.log('👤 步骤5: 模拟用户批准流程...');
      console.log('   📝 请按照以下步骤操作:');
      console.log('   1. 复制上面的批准链接到浏览器');
      console.log('   2. 使用PayPal沙盒测试账户登录');
      console.log('   3. 添加测试信用卡 (如: 4005519200000004)');
      console.log('   4. 完成订阅批准');
      console.log('   5. 返回查看订阅状态\n');
      
      // 等待用户操作
      console.log('⏳ 等待用户操作完成... (30秒后自动检查状态)');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // 步骤7: 检查订阅状态
      console.log('🔍 步骤6: 检查订阅状态...');
      const finalStatus = await getSubscriptionStatus(accessToken, subscription.id);
      console.log(`   ✅ 最终订阅状态: ${finalStatus}`);
      
      if (finalStatus === 'ACTIVE') {
        console.log('   🎉 订阅激活成功！');
      } else if (finalStatus === 'APPROVAL_PENDING') {
        console.log('   ⏳ 订阅仍在等待批准...');
      } else {
        console.log(`   ⚠️ 订阅状态: ${finalStatus}`);
      }
    }
    
    console.log('\n🎉 完整支付流程测试完成！');
    
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

// 创建产品
function createProduct(accessToken) {
  return new Promise((resolve, reject) => {
    const productData = JSON.stringify({
      name: 'Test Product for Payment Flow',
      description: 'Test product to verify complete payment flow',
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
      description: `${planName} - Test billing plan`,
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
  testCompletePaymentFlow();
}

module.exports = { testCompletePaymentFlow }; 