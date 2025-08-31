import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { toast } from 'sonner'
import { Search, TrendingUp, BarChart3, FileText, Settings, LogOut, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import StockSearch from '@/components/StockSearch'
import ReportDisplay from '@/components/ReportDisplay'
import ReportHistory from '@/components/ReportHistory'
import { StockData } from '@/types/stock'

export default function HomePage({ params }: { params: { locale: string } }) {
  const { user, signOut, loading } = useAuth()
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [checkingEnv, setCheckingEnv] = useState(false)

  useEffect(() => {
    const fetchEnvStatus = async () => {
      setCheckingEnv(true)
      try {
        const response = await fetch('/api/test-simple')
        if (response.ok) {
          const data = await response.json()
          setEnvStatus(data)
          toast.success('环境变量检查完成')
        } else {
          setEnvStatus({ error: `API 调用失败: ${response.status}` })
          toast.error('环境变量检查失败')
        }
      } catch (err) {
        setEnvStatus({ error: `网络错误: ${err}` })
        toast.error('环境变量检查失败')
      } finally {
        setCheckingEnv(false)
      }
    }

    fetchEnvStatus()
    const interval = setInterval(fetchEnvStatus, 60000) // 每分钟检查一次
    return () => clearInterval(interval)
  }, [])

  const checkEnvironment = async () => {
    setCheckingEnv(true)
    try {
      const response = await fetch('/api/test-simple')
      if (response.ok) {
        const data = await response.json()
        setEnvStatus(data)
        toast.success('环境变量检查完成')
      } else {
        setEnvStatus({ error: `API 调用失败: ${response.status}` })
        toast.error('环境变量检查失败')
      }
    } catch (err) {
      setEnvStatus({ error: `网络错误: ${err}` })
      toast.error('环境变量检查失败')
    } finally {
      setCheckingEnv(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {params.locale === 'zh' ? '股票估值分析器' : 'Stock Valuation Analyzer'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Environment Check Button */}
              <button
                onClick={checkEnvironment}
                disabled={checkingEnv}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {checkingEnv ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    检查环境
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    检查环境
                  </>
                )}
              </button>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {params.locale === 'zh' ? '退出' : 'Sign Out'}
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  {params.locale === 'zh' ? '未登录' : 'Not signed in'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Environment Status Display */}
      {envStatus && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
              环境变量状态
            </h2>
            
            {envStatus.error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>错误:</strong> {envStatus.error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium mr-2">Token 状态:</span>
                    {envStatus.hasToken ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  
                  {envStatus.hasToken && (
                    <div className="p-3 bg-gray-50 rounded">
                      <span className="font-medium">Token 长度: </span>
                      <span className="text-blue-600">{envStatus.tokenLength}</span>
                    </div>
                  )}
                  
                  <div className="p-3 bg-gray-50 rounded">
                    <span className="font-medium">环境: </span>
                    <span className="text-blue-600">{envStatus.environment}</span>
                  </div>
                </div>
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    查看完整数据
                  </summary>
                  <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto">
                    {JSON.stringify(envStatus, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ... existing code ... */}
