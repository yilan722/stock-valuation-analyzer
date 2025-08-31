'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [envData, setEnvData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkEnv() {
      try {
        const response = await fetch('/api/test-simple')
        if (response.ok) {
          const data = await response.json()
          setEnvData(data)
        } else {
          setError(`API 调用失败: ${response.status}`)
        }
      } catch (err) {
        setError(`网络错误: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    checkEnv()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">🔄 检查环境变量...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔍 环境变量调试页面</h1>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>错误:</strong> {error}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔑 环境变量状态</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(envData, null, 2)}
            </pre>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center">
                <span className="font-medium">Token 状态:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  envData?.hasToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {envData?.hasToken ? '✅ 已配置' : '❌ 未配置'}
                </span>
              </div>
              
              {envData?.hasToken && (
                <div className="flex items-center">
                  <span className="font-medium">Token 长度:</span>
                  <span className="ml-2">{envData.tokenLength} 字符</span>
                </div>
              )}
              
              <div className="flex items-center">
                <span className="font-medium">环境:</span>
                <span className="ml-2">{envData?.environment}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            返回主页
          </a>
        </div>
      </div>
    </div>
  )
}
