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
      .select('original_report_id, company_name, ticker')
      .eq('id', folderId)
      .single()

    if (folderError || !folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // 获取该文件夹下的所有报告版本
    const { data: versions, error: versionsError } = await supabase
      .from('reports')
      .select(`
        id,
        title,
        is_insight_refinery_enhanced,
        created_at,
        generation_model,
        parent_report_id
      `)
      .or(`id.eq.${folder.original_report_id},parent_report_id.eq.${folder.original_report_id}`)
      .order('created_at', { ascending: true })

    if (versionsError) {
      console.error('Error fetching versions:', versionsError)
      return NextResponse.json(
        { error: 'Failed to fetch versions' },
        { status: 500 }
      )
    }

    // 为每个版本生成版本号
    const versionsWithNumbers = (versions || []).map((version: any, index: number) => ({
      ...version,
      version: version.parent_report_id ? `v${index}.0` : 'v1.0'
    }))

    return NextResponse.json(versionsWithNumbers)

  } catch (error) {
    console.error('Error in versions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
