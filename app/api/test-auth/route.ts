import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../lib/supabase-server.ts'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // 测试获取用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // 测试获取会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    return NextResponse.json({
      success: true,
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      } : null,
      session: session ? {
        access_token: session.access_token ? 'Present' : 'Missing',
        refresh_token: session.refresh_token ? 'Present' : 'Missing',
        expires_at: session.expires_at
      } : null,
      userError: userError?.message || null,
      sessionError: sessionError?.message || null,
      cookies: request.headers.get('cookie')?.substring(0, 100) + '...'
    })
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 