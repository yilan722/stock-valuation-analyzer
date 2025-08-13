// PayPal Configuration
export const PAYPAL_CONFIG = {
  // Client credentials
  CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || '',
  
  // Environment
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // API endpoints
  SANDBOX_BASE_URL: 'https://api-m.sandbox.paypal.com',
  PRODUCTION_BASE_URL: 'https://api-m.paypal.com',
  
  // Get base URL based on environment
  get BASE_URL() {
    return this.IS_PRODUCTION ? this.PRODUCTION_BASE_URL : this.SANDBOX_BASE_URL
  },
  
  // Currency
  DEFAULT_CURRENCY: 'USD',
  
  // Intent
  DEFAULT_INTENT: 'CAPTURE' as const,
  
  // Return URLs
  get RETURN_URL() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return `${baseUrl}/payment/success`
  },
  
  get CANCEL_URL() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return `${baseUrl}/payment/cancel`
  },

  // Subscription specific URLs
  get SUBSCRIPTION_RETURN_URL() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return `${baseUrl}/subscription/success`
  },

  get SUBSCRIPTION_CANCEL_URL() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return `${baseUrl}/subscription/cancel`
  }
}

// PayPal API endpoints
export const PAYPAL_ENDPOINTS = {
  // OAuth
  OAUTH_TOKEN: '/v1/oauth2/token',
  
  // Checkout (for one-time payments)
  CREATE_ORDER: '/v2/checkout/orders',
  CAPTURE_ORDER: (orderId: string) => `/v2/checkout/orders/${orderId}/capture`,
  GET_ORDER: (orderId: string) => `/v2/checkout/orders/${orderId}`,
  
  // Subscriptions
  CREATE_PRODUCT: '/v1/catalogs/products',
  CREATE_PLAN: '/v1/billing/plans',
  CREATE_SUBSCRIPTION: '/v1/billing/subscriptions',
  GET_SUBSCRIPTION: (subscriptionId: string) => `/v1/billing/subscriptions/${subscriptionId}`,
  ACTIVATE_SUBSCRIPTION: (subscriptionId: string) => `/v1/billing/subscriptions/${subscriptionId}/activate`,
  CANCEL_SUBSCRIPTION: (subscriptionId: string) => `/v1/billing/subscriptions/${subscriptionId}/cancel`,
  
  // Webhooks
  CREATE_WEBHOOK: '/v1/notifications/webhooks',
  LIST_WEBHOOKS: '/v1/notifications/webhooks',
  
  // Refunds
  REFUND_PAYMENT: (captureId: string) => `/v2/payments/captures/${captureId}/refund`
}

// PayPal order status
export const PAYPAL_ORDER_STATUS = {
  CREATED: 'CREATED',
  SAVED: 'SAVED',
  APPROVED: 'APPROVED',
  VOIDED: 'VOIDED',
  COMPLETED: 'COMPLETED'
} as const

// PayPal subscription status
export const PAYPAL_SUBSCRIPTION_STATUS = {
  APPROVAL_PENDING: 'APPROVAL_PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
} as const

// PayPal payment status
export const PAYPAL_PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  DECLINED: 'DECLINED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  REFUNDED: 'REFUNDED'
} as const

// PayPal error codes
export const PAYPAL_ERROR_CODES = {
  INSTRUMENT_DECLINED: 'INSTRUMENT_DECLINED',
  PAYER_ACCOUNT_RESTRICTED: 'PAYER_ACCOUNT_RESTRICTED',
  PAYER_CANNOT_PAY: 'PAYER_CANNOT_PAY',
  TRANSACTION_REFUSED: 'TRANSACTION_REFUSED',
  ORDER_ALREADY_CAPTURED: 'ORDER_ALREADY_CAPTURED'
} as const

// Subscription plans configuration - Updated based on UI design
export const SUBSCRIPTION_PLANS = {
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