'use client'

import React, { useState } from 'react'
import { User, LogOut, CreditCard, BarChart3, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { signOut } from '../lib/supabase-auth'
import { getTranslation } from '../lib/translations'
import { Locale } from '../lib/i18n'

interface UserData {
  id: string
  email: string
  name?: string
  free_reports_used: number
  paid_reports_used: number
  subscription_type?: string
  subscription_end?: string
  monthly_report_limit: number
  // 新增积分相关字段
  credits?: number
  monthly_credits?: number
  daily_growth?: number
  // 新增白名单相关字段
  whitelistStatus?: {
    canGenerate: boolean;
    reason?: string;
    remainingReports?: number;
  };
}

interface UserInfoProps {
  user: UserData | null
  onLogout: () => void
  onRefresh: () => void
  onLogin: () => void
  onOpenSubscription: () => void
  locale: Locale
  isCompact?: boolean
}

export default function UserInfo({ user, onLogout, onRefresh, onLogin, onOpenSubscription, locale, isCompact = false }: UserInfoProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut()
      toast.success('Logged out successfully')
      onLogout()
    } catch (error) {
      toast.error('Logout failed')
    } finally {
      setIsLoading(false)
    }
  }

  const getSubscriptionStatus = () => {
    if (!user) return { status: getTranslation(locale, 'not_logged_in'), color: 'text-gray-500' }
    
    // 🔥 新增：检查白名单状态
    if (user.whitelistStatus?.canGenerate && user.whitelistStatus.reason === '白名单用户') {
      return { 
        status: `${getTranslation(locale, 'whitelist_user')} (剩余${user.whitelistStatus.remainingReports}次)`, 
        color: 'text-amber-500' 
      }
    }
    
    if (user.free_reports_used === 0) {
      return { status: getTranslation(locale, 'free_trial'), color: 'text-green-600' }
    }

    if (user.subscription_type && user.subscription_end) {
      const endDate = new Date(user.subscription_end)
      if (endDate > new Date()) {
        return { status: getTranslation(locale, 'subscription_active'), color: 'text-blue-600' }
      }
    }

    return { status: getTranslation(locale, 'subscription_required'), color: 'text-red-600' }
  }

  const getRemainingReports = () => {
    if (!user) return 0
    
    if (user.free_reports_used === 0) return 1
    
    if (user.subscription_type && user.subscription_end) {
      const endDate = new Date(user.subscription_end)
      if (endDate > new Date()) {
        return user.monthly_report_limit - user.paid_reports_used
      }
    }
    
    return 0
  }

  const getCurrentCredits = () => {
    if (!user) return 0
    
    // 如果是白名单用户，返回白名单积分
    if (user.whitelistStatus?.canGenerate && user.whitelistStatus.reason === '白名单用户') {
      return user.whitelistStatus.remainingReports || 0
    }
    
    // 如果是免费用户且未使用过免费报告
    if (user.free_reports_used === 0) {
      return 20 // 20个欢迎积分
    }
    
    // 如果有订阅，计算当前积分
    if (user.subscription_type && user.subscription_end) {
      const endDate = new Date(user.subscription_end)
      if (endDate > new Date()) {
        // 基础月积分
        let totalCredits = user.monthly_credits || 0
        
        // 计算每日增长积分（从月初到现在）
        if (user.daily_growth && user.daily_growth > 0) {
          const now = new Date()
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const daysSinceStart = Math.floor((now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24))
          const growthCredits = daysSinceStart * user.daily_growth
          totalCredits += growthCredits
        }
        
        // 减去已使用的积分
        totalCredits -= (user.free_reports_used + user.paid_reports_used)
        
        return Math.max(0, totalCredits)
      }
    }
    
    return 0
  }

  const subscriptionStatus = getSubscriptionStatus()
  const remainingReports = getRemainingReports()

  const getSubscriptionTypeDisplayName = (subscriptionType: string) => {
    switch (subscriptionType) {
      case 'single_report':
        return '单篇报告'
      case 'monthly_30':
        return '月度订阅 (30篇)'
      case 'monthly_70':
        return '高级订阅 (70篇)'
      case 'premium_300':
        return '专业版 (300篇)'
      default:
        return subscriptionType
    }
  }

  // 紧凑模式渲染
  if (isCompact) {
    return (
      <div className="flex items-center space-x-3">
        {user ? (
          <>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-1.5 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 truncate max-w-32">
                  {user.name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className={`text-xs ${subscriptionStatus.color}`}>
                  {getCurrentCredits()} credits
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenSubscription}
                className="px-3 py-2 text-sm font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md hover:bg-amber-500/30 transition-colors font-inter"
              >
                {getTranslation(locale, 'subscription_plan')}
              </button>
              
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={getTranslation(locale, 'logout')}
              >
                <LogOut size={14} />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            <LogIn size={14} />
            <span>{getTranslation(locale, 'loginTitle')}</span>
          </button>
        )}
      </div>
    )
  }

  // 完整模式渲染
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user?.name || user?.email || getTranslation(locale, 'not_logged_in')}
            </h3>
            <p className={`text-sm font-medium ${subscriptionStatus.color}`}>
              {subscriptionStatus.status}
            </p>
          </div>
        </div>
        
        {user ? (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span>{getTranslation(locale, 'logout')}</span>
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            <LogIn size={16} />
            <span>{getTranslation(locale, 'loginTitle')}</span>
          </button>
        )}
      </div>

      {user ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Available Credits</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {getCurrentCredits()}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Credits Used</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {user.free_reports_used + user.paid_reports_used}
              </p>
            </div>
          </div>

          {user.subscription_type && user.subscription_end && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Subscription Info</h4>
              <div className="text-sm text-blue-800">
                <p>Plan: {getSubscriptionTypeDisplayName(user.subscription_type)}</p>
                <p>Expires: {new Date(user.subscription_end).toLocaleDateString()}</p>
                <p>Monthly Credits: {user.monthly_credits || 0}</p>
                <p>Daily Growth: +{user.daily_growth || 0} credits/day</p>
                <p>Credits Used: {user.paid_reports_used}</p>
              </div>
            </div>
          )}

          {/* 订阅计划按钮 - 始终显示 */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">{getTranslation(locale, 'subscription_plan')}</h4>
            <p className="text-sm text-blue-800 mb-3">
              {getCurrentCredits() > 0 
                ? `You have ${getCurrentCredits()} credits available. Upgrade for more credits and daily growth.`
                : `No credits available. Choose a subscription plan to get started.`
              }
            </p>
            <button
              onClick={onOpenSubscription}
              className={`px-4 py-2 rounded-md text-sm ${
                getCurrentCredits() > 0 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              View Subscription Plans
            </button>
          </div>


        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">{getTranslation(locale, 'start_using')}</h4>
          <p className="text-sm text-gray-600 mb-3">
            {getTranslation(locale, 'after_login_you_will_get_1_free_report_or_choose_subscription_plan')}
          </p>
          <button
            onClick={onLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            {getTranslation(locale, 'login_now')}
          </button>
        </div>
      )}
    </div>
  )
} 