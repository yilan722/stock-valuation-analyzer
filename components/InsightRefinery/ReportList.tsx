'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Calendar, User, Brain, Search, Filter, Download, ChevronRight } from 'lucide-react'
import InsightRefineryButton from './InsightRefineryButton'

interface ReportListProps {
  userId: string
  locale: 'en' | 'zh'
}

interface Report {
  id: string
  stock_name: string
  stock_symbol: string
  created_at: string
  report_data: string
}

export default function ReportList({ userId, locale }: ReportListProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchReports()
  }, [userId])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      console.log('📊 开始获取用户报告...')
      
      const response = await fetch(`/api/reports?userId=${userId}`)
      const result = await response.json()
      
      console.log('✅ 成功获取报告，数量:', result.data?.length || 0)
      console.log('📊 报告数据:', result)
      
      // 处理API返回的数据结构：{ data: [...], count: number }
      setReports(result.data || [])
    } catch (error) {
      console.error('❌ 获取报告失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredReports = reports.filter(report => 
    report.stock_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.stock_symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">加载研报中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 搜索栏 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={locale === 'zh' ? '搜索公司名称或股票代码...' : 'Search company name or stock code...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-600">
              {locale === 'zh' ? `共 ${filteredReports.length} 份研报` : `Total ${filteredReports.length} reports`}
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Filter className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 研报列表 */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery 
              ? (locale === 'zh' ? '未找到匹配的研报' : 'No matching reports found')
              : (locale === 'zh' ? '暂无研报' : 'No reports yet')
            }
          </h3>
          <p className="text-gray-600">
            {searchQuery 
              ? (locale === 'zh' ? '请尝试其他搜索词' : 'Please try other search terms')
              : (locale === 'zh' ? '开始生成您的第一份研报' : 'Start generating your first report')
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 表格头部 */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              <div className="col-span-3">{locale === 'zh' ? '公司信息' : 'Company'}</div>
              <div className="col-span-2">{locale === 'zh' ? '状态' : 'Status'}</div>
              <div className="col-span-2">{locale === 'zh' ? '创建时间' : 'Created'}</div>
              <div className="col-span-2">{locale === 'zh' ? '类型' : 'Type'}</div>
              <div className="col-span-2">{locale === 'zh' ? '操作' : 'Actions'}</div>
              <div className="col-span-1"></div>
            </div>
          </div>
          
          {/* 表格内容 */}
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <div key={report.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* 公司信息 */}
                  <div className="col-span-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {report.stock_name}
                        </h3>
                        <p className="text-xs text-gray-500">{report.stock_symbol}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 状态 */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {locale === 'zh' ? '原始版本' : 'Original Version'}
                    </span>
                  </div>
                  
                  {/* 创建时间 */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                  </div>
                  
                  {/* 类型 */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{locale === 'zh' ? '用户生成' : 'User Generated'}</span>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <InsightRefineryButton
                        reportId={report.id}
                        reportTitle={`${report.stock_name} (${report.stock_symbol}) 估值分析报告`}
                        userId={userId}
                        locale={locale}
                        variant="primary"
                        size="sm"
                      />
                    </div>
                  </div>
                  
                  {/* 更多操作 */}
                  <div className="col-span-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
