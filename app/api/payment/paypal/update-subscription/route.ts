import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../../lib/supabase-server'
import { updateUserSubscription } from '../../../../../lib/supabase-auth'

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

    const { userId, planId, orderID, amount } = await request.json()

    if (!userId || !planId || !orderID || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify user owns this subscription
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update user subscription
    await updateUserSubscription(userId, planId)

    // Update payment record with PayPal order ID
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: 'completed',
        paypal_order_id: orderID,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('subscription_type', planId)

    if (updateError) {
      console.error('Payment update error:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully'
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 