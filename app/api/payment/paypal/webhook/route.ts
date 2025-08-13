import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../../lib/supabase-server'
import { updatePaymentStatus, updateUserSubscription } from '../../../../../lib/supabase-auth'
import { PAYPAL_CONFIG } from '../../../../../lib/paypal-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = request.headers
    
    // Verify webhook signature (in production, you should verify the webhook)
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    const webhookEvent = JSON.parse(body)
    
    console.log('PayPal Webhook received:', webhookEvent.event_type)
    
    // Handle different webhook events
    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(webhookEvent)
        break
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(webhookEvent)
        break
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(webhookEvent)
        break
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(webhookEvent)
        break
      default:
        console.log('Unhandled webhook event:', webhookEvent.event_type)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCompleted(webhookEvent: any) {
  try {
    const capture = webhookEvent.resource
    const orderID = capture.supplementary_data?.related_ids?.order_id
    
    if (orderID) {
      // Update payment status
      await updatePaymentStatus(orderID, 'completed')
      
      // Get order details to update subscription
      const orderDetails = await getPayPalOrder(orderID)
      if (orderDetails) {
        const planId = orderDetails.purchase_units?.[0]?.custom_id
        const userId = orderDetails.purchase_units?.[0]?.reference_id
        
        if (planId && userId) {
          await updateUserSubscription(userId, planId)
        }
      }
    }
  } catch (error) {
    console.error('Payment completed webhook error:', error)
  }
}

async function handlePaymentDenied(webhookEvent: any) {
  try {
    const capture = webhookEvent.resource
    const orderID = capture.supplementary_data?.related_ids?.order_id
    
    if (orderID) {
      await updatePaymentStatus(orderID, 'denied')
    }
  } catch (error) {
    console.error('Payment denied webhook error:', error)
  }
}

async function handlePaymentRefunded(webhookEvent: any) {
  try {
    const capture = webhookEvent.resource
    const orderID = capture.supplementary_data?.related_ids?.order_id
    
    if (orderID) {
      await updatePaymentStatus(orderID, 'refunded')
      
      // You might want to revoke subscription access here
      // await revokeUserSubscription(userId)
    }
  } catch (error) {
    console.error('Payment refunded webhook error:', error)
  }
}

async function handleOrderApproved(webhookEvent: any) {
  try {
    const order = webhookEvent.resource
    const orderID = order.id
    
    // Order is approved but payment not yet captured
    // This is useful for logging purposes
    console.log('Order approved:', orderID)
  } catch (error) {
    console.error('Order approved webhook error:', error)
  }
}

async function getPayPalOrder(orderID: string) {
  try {
    const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v2/checkout/orders/${orderID}`, {
      headers: {
        'Authorization': `Bearer ${await getPayPalAccessToken()}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Get PayPal order error:', error)
  }
  
  return null
}

async function getPayPalAccessToken() {
  try {
    const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CONFIG.CLIENT_ID}:${PAYPAL_CONFIG.CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.access_token
    }
  } catch (error) {
    console.error('Get PayPal access token error:', error)
  }
  
  return null
} 