'use client'

import { useState } from 'react'
import { Search, ArrowRight, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'
import { StockData } from '@/types'
import toast from 'react-hot-toast'

interface SearchFormProps {
  onSearch: (ticker: string) => void
  stockData: StockData | null
  onGenerateReport: () => void
  isLoading: boolean
}

export default function SearchForm({ 
  onSearch, 
  stockData, 
  onGenerateReport, 
  isLoading 
}: SearchFormProps) {
  const [ticker, setTicker] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker.trim()) {
      toast.error('Please enter a stock ticker')
      return
    }
    onSearch(ticker.trim().toUpperCase())
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Professional Stock Valuation Analysis
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          输入股票代码获取专业的估值分析报告，支持美股和A股。我们的分析包括基本面数据、业务细分、增长催化点和详细的估值指标。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="输入股票代码 (如: AAPL, MSFT, 000001, 600519)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !ticker.trim()}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {stockData && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {stockData.name} ({stockData.symbol})
              </h3>
              <p className="text-sm text-gray-600">Stock Information</p>
            </div>
            <button
              onClick={onGenerateReport}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Price</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                ${stockData.price.toFixed(2)}
              </p>
              <p className={`text-sm ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Market Cap</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatNumber(stockData.marketCap)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">P/E Ratio</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {stockData.peRatio.toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Volume</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatNumber(stockData.volume)}
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="text-gray-600">Processing...</span>
          </div>
        </div>
      )}
    </div>
  )
} 