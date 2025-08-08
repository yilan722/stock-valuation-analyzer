'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check payment status
    const checkPaymentStatus = async () => {
      try {
        // You can add payment verification logic here
        toast.success('支付成功！您的订阅已激活')
      } catch (error) {
        console.error('Payment verification error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkPaymentStatus()
  }, [])

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            支付成功！
          </h1>
          <p className="text-gray-600 mb-6">
            您的订阅已激活，现在可以生成更多报告了。
          </p>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : (
            <button
              onClick={handleBackToHome}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回首页</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 