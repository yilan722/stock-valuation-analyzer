'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { setGlobalForceSignOut } from './supabase-auth'
import type { User } from './supabase-auth'

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 调试开关，只在开发环境下启用
  const isDebug = process.env.NODE_ENV === 'development'
  
  // 调试日志函数
  const debugLog = (message: string, data?: any) => {
    if (isDebug) {
      console.log(message, data)
    }
  }

  useEffect(() => {
    // 设置全局的forceSignOut函数
    debugLog('🔧 正在设置全局forceSignOut函数...')
    setGlobalForceSignOut(() => {
      debugLog('🔄 全局forceSignOut被调用')
      setUser(null)
      setLoading(false)
      
      // 清理本地存储
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        debugLog('🧹 全局forceSignOut：清理所有本地存储')
      }
      
      // 强制触发Supabase状态更新
      try {
        // 使用正确的方法清除会话
        supabase.auth.setSession({
          access_token: '',
          refresh_token: ''
        })
        debugLog('🔄 强制清除Supabase会话')
      } catch (error) {
        debugLog('⚠️ 清除Supabase会话失败:', error)
      }
      
      // 强制触发onAuthStateChange事件
      try {
        // 手动触发状态变化
        const event = new CustomEvent('supabase-auth-state-change', {
          detail: { event: 'SIGNED_OUT', session: null }
        })
        window.dispatchEvent(event)
        debugLog('🔄 手动触发认证状态变化事件')
      } catch (error) {
        debugLog('⚠️ 触发事件失败:', error)
      }
      
      debugLog('✅ 强制登出完成')
    })
    debugLog('✅ 全局forceSignOut函数已设置')
    
    // 获取当前会话
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ 获取初始会话失败:', error)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          debugLog('🔐 找到现有会话，用户:', session.user.id)
          // 创建符合User类型的用户对象
          const userProfile: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || null,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
            free_reports_used: 0,
            paid_reports_used: 0,
            subscription_id: null,
            subscription_type: null,
            subscription_start: null,
            subscription_end: null,
            monthly_report_limit: 0
          }
          setUser(userProfile)
        } else {
          debugLog('🔍 未找到现有会话')
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ 获取初始会话异常:', error)
        setLoading(false)
      }
    }
    
    getInitialSession()
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        debugLog(`🔄 认证状态变化: ${event} ${session?.user?.id || 'null'}`)
        
        // 只在状态真正变化时更新
        if (event === 'SIGNED_IN' && session?.user) {
          // 使用更精确的比较来避免重复更新
          const currentUserId = user?.id
          const newUserId = session.user.id
          
          if (currentUserId !== newUserId) {
            debugLog(`✅ 用户登录: ${newUserId}`)
            // 创建符合User类型的用户对象
            const userProfile: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || null,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
              free_reports_used: 0,
              paid_reports_used: 0,
              subscription_id: null,
              subscription_type: null,
              subscription_start: null,
              subscription_end: null,
              monthly_report_limit: 0
            }
            setUser(userProfile)
          } else {
            debugLog(`🔄 相同用户状态，跳过更新: ${newUserId}`)
          }
        } else if (event === 'SIGNED_OUT') {
          if (user !== null) {
            debugLog('🚪 用户登出')
            setUser(null)
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const currentUserId = user?.id
          const refreshedUserId = session.user.id
          
          if (currentUserId !== refreshedUserId) {
            debugLog(`🔄 令牌刷新，用户: ${session.user.id}`)
            // 创建符合User类型的用户对象
            const userProfile: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || null,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
              free_reports_used: 0,
              paid_reports_used: 0,
              subscription_id: null,
              subscription_type: null,
              subscription_start: null,
              subscription_end: null,
              monthly_report_limit: 0
            }
            setUser(userProfile)
          }
        }
        
        setLoading(false)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 添加调试信息 - 只在开发环境输出
  if (process.env.NODE_ENV === 'development') {
    // 禁用重复的状态日志，只在真正需要时输出
    // console.log('🔍 useAuth hook 状态:', { 
    //   userId: user?.id, 
    //   loading, 
    //   event: 'return',
    //   userEmail: user?.email,
    //   userName: user?.name
    // })
  }
  
  // 强制登出函数 - 不依赖Supabase API
  const forceSignOut = () => {
    debugLog('🚪 强制登出...')
    
    // 立即清理状态
    setUser(null)
    setLoading(false)
    
    // 清理本地存储
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      debugLog('🧹 强制清理所有本地存储')
    }
    
    // 强制触发Supabase状态更新
    try {
      // 使用正确的方法清除会话
      supabase.auth.setSession({
        access_token: '',
        refresh_token: ''
      })
      debugLog('🔄 强制清除Supabase会话')
    } catch (error) {
      debugLog('⚠️ 清除Supabase会话失败:', error)
    }
    
    // 强制触发onAuthStateChange事件
    try {
      // 手动触发状态变化
      const event = new CustomEvent('supabase-auth-state-change', {
        detail: { event: 'SIGNED_OUT', session: null }
      })
      window.dispatchEvent(event)
      debugLog('🔄 手动触发认证状态变化事件')
    } catch (error) {
      debugLog('⚠️ 触发事件失败:', error)
    }
    
    debugLog('✅ 强制登出完成')
  }
  
  // 强制状态更新
  const forceUpdate = () => {
    debugLog('🔄 强制状态更新')
    setLoading(false)
  }
  
  // 立即重置loading
  const resetLoading = () => {
    debugLog('🔄 立即重置loading')
    setLoading(false)
  }
  
  // 强制设置用户状态
  const forceSetUser = (userId: string) => {
    debugLog('🔄 强制设置用户状态:', userId)
    const forcedUser: User = {
      id: userId,
      email: '',
      name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      free_reports_used: 0,
      paid_reports_used: 0,
      subscription_id: null,
      subscription_type: null,
      subscription_start: null,
      subscription_end: null,
      monthly_report_limit: 0
    }
    setUser(forcedUser)
    setLoading(false)
  }
  
  // 登出函数
  const signOut = async () => {
    try {
      debugLog('🚪 用户登出中...')
      await supabase.auth.signOut()
      setUser(null)
      setLoading(false)
      debugLog('✅ 用户登出成功')
    } catch (error) {
      console.error('❌ 登出失败:', error)
      // 即使失败也要强制清理状态
      setUser(null)
      setLoading(false)
      debugLog('🧹 强制清理用户状态')
    }
  }
  
  return { user, loading, forceUpdate, resetLoading, forceSetUser, signOut, forceSignOut }
} 