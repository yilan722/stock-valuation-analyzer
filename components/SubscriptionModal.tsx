'use client'

import React, { useState } from 'react'
import { X, Check, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  locale: string
}

const SUBSCRIPTION_PLANS = {
  monthly_99: {
    name: '月度订阅 (99元)',
    price: 99,
    reports: 30,
    features: ['30篇报告/月', '专业估值分析', '实时数据更新', '优先客服支持']
  },
  monthly_199: {
    name: '月度订阅 (199元)',
    price: 199,
    reports: 65,
    features: ['65篇报告/月', '专业估值分析', '实时数据更新', '优先客服支持', '高级分析功能']
  },
  pay_per_report: {
    name: '单篇报告 (5元)',
    price: 5,
    reports: 1,
    features: ['1篇报告', '专业估值分析', '实时数据更新']
  }
}

export default function SubscriptionModal({ isOpen, onClose, onSuccess, locale }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof SUBSCRIPTION_PLANS | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    if (!selectedPlan) {
      toast.error('请选择订阅计划')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: selectedPlan })
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to Alipay
        window.location.href = data.paymentUrl
      } else {
        toast.error(data.error || '创建支付失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            选择订阅计划
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlan(key as keyof typeof SUBSCRIPTION_PLANS)}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-blue-600">
                  ¥{plan.price}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {plan.reports}篇报告
                </p>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {selectedPlan === key && (
                <div className="mt-4 text-center">
                  <Check className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <span className="text-sm text-blue-600 font-medium">已选择</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">支付方式</h4>
              <p className="text-sm text-gray-600">使用支付宝安全支付</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>

          {selectedPlan && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">总计:</span>
                <span className="text-xl font-bold text-gray-900">
                  ¥{SUBSCRIPTION_PLANS[selectedPlan].price}
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handlePayment}
              disabled={!selectedPlan || isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '处理中...' : '立即支付'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>点击支付后将跳转到支付宝完成付款</p>
          <p>付款成功后即可使用所有功能</p>
        </div>
      </div>
    </div>
  )
} 