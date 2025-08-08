import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '../../../../lib/auth'
import { createAlipayOrder, SUBSCRIPTION_PLANS, SubscriptionPlanType } from '../../../../lib/alipay'
import { prisma } from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userSession = verifyToken(token)
    if (!userSession) {
      return NextResponse.json(
        { error: 'Invalid token' },
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
    const user = await getUserById(userSession.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: plan.price,
        type: planType === 'pay_per_report' ? 'pay_per_report' : 'subscription',
        subscriptionType: plan.type,
        reportLimit: plan.reports,
        status: 'pending'
      }
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