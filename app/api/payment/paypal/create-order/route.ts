import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../../lib/supabase-server'
import { createPayment } from '../../../../../lib/supabase-auth'
import { PAYPAL_CONFIG, PAYPAL_ENDPOINTS } from '../../../../../lib/paypal-config'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.id)

    const { amount, planName, planId, userId, currency = 'USD' } = await request.json()

    if (!amount || !planName || !planId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify user ID matches authenticated user
    if (userId !== user.id) {
      console.error('User ID mismatch:', { userId, authenticatedUserId: user.id })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    console.log('Creating payment record for user:', userId)

    // Create payment record in database
    const payment = await createPayment({
      userId: user.id,
      amount: amount,
      type: 'subscription',
      subscriptionType: planId,
      reportLimit: 0 // Will be set based on plan
    })

    console.log('Payment record created:', payment.id)

    // Create PayPal order using PayPal Server SDK
    const paypalOrder = await createPayPalOrder({
      amount,
      planName,
      planId,
      paymentId: payment.id,
      currency
    })

    console.log('PayPal order created:', paypalOrder.id)

    return NextResponse.json({
      orderID: paypalOrder.id,
      paymentId: payment.id
    })
  } catch (error) {
    console.error('Create PayPal order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createPayPalOrder({ amount, planName, planId, paymentId, currency }: {
  amount: number
  planName: string
  planId: string
  paymentId: string
  currency: string
}) {
  const paypalClientId = PAYPAL_CONFIG.CLIENT_ID
  const paypalClientSecret = PAYPAL_CONFIG.CLIENT_SECRET
  
  if (!paypalClientId || !paypalClientSecret) {
    console.error('Missing PayPal credentials:', { 
      hasClientId: !!paypalClientId, 
      hasClientSecret: !!paypalClientSecret 
    })
    throw new Error('PayPal credentials not configured')
  }

  console.log('PayPal config:', {
    baseUrl: PAYPAL_CONFIG.BASE_URL,
    isProduction: PAYPAL_CONFIG.IS_PRODUCTION,
    hasClientId: !!paypalClientId,
    hasClientSecret: !!paypalClientSecret
  })

  // Get access token
  const tokenResponse = await fetch(`${PAYPAL_CONFIG.BASE_URL}${PAYPAL_ENDPOINTS.OAUTH_TOKEN}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    console.error('PayPal token error:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      error: errorText
    })
    throw new Error(`Failed to get PayPal access token: ${tokenResponse.status} ${tokenResponse.statusText}`)
  }

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  console.log('PayPal access token obtained')

  // Create order
  const orderResponse = await fetch(`${PAYPAL_CONFIG.BASE_URL}${PAYPAL_ENDPOINTS.CREATE_ORDER}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      intent: PAYPAL_CONFIG.DEFAULT_INTENT,
      purchase_units: [
        {
          reference_id: paymentId,
          description: `SuperAnalyst Subscription - ${planName}`,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          },
          custom_id: planId
        }
      ],
      application_context: {
        return_url: PAYPAL_CONFIG.RETURN_URL,
        cancel_url: PAYPAL_CONFIG.CANCEL_URL
      }
    })
  })

  if (!orderResponse.ok) {
    const errorData = await orderResponse.json()
    console.error('PayPal order creation error:', {
      status: orderResponse.status,
      statusText: orderResponse.statusText,
      error: errorData
    })
    throw new Error(`Failed to create PayPal order: ${orderResponse.status} ${orderResponse.statusText}`)
  }

  return await orderResponse.json()
} 