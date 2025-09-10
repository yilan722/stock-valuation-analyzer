import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '../../../../lib/supabase-server'

// 强制动态渲染，因为使用了request和数据库操作
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    console.log('📊 开始获取单个报告...')
    
    const supabase = createApiSupabaseClient(request)
    const { reportId } = params
    
    if (!reportId) {
      console.log('❌ 缺少报告ID参数')
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      )
    }
    
    console.log('🔍 获取报告，报告ID:', reportId)
    
    // 从数据库获取单个报告
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()
    
    if (error) {
      console.error('❌ 获取报告失败:', error)
      return NextResponse.json(
        { error: 'Failed to fetch report', details: error.message },
        { status: 500 }
      )
    }
    
    if (!report) {
      console.log('❌ 报告不存在')
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ 成功获取报告:', report.stock_name)
    
    return NextResponse.json({
      success: true,
      data: report,
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



