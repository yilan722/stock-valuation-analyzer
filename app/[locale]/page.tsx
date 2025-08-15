'use client'

import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from '../../components/Header'
import SearchForm from '../../components/SearchForm'
import ValuationReport from '../../components/ValuationReport'
import ReportDemo from '../../components/ReportDemo'
import AuthModal from '../../components/AuthModal'
import SubscriptionModal from '../../components/SubscriptionModal'
import ReportHistory from '../../components/ReportHistory'
import GenerationModal from '../../components/GenerationModal'
import DebugPanel from '../../components/DebugPanel'
import Footer from '../../components/Footer'
import { StockData, ValuationReportData } from '../../types'
import { type Locale } from '../../lib/i18n'
import { getTranslation } from '../../lib/translations'
import { useAuth } from '../../lib/useAuth'
import { canGenerateReport } from '../../lib/supabase-auth'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface PageProps {
  params: { locale: Locale }
}

export default function HomePage({ params }: PageProps) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [reportData, setReportData] = useState<ValuationReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  
  // 使用useAuth hook管理用户状态
  const { user: useAuthUser, loading: userLoading, forceUpdate: useAuthForceUpdate, resetLoading: useAuthResetLoading, forceSetUser: useAuthForceSetUser } = useAuth()
  
  // 添加调试信息
  console.log('🔍 主页面用户状态:', { 
    useAuthUser, 
    userLoading,
    useAuthUserId: useAuthUser?.id
  })
  
  // 强制更新状态
  const [, forceUpdate] = useState({})
  
  // 移除重复的认证监听，只使用useAuth hook
  // useEffect(() => {
  //   // 这个监听器已被移除，避免与useAuth hook冲突
  // }, [])
  
  // 只使用useAuth hook的用户状态
  const currentUser = useAuthUser
  
  // 检查是否还在加载中 - 修复逻辑
  // 如果用户已认证但loading仍为true，强制设置为false
  const isUserLoading = userLoading && !useAuthUser
  
  console.log('🔍 当前用户状态:', { 
    currentUser: currentUser?.id, 
    isUserLoading, 
    userLoading,
    useAuthUser: useAuthUser?.id
  })
  
  // UI state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showReportHistory, setShowReportHistory] = useState(false)
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  // 如果检测到loading状态异常，强制重置
  useEffect(() => {
    if (useAuthUser && userLoading) {
      console.log('⚠️ 检测到loading状态异常，强制重置')
      useAuthResetLoading()
    }
  }, [useAuthUser, userLoading, useAuthResetLoading])

  // 监听用户状态变化，自动关闭登录模态框
  useEffect(() => {
    if (useAuthUser && showAuthModal) {
      console.log('🔒 用户已认证，自动关闭登录模态框')
      setShowAuthModal(false)
    }
  }, [useAuthUser, showAuthModal])

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

  const handleAuthSuccess = () => {
    console.log('✅ 认证成功，用户状态将自动更新')
    
    // 立即关闭登录模态框
    setShowAuthModal(false)
    console.log('🔒 登录模态框已关闭')
    
    // 从URL或localStorage获取用户ID
    const getUserIdFromAuth = () => {
      // 尝试从Supabase获取当前会话
      return new Promise<string | null>((resolve) => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user?.id) {
            resolve(session.user.id)
          } else {
            resolve(null)
          }
        })
      })
    }
    
    // 强制设置用户状态
    getUserIdFromAuth().then(userId => {
      if (userId) {
        console.log('🔄 强制设置用户状态:', userId)
        useAuthForceSetUser(userId)
      } else {
        console.log('⚠️ 无法获取用户ID，使用resetLoading')
        useAuthResetLoading()
      }
    })
    
    // 强制更新组件状态
    setTimeout(() => {
      useAuthForceUpdate()
      forceUpdate({})
    }, 100)
  }

  const handleLogout = () => {
    // useAuth hook会自动处理登出状态
    console.log('👋 User logged out')
  }

  const handleLogin = () => {
    setShowAuthModal(true)
  }

  const handleOpenSubscription = () => {
    setShowSubscriptionModal(true)
  }

  const handleOpenReportHistory = () => {
    setShowReportHistory(true)
  }

  const handleGenerateReport = async () => {
    if (!stockData) {
      toast.error(getTranslation(params.locale, 'stockNotFound'))
      return
    }

    if (!currentUser) {
      console.log('No user found, showing auth modal')
      setShowAuthModal(true)
      return
    }

    console.log('Generating report for user:', currentUser.id)
    setShowGenerationModal(true)
    setIsGeneratingReport(true)
    try {
      // 确保请求包含认证信息
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 添加认证头 - 使用用户ID作为备选方案
          'Authorization': `Bearer ${currentUser.id}`,
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
          const errorData = await response.json()
          if (errorData.needsSubscription) {
            toast.error(getTranslation(params.locale, 'subscription_required'))
            setShowSubscriptionModal(true)
          } else {
            toast.error(errorData.reason || getTranslation(params.locale, 'accessDenied'))
          }
          return
        }
        throw new Error(errorData.error || getTranslation(params.locale, 'apiError'))
      }

      const data = await response.json()
      setReportData(data)
      setShowGenerationModal(false)
      toast.success(getTranslation(params.locale, 'reportGenerated'))
      // loadUser() // Refresh user data to update usage - useAuth hook handles this
    } catch (error) {
      console.error('Report generation error:', error)
      setShowGenerationModal(false)
      toast.error(error instanceof Error ? error.message : getTranslation(params.locale, 'apiError'))
    } finally {
      setIsGeneratingReport(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <Header
          locale={params.locale}
          user={currentUser}
          onLogout={handleLogout}
          onRefresh={() => {}} // No need to reload user here, useAuth handles it
          onLogin={handleLogin}
          onOpenSubscription={handleOpenSubscription}
          onOpenReportHistory={handleOpenReportHistory}
          onOpenDebugPanel={() => setShowDebugPanel(true)}
        />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Search Form and Stock Data Display */}
          <div className="space-y-4 sm:space-y-6">
            <SearchForm
              onSearch={handleSearch}
              onGenerateReport={handleGenerateReport}
              isLoading={isUserLoading || isGeneratingReport}
              locale={params.locale}
              isGeneratingReport={isGeneratingReport}
            />
            
            {/* Stock Data Display - Above Demo */}
            {stockData && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-amber-500/30 shadow-lg p-3 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 font-inter text-center sm:text-left">
                  {stockData.name} ({stockData.symbol}) Stock Information
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 text-sm sm:text-lg font-bold">$</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200 mb-1 font-inter">Price</p>
                    <p className="text-lg sm:text-2xl font-bold text-white font-inter">${stockData.price}</p>
                    <p className={`text-xs sm:text-sm ${stockData.change >= 0 ? 'text-green-400' : 'text-red-400'} font-inter`}>
                      {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200 mb-1 font-inter">Market Cap</p>
                    <p className="text-lg sm:text-2xl font-bold text-white font-inter">${(stockData.marketCap / 1e9).toFixed(2)}B</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200 mb-1 font-inter">P/E Ratio</p>
                    <p className="text-lg sm:text-2xl font-bold text-white font-inter">{stockData.peRatio}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </div>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200 mb-1 font-inter">Trading Volume($)</p>
                    <p className="text-lg sm:text-2xl font-bold text-white font-inter">
                      {/* 判断是A股还是美股，A股显示成交量，美股显示成交额 */}
                      {/^[0-9]{6}$/.test(stockData.symbol) || stockData.symbol.startsWith('688') || stockData.symbol.startsWith('300') 
                        ? `${(stockData.volume / 10000).toFixed(2)}万` // A股显示成交量（万股）
                        : `$${(stockData.amount / 1e9).toFixed(2)}B` // 美股显示成交额（十亿美元）
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Report Demo Section - Only show when no report data */}
          {!reportData && (
            <ReportDemo locale={params.locale} />
          )}
          
          {/* Valuation Report - Show when report data exists */}
          {reportData && (
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
        userId={currentUser?.id || ''}
        locale={params.locale}
      />

      <ReportHistory
        isOpen={showReportHistory}
        onClose={() => setShowReportHistory(false)}
        locale={params.locale}
      />

      <GenerationModal
        isOpen={showGenerationModal}
        locale={params.locale}
      />
      
      {/* 调试面板 */}
      <DebugPanel 
        isOpen={showDebugPanel} 
        onClose={() => setShowDebugPanel(false)} 
      />
      
      <Footer />
      <Toaster position="top-right" />
    </div>
  )
} 