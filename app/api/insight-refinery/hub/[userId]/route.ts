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
    
    // 获取用户的所有报告文件夹
    const { data: folders, error: foldersError } = await supabase
      .from('report_folders')
      .select(`
        id,
        company_name,
        ticker,
        original_report_id,
        latest_version_id,
        total_versions,
        total_discussions,
        last_activity,
        created_at
      `)
      .order('last_activity', { ascending: false })

    if (foldersError) {
      console.error('Error fetching folders:', foldersError)
      return NextResponse.json(
        { error: 'Failed to fetch folders' },
        { status: 500 }
      )
    }

    return NextResponse.json({ folders: folders || [] })

  } catch (error) {
    console.error('Error in hub API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
