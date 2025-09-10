import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SynthesizeInsightsRequest, SynthesisResponse } from '@/lib/types/insight-refinery'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, includeAllConversations = true, customInstructions }: SynthesizeInsightsRequest = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      )
    }

    // 使用导入的supabase实例
    
    // 获取会话信息和报告内容
    const { data: session, error: sessionError } = await supabase
      .from('discussion_sessions')
      .select(`
        id, report_id, user_id, total_questions, key_insights_count,
        reports!inner(id, title, content, company_name, ticker)
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // 获取所有对话记录
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('user_question, ai_response, is_key_insight, insight_category, timestamp')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })

    if (conversationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json(
        { error: 'No conversations found for synthesis' },
        { status: 400 }
      )
    }

    // 构建对话摘要
    const conversationSummary = conversations.map((conv: any, index: number) => 
      `对话 ${index + 1}:\n问题: ${conv.user_question}\n回答: ${conv.ai_response}\n${conv.is_key_insight ? '[关键洞察]' : ''}\n`
    ).join('\n')

    // 构建原始报告摘要
    const reportSummary = `
原始报告信息:
- 标题: ${session.reports.title}
- 公司: ${session.reports.company_name} (${session.reports.ticker})
- 内容摘要: ${session.reports.content.substring(0, 2000)}...
`

    // 调用AI进行洞察合成
    const synthesisPrompt = `
请基于以下讨论内容，生成一份综合洞察报告：

${reportSummary}

讨论记录:
${conversationSummary}

请分析并提取：
1. 讨论摘要 - 总结整个讨论的核心要点
2. 提出的关键问题 - 列出讨论中提出的重要问题
3. 新观点 - 从讨论中产生的新见解和角度
4. 信息缺口 - 识别讨论中暴露的信息不足或需要进一步研究的问题

${customInstructions ? `\n额外要求: ${customInstructions}` : ''}

请以结构化的JSON格式返回结果。
`

    const synthesisResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `你是一位专业的投资研究分析师，擅长从讨论中提取关键洞察。请分析讨论内容，提取有价值的观点和信息，并生成结构化的洞察报告。

要求：
1. 保持客观和专业
2. 识别真正有价值的洞察
3. 避免重复和冗余
4. 突出新的观点和角度
5. 识别信息缺口和需要进一步研究的问题

请用中文回答，并以JSON格式返回结果。`
          },
          {
            role: 'user',
            content: synthesisPrompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.2,
        top_p: 0.9
      })
    })

    if (!synthesisResponse.ok) {
      throw new Error('Failed to synthesize insights')
    }

    const synthesisData = await synthesisResponse.json()
    const synthesisContent = synthesisData.choices?.[0]?.message?.content || ''

    // 解析AI返回的JSON结果
    let parsedSynthesis
    try {
      // 尝试提取JSON部分
      const jsonMatch = synthesisContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedSynthesis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // 如果解析失败，使用默认结构
      parsedSynthesis = {
        discussionSummary: synthesisContent.substring(0, 500),
        keyQuestionsRaised: ['需要进一步分析的问题'],
        newPerspectives: ['讨论中产生的新观点'],
        missingInformationGaps: ['需要补充的信息']
      }
    }

    // 生成综合提示词，用于后续的报告进化
    const evolutionPrompt = `
基于以下原始研报和讨论洞察，生成一份增强版的研报：

原始研报: ${session.reports.title}
${session.reports.content.substring(0, 1000)}...

讨论洞察:
- 讨论摘要: ${parsedSynthesis.discussionSummary}
- 关键问题: ${parsedSynthesis.keyQuestionsRaised?.join(', ') || '无'}
- 新观点: ${parsedSynthesis.newPerspectives?.join(', ') || '无'}
- 信息缺口: ${parsedSynthesis.missingInformationGaps?.join(', ') || '无'}

请将这些洞察整合到原始研报中，生成一份更全面、更深入的分析报告。
`

    // 保存洞察合成结果
    const synthesisId = `synthesis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { error: synthesisError } = await supabase
      .from('insight_synthesis')
      .insert([{
        id: synthesisId,
        session_id: sessionId,
        discussion_summary: parsedSynthesis.discussionSummary || '',
        key_questions_raised: parsedSynthesis.keyQuestionsRaised || [],
        new_perspectives: parsedSynthesis.newPerspectives || [],
        missing_information_gaps: parsedSynthesis.missingInformationGaps || [],
        synthesis_prompt: evolutionPrompt,
        created_at: new Date()
      }])

    if (synthesisError) {
      console.error('Error saving synthesis:', synthesisError)
    }

    // 更新会话状态
    await supabase
      .from('discussion_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId)

    const response: SynthesisResponse = {
      synthesisId,
      discussionSummary: parsedSynthesis.discussionSummary || '',
      keyQuestionsRaised: parsedSynthesis.keyQuestionsRaised || [],
      newPerspectives: parsedSynthesis.newPerspectives || [],
      missingInformationGaps: parsedSynthesis.missingInformationGaps || [],
      synthesisPrompt: evolutionPrompt,
      confidence: 0.8 // 可以根据分析质量调整
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in synthesize-insights:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
