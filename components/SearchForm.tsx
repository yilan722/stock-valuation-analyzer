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
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-2">
            {getTranslation(locale, 'searchPlaceholder')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder={getTranslation(locale, 'searchPlaceholder')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!symbol.trim() || isLoading}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>{getTranslation(locale, 'searchButton')}</span>
          </button>
          
          <button
            type="button"
            onClick={onGenerateReport}
            disabled={isLoading}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>{getTranslation(locale, 'generateReport')}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
} 