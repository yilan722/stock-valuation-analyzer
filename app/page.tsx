'use client'

import { useState } from 'react'
import SearchForm from '@/components/SearchForm'
import ValuationReport from '@/components/ValuationReport'
import Header from '@/components/Header'
import { StockData, ValuationReportData } from '@/types'
import toast from 'react-hot-toast'

export default function Home() {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [reportData, setReportData] = useState<ValuationReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (ticker: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stock-data?ticker=${ticker}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data')
      }

      const stockData = await response.json()
      setStockData(stockData)
    } catch (error) {
      console.error('Error fetching stock data:', error)
      toast.error('Failed to fetch stock data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!stockData) return
    
    setIsLoading(true)
    try {
      // 调用真实的API生成报告
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockData,
          financialData: {
            // 这里可以添加更多财务数据
            revenue: stockData.marketCap * 0.3,
            netIncome: stockData.marketCap * 0.05,
            totalAssets: stockData.marketCap * 1.2,
            debt: stockData.marketCap * 0.4
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const reportData = await response.json()
      setReportData(reportData)
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <SearchForm 
            onSearch={handleSearch}
            stockData={stockData}
            onGenerateReport={handleGenerateReport}
            isLoading={isLoading}
          />
          {reportData && (
            <ValuationReport 
              data={reportData}
              stockData={stockData!}
            />
          )}
        </div>
      </main>
    </div>
  )
} 