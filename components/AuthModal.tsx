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
      // 添加超时处理
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      )

      if (isLogin) {
        const signInPromise = signIn(email, password)
        await Promise.race([signInPromise, timeoutPromise])
        
        toast.success('Login successful!')
        console.log('Login successful, closing modal...')
        
        // 立即关闭模态框
        onSuccess()
        onClose()
        resetForm()
      } else {
        const signUpPromise = signUp(email, password, name)
        await Promise.race([signUpPromise, timeoutPromise])
        
        toast.success('Registration successful! Please check your email for verification.')
        onSuccess()
        onClose()
        resetForm()
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error(error instanceof Error ? error.message : 'Operation failed')
      setIsLoading(false) // 确保在错误时重置状态
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