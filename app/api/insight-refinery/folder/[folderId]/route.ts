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
      .eq('id', folderId)
      .single()

    if (folderError || !folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(folder)

  } catch (error) {
    console.error('Error in folder API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
