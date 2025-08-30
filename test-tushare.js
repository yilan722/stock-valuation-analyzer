const axios = require('axios');

const TUSHARE_TOKEN = '37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9';
const TUSHARE_API_URL = 'http://api.tushare.pro';

async function testTushareAPI() {
  try {
    console.log('🔍 测试Tushare API...');
    
    // 测试daily API
    const dailyResponse = await axios.post(TUSHARE_API_URL, {
      api_name: 'daily',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: '002244.SZ',
        limit: 1
      },
      fields: 'ts_code,trade_date,open,high,low,close,vol,amount'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Opus4ModelValuation/1.0'
      }
    });

    console.log('✅ Daily API 响应:', JSON.stringify(dailyResponse.data, null, 2));

    // 检查响应结构
    if (dailyResponse.data.code !== 0) {
      console.error('❌ API错误:', dailyResponse.data.msg);
      return;
    }

    if (!dailyResponse.data.data || !dailyResponse.data.data.items || dailyResponse.data.data.items.length === 0) {
      console.error('❌ 没有数据');
      return;
    }

    console.log('✅ 数据获取成功');
    console.log('字段:', dailyResponse.data.data.fields);
    console.log('数据:', dailyResponse.data.data.items[0]);

    // 测试daily_basic API
    const tradeDate = dailyResponse.data.data.items[0][1]; // trade_date
    console.log('🔍 测试daily_basic API，交易日期:', tradeDate);
    
    try {
      const basicResponse = await axios.post(TUSHARE_API_URL, {
        api_name: 'daily_basic',
        token: TUSHARE_TOKEN,
        params: {
          ts_code: '002244.SZ',
          trade_date: tradeDate
        },
        fields: 'ts_code,trade_date,total_mv,pe,pb,ps,dv_ratio,dv_ttm'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Opus4ModelValuation/1.0'
        }
      });

      console.log('✅ Daily_basic API 响应:', JSON.stringify(basicResponse.data, null, 2));
    } catch (basicError) {
      console.error('❌ Daily_basic API 失败:', basicError.message);
    }

    // 测试stock_basic API
    console.log('🔍 测试stock_basic API...');
    try {
      const stockBasicResponse = await axios.post(TUSHARE_API_URL, {
        api_name: 'stock_basic',
        token: TUSHARE_TOKEN,
        params: {
          ts_code: '002244.SZ'
        },
        fields: 'ts_code,symbol,name,area,industry,market,list_date'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Opus4ModelValuation/1.0'
        }
      });

      console.log('✅ Stock_basic API 响应:', JSON.stringify(stockBasicResponse.data, null, 2));
    } catch (stockBasicError) {
      console.error('❌ Stock_basic API 失败:', stockBasicError.message);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testTushareAPI();
