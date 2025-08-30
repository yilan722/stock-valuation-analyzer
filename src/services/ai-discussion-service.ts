import { GeminiService } from './gemini-service'

export interface DiscussionMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface DiscussionSession {
  id: string
  stockSymbol: string
  userInsights: string
  messages: DiscussionMessage[]
  summary?: string
  createdAt: Date
}

export class AIDiscussionService {
  private geminiService: GeminiService

  constructor() {
    this.geminiService = new GeminiService()
  }

  async startDiscussion(stockSymbol: string, userInsights: string): Promise<DiscussionSession> {
    const session: DiscussionSession = {
      id: `discussion_${Date.now()}`,
      stockSymbol,
      userInsights,
      messages: [
        {
          role: 'assistant',
          content: `您好！我是您的AI投资顾问。我看到您对${stockSymbol}有以下见解：\n\n"${userInsights}"\n\n让我们深入讨论这些观点，我会帮您分析其投资价值和潜在影响。请告诉我您希望重点探讨哪些方面？`,
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    }

    return session
  }

  async continueDiscussion(session: DiscussionSession, userMessage: string): Promise<DiscussionSession> {
    // 添加用户消息
    const updatedSession = {
      ...session,
      messages: [
        ...session.messages,
        {
          role: 'user' as const,
          content: userMessage,
          timestamp: new Date()
        }
      ]
    }

    try {
      // 使用 Gemini 生成回复
      const prompt = this.buildDiscussionPrompt(updatedSession)
      const aiResponse = await this.geminiService.generateContent(prompt)

      // 添加AI回复
      updatedSession.messages.push({
        role: 'assistant' as const,
        content: aiResponse,
        timestamp: new Date()
      })

      return updatedSession
    } catch (error) {
      console.error('AI discussion failed:', error)
      // 如果AI调用失败，提供默认回复
      updatedSession.messages.push({
        role: 'assistant' as const,
        content: '抱歉，我在处理您的消息时遇到了问题。让我们继续讨论您的投资见解，或者您可以重新描述一下您的观点。',
        timestamp: new Date()
      })
      return updatedSession
    }
  }

  async generateDiscussionSummary(session: DiscussionSession): Promise<string> {
    try {
      const prompt = this.buildSummaryPrompt(session)
      const summary = await this.geminiService.generateContent(prompt)
      return summary
    } catch (error) {
      console.error('Summary generation failed:', error)
      return '讨论总结生成失败，请重试。'
    }
  }

  private buildDiscussionPrompt(session: DiscussionSession): string {
    const conversationHistory = session.messages
      .map(msg => `${msg.role === 'user' ? '用户' : 'AI顾问'}: ${msg.content}`)
      .join('\n\n')

    return `你是一位专业的投资顾问，正在与用户讨论股票${session.stockSymbol}的投资价值。

用户的初始见解：${session.userInsights}

对话历史：
${conversationHistory}

请根据对话内容，提供专业、简洁、有针对性的投资建议和分析。注意：
1. 保持专业性和准确性
2. 避免冗长的通用性描述
3. 重点关注用户提到的具体观点和数据
4. 提供可操作的投资建议
5. 用中文回答

请继续对话：`
  }

  private buildSummaryPrompt(session: DiscussionSession): string {
    const conversationHistory = session.messages
      .map(msg => `${msg.role === 'user' ? '用户' : 'AI顾问'}: ${msg.content}`)
      .join('\n\n')

    return `请为以下投资讨论生成一个简洁的总结：

股票：${session.stockSymbol}
用户初始见解：${session.userInsights}

完整对话：
${conversationHistory}

请生成一个结构化的总结，包含：
1. 核心讨论要点
2. 关键投资观点
3. 主要风险因素
4. 投资建议总结

要求：简洁、专业、重点突出，用中文回答。`
  }
}


