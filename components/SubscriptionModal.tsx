'use client'

import React, { useState } from 'react'
import { X, Check, CreditCard, Zap, Crown, Star, TrendingUp, Shield, Headphones, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import UserAgreementModal from './UserAgreementModal'
import { getTranslation } from '../lib/translations'
import { Locale } from '../lib/i18n'

interface SubscriptionPlan {
  id: string
  name: string
  monthlyFee: number
  welcomeCredits: number
  monthlyCredits: number
  dailyGrowth: number
  totalMonthlyCredits: number
  costPerReport: number
  onDemandLimit: string
  features: string[]
  popular?: boolean
  bestValue?: boolean
  icon: React.ReactNode
  buttonText: string
  buttonAction: string
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
      id: 'basic',
      name: getTranslation(locale, 'basicPlan'),
      monthlyFee: 0,
      welcomeCredits: 20,
      monthlyCredits: 0,
      dailyGrowth: 1,
      totalMonthlyCredits: 0,
      costPerReport: 2.59,
      onDemandLimit: getTranslation(locale, 'dailyLimit2'),
      features: [
        getTranslation(locale, 'aiDrivenDeepAnalysis'),
        getTranslation(locale, 'realTimeMarketData')
      ],
      icon: <CreditCard className="h-6 w-6" />,
      buttonText: getTranslation(locale, 'freeStart'),
      buttonAction: 'free'
    },
    {
      id: 'standard',
      name: getTranslation(locale, 'standardPlan'),
      monthlyFee: 29,
      welcomeCredits: 0,
      monthlyCredits: 280,
      dailyGrowth: 2,
      totalMonthlyCredits: 340,
      costPerReport: 1.70,
      onDemandLimit: getTranslation(locale, 'unlimited'),
      features: [
        getTranslation(locale, 'aiDrivenDeepAnalysis'),
        getTranslation(locale, 'realTimeMarketData'),
        getTranslation(locale, 'priorityCustomerSupport')
      ],
      popular: true,
      icon: <Zap className="h-6 w-6" />,
      buttonText: getTranslation(locale, 'upgradeSave34'),
      buttonAction: 'subscribe'
    },
    {
      id: 'pro',
      name: getTranslation(locale, 'proPlan'),
      monthlyFee: 59,
      welcomeCredits: 0,
      monthlyCredits: 620,
      dailyGrowth: 4,
      totalMonthlyCredits: 740,
      costPerReport: 1.59,
      onDemandLimit: getTranslation(locale, 'unlimited'),
      features: [
        getTranslation(locale, 'aiDrivenDeepAnalysis'),
        getTranslation(locale, 'realTimeMarketData'),
        getTranslation(locale, 'priorityCustomerSupport')
      ],
      bestValue: true,
      icon: <Star className="h-6 w-6" />,
      buttonText: getTranslation(locale, 'upgradeToPro'),
      buttonAction: 'subscribe'
    },
    {
      id: 'flagship',
      name: getTranslation(locale, 'flagshipPlan'),
      monthlyFee: 129,
      welcomeCredits: 0,
      monthlyCredits: 1840,
      dailyGrowth: 6,
      totalMonthlyCredits: 2020,
      costPerReport: 1.28,
      onDemandLimit: getTranslation(locale, 'unlimited'),
      features: [
        getTranslation(locale, 'aiDrivenDeepAnalysis'),
        getTranslation(locale, 'realTimeMarketData'),
        getTranslation(locale, 'priorityCustomerSupport'),
        getTranslation(locale, 'technicalAnalysisVipConsulting')
      ],
      icon: <Crown className="h-6 w-6" />,
      buttonText: getTranslation(locale, 'contactUsUpgrade'),
      buttonAction: 'contact'
    }
  ]

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) {
      toast.error(getTranslation(locale, 'invalidPlan'))
      return
    }

    // Handle different button actions
    switch (plan.buttonAction) {
      case 'free':
        // For free plan, just show success message
        toast.success(getTranslation(locale, 'freeStart'))
        onClose()
        return
      case 'contact':
        // For flagship plan, show contact message
        toast('Please contact us for upgrade details')
        onClose()
        return
      case 'subscribe':
        // For paid plans, check login and show agreement
        if (!userId) {
          toast.error(getTranslation(locale, 'pleaseLoginFirstToast'))
          return
        }
        setPendingPlanId(planId)
        setShowAgreement(true)
        return
      default:
        toast.error(getTranslation(locale, 'invalidPlan'))
        return
    }
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
          amount: plan.monthlyFee,
          type: pendingPlanId === 'single_report' ? 'single_report' : 'subscription',
          subscriptionType: pendingPlanId,
          reportLimit: plan.totalMonthlyCredits
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            {getTranslation(locale, 'subscriptionPlans')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white border-2 rounded-lg p-3 sm:p-6 transition-all duration-200 hover:shadow-lg ${
                  plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                } ${plan.bestValue ? 'border-amber-500 shadow-lg' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                      {getTranslation(locale, 'popular')}
                    </span>
                  </div>
                )}

                {/* Best Value Badge */}
                {plan.bestValue && (
                  <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                      {getTranslation(locale, 'bestValue')}
                    </span>
                  </div>
                )}

                {/* Plan Icon */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                    {React.cloneElement(plan.icon as React.ReactElement, { 
                      className: 'h-4 w-4 sm:h-6 sm:w-6' 
                    })}
                  </div>
                </div>

                {/* Plan Name */}
                <h3 className="text-lg sm:text-xl font-bold text-center mb-2">{plan.name}</h3>

                {/* Monthly Fee */}
                <div className="text-center mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {plan.monthlyFee === 0 ? getTranslation(locale, 'free') : `${locale === 'en' ? '$' : '¥'}${plan.monthlyFee}`}
                  </span>
                  {plan.monthlyFee > 0 && (
                    <span className="text-gray-500 ml-1 text-sm">/month</span>
                  )}
                </div>

                {/* Credits and Reports Info */}
                <div className="text-center mb-4 sm:mb-6 space-y-2">
                  <div className="text-base sm:text-lg font-semibold text-gray-700">
                    {plan.welcomeCredits > 0 && (
                      <div className="mb-2">
                        <span className="text-amber-600 font-bold">{plan.welcomeCredits}</span> <span className="text-sm sm:text-base">{getTranslation(locale, 'welcomeCredits')}</span>
                      </div>
                    )}
                    {plan.monthlyCredits > 0 && (
                      <div className="mb-2">
                        <span className="text-blue-600 font-bold">{plan.monthlyCredits}</span> <span className="text-sm sm:text-base">{getTranslation(locale, 'welcomeCredits')}</span>
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-gray-600">
                      {getTranslation(locale, 'costPerReport')}: {locale === 'en' ? '$' : '¥'}{plan.costPerReport}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {getTranslation(locale, 'onDemandLimit')}: {plan.onDemandLimit}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : plan.bestValue
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? getTranslation(locale, 'loading') : plan.buttonText}
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