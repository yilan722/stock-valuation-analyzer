export interface StockData {
  symbol: string
  name: string
  price: number
  marketCap: number
  peRatio: number
  volume: number
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

export interface ValuationReportData {
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