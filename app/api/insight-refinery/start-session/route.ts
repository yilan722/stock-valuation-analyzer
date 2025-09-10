import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { StartSessionRequest, DiscussionSession } from '@/lib/types/insight-refinery'

export async function POST(request: NextRequest) {
  try {
    const { reportId, userId, reportData }: any = await request.json()
    
    if (!reportId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: reportId, userId' },
        { status: 400 }
      )
    }

    // 使用导入的supabase实例
    
    // 验证用户权限和报告存在性
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, user_id, stock_name, stock_symbol, report_data')
      .eq('id', reportId)
      .eq('user_id', userId)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found or access denied' },
        { status: 404 }
      )
    }

    // 创建新的讨论会话
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newSession: Omit<DiscussionSession, 'id'> = {
      reportId,
      userId,
      sessionStart: new Date(),
      totalQuestions: 0,
      keyInsightsCount: 0,
      status: 'active'
    }

    const { data: session, error: sessionError } = await supabase
      .from('discussion_sessions')
      .insert([{ id: sessionId, ...newSession }])
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating discussion session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create discussion session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      reportTitle: `${report.stock_name} (${report.stock_symbol}) 估值分析报告`,
      message: 'Discussion session started successfully'
    })

  } catch (error) {
    console.error('Error in start-session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
