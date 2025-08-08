import LanguageSwitcher from './LanguageSwitcher'
import { type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'

interface HeaderProps {
  locale: Locale
}

export default function Header({ locale }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {getTranslation(locale, 'title')}
            </h1>
            <p className="ml-4 text-sm text-gray-500">
              {getTranslation(locale, 'subtitle')}
            </p>
          </div>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  )
} 