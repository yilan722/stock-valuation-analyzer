// mNAV (Modified Net Asset Value) 计算工具
// 专门用于分析持有大量加密货币的公司

export interface CryptoHoldings {
  eth: number;        // ETH持有数量
  btc: number;        // BTC持有数量
  otherCrypto: { [symbol: string]: number }; // 其他加密货币
}

export interface CompanyFinancials {
  cash: number;           // 现金及现金等价物
  totalAssets: number;    // 总资产
  totalLiabilities: number; // 总负债
  sharesOutstanding: number; // 流通股数
  cryptoHoldings: CryptoHoldings;
}

export interface MNAVResult {
  mnav: number;           // mNAV值
  mnavPerShare: number;   // 每股mNAV
  currentPrice: number;   // 当前股价
  premiumToMNAV: number;  // 相对mNAV的溢价/折价
  premiumPercentage: number; // 溢价百分比
  cryptoValue: number;    // 加密货币总价值
  cryptoPercentage: number; // 加密货币占总资产比例
  analysis: string;       // 分析结果
}

export class MNAVCalculator {
  // 当前加密货币价格 (需要实时更新)
  private static cryptoPrices = {
    ETH: 0,
    BTC: 0,
    // 可以添加更多加密货币
  };

  // 更新加密货币价格
  static updateCryptoPrices(ethPrice: number, btcPrice: number) {
    this.cryptoPrices.ETH = ethPrice;
    this.cryptoPrices.BTC = btcPrice;
  }

  // 计算mNAV
  static calculateMNAV(financials: CompanyFinancials, currentPrice: number): MNAVResult {
    // 计算加密货币总价值
    const ethValue = financials.cryptoHoldings.eth * this.cryptoPrices.ETH;
    const btcValue = financials.cryptoHoldings.btc * this.cryptoPrices.BTC;
    
    // 计算其他加密货币价值
    let otherCryptoValue = 0;
    for (const [symbol, amount] of Object.entries(financials.cryptoHoldings.otherCrypto)) {
      // 这里需要根据实际情况获取其他加密货币价格
      // 暂时使用估算值
      otherCryptoValue += amount * 100; // 假设每个100美元
    }
    
    const totalCryptoValue = ethValue + btcValue + otherCryptoValue;
    
    // 计算mNAV
    const mnav = financials.cash + totalCryptoValue + (financials.totalAssets - financials.cash) - financials.totalLiabilities;
    const mnavPerShare = mnav / financials.sharesOutstanding;
    
    // 计算溢价/折价
    const premiumToMNAV = currentPrice - mnavPerShare;
    const premiumPercentage = (premiumToMNAV / mnavPerShare) * 100;
    
    // 计算加密货币占比
    const cryptoPercentage = (totalCryptoValue / financials.totalAssets) * 100;
    
    // 创建基本结果对象
    const result = {
      mnav,
      mnavPerShare,
      currentPrice: currentPrice,
      premiumToMNAV,
      premiumPercentage,
      cryptoValue: totalCryptoValue,
      cryptoPercentage,
      analysis: '' // 临时空值
    };

    // 生成分析结果
    const analysis = this.generateAnalysis({
      ...result,
      cryptoHoldings: financials.cryptoHoldings
    });

    // 返回完整结果
    return {
      ...result,
      analysis
    };
  }

  // 生成分析结果
  private static generateAnalysis(result: MNAVResult & { cryptoHoldings: CryptoHoldings }): string {
    let analysis = '';

    // mNAV分析
    if (result.mnavPerShare > 0) {
      analysis += `mNAV分析：每股mNAV为$${result.mnavPerShare.toFixed(2)}，`;
      
      if (result.premiumPercentage > 20) {
        analysis += `当前股价相对mNAV溢价${result.premiumPercentage.toFixed(1)}%，可能存在估值泡沫。`;
      } else if (result.premiumPercentage > 0) {
        analysis += `当前股价相对mNAV溢价${result.premiumPercentage.toFixed(1)}%，估值相对合理。`;
      } else {
        analysis += `当前股价相对mNAV折价${Math.abs(result.premiumPercentage).toFixed(1)}%，可能存在投资机会。`;
      }
    }

    // 加密货币持仓分析
    if (result.cryptoValue > 0) {
      analysis += `\n\n加密货币持仓分析：`;
      analysis += `总价值$${(result.cryptoValue / 1000000).toFixed(2)}M，占总资产${result.cryptoPercentage.toFixed(1)}%。`;
      
      if (result.cryptoHoldings.eth > 0) {
        analysis += `\nETH持仓：${result.cryptoHoldings.eth.toLocaleString()} ETH，价值$${(result.cryptoHoldings.eth * this.cryptoPrices.ETH / 1000000).toFixed(2)}M。`;
      }
      
      if (result.cryptoHoldings.btc > 0) {
        analysis += `\nBTC持仓：${result.cryptoHoldings.btc.toLocaleString()} BTC，价值$${(result.cryptoHoldings.btc * this.cryptoPrices.BTC / 1000000).toFixed(2)}M。`;
      }
    }

    // 投资建议
    analysis += `\n\n投资建议：`;
    if (result.premiumPercentage > 30) {
      analysis += `当前估值较高，建议谨慎投资或等待回调。`;
    } else if (result.premiumPercentage < -20) {
      analysis += `当前估值较低，可能存在投资机会，但需注意风险。`;
    } else {
      analysis += `当前估值相对合理，可根据基本面分析决定投资策略。`;
    }

    return analysis;
  }

