'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Plus, Search, Trash2, BarChart3, TrendingUp, Target, Lightbulb, Save } from 'lucide-react'
import { CompanyAnalysis, MultiCompanyAnalysis } from '../../../types'
import { GeminiService } from '../../services/gemini-service'
import useAuth from '../../../lib/useAuth'

interface MultiCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onAnalysisComplete: (analysis: MultiCompanyAnalysis) => void
}

export default function MultiCompanyModal({
  isOpen,
  onClose,
  onAnalysisComplete
}: MultiCompanyModalProps) {
  const [companies, setCompanies] = useState<CompanyAnalysis[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [lastSearchedQuery, setLastSearchedQuery] = useState<string>('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { user } = useAuth()

  const addCompany = (stock: { symbol: string; name: string }) => {
    if (companies.length >= 10) {
      alert('最多只能添加10家公司进行对比')
      return
    }
    
    if (companies.find(c => c.symbol === stock.symbol)) {
      alert('该公司已在对比列表中')
      return
    }

    const newCompany: CompanyAnalysis = {
      symbol: stock.symbol,
      name: stock.name,
      customInsights: '',
      scores: {
        profitability: 0,
        financialHealth: 0,
        growth: 0,
        valuation: 0,
        policyBenefit: 0
      },
      keyMetrics: {
        targetPrice: 0,
        upsidePotential: 0,
        peRatio: 0,
        pbRatio: 0,
        debtToEquity: 0,
        roe: 0
      }
    }

    setCompanies([...companies, newCompany])
  }

  const removeCompany = (symbol: string) => {
    setCompanies(companies.filter(c => c.symbol !== symbol))
  }

  const updateCompanyInsights = (symbol: string, insights: string) => {
    setCompanies(companies.map(c => 
      c.symbol === symbol ? { ...c, customInsights: insights } : c
    ))
  }

  const searchStocks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // 避免重复搜索相同的查询
    if (lastSearchedQuery === query && searchResults.length > 0) {
      console.log('🔍 跳过重复搜索:', query)
      return
    }

    console.log('🔍 开始搜索股票:', query)
    setIsSearching(true)
    try {
      const response = await fetch(`/api/stock-search?query=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 搜索API返回数据:', data)
        setSearchResults(data.results || [])
        setShowSearchResults(true)
        setLastSearchedQuery(query) // 记录最后搜索的查询
        console.log('🔍 设置搜索结果:', data.results || [])
        console.log('🔍 显示搜索结果:', true)
      } else {
        console.error('Stock search failed:', response.statusText)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Stock search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // 清理之前的timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }
    
    if (query.trim()) {
      // 只有当输入长度大于等于2个字符时才搜索
      if (query.length >= 2) {
        const timeoutId = setTimeout(() => {
          console.log(`🔍 触发搜索: "${query}"`)
          searchStocks(query)
        }, 300) // 增加延迟，避免频繁搜索
        searchTimeoutRef.current = timeoutId
      } else {
        // 输入太短，清空结果
        setSearchResults([])
        setShowSearchResults(false)
      }
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  const selectStock = (stock: any) => {
    addCompany({
      symbol: stock.symbol || stock.ticker,
      name: stock.name || stock.companyName
    })
    setSearchQuery('')
    setShowSearchResults(false)
    setSearchResults([])
  }

  const closeSearchResults = () => {
    setShowSearchResults(false)
    setSearchResults([])
  }

  // 点击外部区域关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.stock-search-container')) {
        closeSearchResults()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 清理timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const startAnalysis = async () => {
    if (companies.length < 2) {
      alert('请至少添加2家公司进行对比')
      return
    }

    if (!user?.id) {
      alert('请先登录后再进行分析')
      return
    }

    setIsAnalyzing(true)
    
    try {
      console.log('🚀 开始Gemini分析...')
      console.log('📊 分析公司:', companies)
      console.log('👤 用户ID:', user.id)
      
      // 调用服务器端Gemini分析API，传递用户ID
      const response = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          companies,
          userId: user.id,
          locale: 'zh' // 默认使用中文
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Gemini分析API调用失败: ${errorData.error || response.statusText}`)
      }
      
      const geminiAnalysis = await response.json()
      console.log('✅ Gemini分析完成:', geminiAnalysis)
      console.log('🔍 Gemini分析数据结构:', {
        hasOverview: !!geminiAnalysis.overview,
        overviewLength: geminiAnalysis.overview?.length || 0,
        hasRadarData: !!geminiAnalysis.radarData,
        radarDataLength: geminiAnalysis.radarData?.rawText?.length || 0,
        hasComparisonTable: !!geminiAnalysis.comparisonTable,
        comparisonTableLength: geminiAnalysis.comparisonTable?.length || 0,
        hasAiRecommendation: !!geminiAnalysis.aiRecommendation,
        aiRecommendationLength: geminiAnalysis.aiRecommendation?.length || 0
      })
      console.log('📝 Gemini分析概览预览:', geminiAnalysis.overview?.substring(0, 200) || '无概览数据')
      console.log('📊 Gemini分析雷达图数据预览:', geminiAnalysis.radarData?.rawText?.substring(0, 200) || '无雷达图数据')
      console.log('📋 Gemini分析对比表预览:', geminiAnalysis.comparisonTable?.substring(0, 200) || '无对比表数据')
      console.log('💡 Gemini分析AI推荐预览:', geminiAnalysis.aiRecommendation?.substring(0, 200) || '无AI推荐数据')
      
      // 从Gemini分析中提取评分数据（新格式：满分10分）
      const extractScoresFromRadarData = (companySymbol: string) => {
        if (!geminiAnalysis.radarData?.rawText) return { profitability: 0, financialHealth: 0, growth: 0, valuation: 0, policyBenefit: 0 }
        
        const rawText = geminiAnalysis.radarData.rawText
        
        // 新格式：SBET：[a,b,c,d,e] 其中a,b,c,d,e是0-10的分数
        const scoreMatch = rawText.match(new RegExp(`${companySymbol}：\\[([\\d.]+),([\\d.]+),([\\d.]+),([\\d.]+),([\\d.]+)\\]`, 'i'))
        
        if (scoreMatch) {
          const scores = {
            profitability: parseFloat(scoreMatch[1]) * 10, // 转换为0-100分
            financialHealth: parseFloat(scoreMatch[2]) * 10,
            growth: parseFloat(scoreMatch[3]) * 10,
            valuation: parseFloat(scoreMatch[4]) * 10,
            policyBenefit: parseFloat(scoreMatch[5]) * 10
          }
          
          console.log(`🔍 ${companySymbol} 新格式评分提取:`, scores)
          return scores
        }
        
        // 备用格式：SBET：[a, b, c, d, e] 带空格
        const scoreMatchWithSpaces = rawText.match(new RegExp(`${companySymbol}：\\[\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*\\]`, 'i'))
        
        if (scoreMatchWithSpaces) {
          const scores = {
            profitability: parseFloat(scoreMatchWithSpaces[1]) * 10, // 转换为0-100分
            financialHealth: parseFloat(scoreMatchWithSpaces[2]) * 10,
            growth: parseFloat(scoreMatchWithSpaces[3]) * 10,
            valuation: parseFloat(scoreMatchWithSpaces[4]) * 10,
            policyBenefit: parseFloat(scoreMatchWithSpaces[5]) * 10
          }
          
          console.log(`🔍 ${companySymbol} 带空格格式评分提取:`, scores)
          return scores
        }
        
        // 备用：旧格式匹配
        const companySection = rawText.split(companySymbol + '评分：')[1]?.split('\n\n')[0]
        
        if (!companySection) return { profitability: 0, financialHealth: 0, growth: 0, valuation: 0, policyBenefit: 0 }
        
        const scores = {
          profitability: parseInt(companySection.match(/盈利能力：(\d+)/)?.[1] || '0'),
          financialHealth: parseInt(companySection.match(/财务健康度：(\d+)/)?.[1] || '0'),
          growth: parseInt(companySection.match(/成长潜力：(\d+)/)?.[1] || '0'),
          valuation: parseInt(companySection.match(/估值水平：(\d+)/)?.[1] || '0'),
          policyBenefit: parseInt(companySection.match(/政策受益度：(\d+)/)?.[1] || '0')
        }
        
        console.log(`🔍 ${companySymbol} 旧格式评分提取:`, scores)
        return scores
      }
      
      // 从AI分析中提取PE比率（新表格格式）
      const extractPEFromAnalysis = (analysis: any, companySymbol: string) => {
        if (!analysis.comparisonTable) return null
        
        // 新格式：公司名称 | 营收 | 净利润 | ROE | 资产负债率 | PE（TTM）| PB | 收入增速 | 业务方向
        const peMatch = analysis.comparisonTable.match(new RegExp(`${companySymbol}[^\\n]*?\\|\\s*[^|]*\\|\\s*[^|]*\\|\\s*[^|]*\\|\\s*[^|]*\\|\\s*([\\d.]+)`, 'i'))
        if (peMatch) {
          const peValue = parseFloat(peMatch[1])
          return isNaN(peValue) ? null : peValue
        }
        return null
      }
      
      // 从AI分析中提取ROE（新表格格式）
      const extractROEFromAnalysis = (analysis: any, companySymbol: string) => {
        if (!analysis.comparisonTable) return null
        
        // 新格式：公司名称 | 营收 | 净利润 | ROE | 资产负债率 | PE（TTM）| PB | 收入增速 | 业务方向
        const roeMatch = analysis.comparisonTable.match(new RegExp(`${companySymbol}[^\\n]*?\\|\\s*[^|]*\\|\\s*[^|]*\\|\\s*([\\d.]+)%`, 'i'))
        if (roeMatch) {
          const roeValue = parseFloat(roeMatch[1])
          return isNaN(roeValue) ? null : roeValue
        }
        return null
      }
      
      // 从AI分析中提取目标价（从推荐部分提取）
      const extractTargetPriceFromAnalysis = (analysis: any, companySymbol: string) => {
        if (!analysis.aiRecommendation) return null
        
        const targetPriceMatch = analysis.aiRecommendation.match(/目标价\s*([\d.]+)\s*元/i)
        if (targetPriceMatch) {
          const targetPriceValue = parseFloat(targetPriceMatch[1])
          return isNaN(targetPriceValue) ? null : targetPriceValue
        }
        return null
      }
      
      // 从AI分析中提取上涨空间（从推荐部分提取）
      const extractUpsidePotentialFromAnalysis = (analysis: any, companySymbol: string) => {
        if (!analysis.aiRecommendation) return null
        
        const upsideMatch = analysis.aiRecommendation.match(/上涨空间\s*([+-]?[\d.]+)%/i)
        if (upsideMatch) {
          const upsideValue = parseFloat(upsideMatch[1])
          return isNaN(upsideValue) ? null : upsideValue
        }
        return null
      }
      
      // 从AI分析中提取PB比率（新表格格式）
      const extractPBFromAnalysis = (analysis: any, companySymbol: string) => {
        if (!analysis.comparisonTable) return null
        
        // 新格式：公司名称 | 营收 | 净利润 | ROE | 资产负债率 | PE（TTM）| PB | 收入增速 | 业务方向
        const pbMatch = analysis.comparisonTable.match(new RegExp(`${companySymbol}[^\\n]*?\\|\\s*[^|]*\\|\\s*[^|]*\\|\\s*[^|]*\\|\\s*[^|]*\\|\\s*[^|]*\\|\\s*([\\d.]+)`, 'i'))
        if (pbMatch) {
          const pbValue = parseFloat(pbMatch[1])
          return isNaN(pbValue) ? null : pbValue
        }
        return null
      }
      
      // 从AI分析中提取债务权益比（新表格格式）
      const extractDebtToEquityFromAnalysis = (analysis: any, companySymbol: string) => {
        if (!analysis.comparisonTable) return null
        
        // 新格式：公司名称 | 营收 | 净利润 | ROE | 资产负债率 | PE（TTM）| PB | 收入增速 | 业务方向
        const debtMatch = analysis.comparisonTable.match(new RegExp(`${companySymbol}[^\\n]*?\\|\\s*[^|]*\\|\\s*[^|]*\\|\\s*([\\d.]+)%`, 'i'))
        if (debtMatch) {
          const debtValue = parseFloat(debtMatch[1])
          return isNaN(debtValue) ? null : debtValue
        }
        return null
      }
      
      // 获取真实股票数据
      const getRealStockData = async (symbol: string) => {
        try {
          const response = await fetch(`/api/stock-search?query=${symbol}`)
          if (response.ok) {
            const data = await response.json()
            const stock = data.results?.[0]
            if (stock) {
              return {
                price: stock.price || 0,
                marketCap: stock.marketCap || 0,
                volume: stock.volume || 0,
                change: stock.change || 0,
                changePercent: stock.changePercent || 0
              }
            }
          }
        } catch (error) {
          console.error(`获取${symbol}股票数据失败:`, error)
        }
        return null
      }
      
      // 生成分析结果
      const analysis: MultiCompanyAnalysis = {
        id: `analysis_${Date.now()}`,
        userId: user.id, // 使用实际的用户ID
        companies: await Promise.all(companies.map(async (company) => {
          const scores = extractScoresFromRadarData(company.symbol)
          const realData = await getRealStockData(company.symbol)
          
          return {
          ...company,
            scores,
          keyMetrics: {
              // 优先使用AI分析中的真实数据，如果没有则使用备用计算
              targetPrice: extractTargetPriceFromAnalysis(geminiAnalysis, company.symbol) || realData?.price || 0,
              upsidePotential: extractUpsidePotentialFromAnalysis(geminiAnalysis, company.symbol) || realData?.changePercent || 0,
              peRatio: extractPEFromAnalysis(geminiAnalysis, company.symbol) || 
                (realData?.price && realData?.marketCap ? 
                  (realData.marketCap / (realData.price * 1000000)) : 0), // 备用计算
              pbRatio: extractPBFromAnalysis(geminiAnalysis, company.symbol) || 
                (realData?.price ? (realData.price / 10) : 0), // 备用计算
              debtToEquity: extractDebtToEquityFromAnalysis(geminiAnalysis, company.symbol) || 
                (30 - scores.financialHealth * 0.3), // 备用计算
              roe: extractROEFromAnalysis(geminiAnalysis, company.symbol) || 
                (scores.profitability * 0.8) // 备用计算
            }
          }
        })),
        aiRecommendation: {
          topPick: companies[0]?.symbol || '',
          reasoning: geminiAnalysis.aiRecommendation || '基于综合评分和关键指标分析，推荐投资标的...',
          riskFactors: [
            '市场波动风险',
            '行业政策变化风险',
            '公司基本面恶化风险'
          ]
        },
        createdAt: new Date(),
        templateName: templateName || undefined,
        // 添加 Gemini 生成的内容
        geminiAnalysis: geminiAnalysis
      }

      onAnalysisComplete(analysis)
      onClose()
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('分析失败，请重试。错误信息：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 移除旧的本地过滤逻辑，现在使用API搜索

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] flex flex-col">
        {/* Header - 固定头部 */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              我的研究决策中心 - 多股对标分析
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              添加2-10只股票进行横向比较分析
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - 可滚动内容区域 */}
        <div 
          className="flex-1 overflow-y-auto p-6 pb-24 min-h-0"
          style={{ 
            maxHeight: 'calc(95vh - 200px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Stock Search and Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">选择对比股票</h3>
            <div className="flex space-x-4 mb-4">
              <div className="flex-1 relative stock-search-container">
                <input
                  type="text"
                  placeholder="搜索股票代码或公司名称..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {/* 搜索结果显示 */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50">
                      调试: showSearchResults={String(showSearchResults)}, searchResults.length={searchResults.length}
                    </div>
                    {searchResults.map((stock, index) => (
                      <div
                        key={index}
                        onClick={() => selectStock(stock)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {stock.symbol || stock.ticker}
                            </div>
                            <div className="text-sm text-gray-600">
                              {stock.name || stock.companyName}
                            </div>
                          </div>
                          {stock.price && (
                            <div className="text-sm text-gray-500">
                              ${stock.price}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 搜索中状态 */}
                {isSearching && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 px-3 py-2">
                    <div className="text-sm text-gray-500">搜索中...</div>
                  </div>
                )}
                
                {/* 无结果状态 */}
                {showSearchResults && searchResults.length === 0 && searchQuery.trim() && !isSearching && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 px-3 py-2">
                    <div className="text-sm text-gray-500">未找到相关股票</div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Save size={16} className="inline mr-2" />
                保存模板
              </button>
            </div>

            {/* 股票搜索说明 */}
            <div className="text-sm text-gray-600 mb-4">
              💡 在搜索框中输入股票代码或公司名称，系统将实时搜索并显示结果。点击搜索结果即可添加到对比列表。
            </div>
          </div>

          {/* Save Template */}
          {showSaveTemplate && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">保存分析模板</h4>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="输入模板名称..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowSaveTemplate(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          )}

          {/* Selected Companies */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              已选择公司 ({companies.length}/10)
            </h3>
            
            {/* 操作提示 */}
            {companies.length >= 2 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  <span className="font-medium">可以开始分析了！</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  请向下滚动到底部，点击"开始分析"按钮进行多公司对比分析
                </p>
              </div>
            )}
            {companies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                请从上方选择要对比的公司
              </div>
            ) : (
              <div className="space-y-4">
                {companies.map((company, index) => (
                  <div key={company.symbol} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">{company.symbol}</div>
                          <div className="text-sm text-gray-600">{company.name}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCompany(company.symbol)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个性化见解 (可选)
                      </label>
                      <textarea
                        value={company.customInsights}
                        onChange={(e) => updateCompanyInsights(company.symbol, e.target.value)}
                        placeholder="输入您对该公司的特殊见解或关注点..."
                        className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Controls - 固定底部 */}
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex-shrink-0 z-10">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
                {companies.length >= 2 ? (
                  <span className="text-green-600">✅ 已选择 {companies.length} 家公司，可以开始分析</span>
                ) : (
                  <span className="text-orange-600">⚠️ 请至少选择 2 家公司进行对比</span>
                )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={startAnalysis}
                disabled={companies.length < 2 || isAnalyzing}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                    companies.length >= 2 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    分析中...
                  </>
                ) : (
                  <>
                    <BarChart3 size={16} className="inline mr-2" />
                    开始分析
                  </>
                )}
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}