import { Locale } from './i18n'

export const translations = {
  en: {
    // Header
    title: 'Stock Valuation Analyzer',
    subtitle: 'Professional Stock Analysis Platform',
    
    // Search Form
    searchPlaceholder: 'Enter stock symbol (e.g., AAPL, 002915)',
    searchButton: 'Search',
    generateReport: 'Generate Report',
    
    // Stock Information
    stockInformation: 'Stock Information',
    price: 'Price',
    marketCap: 'Market Cap',
    peRatio: 'P/E Ratio',
    amount: 'Amount',
    
    // Report Sections
    fundamentalAnalysis: 'Fundamental Analysis',
    businessSegments: 'Business Segments',
    growthCatalysts: 'Growth Catalysts',
    valuationAnalysis: 'Valuation Analysis',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    noData: 'No data available',
    
    // Language
    language: 'Language',
    english: 'English',
    chinese: '中文',
    
    // Report Content
    companyProfile: 'Company Profile',
    latestFinancials: 'Latest Financials',
    keyMetrics: 'Key Metrics',
    valuationMethodology: 'Valuation Methodology',
    investmentRecommendation: 'Investment Recommendation',
    
    // Errors
    stockNotFound: 'Stock not found',
    apiError: 'API Error',
    networkError: 'Network Error',
    tryAgain: 'Please try again',
    
    // Success
    reportGenerated: 'Report generated successfully',
    dataUpdated: 'Data updated successfully',
    
    // Download
    downloadPDF: 'Download PDF',
    generatingPDF: 'Generating PDF...',
    downloadError: 'Download failed, please try again'
  },
  zh: {
    // Header
    title: '股票估值分析器',
    subtitle: '专业股票分析平台',
    
    // Search Form
    searchPlaceholder: '输入股票代码 (例如: AAPL, 002915)',
    searchButton: '搜索',
    generateReport: '生成报告',
    
    // Stock Information
    stockInformation: '股票信息',
    price: '价格',
    marketCap: '市值',
    peRatio: '市盈率',
    amount: '成交额',
    
    // Report Sections
    fundamentalAnalysis: '基本面分析',
    businessSegments: '业务细分',
    growthCatalysts: '增长催化剂',
    valuationAnalysis: '估值分析',
    
    // Common
    loading: '加载中...',
    error: '错误',
    noData: '暂无数据',
    
    // Language
    language: '语言',
    english: 'English',
    chinese: '中文',
    
    // Report Content
    companyProfile: '公司简介',
    latestFinancials: '最新财务数据',
    keyMetrics: '关键指标',
    valuationMethodology: '估值方法',
    investmentRecommendation: '投资建议',
    
    // Errors
    stockNotFound: '未找到股票',
    apiError: 'API错误',
    networkError: '网络错误',
    tryAgain: '请重试',
    
    // Success
    reportGenerated: '报告生成成功',
    dataUpdated: '数据更新成功',
    
    // Download
    downloadPDF: '下载PDF',
    generatingPDF: '生成PDF中...',
    downloadError: '下载失败，请稍后重试'
  }
} as const

export function getTranslation(locale: Locale, key: keyof typeof translations.en): string {
  if (!translations[locale]) {
    console.error(`Locale '${locale}' not found in translations`)
    return translations.en[key] || key
  }
  
  return translations[locale][key] || translations.en[key] || key
}

export type TranslationKey = keyof typeof translations.en 