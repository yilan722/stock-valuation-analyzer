import LanguageSwitcher from './LanguageSwitcher'
import UserInfo from './UserInfo'
import { type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'
import { useState } from 'react'
import { Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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
  onOpenReportHistory: () => void
  onOpenDebugPanel: () => void
}

export default function Header({ locale, user, onLogout, onRefresh, onLogin, onOpenSubscription, onOpenReportHistory, onOpenDebugPanel }: HeaderProps) {
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [checkingEnv, setCheckingEnv] = useState(false)

  const checkEnvironment = async () => {
    setCheckingEnv(true)
    try {
      const response = await fetch('/api/test-simple')
      if (response.ok) {
        const data = await response.json()
        setEnvStatus(data)
      } else {
        setEnvStatus({ error: `API 调用失败: ${response.status}` })
      }
    } catch (err) {
      setEnvStatus({ error: `网络错误: ${err}` })
    } finally {
      setCheckingEnv(false)
    }
  }

  return (
    <header className="bg-slate-800 shadow-lg border-b border-amber-500/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-0 sm:h-16 space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <SuperAnalystLogo />
              <span className="ml-2 text-lg sm:text-xl font-bold text-white font-inter">
                SuperAnalyst
              </span>
            </div>
            <p className="ml-0 sm:ml-4 text-xs sm:text-sm text-amber-200 font-inter">
              AI-Powered Pro Equity Research
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <LanguageSwitcher currentLocale={locale} />
            
            {/* Environment Check Button */}
            <button
              onClick={checkEnvironment}
              disabled={checkingEnv}
              className="inline-flex items-center px-3 py-2 border border-amber-500/30 shadow-sm text-sm leading-4 font-medium rounded-md text-amber-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            >
              {checkingEnv ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400 mr-2"></div>
                  {locale === 'zh' ? '检查中' : 'Checking'}
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  {locale === 'zh' ? '检查环境' : 'Check Env'}
                </>
              )}
            </button>
            
            <UserInfo
              user={user}
              onLogout={onLogout}
              onRefresh={onRefresh}
              onLogin={onLogin}
              onOpenSubscription={onOpenSubscription}
              onOpenReportHistory={onOpenReportHistory}
              onOpenDebugPanel={onOpenDebugPanel}
              locale={locale}
              isCompact={true}
            />
          </div>
        </div>
        
        {/* Environment Status Display */}
        {envStatus && (
          <div className="pb-3">
            <div className="bg-slate-700/50 rounded-lg p-3 border border-amber-500/20">
              <h3 className="text-sm font-semibold mb-2 flex items-center text-amber-200">
                <AlertCircle className="h-4 w-4 mr-2" />
                {locale === 'zh' ? '环境变量状态' : 'Environment Status'}
              </h3>
              
              {envStatus.error ? (
                <div className="bg-red-900/30 border border-red-500/30 text-red-200 px-3 py-2 rounded text-sm">
                  <strong>{locale === 'zh' ? '错误:' : 'Error:'}</strong> {envStatus.error}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center p-2 bg-slate-600/30 rounded">
                    <span className="text-xs text-amber-200 mr-2">{locale === 'zh' ? 'Token:' : 'Token:'}</span>
                    {envStatus.hasToken ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  
                  {envStatus.hasToken && (
                    <div className="p-2 bg-slate-600/30 rounded">
                      <span className="text-xs text-amber-200">{locale === 'zh' ? '长度:' : 'Length:'}</span>
                      <span className="ml-1 text-xs text-blue-300">{envStatus.tokenLength}</span>
                    </div>
                  )}
                  
                  <div className="p-2 bg-slate-600/30 rounded">
                    <span className="text-xs text-amber-200">{locale === 'zh' ? '环境:' : 'Env:'}</span>
                    <span className="ml-1 text-xs text-blue-300">{envStatus.environment}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 