import React, { useState, useEffect } from 'react'
import { Download, Eye, Calendar, FileText, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import { getTranslation } from '@/lib/translations'
import type { Locale } from '@/lib/i18n'

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
  const { user } = useAuth()

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
      // 显示用户友好的错误信息
      alert(`加载报告失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {getTranslation(locale, 'reportHistory')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
  )
} 