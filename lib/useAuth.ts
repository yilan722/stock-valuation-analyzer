import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { Database } from './supabase'

type User = Database['public']['Tables']['users']['Row']

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 useAuth hook 初始化')
    
    // 获取初始会话
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('👤 找到用户会话:', session.user.id)
          
          // 尝试获取用户profile
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profile) {
              setUser(profile)
              console.log('✅ 用户profile加载成功')
            } else {
              // 如果没有profile，创建基本用户信息
              const basicUser: User = {
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
              setUser(basicUser)
              console.log('✅ 创建基本用户信息')
            }
          } catch (error) {
            console.log('⚠️ 获取profile失败，使用基本用户信息')
            const basicUser: User = {
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
            setUser(basicUser)
          }
        } else {
          console.log('👤 没有用户会话')
          setUser(null)
        }
      } catch (error) {
        console.error('💥 获取初始会话失败:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 认证状态变化:', event, session?.user?.id)
        
        if (session?.user) {
          console.log('👤 用户已认证:', session.user.id)
          
          // 立即设置loading为false，避免延迟
          setLoading(false)
          console.log('🔄 立即重置loading状态为false')
          
          // 立即设置基本用户信息，不等待profile
          const immediateUser: User = {
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
          
          // 立即设置用户状态
          setUser(immediateUser)
          console.log('✅ 立即设置用户状态:', immediateUser.id)
          
          // 然后异步获取完整profile
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profile) {
              setUser(profile)
              console.log('✅ 用户profile更新成功:', profile.id)
            } else {
              console.log('✅ 使用基本用户信息:', immediateUser.id)
            }
          } catch (error) {
            console.log('⚠️ 获取profile失败，使用基本用户信息:', error)
            console.log('✅ 使用基本用户信息:', immediateUser.id)
          }
        } else {
          console.log('👤 用户已登出')
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 添加调试信息
  console.log('🔍 useAuth hook 状态:', { 
    userId: user?.id, 
    loading, 
    event: 'return'
  })
  
  // 强制状态更新
  const forceUpdate = () => {
    console.log('🔄 强制状态更新')
    setLoading(false)
  }
  
  // 立即重置loading
  const resetLoading = () => {
    console.log('🔄 立即重置loading')
    setLoading(false)
  }
  
  // 强制设置用户状态
  const forceSetUser = (userId: string) => {
    console.log('🔄 强制设置用户状态:', userId)
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
  
  return { user, loading, forceUpdate, resetLoading, forceSetUser }
} 