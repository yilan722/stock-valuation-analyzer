'use client'

import React from 'react'
import { XCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SubscriptionCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Cancel Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Subscription Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your subscription setup was cancelled. No charges were made.
        </p>

        {/* What Happened */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-gray-700 mb-2">What happened?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• No subscription was created</li>
            <li>• No payment was processed</li>
            <li>• Your account remains unchanged</li>
          </ul>
        </div>

        {/* Try Again Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-blue-900 mb-2">Want to try again?</h3>
          <p className="text-sm text-blue-800">
            You can restart the subscription process anytime. Our plans offer great value for stock analysis.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          
          <Link
            href="/en"
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-500">
          <p>Need help with your subscription? Contact our support team.</p>
          <p className="mt-1">You can also manage existing subscriptions in your account.</p>
        </div>
      </div>
    </div>
  )
} 