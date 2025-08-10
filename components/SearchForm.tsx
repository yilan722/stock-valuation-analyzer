'use client'

import { useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'

interface SearchFormProps {
  onSearch: (symbol: string) => void
  onGenerateReport: () => void
  isLoading: boolean
  locale: Locale
  isGeneratingReport?: boolean
}

export default function SearchForm({ onSearch, onGenerateReport, isLoading, locale, isGeneratingReport }: SearchFormProps) {
  const [symbol, setSymbol] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase())
    }
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-amber-500/30 shadow-lg p-3 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-amber-200 mb-2 font-inter">
            {getTranslation(locale, 'searchPlaceholder')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 h-5 w-5" />
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder={getTranslation(locale, 'searchPlaceholder')}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-amber-500/30 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder-gray-400 font-inter"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="submit"
            disabled={!symbol.trim() || isLoading}
            className="w-full sm:flex-1 bg-amber-600 text-slate-900 font-semibold px-4 py-3 rounded-md hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-inter"
          >
            <Search className="h-5 w-5" />
            <span>{getTranslation(locale, 'searchButton')}</span>
          </button>
          
          <button
            type="button"
            onClick={onGenerateReport}
            disabled={isLoading}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold px-6 py-3 rounded-md hover:from-amber-600 hover:to-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-inter"
          >
            <span>{getTranslation(locale, 'generateReport')}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        
        {/* Progress Bar for Report Generation */}
        {isGeneratingReport && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-amber-200 mb-2">
              <span className="font-medium">Generating Report...</span>
              <span className="text-amber-400">AI Analysis in Progress</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full animate-pulse">
                <div className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full animate-pulse" 
                     style={{
                       width: '100%',
                       background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)',
                       backgroundSize: '200% 100%',
                       animation: 'shimmer 2s ease-in-out infinite'
                     }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Analyzing financial data...</span>
              <span>Processing market trends...</span>
            </div>
          </div>
        )}
      </form>
    </div>
  )
} 