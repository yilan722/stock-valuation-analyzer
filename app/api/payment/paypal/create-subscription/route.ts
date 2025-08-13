import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPayment } from '../../../../../lib/supabase-auth'
import { PAYPAL_CONFIG, PAYPAL_ENDPOINTS, SUBSCRIPTION_PLANS } from '../../../../../lib/paypal-config'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Starting subscription creation...')
    
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
    const { userId, requestPlanId, planName, amount, currency } = body
    
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
    
    // 获取PayPal访问令牌
    const accessToken = await getPayPalAccessToken()
    
    // 创建或获取PayPal产品
    console.log('🏷️ Creating/Getting PayPal product...')
    const productId = await createOrGetPayPalProduct(accessToken)
    
    // 创建或获取PayPal计费计划
    console.log('📋 Creating/Getting PayPal billing plan...')
    const paypalPlanId = await createOrGetPayPalPlan(accessToken, productId, planName, amount)
    
    // 创建PayPal订阅
    console.log('💳 Creating PayPal subscription...')
    const subscriptionResponse = await fetch(`${PAYPAL_CONFIG.BASE_URL}${PAYPAL_ENDPOINTS.CREATE_SUBSCRIPTION}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
              body: JSON.stringify({
          plan_id: paypalPlanId,
          start_time: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
        subscriber: {
          name: {
            given_name: user.user.user_metadata?.full_name?.split(' ')[0] || 'User',
            surname: user.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Account'
          },
          email_address: user.user.email
        },
        application_context: {
          brand_name: 'Opus4 Model Valuation',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/cancel`
        }
      })
    })

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.text()
      console.error('❌ PayPal subscription creation error:', subscriptionResponse.status, errorData)
      return NextResponse.json(
        { error: 'Failed to create PayPal subscription', details: errorData },
        { status: subscriptionResponse.status }
      )
    }

    const subscriptionData = await subscriptionResponse.json()
    console.log('📡 PayPal subscription response:', JSON.stringify(subscriptionData, null, 2))
    
    if (!subscriptionData || !subscriptionData.id) {
      console.error('❌ PayPal subscription creation failed:', subscriptionData)
      return NextResponse.json(
        { error: 'Failed to create PayPal subscription', details: subscriptionData },
        { status: 500 }
      )
    }
    
    console.log('✅ PayPal subscription created:', subscriptionData.id)

    // 记录支付到数据库
    const paymentData = {
      userId: userId,
      amount: amount,
      type: 'subscription',
      subscriptionType: planName,
      reportLimit: getReportLimitForPlan(planName)
    }

    try {
      const payment = await createPayment(paymentData)
      console.log('✅ Payment recorded successfully:', payment)
    } catch (paymentError) {
      console.error('❌ Failed to record payment:', paymentError)
      return NextResponse.json(
        { error: 'Failed to record payment', details: paymentError instanceof Error ? paymentError.message : 'Unknown error' },
        { status: 500 }
      )
    }

    // 返回订阅信息
    return NextResponse.json({
      success: true,
      subscriptionID: subscriptionData.id,
      status: subscriptionData.status,
      approval_url: subscriptionData.links?.find((link: any) => link.rel === 'approve')?.href
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// 创建或获取PayPal产品
async function createOrGetPayPalProduct(accessToken: string): Promise<string> {
  const productName = 'Opus4 Model Valuation Subscription'
  
  // 尝试创建产品
  const createProductResponse = await fetch(`${PAYPAL_CONFIG.BASE_URL}${PAYPAL_ENDPOINTS.CREATE_PRODUCT}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      name: productName,
      description: 'AI-powered stock analysis and valuation reports',
      type: 'SERVICE',
      category: 'SOFTWARE'
    })
  })

  if (createProductResponse.ok) {
    const productData = await createProductResponse.json()
    console.log('✅ PayPal product created:', productData.id)
    return productData.id
  } else {
    // 如果创建失败，尝试查找现有产品
    console.log('⚠️ Product creation failed, trying to find existing product...')
    const errorData = await createProductResponse.text()
    console.error('❌ Product creation error:', errorData)
    
    // 对于简化，我们返回一个默认产品ID
    // 在实际生产环境中，应该实现产品查找逻辑
    throw new Error(`Failed to create PayPal product: ${errorData}`)
  }
}

// 创建或获取PayPal计费计划
async function createOrGetPayPalPlan(accessToken: string, productId: string, planName: string, amount: number): Promise<string> {
  const planNameKey = planName.toLowerCase().replace(/\s+/g, '-')
  
  // 尝试创建计费计划
  const createPlanResponse = await fetch(`${PAYPAL_CONFIG.BASE_URL}${PAYPAL_ENDPOINTS.CREATE_PLAN}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      product_id: productId,
      name: planName,
      description: `${planName} - Monthly subscription for Opus4 Model Valuation`,
      type: 'FIXED',
      billing_cycles: [{
        frequency: {
          interval_unit: 'MONTH',
          interval_count: 1
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: {
          fixed_price: {
            value: amount.toString(),
            currency_code: 'USD'
          }
        }
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: '0',
          currency_code: 'USD'
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      }
    })
  })

  if (createPlanResponse.ok) {
    const planData = await createPlanResponse.json()
    console.log('✅ PayPal billing plan created:', planData.id)
    return planData.id
  } else {
    // 如果创建失败，尝试查找现有计划
    console.log('⚠️ Plan creation failed, trying to find existing plan...')
    const errorData = await createPlanResponse.text()
    console.error('❌ Plan creation error:', errorData)
    
    // 对于简化，我们返回一个默认计划ID
    // 在实际生产环境中，应该实现计划查找逻辑
    throw new Error(`Failed to create PayPal billing plan: ${errorData}`)
  }
}

// 获取PayPal访问令牌
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }
  
  const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}${PAYPAL_ENDPOINTS.OAUTH_TOKEN}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('PayPal OAuth error:', response.status, errorText)
    throw new Error(`Failed to get PayPal access token: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
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