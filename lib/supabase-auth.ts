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

export async function canGenerateReport(userId: string): Promise<{ canGenerate: boolean; reason?: string; remainingReports?: number; needsSubscription?: boolean }> {
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
      
      // 白名单用户：检查今日积分
      const today = new Date().toISOString().split('T')[0]
      const lastResetDate = whitelistUser.credits_reset_date
      
      // 如果日期不是今天，重置积分
      if (lastResetDate !== today) {
        console.log('日期已更新，重置白名单用户积分')
        const { error: updateError } = await supabase
          .from('whitelist_users')
          .update({ 
            daily_free_credits: 100,
            credits_reset_date: today,
            updated_at: new Date().toISOString()
          })
          .eq('email', userProfile.email)
        
        if (updateError) {
          console.error('更新白名单用户积分失败:', updateError)
        } else {
          whitelistUser.daily_free_credits = 100
          whitelistUser.credits_reset_date = today
        }
      }
      
      console.log('白名单用户今日可用积分:', whitelistUser.daily_free_credits)
      
      if (whitelistUser.daily_free_credits > 0) {
        console.log('白名单用户，可以生成报告')
        return { 
          canGenerate: true, 
          reason: '白名单用户', 
          remainingReports: whitelistUser.daily_free_credits,
          needsSubscription: false
        }
      } else {
        console.log('白名单用户，今日积分已用完')
        return { 
          canGenerate: false, 
          reason: '今日白名单积分已用完，请明天再试', 
          remainingReports: 0,
          needsSubscription: false
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
      return { 
        canGenerate: true, 
        reason: '免费报告可用',
        remainingReports: 1,
        needsSubscription: false
      }
    }

    // Check subscription status
    if (profile.subscription_type && profile.subscription_end) {
      const endDate = new Date(profile.subscription_end)
      if (endDate > new Date()) {
        const reportsUsedThisMonth = profile.paid_reports_used
        if (reportsUsedThisMonth < profile.monthly_report_limit) {
          return { 
          canGenerate: true, 
          reason: '订阅报告可用',
          remainingReports: profile.monthly_report_limit - reportsUsedThisMonth,
          needsSubscription: false
        }
        } else {
          return { 
          canGenerate: false, 
          reason: '月度报告限额已用完，请等待下月重置或升级订阅',
          remainingReports: 0,
          needsSubscription: true
        }
        }
      }
    }

    return { 
      canGenerate: false, 
      reason: '免费报告已用完，请订阅获取更多报告',
      remainingReports: 0,
      needsSubscription: true
    }
  } catch (error) {
    console.error('检查报告权限失败:', error)
    return { canGenerate: false, reason: '检查权限时出错' }
  }
}

export async function incrementReportUsage(userId: string, isFree: boolean = true) {
  // First get current values
  const { data: currentUser, error: fetchError } = await supabase
    .from('users')
    .select('free_reports_used, paid_reports_used, email')
    .eq('id', userId)
    .single()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  // 检查是否是白名单用户
  const { data: whitelistUser, error: whitelistError } = await supabase
    .from('whitelist_users')
    .select('*')
    .eq('email', currentUser.email)
    .single()

  if (whitelistUser && !whitelistError) {
    // 白名单用户：扣减积分
    console.log('白名单用户生成报告，扣减积分')
    const { error: updateError } = await supabase
      .from('whitelist_users')
      .update({ 
        daily_free_credits: Math.max(0, whitelistUser.daily_free_credits - 1),
        updated_at: new Date().toISOString()
      })
      .eq('email', currentUser.email)
    
    if (updateError) {
      console.error('更新白名单用户积分失败:', updateError)
    }
  } else {
    // 非白名单用户：使用原有逻辑
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