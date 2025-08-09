import { supabase } from './supabase'
import type { Database } from './supabase'

export type User = Database['public']['Tables']['users']['Row']

export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || null
      }
    }
  })

  if (error) {
    console.error('Sign up error:', error)
    throw new Error(error.message)
  }

  // Create user profile directly
  if (data.user) {
    console.log('Creating user profile for:', data.user.id)
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          name: name || null,
          free_reports_used: 0,
          paid_reports_used: 0,
          monthly_report_limit: 0
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error creating user profile:', profileError)
      } else {
        console.log('User profile created successfully')
      }
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Sign in error:', error)
    throw new Error(error.message)
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign out error:', error)
    throw new Error(error.message)
  }
}

export async function getCurrentUser() {
  console.log('Getting current user...')
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting auth user:', error)
    throw new Error(error.message)
  }

  if (!user) {
    console.log('No authenticated user found')
    return null
  }

  console.log('Auth user found:', user.id)

  // Try to get user profile directly from client
  try {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      
      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') {
        console.log('Creating missing user profile...')
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || null,
            free_reports_used: 0,
            paid_reports_used: 0,
            monthly_report_limit: 0
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating missing profile:', createError)
          // Return user without profile for now
          return user
        }

        console.log('User profile created successfully')
        return { ...user, ...newProfile }
      }
      
      // Return user without profile for now
      return user
    }

    console.log('User profile found:', profile)
    return { ...user, ...profile }
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return user
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function canGenerateReport(userId: string): Promise<{ canGenerate: boolean; reason?: string; remainingReports?: number }> {
  try {
    // 获取用户信息
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      console.error('用户资料查询失败:', profileError)
      return { canGenerate: false, reason: '用户资料不存在' }
    }

    console.log('检查白名单状态，用户邮箱:', userProfile.email)

    // 🔥 新增：检查是否在白名单中
    const { data: whitelistUser, error: whitelistError } = await supabase
      .from('whitelist_users')
      .select('*')
      .eq('email', userProfile.email)
      .single()

    if (whitelistUser && !whitelistError) {
      console.log('用户在白名单中:', whitelistUser)
      
      // 白名单用户：检查今日报告数量
      const today = new Date().toISOString().split('T')[0]
      console.log('检查今日报告数量，日期:', today)
      
      const { count: todayReports, error: countError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)

      if (countError) {
        console.error('统计今日报告失败:', countError)
        return { canGenerate: false, reason: '统计失败' }
      }

      console.log('今日已生成报告数量:', todayReports)
      const remaining = whitelistUser.daily_report_limit - (todayReports || 0)
      console.log('剩余报告数量:', remaining)
      
      if (remaining > 0) {
        console.log('白名单用户，可以生成报告')
        return { 
          canGenerate: true, 
          reason: '白名单用户', 
          remainingReports: remaining 
        }
      } else {
        console.log('白名单用户，今日额度已用完')
        return { 
          canGenerate: false, 
          reason: '今日白名单额度已用完', 
          remainingReports: 0 
        }
      }
    } else {
      console.log('用户不在白名单中，白名单查询结果:', { whitelistUser, whitelistError })
    }

    // 非白名单用户：使用原有逻辑
    const profile = await getUserProfile(userId)
    
    if (!profile) {
      return { canGenerate: false, reason: 'User not found' }
    }

    // Check if user has free reports available
    if (profile.free_reports_used === 0) {
      return { canGenerate: true, reason: '免费报告可用' }
    }

    // Check subscription status
    if (profile.subscription_type && profile.subscription_end) {
      const endDate = new Date(profile.subscription_end)
      if (endDate > new Date()) {
        const reportsUsedThisMonth = profile.paid_reports_used
        if (reportsUsedThisMonth < profile.monthly_report_limit) {
          return { canGenerate: true, reason: '订阅报告可用' }
        } else {
          return { canGenerate: false, reason: 'Monthly report limit reached' }
        }
      }
    }

    return { canGenerate: false, reason: 'No free reports or active subscription' }
  } catch (error) {
    console.error('检查报告权限失败:', error)
    return { canGenerate: false, reason: '检查权限时出错' }
  }
}

export async function incrementReportUsage(userId: string, isFree: boolean = true) {
  // First get current values
  const { data: currentUser, error: fetchError } = await supabase
    .from('users')
    .select('free_reports_used, paid_reports_used')
    .eq('id', userId)
    .single()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  // Update the appropriate counter
  const updateData = isFree 
    ? { free_reports_used: (currentUser.free_reports_used || 0) + 1 }
    : { paid_reports_used: (currentUser.paid_reports_used || 0) + 1 }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function createReport(userId: string, stockSymbol: string, stockName: string, reportData: string) {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      stock_symbol: stockSymbol,
      stock_name: stockName,
      report_data: reportData
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createPayment(paymentData: {
  userId: string
  amount: number
  type: string
  subscriptionType?: string
  reportLimit?: number
  reportId?: string
}) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: paymentData.userId,
      amount: paymentData.amount,
      type: paymentData.type,
      subscription_type: paymentData.subscriptionType || null,
      report_limit: paymentData.reportLimit || null,
      report_id: paymentData.reportId || null,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updatePaymentStatus(paymentId: string, status: string, alipayTradeNo?: string) {
  const updateData: any = { status }
  if (alipayTradeNo) {
    updateData.alipay_trade_no = alipayTradeNo
  }

  const { data, error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', paymentId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateUserSubscription(userId: string, subscriptionData: {
  subscriptionType: string
  reportLimit: number
  subscriptionEnd: string
}) {
  const { error } = await supabase
    .from('users')
    .update({
      subscription_type: subscriptionData.subscriptionType,
      subscription_start: new Date().toISOString(),
      subscription_end: subscriptionData.subscriptionEnd,
      monthly_report_limit: subscriptionData.reportLimit,
      paid_reports_used: 0
    })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }
} 