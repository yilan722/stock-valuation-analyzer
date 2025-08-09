'use client'

import React, { useState } from 'react'
import { X, Check, CreditCard, Zap, Crown, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import UserAgreementModal from './UserAgreementModal'
import { getTranslation } from '../lib/translations'
import { Locale } from '../lib/i18n'

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
  locale: Locale
}

export default function SubscriptionModal({ isOpen, onClose, userId, locale }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAgreement, setShowAgreement] = useState(false)
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null)

  const plans: SubscriptionPlan[] = [
    {
      id: 'single_report',
      name: getTranslation(locale, 'singleReport'),
      price: 5,
      reports: 1,
      features: [
        `1${getTranslation(locale, 'professionalStockAnalysis')}`,
        getTranslation(locale, 'realTimeMarketData'),
        getTranslation(locale, 'aiDrivenAnalysis')
      ],
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      id: 'monthly_30',
      name: getTranslation(locale, 'monthlySubscription'),
      price: 99,
      reports: 30,
      features: [
        `30${getTranslation(locale, 'professionalStockAnalysis')}`,
        getTranslation(locale, 'realTimeMarketData'),
        getTranslation(locale, 'aiDrivenAnalysis'),
        getTranslation(locale, 'prioritySupport')
      ],
      popular: true,
      icon: <Zap className="h-6 w-6" />
    },
    {
      id: 'monthly_70',
      name: getTranslation(locale, 'advancedSubscription'),
      price: 199,
      reports: 70,
      features: [
        `70${getTranslation(locale, 'professionalStockAnalysis')}`,
        getTranslation(locale, 'realTimeMarketData'),
        getTranslation(locale, 'aiDrivenAnalysis'),
        getTranslation(locale, 'prioritySupport'),
        getTranslation(locale, 'deepIndustryAnalysis')
      ],
      bestValue: true,
      icon: <Star className="h-6 w-6" />
    },
    {
      id: 'premium_300',
      name: getTranslation(locale, 'premiumVersion'),
      price: 998,
      reports: 300,
      features: [
        `300${getTranslation(locale, 'professionalStockAnalysis')}`,
        getTranslation(locale, 'realTimeMarketData'),
        getTranslation(locale, 'aiDrivenAnalysis'),
        getTranslation(locale, 'prioritySupport'),
        getTranslation(locale, 'deepIndustryAnalysis'),
        getTranslation(locale, 'dailyKLineAnalysis'),
        getTranslation(locale, 'vipExclusiveService')
      ],
      icon: <Crown className="h-6 w-6" />
    }
  ]

  const handleSubscribe = async (planId: string) => {
    if (!userId) {
      toast.error(getTranslation(locale, 'pleaseLoginFirstToast'))
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
        toast.error(getTranslation(locale, 'invalidPlan'))
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
        })
      })

      if (!response.ok) {
        throw new Error('Payment creation failed')
      }

      const data = await response.json()
      
      if (data.success && data.paymentUrl) {
        // 跳转到支付宝支付页面
        window.location.href = data.paymentUrl
      } else {
        toast.error(getTranslation(locale, 'paymentCreationFailed'))
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(getTranslation(locale, 'paymentCreationFailed'))
    } finally {
      setIsLoading(false)
      setShowAgreement(false)
      setPendingPlanId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {getTranslation(locale, 'subscriptionPlans')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
                  plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                } ${plan.bestValue ? 'border-purple-500 shadow-lg' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {getTranslation(locale, 'popular')}
                    </span>
                  </div>
                )}

                {/* Best Value Badge */}
                {plan.bestValue && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {getTranslation(locale, 'bestValue')}
                    </span>
                  </div>
                )}

                {/* Plan Icon */}
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    {plan.icon}
                  </div>
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-center mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-blue-600">¥{plan.price}</span>
                  {plan.id !== 'single_report' && (
                    <span className="text-gray-500 ml-1">/月</span>
                  )}
                </div>

                {/* Reports Count */}
                <div className="text-center mb-6">
                  <span className="text-lg font-semibold text-gray-700">
                    {plan.reports} {getTranslation(locale, 'professionalStockAnalysis')}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : plan.bestValue
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? getTranslation(locale, 'loading') : getTranslation(locale, 'subscribe')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User Agreement Modal */}
        <UserAgreementModal
          isOpen={showAgreement}
          onClose={() => setShowAgreement(false)}
          onConfirm={handleAgreementConfirm}
          locale={locale}
        />
      </div>
    </div>
  )
} 