import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '../../../lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 测试数据库连接...')
    
    const supabase = createApiSupabaseClient(request)
    
    // 测试基本连接
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ 数据库连接测试失败:', testError)
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: testError.message,
          code: testError.code
        },
        { status: 500 }
      )
    }
    
    console.log('✅ 数据库连接测试成功')
    
    // 测试reports表
    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .select('count')
      .limit(1)
    
    if (reportsError) {
      console.error('❌ reports表测试失败:', reportsError)
      return NextResponse.json(
        { 
          error: 'Reports table test failed',
          details: reportsError.message,
          code: reportsError.code
        },
        { status: 500 }
      )
    }
    
    console.log('✅ reports表测试成功')
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection and tables are working',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
