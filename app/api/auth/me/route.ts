import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userSession = verifyToken(token)
    if (!userSession) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const user = await getUserById(userSession.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        freeReportsUsed: user.freeReportsUsed,
        paidReportsUsed: user.paidReportsUsed,
        subscriptionType: user.subscriptionType,
        subscriptionEnd: user.subscriptionEnd,
        monthlyReportLimit: user.monthlyReportLimit
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 