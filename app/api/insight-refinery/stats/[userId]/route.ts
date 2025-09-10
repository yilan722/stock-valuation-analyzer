import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // 使用导入的supabase实例
    
    // 获取统计数据
    const [
      { data: folders, error: foldersError },
      { data: reports, error: reportsError },
      { data: discussions, error: discussionsError },
      { data: activeSessions, error: activeSessionsError },
      { data: insightRefineryReports, error: insightRefineryError }
    ] = await Promise.all([
      // 文件夹数量
      supabase
        .from('report_folders')
        .select('id', { count: 'exact' }),
      
      // 总报告数量
      supabase
        .from('reports')
        .select('id', { count: 'exact' })
        .eq('user_id', userId),
      
      // 讨论会话数量
      supabase
        .from('discussion_sessions')
        .select('id', { count: 'exact' })
        .eq('user_id', userId),
      
      // 活跃会话数量
      supabase
        .from('discussion_sessions')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'active'),
      
      // Insight Refinery 报告数量
      supabase
        .from('reports')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_insight_refinery_enhanced', true)
    ])

    if (foldersError || reportsError || discussionsError || activeSessionsError || insightRefineryError) {
      console.error('Error fetching stats:', {
        foldersError,
        reportsError,
        discussionsError,
        activeSessionsError,
        insightRefineryError
      })
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    const stats = {
      totalFolders: folders?.length || 0,
      totalReports: reports?.length || 0,
      totalDiscussions: discussions?.length || 0,
      activeSessions: activeSessions?.length || 0,
      insightRefineryReports: insightRefineryReports?.length || 0
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error in stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
