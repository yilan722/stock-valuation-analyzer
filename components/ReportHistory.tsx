import React, { useState, useEffect, useCallback } from 'react'
import { Download, Eye, Calendar, FileText, Trash2, Brain, BarChart3, MessageSquare, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuth from '@/lib/useAuth'

import type { Locale } from '@/lib/i18n'
import { getFeatureFlags } from '@/lib/env'

// 导入新功能组件
import UserInputModal from '@/src/features/personal-research-center/user-input-modal'
import DisplayVersionedReport from '@/src/features/personal-research-center/display-versioned-report'
import MultiCompanyModal from '@/src/features/multi-company-analysis/multi-company-modal'
import MultiCompanyResults from '@/src/features/multi-company-analysis/multi-company-results'
import { ReportGenerationAgent } from '@/src/features/personal-research-center/generate-report-agent'

interface Report {
  id: string
  stock_symbol: string
  stock_name: string
  report_data: string
  created_at: string
}

interface ReportHistoryProps {
  locale: Locale
  isOpen: boolean
  onClose: () => void
}

export default function ReportHistory({ locale, isOpen, onClose }: ReportHistoryProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const { user } = useAuth()
  
  // 新功能状态
  const [showPersonalResearchModal, setShowPersonalResearchModal] = useState(false)
  const [showMultiCompanyModal, setShowMultiCompanyModal] = useState(false)
  const [isGeneratingPersonalReport, setIsGeneratingPersonalReport] = useState(false)
  const [versionedReport, setVersionedReport] = useState<any>(null)
  const [showVersionedReport, setShowVersionedReport] = useState(false)
  const [multiCompanyAnalysis, setMultiCompanyAnalysis] = useState<any>(null)
  const [showMultiCompanyResults, setShowMultiCompanyResults] = useState(false)
  const [customInsights, setCustomInsights] = useState('')
  const [discussionSummary, setDiscussionSummary] = useState('')
  
  // 获取功能开关
  const featureFlags = getFeatureFlags()

  // 简化的加载报告函数
  const loadReports = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ 用户未登录，无法加载报告')
      return
    }
    
    setIsLoading(true)
    setLoadError(null)
    
    try {
      console.log('🔄 开始加载报告，用户ID:', user.id)
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ 加载报告时出错:', error)
        throw error
      }
      
      console.log('✅ 成功加载报告，数量:', data?.length || 0)
      setReports(data || [])
      
    } catch (error) {
      console.error('❌ 加载报告失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setLoadError(`加载失败: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    console.log('🔍 ReportHistory useEffect:', { isOpen, userId: user?.id })
    if (isOpen && user?.id) {
      console.log('🔄 开始加载报告...')
      loadReports()
    } else if (isOpen && !user?.id) {
      console.log('⚠️ 用户未登录，无法加载报告')
      setLoadError('请先登录以查看报告历史')
    }
  }, [isOpen, user?.id, loadReports])

  const handleDownloadPDF = async (report: Report) => {
    try {
      const reportData = JSON.parse(report.report_data)
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          reportData,
          stockName: report.stock_name,
          stockSymbol: report.stock_symbol
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.stock_symbol}_valuation_report.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert(locale === 'zh' ? '下载错误' : 'Download error')
    }
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      setReports(prev => prev.filter(report => report.id !== reportId))
      if (selectedReport?.id === reportId) {
        setSelectedReport(null)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert(locale === 'zh' ? '删除错误' : 'Delete error')
    }
  }

  // 新功能处理函数
  const handlePersonalResearchSubmit = async (insights: string) => {
    if (!selectedReport) return
    
    setIsGeneratingPersonalReport(true)
    setCustomInsights(insights)
    
    try {
      const agent = new ReportGenerationAgent()
      const result = await agent.generatePersonalizedReport({
        stockSymbol: selectedReport.stock_symbol,
        originalReport: JSON.parse(selectedReport.report_data),
        userInsights: insights,
        userId: user?.id || ''
      })
      
      setVersionedReport(result)
      setShowVersionedReport(true)
      setShowPersonalResearchModal(false)
    } catch (error) {
      console.error('Error generating personalized report:', error)
      alert('生成个性化报告时出错，请稍后重试')
    } finally {
      setIsGeneratingPersonalReport(false)
    }
  }

  const handleMultiCompanyAnalysisComplete = (analysis: any) => {
    setMultiCompanyAnalysis(analysis)
    setShowMultiCompanyResults(true)
    setShowMultiCompanyModal(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === 'zh' ? '报告历史' : 'Report History'}
            </h2>
            <div className="flex items-center space-x-3">
              {/* 手动刷新按钮 */}
              <button
                onClick={loadReports}
                disabled={isLoading}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>刷新</span>
              </button>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-120px)]">
            {/* Reports List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {locale === 'zh' ? '我的报告' : 'My Reports'}
                </h3>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">加载中...</span>
                  </div>
                ) : loadError ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-2">❌ {loadError}</div>
                    <button
                      onClick={loadReports}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      重试
                    </button>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>{locale === 'zh' ? '暂无报告' : 'No reports yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedReport?.id === report.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleViewReport(report)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{report.stock_name}</h4>
                            <p className="text-sm text-gray-600">{report.stock_symbol}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadPDF(report)
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              >
                                <Download className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteReport(report.id)
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Report Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedReport ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedReport.stock_name} ({selectedReport.stock_symbol})
                      </h3>
                      <p className="text-sm text-gray-600">
                        生成时间: {new Date(selectedReport.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setShowPersonalResearchModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        disabled={isGeneratingPersonalReport}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {isGeneratingPersonalReport ? '生成中...' : '个性化研究中心'}
                      </button>
                      <button
                        onClick={() => setShowMultiCompanyModal(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        多公司对比分析
                      </button>
                    </div>
                  </div>

                  <div 
                    className="prose max-w-none report-content"
                    dangerouslySetInnerHTML={{
                      __html: JSON.parse(selectedReport.report_data).fundamentalAnalysis || 'No content available'
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>{locale === 'zh' ? '选择报告查看' : 'Select a report to view'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserInputModal
        isOpen={showPersonalResearchModal}
        onClose={() => setShowPersonalResearchModal(false)}
        onSubmit={handlePersonalResearchSubmit}
        stockSymbol={selectedReport?.stock_symbol || ''}
        stockName={selectedReport?.stock_name || ''}
        isLoading={isGeneratingPersonalReport}
      />

      {versionedReport && (
        <DisplayVersionedReport
          originalReport={selectedReport ? JSON.parse(selectedReport.report_data) : null}
          versionedReport={versionedReport}
          onClose={() => setShowVersionedReport(false)}
        />
      )}

      <MultiCompanyModal
        isOpen={showMultiCompanyModal}
        onClose={() => setShowMultiCompanyModal(false)}
        onAnalysisComplete={handleMultiCompanyAnalysisComplete}
      />

      {multiCompanyAnalysis && (
        <MultiCompanyResults
          analysis={multiCompanyAnalysis}
          onClose={() => setShowMultiCompanyResults(false)}
        />
      )}
    </div>
  )
}
