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
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Globe className="w-4 h-4" />
        <span>{localeNames[currentLocale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  locale === currentLocale ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
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