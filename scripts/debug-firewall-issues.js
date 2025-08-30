#!/usr/bin/env node

/**
 * 防火墙问题诊断脚本
 * 用于检测和解决登录相关的防火墙问题
 */

const https = require('https');
const http = require('http');

// 配置
const config = {
  supabaseUrl: 'https://decmecsshjqymhkykazg.supabase.co',
  testEndpoints: [
    '/auth/v1/token?grant_type=password',
    '/rest/v1/users',
    '/rest/v1/rpc/can_generate_report'
  ],
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
};

// 测试函数
async function testEndpoint(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': config.userAgent,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 诊断函数
async function diagnoseFirewallIssues() {
  console.log('🔍 开始诊断防火墙问题...\n');

  // 测试基本连接
  console.log('1. 测试基本连接...');
  try {
    const result = await testEndpoint(`${config.supabaseUrl}/rest/v1/`);
    console.log(`✅ 基本连接成功: ${result.statusCode}`);
  } catch (error) {
    console.log(`❌ 基本连接失败: ${error.message}`);
    return;
  }

  // 测试认证端点
  console.log('\n2. 测试认证端点...');
  for (const endpoint of config.testEndpoints) {
    try {
      const result = await testEndpoint(`${config.supabaseUrl}${endpoint}`);
      console.log(`✅ ${endpoint}: ${result.statusCode}`);
      
      if (result.statusCode === 403 || result.statusCode === 429) {
        console.log(`⚠️  可能的防火墙限制: ${result.statusCode}`);
        console.log(`   响应头: ${JSON.stringify(result.headers, null, 2)}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }

  // 测试速率限制
  console.log('\n3. 测试速率限制...');
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(testEndpoint(`${config.supabaseUrl}/rest/v1/`));
  }
  
  try {
    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ 并发请求测试: ${successCount} 成功, ${failureCount} 失败`);
    
    if (failureCount > 0) {
      console.log('⚠️  检测到可能的速率限制');
    }
  } catch (error) {
    console.log(`❌ 速率限制测试失败: ${error.message}`);
  }

  console.log('\n4. 建议解决方案:');
  console.log('   - 检查 Vercel 防火墙设置');
  console.log('   - 验证 Supabase 项目配置');
  console.log('   - 检查 IP 白名单设置');
  console.log('   - 联系 Vercel 支持团队');
}

// 运行诊断
if (require.main === module) {
  diagnoseFirewallIssues().catch(console.error);
}

module.exports = { diagnoseFirewallIssues };

