import { NextRequest, NextResponse } from 'next/server'
import { verifyAlipayPayment } from '../../../../lib/alipay'
import { updatePaymentStatus, updateUserSubscription } from '../../../../lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const params = await request.json()

    // Verify Alipay signature
    const isValid = await verifyAlipayPayment(params)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const { out_trade_no, trade_status, trade_no } = params

    if (trade_status !== 'TRADE_SUCCESS') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 })
    }

    // Update payment status
    const payment = await updatePaymentStatus(out_trade_no, 'completed', trade_no)

    // Update user subscription if it's a subscription payment
    if (payment.type === 'subscription' && payment.subscription_type) {
      const subscriptionEnd = new Date()
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)

      await updateUserSubscription(payment.user_id, {
        subscriptionType: payment.subscription_type,
        reportLimit: payment.report_limit || 0,
        subscriptionEnd: subscriptionEnd.toISOString()
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment notify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 