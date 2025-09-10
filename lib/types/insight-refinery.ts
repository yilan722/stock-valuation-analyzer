// Insight Refinery 相关类型定义

export interface DiscussionSession {
  id: string
  reportId: string
  userId: string
  sessionStart: Date
  sessionEnd?: Date
  totalQuestions: number
  keyInsightsCount: number
  status: 'active' | 'completed' | 'archived'
}

export interface Conversation {
  id: string
  sessionId: string
  userQuestion: string
  aiResponse: string
  timestamp: Date
  isKeyInsight: boolean
  insightCategory?: 'financial' | 'strategic' | 'market' | 'risk' | 'opportunity'
}

export interface KeyInsight {
  id: string
  sessionId: string
  content: string
  category: string
  confidence: number
  sourceConversationId: string
  createdAt: Date
}

export interface InsightSynthesis {
  id: string
  sessionId: string
  discussionSummary: string
  keyQuestionsRaised: string[]
  newPerspectives: string[]
  missingInformationGaps: string[]
  synthesisPrompt: string
  createdAt: Date
}

export interface ReportEvolution {
  id: string
  originalReportId: string
  parentReportId?: string
  version: string
  title: string
  content: string
  generationModel: string
  synthesisId: string
  isInsightRefineryEnhanced: boolean
  createdAt: Date
  generationCost: number
}

export interface ChangeTracking {
  id: string
  originalReportId: string
  evolvedReportId: string
  diffSummary: string
  highlightedChanges: HighlightedChange[]
  evolutionType: 'insight_refinery' | 'manual_update' | 'data_refresh'
  createdAt: Date
}

export interface HighlightedChange {
  id: string
  type: 'added' | 'modified' | 'removed' | 'moved'
  section: string
  originalContent?: string
  newContent?: string
  significance: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

export interface ReportFolder {
  id: string
  companyName: string
  ticker: string
  originalReportId: string
  latestVersionId: string
  totalVersions: number
  totalDiscussions: number
  lastActivity: Date
  createdAt: Date
}

// API 请求/响应类型
export interface StartSessionRequest {
  reportId: string
  userId: string
}

export interface AskQuestionRequest {
  sessionId: string
  question: string
  context?: string
}

export interface SynthesizeInsightsRequest {
  sessionId: string
  includeAllConversations?: boolean
  customInstructions?: string
}

export interface GenerateEvolutionRequest {
  originalReportId: string
  synthesisId: string
  customPrompt?: string
}

export interface CompareVersionsRequest {
  originalReportId: string
  evolvedReportId: string
}

// 响应类型
export interface DiscussionResponse {
  sessionId: string
  conversationId: string
  aiResponse: string
  isKeyInsight: boolean
  suggestedFollowUp?: string[]
}

export interface SynthesisResponse {
  synthesisId: string
  discussionSummary: string
  keyQuestionsRaised: string[]
  newPerspectives: string[]
  missingInformationGaps: string[]
  synthesisPrompt: string
  confidence: number
}

export interface EvolutionResponse {
  evolutionId: string
  version: string
  title: string
  content: string
  generationCost: number
  estimatedTime: number
}

export interface ComparisonResponse {
  changeTrackingId: string
  diffSummary: string
  highlightedChanges: HighlightedChange[]
  similarityScore: number
  majorChanges: string[]
}



