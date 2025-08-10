import LanguageSwitcher from './LanguageSwitcher'
import UserInfo from './UserInfo'
import { type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'

// SuperAnalyst Logo Component
function SuperAnalystLogo() {
  return (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 32 32" 
      className="text-white"
      fill="currentColor"
    >
      {/* Magnifying glass handle */}
      <path d="M22 22L28 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Magnifying glass circle */}
      <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      
      {/* Bar chart bars */}
      <rect x="10" y="18" width="2" height="4" fill="currentColor"/>
      <rect x="13" y="16" width="2" height="6" fill="currentColor"/>
      <rect x="16" y="12" width="2" height="10" fill="currentColor"/>
      
      {/* Upward arrow */}
      <path d="M17 10L19 8L21 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

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
    <header className="bg-slate-800 shadow-lg border-b border-amber-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <SuperAnalystLogo />
              <span className="ml-2 text-xl font-bold text-white font-inter">
                SuperAnalyst
              </span>
            </div>
            <p className="ml-4 text-sm text-amber-200 font-inter">
              AI-Powered Pro Equity Research
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