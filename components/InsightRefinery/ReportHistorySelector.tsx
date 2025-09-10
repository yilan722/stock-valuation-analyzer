'use client'

import React, { useState, useEffect } from 'react'
import { Search, FileText, Calendar, User, ChevronRight, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Report {
  id: string
  stock_name: string
  stock_symbol: string
  created_at: string
  user_id: string
  report_data: string
}

interface ReportHistorySelectorProps {
  userId: string
  onSelectReport: (report: Report) => void
  onClose: () => void
}

export default function ReportHistorySelector({ 
  userId, 
  onSelectReport, 
  onClose 
}: ReportHistorySelectorProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  // 获取用户报告历史
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/reports?userId=${userId}`)
        const data = await response.json()
        
        if (data.success) {
          setReports(data.data || [])
          setFilteredReports(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchReports()
    }
  }, [userId])

  // 搜索过滤
  useEffect(() => {
    if (!searchTerm) {
      setFilteredReports(reports)
    } else {
      const filtered = reports.filter(report => 
        report.stock_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.stock_symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredReports(filtered)
    }
  }, [searchTerm, reports])

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report)
  }

  const handleConfirmSelection = () => {
    if (selectedReport) {
      onSelectReport(selectedReport)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
    } catch {
      return dateString
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">选择历史报告</h2>
                <p className="text-blue-100 text-sm mt-1">选择一份报告进行Insight Refinery分析</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索股票名称或代码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 报告列表 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">加载报告中...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无报告</h3>
              <p className="text-gray-500">您还没有生成过任何报告</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleSelectReport(report)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedReport?.id === report.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.stock_name}
                        </h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md">
                          {report.stock_symbol}
                        </span>
                        {selectedReport?.id === report.id && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-md font-medium">
                            已选择
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(report.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>用户报告</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedReport}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>开始分析</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


