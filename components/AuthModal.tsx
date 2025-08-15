'use client'

import React, { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { signIn, signUp } from '../lib/supabase-auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  locale: string
}

export default function AuthModal({ isOpen, onClose, onSuccess, locale }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('🚀 开始认证流程...')
      
      if (isLogin) {
        console.log('🔐 登录模式')
        const result = await signIn(email, password)
        console.log('✅ 登录成功:', result.user?.id)
        
        toast.success('登录成功！')
        
        // 立即关闭模态框和重置表单
        resetForm()
        onClose()
        onSuccess()
      } else {
        console.log('📝 注册模式')
        const result = await signUp(email, password, name)
        console.log('✅ 注册成功:', result.user?.id)
        
        toast.success('注册成功！请检查您的邮箱进行验证。')
        
        // 立即关闭模态框和重置表单
        resetForm()
        onClose()
        onSuccess()
      }
    } catch (error) {
      console.error('❌ 认证错误:', error)
      
      let errorMessage = '操作失败'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      // 提供更友好的错误信息
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = '邮箱或密码错误'
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = '该邮箱已被注册，请直接登录'
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = '请先验证您的邮箱'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setShowPassword(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-lg p-4 sm:p-6 w-full max-w-md mx-2 sm:mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-amber-400 font-inter">
            {isLogin ? 'Login' : 'Register'}
          </h2>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-amber-300 mb-1.5 sm:mb-2 font-inter">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-800 border border-amber-500/30 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder-gray-400 font-inter text-sm"
                  placeholder="Enter your name"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

                      <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-amber-300 mb-1.5 sm:mb-2 font-inter">
                Email
              </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 h-4 w-4 sm:h-5 sm:w-5" />
                              <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-800 border border-amber-500/30 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder-gray-400 font-inter text-sm"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
            </div>
          </div>

                      <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-amber-300 mb-1.5 sm:mb-2 font-inter">
                Password
              </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 h-4 w-4 sm:h-5 sm:w-5" />
                              <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 bg-slate-800 border border-amber-500/30 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder-gray-400 font-inter text-sm"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-md hover:from-amber-600 hover:to-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-inter text-sm"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-amber-400 hover:text-amber-300 text-xs sm:text-sm font-inter"
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
} 