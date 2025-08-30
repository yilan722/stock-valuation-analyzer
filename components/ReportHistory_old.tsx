import React, { useState, useEffect, useCallback } from 'react'
import { Download, Eye, Calendar, FileText, Trash2, Brain, BarChart3, MessageSquare, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuth from '@/lib/useAuth'
import { getTranslation } from '@/lib/translations'
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
  const [retryCount, setRetryCount] = useState(0)
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

  useEffect(() => {
    console.log('🔍 ReportHistory useEffect:', { isOpen, userId: user?.id })
    if (isOpen && user) {
      console.log('🔄 开始加载报告...')
      loadReports()
    } else if (isOpen && !user) {
      console.log('⚠️ 用户未登录，无法加载报告')
    }
  }, [isOpen, user])

  const loadReports = async () => {
    if (!user) return
    
    setIsLoading(true)
    setLoadError(null)
    try {
      console.log('🔍 测试Supabase连接...')
      
      // 减少超时时间到3秒
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase连接测试超时')), 3000) // 3秒超时
      })
      
      // 首先测试Supabase连接，带超时控制
      const connectionPromise = supabase
        .from('users')
        .select('id')
        .limit(1)
      
      const { data: testData, error: testError } = await Promise.race([
        connectionPromise,
        timeoutPromise
      ]) as any
      
      if (testError) {
        console.error('❌ Supabase连接测试失败:', testError)
        
        // 尝试诊断连接问题
        if (testError.message.includes('超时')) {
          console.log('⏰ 连接超时，可能是网络问题或Supabase服务不可用')
          throw new Error(`数据库连接超时 - 请检查网络连接或稍后重试`)
        } else if (testError.message.includes('fetch')) {
          console.log('🌐 网络请求失败，可能是CORS或网络问题')
          throw new Error(`网络请求失败 - 请检查网络连接`)
        } else if (testError.message.includes('401')) {
          console.log('🔐 认证失败，可能是API密钥问题')
          throw new Error(`认证失败 - 请检查API配置`)
        } else {
          throw new Error(`数据库连接失败: ${testError.message}`)
        }
      }
      
      console.log('✅ Supabase连接测试成功')
      console.log('🔄 开始加载报告，用户ID:', user.id)
      
      // 加载报告也添加超时控制
      const reportsPromise = supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      const { data, error } = await Promise.race([
        reportsPromise,
        timeoutPromise
      ]) as any

      if (error) {
        console.error('❌ 加载报告时出错:', error)
        throw error
      }
      
      console.log('✅ 成功加载报告，数量:', data?.length || 0)
      setReports(data || [])
      setRetryCount(0) // 重置重试计数
      
      // 缓存报告到本地存储
      if (data && data.length > 0) {
        cacheReports(data)
      }
    } catch (error) {
      console.error('❌ 加载报告失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      
      // 尝试从本地缓存加载
      if (loadCachedReports()) {
        console.log('📱 已切换到离线模式')
        return
      }
      
      setLoadError(errorMessage)
      
      // 自动重试机制
      if (retryCount < 2) { // 减少重试次数
        console.log(`🔄 自动重试 (${retryCount + 1}/2)...`)
        setRetryCount(prev => prev + 1)
        setTimeout(() => loadReports(), 1000) // 1秒后重试
      } else {
        console.error('❌ 重试次数已达上限，停止重试')
        // 显示更友好的错误信息
        if (errorMessage.includes('超时')) {
          setLoadError('连接超时 - 请检查网络连接或稍后重试。如果问题持续，请联系技术支持。')
        } else if (errorMessage.includes('认证失败')) {
          setLoadError('认证失败 - 系统配置问题，请联系技术支持。')
        } else {
          setLoadError(`加载报告失败: ${errorMessage}`)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 离线模式支持 - 从本地存储加载缓存的报告
  const loadCachedReports = () => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cached_reports')
        if (cached) {
          const reports = JSON.parse(cached)
          console.log('📱 从本地缓存加载报告:', reports.length)
          setReports(reports)
          setLoadError('离线模式 - 显示缓存的报告数据')
          return true
        }
      } catch (error) {
        console.error('❌ 读取缓存失败:', error)
      }
    }
    return false
  }
  
  // 缓存报告到本地存储
  const cacheReports = (reports: Report[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cached_reports', JSON.stringify(reports))
        console.log('💾 报告已缓存到本地存储')
      } catch (error) {
        console.error('❌ 缓存报告失败:', error)
      }
    }
  }

  // 网络连接诊断
  const diagnoseConnection = async () => {
    console.log('🔍 开始网络连接诊断...')
    
    try {
      // 测试基本网络连接
      const networkTest = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      })
      
      if (networkTest.ok) {
        console.log('✅ 基本网络连接正常')
      } else {
        console.log('⚠️ 基本网络连接异常:', networkTest.status)
      }
      
      // 测试Supabase URL可达性
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://decmecsshjqymhkykazg.supabase.co'
      const supabaseTest = await fetch(`${supabaseUrl}/rest/v1/`, { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      })
      
      if (supabaseTest.ok) {
        console.log('✅ Supabase服务可达')
      } else {
        console.log('⚠️ Supabase服务异常:', supabaseTest.status)
      }
      
    } catch (error) {
      console.error('❌ 网络诊断失败:', error)
    }
  }
  
  // 在loadReports失败后调用诊断
  useEffect(() => {
    if (loadError && loadError.includes('超时')) {
      diagnoseConnection()
    }
  }, [loadError])

  const handleDownloadPDF = async (report: Report) => {
    try {
      const reportData = JSON.parse(report.report_data)
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      alert(getTranslation(locale, 'downloadError'))
    }
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm(getTranslation(locale, 'confirmDeleteReport'))) return
    
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error
      
      setReports(reports.filter(r => r.id !== reportId))
      if (selectedReport?.id === reportId) {
        setSelectedReport(null)
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      alert(getTranslation(locale, 'deleteError'))
    }
  }

  // 新功能处理函数
  const handlePersonalResearchSubmit = async (customInsights: string) => {
    if (!selectedReport || !user) return
    
    setCustomInsights(customInsights)
    
    setIsGeneratingPersonalReport(true)
    try {
      const reportGenerationAgent = new ReportGenerationAgent()
      const result = await reportGenerationAgent.generatePersonalizedReport({
        stockSymbol: selectedReport.stock_symbol,
        originalReport: JSON.parse(selectedReport.report_data),
        userInsights: customInsights,
        userId: user.id
      })
      
      if (result.success && result.versionedReport) {
        setVersionedReport(result.versionedReport)
        setShowVersionedReport(true)
        setShowPersonalResearchModal(false)
      } else {
        throw new Error(result.error || '生成个性化报告失败')
      }
    } catch (error) {
      console.error('❌ 生成个性化报告失败:', error)
      alert('生成个性化报告失败，请稍后重试')
    } finally {
      setIsGeneratingPersonalReport(false)
    }
  }

  const handleMultiCompanyAnalysisComplete = (analysis: any) => {
    setMultiCompanyAnalysis(analysis)
    setShowMultiCompanyResults(true)
    setShowMultiCompanyModal(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (locale === 'zh') {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {getTranslation(locale, 'reportHistory')}
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
            <div className="w-1/3 border-r overflow-y-auto">
              <div className="p-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">{getTranslation(locale, 'loading')}</p>
                  </div>
                ) : loadError ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">
                      <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-lg font-semibold">加载失败</p>
                      <p className="text-sm text-gray-600 mt-2">{loadError}</p>
                    </div>
                    <button
                      onClick={loadReports}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      重试
                    </button>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{getTranslation(locale, 'noReports')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedReport?.id === report.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleViewReport(report)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {report.stock_symbol} - {report.stock_name}
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadPDF(report)
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title={getTranslation(locale, 'downloadPDF')}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteReport(report.id)
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title={getTranslation(locale, 'deleteReport')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(report.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Report Preview */}
            <div className="w-2/3 p-4 overflow-y-auto">
              {selectedReport ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedReport.stock_symbol} - {selectedReport.stock_name}
                  </h3>
                  
                  {/* AI Smart Analysis Tools */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-blue-600" />
                      AI 智能分析工具
                    </h4>
                    
                    {/* Debug Info */}
                    <div className="mb-3 p-2 bg-yellow-100 rounded text-xs">
                      <strong>Debug:</strong> ENABLE_PERSONAL_RESEARCH: {featureFlags.ENABLE_PERSONAL_RESEARCH.toString()}, 
                      ENABLE_MULTI_COMPANY_ANALYSIS: {featureFlags.ENABLE_MULTI_COMPANY_ANALYSIS.toString()}
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
                  <p>{getTranslation(locale, 'selectReportToView')}</p>
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
        stockSymbol={selectedReport?.stock_symbol || ''}
        stockName={selectedReport?.stock_name || ''}
        onSubmit={handlePersonalResearchSubmit}
        isLoading={isGeneratingPersonalReport}
      />

      {versionedReport && showVersionedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">个性化报告</h2>
              <button
                onClick={() => setShowVersionedReport(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div>
              {versionedReport.personalizedReport && (
                <div dangerouslySetInnerHTML={{ __html: versionedReport.personalizedReport }} />
              )}
            </div>
          </div>
        </div>
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