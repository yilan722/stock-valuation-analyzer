// Cloudflare Pages Function for stock data
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const ticker = url.searchParams.get('ticker')?.toUpperCase();

  if (!ticker) {
    return new Response(JSON.stringify({ error: 'Ticker parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 判断股票类型
    const isAStock = /^[0-9]{6}$/.test(ticker) || ticker.startsWith('688') || ticker.startsWith('300');
    const isHKStock = ticker.includes('.HK') || ticker.includes('.hk');
    const isUSStock = /^[A-Z]{1,5}$/.test(ticker);

    if (isAStock) {
      // 使用Tushare API获取A股数据
      const tushareToken = env.TUSHARE_TOKEN;
      if (!tushareToken) {
        return new Response(JSON.stringify({ error: 'TUSHARE_TOKEN not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const isShanghai = ticker.startsWith('6') || ticker.startsWith('9');
      const marketSuffix = isShanghai ? '.SH' : '.SZ';
      const tsCode = `${ticker}${marketSuffix}`;

      // 调用Tushare API
      const response = await fetch('https://api.tushare.pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_name: 'daily',
          token: tushareToken,
          params: {
            ts_code: tsCode,
            limit: 1
          },
          fields: 'ts_code,trade_date,open,high,low,close,vol,amount'
        })
      });

      if (!response.ok) {
        throw new Error(`Tushare API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`Tushare API error: ${data.msg}`);
      }

      if (!data.data || !data.data.items || data.data.items.length === 0) {
        return new Response(JSON.stringify({ error: 'No data found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const latestData = data.data.items[0];
      const fields = data.data.fields;
      
      const closeIndex = fields.indexOf('close');
      const volIndex = fields.indexOf('vol');
      const openIndex = fields.indexOf('open');
      const amountIndex = fields.indexOf('amount');
      
      const currentPrice = parseFloat(latestData[closeIndex]);
      const openPrice = parseFloat(latestData[openIndex]);
      const volume = parseInt(latestData[volIndex]) || 0;
      const amount = parseFloat(latestData[amountIndex]) || 0;
      const change = currentPrice - openPrice;
      const changePercent = (change / openPrice) * 100;

      const stockData = {
        symbol: ticker,
        name: `${ticker} (A股)`,
        price: currentPrice.toString(),
        marketCap: '0',
        peRatio: '0',
        amount: amount.toString(),
        volume: volume.toString(),
        change: change.toString(),
        changePercent: changePercent.toString()
      };

      return new Response(JSON.stringify(stockData), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 其他股票类型的处理...
    return new Response(JSON.stringify({ error: 'Unsupported stock type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Stock data API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch stock data',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
