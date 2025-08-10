'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Globe, ChevronDown } from 'lucide-react'
import { locales, localeNames, type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: Locale) => {
    setIsOpen(false)
    
    // 构建新的路径
    const segments = pathname.split('/')
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    
    const newPath = segments.join('/')
    router.push(newPath)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-amber-300 bg-slate-800/50 border border-amber-500/30 rounded-md hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 font-inter"
      >
        <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 sm:w-48 bg-slate-800 border border-amber-500/30 rounded-md shadow-lg z-50 backdrop-blur-sm">
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-amber-500/20 transition-colors ${
                  locale === currentLocale ? 'bg-amber-500/20 text-amber-300' : 'text-gray-300'
                }`}
              >
                {localeNames[locale]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 