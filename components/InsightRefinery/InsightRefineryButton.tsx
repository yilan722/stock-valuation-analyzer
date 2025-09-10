'use client'

import React, { useState } from 'react'
import { Brain, MessageSquare, History, ChevronDown } from 'lucide-react'
import InsightRefineryModal from './InsightRefineryModal'
import ReportHistorySelector from './ReportHistorySelector'
import { Locale } from '@/lib/i18n'

interface Report {
  id: string
  stock_name: string
  stock_symbol: string
  created_at: string
  user_id: string
  report_data: string
}

interface InsightRefineryButtonProps {
  reportId?: string
  reportTitle?: string
  userId: string
  locale: Locale
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showHistoryOption?: boolean
}

export default function InsightRefineryButton({
  reportId,
  reportTitle,
  userId,
  locale,
  className = '',
  variant = 'primary',
  size = 'md',
  showHistoryOption = true
}: InsightRefineryButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [showHistorySelector, setShowHistorySelector] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
      case 'outline':
        return 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold'
      default:
        return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-xs font-semibold rounded-lg'
      case 'md':
        return 'px-6 py-3 text-sm font-semibold rounded-lg'
      case 'lg':
        return 'px-8 py-4 text-base font-semibold rounded-xl'
      default:
        return 'px-6 py-3 text-sm font-semibold rounded-lg'
    }
  }

  const handleStartAnalysis = () => {
    if (reportId && reportTitle) {
      // 直接分析当前报告
      setShowModal(true)
    } else {
      // 显示历史报告选择器
      setShowHistorySelector(true)
    }
  }

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report)
    setShowHistorySelector(false)
    setShowModal(true)
  }

  const getCurrentReportId = () => {
    return selectedReport?.id || reportId || ''
  }

  const getCurrentReportTitle = () => {
    return selectedReport ? `${selectedReport.stock_name} (${selectedReport.stock_symbol}) 估值分析报告` : reportTitle || ''
  }

  return (
    <>
      <div className="relative">
        {showHistoryOption && !reportId ? (
          // 显示下拉按钮
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`
                inline-flex items-center space-x-2 rounded-lg font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                ${getVariantClasses()} ${getSizeClasses()} ${className}
              `}
            >
              <Brain className="h-4 w-4" />
              <span>🔬 Insight Refinery</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowHistorySelector(true)
                      setShowDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <History className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">选择历史报告</div>
                      <div className="text-sm text-gray-500">从已生成的报告中选择</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // 显示普通按钮
          <button
            onClick={handleStartAnalysis}
            className={`
              inline-flex items-center space-x-2 rounded-lg font-medium transition-colors
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
              ${getVariantClasses()} ${getSizeClasses()} ${className}
            `}
          >
            <Brain className="h-4 w-4" />
            <span>🔬 Insight Refinery</span>
          </button>
        )}
      </div>

      {/* 历史报告选择器 */}
      {showHistorySelector && (
        <ReportHistorySelector
          userId={userId}
          onSelectReport={handleSelectReport}
          onClose={() => setShowHistorySelector(false)}
        />
      )}

      {/* Insight Refinery 模态框 */}
      {showModal && (
        <InsightRefineryModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedReport(null)
          }}
          reportId={getCurrentReportId()}
          reportTitle={getCurrentReportTitle()}
          userId={userId}
          locale={locale}
        />
      )}
    </>
  )
}

