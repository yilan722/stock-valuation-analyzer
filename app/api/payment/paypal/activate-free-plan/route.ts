import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPayment, updateUserSubscription } from '../../../../../lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Starting free plan activation...')
    
    // 使用service role key创建Supabase客户端，绕过认证问题
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const body = await request.json()
    const { userId, requestPlanId, planName } = body
    
    if (!userId) {
      console.error('❌ No user ID provided')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // 使用service role验证用户是否存在
    console.log('👤 Verifying user with service role...')
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    if (userError || !user) {
      console.error('❌ User verification failed:', userError)
      return NextResponse.json(
        { error: 'User not found', details: userError?.message },
        { status: 404 }
      )
    }
    
    console.log('✅ User verified:', { id: user.user.id, email: user.user.email })
    
    // 记录免费计划激活到数据库
    const paymentData = {
      userId: userId,
      amount: 0,
      type: 'subscription',
      subscriptionType: planName,
      reportLimit: getReportLimitForPlan(planName)
    }

    const { data: payment, error: paymentError } = await createPayment(paymentData)
    if (paymentError) {
      console.error('❌ Failed to record payment:', paymentError)
      return NextResponse.json(
        { error: 'Failed to record payment', details: paymentError.message },
        { status: 500 }
      )
    }

    console.log('✅ Payment recorded successfully:', payment)

    // 更新用户订阅信息
    const reportLimit = getReportLimitForPlan(planName)
    const subscriptionEnd = new Date()
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1) // 1个月后到期

    await updateUserSubscription(userId, {
      subscriptionType: planName,
      reportLimit: reportLimit,
      subscriptionEnd: subscriptionEnd.toISOString()
    })

    console.log('✅ User subscription updated successfully')

    return NextResponse.json({
      success: true,
      payment_id: payment.id,
      plan_name: planName,
      report_limit: reportLimit,
      subscription_end: subscriptionEnd.toISOString()
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// 根据计划名称获取报告限制
function getReportLimitForPlan(planName: string): number {
  switch (planName.toLowerCase()) {
    case 'basic plan':
      return 20
    case 'standard plan':
      return 280
    case 'pro plan':
      return 620
    case 'flagship plan':
      return 1840
    default:
      return 20
  }
} 