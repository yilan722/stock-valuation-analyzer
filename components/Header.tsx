import LanguageSwitcher from './LanguageSwitcher'
import UserInfo from './UserInfo'
import { type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'

interface HeaderProps {
  locale: Locale
  user: any
  onLogout: () => void
  onRefresh: () => void
  onLogin: () => void
  onOpenSubscription: () => void
}

export default function Header({ locale, user, onLogout, onRefresh, onLogin, onOpenSubscription }: HeaderProps) {
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
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher currentLocale={locale} />
            <UserInfo
              user={user}
              onLogout={onLogout}
              onRefresh={onRefresh}
              onLogin={onLogin}
              onOpenSubscription={onOpenSubscription}
              locale={locale}
              isCompact={true}
            />
          </div>
        </div>
      </div>
    </header>
  )
} 