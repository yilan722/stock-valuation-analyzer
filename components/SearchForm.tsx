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
}

export default function SearchForm({ onSearch, onGenerateReport, isLoading, locale }: SearchFormProps) {
  const [symbol, setSymbol] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase())
    }
  }

  return (
         <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-amber-500/30 shadow-lg p-6">
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
        
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!symbol.trim() || isLoading}
                         className="flex-1 bg-amber-600 text-slate-900 font-semibold px-4 py-3 rounded-md hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-inter"
          >
            <Search className="h-5 w-5" />
            <span>{getTranslation(locale, 'searchButton')}</span>
          </button>
          
          <button
            type="button"
            onClick={onGenerateReport}
            disabled={isLoading}
                         className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold px-6 py-3 rounded-md hover:from-amber-600 hover:to-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-inter"
          >
            <span>{getTranslation(locale, 'generateReport')}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
} 