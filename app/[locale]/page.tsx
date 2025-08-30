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
import { StockData, ValuationReportData, MultiCompanyAnalysis } from '../../types'
import { type Locale } from '../../lib/i18n'
import { getTranslation } from '../../lib/translations'
import useAuth from '../../lib/useAuth'
import { canGenerateReport } from '../../lib/supabase-auth'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

// 导入新功能组件
import UserInputModal from '../../src/features/personal-research-center/user-input-modal'
import DisplayVersionedReport from '../../src/features/personal-research-center/display-versioned-report'
import MultiCompanyModal from '../../src/features/multi-company-analysis/multi-company-modal'
import MultiCompanyResults from '../../src/features/multi-company-analysis/multi-company-results'
import { ReportGenerationAgent } from '../../src/features/personal-research-center/generate-report-agent'
import { getFeatureFlags } from '../../lib/env'

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
  
  // 添加调试信息 - 只在开发环境和状态变化时打印
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 主页面用户状态:', { 
        useAuthUser: useAuthUser?.id, 
        userLoading,
        useAuthUserId: useAuthUser?.id
      })
    }
  }, [useAuthUser?.id, userLoading]) // 只在关键状态变化时触发
  
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
  
  // 减少重复日志，只在真正的状态变化时打印
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 当前用户状态:', { 
        currentUser: currentUser?.id, 
        isUserLoading, 
        userLoading,
        useAuthUser: useAuthUser?.id
      })
    }
  }, [currentUser?.id, isUserLoading]) // 只在关键状态变化时触发
  
  // UI state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showReportHistory, setShowReportHistory] = useState(false)
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  // 新功能状态
  const [showPersonalResearchModal, setShowPersonalResearchModal] = useState(false)
  const [showMultiCompanyModal, setShowMultiCompanyModal] = useState(false)
  const [showMultiCompanyResults, setShowMultiCompanyResults] = useState(false)
  const [multiCompanyAnalysis, setMultiCompanyAnalysis] = useState<MultiCompanyAnalysis | null>(null)
  const [isGeneratingPersonalReport, setIsGeneratingPersonalReport] = useState(false)
  const [versionedReport, setVersionedReport] = useState<any>(null)
  const [showVersionedReport, setShowVersionedReport] = useState(false)

  // 功能开关
  const featureFlags = getFeatureFlags()

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

  const handleGenerateReport = async () => {
    console.log('🚀 开始生成报告流程...')
    console.log('📊 当前状态:', {
      stockData: stockData?.symbol,
      currentUser: currentUser?.id,
      currentUserEmail: currentUser?.email,
      isUserLoading,
      userLoading
    })
    
    if (!stockData) {
      console.log('❌ 没有选择股票')
      toast.error(getTranslation(params.locale, 'noStockSelected'))
      return
    }

    if (!currentUser) {
      console.log('❌ 用户未登录，显示登录模态框')
      setShowAuthModal(true)
      return
    }

    console.log('✅ 用户已登录，开始权限检查...')

    // 检查用户权限
    try {
      console.log('🔍 调用canGenerateReport...')
      const canGenerate = await canGenerateReport(currentUser.id)
      console.log('📋 权限检查结果:', canGenerate)
      
      if (!canGenerate.canGenerate) {
        console.log('❌ 用户无权限，显示订阅模态框')
        setShowSubscriptionModal(true)
        return
      }
      
      console.log('✅ 用户有权限，继续生成报告...')
    } catch (error) {
      console.error('❌ 权限检查失败:', error)
      toast.error(getTranslation(params.locale, 'permissionCheckFailed'))
      return
    }

    setShowGenerationModal(true)
    setIsGeneratingReport(true)

    try {
      console.log('📡 发送生成报告请求...')
      const response = await fetch('/api/generate-report-perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`, // 添加认证头
        },
        body: JSON.stringify({
          stockData: stockData, // 发送完整的股票数据对象
          userId: currentUser.id,
          locale: params.locale, // 传递语言参数
        }),
      })

      console.log('📥 收到响应:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ 响应错误:', errorData)
        
        if (response.status === 403) {
          console.log('🚫 访问被拒绝，显示订阅模态框')
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
      console.log('✅ 报告生成成功:', data)
      setReportData(data)
      setShowGenerationModal(false)
      toast.success(getTranslation(params.locale, 'reportGenerated'))
    } catch (error) {
      console.error('❌ 报告生成失败:', error)
      setShowGenerationModal(false)
      
      // 提供更友好的错误信息
      let errorMessage = getTranslation(params.locale, 'apiError')
      if (error instanceof Error) {
        if (error.message.includes('API quota exhausted')) {
          errorMessage = 'API quota exhausted. Please try again later or contact support.'
        } else if (error.message.includes('Network connection issue')) {
          errorMessage = 'Network connection issue. Please check your internet connection and try again.'
        } else if (error.message.includes('API authentication failed')) {
          errorMessage = 'API authentication failed. Please contact support.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // 新功能处理函数
  const handlePersonalResearch = () => {
    if (!currentUser) {
      setShowAuthModal(true)
      return
    }
    if (!reportData) {
      toast.error('请先生成股票分析报告')
      return
    }
    setShowPersonalResearchModal(true)
  }

  const handlePersonalResearchSubmit = async (customInsights: string) => {
    if (!stockData || !reportData || !currentUser) return

    setIsGeneratingPersonalReport(true)
    try {
      const agent = new ReportGenerationAgent()
      const response = await agent.generatePersonalizedReport({
        stockSymbol: stockData.symbol,
        originalReport: reportData,
        userInsights: customInsights,
        userId: currentUser.id
      })

      if (response.success && response.versionedReport) {
        setVersionedReport(response.versionedReport)
        setShowPersonalResearchModal(false)
        setShowVersionedReport(true)
        toast.success('个性化报告生成成功！')
      } else {
        throw new Error(response.error || '生成失败')
      }
    } catch (error) {
      console.error('Personal research failed:', error)
      toast.error(error instanceof Error ? error.message : '生成失败')
    } finally {
      setIsGeneratingPersonalReport(false)
    }
  }

  const handleMultiCompanyAnalysis = () => {
    if (!currentUser) {
      setShowAuthModal(true)
      return
    }
    setShowMultiCompanyModal(true)
  }

  const handleMultiCompanyAnalysisComplete = (analysis: MultiCompanyAnalysis) => {
    setMultiCompanyAnalysis(analysis)
    setShowMultiCompanyResults(true)
  }

  const handleLogin = () => {
    setShowAuthModal(true)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      // useAuth hook will handle the user state update
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // useAuth hook will handle the user state update
  }

  const handleOpenSubscription = () => {
    setShowSubscriptionModal(true)
  }

  const handleOpenReportHistory = () => {
    setShowReportHistory(true)
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

                {/* 新功能按钮区域 */}
                {featureFlags.ENABLE_PERSONAL_RESEARCH && reportData && (
                  <div className="mt-6 pt-6 border-t border-amber-500/30">
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={handlePersonalResearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        个性化研究中心
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 多公司对比功能入口 */}
            {featureFlags.ENABLE_MULTI_COMPANY_ANALYSIS && currentUser && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">
                    我的研究决策中心
                  </h3>
                  <p className="text-sm text-purple-700 mb-4">
                    多股对标分析，AI智能推荐，助您做出最佳投资决策
                  </p>
                  <button
                    onClick={handleMultiCompanyAnalysis}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    开始多股对标分析
                  </button>
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

      {/* 新功能模态框 */}
      {featureFlags.ENABLE_PERSONAL_RESEARCH && (
        <>
          <UserInputModal
            isOpen={showPersonalResearchModal}
            onClose={() => setShowPersonalResearchModal(false)}
            stockSymbol={stockData?.symbol || ''}
            stockName={stockData?.name || ''}
            onSubmit={handlePersonalResearchSubmit}
            isLoading={isGeneratingPersonalReport}
          />

          {versionedReport && (
            <DisplayVersionedReport
              originalReport={reportData!}
              versionedReport={versionedReport}
              onClose={() => setShowVersionedReport(false)}
            />
          )}
        </>
      )}

      {featureFlags.ENABLE_MULTI_COMPANY_ANALYSIS && (
        <>
          <MultiCompanyModal
            isOpen={showMultiCompanyModal}
            onClose={() => setShowMultiCompanyModal(false)}
            onAnalysisComplete={handleMultiCompanyAnalysisComplete}
          />

          {multiCompanyAnalysis && (
            <MultiCompanyResults
              analysis={multiCompanyAnalysis}
              onClose={() => setShowMultiCompanyResults(false)}
            />
          )}
        </>
      )}
      
      <Footer />
      <Toaster position="top-right" />
    </div>
  )
} 