'use client'

import React, { useState, useEffect } from 'react'
import { X, MessageSquare, Lightbulb, RefreshCw, FileText, GitCompare, Microscope, Clock } from 'lucide-react'
import { getTranslation } from '@/lib/translations'
import { Locale } from '@/lib/i18n'

interface InsightRefineryModalProps {
  isOpen: boolean
  onClose: () => void
  reportId: string
  reportTitle: string
  userId: string
  locale: Locale
}

interface DiscussionSession {
  id: string
  totalQuestions: number
  keyInsightsCount: number
  status: 'active' | 'completed' | 'archived'
}

interface Conversation {
  id: string
  userQuestion: string
  aiResponse: string
  timestamp: string
  isKeyInsight: boolean
}

interface SynthesisResult {
  synthesisId: string
  discussionSummary: string
  keyQuestionsRaised: string[]
  newPerspectives: string[]
  missingInformationGaps: string[]
  // 新增字段
  professionalHighlights: ProfessionalHighlight[]
  userConfirmedHighlights: ProfessionalHighlight[]
  isUserConfirmationPending: boolean
}

interface ProfessionalHighlight {
  id: string
  category: '技术优势' | '财务表现' | '市场地位' | '风险因素' | '投资建议' | '其他'
  title: string
  content: string
  impact: '高' | '中' | '低'
  isNewInsight: boolean
  isUserConfirmed: boolean
  originalReportSection?: string
}

