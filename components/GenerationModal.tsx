import React from 'react'
import { Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { getTranslation } from '../lib/translations'
import type { Locale } from '../lib/i18n'

interface GenerationModalProps {
  isOpen: boolean
  locale: Locale
}

export default function GenerationModal({ isOpen, locale }: GenerationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {getTranslation(locale, 'generatingReport')}
          </h2>
          <p className="text-sm text-gray-600">
            {getTranslation(locale, 'reportGenerationInProgress')}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0%</span>
            <span>60%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <h4 className="font-medium mb-2">Important:</h4>
              <ul className="space-y-1">
                <li>• Report generation takes 2-5 minutes</li>
                <li>• Please do not close this window</li>
                <li>• You can continue using other browser tabs</li>
                <li>• Report will be saved automatically</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Processing AI analysis...</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This process is powered by the most advanced AI models, which utilize inference path exploration to incorporate the latest research and data, ensuring the most comprehensive and up-to-date responses. This thorough analysis may result in a slightly longer processing time.
          </p>
        </div>
      </div>
    </div>
  )
} 