'use client'

import React, { useState } from 'react'
import { X, Check, CreditCard, Zap, Crown, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import UserAgreementModal from './UserAgreementModal'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  reports: number
  features: string[]
  popular?: boolean
  bestValue?: boolean
  icon: React.ReactNode
}

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  locale: string
}

export default function SubscriptionModal({ isOpen, onClose, userId, locale }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAgreement, setShowAgreement] = useState(false)
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null)

  const plans: SubscriptionPlan[] = [
    {
      id: 'single_report',
      name: '单篇报告',
      price: 5,
      reports: 1,
      features: ['1篇专业股票分析报告', '实时市场数据', 'AI驱动分析'],
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      id: 'monthly_30',
      name: '月度订阅',
      price: 99,
      reports: 30,
      features: ['30篇专业股票分析报告', '实时市场数据', 'AI驱动分析', '优先客服支持'],
      popular: true,
      icon: <Zap className="h-6 w-6" />
    },
    {
      id: 'monthly_70',
      name: '高级订阅',
      price: 199,
      reports: 70,
      features: ['70篇专业股票分析报告', '实时市场数据', 'AI驱动分析', '优先客服支持', '深度行业分析'],
      bestValue: true,
      icon: <Star className="h-6 w-6" />
    },
    {
      id: 'premium_300',
      name: '专业版',
      price: 998,
      reports: 300,
      features: ['300篇专业股票分析报告', '实时市场数据', 'AI驱动分析', '优先客服支持', '深度行业分析', '每日K线技术分析', 'VIP专属服务'],
      icon: <Crown className="h-6 w-6" />
    }
  ]

  const handleSubscribe = async (planId: string) => {
    if (!userId) {
      toast.error('请先登录')
      return
    }

    // 显示用户协议
    setPendingPlanId(planId)
    setShowAgreement(true)
  }

  const handleAgreementConfirm = async () => {
    if (!pendingPlanId) return

    setIsLoading(true)
    try {
      const plan = plans.find(p => p.id === pendingPlanId)
      if (!plan) {
        toast.error('无效的订阅计划')
        return
      }

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: plan.price,
          type: pendingPlanId === 'single_report' ? 'single_report' : 'subscription',
          subscriptionType: pendingPlanId,
          reportLimit: plan.reports
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '创建支付订单失败')
      }

      const { paymentUrl } = await response.json()
      
      // 跳转到支付宝支付页面
      window.open(paymentUrl, '_blank')
      
      toast.success('正在跳转到支付宝支付...')
      onClose()
    } catch (error) {
      console.error('订阅失败:', error)
      toast.error('订阅失败，请稍后重试')
    } finally {
      setIsLoading(false)
      setShowAgreement(false)
      setPendingPlanId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">选择订阅计划</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            选择最适合您的订阅计划，享受专业的股票分析服务
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.popular ? 'ring-2 ring-yellow-400' : ''} ${plan.bestValue ? 'ring-2 ring-green-400' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      最受欢迎
                    </span>
                  </div>
                )}
                {plan.bestValue && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      超值推荐
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    {plan.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  {plan.name}
                </h3>

                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-gray-900">¥{plan.price}</span>
                  {plan.id !== 'single_report' && (
                    <span className="text-gray-500 text-sm">/月</span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === plan.id ? '已选择' : '选择此计划'}
                </button>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    确认订阅
                  </h3>
                  <p className="text-gray-600 mt-1">
                    您选择的计划将通过支付宝安全支付
                  </p>
                </div>
                <button
                  onClick={() => handleSubscribe(selectedPlan)}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>处理中...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>立即支付</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 用户协议模态框 */}
      <UserAgreementModal
        isOpen={showAgreement}
        onClose={() => {
          setShowAgreement(false)
          setPendingPlanId(null)
        }}
        onConfirm={handleAgreementConfirm}
        locale={locale}
      />
    </div>
  )
} 