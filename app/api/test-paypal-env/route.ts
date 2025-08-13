import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const paypalClientId = process.env.PAYPAL_CLIENT_ID
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET
    const nextPublicPaypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    const nodeEnv = process.env.NODE_ENV
    
    return NextResponse.json({
      success: true,
      paypalClientId: paypalClientId ? `${paypalClientId.substring(0, 20)}...` : 'NOT_SET',
      paypalClientSecret: paypalClientSecret ? `${paypalClientSecret.substring(0, 20)}...` : 'NOT_SET',
      nextPublicPaypalClientId: nextPublicPaypalClientId ? `${nextPublicPaypalClientId.substring(0, 20)}...` : 'NOT_SET',
      nodeEnv: nodeEnv || 'NOT_SET',
      hasClientId: !!paypalClientId,
      hasClientSecret: !!paypalClientSecret,
      clientIdLength: paypalClientId?.length || 0,
      secretLength: paypalClientSecret?.length || 0
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 