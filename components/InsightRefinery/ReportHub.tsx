'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Folder, 
  FileText, 
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react'
import ReportFolder from './ReportFolder'
import ReportList from './ReportList'
import InsightRefineryModal from './InsightRefineryModal'
import ReportComparison from './ReportComparison'

interface ReportHubProps {
  userId: string
  locale: 'en' | 'zh'
}

interface ReportFolderData {
  id: string
  companyName: string
  ticker: string
  originalReportId: string
  latestVersionId: string
  totalVersions: number
  totalDiscussions: number
  lastActivity: string
  createdAt: string
}

interface HubStats {
  totalFolders: number
  totalReports: number
  totalDiscussions: number
  activeSessions: number
  insightRefineryReports: number
}

export default function ReportHub({ userId, locale }: ReportHubProps) {
  const [folders, setFolders] = useState<ReportFolderData[]>([])
  const [stats, setStats] = useState<HubStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Modal states
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [selectedReportTitle, setSelectedReportTitle] = useState<string>('')
  const [showInsightRefinery, setShowInsightRefinery] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonReportId, setComparisonReportId] = useState<string | null>(null)

  useEffect(() => {
    fetchHubData()
  }, [userId])

  const fetchHubData = async () => {
    try {
      setIsLoading(true)
      
      // 首先设置数据库表
      await fetch('/api/setup-insight-refinery', { method: 'POST' })
      
      // 获取用户的所有研报
      const reportsResponse = await fetch(`/api/reports?userId=${userId}`)
      const reportsResult = await reportsResponse.json()
      const reportsData = reportsResult.data || []
      
      console.log('📊 获取到的研报数据:', reportsData)
      
      if (reportsData && reportsData.length > 0) {
        // 将研报转换为文件夹格式
        const foldersData = reportsData.map((report: any) => ({
          id: `folder-${report.id}`,
          companyName: report.stock_name || 'Unknown Company',
          ticker: report.stock_symbol || 'Unknown',
          originalReportId: report.id,
          latestVersionId: report.id,
          totalVersions: 1,
          totalDiscussions: 0,
          lastActivity: report.created_at,
          createdAt: report.created_at
        }))
        
        console.log('📁 转换后的文件夹数据:', foldersData)
        setFolders(foldersData)
        
        // 计算统计数据
        setStats({
          totalFolders: foldersData.length,
          totalReports: reportsData.length,
          totalDiscussions: 0,
          activeSessions: 0,
          insightRefineryReports: 0
        })
      } else {
        console.log('❌ 没有找到研报数据')
        setFolders([])
        setStats({
          totalFolders: 0,
          totalReports: 0,
          totalDiscussions: 0,
          activeSessions: 0,
          insightRefineryReports: 0
        })
      }

    } catch (error) {
      console.error('Error fetching hub data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartInsightRefinery = (reportId: string) => {
    // 获取报告标题
    const report = folders.find(f => f.latestVersionId === reportId)
    if (report) {
      setSelectedReportId(reportId)
      setSelectedReportTitle(`${report.companyName} (${report.ticker}) 研报`)
      setShowInsightRefinery(true)
    }
  }

  const handleReportSelect = (reportId: string) => {
    setSelectedReportId(reportId)
    // 这里可以打开报告详情或对比
  }

  const handleStartComparison = (reportId: string) => {
    setComparisonReportId(reportId)
    setShowComparison(true)
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">加载研报中心...</span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部统计 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {locale === 'zh' ? '研报文件夹' : 'Report Folders'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFolders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Folder className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {locale === 'zh' ? '总报告数' : 'Total Reports'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReports}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {locale === 'zh' ? '讨论会话' : 'Discussion Sessions'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDiscussions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Insight Refinery</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.insightRefineryReports}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 研报列表 - 可滚动区域 */}
      <div className="flex-1 overflow-y-auto">
        <ReportList
          userId={userId}
          locale={locale}
        />
      </div>

      {/* 模态框 */}
      {showInsightRefinery && selectedReportId && (
        <InsightRefineryModal
          isOpen={showInsightRefinery}
          onClose={() => setShowInsightRefinery(false)}
          reportId={selectedReportId}
          reportTitle={selectedReportTitle}
          userId={userId}
          locale={locale}
        />
      )}

      {showComparison && comparisonReportId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <button
                onClick={() => setShowComparison(false)}
                className="float-right text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <ReportComparison
                originalReportId={comparisonReportId}
                evolvedReportId={comparisonReportId}
                locale={locale}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
