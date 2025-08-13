import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../../lib/supabase-server'
import { updatePaymentStatus, updateUserSubscription } from '../../../../../lib/supabase-auth'

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

    const { orderID, userId, planId } = await request.json()

    if (!orderID || !userId || !planId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Capture PayPal payment
    const captureResult = await capturePayPalPayment(orderID)

    if (captureResult.status === 'COMPLETED') {
      // Update payment status in database
      await updatePaymentStatus(orderID, 'completed')

      // Update user subscription
      await updateUserSubscription(userId, planId)

      return NextResponse.json({
        status: 'COMPLETED',
        orderID,
        transactionID: captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id
      })
    } else {
      return NextResponse.json({
        status: captureResult.status,
        error: 'Payment not completed'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Capture PayPal payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function capturePayPalPayment(orderID: string) {
  const paypalClientId = process.env.PAYPAL_CLIENT_ID
  const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET
  const isProduction = process.env.NODE_ENV === 'production'
  
  const baseUrl = isProduction 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com'

  // Get access token
  const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  if (!tokenResponse.ok) {
    throw new Error('Failed to get PayPal access token')
  }

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  // Capture payment
  const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!captureResponse.ok) {
    const errorData = await captureResponse.json()
    console.error('PayPal capture error:', errorData)
    throw new Error('Failed to capture PayPal payment')
  }

  return await captureResponse.json()
} 