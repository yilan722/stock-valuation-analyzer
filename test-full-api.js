const axios = require('axios');

const TUSHARE_TOKEN = '37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9';
const TUSHARE_API_URL = 'http://api.tushare.pro';

async function fetchAStockData(ticker) {
  console.log(`\n🔄 开始获取 ${ticker} 的完整数据...`);
  
  // 判断是深市还是沪市
  const isShanghai = ticker.startsWith('6') || ticker.startsWith('9');
  const marketSuffix = isShanghai ? '.SH' : '.SZ';
  
  console.log(`📍 市场判断: ${ticker} -> ${marketSuffix}`);
  
  try {
    // 1. 获取基本信息
    console.log('1️⃣ 获取公司基本信息...');
    const basicInfoResponse = await axios.post(TUSHARE_API_URL, {
      api_name: 'stock_basic',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: `${ticker}${marketSuffix}`
      },
      fields: 'ts_code,symbol,name,area,industry,market,list_date'
    });
    
    console.log('基本信息响应:', basicInfoResponse.data);
    
    let companyName = `${ticker} (A股)`;
    if (basicInfoResponse.data.data && basicInfoResponse.data.data.items && basicInfoResponse.data.data.items.length > 0) {
      const item = basicInfoResponse.data.data.items[0];
      const fields = basicInfoResponse.data.data.fields;
      const nameIndex = fields.indexOf('name');
      companyName = item[nameIndex];
      console.log(`✅ 公司名称: ${companyName}`);
    }

    // 2. 获取日行情数据
    console.log('2️⃣ 获取日行情数据...');
    const dailyResponse = await axios.post(TUSHARE_API_URL, {
      api_name: 'daily',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: `${ticker}${marketSuffix}`,
        limit: 1
      },
      fields: 'ts_code,trade_date,open,high,low,close,vol,amount'
    });

    console.log('日行情响应:', dailyResponse.data);

    if (dailyResponse.data.code !== 0) {
      throw new Error(`Tushare API error: ${dailyResponse.data.msg || 'Unknown error'}`);
    }

    if (!dailyResponse.data.data || !dailyResponse.data.data.items || dailyResponse.data.data.items.length === 0) {
      throw new Error('No daily data found');
    }

    const latestData = dailyResponse.data.data.items[0];
    const fields = dailyResponse.data.data.fields;
    
    const closeIndex = fields.indexOf('close');
    const volIndex = fields.indexOf('vol');
    const openIndex = fields.indexOf('open');
    const amountIndex = fields.indexOf('amount');
    const tradeDateIndex = fields.indexOf('trade_date');
    
    const currentPrice = parseFloat(latestData[closeIndex]);
    const openPrice = parseFloat(latestData[openIndex]);
    const volume = parseInt(latestData[volIndex]) || 0;
    const amount = parseFloat(latestData[amountIndex]) || 0;
    const tradeDate = latestData[tradeDateIndex];
    const change = currentPrice - openPrice;
    const changePercent = (change / openPrice) * 100;

    console.log(`✅ 解析的数据: price=${currentPrice}, volume=${volume}, amount=${amount}, date=${tradeDate}`);

    // 3. 获取基本面数据
    console.log('3️⃣ 获取基本面数据...');
    const basicResponse = await axios.post(TUSHARE_API_URL, {
      api_name: 'daily_basic',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: `${ticker}${marketSuffix}`,
        trade_date: tradeDate
      },
      fields: 'ts_code,trade_date,total_mv,pe,pb,ps,dv_ratio,dv_ttm'
    });

    console.log('基本面响应:', basicResponse.data);

    let marketCap = 0;
    let peRatio = 0;
    
    if (basicResponse.data.data && basicResponse.data.data.items && basicResponse.data.data.items.length > 0) {
      const basicData = basicResponse.data.data.items[0];
      const basicFields = basicResponse.data.data.fields;
      
      const totalMvIndex = basicFields.indexOf('total_mv');
      const peIndex = basicFields.indexOf('pe');
      
      marketCap = parseFloat(basicData[totalMvIndex]) || 0;
      peRatio = parseFloat(basicData[peIndex]) || 0;
      
      console.log(`✅ 基本面数据: marketCap=${marketCap}, peRatio=${peRatio}`);
    }

    // 构建最终结果
    const result = {
      symbol: ticker,
      name: companyName,
      price: currentPrice,
      marketCap: marketCap * 10000, // 转换为元
      peRatio: peRatio || 0,
      amount: amount / 10000, // 转换为万元
      volume: volume,
      change: change,
      changePercent: changePercent
    };

    console.log('🎉 最终结果:', result);
    return result;

  } catch (error) {
    console.error(`❌ 获取 ${ticker} 数据失败:`, error.message);
    throw error;
  }
}

// 测试 300080
fetchAStockData('300080');
