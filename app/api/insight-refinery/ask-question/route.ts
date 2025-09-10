import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { AskQuestionRequest, DiscussionResponse } from '@/lib/types/insight-refinery'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, question, context }: AskQuestionRequest = await request.json()
    
    if (!sessionId || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, question' },
        { status: 400 }
      )
    }

    // 使用导入的supabase实例
    
    // 获取会话信息
    const { data: session, error: sessionError } = await supabase
      .from('discussion_sessions')
      .select('id, report_id, user_id, status')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.status !== 'active') {
      return NextResponse.json(
        { error: 'Session is not active' },
        { status: 400 }
      )
    }

    // 获取报告信息
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, stock_name, stock_symbol, report_data')
      .eq('id', session.report_id)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // 获取历史对话上下文
    const { data: conversations } = await supabase
      .from('conversations')
      .select('user_question, ai_response, timestamp')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })
      .limit(10) // 最近10条对话

    // 构建上下文
    const reportContext = `
报告标题: ${report.stock_name} (${report.stock_symbol}) 估值分析报告
公司: ${report.stock_name} (${report.stock_symbol})
报告内容摘要: ${report.report_data.substring(0, 1000)}...
`

    const conversationHistory = conversations?.map((conv: any) => 
      `用户: ${conv.user_question}\nAI: ${conv.ai_response}`
    ).join('\n\n') || ''

    // 构建完整的上下文
    const fullContext = `
${reportContext}

历史对话:
${conversationHistory}

当前问题: ${question}
${context ? `\n补充上下文: ${context}` : ''}
`

    // 调用Sonar模型进行回答
    const sonarResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `你是一位专业的股票分析师助手，专门帮助用户深入分析研报内容。请基于提供的研报内容和历史对话，回答用户的问题。

要求：
1. 回答要专业、准确、有深度
2. 基于研报内容进行分析，不要编造信息
3. 如果问题超出研报范围，请说明并提供相关建议
4. 识别并标记重要的洞察点
5. 回答要简洁明了，但要有价值

请用中文回答。`
          },
          {
            role: 'user',
            content: fullContext
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        top_p: 0.9
      })
    })

    if (!sonarResponse.ok) {
      throw new Error('Failed to get AI response')
    }

    const sonarData = await sonarResponse.json()
    const aiResponse = sonarData.choices?.[0]?.message?.content || '抱歉，我无法回答这个问题。'

    // 判断是否为关键洞察
    const isKeyInsight = await analyzeInsightSignificance(question, aiResponse)

    // 保存对话记录
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { error: conversationError } = await supabase
      .from('conversations')
      .insert([{
        id: conversationId,
        session_id: sessionId,
        user_question: question,
        ai_response: aiResponse,
        timestamp: new Date(),
        is_key_insight: isKeyInsight
      }])

    if (conversationError) {
      console.error('Error saving conversation:', conversationError)
    }

    // 更新会话统计
    await supabase
      .from('discussion_sessions')
      .update({
        total_questions: session.total_questions + 1,
        key_insights_count: isKeyInsight ? (session.key_insights_count + 1) : session.key_insights_count
      })
      .eq('id', sessionId)

    // 生成建议的后续问题
    const suggestedFollowUp = await generateFollowUpQuestions(question, aiResponse, reportContext)

    const response: DiscussionResponse = {
      sessionId,
      conversationId,
      aiResponse,
      isKeyInsight,
      suggestedFollowUp
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in ask-question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 分析洞察重要性
async function analyzeInsightSignificance(question: string, response: string): Promise<boolean> {
  // 简单的关键词匹配，实际应用中可以使用更复杂的NLP模型
  const insightKeywords = [
    '关键', '重要', '核心', '主要', '显著', '突出',
    '风险', '机会', '增长', '盈利', '估值', '竞争',
    '战略', '市场', '财务', '投资', '建议'
  ]
  
  const questionInsight = insightKeywords.some(keyword => 
    question.includes(keyword)
  )
  
  const responseInsight = insightKeywords.some(keyword => 
    response.includes(keyword)
  )
  
  return questionInsight || responseInsight
}

// 生成后续问题建议
async function generateFollowUpQuestions(question: string, response: string, context: string): Promise<string[]> {
  // 这里可以调用AI生成更智能的后续问题
  // 暂时返回一些通用建议
  return [
    '这个分析对投资决策有什么影响？',
    '还有哪些相关风险需要考虑？',
    '这个趋势在未来会如何发展？',
    '与同行业其他公司相比如何？'
  ]
}
