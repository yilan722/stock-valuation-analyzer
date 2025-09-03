import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 存储正在生成的报告状态
const reportGenerationStatus = new Map<string, {
  status: 'generating' | 'completed' | 'failed',
  progress: number,
  result?: any,
  error?: string,
  startTime: number
}>()

export async function POST(request: NextRequest) {
  try {
    const { stockData, locale = 'zh', userId } = await request.json()
    
    // 生成唯一的报告ID
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 初始化报告状态
    reportGenerationStatus.set(reportId, {
      status: 'generating',
      progress: 0,
      startTime: Date.now()
    })
    
    // 立即返回报告ID，让前端开始轮询
    return NextResponse.json({
      reportId,
      status: 'started',
      message: '报告生成已开始，请稍后查询结果',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('启动报告生成失败:', error)
    return NextResponse.json({
      error: '启动报告生成失败',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('reportId')
    
    if (!reportId) {
      return NextResponse.json({
        error: 'Missing reportId parameter'
      }, { status: 400 })
    }
    
    const status = reportGenerationStatus.get(reportId)
    
    if (!status) {
      return NextResponse.json({
        error: 'Report not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      reportId,
      ...status,
      elapsedTime: Date.now() - status.startTime
    })
    
  } catch (error) {
    console.error('查询报告状态失败:', error)
    return NextResponse.json({
      error: '查询报告状态失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
