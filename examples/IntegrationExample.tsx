// 集成示例：在现有报告页面中添加Insight Refinery功能

import React from 'react'
import InsightRefineryButton from '@/components/InsightRefinery/InsightRefineryButton'
import ReportHub from '@/components/InsightRefinery/ReportHub'
import { Locale } from '@/lib/i18n'

// 示例1: 在报告详情页面添加Insight Refinery按钮
export function ReportDetailPage({ 
  reportId, 
  reportTitle, 
  userId, 
  locale 
}: {
  reportId: string
  reportTitle: string
  userId: string
  locale: Locale
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 报告内容 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {reportTitle}
        </h1>
        
        {/* 报告内容区域 */}
        <div className="prose max-w-none">
          {/* 这里放置报告内容 */}
        </div>
      </div>

      {/* 操作按钮区域 */}
      <div className="flex flex-wrap gap-4 justify-center">
        {/* 原有的下载按钮 */}
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          📄 下载PDF
        </button>
        
        {/* 原有的分享按钮 */}
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          🔗 分享报告
        </button>
        
        {/* 新增的Insight Refinery按钮 */}
        <InsightRefineryButton
          reportId={reportId}
          reportTitle={reportTitle}
          userId={userId}
          locale={locale}
          variant="primary"
          size="md"
        />
      </div>
    </div>
  )
}

// 示例2: 在用户仪表板中添加Report Hub
export function UserDashboard({ userId, locale }: { userId: string, locale: Locale }) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        研报中心
      </h1>
      
      {/* Report Hub组件 */}
      <ReportHub
        userId={userId}
        locale={locale}
      />
    </div>
  )
}

// 示例3: 在导航栏中添加Insight Refinery入口
export function NavigationBar({ userId, locale }: { userId: string, locale: Locale }) {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              SuperAnalyst Pro
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 原有的导航链接 */}
            <a href="/reports" className="text-gray-600 hover:text-gray-900">
              我的研报
            </a>
            <a href="/generate" className="text-gray-600 hover:text-gray-900">
              生成研报
            </a>
            
            {/* 新增的Insight Refinery入口 */}
            <a 
              href="/insight-refinery" 
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔬 Insight Refinery
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

// 示例4: 在报告列表中添加Insight Refinery状态指示器
export function ReportListItem({ 
  report, 
  userId, 
  locale 
}: { 
  report: any
  userId: string
  locale: Locale 
}) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {report.title}
          </h3>
          <p className="text-sm text-gray-500">
            {report.company_name} ({report.ticker})
          </p>
          <p className="text-xs text-gray-400">
            {new Date(report.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 版本指示器 */}
          {report.is_insight_refinery_enhanced && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              Insight Refinery
            </span>
          )}
          
          {/* 操作按钮 */}
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            查看
          </button>
          
          <InsightRefineryButton
            reportId={report.id}
            reportTitle={report.title}
            userId={userId}
            locale={locale}
            variant="outline"
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}

// 示例5: 在设置页面中添加Insight Refinery配置
export function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        设置
      </h1>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Insight Refinery 设置
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              默认讨论模型
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="sonar-pro">Sonar Pro</option>
              <option value="sonar-deep-research">Sonar Deep Research</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自动洞察标记
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto-insight"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="auto-insight" className="ml-2 text-sm text-gray-700">
                自动标记关键洞察
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              讨论会话保留时间
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="7">7天</option>
              <option value="30">30天</option>
              <option value="90">90天</option>
              <option value="forever">永久保留</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}



