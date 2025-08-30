'use client'

import React, { useState } from 'react'
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import { CompanyAnalysis } from '../../../types'

interface ComparisonTableProps {
  companies: CompanyAnalysis[]
  geminiTableData?: string // 新增：Gemini API返回的对比表文本数据
  className?: string
}

export default function ComparisonTable({ companies, geminiTableData, className = '' }: ComparisonTableProps) {
  const [sortBy, setSortBy] = useState<string>('symbol')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // 如果有Gemini API数据，优先使用
  if (geminiTableData && geminiTableData.trim() !== '') {
    return (
      <div className={`bg-white rounded-lg border ${className}`}>
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">关键指标对比表</h3>
          <p className="text-sm text-gray-600 mt-1">
            包含目标价、上涨空间、估值指标等关键数据对比
          </p>
        </div>

        <div className="px-6 py-4">
          <div className="prose max-w-none">
            <div 
              className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: geminiTableData
                  .replace(/\n/g, '<br>')
                  .replace(/\|/g, ' | ')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline inline-flex items-center"><span>$1</span><ExternalLink size={12} className="ml-1" /></a>')
              }}
            />
          </div>
        </div>

        {/* 数据来源说明 */}
        <div className="px-6 py-3 bg-blue-50 border-t">
          <div className="text-xs text-blue-700">
            <strong>数据来源说明：</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>A股数据：巨潮资讯网、交易所官网、公司公告</li>
              <li>美股数据：SEC官网、公司10-K/10-Q报告</li>
              <li>港股数据：港交所官网、公司公告</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // 如果没有Gemini数据，使用原有的结构化数据逻辑
  if (companies.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        暂无数据
      </div>
    )
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const sortedCompanies = [...companies].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortBy) {
      case 'symbol':
        aValue = a.symbol
        bValue = b.symbol
        break
      case 'targetPrice':
        aValue = a.keyMetrics.targetPrice
        bValue = b.keyMetrics.targetPrice
        break
      case 'upsidePotential':
        aValue = a.keyMetrics.upsidePotential
        bValue = b.keyMetrics.upsidePotential
        break
      case 'peRatio':
        aValue = a.keyMetrics.peRatio
        bValue = b.keyMetrics.peRatio
        break
      case 'pbRatio':
        aValue = a.keyMetrics.pbRatio
        bValue = b.keyMetrics.pbRatio
        break
      case 'roe':
        aValue = a.keyMetrics.roe
        bValue = b.keyMetrics.roe
        break
      default:
        aValue = a.symbol
        bValue = b.symbol
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    } else {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
  })

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <Minus size={16} className="text-gray-400" />
    }
    return sortOrder === 'asc' 
      ? <ArrowUp size={16} className="text-blue-600" />
      : <ArrowDown size={16} className="text-blue-600" />
  }

  const formatChange = (value: number, isPercentage = false) => {
    const isPositive = value > 0
    const Icon = isPositive ? TrendingUp : value < 0 ? TrendingDown : Minus
    const color = isPositive ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-500'
    
    return (
      <div className={`flex items-center ${color}`}>
        <Icon size={14} className="mr-1" />
        <span className="font-medium">
          {isPositive ? '+' : ''}{value.toFixed(2)}{isPercentage ? '%' : ''}
        </span>
      </div>
    )
  }

  const getUpsideColor = (upside: number) => {
    if (upside >= 20) return 'text-green-600'
    if (upside >= 10) return 'text-blue-600'
    if (upside >= 0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPERatioColor = (pe: number) => {
    if (pe <= 15) return 'text-green-600'
    if (pe <= 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getROEColor = (roe: number) => {
    if (roe >= 15) return 'text-green-600'
    if (roe >= 10) return 'text-blue-600'
    if (roe >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">关键指标对比表</h3>
        <p className="text-sm text-gray-600 mt-1">
          包含目标价、上涨空间、估值指标等关键数据对比
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('symbol')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>公司</span>
                  {getSortIcon('symbol')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('targetPrice')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>目标价</span>
                  {getSortIcon('targetPrice')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('upsidePotential')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>上涨空间</span>
                  {getSortIcon('upsidePotential')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('peRatio')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>PE比率</span>
                  {getSortIcon('peRatio')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('pbRatio')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>PB比率</span>
                  {getSortIcon('pbRatio')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('roe')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>ROE</span>
                  {getSortIcon('roe')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                债务权益比
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCompanies.map((company, index) => (
              <tr key={company.symbol} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {company.symbol.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{company.symbol}</div>
                      <div className="text-sm text-gray-500">{company.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${company.keyMetrics.targetPrice.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getUpsideColor(company.keyMetrics.upsidePotential)}`}>
                    {formatChange(company.keyMetrics.upsidePotential, true)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getPERatioColor(company.keyMetrics.peRatio)}`}>
                    {company.keyMetrics.peRatio.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {company.keyMetrics.pbRatio.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getROEColor(company.keyMetrics.roe)}`}>
                    {company.keyMetrics.roe.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {company.keyMetrics.debtToEquity.toFixed(2)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">平均目标价：</span>
            <span className="font-medium text-gray-900">
              ${(companies.reduce((sum, c) => sum + c.keyMetrics.targetPrice, 0) / companies.length).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">平均上涨空间：</span>
            <span className="font-medium text-gray-900">
              {(companies.reduce((sum, c) => sum + c.keyMetrics.upsidePotential, 0) / companies.length).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">平均PE比率：</span>
            <span className="font-medium text-gray-900">
              {(companies.reduce((sum, c) => sum + c.keyMetrics.peRatio, 0) / companies.length).toFixed(1)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">平均ROE：</span>
            <span className="font-medium text-gray-900">
              {(companies.reduce((sum, c) => sum + c.keyMetrics.roe, 0) / companies.length).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

