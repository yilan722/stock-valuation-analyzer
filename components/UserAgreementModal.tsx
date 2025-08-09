import React, { useState } from 'react'
import { X, Check } from 'lucide-react'
import { getTranslation, getTranslationArray } from '../lib/translations'
import { Locale } from '../lib/i18n'

interface UserAgreementModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  locale: Locale
}

export default function UserAgreementModal({ isOpen, onClose, onConfirm, locale }: UserAgreementModalProps) {
  const [agreements, setAgreements] = useState({
    aiAnalysis: false,
    investmentRisk: false,
    selfResponsibility: false,
    noLiability: false,
    serviceFee: false
  })

  const allAgreed = Object.values(agreements).every(agreed => agreed)

  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleConfirm = () => {
    if (allAgreed) {
      onConfirm()
    }
  }

  // 获取当前日期
  const getCurrentDate = () => {
    const now = new Date()
    if (locale === 'zh') {
      return now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } else {
      return now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {getTranslation(locale, 'userServiceAgreement')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-gray-700 leading-relaxed">
          {/* 重要提示 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-800 mb-2">{getTranslation(locale, 'importantNotice')}</h3>
            <p className="text-yellow-700">
              {getTranslation(locale, 'agreementNotice')}
            </p>
          </div>

          {/* 协议条款 */}
          <div className="space-y-4">
            <section>
              <h3 className="font-bold text-gray-900 mb-2">{getTranslation(locale, 'serviceNature')}</h3>
              <div className="space-y-2 text-gray-700">
                <p>{getTranslation(locale, 'serviceNature1')}</p>
                <p>{getTranslation(locale, 'serviceNature2')}</p>
                <p>{getTranslation(locale, 'serviceNature3')}</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">{getTranslation(locale, 'aiContentDeclaration')}</h3>
              <div className="space-y-2 text-gray-700">
                <p>{getTranslation(locale, 'aiContent1')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {getTranslationArray(locale, 'aiContentLimitations').map((limitation: string, index: number) => (
                    <li key={index}>{limitation}</li>
                  ))}
                </ul>
                <p>{getTranslation(locale, 'aiContent2')}</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">{getTranslation(locale, 'investmentRiskWarning')}</h3>
              <div className="space-y-2 text-gray-700">
                <p>{getTranslation(locale, 'investmentRisk1')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {getTranslationArray(locale, 'investmentRiskPoints').map((point: string, index: number) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* 用户确认 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-4">{getTranslation(locale, 'userConfirmation')}</h3>
            <p className="text-gray-700 mb-4">
              {getTranslation(locale, 'userConfirmationText')}
            </p>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.aiAnalysis}
                  onChange={() => handleAgreementChange('aiAnalysis')}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{getTranslation(locale, 'aiAnalysisAgreement')}</span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.investmentRisk}
                  onChange={() => handleAgreementChange('investmentRisk')}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{getTranslation(locale, 'investmentRiskAgreement')}</span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.selfResponsibility}
                  onChange={() => handleAgreementChange('selfResponsibility')}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{getTranslation(locale, 'selfResponsibilityAgreement')}</span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.noLiability}
                  onChange={() => handleAgreementChange('noLiability')}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{getTranslation(locale, 'noLiabilityAgreement')}</span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.serviceFee}
                  onChange={() => handleAgreementChange('serviceFee')}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{getTranslation(locale, 'serviceFeeAgreement')}</span>
              </label>
            </div>
          </div>

          {/* 生效日期 - 移到底部 */}
          <div className="text-center text-gray-500 text-sm border-t pt-4">
            {getTranslation(locale, 'effectiveDate')}: {getCurrentDate()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            {getTranslation(locale, 'cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!allAgreed}
            className={`px-6 py-2 rounded-md transition-colors flex items-center space-x-2 ${
              allAgreed
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check className="h-4 w-4" />
            <span>{getTranslation(locale, 'agreeAndContinue')}</span>
          </button>
        </div>
      </div>
    </div>
  )
} 