import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CompareVersionsRequest, ComparisonResponse } from '@/lib/types/insight-refinery'

export async function POST(request: NextRequest) {
  try {
    const { originalReportId, evolvedReportId }: CompareVersionsRequest = await request.json()
    
    if (!originalReportId || !evolvedReportId) {
      return NextResponse.json(
        { error: 'Missing required fields: originalReportId, evolvedReportId' },
        { status: 400 }
      )
    }

    // 使用导入的supabase实例
    
    // 获取两个报告的内容
    const { data: originalReport, error: originalError } = await supabase
      .from('reports')
      .select('id, title, content, created_at')
      .eq('id', originalReportId)
      .single()

    const { data: evolvedReport, error: evolvedError } = await supabase
      .from('reports')
      .select('id, title, content, created_at')
      .eq('id', evolvedReportId)
      .single()

    if (originalError || !originalReport || evolvedError || !evolvedReport) {
      return NextResponse.json(
        { error: 'One or both reports not found' },
        { status: 404 }
      )
    }

    // 解析报告内容
    let originalContent, evolvedContent
    try {
      originalContent = typeof originalReport.content === 'string' 
        ? JSON.parse(originalReport.content) 
        : originalReport.content
      evolvedContent = typeof evolvedReport.content === 'string' 
        ? JSON.parse(evolvedReport.content) 
        : evolvedReport.content
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Failed to parse report content' },
        { status: 500 }
      )
    }

    // 执行差异分析
    const diffAnalysis = await analyzeReportDifferences(originalContent, evolvedContent)
    
    // 计算相似度
    const similarityScore = await calculateSimilarity(originalContent, evolvedContent)
    
    // 识别主要变化
    const majorChanges = identifyMajorChanges(diffAnalysis.highlightedChanges)

    // 保存变更追踪记录
    const changeTrackingId = `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { error: trackingError } = await supabase
      .from('change_tracking')
      .insert([{
        id: changeTrackingId,
        original_report_id: originalReportId,
        evolved_report_id: evolvedReportId,
        diff_summary: diffAnalysis.summary,
        highlighted_changes: diffAnalysis.highlightedChanges,
        evolution_type: 'insight_refinery',
        similarity_score: similarityScore,
        created_at: new Date()
      }])

    if (trackingError) {
      console.error('Error saving change tracking:', trackingError)
    }

    const response: ComparisonResponse = {
      changeTrackingId,
      diffSummary: diffAnalysis.summary,
      highlightedChanges: diffAnalysis.highlightedChanges,
      similarityScore,
      majorChanges
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in compare-versions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 分析报告差异
async function analyzeReportDifferences(originalContent: any, evolvedContent: any): Promise<{
  summary: string
  highlightedChanges: any[]
}> {
  const sections = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis']
  const highlightedChanges: any[] = []
  let totalChanges = 0

  for (const section of sections) {
    const originalSection = originalContent[section] || ''
    const evolvedSection = evolvedContent[section] || ''
    
    if (originalSection !== evolvedSection) {
      const changes = await analyzeSectionChanges(section, originalSection, evolvedSection)
      highlightedChanges.push(...changes)
      totalChanges += changes.length
    }
  }

  const summary = `发现 ${totalChanges} 处变更，涉及 ${sections.filter(section => 
    originalContent[section] !== evolvedContent[section]
  ).length} 个主要部分`

  return { summary, highlightedChanges }
}

// 分析单个部分的变更
async function analyzeSectionChanges(
  section: string, 
  originalContent: string, 
  evolvedContent: string
): Promise<any[]> {
  const changes: any[] = []
  
  // 简单的文本比较逻辑
  const originalLines = originalContent.split('\n').filter(line => line.trim())
  const evolvedLines = evolvedContent.split('\n').filter(line => line.trim())
  
  const maxLines = Math.max(originalLines.length, evolvedLines.length)
  
  for (let i = 0; i < maxLines; i++) {
    const originalLine = originalLines[i] || ''
    const evolvedLine = evolvedLines[i] || ''
    
    if (originalLine !== evolvedLine) {
      const changeId = `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      if (!originalLine && evolvedLine) {
        // 新增内容
        changes.push({
          id: changeId,
          type: 'added',
          section,
          newContent: evolvedLine,
          significance: determineSignificance(evolvedLine),
          description: `在${getSectionName(section)}中新增内容`
        })
      } else if (originalLine && !evolvedLine) {
        // 删除内容
        changes.push({
          id: changeId,
          type: 'removed',
          section,
          originalContent: originalLine,
          significance: determineSignificance(originalLine),
          description: `从${getSectionName(section)}中删除内容`
        })
      } else {
        // 修改内容
        changes.push({
          id: changeId,
          type: 'modified',
          section,
          originalContent: originalLine,
          newContent: evolvedLine,
          significance: determineSignificance(evolvedLine),
          description: `在${getSectionName(section)}中修改内容`
        })
      }
    }
  }
  
  return changes
}

