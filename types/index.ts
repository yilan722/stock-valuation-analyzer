export interface StockData {
  symbol: string
  name: string
  price: number
  marketCap: number
  peRatio: number
  amount: number  // 成交额（万元）
  volume: number  // 成交量（股数）
  change: number
  changePercent: number
}

export interface BusinessSegment {
  name: string
  revenue: number
  growth: number
  margin: number
}

export interface ValuationMetrics {
  dcfValue: number
  peBasedValue: number
  pbBasedValue: number
  targetPrice: number
  recommendation: 'BUY' | 'HOLD' | 'SELL'
  reasoning: string
}

export interface BasicInfo {
  companyName: string
  ticker: string
  currentPrice: number
  marketCap: number
  peRatio: number
  description: string
}

// 新的API响应结构
export interface ValuationReportData {
  fundamentalAnalysis: string
  businessSegments: string
  growthCatalysts: string
  valuationAnalysis: string
}

// 旧的API响应结构（保留用于兼容性）
export interface LegacyValuationReportData {
  basicInfo: BasicInfo
  businessSegments: BusinessSegment[]
  growthCatalysts: string[]
  valuation: ValuationMetrics
}

export interface Opus4Request {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
}

export interface Opus4Response {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// 个性化研究中心相关类型
export interface UserInput {
  id: string
  userId: string
  stockSymbol: string
  originalReportId: string
  customInsights: string
  createdAt: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface VersionedReport {
  id: string
  originalReportId: string
  userInputId: string
  version: string
  reportData: ValuationReportData
  changes: {
    fundamentalChanges: string[]
    valuationImpact: {
      dcfChange: number
      peChange: number
      pbChange: number
      targetPriceChange: number
      reasoning: string
    }
  }
  createdAt: Date
}

// 多公司对比分析相关类型
export interface CompanyAnalysis {
  symbol: string
  name: string
  customInsights?: string
  analysisData?: ValuationReportData
  scores: {
    profitability: number
    financialHealth: number
    growth: number
    valuation: number
    policyBenefit: number
  }
  keyMetrics: {
    targetPrice: number
    upsidePotential: number
    peRatio: number
    pbRatio: number
    debtToEquity: number
    roe: number
  }
}

export interface MultiCompanyAnalysis {
  id: string
  userId: string
  companies: CompanyAnalysis[]
  aiRecommendation: {
    topPick: string
    reasoning: string
    riskFactors: string[]
  }
  createdAt: Date
  templateName?: string
  isPublic?: boolean
  shareLink?: string
  geminiAnalysis?: {
    overview: string
    radarData: any
    comparisonTable: string
    aiRecommendation: string
  }
}

export interface RadarChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor: string
    borderColor: string
    borderWidth: number
  }>
} 