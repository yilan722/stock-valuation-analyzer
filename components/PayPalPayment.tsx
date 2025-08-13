'use client'

import React, { useEffect, useState } from 'react'
import { Loader2, Lock, CheckCircle } from 'lucide-react'

interface PayPalPaymentProps {
  amount: number
  planName: string
  planId: string
  userId: string
  locale: string
  onSuccess: (paymentData: any) => void
  onError: (error: string) => void
  onCancel: () => void
}

declare global {
  interface Window {
    paypal: any
  }
}

export default function PayPalPayment({ 
  amount, 
  planName, 
  planId, 
  userId, 
  locale, 
  onSuccess, 
  onError, 
  onCancel 
}: PayPalPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const isFreePlan = amount === 0

  useEffect(() => {
    // For free plans, don't load PayPal SDK
    if (isFreePlan) {
      setPaypalLoaded(true)
      return
    }

    // Only log in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Loading PayPal SDK...')
      console.log('🔧 NODE_ENV:', process.env.NODE_ENV)
    }

    // Load PayPal SDK with subscriptions support (sandbox for development)
    const script = document.createElement('script')
    const isDevelopment = process.env.NODE_ENV === 'development'
            const paypalUrl = isDevelopment 
          ? `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD&components=buttons&vault=true&intent=subscription`
          : `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD&components=buttons&vault=true&intent=subscription`
    
    // Only log in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 PayPal SDK URL:', paypalUrl)
    }
    script.src = paypalUrl
    script.async = true
    script.onload = () => {
      console.log('✅ PayPal SDK loaded successfully')
      setPaypalLoaded(true)
    }
    script.onerror = (error) => {
      console.error('❌ PayPal SDK load error:', error)
      onError('Failed to load PayPal SDK')
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [onError, isFreePlan])

  useEffect(() => {
    if (!paypalLoaded || !window.paypal || isFreePlan) return

    // Render PayPal subscription buttons
    window.paypal.Buttons({
      createSubscription: async () => {
        try {
          // Only log in development environment
          if (process.env.NODE_ENV === 'development') {
            console.log('🔐 Creating subscription for plan:', { planId, planName, amount, userId })
          }
          
          // 确保用户已认证
          if (!userId) {
            throw new Error('User ID is required')
          }

          const response = await fetch('/api/payment/paypal/create-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // 确保包含认证Cookie
            body: JSON.stringify({
              requestPlanId: planId,
              planName,
              amount,
              userId,
              currency: 'USD'
            })
          })

          // Only log in development environment
          if (process.env.NODE_ENV === 'development') {
            console.log('📡 API Response status:', response.status)
          }
          
          if (!response.ok) {
            const errorData = await response.json()
            console.error('❌ API Error:', errorData)
            
            if (response.status === 401) {
              throw new Error('Authentication required. Please log in again.')
            } else if (response.status === 400) {
              throw new Error(errorData.details || errorData.error || 'Invalid request')
            } else {
              throw new Error(errorData.error || `Server error: ${response.status}`)
            }
          }

          const data = await response.json()
          // Only log in development environment
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Subscription created successfully:', data)
          }
          return data.subscriptionID
        } catch (error) {
          console.error('❌ Create subscription error:', error)
          onError(error instanceof Error ? error.message : 'Failed to create subscription')
          throw error
        }
      },
      onApprove: async (data: any) => {
        try {
          setIsLoading(true)
          
          // The subscription is automatically activated when approved
          // We can update our database here if needed
          console.log('Subscription approved:', data.subscriptionID)
          
          onSuccess({
            subscriptionID: data.subscriptionID,
            planId,
            amount,
            status: 'ACTIVE'
          })
        } catch (error) {
          console.error('Subscription approval error:', error)
          onError('Subscription approval failed')
        } finally {
          setIsLoading(false)
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err)
        onError('Payment failed. Please try again.')
      }
    }).render('#paypal-button-container')

  }, [paypalLoaded, amount, planName, planId, userId, onSuccess, onError, isFreePlan])

  const handleFreePlanActivation = async () => {
    try {
      setIsLoading(true)
      
      // For free plans, directly activate without payment
      const response = await fetch('/api/payment/paypal/activate-free-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 确保包含认证Cookie
        body: JSON.stringify({
          requestPlanId: planId,
          planName,
          userId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to activate free plan')
      }

      onSuccess({
        planId,
        amount: 0,
        status: 'ACTIVE',
        isFreePlan: true
      })
    } catch (error) {
      console.error('Free plan activation error:', error)
      onError('Failed to activate free plan')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          {isFreePlan ? 'Activating plan...' : 'Processing payment...'}
        </span>
      </div>
    )
  }

  if (isFreePlan) {
    return (
      <div className="space-y-6">
        {/* Free Plan Display */}
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-900 mb-2">
            Free Plan
          </div>
          <div className="text-sm text-green-700 mb-4">
            {planName} - No payment required
          </div>
          <div className="bg-green-100 rounded-lg p-3 text-sm text-green-800">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">20 Welcome Credits</span>
            </div>
            <div className="text-xs">
              Start analyzing stocks immediately
            </div>
          </div>
        </div>

        {/* Activate Button */}
        <button
          onClick={handleFreePlanActivation}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Activate Free Plan
        </button>

        {/* Cancel Button */}
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (!paypalLoaded) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">Failed to load payment system</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Amount Display */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-gray-900">
          ${amount.toFixed(2)}
        </div>
        <div className="text-sm text-gray-600">
          {planName} - Monthly Subscription
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Recurring monthly payment
        </div>
      </div>

      {/* PayPal Subscription Buttons */}
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Subscribe with PayPal
          </div>
          <div id="paypal-button-container"></div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500 flex items-center justify-center">
        <Lock className="h-3 w-3 mr-1" />
        Your payment information is secure and encrypted
      </div>

      {/* Cancel Button */}
      <div className="text-center">
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
} 