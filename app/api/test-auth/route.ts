import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Testing authentication...')
    
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
    
    // 从查询参数获取用户ID进行测试
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      console.log('👤 No user ID provided, testing service role connection...')
      
      // 测试服务角色连接
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
      
      if (listError) {
        console.error('❌ Service role connection failed:', listError)
        return NextResponse.json(
          { error: 'Service role connection failed', details: listError.message },
          { status: 500 }
        )
      }
      
      console.log('✅ Service role connection successful, found users:', users.length)
      
      return NextResponse.json({
        success: true,
        message: 'Service role connection successful',
        user_count: users.length
      })
    }
    
    // 验证指定用户
    console.log('👤 Verifying user with service role:', userId)
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    if (userError || !user) {
      console.error('❌ User verification failed:', userError)
      return NextResponse.json(
        { error: 'User not found', details: userError?.message },
        { status: 404 }
      )
    }
    
    console.log('✅ User verified:', { id: user.user.id, email: user.user.email })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.user.id,
        email: user.user.email
      }
    })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 