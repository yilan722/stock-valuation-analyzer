require('dotenv').config();
const https = require('https');

// PayPal沙盒环境配置
const PAYPAL_CONFIG = {
  SANDBOX_BASE_URL: 'https://api-m.sandbox.paypal.com',
  CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET
};

// 测试PayPal沙盒环境
async function testPayPalSandbox() {
  console.log('🧪 开始测试PayPal沙盒环境...\n');
  
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
    
    // 测试2: 创建测试订单
    console.log('📦 测试2: 创建测试订单...');
    const order = await createTestOrder(accessToken);
    console.log(`   ✅ 测试订单创建成功: ${order.id}\n`);
    
    // 测试3: 获取订单详情
    console.log('📋 测试3: 获取订单详情...');
    const orderDetails = await getOrderDetails(accessToken, order.id);
    console.log(`   ✅ 订单状态: ${orderDetails.status}\n`);
    
    console.log('🎉 所有测试通过！PayPal沙盒环境工作正常。');
    
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

// 创建测试订单
function createTestOrder(accessToken) {
  return new Promise((resolve, reject) => {
    const orderData = JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: 'test-order-' + Date.now(),
        description: 'Test Order for Sandbox Testing',
        amount: {
          currency_code: 'USD',
          value: '1.00'
        }
      }],
      application_context: {
        return_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }
    });
    
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: '/v2/checkout/orders',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(orderData)
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
            reject(new Error(`创建订单失败: ${response.message || '未知错误'}`));
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`));
    });
    
    req.write(orderData);
    req.end();
  });
}

// 获取订单详情
function getOrderDetails(accessToken, orderId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: `/v2/checkout/orders/${orderId}`,
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
          const response = JSON.parse(data);
          if (response.id) {
            resolve(response);
          } else {
            reject(new Error(`获取订单详情失败: ${response.message || '未知错误'}`));
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`));
    });
    
    req.end();
  });
}

// 运行测试
if (require.main === module) {
  testPayPalSandbox();
}

module.exports = { testPayPalSandbox }; 