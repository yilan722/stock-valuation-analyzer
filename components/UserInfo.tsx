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
      toast.success('已退出登录')
      onLogout()
    } catch (error) {
      toast.error('退出登录失败')
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
        color: 'text-purple-600' 
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
                  {remainingReports > 0 ? `${remainingReports} reports` : '0 reports'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenSubscription}
                className="px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
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
                <span className="text-sm font-medium text-gray-600">{getTranslation(locale, 'remaining_reports')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {remainingReports}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">{getTranslation(locale, 'reports_used')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {user.free_reports_used + user.paid_reports_used}
              </p>
            </div>
          </div>

          {user.subscription_type && user.subscription_end && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">{getTranslation(locale, 'subscription_info')}</h4>
              <div className="text-sm text-blue-800">
                <p>{getTranslation(locale, 'subscription_type')}: {getSubscriptionTypeDisplayName(user.subscription_type)}</p>
                <p>{getTranslation(locale, 'subscription_end')}: {new Date(user.subscription_end).toLocaleDateString()}</p>
                <p>{getTranslation(locale, 'reports_used_this_month')}: {user.paid_reports_used}/{user.monthly_report_limit}</p>
              </div>
            </div>
          )}

          {/* 订阅计划按钮 - 始终显示 */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">{getTranslation(locale, 'subscription_plan')}</h4>
            <p className="text-sm text-blue-800 mb-3">
              {remainingReports > 0 
                ? `${getTranslation(locale, 'remaining_reports_available')} ${remainingReports} ${getTranslation(locale, 'or_choose_subscription')}`
                : `${getTranslation(locale, 'free_reports_used_up')}. ${getTranslation(locale, 'please_choose_subscription_plan')}`
              }
            </p>
            <button
              onClick={onOpenSubscription}
              className={`px-4 py-2 rounded-md text-sm ${
                remainingReports > 0 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              {getTranslation(locale, 'view_subscription_plan')}
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