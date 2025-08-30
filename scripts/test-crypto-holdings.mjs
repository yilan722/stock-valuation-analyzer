// 测试加密货币持仓数据库 (ES模块版本)
import { 
  getCryptoHoldings, 
  getAllCryptoHoldings, 
  searchCompaniesByCrypto,
  getCryptoRankings,
  getCryptoStatistics,
  validateCryptoData
} from '../lib/crypto-holdings-database.js'

// 测试加密货币持仓数据库
async function testCryptoHoldingsDatabase() {
  console.log('🧮 测试加密货币持仓数据库...\n')
  
  try {
    // 1. 测试获取特定公司持仓
    console.log('🔍 步骤1: 测试获取特定公司持仓...')
    
    const sbetHoldings = getCryptoHoldings('SBET')
    if (sbetHoldings) {
      console.log('✅ SBET持仓数据:')
      console.log(`   公司: ${sbetHoldings.company}`)
      console.log(`   ETH持仓: ${sbetHoldings.ethereumHoldings.toLocaleString()} ETH`)
      console.log(`   USDT持仓: ${sbetHoldings.otherCryptoHoldings.USDT?.toLocaleString() || 0} USDT`)
      console.log(`   数据来源: ${sbetHoldings.dataSource}`)
    }
    
    const bmnrHoldings = getCryptoHoldings('BMNR')
    if (bmnrHoldings) {
      console.log('\n✅ BMNR持仓数据:')
      console.log(`   公司: ${bmnrHoldings.company}`)
      console.log(`   BTC持仓: ${bmnrHoldings.bitcoinHoldings.toLocaleString()} BTC`)
      console.log(`   ETH持仓: ${bmnrHoldings.ethereumHoldings.toLocaleString()} ETH`)
      console.log(`   SOL持仓: ${bmnrHoldings.otherCryptoHoldings.SOL?.toLocaleString() || 0} SOL`)
      console.log(`   数据来源: ${bmnrHoldings.dataSource}`)
    }
    
    const mstrHoldings = getCryptoHoldings('MSTR')
    if (mstrHoldings) {
      console.log('\n✅ MSTR持仓数据:')
      console.log(`   公司: ${mstrHoldings.company}`)
      console.log(`   BTC持仓: ${mstrHoldings.bitcoinHoldings.toLocaleString()} BTC`)
      console.log(`   数据来源: ${mstrHoldings.dataSource}`)
    }
    
    // 2. 测试搜索包含特定加密货币的公司
    console.log('\n🔍 步骤2: 测试搜索包含特定加密货币的公司...')
    
    const ethCompanies = searchCompaniesByCrypto('ETH')
    console.log(`✅ 持有ETH的公司数量: ${ethCompanies.length}`)
    ethCompanies.forEach(company => {
      console.log(`   ${company.ticker}: ${company.ethereumHoldings.toLocaleString()} ETH`)
    })
    
    const btcCompanies = searchCompaniesByCrypto('BTC')
    console.log(`\n✅ 持有BTC的公司数量: ${btcCompanies.length}`)
    btcCompanies.forEach(company => {
      console.log(`   ${company.ticker}: ${company.bitcoinHoldings.toLocaleString()} BTC`)
    })
    
    // 3. 测试持仓价值排名
    console.log('\n🔍 步骤3: 测试持仓价值排名...')
    
    const rankings = getCryptoRankings()
    console.log('✅ 加密货币持仓价值排名:')
    rankings.slice(0, 5).forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.ticker}: $${(company.totalValue / 1000000).toFixed(1)}M`)
      if (company.btcValue > 0) {
        console.log(`      BTC价值: $${(company.btcValue / 1000000).toFixed(1)}M`)
      }
      if (company.ethValue > 0) {
        console.log(`      ETH价值: $${(company.ethValue / 1000000).toFixed(1)}M`)
      }
    })
    
    // 4. 测试数据统计
    console.log('\n🔍 步骤4: 测试数据统计...')
    
    const stats = getCryptoStatistics()
    console.log('✅ 数据库统计信息:')
    console.log(`   总公司数: ${stats.totalCompanies}`)
    console.log(`   总BTC持仓: ${stats.totalBTC.toLocaleString()} BTC`)
    console.log(`   总ETH持仓: ${stats.totalETH.toLocaleString()} ETH`)
    console.log(`   总价值: $${(stats.totalValue / 1000000000).toFixed(2)}B`)
    console.log(`   最后更新: ${stats.lastUpdated}`)
    
    // 5. 测试数据验证
    console.log('\n🔍 步骤5: 测试数据验证...')
    
    const validation = validateCryptoData()
    if (validation.isValid) {
      console.log('✅ 数据验证通过')
    } else {
      console.log('❌ 数据验证失败:')
      validation.errors.forEach(error => console.log(`   ${error}`))
    }
    
    // 6. 测试mNAV计算
    console.log('\n🔍 步骤6: 测试mNAV计算...')
    
    if (bmnrHoldings) {
      const btcPrice = 65000; // 当前BTC价格
      const ethPrice = 3500;  // 当前ETH价格
      
      const btcValue = bmnrHoldings.bitcoinHoldings * btcPrice;
      const ethValue = bmnrHoldings.ethereumHoldings * ethPrice;
      const totalCryptoValue = btcValue + ethValue;
      
      console.log('✅ BMNR mNAV计算示例:')
      console.log(`   BTC价值: $${(btcValue / 1000000).toFixed(1)}M`)
      console.log(`   ETH价值: $${(ethValue / 1000000).toFixed(1)}M`)
      console.log(`   加密货币总价值: $${(totalCryptoValue / 1000000).toFixed(1)}M`)
      
      if (bmnrHoldings.totalAssets && bmnrHoldings.totalLiabilities && bmnrHoldings.sharesOutstanding) {
        const mnav = (bmnrHoldings.cashAndEquivalents || 0) + totalCryptoValue + 
                     (bmnrHoldings.totalAssets - (bmnrHoldings.cashAndEquivalents || 0)) - 
                     bmnrHoldings.totalLiabilities;
        const mnavPerShare = mnav / bmnrHoldings.sharesOutstanding;
        
        console.log(`   总资产: $${(bmnrHoldings.totalAssets / 1000000).toFixed(1)}M`)
        console.log(`   总负债: $${(bmnrHoldings.totalLiabilities / 1000000).toFixed(1)}M`)
        console.log(`   流通股数: ${bmnrHoldings.sharesOutstanding.toLocaleString()}`)
        console.log(`   每股mNAV: $${mnavPerShare.toFixed(2)}`)
      }
    }
    
    console.log('\n🎯 测试完成!')
    console.log('\n💡 使用说明:')
    console.log('1. 所有数据都来自BSTA.AI权威数据源')
    console.log('2. 数据每15分钟更新一次')
    console.log('3. 包含完整的财务数据用于mNAV计算')
    console.log('4. 支持搜索特定加密货币持仓的公司')
    console.log('5. 提供持仓价值排名和统计分析')
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message)
  }
}

// 运行测试
testCryptoHoldingsDatabase()
