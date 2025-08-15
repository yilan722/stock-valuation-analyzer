// 测试更新后的加密货币数据
const { getCryptoHoldings, getAllCryptoHoldings } = require('../lib/crypto-holdings-database.ts');

async function testUpdatedCryptoData() {
  console.log('🧪 测试更新后的加密货币数据...\n');
  
  try {
    // 测试BMNR数据
    console.log('🔍 测试BMNR数据:');
    const bmnrData = getCryptoHoldings('BMNR');
    if (bmnrData) {
      console.log('✅ BMNR数据获取成功:');
      console.log(`   公司名称: ${bmnrData.company}`);
      console.log(`   BTC持仓: ${bmnrData.bitcoinHoldings.toLocaleString()}`);
      console.log(`   ETH持仓: ${bmnrData.ethereumHoldings.toLocaleString()}`);
      console.log(`   市值: $${(bmnrData.marketCap / 1000000000).toFixed(1)}B`);
      console.log(`   数据来源: ${bmnrData.dataSource}`);
      
      // 验证数据是否正确
      if (bmnrData.ethereumHoldings === 1200000) {
        console.log('✅ ETH持仓数据正确: 1.2M ETH');
      } else {
        console.log('❌ ETH持仓数据错误:', bmnrData.ethereumHoldings);
      }
      
      if (bmnrData.bitcoinHoldings === 0) {
        console.log('✅ BTC持仓数据正确: 0 BTC');
      } else {
        console.log('❌ BTC持仓数据错误:', bmnrData.bitcoinHoldings);
      }
    } else {
      console.log('❌ 无法获取BMNR数据');
    }
    
    console.log('\n🔍 测试SBET数据:');
    const sbetData = getCryptoHoldings('SBET');
    if (sbetData) {
      console.log('✅ SBET数据获取成功:');
      console.log(`   公司名称: ${sbetData.company}`);
      console.log(`   BTC持仓: ${sbetData.bitcoinHoldings.toLocaleString()}`);
      console.log(`   ETH持仓: ${sbetData.ethereumHoldings.toLocaleString()}`);
      console.log(`   市值: $${(sbetData.marketCap / 1000000000).toFixed(1)}B`);
      console.log(`   数据来源: ${sbetData.dataSource}`);
      
      // 验证数据是否正确
      if (sbetData.ethereumHoldings === 625000) {
        console.log('✅ ETH持仓数据正确: 625K ETH');
      } else {
        console.log('❌ ETH持仓数据错误:', sbetData.ethereumHoldings);
      }
    } else {
      console.log('❌ 无法获取SBET数据');
    }
    
    console.log('\n🔍 测试MSTR数据:');
    const mstrData = getCryptoHoldings('MSTR');
    if (mstrData) {
      console.log('✅ MSTR数据获取成功:');
      console.log(`   公司名称: ${mstrData.company}`);
      console.log(`   BTC持仓: ${mstrData.bitcoinHoldings.toLocaleString()}`);
      console.log(`   ETH持仓: ${mstrData.ethereumHoldings.toLocaleString()}`);
      console.log(`   市值: $${(mstrData.marketCap / 1000000000).toFixed(1)}B`);
      console.log(`   数据来源: ${mstrData.dataSource}`);
    } else {
      console.log('❌ 无法获取MSTR数据');
    }
    
    // 显示所有公司数据
    console.log('\n📊 所有公司数据概览:');
    const allHoldings = getAllCryptoHoldings();
    for (const [ticker, holdings] of Object.entries(allHoldings)) {
      const ethValue = holdings.ethereumHoldings * 3500; // 假设ETH价格$3,500
      const btcValue = holdings.bitcoinHoldings * 65000; // 假设BTC价格$65,000
      const totalCryptoValue = ethValue + btcValue;
      
      console.log(`${ticker}: ${holdings.ethereumHoldings.toLocaleString()} ETH, ${holdings.bitcoinHoldings.toLocaleString()} BTC, 总价值: $${(totalCryptoValue / 1000000).toFixed(1)}M`);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testUpdatedCryptoData().catch(console.error);
}

module.exports = { testUpdatedCryptoData };
