import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase'
import { createPayment } from '../../../../lib/supabase-auth'
import { createAlipayOrder, SUBSCRIPTION_PLANS, SubscriptionPlanType } from '../../../../lib/alipay'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { planType } = await request.json()

    if (!planType || !SUBSCRIPTION_PLANS[planType as SubscriptionPlanType]) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS[planType as SubscriptionPlanType]

    // Create payment record
    const payment = await createPayment({
      userId: user.id,
      amount: plan.price,
      type: planType === 'pay_per_report' ? 'pay_per_report' : 'subscription',
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