'use client'

import React, { useState } from 'react'
import { X, Check, CreditCard, Zap, Crown, Star, TrendingUp, Shield, Headphones, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import UserAgreementModal from './UserAgreementModal'
import PayPalPayment from './PayPalPayment'
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
  const [showPayPalPayment, setShowPayPalPayment] = useState(false)
  const [paymentPlan, setPaymentPlan] = useState<SubscriptionPlan | null>(null)

  const plans: SubscriptionPlan[] = [
    {
      id: 'free-trial',
      name: getTranslation(locale, 'basicPlan'),
      monthlyFee: 0,
      welcomeCredits: 1,
      monthlyCredits: 0,
      dailyGrowth: 0,
      totalMonthlyCredits: 1,
      costPerReport: 0,
      onDemandLimit: '1 report',
      features: [
        getTranslation(locale, 'aiDrivenDeepAnalysis'),
        getTranslation(locale, 'realTimeMarketData')
      ],
      icon: <CreditCard className="h-6 w-6" />,
      buttonText: getTranslation(locale, 'freeStart'),
      buttonAction: 'free'
    },
    {
      id: 'basic',
      name: getTranslation(locale, 'standardPlan'),
      monthlyFee: 49,
      welcomeCredits: 0,
      monthlyCredits: 8,
      dailyGrowth: 0,
      totalMonthlyCredits: 8,
      costPerReport: 6.13,
      onDemandLimit: '8 reports/month',
      features: [
        getTranslation(locale, 'aiDrivenDeepAnalysis'),
        getTranslation(locale, 'realTimeMarketData')
      ],
      icon: <Zap className="h-6 w-6" />,
      buttonText: getTranslation(locale, 'subscribeNow'),
      buttonAction: 'subscribe'
    },
    {
      id: 'professional',
      name: getTranslation(locale, 'proPlan'),
      monthlyFee: 299,
      welcomeCredits: 0,
      monthlyCredits: 60,
      dailyGrowth: 0,
      totalMonthlyCredits: 60,
      costPerReport: 4.98,
      onDemandLimit: '60 reports/month',
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
      id: 'business',
      name: getTranslation(locale, 'flagshipPlan'),
      monthlyFee: 599,
      welcomeCredits: 0,
      monthlyCredits: 140,
      dailyGrowth: 0,
      totalMonthlyCredits: 140,
      costPerReport: 4.28,
      onDemandLimit: '140 reports/month',
      features: [
        getTranslation(locale, 'aiDrivenDeepAnalysis'),
        getTranslation(locale, 'realTimeMarketData'),
        getTranslation(locale, 'priorityCustomerSupport'),
        'API Access / Dedicated Account Manager'
      ],
      icon: <Crown className="h-6 w-6" />,
      buttonText: getTranslation(locale, 'upgradeToBusiness'),
      buttonAction: 'subscribe'
    },
    {
      id: 'enterprise',
      name: getTranslation(locale, 'enterprisePlan'),
      monthlyFee: 0,
      welcomeCredits: 0,
      monthlyCredits: 0,
      dailyGrowth: 0,
      totalMonthlyCredits: 0,
      costPerReport: 0,
      onDemandLimit: 'Custom',
      features: [
        getTranslation(locale, 'aiDrivenDeepAnalysis'),
        getTranslation(locale, 'realTimeMarketData'),
        getTranslation(locale, 'priorityCustomerSupport'),
        'API Access / Dedicated Account Manager',
        getTranslation(locale, 'technicalAnalysisVipConsulting')
      ],
      icon: <TrendingUp className="h-6 w-6" />,
      buttonText: getTranslation(locale, 'contactUs'),
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

    const plan = plans.find(p => p.id === pendingPlanId)
    if (!plan) {
      toast.error(getTranslation(locale, 'invalidPlan'))
      return
    }

    // Show PayPal payment interface
    setPaymentPlan(plan)
    setShowPayPalPayment(true)
    setShowAgreement(false)
    setPendingPlanId(null)
  }

  const handlePayPalSuccess = async (paymentData: any) => {
    try {
      setIsLoading(true)
      
      // Update user subscription in database
      const response = await fetch('/api/payment/paypal/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId: paymentData.planId,
          orderID: paymentData.orderID,
          amount: paymentData.amount
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update subscription')
      }

      toast.success('Payment successful! Your subscription has been activated.')
      onClose()
    } catch (error) {
      console.error('Subscription update error:', error)
      toast.error('Payment successful but subscription update failed. Please contact support.')
    } finally {
      setIsLoading(false)
      setShowPayPalPayment(false)
      setPaymentPlan(null)
    }
  }

  const handlePayPalError = (error: string) => {
    toast.error(error)
    setShowPayPalPayment(false)
    setPaymentPlan(null)
  }

  const handlePayPalCancel = () => {
    setShowPayPalPayment(false)
    setPaymentPlan(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-6 border-b">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              {getTranslation(locale, 'subscriptionPlans')}
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-4xl">
              {getTranslation(locale, 'valueDescription')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white border-2 rounded-lg p-3 sm:p-6 transition-all duration-200 hover:shadow-lg flex flex-col ${
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
                    {plan.id === 'enterprise' ? (locale === 'en' ? 'Flexible' : '灵活定价') :
                      plan.monthlyFee === 0 ? getTranslation(locale, 'free') : 
                      locale === 'en' ? `$${plan.monthlyFee}` : 
                      plan.monthlyFee === 49 ? '¥399' :
                      plan.monthlyFee === 299 ? '¥2599' :
                      plan.monthlyFee === 599 ? '¥4699' : `¥${plan.monthlyFee * 8.1}`
                    }
                  </span>
                  {plan.monthlyFee > 0 && (
                    <span className="text-gray-500 ml-1 text-sm">/month</span>
                  )}
                </div>

                {/* Reports and Cost Info */}
                <div className="text-center mb-4 sm:mb-6 space-y-2">
                  <div className="text-base sm:text-lg font-semibold text-gray-700">
                    {plan.monthlyCredits > 0 && (
                      <div className="mb-2">
                        <span className="text-blue-600 font-bold">{plan.monthlyCredits}</span> <span className="text-sm sm:text-base">{getTranslation(locale, 'reportsPerMonth')}</span>
                        {plan.monthlyCredits === 8 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {getTranslation(locale, 'reportsPerDay')}: 0.3 | {getTranslation(locale, 'totalReports')}: 8
                          </div>
                        )}
                        {plan.monthlyCredits === 60 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {getTranslation(locale, 'reportsPerDay')}: 2 | {getTranslation(locale, 'totalReports')}: 60
                          </div>
                        )}
                        {plan.monthlyCredits === 140 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {getTranslation(locale, 'reportsPerDay')}: 4.7 | {getTranslation(locale, 'totalReports')}: 140
                          </div>
                        )}
                      </div>
                    )}
                    {plan.welcomeCredits > 0 && plan.monthlyCredits === 0 && (
                      <div className="mb-2">
                        <span className="text-amber-600 font-bold">{plan.welcomeCredits}</span> <span className="text-sm sm:text-base">{getTranslation(locale, 'reportsPerMonth')}</span>
                      </div>
                    )}
                    {plan.costPerReport > 0 && (
                      <div className="text-xs sm:text-sm text-gray-600">
                        {getTranslation(locale, 'averageCost')}: {locale === 'en' ? '$' : '¥'}{plan.costPerReport.toFixed(2)}{locale === 'zh' ? '/篇' : '/report'}
                      </div>
                    )}
                    {plan.costPerReport > 0 && plan.id !== 'enterprise' && (
                      <div className="text-xs sm:text-sm text-gray-500">
                        {getTranslation(locale, 'additionalPurchase')}: {locale === 'en' ? '$' : '¥'}{(plan.costPerReport + 2).toFixed(2)}{locale === 'zh' ? '/篇' : '/report'}
                      </div>
                    )}
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

                {/* Action Button - Fixed at bottom */}
                <div className="mt-auto pt-4">
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

        {/* PayPal Payment Modal */}
        {showPayPalPayment && paymentPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">
                  Complete Payment
                </h3>
                <button
                  onClick={handlePayPalCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <PayPalPayment
                  amount={paymentPlan.monthlyFee}
                  planName={paymentPlan.name}
                  planId={paymentPlan.id}
                  userId={userId}
                  locale={locale}
                  onSuccess={handlePayPalSuccess}
                  onError={handlePayPalError}
                  onCancel={handlePayPalCancel}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 