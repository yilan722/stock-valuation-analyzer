'use client'

import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from '../../components/Header'
import SearchForm from '../../components/SearchForm'
import ValuationReport from '../../components/ValuationReport'
import AuthModal from '../../components/AuthModal'
import SubscriptionModal from '../../components/SubscriptionModal'
import { StockData, ValuationReportData } from '../../types'
import { type Locale } from '../../lib/i18n'
import { getTranslation } from '../../lib/translations'
import { getCurrentUser, canGenerateReport } from '../../lib/supabase-auth'
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
    console.log('Component mounted, loading user...')
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      console.log('Loading user...')
      const userData = await getCurrentUser()
      console.log('User data loaded:', userData)
      
      if (userData) {
        // 🔥 新增：获取白名单状态
        try {
          const whitelistStatus = await canGenerateReport(userData.id)
          const userWithWhitelist = {
            ...userData,
            whitelistStatus
          }
          setUser(userWithWhitelist)
          console.log('User with whitelist status:', userWithWhitelist)
        } catch (whitelistError) {
          console.error('获取白名单状态失败:', whitelistError)
          setUser(userData)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      setUser(null)
    } finally {
      setIsLoadingUser(false)
    }
  }

  const handleAuthSuccess = async () => {
    // 等待一下让 Supabase 会话更新
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Auth success, reloading user...')
    await loadUser()
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleLogin = () => {
    setShowAuthModal(true)
  }

  const handleOpenSubscription = () => {
    setShowSubscriptionModal(true)
  }

  const handleGenerateReport = async () => {
    if (!stockData) {
      toast.error(getTranslation(params.locale, 'stockNotFound'))
      return
    }

    if (!user) {
      console.log('No user found, showing auth modal')
      setShowAuthModal(true)
      return
    }

    console.log('Generating report for user:', user.id)
    setIsGeneratingReport(true)
    try {
      // 确保请求包含认证信息
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 添加认证头 - 使用用户ID作为备选方案
          'Authorization': `Bearer ${user.id}`,
        },
        credentials: 'include', // 确保包含cookies
        body: JSON.stringify({
          stockData,
          locale: params.locale
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          console.log('Authentication failed, showing auth modal')
          setShowAuthModal(true)
          return
        }
        if (response.status === 403) {
          console.log('Access denied, showing subscription modal')
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
      <Header 
        locale={params.locale} 
        user={user}
        onLogout={handleLogout}
        onRefresh={loadUser}
        onLogin={handleLogin}
        onOpenSubscription={handleOpenSubscription}
      />
      
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
        userId={user?.id || ''}
        locale={params.locale}
      />
      
      <Toaster position="top-right" />
    </div>
  )
} 