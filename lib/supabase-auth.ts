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
    throw new Error(error.message)
  }

  // Create user profile in our custom users table
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        name: name || null,
        free_reports_used: 0,
        paid_reports_used: 0,
        monthly_report_limit: 0
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
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
    throw new Error(error.message)
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw new Error(error.message)
  }

  if (!user) {
    return null
  }

  // Get user profile from our custom users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching user profile:', profileError)
    return null
  }

  return {
    ...user,
    ...profile
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

export async function canGenerateReport(userId: string): Promise<{ canGenerate: boolean; reason?: string }> {
  const profile = await getUserProfile(userId)
  
  if (!profile) {
    return { canGenerate: false, reason: 'User not found' }
  }

  // Check if user has free reports available
  if (profile.free_reports_used === 0) {
    return { canGenerate: true }
  }

  // Check subscription status
  if (profile.subscription_type && profile.subscription_end) {
    const endDate = new Date(profile.subscription_end)
    if (endDate > new Date()) {
      const reportsUsedThisMonth = profile.paid_reports_used
      if (reportsUsedThisMonth < profile.monthly_report_limit) {
        return { canGenerate: true }
      } else {
        return { canGenerate: false, reason: 'Monthly report limit reached' }
      }
    }
  }

  return { canGenerate: false, reason: 'No free reports or active subscription' }
}

export async function incrementReportUsage(userId: string, isFree: boolean = true) {
  const updateData = isFree 
    ? { free_reports_used: supabase.rpc('increment', { row_id: userId, column_name: 'free_reports_used' }) }
    : { paid_reports_used: supabase.rpc('increment', { row_id: userId, column_name: 'paid_reports_used' }) }

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
      paid_reports_used: 0 // Reset monthly usage
    })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }
} 