// 确定变更重要性
function determineSignificance(content: string): 'low' | 'medium' | 'high' | 'critical' {
  const criticalKeywords = ['风险', '机会', '投资建议', '目标价', '估值', '关键']
  const highKeywords = ['重要', '主要', '核心', '显著', '突出']
  const mediumKeywords = ['分析', '数据', '趋势', '增长', '盈利']
  
  if (criticalKeywords.some(keyword => content.includes(keyword))) {
    return 'critical'
  } else if (highKeywords.some(keyword => content.includes(keyword))) {
    return 'high'
  } else if (mediumKeywords.some(keyword => content.includes(keyword))) {
    return 'medium'
  } else {
    return 'low'
  }
}

// 获取部分名称
function getSectionName(section: string): string {
  const sectionNames: { [key: string]: string } = {
    'fundamentalAnalysis': '基本面分析',
    'businessSegments': '业务板块',
    'growthCatalysts': '增长催化剂',
    'valuationAnalysis': '估值分析'
  }
  return sectionNames[section] || section
}

// 计算相似度
async function calculateSimilarity(originalContent: any, evolvedContent: any): Promise<number> {
  // 简单的相似度计算，实际应用中可以使用更复杂的算法
  const sections = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis']
  let totalSimilarity = 0
  let sectionCount = 0
  
  for (const section of sections) {
    const original = originalContent[section] || ''
    const evolved = evolvedContent[section] || ''
    
    if (original || evolved) {
      const similarity = calculateTextSimilarity(original, evolved)
      totalSimilarity += similarity
      sectionCount++
    }
  }
  
  return sectionCount > 0 ? totalSimilarity / sectionCount : 0
}

// 计算文本相似度
function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 && !text2) return 1
  if (!text1 || !text2) return 0
  
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)
  
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}

// 识别主要变化
function identifyMajorChanges(highlightedChanges: any[]): string[] {
  const majorChanges: string[] = []
  
  // 按重要性分组
  const criticalChanges = highlightedChanges.filter(c => c.significance === 'critical')
  const highChanges = highlightedChanges.filter(c => c.significance === 'high')
  
  if (criticalChanges.length > 0) {
    majorChanges.push(`发现 ${criticalChanges.length} 处关键变更`)
  }
  
  if (highChanges.length > 0) {
    majorChanges.push(`发现 ${highChanges.length} 处重要变更`)
  }
  
  // 按类型分组
  const addedChanges = highlightedChanges.filter(c => c.type === 'added')
  const modifiedChanges = highlightedChanges.filter(c => c.type === 'modified')
  const removedChanges = highlightedChanges.filter(c => c.type === 'removed')
  
  if (addedChanges.length > 0) {
    majorChanges.push(`新增 ${addedChanges.length} 处内容`)
  }
  
  if (modifiedChanges.length > 0) {
    majorChanges.push(`修改 ${modifiedChanges.length} 处内容`)
  }
  
  if (removedChanges.length > 0) {
    majorChanges.push(`删除 ${removedChanges.length} 处内容`)
  }
  
  return majorChanges
}
