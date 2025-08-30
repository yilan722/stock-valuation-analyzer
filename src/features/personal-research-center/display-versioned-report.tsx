'use client'

import React, { useState } from 'react'
import { ArrowUp, ArrowDown, Minus, FileText, TrendingUp, Target, AlertTriangle } from 'lucide-react'
import { VersionedReport, ValuationReportData } from '../../../types'

interface DisplayVersionedReportProps {
  originalReport: ValuationReportData
  versionedReport: VersionedReport
  onClose: () => void
}

export default function DisplayVersionedReport({
  originalReport,
  versionedReport,
  onClose
}: DisplayVersionedReportProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'changes'>('overview')

  const formatChange = (change: number) => {
    const isPositive = change > 0
    const Icon = isPositive ? ArrowUp : change < 0 ? ArrowDown : Minus
    const color = isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
    
    return (
      <div className={`flex items-center ${color}`}>
        <Icon size={16} className="mr-1" />
        <span className="font-medium">
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: '概览', icon: FileText },
    { id: 'detailed', label: '详细对比', icon: TrendingUp },
    { id: 'changes', label: '变化分析', icon: Target }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              个性化研究报告 - {versionedReport.version}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              基于您的专业见解生成的更新报告
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">关闭</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} className="inline mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Version Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="text-blue-600 mr-2" size={20} />
                  <h3 className="text-lg font-medium text-blue-900">报告版本信息</h3>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">版本号：</span>
                    <span className="font-medium">{versionedReport.version}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">生成时间：</span>
                    <span className="font-medium">
                      {versionedReport.createdAt.toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Valuation Impact Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="text-green-600 mr-2" size={20} />
                  <h3 className="text-lg font-medium text-green-900">估值影响概览</h3>
                </div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatChange(versionedReport.changes.valuationImpact.dcfChange)}
                    </div>
                    <div className="text-sm text-gray-600">DCF估值</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatChange(versionedReport.changes.valuationImpact.peChange)}
                    </div>
                    <div className="text-sm text-gray-600">PE估值</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatChange(versionedReport.changes.valuationImpact.pbChange)}
                    </div>
                    <div className="text-sm text-gray-600">PB估值</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatChange(versionedReport.changes.valuationImpact.targetPriceChange)}
                    </div>
                    <div className="text-sm text-gray-600">目标价</div>
                  </div>
                </div>
              </div>

              {/* Key Changes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="text-yellow-600 mr-2" size={20} />
                  <h3 className="text-lg font-medium text-yellow-900">主要变化</h3>
                </div>
                <ul className="mt-3 space-y-2">
                  {versionedReport.changes.fundamentalChanges.map((change, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-sm text-gray-700">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">详细报告对比</h3>
              
              {/* Fundamental Analysis */}
              <div className="border rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h4 className="font-medium text-gray-900">基本面分析对比</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">原始报告</h5>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {originalReport.fundamentalAnalysis}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">更新报告</h5>
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                      {versionedReport.reportData.fundamentalAnalysis}
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Segments */}
              <div className="border rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h4 className="font-medium text-gray-900">业务分析对比</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">原始报告</h5>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {originalReport.businessSegments}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">更新报告</h5>
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                      {versionedReport.reportData.businessSegments}
                    </div>
                  </div>
                </div>
              </div>

              {/* Valuation Analysis */}
              <div className="border rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h4 className="font-medium text-gray-900">估值分析对比</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">原始报告</h5>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {originalReport.valuationAnalysis}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">更新报告</h5>
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                      {versionedReport.reportData.valuationAnalysis}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'changes' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">变化影响分析</h3>
              
              {/* Valuation Impact Details */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Target className="mr-2" size={20} />
                  估值影响详细分析
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">DCF估值变化</span>
                    {formatChange(versionedReport.changes.valuationImpact.dcfChange)}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">PE估值变化</span>
                    {formatChange(versionedReport.changes.valuationImpact.peChange)}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">PB估值变化</span>
                    {formatChange(versionedReport.changes.valuationImpact.pbChange)}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">目标价变化</span>
                    {formatChange(versionedReport.changes.valuationImpact.targetPriceChange)}
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">变化原因分析</h5>
                  <p className="text-sm text-blue-800">
                    {versionedReport.changes.valuationImpact.reasoning}
                  </p>
                </div>
              </div>

              {/* Fundamental Changes */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">基本面变化详情</h4>
                <div className="space-y-3">
                  {versionedReport.changes.fundamentalChanges.map((change, index) => (
                    <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-sm text-gray-700">{change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
