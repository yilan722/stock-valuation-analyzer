'use client'

import React, { useState, useEffect } from 'react'
import { 
  Folder, 
  FileText, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  GitBranch,
  Calendar,
  User,
  BarChart3
} from 'lucide-react'

interface ReportFolderProps {
  folderId: string
  locale: string
  onReportSelect?: (reportId: string) => void
  onStartInsightRefinery?: (reportId: string) => void
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

interface ReportVersion {
  id: string
  title: string
  version: string
  isInsightRefineryEnhanced: boolean
  createdAt: string
  generationModel: string
  parentReportId?: string
}

interface DiscussionSession {
  id: string
  reportId: string
  totalQuestions: number
  keyInsightsCount: number
  status: string
  sessionStart: string
}

export default function ReportFolder({ 
  folderId, 
  locale, 
  onReportSelect, 
  onStartInsightRefinery 
}: ReportFolderProps) {
  const [folder, setFolder] = useState<ReportFolderData | null>(null)
  const [versions, setVersions] = useState<ReportVersion[]>([])
  const [discussions, setDiscussions] = useState<DiscussionSession[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (folderId) {
      fetchFolderData()
    }
  }, [folderId])

  const fetchFolderData = async () => {
    try {
      setIsLoading(true)
      
      // 从folderId中提取reportId
      const reportId = folderId.replace('folder-', '')
      
      console.log('📄 获取报告信息，reportId:', reportId)
      
      // 获取报告信息
      const reportResponse = await fetch(`/api/reports/${reportId}`)
      const reportData = await reportResponse.json()
      
      console.log('📄 报告数据:', reportData)
      
      if (reportData) {
        // 设置文件夹信息
        setFolder({
          id: folderId,
          companyName: reportData.stock_name || 'Unknown Company',
          ticker: reportData.stock_symbol || 'Unknown',
          originalReportId: reportData.id,
          latestVersionId: reportData.id,
          totalVersions: 1,
          totalDiscussions: 0,
          lastActivity: reportData.created_at,
          createdAt: reportData.created_at
        })

        // 设置版本信息
        setVersions([{
          id: reportData.id,
          title: `${reportData.stock_name} (${reportData.stock_symbol}) 估值分析报告`,
          version: 'v1.0',
          isInsightRefineryEnhanced: false,
          createdAt: reportData.created_at,
          generationModel: 'sonar-deep-research',
          parentReportId: undefined
        }])

        // 暂时没有讨论会话
        setDiscussions([])
      } else {
        console.log('❌ 未找到报告数据')
      }

    } catch (error) {
      console.error('Error fetching folder data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVersionIcon = (version: ReportVersion) => {
    if (version.isInsightRefineryEnhanced) {
      return <GitBranch className="h-4 w-4 text-purple-600" />
    }
    return <FileText className="h-4 w-4 text-blue-600" />
  }

  const getVersionColor = (version: ReportVersion) => {
    if (version.isInsightRefineryEnhanced) {
      return 'border-purple-200 bg-purple-50 hover:bg-purple-100'
    }
    return 'border-blue-200 bg-blue-50 hover:bg-blue-100'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="text-center py-8 text-gray-500">
        文件夹不存在或无法访问
      </div>
    )
  }

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      {/* 文件夹头部 */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
            <Folder className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">
                {folder.companyName} ({folder.ticker})
              </h3>
              <p className="text-sm text-gray-500">
                {folder.totalVersions} 个版本 • {folder.totalDiscussions} 次讨论
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(folder.lastActivity)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span>活跃</span>
            </div>
          </div>
        </div>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="border-t bg-gray-50">
          {/* 版本列表 */}
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              报告版本
            </h4>
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${getVersionColor(version)}`}
                  onClick={() => onReportSelect?.(version.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getVersionIcon(version)}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {version.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {version.version} • {version.generationModel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(version.createdAt)}
                      </span>
                      {version.isInsightRefineryEnhanced && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Insight Refinery
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 讨论会话 */}
          <div className="p-4 border-t">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              讨论会话
            </h4>
            <div className="space-y-2">
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="bg-white border rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          会话 {discussion.id.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {discussion.totalQuestions} 个问题 • {discussion.keyInsightsCount} 个关键洞察
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        discussion.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : discussion.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {discussion.status === 'active' ? '进行中' :
                         discussion.status === 'completed' ? '已完成' : '已归档'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(discussion.sessionStart)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-3">
              <button
                onClick={() => onStartInsightRefinery?.(folder.latestVersionId)}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                🔬 开始 Insight Refinery
              </button>
              <button
                onClick={() => onReportSelect?.(folder.latestVersionId)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                查看最新版本
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
