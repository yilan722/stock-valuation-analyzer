const axios = require('axios');

const TUSHARE_TOKEN = '37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9';
const HTTPS_URL = 'https://api.tushare.pro';

async function testHTTPS() {
  try {
    console.log('🔄 测试 HTTPS Tushare API...');
    
    const response = await axios.post(HTTPS_URL, {
      api_name: 'daily',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: '300777.SZ',
        limit: 1
      },
      fields: 'ts_code,trade_date,open,high,low,close,vol,amount'
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Opus4ModelValuation/1.0'
      }
    });

    console.log('✅ HTTPS API 响应:');
    console.log('状态码:', response.data.code);
    console.log('数据:', response.data.data);

    if (response.data.code === 0 && response.data.data?.items?.length > 0) {
      console.log('🎉 300777 数据获取成功!');
      const item = response.data.data.items[0];
      console.log('股票代码:', item[0]);
      console.log('交易日期:', item[1]);
      console.log('收盘价:', item[5]);
    }

  } catch (error) {
    console.error('❌ HTTPS API 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testHTTPS();
