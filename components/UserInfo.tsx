'use client'

import React, { useState } from 'react'
import { User, LogOut, CreditCard, BarChart3, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { signOut } from '../lib/supabase-auth'

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
  locale: string
}

export default function UserInfo({ user, onLogout, onRefresh, onLogin, onOpenSubscription, locale }: UserInfoProps) {
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
    if (!user) return { status: '未登录', color: 'text-gray-500' }
    
    // 🔥 新增：检查白名单状态
    if (user.whitelistStatus?.canGenerate && user.whitelistStatus.reason === '白名单用户') {
      return { 
        status: `白名单用户 (剩余${user.whitelistStatus.remainingReports}次)`, 
        color: 'text-purple-600' 
      }
    }
    
    if (user.free_reports_used === 0) {
      return { status: '免费试用', color: 'text-green-600' }
    }

    if (user.subscription_type && user.subscription_end) {
      const endDate = new Date(user.subscription_end)
      if (endDate > new Date()) {
        return { status: '订阅中', color: 'text-blue-600' }
      }
    }

    return { status: '需要订阅', color: 'text-red-600' }
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user?.name || user?.email || '未登录'}
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
            <span>退出</span>
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            <LogIn size={16} />
            <span>登录</span>
          </button>
        )}
      </div>

      {user ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">剩余报告</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {remainingReports}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">已使用</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {user.free_reports_used + user.paid_reports_used}
              </p>
            </div>
          </div>

          {user.subscription_type && user.subscription_end && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">订阅信息</h4>
              <div className="text-sm text-blue-800">
                <p>类型: {user.subscription_type === 'monthly_99' ? '月度订阅 (99元)' : '月度订阅 (199元)'}</p>
                <p>到期: {new Date(user.subscription_end).toLocaleDateString()}</p>
                <p>本月已用: {user.paid_reports_used}/{user.monthly_report_limit}</p>
              </div>
            </div>
          )}

          {/* 订阅计划按钮 - 始终显示 */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">订阅计划</h4>
            <p className="text-sm text-blue-800 mb-3">
              {remainingReports > 0 
                ? `您还有 ${remainingReports} 篇报告可用，也可以选择订阅获得更多报告。`
                : '您的免费报告已用完，请选择订阅计划继续使用。'
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
              查看订阅计划
            </button>
          </div>

          {remainingReports === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">需要订阅</h4>
              <p className="text-sm text-yellow-800 mb-3">
                您的免费报告已用完，请选择订阅计划继续使用。
              </p>
              <button
                onClick={onOpenSubscription}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm"
              >
                查看订阅计划
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">开始使用</h4>
          <p className="text-sm text-gray-600 mb-3">
            登录后即可获得1篇免费报告，或选择订阅计划获得更多报告。
          </p>
          <button
            onClick={onLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            立即登录
          </button>
        </div>
      )}
    </div>
  )
} 