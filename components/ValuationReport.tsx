'use client'

import React, { useState } from 'react'
import { DollarSign, TrendingUp, BarChart3, TrendingDown, Download } from 'lucide-react'
import { StockData, ValuationReportData } from '../types'
import { type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'
import toast from 'react-hot-toast'

interface ValuationReportProps {
  stockData: StockData | null
  reportData: ValuationReportData | null
  isLoading: boolean
  locale: Locale
}

export default function ValuationReport({ stockData, reportData, isLoading, locale }: ValuationReportProps) {
  const [activeTab, setActiveTab] = useState('fundamental')
  const [isDownloading, setIsDownloading] = useState(false)

  const formatNumber = (num: number, withCurrency = true) => {
    const prefix = withCurrency ? '$' : ''
    if (num >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${prefix}${(num / 1e3).toFixed(2)}K`
    return `${prefix}${num.toFixed(2)}`
  }

  const formatAmount = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toLocaleString()
  }

  const handleDownloadPDF = async () => {
    if (!reportData || !stockData) return

    setIsDownloading(true)
    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportData,
          stockName: stockData.name,
          stockSymbol: stockData.symbol
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${stockData.symbol}_valuation_report_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Show success message
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Download failed'
      toast.error(errorMessage)
      
      // Retry logic for certain errors
      if (errorMessage.includes('timeout') || errorMessage.includes('memory')) {
        if (confirm('PDF generation failed. Would you like to try again?')) {
          setTimeout(() => handleDownloadPDF(), 2000)
        }
      }
    } finally {
      setIsDownloading(false)
    }
  }

  if (!stockData) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
      {/* Stock Information Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {stockData.name} ({stockData.symbol})
          </h2>
          <p className="text-sm text-gray-600">{getTranslation(locale, 'stockInformation')}</p>
        </div>
        {reportData && (
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{isDownloading ? getTranslation(locale, 'generatingPDF') : getTranslation(locale, 'downloadPDF')}</span>
          </button>
        )}
      </div>

      {/* Stock Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600">{getTranslation(locale, 'price')}</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            ${stockData.price.toFixed(2)}
          </p>
          <p className={`text-sm ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">{getTranslation(locale, 'marketCap')}</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatNumber(stockData.marketCap)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-600">{getTranslation(locale, 'peRatio')}</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {stockData.peRatio.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">{getTranslation(locale, 'tradingVolume')}</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatAmount(stockData.amount)}
          </p>
        </div>
      </div>

      {/* Report Content */}
      {reportData && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'fundamental', label: getTranslation(locale, 'fundamentalAnalysis') },
                { id: 'segments', label: getTranslation(locale, 'businessSegments') },
                { id: 'catalysts', label: getTranslation(locale, 'growthCatalysts') },
                { id: 'valuation', label: getTranslation(locale, 'valuationAnalysis') }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'fundamental' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">{getTranslation(locale, 'fundamentalAnalysis')}</h3>
                <div className="prose max-w-none report-content">
                  <div dangerouslySetInnerHTML={{ __html: reportData.fundamentalAnalysis }} />
                </div>
              </div>
            )}

            {activeTab === 'segments' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">{getTranslation(locale, 'businessSegments')}</h3>
                <div className="prose max-w-none report-content">
                  <div dangerouslySetInnerHTML={{ __html: reportData.businessSegments }} />
                </div>
              </div>
            )}

            {activeTab === 'catalysts' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">{getTranslation(locale, 'growthCatalysts')}</h3>
                <div className="prose max-w-none report-content">
                  <div dangerouslySetInnerHTML={{ __html: reportData.growthCatalysts }} />
                </div>
              </div>
            )}

            {activeTab === 'valuation' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">{getTranslation(locale, 'valuationAnalysis')}</h3>
                <div className="prose max-w-none report-content">
                  <div dangerouslySetInnerHTML={{ __html: reportData.valuationAnalysis }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600">{getTranslation(locale, 'loading')}</span>
          </div>
        </div>
      )}
    </div>
  )
} 