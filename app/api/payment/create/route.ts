import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../lib/supabase-server'
import { createPayment } from '../../../../lib/supabase-auth'
import { createAlipayOrder } from '../../../../lib/alipay'

// 订阅计划配置
const SUBSCRIPTION_PLANS = {
  single_report: {
    name: '单篇报告',
    price: 5,
    reports: 1,
    type: 'single_report'
  },
  monthly_30: {
    name: '月度订阅 (30篇)',
    price: 99,
    reports: 30,
    type: 'monthly_30'
  },
  monthly_70: {
    name: '高级订阅 (70篇)',
    price: 199,
    reports: 70,
    type: 'monthly_70'
  },
  premium_300: {
    name: '专业版 (300篇)',
    price: 998,
    reports: 300,
    type: 'premium_300'
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { amount, type, subscriptionType, reportLimit } = await request.json()

    if (!amount || !type || !subscriptionType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS[subscriptionType as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid subscription type' },
        { status: 400 }
      )
    }

    // Create payment record
    const payment = await createPayment({
      userId: user.id,
      amount: plan.price,
      type: type,
      subscriptionType: plan.type,
      reportLimit: plan.reports
    })

    // Create Alipay order
    const alipayResult = await createAlipayOrder({
      amount: plan.price,
      subject: plan.name,
      body: `股票估值分析报告 - ${plan.name}`,
      outTradeNo: payment.id,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
      notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/notify`
    })

    return NextResponse.json({
      paymentUrl: alipayResult,
      paymentId: payment.id
    })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 