'use client'

import React, { useState } from 'react'
import { X, Download, Share2, Save, FileText, BarChart3, Target, Lightbulb } from 'lucide-react'
import { MultiCompanyAnalysis } from '../../../types'
import RadarChart from './radar-chart'
import ComparisonTable from './comparison-table'
import AIRecommendation from './ai-recommendation'
import { ExportUtils } from './export-utils'

interface MultiCompanyResultsProps {
  analysis: MultiCompanyAnalysis
  onClose: () => void
}

export default function MultiCompanyResults({ analysis, onClose }: MultiCompanyResultsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [exportOptions, setExportOptions] = useState({
    format: 'pdf' as 'pdf' | 'excel' | 'json',
    includeCharts: true,
    includeRecommendations: true,
    watermark: ''
  })

  const tabs = [
    { id: 'overview', label: '概览', icon: BarChart3 },
    { id: 'radar', label: '雷达图', icon: Target },
    { id: 'comparison', label: '对比表', icon: FileText },
    { id: 'recommendation', label: 'AI推荐', icon: Lightbulb }
  ]

  const handleExport = async () => {
    try {
      let blob: Blob
      let filename: string

      switch (exportOptions.format) {
        case 'pdf':
          blob = await ExportUtils.exportToPDF(analysis, exportOptions)
          filename = `多公司对比分析_${analysis.createdAt.toISOString().split('T')[0]}.pdf`
          break
        case 'excel':
          blob = await ExportUtils.exportToExcel(analysis, exportOptions)
          filename = `多公司对比分析_${analysis.createdAt.toISOString().split('T')[0]}.xlsx`
          break
        case 'json':
          blob = ExportUtils.exportToJSON(analysis, exportOptions)
          filename = `多公司对比分析_${analysis.createdAt.toISOString().split('T')[0]}.json`
          break
        default:
          return
      }

      ExportUtils.getDownloadLink(blob, filename)
    } catch (error) {
      console.error('Export failed:', error)
      alert('导出失败，请重试')
    }
  }

  const handleSaveTemplate = () => {
    const templateName = prompt('请输入模板名称：')
    if (templateName) {
      const template = ExportUtils.saveTemplate(analysis, templateName)
      alert(`模板"${templateName}"保存成功！`)
    }
  }

  const handleShare = async () => {
    const shareLink = ExportUtils.generateShareLink(analysis)
    const success = await ExportUtils.copyToClipboard(shareLink)
    
    if (success) {
      alert('分享链接已复制到剪贴板！')
    } else {
      alert('复制失败，请手动复制：' + shareLink)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-[95vh] flex flex-col">
        {/* Header - 固定头部 */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              多公司对比分析结果
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              分析时间: {analysis.createdAt.toLocaleString('zh-CN')}
              {analysis.templateName && ` | 模板: ${analysis.templateName}`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveTemplate}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
            >
              <Save size={16} className="mr-2" />
              保存模板
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center"
            >
              <Share2 size={16} className="mr-2" />
              分享
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center"
            >
              <Download size={16} className="mr-2" />
              导出
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded"
              title="关闭"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Export Options - 固定区域 */}
        <div className="px-6 py-4 bg-gray-50 border-b flex-shrink-0">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">导出格式:</label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as any })}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeCharts"
                checked={exportOptions.includeCharts}
                onChange={(e) => setExportOptions({ ...exportOptions, includeCharts: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="includeCharts" className="text-sm text-gray-700">包含图表</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeRecommendations"
                checked={exportOptions.includeRecommendations}
                onChange={(e) => setExportOptions({ ...exportOptions, includeRecommendations: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="includeRecommendations" className="text-sm text-gray-700">包含推荐</label>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">水印:</label>
              <input
                type="text"
                placeholder="可选"
                value={exportOptions.watermark}
                onChange={(e) => setExportOptions({ ...exportOptions, watermark: e.target.value })}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm w-32"
              />
            </div>
          </div>
        </div>

        {/* Tabs - 固定导航 */}
        <div className="border-b flex-shrink-0">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content - 可滚动区域 */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0" style={{
          WebkitOverflowScrolling: 'touch',
          maxHeight: 'calc(95vh - 200px)' // 减去头部、导出选项和标签的高度
        }}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.companies.length}</div>
                  <div className="text-sm text-blue-700">分析公司数</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.aiRecommendation.topPick || '无推荐'}
                  </div>
                  <div className="text-sm text-green-700">AI推荐标的</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analysis.companies.length > 0 
                      ? (analysis.companies.reduce((sum, c) => sum + (c.keyMetrics?.upsidePotential || 0), 0) / analysis.companies.length).toFixed(1)
                      : '0'
                    }%
                  </div>
                  <div className="text-sm text-yellow-700">平均上涨空间</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysis.createdAt.toLocaleDateString('zh-CN')}
                  </div>
                  <div className="text-sm text-purple-700">分析日期</div>
                </div>
              </div>

              {/* Debug Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">调试信息</h4>
                <div className="text-xs text-yellow-700">
                  <div>geminiAnalysis存在: {Boolean((analysis as any).geminiAnalysis).toString()}</div>
                  <div>overview存在: {Boolean((analysis as any).geminiAnalysis?.overview).toString()}</div>
                  <div>overview长度: {(analysis as any).geminiAnalysis?.overview?.length || 0}</div>
                  <div>overview前100字符: {(analysis as any).geminiAnalysis?.overview?.substring(0, 100) || '无'}</div>
                </div>
              </div>

              {/* Gemini AI Analysis Overview */}
              {(analysis as any).geminiAnalysis?.overview && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">AI智能分析概览</h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {(analysis as any).geminiAnalysis.overview}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Radar Chart */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">五维评分概览</h3>
                <div className="h-64">
                  <RadarChart companies={analysis.companies} />
                </div>
              </div>

              {/* Quick Comparison */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">关键指标对比</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-gray-900 font-medium">公司</th>
                        <th className="text-left py-2 text-gray-900 font-medium">目标价</th>
                        <th className="text-left py-2 text-gray-900 font-medium">上涨空间</th>
                        <th className="text-left py-2 text-gray-900 font-medium">PE比率</th>
                        <th className="text-left py-2 text-gray-900 font-medium">ROE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.companies.slice(0, 5).map((company) => (
                        <tr key={company.symbol} className="border-b">
                          <td className="py-2 font-medium text-gray-900">{company.symbol}</td>
                          <td className="py-2 text-gray-900">${(company.keyMetrics?.targetPrice || 0).toFixed(2)}</td>
                          <td className="py-2 text-green-600">+{(company.keyMetrics?.upsidePotential || 0).toFixed(1)}%</td>
                          <td className="py-2 text-gray-900">{(company.keyMetrics?.peRatio || 0).toFixed(2)}</td>
                          <td className="py-2 text-gray-900">{(company.keyMetrics?.roe || 0).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="space-y-6">
              {/* Debug Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">调试信息</h4>
                <div className="text-xs text-yellow-700">
                  <div>geminiAnalysis存在: {Boolean((analysis as any).geminiAnalysis).toString()}</div>
                  <div>radarData存在: {Boolean((analysis as any).geminiAnalysis?.radarData).toString()}</div>
                  <div>rawText长度: {(analysis as any).geminiAnalysis?.radarData?.rawText?.length || 0}</div>
                  <div>rawText前100字符: {(analysis as any).geminiAnalysis?.radarData?.rawText?.substring(0, 100) || '无'}</div>
                </div>
              </div>

              {/* Gemini AI Radar Analysis */}
              {(analysis as any).geminiAnalysis?.radarData?.rawText && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">AI智能雷达图分析</h3>
                  <RadarChart 
                    companies={analysis.companies} 
                    geminiRadarData={(analysis as any).geminiAnalysis.radarData.rawText}
                  />
                </div>
              )}
              
              {/* Traditional Radar Chart */}
              {!((analysis as any).geminiAnalysis?.radarData?.rawText) && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">传统雷达图</h3>
                  <RadarChart companies={analysis.companies} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-6">
              {/* Debug Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">调试信息</h4>
                <div className="text-xs text-yellow-700">
                  <div>geminiAnalysis存在: {Boolean((analysis as any).geminiAnalysis).toString()}</div>
                  <div>comparisonTable存在: {Boolean((analysis as any).geminiAnalysis?.comparisonTable).toString()}</div>
                  <div>comparisonTable长度: {(analysis as any).geminiAnalysis?.comparisonTable?.length || 0}</div>
                  <div>comparisonTable前100字符: {(analysis as any).geminiAnalysis?.comparisonTable?.substring(0, 100) || '无'}</div>
                </div>
              </div>

              {/* Gemini AI Comparison Analysis */}
              {(analysis as any).geminiAnalysis?.comparisonTable && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">AI智能对比分析</h3>
                  <ComparisonTable 
                    companies={analysis.companies} 
                    geminiTableData={(analysis as any).geminiAnalysis.comparisonTable}
                  />
                </div>
              )}
              
              {/* Traditional Comparison Table */}
              {!((analysis as any).geminiAnalysis?.comparisonTable) && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">详细指标对比表</h3>
                  <ComparisonTable companies={analysis.companies} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendation' && (
            <div className="space-y-6">
              {/* Gemini AI Recommendation */}
              {(analysis as any).geminiAnalysis?.aiRecommendation && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">AI智能投资推荐</h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {(analysis as any).geminiAnalysis.aiRecommendation}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Traditional AI Recommendation */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">系统推荐分析</h3>
                <AIRecommendation analysis={analysis} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
