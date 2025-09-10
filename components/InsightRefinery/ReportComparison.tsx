'use client'

import React, { useState, useEffect } from 'react'
import { GitCompare, ArrowRight, Plus, Minus, Edit3 } from 'lucide-react'

interface ReportComparisonProps {
  originalReportId: string
  evolvedReportId: string
  locale: string
}

interface ComparisonData {
  changeTrackingId: string
  diffSummary: string
  highlightedChanges: HighlightedChange[]
  similarityScore: number
  majorChanges: string[]
}

interface HighlightedChange {
  id: string
  type: 'added' | 'modified' | 'removed' | 'moved'
  section: string
  originalContent?: string
  newContent?: string
  significance: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

export default function ReportComparison({ 
  originalReportId, 
  evolvedReportId, 
  locale 
}: ReportComparisonProps) {
  const [comparison, setComparison] = useState<ComparisonData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified' | 'summary'>('side-by-side')

  useEffect(() => {
    if (originalReportId && evolvedReportId) {
      fetchComparison()
    }
  }, [originalReportId, evolvedReportId])

  const fetchComparison = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/insight-refinery/compare-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalReportId, evolvedReportId })
      })

      const data = await response.json()
      if (data.changeTrackingId) {
        setComparison(data)
      }
    } catch (error) {
      console.error('Error fetching comparison:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'modified':
        return <Edit3 className="h-4 w-4 text-yellow-600" />
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600" />
      case 'moved':
        return <ArrowRight className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200'
      case 'modified':
        return 'bg-yellow-50 border-yellow-200'
      case 'removed':
        return 'bg-red-50 border-red-200'
      case 'moved':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">正在分析报告差异...</span>
      </div>
    )
  }

  if (!comparison) {
    return (
      <div className="text-center py-12">
        <GitCompare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          无法加载对比数据
        </h3>
        <p className="text-gray-600">
          请检查报告ID是否正确
        </p>
      </div>
    )
  }

  const sections = ['all', 'fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis']
  const filteredChanges = activeSection === 'all' 
    ? comparison.highlightedChanges 
    : comparison.highlightedChanges.filter(change => change.section === activeSection)

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📊 报告对比分析
            </h2>
            <p className="text-gray-600">
              相似度: {Math.round(comparison.similarityScore * 100)}% | 
              变更数量: {comparison.highlightedChanges.length} 处
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-3 py-2 rounded-lg text-sm ${
                viewMode === 'summary' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              摘要视图
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-2 rounded-lg text-sm ${
                viewMode === 'side-by-side' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              并排对比
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-3 py-2 rounded-lg text-sm ${
                viewMode === 'unified' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              统一视图
            </button>
          </div>
        </div>
      </div>

      {/* 主要变化摘要 */}
      {viewMode === 'summary' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">主要变化摘要</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparison.majorChanges.map((change, index) => (
              <div key={index} className="bg-white border rounded-lg p-4">
                <p className="text-gray-800">{change}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 差异分析 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">详细差异分析</h3>
          <div className="flex space-x-2">
            {sections.map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeSection === section
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {section === 'all' ? '全部' : 
                 section === 'fundamentalAnalysis' ? '基本面' :
                 section === 'businessSegments' ? '业务板块' :
                 section === 'growthCatalysts' ? '增长催化剂' :
                 section === 'valuationAnalysis' ? '估值分析' : section}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredChanges.map((change) => (
            <div
              key={change.id}
              className={`border rounded-lg p-4 ${getChangeColor(change.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getChangeIcon(change.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {change.section === 'fundamentalAnalysis' ? '基本面分析' :
                       change.section === 'businessSegments' ? '业务板块' :
                       change.section === 'growthCatalysts' ? '增长催化剂' :
                       change.section === 'valuationAnalysis' ? '估值分析' : change.section}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignificanceColor(change.significance)}`}>
                      {change.significance === 'critical' ? '关键' :
                       change.significance === 'high' ? '重要' :
                       change.significance === 'medium' ? '中等' : '轻微'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{change.description}</p>
                  
                  {change.originalContent && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-600 mb-1">原始内容:</p>
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-800 text-sm line-through">
                          {change.originalContent}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {change.newContent && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">新内容:</p>
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-green-800 text-sm">
                          {change.newContent}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 差异统计 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">变更统计</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {comparison.highlightedChanges.filter(c => c.type === 'added').length}
            </div>
            <div className="text-sm text-gray-600">新增内容</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {comparison.highlightedChanges.filter(c => c.type === 'modified').length}
            </div>
            <div className="text-sm text-gray-600">修改内容</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {comparison.highlightedChanges.filter(c => c.type === 'removed').length}
            </div>
            <div className="text-sm text-gray-600">删除内容</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {comparison.highlightedChanges.filter(c => c.type === 'moved').length}
            </div>
            <div className="text-sm text-gray-600">移动内容</div>
          </div>
        </div>
      </div>
    </div>
  )
}



