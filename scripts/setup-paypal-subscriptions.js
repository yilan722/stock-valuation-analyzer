#!/usr/bin/env node

/**
 * PayPal Subscriptions Setup Script
 * 
 * This script sets up the required PayPal products and plans for subscriptions.
 * Run this script once to configure your PayPal account for subscriptions.
 * 
 * Prerequisites:
 * 1. PayPal Business Account
 * 2. PayPal App credentials (Client ID and Secret)
 * 3. Environment variables set
 */

require('dotenv').config()

const PAYPAL_CONFIG = {
  CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com'
}

const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic-plan',
    name: 'Basic Plan',
    price: 0, // Free
    credits: 20,
    costPerReport: 2.59,
    dailyLimit: 2,
    features: [
      'AI-Driven Deep Analysis',
      'Real-time Market Data'
    ],
    description: 'Basic stock analysis with 20 welcome credits',
    popular: false,
    bestValue: false,
    icon: 'rectangle-line'
  },
  STANDARD: {
    id: 'standard-plan',
    name: 'Standard Plan',
    price: 29,
    credits: 280,
    costPerReport: 1.7,
    dailyLimit: -1, // Unlimited
    features: [
      'AI-Driven Deep Analysis',
      'Real-time Market Data',
      'Priority Customer Support'
    ],
    description: 'Standard stock analysis with 280 credits per month',
    popular: true,
    bestValue: false,
    icon: 'lightning'
  },
  PRO: {
    id: 'pro-plan',
    name: 'Pro Plan',
    price: 59,
    credits: 620,
    costPerReport: 1.59,
    dailyLimit: -1, // Unlimited
    features: [
      'AI-Driven Deep Analysis',
      'Real-time Market Data',
      'Priority Customer Support'
    ],
    description: 'Pro stock analysis with 620 credits per month',
    popular: false,
    bestValue: true,
    icon: 'star'
  },
  FLAGSHIP: {
    id: 'flagship-plan',
    name: 'Flagship Plan',
    price: 129,
    credits: 1840,
    costPerReport: 1.28,
    dailyLimit: -1, // Unlimited
    features: [
      'AI-Driven Deep Analysis',
      'Real-time Market Data',
      'Priority Customer Support',
      'Technical Analysis VIP Consulting'
    ],
    description: 'Flagship stock analysis with 1840 credits per month',
    popular: false,
    bestValue: false,
    icon: 'crown'
  }
}

async function getAccessToken() {
  const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${PAYPAL_CONFIG.CLIENT_ID}:${PAYPAL_CONFIG.CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

async function createProduct(accessToken, plan) {
  const productData = {
    name: `SuperAnalyst - ${plan.name}`,
    description: plan.description,
    type: 'SERVICE',
    category: 'SOFTWARE',
    image_url: 'https://example.com/logo.png',
    home_url: 'https://example.com'
  }

  const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  })

  if (!response.ok) {
    const error = await response.json()
    console.error(`Failed to create product for ${plan.name}:`, error)
    return null
  }

  const product = await response.json()
  console.log(`✅ Product created for ${plan.name}:`, product.id)
  return product
}

async function createPlan(accessToken, plan, productId) {
  // Skip creating plan for Basic (free) plan
  if (plan.price === 0) {
    console.log(`⏭️ Skipping plan creation for ${plan.name} (free plan)`)
    return { id: 'free-plan', status: 'FREE' }
  }

  const planData = {
    product_id: productId,
    name: plan.name,
    description: plan.description,
    billing_cycles: [
      {
        frequency: {
          interval_unit: 'MONTH',
          interval_count: 1
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // 0 means unlimited
        pricing_scheme: {
          fixed_price: {
            value: plan.price.toString(),
            currency_code: 'USD'
          }
        }
      }
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: {
        value: '0',
        currency_code: 'USD'
      },
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3
    }
  }

  const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(planData)
  })

  if (!response.ok) {
    const error = await response.json()
    console.error(`Failed to create plan for ${plan.name}:`, error)
    return null
  }

  const createdPlan = await response.json()
  console.log(`✅ Plan created for ${plan.name}:`, createdPlan.id)
  return createdPlan
}

async function setupWebhook(accessToken) {
  const webhookData = {
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/paypal/webhook`,
    event_types: [
      {
        name: 'BILLING.SUBSCRIPTION.ACTIVATED'
      },
      {
        name: 'BILLING.SUBSCRIPTION.CANCELLED'
      },
      {
        name: 'BILLING.SUBSCRIPTION.EXPIRED'
      },
      {
        name: 'BILLING.SUBSCRIPTION.SUSPENDED'
      },
      {
        name: 'PAYMENT.SALE.COMPLETED'
      },
      {
        name: 'PAYMENT.SALE.DENIED'
      }
    ]
  }

  const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v1/notifications/webhooks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(webhookData)
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to create webhook:', error)
    return null
  }

  const webhook = await response.json()
  console.log('✅ Webhook created:', webhook.id)
  return webhook
}

async function main() {
  try {
    console.log('🚀 Setting up PayPal Subscriptions...')
    console.log('Environment:', process.env.NODE_ENV || 'development')
    console.log('Base URL:', PAYPAL_CONFIG.BASE_URL)

    // Check credentials
    if (!PAYPAL_CONFIG.CLIENT_ID || !PAYPAL_CONFIG.CLIENT_SECRET) {
      throw new Error('Missing PayPal credentials. Please check your .env file.')
    }

    // Get access token
    console.log('🔑 Getting access token...')
    const accessToken = await getAccessToken()
    console.log('✅ Access token obtained')

    // Create products and plans
    const results = {}
    
    for (const [key, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
      console.log(`\n📦 Creating product and plan for ${plan.name}...`)
      
      // Create product
      const product = await createProduct(accessToken, plan)
      if (!product) continue
      
      // Create plan (skip for free plan)
      const createdPlan = await createPlan(accessToken, plan, product.id)
      if (!createdPlan) continue
      
      results[key] = {
        productId: product.id,
        planId: createdPlan.id,
        plan: plan
      }
    }

    // Create webhook
    console.log('\n🔔 Setting up webhook...')
    const webhook = await setupWebhook(accessToken)

    // Output configuration
    console.log('\n🎉 Setup complete! Here\'s your configuration:')
    console.log('\n📋 Add these to your .env file:')
    
    for (const [key, result] of Object.entries(results)) {
      console.log(`${key.toUpperCase()}_PRODUCT_ID=${result.productId}`)
      if (result.planId !== 'free-plan') {
        console.log(`${key.toUpperCase()}_PLAN_ID=${result.planId}`)
      } else {
        console.log(`${key.toUpperCase()}_PLAN_ID=free-plan`)
      }
    }
    
    if (webhook) {
      console.log(`WEBHOOK_ID=${webhook.id}`)
    }

    console.log('\n📚 Next steps:')
    console.log('1. Add the above IDs to your .env file')
    console.log('2. Update your subscription modal to use these plan IDs')
    console.log('3. Test the subscription flow')
    console.log('4. Monitor webhook events in your PayPal dashboard')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main } 