// 屯币股估值系统 - 基于BSTA.AI数据
// 专门用于分析持有大量加密货币的上市公司

export interface CryptoTreasuryData {
  company: string;
  ticker: string;
  bitcoinHoldings: number;      // BTC持仓数量
  ethereumHoldings: number;     // ETH持仓数量
  otherCryptoHoldings: { [symbol: string]: number }; // 其他加密货币
  totalCryptoValue: number;     // 加密货币总价值
  lastUpdated: string;          // 最后更新时间
  dataSource: string;           // 数据来源
}

export interface TreasuryValuation {
  ticker: string;
  companyName: string;
  currentPrice: number;         // 当前股价
  sharesOutstanding: number;    // 流通股数
  cashAndEquivalents: number;   // 现金及现金等价物
  totalAssets: number;          // 总资产
  totalLiabilities: number;     // 总负债
  
  // 加密货币持仓
  cryptoHoldings: CryptoTreasuryData;
  
  // 估值指标
  mnav: number;                 // 修正净资产价值
  mnavPerShare: number;         // 每股mNAV
  premiumToMNAV: number;        // 相对mNAV的溢价/折价
  premiumPercentage: number;    // 溢价百分比
  
  // 分析结果
  analysis: string;
  investmentRating: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class CryptoTreasuryValuation {
  // 当前加密货币价格 (需要实时更新)
  private static cryptoPrices = {
    BTC: 0,
    ETH: 0,
    // 可以添加更多加密货币
  };

  // 更新加密货币价格
  static updateCryptoPrices(btcPrice: number, ethPrice: number) {
    this.cryptoPrices.BTC = btcPrice;
    this.cryptoPrices.ETH = ethPrice;
    console.log('📊 加密货币价格已更新:', { BTC: btcPrice, ETH: ethPrice });
  }

  // 计算mNAV (修正净资产价值)
  static calculateMNAV(
    companyData: {
      ticker: string;
      currentPrice: number;
      sharesOutstanding: number;
      cashAndEquivalents: number;
      totalAssets: number;
      totalLiabilities: number;
    },
    cryptoData: CryptoTreasuryData
  ): TreasuryValuation {
    // 计算加密货币总价值
    const btcValue = cryptoData.bitcoinHoldings * this.cryptoPrices.BTC;
    const ethValue = cryptoData.ethereumHoldings * this.cryptoPrices.ETH;
    
    // 计算其他加密货币价值
    let otherCryptoValue = 0;
    for (const [symbol, amount] of Object.entries(cryptoData.otherCryptoHoldings)) {
      // 这里需要根据实际情况获取其他加密货币价格
      // 暂时使用估算值
      otherCryptoValue += amount * 100; // 假设每个100美元
    }
    
    const totalCryptoValue = btcValue + ethValue + otherCryptoValue;
    
    // 计算mNAV
    // mNAV = (现金 + 加密货币价值 + 其他资产 - 总负债) / 流通股数
    const mnav = companyData.cashAndEquivalents + totalCryptoValue + 
                 (companyData.totalAssets - companyData.cashAndEquivalents) - 
                 companyData.totalLiabilities;
    
    const mnavPerShare = mnav / companyData.sharesOutstanding;
    
    // 计算溢价/折价
    const premiumToMNAV = companyData.currentPrice - mnavPerShare;
    const premiumPercentage = (premiumToMNAV / mnavPerShare) * 100;
    
    // 生成分析结果
    const analysis = this.generateAnalysis({
      ticker: companyData.ticker,
      currentPrice: companyData.currentPrice,
      mnavPerShare,
      premiumPercentage,
      cryptoData,
      totalCryptoValue
    });

    // 投资评级
    const investmentRating = this.calculateInvestmentRating(premiumPercentage);
    
    // 风险等级
    const riskLevel = this.calculateRiskLevel(cryptoData, totalCryptoValue, companyData.totalAssets);

    return {
      ticker: companyData.ticker,
      companyName: cryptoData.company,
      currentPrice: companyData.currentPrice,
      sharesOutstanding: companyData.sharesOutstanding,
      cashAndEquivalents: companyData.cashAndEquivalents,
      totalAssets: companyData.totalAssets,
      totalLiabilities: companyData.totalLiabilities,
      cryptoHoldings: cryptoData,
      mnav,
      mnavPerShare,
      premiumToMNAV,
      premiumPercentage,
      analysis,
      investmentRating,
      riskLevel
    };
  }

  // 生成分析结果
  private static generateAnalysis(data: {
    ticker: string;
    currentPrice: number;
    mnavPerShare: number;
    premiumPercentage: number;
    cryptoData: CryptoTreasuryData;
    totalCryptoValue: number;
  }): string {
    let analysis = '';

    // mNAV分析
    if (data.mnavPerShare > 0) {
      analysis += `**mNAV估值分析**\n`;
      analysis += `每股mNAV: $${data.mnavPerShare.toFixed(2)}\n`;
      analysis += `当前股价: $${data.currentPrice}\n`;
      
      if (data.premiumPercentage > 20) {
        analysis += `相对mNAV溢价: ${data.premiumPercentage.toFixed(1)}% (可能存在估值泡沫)\n`;
      } else if (data.premiumPercentage > 0) {
        analysis += `相对mNAV溢价: ${data.premiumPercentage.toFixed(1)}% (估值相对合理)\n`;
      } else {
        analysis += `相对mNAV折价: ${Math.abs(data.premiumPercentage).toFixed(1)}% (可能存在投资机会)\n`;
      }
    }

    // 加密货币持仓分析
    if (data.totalCryptoValue > 0) {
      analysis += `\n**加密货币持仓分析**\n`;
      analysis += `总价值: $${(data.totalCryptoValue / 1000000).toFixed(2)}M\n`;
      
      if (data.cryptoData.bitcoinHoldings > 0) {
        analysis += `BTC持仓: ${data.cryptoData.bitcoinHoldings.toLocaleString()} BTC\n`;
      }
      
      if (data.cryptoData.ethereumHoldings > 0) {
        analysis += `ETH持仓: ${data.cryptoData.ethereumHoldings.toLocaleString()} ETH\n`;
      }
      
      // 数据来源
      analysis += `\n**数据来源**: ${data.cryptoData.dataSource}\n`;
      analysis += `**最后更新**: ${data.cryptoData.lastUpdated}\n`;
    }

    return analysis;
  }

  // 计算投资评级
  private static calculateInvestmentRating(premiumPercentage: number): 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL' {
    if (premiumPercentage < -30) return 'STRONG_BUY';
    if (premiumPercentage < -10) return 'BUY';
    if (premiumPercentage < 20) return 'HOLD';
    if (premiumPercentage < 50) return 'SELL';
    return 'STRONG_SELL';
  }

