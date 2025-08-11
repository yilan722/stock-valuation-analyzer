'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Zap, 
  DollarSign, 
  Activity
} from 'lucide-react'
import { type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'

interface ReportDemoProps {
  locale: Locale
}

export default function ReportDemo({ locale }: ReportDemoProps) {
  const [activeSection, setActiveSection] = useState(0)
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null)

  // Complete Coinbase Report Data - Based on the actual report
  const demoReport = {
    stockSymbol: 'COIN',
    stockName: 'Coinbase Global Inc',
    currentPrice: 395.00,
    priceChange: 15.50,
    priceChangePercent: 4.08,
    marketCap: 95000000000,
    peRatio: 45.2,
    volume: 12500000,
    reportDate: '2025/8/9 10:35:59',
    
    fundamentalAnalysis: {
      overview: "Coinbase Global Inc (NASDAQ: COIN) is America's leading cryptocurrency trading platform, providing critical infrastructure for the digital asset economy. Founded in 2012, Coinbase has established itself as the most trusted and compliant cryptocurrency platform, serving over 110 million verified users across more than 100 countries.",
      strengths: [
        "America's #1 crypto exchange with 52% retail market share",
        "Most comprehensive regulatory licenses creating entry barriers",
        "$8.2 billion cash reserves with profitable operations",
        "Successfully diversified beyond trading fees"
      ],
      financialHighlights: {
        revenue: 1210000000,
        netIncome: 75000000,
        operatingMargin: 0.37,
        returnOnEquity: 0.15,
        adjustedEbitda: 449000000,
        operatingCashFlow: 392000000
      },
      quarterlyTrends: {
        revenueGrowth: 0.79,
        netIncomeChange: "From $2M loss in Q3 2023 to $75M profit",
        ebitdaMargin: 0.37,
        cashPosition: 8200000000,
        customerAssets: 3900000000
      },
      challenges: [
        "Cryptocurrency market volatility risks",
        "Regulatory policy change uncertainty",
        "Intensified competition and market share pressure",
        "Rising technology security and compliance costs"
      ],
      // Complete financial metrics table data
      financialMetrics: {
        q3_2024: {
          revenue: 1210000000,
          netIncome: 75000000,
          adjustedEbitda: 449000000,
          operatingCashFlow: 392000000,
          revenueGrowth: 0.79,
          netIncomeChange: "From $2M loss in Q3 2023 to $75M profit",
          ebitdaMargin: 0.37
        },
        balanceSheet: {
          cashAndEquivalents: 8200000000,
          customerCryptoAssets: 3900000000,
          totalAssets: 150000000000,
          totalLiabilities: 68000000000,
          debtObligations: 1000000000
        },
        keyRatios: {
          peRatio: 45.2,
          pbRatio: 3.8,
          roe: 0.15,
          roa: 0.08,
          debtToEquity: 0.12
        }
      }
    },

    businessSegments: [
      {
        name: "Trading Revenue",
        revenue: 677600000,
        growth: 0.79,
        margin: 0.56,
        description: "Includes retail and institutional client spot and derivatives trading, accounting for 56% of total revenue.",
        details: {
          retailVolume: 52000000000,
          institutionalVolume: 138000000000,
          retailFee: 0.0052,
          institutionalFee: 0.0004,
          activeUsers: 8500000
        }
      },
      {
        name: "Subscription & Services",
        revenue: 532400000,
        growth: 0.84,
        margin: 0.44,
        description: "Staking revenue, USDC interest, custody fees and other diversified service revenue.",
        details: {
          staking: 207000000,
          usdcInterest: 172000000,
          custody: 89000000,
          blockchainRewards: 54000000,
          otherServices: 34000000
        }
      }
    ],

    detailedSegments: [
      {
        name: "Staking Revenue",
        revenue: 207000000,
        percentage: 0.37,
        growth: 0.84,
        description: "Driven by Ethereum staking adoption and higher ETH prices",
        assets: 17200000000
      },
      {
        name: "USDC Interest Income",
        revenue: 172000000,
        percentage: 0.31,
        growth: 0.75,
        description: "Benefiting from higher interest rate environment, average yield 4.75%",
        marketCap: 14500000000
      },
      {
        name: "Custody Fees",
        revenue: 89000000,
        percentage: 0.16,
        growth: 0.65,
        description: "Serving over 18,000 institutional clients with $223B in custody assets",
        clients: 18000,
        assets: 223000000000
      },
      {
        name: "Blockchain Rewards",
        revenue: 54000000,
        percentage: 0.10,
        growth: 0.45,
        description: "Participation in various blockchain validation and governance activities"
      },
      {
        name: "Other Services",
        revenue: 34000000,
        percentage: 0.06,
        growth: 0.30,
        description: "Including Coinbase One subscriptions, Commerce and developer tools"
      }
    ],

    // Complete revenue structure evolution table
    revenueStructure: {
      current: {
        tradingRevenue: 0.56,
        subscriptionServices: 0.44
      },
      historical: {
        "2021": { trading: 0.87, subscription: 0.13 },
        "2022": { trading: 0.78, subscription: 0.22 },
        "2023": { trading: 0.65, subscription: 0.35 },
        "2024": { trading: 0.56, subscription: 0.44 }
      }
    },

    // Geographic revenue distribution
    geographicRevenue: {
      unitedStates: 0.68,
      europe: 0.22,
      asia: 0.08,
      other: 0.02
    },

    // Trading volume analysis
    tradingVolumeAnalysis: {
      retail: {
        volume: 52000000000,
        growth: 0.95,
        fee: 0.0052,
        activeUsers: 8500000
      },
      institutional: {
        volume: 138000000000,
        growth: 1.12,
        fee: 0.0004,
        clients: 18000
      }
    },

    // Base blockchain performance
    baseBlockchain: {
      tvl: 8700000000,
      monthlyRevenue: 15000000,
      developers: 1000,
      protocols: 100,
      dailyTransactions: 3000000,
      marketPosition: "2nd largest Ethereum L2 by TVL"
    },

    growthCatalysts: [
      {
        title: "Cryptocurrency Market Expansion",
        description: "Cryptocurrency total market cap grew to $3.8 trillion in 2024, with Bitcoin breaking $100,000 to reach new all-time highs.",
        impact: "High",
        timeline: "2024-2026",
        details: {
          totalMarketCap: 3800000000000,
          bitcoinPrice: 100000,
          institutionalAdoption: 1200000000000,
          currentInstitutional: 450000000000,
          corporateAdoption: 0.15
        }
      },
      {
        title: "Accelerated Institutional Adoption",
        description: "Institutional crypto asset management is expected to reach $1.2 trillion by 2026, compared to $450 billion today.",
        impact: "High",
        timeline: "2024-2026",
        details: {
          targetAum: 1200000000000,
          currentAum: 450000000000,
          growthRate: 2.67,
          etfInflows: 42000000000
        }
      },
      {
        title: "Regulatory Clarity",
        description: "Coinbase's regulatory-first approach makes it the preferred platform for institutional adoption, with MiCA compliance in Europe.",
        impact: "Medium-High",
        timeline: "Ongoing",
        details: {
          licenses: 45,
          europeanMarket: 450000000,
          derivativesShare: 0.12,
          stablecoinOpportunity: 500000000000
        }
      },
      {
        title: "Platform & Technology Investment",
        description: "Base blockchain ecosystem and AI automation initiatives drive multiple revenue streams.",
        impact: "Medium-High",
        timeline: "Ongoing",
        details: {
          baseTvl: 8700000000,
          monthlyRevenue: 15000000,
          developers: 1000,
          protocols: 100,
          dailyTransactions: 3000000,
          rndInvestment: 200000000
        }
      },
      {
        title: "Product Expansion & Innovation",
        description: "Coinbase One subscription service has 1.2 million subscribers, generating $418 million in annual recurring revenue.",
        impact: "High",
        timeline: "2024-2026",
        details: {
          subscribers: 1200000,
          annualRevenue: 418000000,
          targetSubscribers: 5000000,
          targetRevenue: 1700000000
        }
      }
    ],

    valuationAnalysis: {
      dcfValue: 385.00,
      targetPrice: 395.00,
      reasoning: "As a leading regulated cryptocurrency platform, Coinbase represents a compelling investment opportunity poised to benefit from institutional adoption, regulatory clarity, and platform expansion.",
      dcfScenarios: {
        base: 385.00,
        optimistic: 485.00,
        pessimistic: 275.00
      },
      comparableAnalysis: {
        peBased: 365.00,
        evEbitda: 392.00,
        psBased: 358.00
      },
      upsidePotential: {
        base: 0.24,
        optimistic: 0.56,
        pessimistic: -0.11
      },
      // Complete DCF analysis assumptions
      dcfAssumptions: {
        growthRate: {
          "2025": 0.25,
          "2026": 0.20,
          "2027": 0.15,
          "2028": 0.10,
          "2029": 0.05
        },
        terminalGrowth: 0.03,
        discountRate: 0.12,
        terminalMultiple: 15.0
      },
      // Sum of parts valuation
      sumOfParts: {
        tradingBusiness: 250.00,
        subscriptionServices: 95.00,
        baseBlockchain: 35.00,
        otherAssets: 15.00,
        total: 395.00
      },
      // Risk factors
      riskFactors: [
        "Cryptocurrency market volatility",
        "Regulatory policy changes",
        "Intensified competition",
        "Technology security risks",
        "Macroeconomic uncertainty"
      ]
    },

    // Comparable Company Analysis Table - Complete data from the report
    comparableCompanyAnalysis: [
      {
        company: "Coinbase (COIN)",
        peRatio: 29.9,
        evEbitda: 18.2,
        psRatio: 13.1,
        revenueGrowth: 79
      },
      {
        company: "CME Group",
        peRatio: 22.1,
        evEbitda: 17.5,
        psRatio: 8.2,
        revenueGrowth: 12
      },
      {
        company: "Nasdaq",
        peRatio: 27.8,
        evEbitda: 16.9,
        psRatio: 6.5,
        revenueGrowth: 8
      },
      {
        company: "Block (SQ)",
        peRatio: 45.2,
        evEbitda: 24.3,
        psRatio: 2.1,
        revenueGrowth: 15
      },
      {
        company: "PayPal",
        peRatio: 19.5,
        evEbitda: 12.1,
        psRatio: 2.8,
        revenueGrowth: 9
      }
    ],


  }

  const formatNumber = (num: number, withCurrency = true) => {
    if (num >= 1e9) {
      return `${withCurrency ? '$' : ''}${(num / 1e9).toFixed(2)}B`
    } else if (num >= 1e6) {
      return `${withCurrency ? '$' : ''}${(num / 1e6).toFixed(2)}M`
    } else if (num >= 1e3) {
      return `${withCurrency ? '$' : ''}${(num / 1e3).toFixed(2)}K`
    }
    return `${withCurrency ? '$' : ''}${num.toFixed(2)}`
  }

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'fundamental', label: 'Fundamental Analysis', icon: BarChart3 },
    { id: 'segments', label: 'Business Segments', icon: TrendingUp },
    { id: 'growth', label: 'Growth Catalysts', icon: Zap },
    { id: 'valuation', label: 'Valuation Analysis', icon: Target }
  ]

  // Start auto-scroll from overview (index 0) - 6 second interval
  const startAutoScroll = () => {
    if (autoScrollInterval) clearInterval(autoScrollInterval)
    
    const interval = setInterval(() => {
      setActiveSection((prev) => {
        const next = prev + 1
        return next >= sections.length ? 0 : next // Loop back to overview
      })
    }, 6000) // 6 second interval
    
    setAutoScrollInterval(interval)
  }

  // Stop auto-scroll
  const stopAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval)
      setAutoScrollInterval(null)
    }
  }

  // Handle section click - jump to specific section
  const handleSectionClick = (index: number) => {
    setActiveSection(index)
  }

  // Auto-scroll through sections every 2 seconds, starting from overview
  useEffect(() => {
    setActiveSection(0) // Start from overview
    startAutoScroll()
    
    return () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval)
      }
    }
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScrollInterval) {
      startAutoScroll()
    }
  }, [autoScrollInterval])

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-800/30"></div>
        
        {/* DEMO Banner */}
        <div className="relative z-20 w-full bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 py-3 sm:py-4 border-b border-blue-500/30">
          <div className="max-w-4xl mx-auto px-3 sm:px-6">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <div className="animate-pulse">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-blue-100">
                🤖 AI-GENERATED RESEARCH REPORT DEMO
              </span>
              <div className="animate-pulse">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300" />
              </div>
            </div>
            <div className="text-sm sm:text-base text-blue-200 mt-1 opacity-80">
              Interactive demonstration of our AI-powered stock analysis platform
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-3 sm:px-6">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center space-x-1 sm:space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-6 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              <span className="text-xs sm:text-sm font-medium">AI-Driven Research Report</span>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
              Report Date: {demoReport.reportDate}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              {demoReport.stockName}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-400 font-semibold mb-6 sm:mb-8">
              {demoReport.stockSymbol}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  ${demoReport.currentPrice}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Current Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {formatNumber(demoReport.marketCap)}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Market Cap</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {demoReport.peRatio}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">P/E Ratio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {formatNumber(demoReport.volume)}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Volume</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {sections.map((section, index) => (
                      <button
            key={section.id}
            onClick={() => handleSectionClick(index)}
            className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 text-sm sm:text-base ${
              activeSection === index
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
            title={`Click to view ${section.label}`}
          >
              <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-8 sm:space-y-12">
          {/* Overview Section */}
          {activeSection === 0 && (
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Company Overview</h2>
                <a href="https://investor.coinbase.com/company-profile/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                  Source: Coinbase Company Profile
                </a>
              </div>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6 sm:mb-8">
                {demoReport.fundamentalAnalysis.overview}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-3 sm:mb-4">Key Strengths</h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {demoReport.fundamentalAnalysis.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base text-gray-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-orange-400 mb-3 sm:mb-4">Key Challenges</h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {demoReport.fundamentalAnalysis.challenges.map((challenge, idx) => (
                      <li key={idx} className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base text-gray-300">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Fundamental Analysis Section */}
          {activeSection === 1 && (
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Fundamental Analysis</h2>
                <a href="https://investor.coinbase.com/financials/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                  Source: Coinbase Financial Reports
                </a>
              </div>
              
              {/* Q3 2024 Performance */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Q3 2024 Financial Performance</h3>
                  <a href="https://investor.coinbase.com/financials/quarterly-results/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Coinbase Q3 2024 Earnings
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.q3_2024.revenue)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Revenue</div>
                    <div className="text-xs text-green-400 mt-1">
                      +{formatPercentage(demoReport.fundamentalAnalysis.financialMetrics.q3_2024.revenueGrowth)}
                    </div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.q3_2024.netIncome)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Net Income</div>
                    <div className="text-xs text-green-400 mt-1">
                      {demoReport.fundamentalAnalysis.financialMetrics.q3_2024.netIncomeChange}
                    </div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.q3_2024.adjustedEbitda)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Adjusted EBITDA</div>
                    <div className="text-xs text-blue-400 mt-1">
                      {formatPercentage(demoReport.fundamentalAnalysis.financialMetrics.q3_2024.ebitdaMargin)} margin
                    </div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.q3_2024.operatingCashFlow)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Operating Cash Flow</div>
                  </div>
                </div>
              </div>

              {/* Balance Sheet */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Balance Sheet Highlights</h3>
                  <a href="https://investor.coinbase.com/financials/quarterly-results/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Coinbase Q3 2024 Balance Sheet
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.balanceSheet.cashAndEquivalents)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Cash & Equivalents</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.balanceSheet.customerCryptoAssets)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Customer Crypto Assets</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.balanceSheet.totalAssets)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Total Assets</div>
                  </div>
                </div>
              </div>

              {/* Key Ratios */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Key Financial Ratios</h3>
                  <a href="https://finance.yahoo.com/quote/COIN/key-statistics" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Yahoo Finance Key Statistics
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {demoReport.fundamentalAnalysis.financialMetrics.keyRatios.peRatio}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">P/E Ratio</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {demoReport.fundamentalAnalysis.financialMetrics.keyRatios.pbRatio}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">P/B Ratio</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.fundamentalAnalysis.financialMetrics.keyRatios.roe)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">ROE</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.fundamentalAnalysis.financialMetrics.keyRatios.roa)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">ROA</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {demoReport.fundamentalAnalysis.financialMetrics.keyRatios.debtToEquity}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Debt/Equity</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Segments Section */}
          {activeSection === 2 && (
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10"
              
              
              
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Business Segments Analysis</h2>
                <a href="https://investor.coinbase.com/business/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                  Source: Coinbase Business Overview
                </a>
              </div>
              
              {/* Revenue Structure Evolution */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Revenue Structure Evolution</h3>
                  <a href="https://investor.coinbase.com/financials/quarterly-results/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Coinbase Quarterly Reports
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Year</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Trading Revenue</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Subscription & Services</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(demoReport.revenueStructure.historical).map(([year, data]) => (
                        <tr key={year} className="border-b border-white/10">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">{year}</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatPercentage(data.trading)}</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatPercentage(data.subscription)}</td>
                        </tr>
                      ))}
                      <tr className="bg-white/5 font-semibold">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Current (2024)</td>
                        <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatPercentage(demoReport.revenueStructure.current.tradingRevenue)}</td>
                        <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatPercentage(demoReport.revenueStructure.current.subscriptionServices)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Business Segments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {demoReport.businessSegments.map((segment, idx) => (
                  <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                      <h4 className="text-lg sm:text-xl font-bold text-blue-400">{segment.name}</h4>
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl font-bold text-white">{formatNumber(segment.revenue)}</p>
                        <p className="text-sm text-gray-400">Revenue</p>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">{segment.description}</p>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-bold text-green-400">{formatPercentage(segment.growth)}</p>
                        <p className="text-xs text-gray-400">Growth Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-bold text-blue-400">{formatPercentage(segment.margin)}</p>
                        <p className="text-xs text-gray-400">Revenue Share</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trading Volume Analysis */}
              <div className="mt-6 sm:mt-8 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Trading Volume Analysis</h3>
                  <a href="https://investor.coinbase.com/financials/quarterly-results/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Coinbase Q3 2024 Trading Metrics
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                    <h4 className="text-base sm:text-lg font-bold text-blue-400 mb-3 sm:mb-4">Retail Trading</h4>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                          {formatNumber(demoReport.tradingVolumeAnalysis.retail.volume)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Volume</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1 sm:mb-2">
                          {formatPercentage(demoReport.tradingVolumeAnalysis.retail.growth)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Growth</div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 text-center">
                      <div className="text-base sm:text-lg font-bold text-blue-400 mb-1">
                        {formatPercentage(demoReport.tradingVolumeAnalysis.retail.fee)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Average Fee Rate</div>
                    </div>
                    <div className="mt-3 sm:mt-4 text-center">
                      <div className="text-base sm:text-lg font-bold text-white mb-1">
                        {formatNumber(demoReport.tradingVolumeAnalysis.retail.activeUsers, false)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Active Users</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                    <h4 className="text-base sm:text-lg font-bold text-blue-400 mb-3 sm:mb-4">Institutional Trading</h4>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                          {formatNumber(demoReport.tradingVolumeAnalysis.institutional.volume)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Volume</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-green-400 mb-1 sm:mb-2">
                          {formatPercentage(demoReport.tradingVolumeAnalysis.institutional.growth)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Growth</div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 text-center">
                      <div className="text-base sm:text-lg font-bold text-blue-400 mb-1">
                        {formatPercentage(demoReport.tradingVolumeAnalysis.institutional.fee)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Average Fee Rate</div>
                    </div>
                    <div className="mt-3 sm:mt-4 text-center">
                      <div className="text-base sm:text-lg font-bold text-white mb-1">
                        {formatNumber(demoReport.tradingVolumeAnalysis.institutional.clients, false)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Institutional Clients</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Base Blockchain Performance */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Base Blockchain Performance</h3>
                  <a href="https://defillama.com/chain/base" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: DeFi Llama Base Chain Data
                  </a>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                  <div className="text-center mb-4 sm:mb-6">
                    <h4 className="text-lg sm:text-xl font-bold text-blue-400 mb-2">
                      {demoReport.baseBlockchain.marketPosition}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        {formatNumber(demoReport.baseBlockchain.tvl)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Total Value Locked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        {formatNumber(demoReport.baseBlockchain.monthlyRevenue)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Monthly Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        {formatNumber(demoReport.baseBlockchain.developers, false)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Developers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        {formatNumber(demoReport.baseBlockchain.protocols, false)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">DeFi Protocols</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        {formatNumber(demoReport.baseBlockchain.dailyTransactions, false)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Daily Transactions</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Revenue Distribution */}
              <div className="mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Geographic Revenue Distribution</h3>
                  <a href="https://investor.coinbase.com/financials/quarterly-results/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Coinbase Geographic Revenue Data
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.geographicRevenue.unitedStates)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">United States</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.geographicRevenue.europe)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Europe</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.geographicRevenue.asia)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Asia</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.geographicRevenue.other)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Other</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Growth Catalysts Section */}
          {activeSection === 3 && (
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10"
              
              
              
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Growth Catalysts</h2>
                <a href="https://investor.coinbase.com/events-and-presentations/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                  Source: Coinbase Investor Presentations
                </a>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {demoReport.growthCatalysts.map((catalyst, idx) => (
                  <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-2">{catalyst.title}</h3>
                        <p className="text-sm sm:text-base text-gray-300 mb-3">{catalyst.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                          catalyst.impact === 'High' ? 'bg-green-500/20 text-green-400' :
                          catalyst.impact === 'Medium-High' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {catalyst.impact} Impact
                        </span>
                        <div className="text-xs sm:text-sm text-gray-400 mt-1">{catalyst.timeline}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {Object.entries(catalyst.details).map(([key, value]) => (
                        <div key={key} className="text-center bg-white/5 rounded-xl p-2 sm:p-3">
                          <div className="text-base sm:text-lg font-bold text-white mb-1">
                            {typeof value === 'number' ? formatNumber(value, false) : value}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valuation Analysis Section */}
          {activeSection === 4 && (
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10"
              
              
              
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Valuation Analysis</h2>
                <a href="https://www.bloomberg.com/quote/COIN:US" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                  Source: Bloomberg Terminal Analysis
                </a>
              </div>
              
              {/* DCF Scenarios */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">DCF Valuation Scenarios</h3>
                  <a href="https://www.spglobal.com/marketintelligence/en/mi/research-analysis/equity-valuation-models.html" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: S&P Global Valuation Models
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.dcfScenarios.base}
                    </div>
                    <div className="text-base sm:text-lg text-blue-400 mb-2">Base Case</div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      {formatPercentage(demoReport.valuationAnalysis.upsidePotential.base)} upside
                    </div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.dcfScenarios.optimistic}
                    </div>
                    <div className="text-base sm:text-lg text-green-400 mb-2">Optimistic</div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      {formatPercentage(demoReport.valuationAnalysis.upsidePotential.optimistic)} upside
                    </div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.dcfScenarios.pessimistic}
                    </div>
                    <div className="text-base sm:text-lg text-red-400 mb-2">Pessimistic</div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      {formatPercentage(demoReport.valuationAnalysis.upsidePotential.pessimistic)} downside
                    </div>
                  </div>
                </div>
              </div>

              {/* DCF Assumptions */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">DCF Analysis Assumptions</h3>
                  <a href="https://www.investopedia.com/terms/d/dcf.asp" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Financial Modeling Standards
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Year</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Growth Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(demoReport.valuationAnalysis.dcfAssumptions.growthRate).map(([year, rate]) => (
                        <tr key={year} className="border-b border-white/10">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">{year}</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatPercentage(rate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-3 sm:mt-4">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.valuationAnalysis.dcfAssumptions.terminalGrowth)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Terminal Growth</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.valuationAnalysis.dcfAssumptions.discountRate)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Discount Rate</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                      {demoReport.valuationAnalysis.dcfAssumptions.terminalMultiple}x
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Terminal Multiple</div>
                  </div>
                </div>
              </div>

              {/* Sum of Parts Valuation */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Sum of Parts Valuation</h3>
                  <a href="https://www.investopedia.com/terms/s/sumofpartsvaluation.asp" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Sum of Parts Methodology
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.sumOfParts.tradingBusiness}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Trading Business</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.sumOfParts.subscriptionServices}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Subscription Services</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.sumOfParts.baseBlockchain}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Base Blockchain</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.sumOfParts.otherAssets}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Other Assets</div>
                  </div>
                </div>
                <div className="text-center mt-4 sm:mt-6">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                    Total: ${demoReport.valuationAnalysis.sumOfParts.total}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Sum of Parts Valuation</div>
                </div>
              </div>

              {/* Comparable Company Analysis - Complete table from the report */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Comparable Company Analysis</h3>
                  <a href="https://www.bloomberg.com/markets/stocks/pe-ratio/americas" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Bloomberg Comparable Analysis
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Company</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">P/E Ratio</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">EV/EBITDA</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">P/S Ratio</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Revenue Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoReport.comparableCompanyAnalysis.map((company, idx) => (
                        <tr key={idx} className={`border-b border-white/10 ${
                          company.company.includes('COIN') ? 'bg-blue-500/10' : ''
                        }`}>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">{company.company}</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{company.peRatio}x</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{company.evEbitda}x</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{company.psRatio}x</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{company.revenueGrowth}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Target Price Analysis */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Target Price Analysis</h3>
                  <a href="https://www.spglobal.com/marketintelligence/en/mi/research-analysis/equity-valuation-models.html" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: S&P Global Target Price Models
                  </a>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-amber-500/30">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.targetPrice}
                    </div>
                    <div className="text-base sm:text-lg text-blue-300">
                      Based on DCF and Comparable Analysis
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-blue-400 mb-2 sm:mb-3">Valuation Methods</h4>
                      <ul className="space-y-1 sm:space-y-2">
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">DCF Model: ${demoReport.valuationAnalysis.dcfValue}</span>
                        </li>
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">Sum of Parts: ${demoReport.valuationAnalysis.sumOfParts.total}</span>
                        </li>
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">Comparable Analysis: ${demoReport.valuationAnalysis.comparableAnalysis.evEbitda}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-amber-400 mb-2 sm:mb-3">Data Sources</h4>
                      <ul className="space-y-1 sm:space-y-2">
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">Financial Data: SEC Filings</span>
                        </li>
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">Market Data: Bloomberg Terminal</span>
                        </li>
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">Industry Analysis: S&P Global</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-red-400">Risk Factors</h3>
                  <a href="https://investor.coinbase.com/risk-factors/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Coinbase Risk Factors
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {demoReport.valuationAnalysis.riskFactors.map((risk, idx) => (
                    <div key={idx} className="flex items-start space-x-2 sm:space-x-3 bg-white/5 rounded-xl p-3 sm:p-4">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm sm:text-base text-gray-300">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 