export default function InsightRefineryModal({ 
  isOpen, 
  onClose, 
  reportId, 
  reportTitle, 
  userId, 
  locale 
}: InsightRefineryModalProps) {
  const [session, setSession] = useState<DiscussionSession | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null)
  const [evolutionReport, setEvolutionReport] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'discussion' | 'synthesis' | 'evolution'>('discussion')
  const [reportData, setReportData] = useState<string | null>(null)
  const [reportContent, setReportContent] = useState<any>(null)
  const [isGeneratingEvolution, setIsGeneratingEvolution] = useState(false)
  const [evolutionProgress, setEvolutionProgress] = useState(0)

  // 获取报告内容
  const fetchReportContent = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data.report_data)
        setReportContent(data)
      }
    } catch (error) {
      console.error('Error fetching report content:', error)
    }
  }

  // 开始讨论会话
  const startSession = async () => {
    try {
      setIsLoading(true)
      
      // 首先获取报告数据
      const reportResponse = await fetch(`/api/reports/${reportId}`)
      const reportResult = await reportResponse.json()
      
      if (!reportResult.success || !reportResult.data) {
        console.error('Report not found')
        return
      }
      
      const reportData = reportResult.data
      
      // 保存报告数据用于显示
      console.log('🔍 获取到的报告数据:', reportData)
      console.log('🔍 报告内容:', reportData.report_data)
      console.log('🔍 报告内容类型:', typeof reportData.report_data)
      setReportData(reportData.report_data)
      
      // 直接创建会话，不需要数据库
      setSession({
        id: `session_${Date.now()}`,
        totalQuestions: 0,
        keyInsightsCount: 0,
        status: 'active'
      })
    } catch (error) {
      console.error('Error starting session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 提交问题
  const askQuestion = async () => {
    if (!currentQuestion.trim()) return

    try {
      setIsLoading(true)
      console.log('🔍 开始提问:', currentQuestion)
      
      // 根据语言设置系统提示词
      const systemPrompt = locale === 'zh' 
        ? `你是一位专业的股票分析师助手，专门帮助用户深入分析研报内容。请基于提供的研报内容回答用户的问题。

要求：
1. 回答要专业、准确、有深度
2. 基于研报内容进行分析，不要编造信息
3. 如果问题超出研报范围，请说明并提供相关建议
4. 识别并标记重要的洞察点
5. 回答要简洁明了，但要有价值
6. 可以搜索最新的市场信息和新闻来补充分析

请用中文回答。`
        : `You are a professional stock analyst assistant specializing in helping users analyze research reports in depth. Please answer user questions based on the provided report content.

Requirements:
1. Provide professional, accurate, and insightful answers
2. Analyze based on report content, do not fabricate information
3. If questions go beyond the report scope, explain and provide relevant suggestions
4. Identify and highlight important insights
5. Keep answers concise but valuable
6. You can search for the latest market information and news to supplement your analysis

Please respond in English.`
      
      // 直接调用Perplexity API，使用Sonar模型
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: locale === 'zh' 
                ? `报告内容: ${reportData}

用户问题: ${currentQuestion}

请基于上述报告内容回答用户的问题。`
                : `Report Content: ${reportData}

User Question: ${currentQuestion}

Please answer the user's question based on the above report content.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.3,
          top_p: 0.9,
          search_queries: true,
          search_recency_filter: 'month'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content || '抱歉，我无法回答这个问题。'
      
      console.log('🔍 AI回答:', aiResponse)

      // 添加到对话历史
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setConversations(prev => [...prev, {
        id: conversationId,
        userQuestion: currentQuestion,
        aiResponse: aiResponse,
        timestamp: new Date().toISOString(),
        isKeyInsight: false
      }])
      
      // 更新session的提问计数
      setSession(prev => prev ? {
        ...prev,
        totalQuestions: prev.totalQuestions + 1
      } : null)
      
      setCurrentQuestion('')
    } catch (error) {
      console.error('Error asking question:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 合成洞察 - 专业化和系统化版本
  const synthesizeInsights = async () => {
    if (!conversations.length) {
      alert(locale === 'zh' ? '请先进行一些讨论再合成洞察' : 'Please have some discussions first before synthesizing insights')
      return
    }

    try {
      setIsLoading(true)
      console.log('🔍 开始专业洞察合成...')
      
      // 直接调用Perplexity API进行专业洞察提取
      const conversationText = conversations.map(conv => 
        `用户: ${conv.userQuestion}\nSuperAnalyst: ${conv.aiResponse}`
      ).join('\n\n')
      
      console.log('🔍 对话内容长度:', conversationText.length)
      
      // 根据语言设置系统提示词
      const synthesisSystemPrompt = locale === 'zh'
        ? `你是一位专业的股票分析师，专门负责从讨论中提取结构化的关键洞察点。请基于以下讨论内容，生成专业化的投资亮点分析。

要求：
1. 将讨论内容整理成结构化的专业亮点（Professional Highlights）
2. 每个亮点必须包含：类别、标题、内容、影响程度、是否为新洞察
3. 亮点类别包括：技术优势、财务表现、市场地位、风险因素、投资建议、其他
4. 影响程度分为：高、中、低
5. 判断是否为原始报告中没有的新洞察
6. 使用专业的金融分析语言
7. 返回JSON格式，包含professionalHighlights数组

请严格按照以下JSON格式返回：
{
  "discussionSummary": "讨论摘要",
  "professionalHighlights": [
    {
      "id": "highlight_1",
      "category": "技术优势",
      "title": "亮点标题",
      "content": "详细内容描述",
      "impact": "高",
      "isNewInsight": true,
      "originalReportSection": "基本面分析"
    }
  ]
}

请用中文回答。`
        : `You are a professional stock analyst specializing in extracting structured key insights from discussions. Please generate professional investment highlights analysis based on the following discussion content.

Requirements:
1. Organize discussion content into structured professional highlights
2. Each highlight must include: category, title, content, impact level, whether it's a new insight
3. Highlight categories include: Technical Advantages, Financial Performance, Market Position, Risk Factors, Investment Recommendations, Others
4. Impact levels: High, Medium, Low
5. Determine if it's a new insight not present in the original report
6. Use professional financial analysis language
7. Return JSON format with professionalHighlights array

Please strictly follow this JSON format:
{
  "discussionSummary": "Discussion Summary",
  "professionalHighlights": [
    {
      "id": "highlight_1",
      "category": "Technical Advantages",
      "title": "Highlight Title",
      "content": "Detailed content description",
      "impact": "High",
      "isNewInsight": true,
      "originalReportSection": "Fundamental Analysis"
    }
  ]
}

Please respond in English.`

      const synthesisUserPrompt = locale === 'zh'
        ? `基于以下讨论内容，请生成专业化的投资亮点分析：

${conversationText}

原始报告内容: ${reportData}

请提取关键洞察并生成结构化的专业亮点。`
        : `Based on the following discussion content, please generate professional investment highlights analysis:

${conversationText}

Original Report Content: ${reportData}

Please extract key insights and generate structured professional highlights.`

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: synthesisSystemPrompt
            },
            {
              role: 'user',
              content: synthesisUserPrompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.3,
          top_p: 0.9,
          search_queries: true,
          search_recency_filter: 'month'
        })
      })

      console.log('🔍 API响应状态:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API错误响应:', errorText)
        throw new Error(`API调用失败: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('🔍 API响应数据:', data)
      
      const responseContent = data.choices?.[0]?.message?.content || '无法生成洞察合成'
      
      console.log('🔍 合成内容长度:', responseContent.length)
      
      // 解析JSON响应
      let parsedData
      try {
        // 尝试提取JSON部分
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('无法找到有效的JSON格式')
        }
      } catch (parseError) {
        console.error('JSON解析错误:', parseError)
        // 如果解析失败，创建默认结构
        parsedData = {
          discussionSummary: responseContent,
          professionalHighlights: []
        }
      }
      
      // 为每个亮点添加唯一ID和确认状态
      const professionalHighlights = parsedData.professionalHighlights?.map((highlight: any, index: number) => ({
        ...highlight,
        id: highlight.id || `highlight_${Date.now()}_${index}`,
        isUserConfirmed: false
      })) || []
      
      setSynthesis({
        synthesisId: `synthesis_${Date.now()}`,
        discussionSummary: parsedData.discussionSummary || responseContent,
        keyQuestionsRaised: [],
        newPerspectives: [],
        missingInformationGaps: [],
        professionalHighlights: professionalHighlights,
        userConfirmedHighlights: [],
        isUserConfirmationPending: true
      })
      
      setActiveTab('synthesis')
      console.log('✅ 专业洞察合成完成')
    } catch (error) {
      console.error('❌ 洞察合成错误:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert(`洞察合成失败: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 确认亮点
  const confirmHighlight = (highlightId: string) => {
    if (!synthesis) return

    const updatedHighlights = synthesis.professionalHighlights.map(highlight => 
      highlight.id === highlightId 
        ? { ...highlight, isUserConfirmed: !highlight.isUserConfirmed }
        : highlight
    )

    const confirmedHighlights = updatedHighlights.filter(h => h.isUserConfirmed)

    setSynthesis({
      ...synthesis,
      professionalHighlights: updatedHighlights,
      userConfirmedHighlights: confirmedHighlights,
      isUserConfirmationPending: confirmedHighlights.length === 0
    })
  }

  // 确认所有亮点
  const confirmAllHighlights = () => {
    if (!synthesis) return

    const allConfirmed = synthesis.professionalHighlights.map(highlight => ({
      ...highlight,
      isUserConfirmed: true
    }))

    setSynthesis({
      ...synthesis,
      professionalHighlights: allConfirmed,
      userConfirmedHighlights: allConfirmed,
      isUserConfirmationPending: false
    })
  }

  // 生成进化版报告
  const generateEvolution = async () => {
    if (!synthesis || synthesis.userConfirmedHighlights.length === 0) {
      alert('请先确认至少一个关键洞察点')
      return
    }

    try {
      setIsLoading(true)
      setIsGeneratingEvolution(true)
      setEvolutionProgress(0)
      setActiveTab('evolution')
      
      console.log('🔍 开始生成二次加工报告...')
      
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setEvolutionProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)
      
      // 构建确认的洞察内容
      const confirmedInsights = synthesis.userConfirmedHighlights.map(highlight => 
        locale === 'zh' 
          ? `【${highlight.category}】${highlight.title}: ${highlight.content}`
          : `[${highlight.category}] ${highlight.title}: ${highlight.content}`
      ).join('\n\n')

      // 根据语言设置系统提示词
      const evolutionSystemPrompt = locale === 'zh'
        ? `你是一位专业的股票分析师，需要基于原始报告和用户确认的关键洞察，生成一份增强版的估值分析报告。

要求：
1. 保持原始报告的结构和格式
2. 将确认的洞察点有机整合到相应章节
3. 更新相关的财务指标、估值结论和投资建议
4. 确保新内容与原始报告逻辑一致
5. 使用专业的金融分析语言
6. 返回完整的HTML格式报告

请用中文回答。`
        : `You are a professional stock analyst who needs to generate an enhanced valuation analysis report based on the original report and user-confirmed key insights.

Requirements:
1. Maintain the structure and format of the original report
2. Organically integrate confirmed insights into relevant sections
3. Update related financial metrics, valuation conclusions, and investment recommendations
4. Ensure new content is logically consistent with the original report
5. Use professional financial analysis language
6. Return a complete HTML format report

Please respond in English.`

      const evolutionUserPrompt = locale === 'zh'
        ? `请基于以下原始报告和用户确认的关键洞察，生成增强版估值分析报告：

原始报告内容：
${reportData}

用户确认的关键洞察：
${confirmedInsights}

请生成完整的增强版报告，将新洞察有机整合到原始报告中。`
        : `Please generate an enhanced valuation analysis report based on the following original report and user-confirmed key insights:

Original Report Content:
${reportData}

User-Confirmed Key Insights:
${confirmedInsights}

Please generate a complete enhanced report, organically integrating new insights into the original report.`

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-deep-research',
          messages: [
            {
              role: 'system',
              content: evolutionSystemPrompt
            },
            {
              role: 'user',
              content: evolutionUserPrompt
            }
          ],
          max_tokens: 6000,
          temperature: 0.3,
          top_p: 0.9,
          search_queries: true,
          search_recency_filter: 'month'
        })
      })

      clearInterval(progressInterval)
      setEvolutionProgress(100)

      if (!response.ok) {
        throw new Error('Failed to generate evolution report')
      }

      const data = await response.json()
      const evolutionContent = data.choices?.[0]?.message?.content || '无法生成增强版报告'
      
      // 保存增强版报告内容
      setEvolutionReport({
        id: `evolution_${Date.now()}`,
        content: evolutionContent,
        originalReportId: reportId,
        synthesisId: synthesis.synthesisId,
        confirmedHighlights: synthesis.userConfirmedHighlights,
        createdAt: new Date().toISOString()
      })
      
      console.log('✅ 增强版报告生成完成')
      
    } catch (error) {
      console.error('Error generating evolution:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert(`生成增强版报告失败: ${errorMessage}`)
    } finally {
      setIsLoading(false)
      setIsGeneratingEvolution(false)
    }
  }

  useEffect(() => {
    if (isOpen && reportId) {
      // 获取报告内容
      fetchReportContent(reportId)
      // 开始讨论会话
      if (!session) {
        startSession()
      }
    }
  }, [isOpen, reportId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header - 专业金融风格 */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-10 rounded-xl flex items-center justify-center">
                <Microscope className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {locale === 'zh' ? 'Insight Refinery - 洞察精炼器' : 'Insight Refinery'}
                </h2>
                <p className="text-gray-300 text-sm mt-1 font-medium">{reportTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs - 优化样式 */}
        <div className="flex bg-gray-50 px-6">
          <button
            onClick={() => setActiveTab('discussion')}
            className={`px-6 py-4 font-medium flex items-center space-x-2 transition-all ${
              activeTab === 'discussion' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white rounded-t-lg' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-lg'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>{locale === 'zh' ? '讨论分析' : 'Discussion Analysis'}</span>
          </button>
          <button
            onClick={() => setActiveTab('synthesis')}
            className={`px-6 py-4 font-medium flex items-center space-x-2 transition-all ${
              activeTab === 'synthesis' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white rounded-t-lg' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-lg'
            }`}
            disabled={!synthesis}
          >
            <Lightbulb className="h-5 w-5" />
            <span>{locale === 'zh' ? '洞察合成' : 'Insight Synthesis'}</span>
          </button>
          <button
            onClick={() => setActiveTab('evolution')}
            className={`px-6 py-4 font-medium flex items-center space-x-2 transition-all ${
              activeTab === 'evolution' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white rounded-t-lg' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-lg'
            }`}
            disabled={!synthesis}
          >
            <RefreshCw className="h-5 w-5" />
            <span>{locale === 'zh' ? '报告进化' : 'Report Evolution'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'discussion' && (
            <DiscussionTab
              session={session}
              conversations={conversations}
              currentQuestion={currentQuestion}
              setCurrentQuestion={setCurrentQuestion}
              askQuestion={askQuestion}
              isLoading={isLoading}
              synthesizeInsights={synthesizeInsights}
              reportData={reportData}
              locale={locale}
            />
          )}

          {activeTab === 'synthesis' && synthesis && (
            <SynthesisTab
              synthesis={synthesis}
              generateEvolution={generateEvolution}
              isLoading={isLoading}
              confirmHighlight={confirmHighlight}
              confirmAllHighlights={confirmAllHighlights}
              locale={locale}
            />
          )}

          {activeTab === 'evolution' && (
            <EvolutionTab
              isGeneratingEvolution={isGeneratingEvolution}
              evolutionProgress={evolutionProgress}
              evolutionReport={evolutionReport}
              isLoading={isLoading}
              locale={locale}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// 讨论标签页组件
function DiscussionTab({ 
  session, 
  conversations, 
  currentQuestion, 
  setCurrentQuestion, 
  askQuestion, 
  isLoading,
  synthesizeInsights,
  reportData,
  locale
}: any) {
  const [showFullReport, setShowFullReport] = useState(false)

  // 解析报告数据
  const parseReportData = (reportData: string) => {
    try {
      const parsed = JSON.parse(reportData)
      return {
        fundamentalAnalysis: parsed.fundamentalAnalysis || '',
        businessSegments: parsed.businessSegments || '',
        growthCatalysts: parsed.growthCatalysts || '',
        valuationAnalysis: parsed.valuationAnalysis || ''
      }
    } catch (error) {
      console.error('Error parsing report data:', error)
      return {
        fundamentalAnalysis: '',
        businessSegments: '',
        growthCatalysts: '',
        valuationAnalysis: ''
      }
    }
  }

  const reportSections = reportData ? parseReportData(reportData) : null
  
  // 调试信息
  console.log('🔍 DiscussionTab - reportData:', reportData)
  console.log('🔍 DiscussionTab - reportData类型:', typeof reportData)
  console.log('🔍 DiscussionTab - reportSections:', reportSections)
  console.log('🔍 DiscussionTab - reportSections是否为null:', reportSections === null)

  return (
    <div className="space-y-6">
      {/* 会话统计 */}
      {session && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">
                {locale === 'zh' ? '讨论会话进行中' : 'Discussion Session in Progress'}
              </h3>
              <p className="text-blue-700 text-sm">
                {locale === 'zh' 
                  ? `已提问 ${session.totalQuestions} 次，关键洞察 ${session.keyInsightsCount} 个`
                  : `${session.totalQuestions} questions asked, ${session.keyInsightsCount} key insights`
                }
              </p>
            </div>
            <button
              onClick={synthesizeInsights}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={conversations.length === 0 || isLoading}
            >
              <Lightbulb className="h-4 w-4 inline mr-2" />
              {isLoading 
                ? (locale === 'zh' ? '合成中...' : 'Synthesizing...') 
                : (locale === 'zh' ? '合成洞察' : 'Synthesize Insights')
              }
            </button>
          </div>
        </div>
      )}

      {/* 报告内容显示 */}
      {reportSections ? (
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                {locale === 'zh' ? '完整报告内容' : 'Full Report Content'}
              </h3>
              <button
                onClick={() => setShowFullReport(!showFullReport)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showFullReport 
                  ? (locale === 'zh' ? '收起报告' : 'Collapse Report')
                  : (locale === 'zh' ? '展开报告' : 'Expand Report')
                }
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {locale === 'zh' 
                ? '查看完整报告内容，基于具体数据进行提问和讨论'
                : 'View full report content, ask questions and discuss based on specific data'
              }
            </p>
          </div>
          
          {showFullReport && (
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                {/* 基本面分析 */}
                {reportSections.fundamentalAnalysis && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">基本面分析</h4>
                    <div 
                      className="prose prose-sm max-w-none report-content"
                      dangerouslySetInnerHTML={{ __html: reportSections.fundamentalAnalysis }}
                    />
                  </div>
                )}

                {/* 业务板块 */}
                {reportSections.businessSegments && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">业务板块分析</h4>
                    <div 
                      className="prose prose-sm max-w-none report-content"
                      dangerouslySetInnerHTML={{ __html: reportSections.businessSegments }}
                    />
                  </div>
                )}

                {/* 增长催化剂 */}
                {reportSections.growthCatalysts && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">增长催化剂</h4>
                    <div 
                      className="prose prose-sm max-w-none report-content"
                      dangerouslySetInnerHTML={{ __html: reportSections.growthCatalysts }}
                    />
                  </div>
                )}

                {/* 估值分析 */}
                {reportSections.valuationAnalysis && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">估值分析</h4>
                    <div 
                      className="prose prose-sm max-w-none report-content"
                      dangerouslySetInnerHTML={{ __html: reportSections.valuationAnalysis }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-800">报告内容加载中...</h3>
              <p className="text-yellow-700 text-sm mt-1">
                正在获取报告数据，请稍候...
              </p>
              <p className="text-yellow-600 text-xs mt-2">
                调试信息: reportData = {reportData ? '存在' : 'null'}, 类型 = {typeof reportData}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 对话历史 - 优化为聊天界面 */}
      <div className="space-y-6 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
        {conversations.map((conv: Conversation) => (
          <div key={conv.id} className="space-y-4">
            {/* 用户消息 */}
            <div className="flex justify-end">
              <div className="max-w-3xl">
                <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                  <p className="text-sm">{conv.userQuestion}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {conv.timestamp}
                </div>
              </div>
            </div>
            
            {/* SuperAnalyst回复 */}
            <div className="flex justify-start">
              <div className="max-w-3xl">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">SA</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">SuperAnalyst</span>
                      {conv.isKeyInsight && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                          💡 关键洞察
                        </span>
                      )}
                    </div>
                    <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                      {conv.aiResponse}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-11">
                  {conv.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 提问输入 - 优化样式 */}
      <div className="border-t pt-6 bg-white">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder={locale === 'zh' ? '与SuperAnalyst讨论报告内容...' : 'Discuss report content with SuperAnalyst...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={askQuestion}
            disabled={!currentQuestion.trim() || isLoading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>思考中...</span>
              </>
            ) : (
              <>
                <span>发送</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// 合成标签页组件
function SynthesisTab({ synthesis, generateEvolution, isLoading, confirmHighlight, confirmAllHighlights, locale }: any) {
  const getCategoryColor = (category: string) => {
    const colors = {
      '技术优势': 'bg-blue-50 border-blue-200 text-blue-800',
      'Technical Advantages': 'bg-blue-50 border-blue-200 text-blue-800',
      '财务表现': 'bg-green-50 border-green-200 text-green-800',
      'Financial Performance': 'bg-green-50 border-green-200 text-green-800',
      '市场地位': 'bg-purple-50 border-purple-200 text-purple-800',
      'Market Position': 'bg-purple-50 border-purple-200 text-purple-800',
      '风险因素': 'bg-red-50 border-red-200 text-red-800',
      'Risk Factors': 'bg-red-50 border-red-200 text-red-800',
      '投资建议': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'Investment Recommendations': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      '其他': 'bg-gray-50 border-gray-200 text-gray-800',
      'Others': 'bg-gray-50 border-gray-200 text-gray-800'
    }
    return colors[category as keyof typeof colors] || colors[locale === 'zh' ? '其他' : 'Others']
  }

  const getImpactColor = (impact: string) => {
    const colors = {
      '高': 'bg-red-100 text-red-800',
      '中': 'bg-yellow-100 text-yellow-800',
      '低': 'bg-green-100 text-green-800'
    }
    return colors[impact as keyof typeof colors] || colors['中']
  }

  return (
    <div className="space-y-6">
      {/* 状态提示 */}
      <div className={`p-4 rounded-lg ${synthesis.isUserConfirmationPending ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
        <h3 className={`font-semibold mb-2 ${synthesis.isUserConfirmationPending ? 'text-yellow-900' : 'text-green-900'}`}>
          {synthesis.isUserConfirmationPending ? '请确认关键洞察点' : '洞察确认完成'}
        </h3>
        <p className={`text-sm ${synthesis.isUserConfirmationPending ? 'text-yellow-700' : 'text-green-700'}`}>
          {synthesis.isUserConfirmationPending 
            ? '请仔细审查以下专业亮点，确认哪些洞察对原始报告有重要影响'
            : `已确认 ${synthesis.userConfirmedHighlights.length} 个关键洞察点，可以生成增强版报告`
          }
        </p>
      </div>

      {/* 讨论摘要 */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          讨论摘要
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 text-sm leading-relaxed">{synthesis.discussionSummary}</p>
        </div>
      </div>

      {/* 专业亮点列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            专业亮点分析
          </h4>
          <button
            onClick={confirmAllHighlights}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
          >
            全选确认
          </button>
        </div>

        <div className="space-y-3">
          {synthesis.professionalHighlights.map((highlight: any) => (
            <div 
              key={highlight.id} 
              className={`border rounded-lg p-4 transition-all duration-200 ${
                highlight.isUserConfirmed 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(highlight.category)}`}>
                      {highlight.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(highlight.impact)}`}>
                      影响: {highlight.impact}
                    </span>
                    {highlight.isNewInsight && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        新洞察
                      </span>
                    )}
                  </div>
                  
                  <h5 className="font-semibold text-gray-900 mb-2">{highlight.title}</h5>
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">{highlight.content}</p>
                  
                  {highlight.originalReportSection && (
                    <p className="text-xs text-gray-500">
                      相关章节: {highlight.originalReportSection}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => confirmHighlight(highlight.id)}
                  className={`ml-4 px-3 py-1 text-sm rounded-md transition-colors ${
                    highlight.isUserConfirmed
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {highlight.isUserConfirmed ? '已确认' : '确认'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 生成增强版报告按钮 */}
      <div className="text-center pt-4">
        <button
          onClick={generateEvolution}
          disabled={isLoading || synthesis.userConfirmedHighlights.length === 0}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>
            {isLoading ? '生成中...' : `生成增强版报告 (${synthesis.userConfirmedHighlights.length} 个洞察)`}
          </span>
        </button>
        <p className="text-sm text-gray-500 mt-2">
          这将消耗一次研报生成次数
        </p>
      </div>
    </div>
  )
}

// 进化标签页组件
function EvolutionTab({ isGeneratingEvolution, evolutionProgress, evolutionReport, isLoading, locale }: any) {
  if (isGeneratingEvolution) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          {/* 时钟图标 */}
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          
          {/* 标题 */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Generating Report</h3>
          <p className="text-gray-600 mb-6">AI analysis in progress...</p>
          
          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${evolutionProgress}%` }}
            ></div>
          </div>
          
          {/* 进度百分比 */}
          <div className="flex justify-between text-sm text-gray-500 mb-6">
            <span>0%</span>
            <span className="font-semibold">{Math.round(evolutionProgress)}%</span>
            <span>100%</span>
          </div>
          
          {/* 重要提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-blue-600 text-sm font-bold">!</span>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-blue-900 mb-2">Important</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Report generation takes 2-5 minutes</li>
                  <li>• Please do not close this window</li>
                  <li>• You can continue using other browser tabs</li>
                  <li>• Report will be saved automatically</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 状态信息 */}
          <div className="flex items-center justify-center text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Processing AI analysis...
          </div>
          
          {/* 底部信息 */}
          <p className="text-xs text-gray-400 mt-6">
            This process is powered by the most advanced AI models, which utilize inference path exploration to incorporate the latest research and data, ensuring the most comprehensive and up-to-date responses. This thorough analysis may result in a slightly longer processing time.
          </p>
        </div>
      </div>
    )
  }

  if (evolutionReport) {
    return (
      <div className="space-y-6">
        {/* 成功提示 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 text-sm font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-green-900">增强版报告生成完成</h3>
              <p className="text-green-700 text-sm">
                基于 {evolutionReport.confirmedHighlights.length} 个确认洞察点生成
              </p>
            </div>
          </div>
        </div>

        {/* 报告内容 */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">增强版估值分析报告</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank')
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>增强版估值分析报告</title>
                          <link rel="stylesheet" href="/styles/report-format.css">
                        </head>
                        <body>
                          <div class="report-content">${evolutionReport.content}</div>
                        </body>
                      </html>
                    `)
                    printWindow.document.close()
                    printWindow.print()
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                打印报告
              </button>
            </div>
          </div>
          
          <div 
            className="report-content prose max-w-none"
            dangerouslySetInnerHTML={{ __html: evolutionReport.content }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <RefreshCw className="h-16 w-16 text-blue-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {locale === 'zh' ? '报告进化功能' : 'Report Evolution Feature'}
      </h3>
      <p className="text-gray-600">
        {locale === 'zh' 
          ? '请先在"洞察合成"标签页确认关键洞察点，然后生成增强版报告'
          : 'Please first confirm key insights in the "Insight Synthesis" tab, then generate an enhanced report'
        }
      </p>
    </div>
  )
}
