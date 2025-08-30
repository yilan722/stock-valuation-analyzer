const { MNAVCalculator, updateCryptoPrices } = require('../lib/mnav-calculator')

// 测试mNAV计算
function testMNAVCalculation() {
  console.log('🧮 测试mNAV计算...\n')
  
  // 更新当前加密货币价格 (需要实时获取)
  updateCryptoPrices(3500, 65000) // ETH: $3500, BTC: $65000
  console.log('📊 加密货币价格已更新:')
  console.log(`   ETH: $${MNAVCalculator.cryptoPrices.ETH}`)
  console.log(`   BTC: $${MNAVCalculator.cryptoPrices.BTC}`)
  
  // 测试SBET数据
  console.log('\n🔍 测试SBET mNAV计算:')
  const sbetData = MNAVCalculator.getSBETExampleData()
  const sbetResult = MNAVCalculator.calculateMNAV(sbetData)
  
  console.log(`   当前股价: $${sbetResult.currentPrice}`)
  console.log(`   每股mNAV: $${sbetResult.mnavPerShare.toFixed(2)}`)
  console.log(`   溢价/折价: ${sbetResult.premiumPercentage >= 0 ? '+' : ''}${sbetResult.premiumPercentage.toFixed(1)}%`)
  console.log(`   ETH持仓: ${sbetData.cryptoHoldings.eth.toLocaleString()} ETH`)
  console.log(`   加密货币价值: $${(sbetResult.cryptoValue / 1000000).toFixed(2)}M`)
  console.log(`   加密货币占比: ${sbetResult.cryptoPercentage.toFixed(1)}%`)
  
  // 测试MSTR数据
  console.log('\n🔍 测试MSTR mNAV计算:')
  const mstrData = MNAVCalculator.getMSTRExampleData()
  const mstrResult = MNAVCalculator.calculateMNAV(mstrData)
  
  console.log(`   当前股价: $${mstrResult.currentPrice}`)
  console.log(`   每股mNAV: $${mstrResult.mnavPerShare.toFixed(2)}`)
  console.log(`   溢价/折价: ${mstrResult.premiumPercentage >= 0 ? '+' : ''}${mstrResult.premiumPercentage.toFixed(1)}%`)
  console.log(`   BTC持仓: ${mstrData.cryptoHoldings.btc.toLocaleString()} BTC`)
  console.log(`   加密货币价值: $${(mstrResult.cryptoValue / 1000000).toFixed(2)}M`)
  console.log(`   加密货币占比: ${mstrResult.cryptoPercentage.toFixed(1)}%`)
  
  // 比较分析
  console.log('\n📊 公司比较分析:')
  const companies = {
    'SBET': sbetData,
    'MSTR': mstrData
  }
  
  const comparison = MNAVCalculator.compareCompanies(companies)
  console.log(comparison)
  
  // 分析结果
  console.log('\n📋 详细分析结果:')
  console.log('\nSBET分析:')
  console.log(sbetResult.analysis)
  
  console.log('\nMSTR分析:')
  console.log(mstrResult.analysis)
}

// 测试不同加密货币价格的影响
function testPriceSensitivity() {
  console.log('\n📈 测试价格敏感性分析...\n')
  
  const sbetData = MNAVCalculator.getSBETExampleData()
  
  // 测试不同ETH价格对mNAV的影响
  const ethPrices = [3000, 3500, 4000, 4500, 5000]
  
  console.log('ETH价格对SBET mNAV的影响:')
  console.log('ETH价格\t每股mNAV\t溢价/折价')
  console.log('-'.repeat(40))
  
  ethPrices.forEach(ethPrice => {
    updateCryptoPrices(ethPrice, 65000)
    const result = MNAVCalculator.calculateMNAV(sbetData)
    const premium = result.premiumPercentage >= 0 ? '+' : ''
    console.log(`$${ethPrice}\t\t$${result.mnavPerShare.toFixed(2)}\t${premium}${result.premiumPercentage.toFixed(1)}%`)
  })
  
  // 重置价格
  updateCryptoPrices(3500, 65000)
}

// 主测试函数
function main() {
  try {
    testMNAVCalculation()
    testPriceSensitivity()
    
    console.log('\n🎯 mNAV测试完成!')
    console.log('\n💡 使用说明:')
    console.log('1. 在报告生成时，系统会自动计算mNAV')
    console.log('2. 对于SBET、MSTR等公司，会包含加密货币持仓分析')
    console.log('3. 系统会搜索最新的ETH/BTC价格和公司持仓信息')
    console.log('4. 建议定期更新加密货币价格以获得准确的mNAV')
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message)
  }
}

// 运行测试
if (require.main === module) {
  main()
}

module.exports = { testMNAVCalculation, testPriceSensitivity }
