'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from '../../components/Header'
import SearchForm from '../../components/SearchForm'
import ValuationReport from '../../components/ValuationReport'
import { StockData, ValuationReportData } from '../../types'
import { type Locale } from '../../lib/i18n'
import { getTranslation } from '../../lib/translations'
import toast from 'react-hot-toast'

interface PageProps {
  params: { locale: Locale }
}

export default function HomePage({ params }: PageProps) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [reportData, setReportData] = useState<ValuationReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const handleSearch = async (symbol: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stock-data?ticker=${symbol}`)
      if (!response.ok) {
        throw new Error(getTranslation(params.locale, 'stockNotFound'))
      }
      const data = await response.json()
      setStockData(data)
      toast.success(getTranslation(params.locale, 'dataUpdated'))
    } catch (error) {
      console.error('Search error:', error)
      toast.error(error instanceof Error ? error.message : getTranslation(params.locale, 'apiError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!stockData) {
      toast.error(getTranslation(params.locale, 'stockNotFound'))
      return
    }

    setIsGeneratingReport(true)
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockData,
          locale: params.locale
        }),
      })

      if (!response.ok) {
        throw new Error(getTranslation(params.locale, 'apiError'))
      }

      const data = await response.json()
      setReportData(data)
      toast.success(getTranslation(params.locale, 'reportGenerated'))
    } catch (error) {
      console.error('Report generation error:', error)
      toast.error(error instanceof Error ? error.message : getTranslation(params.locale, 'apiError'))
    } finally {
      setIsGeneratingReport(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header locale={params.locale} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <SearchForm
            onSearch={handleSearch}
            onGenerateReport={handleGenerateReport}
            isLoading={isLoading || isGeneratingReport}
            locale={params.locale}
          />
          
          {stockData && (
            <ValuationReport
              stockData={stockData}
              reportData={reportData}
              isLoading={isGeneratingReport}
              locale={params.locale}
            />
          )}
        </div>
      </main>
      
      <Toaster position="top-right" />
    </div>
  )
} 