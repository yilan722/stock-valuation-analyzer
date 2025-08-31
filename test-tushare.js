const axios = require('axios');

const TUSHARE_TOKEN = '37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9';
const TUSHARE_API_URL = 'http://api.tushare.pro';

async function testTushareAPI() {
  try {
    console.log('🔄 测试 Tushare API...');
    console.log('Token:', TUSHARE_TOKEN);
    
    // 测试获取 300080 (易成新能) 的数据
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'daily',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: '300080.SZ',
        limit: 1
      },
      fields: 'ts_code,trade_date,open,high,low,close,vol,amount'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TestScript/1.0'
      }
    });

    console.log('✅ Tushare API 响应:');
    console.log('状态码:', response.data.code);
    console.log('消息:', response.data.msg);
    console.log('数据:', JSON.stringify(response.data.data, null, 2));

    if (response.data.code === 0) {
      console.log('✅ API 调用成功!');
    } else {
      console.log('❌ API 调用失败:', response.data.msg);
    }

  } catch (error) {
    console.error('❌ Tushare API 测试失败:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testTushareAPI();