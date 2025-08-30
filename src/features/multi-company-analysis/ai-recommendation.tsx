'use client'

import React from 'react'
import { Target, TrendingUp, AlertTriangle, Shield, ArrowRight, Lightbulb } from 'lucide-react'
import { MultiCompanyAnalysis } from '../../../types'

interface AIRecommendationProps {
  analysis: MultiCompanyAnalysis
}

export default function AIRecommendation({ analysis }: AIRecommendationProps) {
  // 智能推荐整合逻辑
  const getIntegratedRecommendation = () => {
    // 优先使用Gemini AI推荐
    if ((analysis as any).geminiAnalysis?.aiRecommendation) {
      return {
        source: 'gemini',
        content: (analysis as any).geminiAnalysis.aiRecommendation,
        isConsistent: true
      }
    }

    // 如果没有Gemini推荐，使用系统推荐
    const topPick = analysis.aiRecommendation.topPick
    const topCompany = analysis.companies.find(c => c.symbol === topPick)
    
    if (topCompany) {
      return {
        source: 'system',
        content: `**系统推荐首选标的：${topPick} (${topCompany.name})**

**推荐理由：**
- **综合评分：** ${((topCompany.scores.profitability + topCompany.scores.financialHealth + topCompany.scores.growth + topCompany.scores.valuation + topCompany.scores.policyBenefit) / 5).toFixed(1)}/10
- **目标价：** $${topCompany.keyMetrics.targetPrice.toFixed(2)}
- **上涨空间：** +${topCompany.keyMetrics.upsidePotential.toFixed(1)}%
- **PE比率：** ${topCompany.keyMetrics.peRatio.toFixed(2)}
- **ROE：** ${topCompany.keyMetrics.roe.toFixed(1)}%

**核心优势：**
${topCompany.keyMetrics.upsidePotential > 20 ? '• 高成长潜力，上涨空间巨大' : ''}
${topCompany.keyMetrics.peRatio < 15 ? '• 估值合理，具备投资价值' : ''}
${topCompany.keyMetrics.roe > 15 ? '• 盈利能力强劲，ROE表现优异' : ''}

**风险提示：**
• 投资有风险，入市需谨慎
• 建议分散投资，控制仓位
• 定期关注公司基本面变化`,
        isConsistent: true
      }
    }

    return {
      source: 'fallback',
      content: '暂无推荐数据',
      isConsistent: false
    }
  }

  const recommendation = getIntegratedRecommendation()

  return (
    <div className="space-y-6">
      {/* AI智能推荐 */}
      {recommendation.source === 'gemini' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-blue-900">AI智能投资推荐</h3>
            <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Gemini AI
            </span>
          </div>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">
              {recommendation.content}
            </div>
          </div>
        </div>
      )}

      {/* 系统推荐分析 */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            系统推荐分析
          </h3>
        </div>

        {/* 推荐首选标的 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="text-md font-semibold text-green-800">AI推荐首选标的</h4>
          </div>
          
          {analysis.companies.map((company, index) => (
            <div key={company.symbol} className={`mb-4 p-4 rounded-lg border ${
              index === 0 ? 'bg-white border-green-300 shadow-sm' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <h5 className="font-semibold text-gray-900">{company.symbol}</h5>
                  <span className="text-sm text-gray-600 ml-2">({company.name})</span>
                </div>
                {index === 0 && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    推荐首选
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">综合评分</div>
                  <div className="font-semibold text-green-600">
                    {(company.scores.profitability + company.scores.financialHealth + company.scores.growth + company.scores.valuation + company.scores.policyBenefit) / 5} 
                    <span className="text-xs ml-1">(综合)</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">目标价</div>
                  <div className="font-semibold text-gray-900">${company.keyMetrics.targetPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">上涨空间</div>
                  <div className={`font-semibold ${
                    company.keyMetrics.upsidePotential > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {company.keyMetrics.upsidePotential > 0 ? '+' : ''}{company.keyMetrics.upsidePotential.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">PE比率</div>
                  <div className="font-semibold text-gray-900">{company.keyMetrics.peRatio.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 推荐理由 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="text-md font-semibold text-blue-800">推荐理由</h4>
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            {analysis.companies[0] && (
              <>
                <p>• <strong>{analysis.companies[0].symbol}</strong> 在综合评分、成长潜力和估值水平方面表现最佳</p>
                <p>• 目标价 ${analysis.companies[0].keyMetrics.targetPrice.toFixed(2)}，上涨空间 {analysis.companies[0].keyMetrics.upsidePotential > 0 ? '+' : ''}{analysis.companies[0].keyMetrics.upsidePotential.toFixed(1)}%</p>
                <p>• 建议作为投资组合的核心配置，重点关注其基本面变化</p>
              </>
            )}
          </div>
        </div>

        {/* 五维评分详情 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <Target className="h-5 w-5 text-purple-600 mr-2" />
            <h4 className="text-md font-semibold text-purple-800">五维评分详情</h4>
          </div>
          
          {analysis.companies[0] && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { key: 'profitability', label: '盈利能力', value: analysis.companies[0].scores.profitability },
                { key: 'financialHealth', label: '财务健康', value: analysis.companies[0].scores.financialHealth },
                { key: 'growth', label: '成长性', value: analysis.companies[0].scores.growth },
                { key: 'valuation', label: '估值', value: analysis.companies[0].scores.valuation },
                { key: 'policyBenefit', label: '政策受益', value: analysis.companies[0].scores.policyBenefit }
              ].map((metric) => (
                <div key={metric.key} className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{metric.value}</div>
                  <div className="text-xs text-gray-600 mb-1">{metric.label}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    metric.value >= 7 ? 'bg-green-100 text-green-800' :
                    metric.value >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {metric.value >= 7 ? '优秀' : metric.value >= 5 ? '良好' : '较差'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 风险提示 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h4 className="text-md font-semibold text-red-800">风险提示</h4>
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            <p>• 市场波动风险：股市存在不确定性，股价可能大幅波动</p>
            <p>• 行业政策变化风险：政策调整可能影响公司经营环境</p>
            <p>• 公司基本面恶化风险：经营状况变化可能影响投资价值</p>
            <p>• 建议投资者充分了解风险，合理配置资产，控制投资比例</p>
          </div>
        </div>
      </div>

      {/* 投资策略建议 */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-green-800">投资策略建议</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 建仓策略 */}
          <div className="bg-white border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <ArrowRight className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="text-md font-semibold text-green-800">建仓策略</h4>
            </div>
            <div className="text-sm text-gray-700 space-y-2">
              <p>• 建议分批建仓，避免一次性投入过多资金</p>
              <p>• 关注市场波动，在回调时适当加仓</p>
              <p>• 设置止损位，控制下行风险</p>
            </div>
          </div>

          {/* 风险控制 */}
          <div className="bg-white border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="text-md font-semibold text-green-800">风险控制</h4>
            </div>
            <div className="text-sm text-gray-700 space-y-2">
              <p>• 单只股票仓位不超过总资产的20%</p>
              <p>• 定期评估持仓，及时调整策略</p>
              <p>• 关注公司基本面变化，及时止损</p>
            </div>
          </div>
        </div>
      </div>

      {/* 免责声明 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-center">
          <p className="text-sm text-red-700">
            <strong>免责声明：</strong>本推荐仅供参考，不构成投资建议。投资有风险，入市需谨慎。
          </p>
        </div>
      </div>
    </div>
  )
}

