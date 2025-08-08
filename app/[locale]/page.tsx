'use client'

import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from '../../components/Header'
import SearchForm from '../../components/SearchForm'
import ValuationReport from '../../components/ValuationReport'
import AuthModal from '../../components/AuthModal'
import UserInfo from '../../components/UserInfo'
import SubscriptionModal from '../../components/SubscriptionModal'
import { StockData, ValuationReportData } from '../../types'
import { type Locale } from '../../lib/i18n'
import { getTranslation } from '../../lib/translations'
import { getCurrentUser } from '../../lib/supabase-auth'
import toast from 'react-hot-toast'

interface PageProps {
  params: { locale: Locale }
}

export default function HomePage({ params }: PageProps) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [reportData, setReportData] = useState<ValuationReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  
  // User state
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

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

  // Load user data on mount
  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user:', error)
    } finally {
      setIsLoadingUser(false)
    }
  }

  const handleAuthSuccess = () => {
    loadUser()
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleLogin = () => {
    setShowAuthModal(true)
  }

  const handleGenerateReport = async () => {
    if (!stockData) {
      toast.error(getTranslation(params.locale, 'stockNotFound'))
      return
    }

    if (!user) {
      setShowAuthModal(true)
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
        const errorData = await response.json()
        if (response.status === 401) {
          setShowAuthModal(true)
          return
        }
        if (response.status === 403) {
          setShowSubscriptionModal(true)
          return
        }
        throw new Error(errorData.error || getTranslation(params.locale, 'apiError'))
      }

      const data = await response.json()
      setReportData(data)
      toast.success(getTranslation(params.locale, 'reportGenerated'))
      loadUser() // Refresh user data to update usage
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* User Info Sidebar */}
          <div className="lg:col-span-1">
            <UserInfo
              user={user}
              onLogout={handleLogout}
              onRefresh={loadUser}
              onLogin={handleLogin}
              locale={params.locale}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
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
          </div>
        </div>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        locale={params.locale}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={handleAuthSuccess}
        locale={params.locale}
      />
      
      <Toaster position="top-right" />
    </div>
  )
} 