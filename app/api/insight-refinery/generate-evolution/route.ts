import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { GenerateEvolutionRequest, EvolutionResponse } from '@/lib/types/insight-refinery'

export async function POST(request: NextRequest) {
  try {
    const { originalReportId, synthesisId, customPrompt }: GenerateEvolutionRequest = await request.json()
    
    if (!originalReportId || !synthesisId) {
      return NextResponse.json(
        { error: 'Missing required fields: originalReportId, synthesisId' },
        { status: 400 }
      )
    }

    // 使用导入的supabase实例
    
    // 获取原始报告
    const { data: originalReport, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', originalReportId)
      .single()

    if (reportError || !originalReport) {
      return NextResponse.json(
        { error: 'Original report not found' },
        { status: 404 }
      )
    }

    // 获取洞察合成结果
    const { data: synthesis, error: synthesisError } = await supabase
      .from('insight_synthesis')
      .select('*')
      .eq('id', synthesisId)
      .single()

    if (synthesisError || !synthesis) {
      return NextResponse.json(
        { error: 'Synthesis not found' },
        { status: 404 }
      )
    }

    // 检查用户剩余研报生成次数
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('remaining_reports')
      .eq('id', originalReport.user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.remaining_reports <= 0) {
      return NextResponse.json(
        { error: 'Insufficient report generation credits' },
        { status: 402 }
      )
    }

    // 构建增强版提示词
    const enhancedPrompt = customPrompt || synthesis.synthesis_prompt

    // 调用Sonar-Deep-Research生成增强版报告
    const evolutionResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-deep-research',
        messages: [
          {
            role: 'system',
            content: `你是一位专业的股票分析师，具备投资银行级别的深度研究能力。请基于原始研报和讨论洞察，生成一份增强版的深度分析报告。

报告结构要求：
1. 保持原始报告的基本结构（基本面分析、业务板块、增长催化剂、估值分析）
2. 整合讨论中产生的新观点和洞察
3. 补充讨论中识别的信息缺口
4. 保持专业性和准确性
5. 使用HTML格式，包含专业样式类名

请生成一份全面、详细、专业的增强版研报。`
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 15000,
        temperature: 0.05,
        search_queries: true,
        search_recency_filter: 'month',
        return_citations: true,
        top_p: 0.9,
        presence_penalty: 0.15
      })
    })

    if (!evolutionResponse.ok) {
      throw new Error('Failed to generate evolution report')
    }

    const evolutionData = await evolutionResponse.json()
    const evolutionContent = evolutionData.choices?.[0]?.message?.content || ''

    // 解析生成的报告内容
    let parsedContent
    try {
      const jsonMatch = evolutionContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0])
      } else {
        // 如果解析失败，使用原始内容
        parsedContent = {
          fundamentalAnalysis: evolutionContent,
          businessSegments: '',
          growthCatalysts: '',
          valuationAnalysis: ''
        }
      }
    } catch (parseError) {
      parsedContent = {
        fundamentalAnalysis: evolutionContent,
        businessSegments: '',
        growthCatalysts: '',
        valuationAnalysis: ''
      }
    }

    // 生成版本号
    const versionNumber = await getNextVersionNumber(originalReportId)
    const version = `v${versionNumber}.0`
    
    // 生成标题
    const timestamp = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const title = `${originalReport.title} - Insight Refinery Enhanced ${version} - ${timestamp}`

    // 保存进化版报告
    const evolutionId = `evolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { error: evolutionError } = await supabase
      .from('reports')
      .insert([{
        id: evolutionId,
        user_id: originalReport.user_id,
        company_name: originalReport.company_name,
        ticker: originalReport.ticker,
        title: title,
        content: JSON.stringify(parsedContent),
        generation_model: 'sonar-deep-research',
        is_insight_refinery_enhanced: true,
        parent_report_id: originalReportId,
        created_at: new Date(),
        generation_cost: 2.0 // 估算成本
      }])

    if (evolutionError) {
      console.error('Error saving evolution report:', evolutionError)
      return NextResponse.json(
        { error: 'Failed to save evolution report' },
        { status: 500 }
      )
    }

    // 更新用户剩余次数
    await supabase
      .from('users')
      .update({ remaining_reports: user.remaining_reports - 1 })
      .eq('id', originalReport.user_id)

    // 更新报告文件夹
    await updateReportFolder(originalReportId, evolutionId)

    const response: EvolutionResponse = {
      evolutionId,
      version,
      title,
      content: JSON.stringify(parsedContent),
      generationCost: 2.0,
      estimatedTime: 0
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in generate-evolution:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 获取下一个版本号
async function getNextVersionNumber(originalReportId: string): Promise<number> {
  // 使用导入的supabase实例
  
  const { data: evolutions, error } = await supabase
    .from('reports')
    .select('title')
    .eq('parent_report_id', originalReportId)
    .eq('is_insight_refinery_enhanced', true)
    .order('created_at', { ascending: false })

  if (error || !evolutions) {
    return 2 // 第一个进化版本
  }

  // 从标题中提取版本号
  const versionNumbers = evolutions
    .map((report: any) => {
      const match = report.title.match(/v(\d+)\.0/)
      return match ? parseInt(match[1]) : 0
    })
    .filter((num: number) => num > 0)

  return versionNumbers.length > 0 ? Math.max(...versionNumbers) + 1 : 2
}

// 更新报告文件夹
async function updateReportFolder(originalReportId: string, evolutionId: string) {
  // 使用导入的supabase实例
  
  // 查找或创建报告文件夹
  const { data: originalReport } = await supabase
    .from('reports')
    .select('company_name, ticker')
    .eq('id', originalReportId)
    .single()

  if (!originalReport) return

  const { data: folder, error: folderError } = await supabase
    .from('report_folders')
    .select('*')
    .eq('company_name', originalReport.company_name)
    .eq('ticker', originalReport.ticker)
    .single()

  if (folderError || !folder) {
    // 创建新文件夹
    await supabase
      .from('report_folders')
      .insert([{
        id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        company_name: originalReport.company_name,
        ticker: originalReport.ticker,
        original_report_id: originalReportId,
        latest_version_id: evolutionId,
        total_versions: 2,
        total_discussions: 0,
        last_activity: new Date(),
        created_at: new Date()
      }])
  } else {
    // 更新现有文件夹
    await supabase
      .from('report_folders')
      .update({
        latest_version_id: evolutionId,
        total_versions: folder.total_versions + 1,
        last_activity: new Date()
      })
      .eq('id', folder.id)
  }
}
