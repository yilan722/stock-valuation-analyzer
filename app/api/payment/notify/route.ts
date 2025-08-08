import { NextRequest, NextResponse } from 'next/server'
import { verifyAlipayPayment } from '../../../../lib/alipay'
import { prisma } from '../../../../lib/database'

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
    const payment = await prisma.payment.update({
      where: { id: out_trade_no },
      data: {
        status: 'completed',
        alipayTradeNo: trade_no,
        alipayOrderId: out_trade_no
      }
    })

    // Update user subscription if it's a subscription payment
    if (payment.type === 'subscription' && payment.subscriptionType) {
      const subscriptionEnd = new Date()
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionType: payment.subscriptionType,
          subscriptionStart: new Date(),
          subscriptionEnd: subscriptionEnd,
          monthlyReportLimit: payment.reportLimit || 0,
          paidReportsUsed: 0 // Reset monthly usage
        }
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