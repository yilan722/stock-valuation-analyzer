'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { CheckCircle, ArrowRight, Home, Calendar, CreditCard } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SubscriptionSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscriptionData, setSubscriptionData] = useState<any>(null)

  useEffect(() => {
    const subscriptionID = searchParams.get('subscription_id')
    const planName = searchParams.get('plan_name')
    const amount = searchParams.get('amount')

    if (subscriptionID) {
      setSubscriptionData({
        subscriptionID,
        planName: planName || 'Subscription Plan',
        amount: amount || '0'
      })
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Subscription Activated!
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to SuperAnalyst! Your subscription is now active.
        </p>

        {/* Subscription Details */}
        {subscriptionData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center mb-3">
              <Calendar className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Plan Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{subscriptionData.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${subscriptionData.amount}/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Start generating stock analysis reports</li>
            <li>• Access premium features and data</li>
            <li>• Manage your subscription in your account</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/en"
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Back to Previous Page
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-500">
          <p>You can manage your subscription anytime in your account settings.</p>
          <p className="mt-1">Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  )
} 