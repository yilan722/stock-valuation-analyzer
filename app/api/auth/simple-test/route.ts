import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染，因为使用了request.headers
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 检查请求头中的cookie
    const cookies = request.headers.get('cookie')
    
    console.log('Simple test - Cookies:', cookies?.substring(0, 200) + '...')
    
    return NextResponse.json({
      success: true,
      cookies: cookies ? 'Present' : 'Missing',
      cookieCount: cookies ? cookies.split(';').length : 0
    })
  } catch (error) {
    console.error('Simple test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 