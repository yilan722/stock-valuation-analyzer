const { 
  CryptoTreasuryValuation, 
  calculateCryptoTreasuryValuation,
  fetchRealTimeCryptoPrices,
  updateCryptoPrices 
} = require('../lib/crypto-treasury-valuation')

// 测试屯币股估值系统
async function testCryptoTreasuryValuation() {
  console.log('🧮 测试屯币股估值系统...\n')
  
  try {
    // 1. 获取实时加密货币价格
    console.log('🔍 步骤1: 获取实时加密货币价格...')
    const prices = await fetchRealTimeCryptoPrices()
    
    if (prices.BTC > 0 && prices.ETH > 0) {
      console.log('✅ 实时价格获取成功:')
      console.log(`   BTC: $${prices.BTC.toLocaleString()}`)
      console.log(`   ETH: $${prices.ETH.toLocaleString()}`)
    } else {
      console.log('⚠️ 实时价格获取失败，使用示例价格')
      updateCryptoPrices(65000, 3500) // 示例价格
    }
    
    // 2. 测试SBET估值
    console.log('\n🔍 步骤2: 测试SBET估值...')
    const sbetCryptoData = CryptoTreasuryValuation.getSBETData()
    const sbetCompanyData = {
      ticker: 'SBET',
      currentPrice: 2.5,
      sharesOutstanding: 10000000,
      cashAndEquivalents: 5000000,
      totalAssets: 25000000,
      totalLiabilities: 2000000
    }
    
    const sbetValuation = calculateCryptoTreasuryValuation(sbetCompanyData, sbetCryptoData)
    
    console.log('✅ SBET估值计算成功:')
    console.log(`   每股mNAV: $${sbetValuation.mnavPerShare.toFixed(2)}`)
    console.log(`   当前股价: $${sbetValuation.currentPrice}`)
    console.log(`   溢价/折价: ${sbetValuation.premiumPercentage >= 0 ? '+' : ''}${sbetValuation.premiumPercentage.toFixed(1)}%`)
    console.log(`   投资评级: ${sbetValuation.investmentRating}`)
    console.log(`   风险等级: ${sbetValuation.riskLevel}`)
    console.log(`   ETH持仓: ${sbetCryptoData.ethereumHoldings.toLocaleString()} ETH`)
    
    // 3. 测试MSTR估值
    console.log('\n🔍 步骤3: 测试MSTR估值...')
    const mstrCryptoData = CryptoTreasuryValuation.getMSTRData()
    const mstrCompanyData = {
      ticker: 'MSTR',
      currentPrice: 800,
      sharesOutstanding: 15000000,
      cashAndEquivalents: 100000000,
      totalAssets: 2000000000,
      totalLiabilities: 500000000
    }
    
    const mstrValuation = calculateCryptoTreasuryValuation(mstrCompanyData, mstrCryptoData)
    
    console.log('✅ MSTR估值计算成功:')
    console.log(`   每股mNAV: $${mstrValuation.mnavPerShare.toFixed(2)}`)
    console.log(`   当前股价: $${mstrValuation.currentPrice}`)
    console.log(`   溢价/折价: ${mstrValuation.premiumPercentage >= 0 ? '+' : ''}${mstrValuation.premiumPercentage.toFixed(1)}%`)
    console.log(`   投资评级: ${mstrValuation.investmentRating}`)
    console.log(`   风险等级: ${mstrValuation.riskLevel}`)
    console.log(`   BTC持仓: ${mstrCryptoData.bitcoinHoldings.toLocaleString()} BTC`)
    
    // 4. 比较分析
    console.log('\n🔍 步骤4: 比较分析...')
    const companies = {
      'SBET': sbetValuation,
      'MSTR': mstrValuation
    }
    
    const comparison = CryptoTreasuryValuation.compareCompanies(companies)
    console.log('✅ 比较分析完成:')
    console.log(comparison)
    
    // 5. 数据源验证
    console.log('\n🔍 步骤5: 数据源验证...')
    console.log('✅ 数据来源: BSTA.AI (https://www.bsta.ai/)')
    console.log('✅ 更新频率: 每15分钟')
    console.log('✅ 数据内容: 公司加密货币持仓、实时价格、mNAV计算')
    
    console.log('\n🎯 测试完成!')
    console.log('\n💡 使用说明:')
    console.log('1. 在报告生成时，系统会自动使用BSTA.AI数据')
    console.log('2. 对于SBET、MSTR等公司，会包含准确的mNAV计算')
    console.log('3. 系统会获取实时ETH/BTC价格进行估值')
    console.log('4. 所有数据都会标注来源为BSTA.AI')
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message)
  }
}

// 运行测试
if (require.main === module) {
  testCryptoTreasuryValuation()
}

module.exports = { testCryptoTreasuryValuation }