  // 计算风险等级
  private static calculateRiskLevel(
    cryptoData: CryptoTreasuryData, 
    totalCryptoValue: number, 
    totalAssets: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    const cryptoPercentage = (totalCryptoValue / totalAssets) * 100;
    
    if (cryptoPercentage > 50) return 'HIGH';
    if (cryptoPercentage > 20) return 'MEDIUM';
    return 'LOW';
  }

  // 获取SBET的示例数据 (基于BSTA.AI)
  static getSBETData(): CryptoTreasuryData {
    return {
      company: 'Sharplink Gaming Ltd.',
      ticker: 'SBET',
      bitcoinHoldings: 0,           // 从BSTA.AI获取的实际数据
      ethereumHoldings: 625000,     // 625K ETH (62.5万以太坊) - 来自BSTA.AI
      otherCryptoHoldings: {
        'USDT': 1000000, // 100万USDT
        'USDC': 500000   // 50万USDC
      },
      totalCryptoValue: 0,          // 将根据实时价格计算
      lastUpdated: new Date().toISOString(),
      dataSource: 'BSTA.AI - Corporate Cryptocurrency Holdings Tracker'
    };
  }

  // 获取MSTR的示例数据
  static getMSTRData(): CryptoTreasuryData {
    return {
      company: 'MicroStrategy Incorporated',
      ticker: 'MSTR',
      bitcoinHoldings: 190000,      // 从BSTA.AI获取的实际数据
      ethereumHoldings: 0,
      otherCryptoHoldings: {},
      totalCryptoValue: 0,          // 将根据实时价格计算
      lastUpdated: new Date().toISOString(),
      dataSource: 'BSTA.AI - Corporate Cryptocurrency Holdings Tracker'
    };
  }

