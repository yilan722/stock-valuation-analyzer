import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '../../../lib/supabase-server'

// 强制动态渲染，因为使用了request和数据库操作
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 开始获取用户报告...')
    
    const supabase = createApiSupabaseClient(request)
    
    // 从查询参数获取用户ID
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      console.log('❌ 缺少用户ID参数')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    console.log('🔍 获取用户报告，用户ID:', userId)
    
    // 从数据库获取用户报告
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ 获取报告失败:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('✅ 成功获取报告，数量:', reports?.length || 0)
    
    return NextResponse.json({
      success: true,
      data: reports || [],
      count: reports?.length || 0,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 获取报告过程中发生错误:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// 可选：添加POST方法来创建新报告
export async function POST(request: NextRequest) {
  try {
    console.log('📝 开始创建新报告...')
    
    const supabase = createApiSupabaseClient(request)
    
    // 获取请求体
    const body = await request.json()
    const { userId, stockSymbol, stockName, reportData } = body
    
    if (!userId || !stockSymbol || !stockName || !reportData) {
      console.log('❌ 缺少必要参数')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    console.log('🔍 创建报告:', { userId, stockSymbol, stockName })
    
    // 插入新报告到数据库
    const { data: newReport, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        stock_symbol: stockSymbol,
        stock_name: stockName,
        report_data: JSON.stringify(reportData),
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ 创建报告失败:', error)
      return NextResponse.json(
        { error: 'Failed to create report', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('✅ 报告创建成功，ID:', newReport.id)
    
    return NextResponse.json({
      success: true,
      data: newReport,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 创建报告过程中发生错误:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
