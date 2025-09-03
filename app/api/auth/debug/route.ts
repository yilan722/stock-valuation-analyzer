import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../lib/supabase-server'

// 强制动态渲染，因为使用了request.headers
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie')
    const supabase = createServerSupabaseClient()
    
    console.log('Debug - All cookies:', cookies)
    
    // 尝试获取用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // 尝试获取会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    return NextResponse.json({
      success: true,
      cookies: cookies ? 'Present' : 'Missing',
      cookieCount: cookies ? cookies.split(';').length : 0,
      cookieNames: cookies ? cookies.split(';').map(c => c.trim().split('=')[0]) : [],
      user: user ? { id: user.id, email: user.email } : null,
      session: session ? { access_token: session.access_token ? 'Present' : 'Missing' } : null,
      authError: authError?.message || null,
      sessionError: sessionError?.message || null
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 