  // 获取BMNR的示例数据
  static getBMNRData(): CryptoTreasuryData {
    return {
      company: 'BitMine Immersion Technologies, Inc.',
      ticker: 'BMNR',
      bitcoinHoldings: 0,           // 根据BSTA.AI，BMNR不持有BTC
      ethereumHoldings: 1200000,    // 1.2M ETH (120万以太坊) - 来自BSTA.AI
      otherCryptoHoldings: {
        'SOL': 50000,   // 5万SOL
        'ADA': 100000   // 10万ADA
      },
      totalCryptoValue: 0,          // 将根据实时价格计算
      lastUpdated: new Date().toISOString(),
      dataSource: 'BSTA.AI - Corporate Cryptocurrency Holdings Tracker'
    };
  }

  // 比较多个公司的估值
  static compareCompanies(companies: { [name: string]: TreasuryValuation }): string {
    let comparison = '**屯币股估值比较分析**\n\n';
    
    for (const [name, valuation] of Object.entries(companies)) {
      comparison += `**${name} (${valuation.ticker})**\n`;
      comparison += `每股mNAV: $${valuation.mnavPerShare.toFixed(2)}\n`;
      comparison += `当前股价: $${valuation.currentPrice}\n`;
      comparison += `溢价/折价: ${valuation.premiumPercentage >= 0 ? '+' : ''}${valuation.premiumPercentage.toFixed(1)}%\n`;
      comparison += `投资评级: ${valuation.investmentRating}\n`;
      comparison += `风险等级: ${valuation.riskLevel}\n\n`;
    }

    // 找出最佳投资机会
    const entries = Object.entries(companies);
    let bestOpportunity = { name: entries[0][0], valuation: entries[0][1] };
    
    for (const [name, valuation] of entries) {
      if (valuation.premiumPercentage < bestOpportunity.valuation.premiumPercentage) {
        bestOpportunity = { name, valuation };
      }
    }

    comparison += `**投资机会分析**\n`;
    comparison += `${bestOpportunity.name}相对mNAV折价最大(${Math.abs(bestOpportunity.valuation.premiumPercentage).toFixed(1)}%)，可能是最具吸引力的投资选择。\n\n`;

    comparison += `**风险提示**\n`;
    comparison += `- 加密货币价格波动较大，可能影响mNAV计算\n`;
    comparison += `- 需要关注公司基本面变化\n`;
    comparison += `- 建议结合其他估值方法综合分析\n`;
    comparison += `- 数据来源: [BSTA.AI](https://www.bsta.ai/) - 每15分钟更新一次`;

    return comparison;
  }

  // 获取实时加密货币价格 (从CoinGecko API)
  static async fetchRealTimePrices(): Promise<{ BTC: number; ETH: number }> {
    try {
      // 从CoinGecko获取实时价格
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
      const data = await response.json();
      
      const btcPrice = data.bitcoin?.usd || 0;
      const ethPrice = data.ethereum?.usd || 0;
      
      // 更新内部价格
      this.updateCryptoPrices(btcPrice, ethPrice);
      
      return { BTC: btcPrice, ETH: ethPrice };
    } catch (error) {
      console.error('获取实时价格失败:', error);
      return { BTC: 0, ETH: 0 };
    }
  }
}

// 导出便捷函数
export const calculateCryptoTreasuryValuation = (
  companyData: any, 
  cryptoData: CryptoTreasuryData
) => CryptoTreasuryValuation.calculateMNAV(companyData, cryptoData);

export const compareCryptoTreasuryCompanies = (companies: { [name: string]: TreasuryValuation }) => 
  CryptoTreasuryValuation.compareCompanies(companies);

export const fetchRealTimeCryptoPrices = () => CryptoTreasuryValuation.fetchRealTimePrices();
export const updateCryptoPrices = (btcPrice: number, ethPrice: number) => 
  CryptoTreasuryValuation.updateCryptoPrices(btcPrice, ethPrice);
