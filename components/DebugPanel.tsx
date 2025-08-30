'use client'

import React, { useState, useEffect } from 'react'
import { Bug, Database, FileText, User, AlertCircle } from 'lucide-react'
import useAuth from '@/lib/useAuth'

interface DebugPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function DebugPanel({ isOpen, onClose }: DebugPanelProps) {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const { user, loading } = useAuth()

  const runDiagnostics = async () => {
    setIsLoading(true)
    const info: any = {}
    
    try {
      // 1. 用户状态诊断
      info.userStatus = {
        isAuthenticated: !!user,
        userId: user?.id || 'null',
        userEmail: user?.email || 'null',
        loading: loading,
        timestamp: new Date().toISOString()
      }
      
      // 2. 数据库连接测试
      try {
        const dbResponse = await fetch('/api/test-db')
        const dbData = await dbResponse.json()
        info.databaseTest = {
          status: dbResponse.status,
          success: dbResponse.ok,
          data: dbData,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        info.databaseTest = {
          status: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
      
      // 3. 报告数据测试
      if (user) {
        try {
          const { data: reports, error } = await fetch('/api/reports?userId=' + user.id)
            .then(res => res.json())
            .catch(() => ({ data: null, error: 'API call failed' }))
          
          info.reportsTest = {
            success: !error,
            reportsCount: reports?.length || 0,
            error: error || null,
            timestamp: new Date().toISOString()
          }
        } catch (error) {
          info.reportsTest = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }
        }
      }
      
      // 4. 环境变量检查
      info.environment = {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasOpus4Key: true, // 这个在服务器端，前端无法直接访问
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      info.generalError = error instanceof Error ? error.message : 'Unknown error'
    }
    
    setDebugInfo(info)
    setIsLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      runDiagnostics()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <Bug className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">系统调试面板</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">正在运行诊断...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 用户状态 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">用户状态</h3>
                </div>
                <pre className="text-sm text-blue-800 bg-blue-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo.userStatus, null, 2)}
                </pre>
              </div>

              {/* 数据库测试 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Database className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">数据库连接测试</h3>
                </div>
                <pre className="text-sm text-green-800 bg-green-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo.databaseTest, null, 2)}
                </pre>
              </div>

              {/* 报告测试 */}
              {user && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">报告数据测试</h3>
                  </div>
                  <pre className="text-sm text-purple-800 bg-purple-100 p-3 rounded overflow-x-auto">
                    {JSON.stringify(debugInfo.reportsTest, null, 2)}
                  </pre>
                </div>
              )}

              {/* 环境变量 */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-900">环境变量检查</h3>
                </div>
                <pre className="text-sm text-yellow-800 bg-yellow-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo.environment, null, 2)}
                </pre>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3">
                <button
                  onClick={runDiagnostics}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  重新运行诊断
                </button>
                <button
                  onClick={() => setDebugInfo({})}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  清除信息
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
