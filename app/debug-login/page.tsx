'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function DebugLoginPage() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('testpassword123')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setSessionInfo(session)
    } catch (error) {
      console.error('检查会话失败:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setMessage(`❌ 登录失败: ${error.message}`)
      } else {
        setMessage(`✅ 登录成功: ${data.user?.id}`)
        await checkSession()
      }
    } catch (error) {
      setMessage(`💥 登录异常: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 登录调试页面</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">📊 当前状态</h2>
        <p>Session: {sessionInfo ? '有' : '无'}</p>
        <p>User ID: {sessionInfo?.user?.id || '无'}</p>
        <p>Email: {sessionInfo?.user?.email || '无'}</p>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🔐 登录测试</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">邮箱:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">密码:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        {message && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            {message}
          </div>
        )}
      </div>

      <button
        onClick={checkSession}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        🔄 刷新状态
      </button>
    </div>
  )
}