  // 获取SBET的示例数据 (需要根据实际情况更新)
  static getSBETExampleData(): CompanyFinancials {
    return {
      cash: 5000000, // 500万美元现金
      totalAssets: 25000000, // 2500万美元总资产
      totalLiabilities: 2000000, // 200万美元负债
      sharesOutstanding: 10000000, // 1000万股流通股
      cryptoHoldings: {
        eth: 5000, // 5000 ETH
        btc: 0,
        otherCrypto: {}
      }
    };
  }

  // 获取SBET示例当前价格
  static getSBETExamplePrice(): number {
    return 2.5; // 当前股价2.5美元
  }

  // 获取MSTR的示例数据
  static getMSTRExampleData(): CompanyFinancials {
    return {
      cash: 100000000, // 1亿美元现金
      totalAssets: 2000000000, // 20亿美元总资产
      totalLiabilities: 500000000, // 5亿美元负债
      sharesOutstanding: 15000000, // 1500万股流通股
      cryptoHoldings: {
        eth: 0,
        btc: 100000, // 10万 BTC
        otherCrypto: {}
      }
    };
  }

  // 获取MSTR示例当前价格
  static getMSTRExamplePrice(): number {
    return 800; // 当前股价800美元
  }

  // 比较多个公司的mNAV
  static compareCompanies(companies: { [name: string]: { financials: CompanyFinancials, currentPrice: number } }): string {
    const results: { [name: string]: MNAVResult } = {};
    
    // 计算每个公司的mNAV
    for (const [name, { financials, currentPrice }] of Object.entries(companies)) {
      results[name] = this.calculateMNAV(financials, currentPrice);
    }

    // 生成比较分析
    let comparison = '公司mNAV比较分析：\n\n';
    
    for (const [name, result] of Object.entries(results)) {
      comparison += `${name}：\n`;
      comparison += `  每股mNAV: $${result.mnavPerShare.toFixed(2)}\n`;
      comparison += `  当前股价: $${result.currentPrice}\n`;
      comparison += `  溢价/折价: ${result.premiumPercentage >= 0 ? '+' : ''}${result.premiumPercentage.toFixed(1)}%\n`;
      comparison += `  加密货币占比: ${result.cryptoPercentage.toFixed(1)}%\n\n`;
    }

    // 找出最佳投资机会
    const entries = Object.entries(results);
    let bestOpportunity = { name: entries[0][0], result: entries[0][1] };
    
    for (const [name, result] of entries) {
      if (result.premiumPercentage < bestOpportunity.result.premiumPercentage) {
        bestOpportunity = { name, result };
      }
    }

    comparison += `投资机会分析：\n`;
    comparison += `${bestOpportunity.name}相对mNAV折价最大(${Math.abs(bestOpportunity.result.premiumPercentage).toFixed(1)}%)，`;
    comparison += `可能是最具吸引力的投资选择。\n\n`;

    comparison += `风险提示：\n`;
    comparison += `- 加密货币价格波动较大，可能影响mNAV计算\n`;
    comparison += `- 需要关注公司基本面变化\n`;
    comparison += `- 建议结合其他估值方法综合分析`;

    return comparison;
  }
}

// 导出便捷函数
export const calculateMNAV = (financials: CompanyFinancials, currentPrice: number) => MNAVCalculator.calculateMNAV(financials, currentPrice);
export const compareCompaniesMNAV = (companies: { [name: string]: { financials: CompanyFinancials, currentPrice: number } }) => MNAVCalculator.compareCompanies(companies);
export const updateCryptoPrices = (ethPrice: number, btcPrice: number) => MNAVCalculator.updateCryptoPrices(ethPrice, btcPrice);
