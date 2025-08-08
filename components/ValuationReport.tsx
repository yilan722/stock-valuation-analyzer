'use client'

import { 
  Building2, 
  TrendingUp, 
  Target, 
  DollarSign, 
  BarChart3, 
  Lightbulb,
  Download,
  Share2
} from 'lucide-react'
import { ValuationReportData, StockData } from '@/types'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ValuationReportProps {
  data: ValuationReportData
  stockData: StockData
}

export default function ValuationReport({ data, stockData }: ValuationReportProps) {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const pieData = data.businessSegments.map((segment, index) => ({
    name: segment.name,
    value: segment.revenue,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
  }))

  const barData = data.businessSegments.map(segment => ({
    name: segment.name,
    revenue: segment.revenue / 1e6,
    growth: segment.growth,
    margin: segment.margin
  }))

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return 'text-green-600 bg-green-100'
      case 'HOLD': return 'text-yellow-600 bg-yellow-100'
      case 'SELL': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.basicInfo.companyName} ({data.basicInfo.ticker})
            </h1>
            <p className="text-gray-600">Comprehensive Valuation Analysis Report</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Current Price</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.basicInfo.currentPrice)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Target Price</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.valuation.targetPrice)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Market Cap</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(data.basicInfo.marketCap)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Recommendation</span>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRecommendationColor(data.valuation.recommendation)}`}>
              {data.valuation.recommendation}
            </span>
          </div>
        </div>
      </div>

      {/* Company Overview */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Building2 className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Company Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {data.basicInfo.description}
            </p>
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Ticker Symbol</span>
                <span className="font-semibold">{data.basicInfo.ticker}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Current Price</span>
                <span className="font-semibold">{formatCurrency(data.basicInfo.currentPrice)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Market Cap</span>
                <span className="font-semibold">{formatNumber(data.basicInfo.marketCap)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">P/E Ratio</span>
                <span className="font-semibold">{data.basicInfo.peRatio.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Segments Revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Business Segments Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Business Segments Analysis</h2>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Segment</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${(value as number).toFixed(0)}M`} />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 border-b border-gray-200 font-semibold text-gray-900">Segment</th>
                <th className="text-right p-4 border-b border-gray-200 font-semibold text-gray-900">Revenue</th>
                <th className="text-right p-4 border-b border-gray-200 font-semibold text-gray-900">Growth</th>
                <th className="text-right p-4 border-b border-gray-200 font-semibold text-gray-900">Margin</th>
              </tr>
            </thead>
            <tbody>
              {data.businessSegments.map((segment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-4 border-b border-gray-200 font-medium text-gray-900">
                    {segment.name}
                  </td>
                  <td className="p-4 border-b border-gray-200 text-right font-semibold text-gray-900">
                    {formatNumber(segment.revenue)}
                  </td>
                  <td className="p-4 border-b border-gray-200 text-right">
                    <span className={`font-semibold ${segment.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {segment.growth >= 0 ? '+' : ''}{segment.growth.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-4 border-b border-gray-200 text-right font-semibold text-gray-900">
                    {segment.margin.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Growth Catalysts */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Lightbulb className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Growth Catalysts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.growthCatalysts.map((catalyst, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-primary-500">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Growth Driver {index + 1}</h3>
                  <p className="text-gray-700 leading-relaxed">{catalyst}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Valuation Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Valuation Analysis</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Valuation Metrics</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">DCF Valuation</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(data.valuation.dcfValue)}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">P/E Based Value</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(data.valuation.peBasedValue)}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">P/B Based Value</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(data.valuation.pbBasedValue)}</span>
                </div>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                <div className="flex justify-between items-center">
                  <span className="text-primary-700 font-semibold">Target Price</span>
                  <span className="font-bold text-primary-900 text-lg">{formatCurrency(data.valuation.targetPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Recommendation</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getRecommendationColor(data.valuation.recommendation)}`}>
                  {data.valuation.recommendation}
                </span>
                <span className="text-sm text-gray-600">Target: {formatCurrency(data.valuation.targetPrice)}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {data.valuation.reasoning}
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Key Valuation Insights</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• DCF analysis suggests {((data.valuation.dcfValue / data.basicInfo.currentPrice - 1) * 100).toFixed(1)}% upside potential</li>
                <li>• P/E multiple analysis indicates fair value at {formatCurrency(data.valuation.peBasedValue)}</li>
                <li>• Book value analysis supports {formatCurrency(data.valuation.pbBasedValue)} valuation</li>
                <li>• Multiple growth catalysts support positive outlook</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Disclaimer</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This analysis is for informational purposes only and should not be considered as investment advice. 
              The valuation estimates are based on available data and AI analysis, but market conditions can change rapidly. 
              Always conduct your own research and consider consulting with a financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 