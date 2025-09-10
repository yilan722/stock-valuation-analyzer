import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const { folderId } = params
    
    if (!folderId) {
      return NextResponse.json(
        { error: 'Missing folderId parameter' },
        { status: 400 }
      )
    }

    // 使用导入的supabase实例
    
    // 获取文件夹信息
    const { data: folder, error: folderError } = await supabase
      .from('report_folders')
      .select('original_report_id')
      .eq('id', folderId)
      .single()

    if (folderError || !folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // 获取该文件夹下所有报告的讨论会话
    const { data: discussions, error: discussionsError } = await supabase
      .from('discussion_sessions')
      .select(`
        id,
        report_id,
        total_questions,
        key_insights_count,
        status,
        session_start,
        session_end
      `)
      .eq('report_id', folder.original_report_id)
      .order('session_start', { ascending: false })

    if (discussionsError) {
      console.error('Error fetching discussions:', discussionsError)
      return NextResponse.json(
        { error: 'Failed to fetch discussions' },
        { status: 500 }
      )
    }

    return NextResponse.json(discussions || [])

  } catch (error) {
    console.error('Error in discussions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
