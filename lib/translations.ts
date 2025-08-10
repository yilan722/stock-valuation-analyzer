import { Locale } from './i18n'

// 定义翻译键的类型，包括数组类型
export type TranslationKeys = {
  // 主页面
  title: string
  subtitle: string
  searchPlaceholder: string
  searchButton: string
  generateReport: string
  loading: string
  error: string
  
  // 股票信息
  stockInformation: string
  price: string
  marketCap: string
  peRatio: string
  tradingVolume: string
  amount: string
  
  // 报告部分
  fundamentalAnalysis: string
  businessSegments: string
  growthCatalysts: string
  valuationAnalysis: string
  
  // 通用
  noData: string
  language: string
  english: string
  chinese: string
  free: string
  
  // 报告内容
  companyProfile: string
  latestFinancials: string
  keyMetrics: string
  valuationMethodology: string
  investmentRecommendation: string
  
  // 错误
  stockNotFound: string
  apiError: string
  networkError: string
  tryAgain: string
  
  // 成功
  reportGenerated: string
  dataUpdated: string
  
  // 下载
  downloadPDF: string
  generatingPDF: string
  downloadError: string
  
          // 订阅计划
    singleReport: string
    monthlySubscription: string
    advancedSubscription: string
    premiumVersion: string
    professionalStockAnalysis: string
    realTimeMarketData: string
    aiDrivenAnalysis: string
    prioritySupport: string
    deepIndustryAnalysis: string
    dailyKLineAnalysis: string
    vipExclusiveService: string
    popular: string
    bestValue: string
    subscribe: string
    pleaseLoginFirst: string
    invalidPlan: string

    // 用户信息
    not_logged_in: string
    whitelist_user: string
    free_trial: string
    subscription_active: string
    subscription_required: string
    logout: string
    login: string
    remaining_reports: string
  reports_used: string
  subscription_info: string
  subscription_type: string
  
  subscription_end: string
  reports_used_this_month: string
  subscription_plan: string
  remaining_reports_available: string
  or_choose_subscription: string
  free_reports_used_up: string
  please_choose_subscription_plan: string
  view_subscription_plan: string
  free_reports_used_up_please_choose_subscription: string
  start_using: string
  after_login_you_will_get_1_free_report_or_choose_subscription_plan: string
  login_now: string
  
  // 用户协议
  userServiceAgreement: string
  effectiveDate: string
  importantNotice: string
  agreementNotice: string
  serviceNature: string
  serviceNature1: string
  serviceNature2: string
  serviceNature3: string
  aiContentDeclaration: string
  aiContent1: string
  aiContentLimitations: string[]
  aiContent2: string
  investmentRiskWarning: string
  investmentRisk1: string
  investmentRiskPoints: string[]
  userConfirmation: string
  userConfirmationText: string
  aiAnalysisAgreement: string
  investmentRiskAgreement: string
  selfResponsibilityAgreement: string
  noLiabilityAgreement: string
  serviceFeeAgreement: string
  cancel: string
  agreeAndContinue: string
  
  // 认证模态框
  loginTitle: string
  registerTitle: string
  email: string
  password: string
  confirmPassword: string
  forgotPassword: string
  noAccount: string
  hasAccount: string
  loginSuccess: string
  registerSuccess: string
  loginError: string
  registerError: string
  passwordMismatch: string
  invalidEmail: string
  weakPassword: string

  // Main Page
  getStarted: string
  loginToGetReport: string
  loginNow: string

  // Toast Messages
  pleaseLoginFirstToast: string
  invalidSubscriptionPlan: string
  paymentCreationFailed: string
  agreementRequired: string
  allAgreementsRequired: string
  
  // Subscription Plans (for SubscriptionModal)
  subscriptionPlans: string
  planFeatures: string
  choosePlan: string
  
      // New subscription plan keys
    basicPlan: string
    standardPlan: string
    proPlan: string
    flagshipPlan: string
    monthlyFee: string
    welcomeCredits: string
    monthlyCredits: string
    dailyGrowth: string
    totalMonthlyCredits: string
    costPerReport: string
    onDemandLimit: string
    unlimited: string
    aiDrivenDeepAnalysis: string
    priorityCustomerSupport: string
    technicalAnalysisVipConsulting: string
    freeStart: string
    upgradeSave34: string
    upgradeToPro: string
    contactUsUpgrade: string
    credits: string
    reports: string
    perDay: string
    perMonth: string
    onDemandPurchase: string
    dailyLimit2: string
    noLimit: string
    planComparison: string
    buttonActions: string

  // 认证模态框额外键
  register: string
  loginFailed: string
  registerFailed: string
}

export const translations: Record<Locale, TranslationKeys> = {
  en: {
    // Header
    title: 'Stock Valuation Analyzer',
    subtitle: 'AI-driven Professional Stock Analysis Platform',
    
    // Search Form
    searchPlaceholder: 'Currently supports US stocks and A-shares (e.g., AAPL, 002915)',
    searchButton: 'Search',
    generateReport: 'Generate Report',
    
    // Stock Information
    stockInformation: 'Stock Information',
    price: 'Price',
    marketCap: 'Market Cap',
    peRatio: 'P/E Ratio',
    tradingVolume: 'Trading Volume ($)',
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
    free: 'Free',
    
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
    downloadError: 'Download failed, please try again',

    // Subscription Plans
    singleReport: 'Single Report',
    monthlySubscription: 'Monthly Subscription',
    advancedSubscription: 'Advanced Subscription',
    premiumVersion: 'Premium Version',
    professionalStockAnalysis: 'Professional Stock Analysis Report',
    realTimeMarketData: 'Real-time Market Data',
    aiDrivenAnalysis: 'AI-driven Analysis',
    prioritySupport: 'Priority Customer Support',
    deepIndustryAnalysis: 'Deep Industry Analysis',
    dailyKLineAnalysis: 'Daily K-line Technical Analysis',
    vipExclusiveService: 'VIP Exclusive Service',
    popular: 'Popular',
    bestValue: 'Best Value',
    subscribe: 'Subscribe',
    pleaseLoginFirst: 'Please login first',
    invalidPlan: 'Invalid subscription plan',

    // User Info
    not_logged_in: 'Not Logged In',
    whitelist_user: 'Whitelist User',
    free_trial: 'Free Trial',
    subscription_active: 'Subscribed',
    subscription_required: 'Need Subscription',
    logout: 'Logout',
    login: 'Login',
    remaining_reports: 'Remaining Reports',
    reports_used: 'Reports Used',
    subscription_info: 'Subscription Info',
    subscription_type: 'Subscription Type',

    subscription_end: 'Subscription End',
    reports_used_this_month: 'Reports Used This Month',
    subscription_plan: 'Subscription Plan',
    remaining_reports_available: 'You have',
    or_choose_subscription: 'reports available, or choose subscription for more reports.',
    free_reports_used_up: 'Your free reports are used up',
    please_choose_subscription_plan: 'Please choose a subscription plan to continue.',
    view_subscription_plan: 'View Subscription Plan',
    free_reports_used_up_please_choose_subscription: 'Your free reports are used up, please choose a subscription plan to continue.',
    start_using: 'Get Started',
    after_login_you_will_get_1_free_report_or_choose_subscription_plan: 'After login, you will get 1 free report, or choose a subscription plan for more reports.',
    login_now: 'Login Now',

    // User Agreement
    userServiceAgreement: 'AI Stock Fundamental Valuation Analysis Platform User Service Agreement',
    effectiveDate: 'Effective Date: User signing date',
    importantNotice: 'Important Notice',
    agreementNotice: 'Before using this platform service, please carefully read and fully understand all terms of this agreement, especially those involving disclaimers and liability limitations. By clicking "Agree" or using this platform service, you acknowledge that you have fully read, understood, and accepted all content of this agreement.',
    
    // Agreement Sections
    serviceNature: 'Article 1: Service Nature Description',
    serviceNature1: '1.1 This platform provides AI technology-based stock fundamental data analysis tool services. All analysis results are automatically generated by AI algorithms and do not constitute any investment advice, recommendations, or promises.',
    serviceNature2: '1.2 The fees charged by this platform are only consideration for providing AI computing power, data processing, and technical services, not investment consulting fees or investment profit sharing.',
    serviceNature3: '1.3 This platform is not a licensed financial institution and does not provide securities investment consulting, asset management, or any services requiring financial licenses.',
    
    aiContentDeclaration: 'Article 2: AI Generated Content Declaration',
    aiContent1: '2.1 All analysis reports, valuation results, and data interpretations on this platform are automatically generated by artificial intelligence algorithms based on public data and may have the following limitations:',
    aiContentLimitations: [
      'Data accuracy and timeliness are limited by data sources',
      'AI models may have biases or errors',
      'Analysis results may differ significantly from actual situations',
      'Unable to predict emergencies and market anomalies'
    ],
    aiContent2: '2.2 AI-generated content is for reference only and cannot replace professional investment advisors\' judgment and advice.',
    
    investmentRiskWarning: 'Article 3: Investment Risk Warning',
    investmentRisk1: '3.1 Stock investment carries high risks and may result in partial or total loss of principal. Users should fully recognize:',
    investmentRiskPoints: [
      'Stock market prices fluctuate violently and unpredictably',
      'Past performance does not represent future results',
      'No analysis tool can guarantee investment returns',
      'Investment decisions should be based on personal risk tolerance'
    ],

    // Auth Modal
    loginTitle: 'Login',
    registerTitle: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    loginSuccess: 'Login successful',
    registerSuccess: 'Registration successful',
    loginError: 'Login failed',
    registerError: 'Registration failed',
    passwordMismatch: 'Passwords do not match',
    invalidEmail: 'Invalid email format',
    weakPassword: 'Password must be at least 6 characters',

    // Additional auth keys
    register: 'Register',
    loginFailed: 'Login failed',
    registerFailed: 'Registration failed',

    // Main Page
    getStarted: 'Get Started',
    loginToGetReport: 'Login to get 1 free report, or choose a subscription plan for more reports.',
    loginNow: 'Login Now',

    // Toast Messages
    pleaseLoginFirstToast: 'Please login first',
    invalidSubscriptionPlan: 'Invalid subscription plan',
    paymentCreationFailed: 'Payment creation failed',
    agreementRequired: 'Please agree to all terms',
    allAgreementsRequired: 'Please agree to all terms and conditions',
    
    // Subscription Plans (for SubscriptionModal)
    subscriptionPlans: 'Subscription Plans',
    planFeatures: 'Plan Features',
    choosePlan: 'Choose Plan',

    // New subscription plan keys
    basicPlan: 'Basic Plan',
    standardPlan: 'Standard Plan',
    proPlan: 'Pro Plan',
    flagshipPlan: 'Flagship Plan',
    monthlyFee: 'Monthly Fee',
    welcomeCredits: 'Welcome Credits',
    monthlyCredits: 'Monthly Credits',
    dailyGrowth: 'Daily Growth',
    totalMonthlyCredits: 'Total Monthly Credits',
    costPerReport: 'Cost Per Report',
    onDemandLimit: 'On-Demand Limit',
    unlimited: 'Unlimited',
    aiDrivenDeepAnalysis: 'AI-Driven Deep Analysis',
    priorityCustomerSupport: 'Priority Customer Support',
    technicalAnalysisVipConsulting: 'Technical Analysis VIP Consulting',
    freeStart: 'Free Start',
    upgradeSave34: 'Upgrade Save 34%',
    upgradeToPro: 'Upgrade to Pro',
    contactUsUpgrade: 'Contact Us for Upgrade',
    credits: 'Credits',
    reports: 'Reports',
    perDay: 'Per Day',
    perMonth: 'Per Month',
    onDemandPurchase: 'On-Demand Purchase',
    dailyLimit2: 'Daily Limit 2',
    noLimit: 'No Limit',
    planComparison: 'Plan Comparison',
    buttonActions: 'Button Actions',

    // User Agreement Modal Additional Keys
    userConfirmation: 'I agree to the terms and conditions',
    userConfirmationText: 'By clicking "Agree and Continue", you acknowledge that you have read, understood, and accepted all terms and conditions of this agreement.',
    aiAnalysisAgreement: 'I agree that the analysis reports, valuation results, and data interpretations on this platform are automatically generated by artificial intelligence algorithms based on public data and may have limitations.',
    investmentRiskAgreement: 'I agree that stock investment carries high risks and may result in partial or total loss of principal. Users should fully recognize that stock market prices fluctuate violently and unpredictably, past performance does not represent future results, no analysis tool can guarantee investment returns, and investment decisions should be based on personal risk tolerance.',
    selfResponsibilityAgreement: 'I agree that I am fully responsible for my own investment decisions and bear all risks associated with my investment.',
    noLiabilityAgreement: 'I agree that this platform is not liable for any direct, indirect, incidental, special, or consequential damages arising from my use of this platform or reliance on any information provided herein.',
    serviceFeeAgreement: 'I agree that the fees charged by this platform are only consideration for providing AI computing power, data processing, and technical services, not investment consulting fees or investment profit sharing.',
    cancel: 'Cancel',
    agreeAndContinue: 'Agree and Continue'
  },
  zh: {
    // Header
    title: '股票估值分析器',
    subtitle: 'AI驱动的专业股票分析平台',
    
    // Search Form
    searchPlaceholder: '目前支持美股和A股 (例如: AAPL, 002915)',
    searchButton: '搜索',
    generateReport: '生成报告',
    
    // Stock Information
    stockInformation: '股票信息',
    price: '价格',
    marketCap: '市值',
    peRatio: '市盈率',
    tradingVolume: '成交额 ($)',
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
    free: '免费',
    
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
    downloadError: '下载失败，请稍后重试',

    // Subscription Plans
    singleReport: '单篇报告',
    monthlySubscription: '月度订阅',
    advancedSubscription: '高级订阅',
    premiumVersion: '专业版',
    professionalStockAnalysis: '专业股票分析报告',
    realTimeMarketData: '实时市场数据',
    aiDrivenAnalysis: 'AI驱动分析',
    prioritySupport: '优先客服支持',
    deepIndustryAnalysis: '深度行业分析',
    dailyKLineAnalysis: '每日K线技术分析',
    vipExclusiveService: 'VIP专属服务',
    popular: '热门',
    bestValue: '最超值',
    subscribe: '订阅',
    pleaseLoginFirst: '请先登录',
    invalidPlan: '无效的订阅计划',

    // User Info
    not_logged_in: 'Not Logged In',
    whitelist_user: 'Whitelist User',
    free_trial: 'Free Trial',
    subscription_active: 'Subscribed',
    subscription_required: 'Need Subscription',
    logout: 'Logout',
    login: 'Login',
    remaining_reports: 'Remaining Reports',
    reports_used: 'Reports Used',
    subscription_info: 'Subscription Info',
    subscription_type: 'Subscription Type',

    subscription_end: 'Subscription End',
    reports_used_this_month: 'Reports Used This Month',
    subscription_plan: 'Subscription Plan',
    remaining_reports_available: 'You have',
    or_choose_subscription: '次报告可用，或选择订阅获得更多报告。',
    free_reports_used_up: 'Your free reports are used up',
    please_choose_subscription_plan: 'Please choose a subscription plan to continue.',
    view_subscription_plan: 'View Subscription Plan',
    free_reports_used_up_please_choose_subscription: 'Your free reports are used up, please choose a subscription plan to continue.',
    start_using: 'Get Started',
    after_login_you_will_get_1_free_report_or_choose_subscription_plan: 'After login, you will get 1 free report, or choose a subscription plan for more reports.',
    login_now: 'Login Now',

    // User Agreement
    userServiceAgreement: 'AI股票基本面估值分析平台用户服务协议',
    effectiveDate: '生效日期：用户签署当日',
    importantNotice: '重要提示',
    agreementNotice: '在使用本平台服务前，请您务必仔细阅读并充分理解本协议所有条款，特别是涉及免责、限制责任的条款。您点击"同意"或使用本平台服务，即表示您已充分阅读、理解并接受本协议的全部内容。',
    
    // Agreement Sections
    serviceNature: '第一条 服务性质说明',
    serviceNature1: '1.1 本平台提供的是基于人工智能技术的股票基本面数据分析工具服务，所有分析结果均由AI算法自动生成，不构成任何投资建议、推荐或承诺。',
    serviceNature2: '1.2 本平台收取的费用仅为提供AI算力、数据处理和技术服务的对价，不是投资咨询费用或投资收益分成。',
    serviceNature3: '1.3 本平台不是持牌金融机构，不提供证券投资咨询、资产管理或任何需要金融牌照的服务。',
    
    aiContentDeclaration: '第二条 AI生成内容声明',
    aiContent1: '2.1 本平台所有分析报告、估值结果、数据解读均为人工智能算法基于公开数据自动生成，可能存在以下局限性：',
    aiContentLimitations: [
      '数据准确性和时效性受限于数据源',
      'AI模型可能存在偏差或错误',
      '分析结果可能与实际情况存在重大差异',
      '无法预测突发事件和市场异常波动'
    ],
    aiContent2: '2.2 AI生成的内容仅供参考，不能替代专业投资顾问的判断和建议。',
    
    investmentRiskWarning: '第三条 投资风险警示',
    investmentRisk1: '3.1 股票投资具有高风险性，可能导致本金的部分或全部损失。用户应当充分认识到：',
    investmentRiskPoints: [
      '股票市场价格波动剧烈且不可预测',
      '过往业绩不代表未来表现',
      '任何分析工具都无法保证投资收益',
      '投资决策应基于个人风险承受能力'
    ],

    // Auth Modal
    loginTitle: '登录',
    registerTitle: '注册',
    register: '注册',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    forgotPassword: '忘记密码？',
    noAccount: '没有账户？',
    hasAccount: '已有账户？',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功',
    loginError: '登录失败',
    registerError: '注册失败',
    loginFailed: '登录失败',
    registerFailed: '注册失败',
    passwordMismatch: '密码不匹配',
    invalidEmail: '邮箱格式无效',
    weakPassword: '密码至少6位',

    // Main Page
    getStarted: '开始使用',
    loginToGetReport: '登录后即可获得1篇免费报告，或选择订阅计划获得更多报告。',
    loginNow: '立即登录',

    // Toast Messages
    pleaseLoginFirstToast: '请先登录',
    invalidSubscriptionPlan: '无效的订阅计划',
    paymentCreationFailed: '支付创建失败',
    agreementRequired: '请同意所有条款',
    allAgreementsRequired: '请同意所有条款和条件',
    
    // Subscription Plans (for SubscriptionModal)
    subscriptionPlans: '订阅计划',
    planFeatures: '计划特色',
    choosePlan: '选择计划',

    // New subscription plan keys
    basicPlan: '基础版',
    standardPlan: '标准版',
    proPlan: '专业版',
    flagshipPlan: '旗舰版',
    monthlyFee: '月费',
    welcomeCredits: '欢迎积分',
    monthlyCredits: '每月积分',
    dailyGrowth: '每日增长',
    totalMonthlyCredits: '每月总积分',
    costPerReport: '每份报告成本',
    onDemandLimit: '按需限制',
    unlimited: '无限',
    aiDrivenDeepAnalysis: 'AI驱动深度分析',
    priorityCustomerSupport: '优先客服支持',
    technicalAnalysisVipConsulting: '技术分析VIP咨询',
    freeStart: '免费开始',
    upgradeSave34: '升级省34%',
    upgradeToPro: '升级到专业版',
    contactUsUpgrade: '联系我们升级',
    credits: '积分',
    reports: '报告',
    perDay: '每日',
    perMonth: '每月',
    onDemandPurchase: '按需购买',
    dailyLimit2: '每日限制2',
    noLimit: '无限制',
    planComparison: '计划对比',
    buttonActions: '按钮操作',

    // User Agreement Modal Additional Keys
    userConfirmation: '我同意本协议的所有条款和条件',
    userConfirmationText: '点击“同意并继续”，即表示您已阅读、理解并接受本协议的所有条款和条件。',
    aiAnalysisAgreement: '我同意本平台所有分析报告、估值结果和数据解读均由人工智能算法基于公开数据自动生成，可能存在局限性。',
    investmentRiskAgreement: '我同意股票投资具有高风险性，可能导致本金的部分或全部损失。用户应当充分认识到，股票市场价格波动剧烈且不可预测，过往业绩不代表未来表现，任何分析工具都无法保证投资收益，投资决策应基于个人风险承受能力。',
    selfResponsibilityAgreement: '我同意本人对自己的投资决策承担全部责任，并承担与本人投资相关的所有风险。',
    noLiabilityAgreement: '我同意本平台不对因本人使用本平台或依赖本平台提供的信息而产生的任何直接、间接、偶然、特殊、附带或衍生损害承担责任。',
    serviceFeeAgreement: '我同意本平台收取的费用仅为提供AI算力、数据处理和技术服务的对价，不是投资咨询费用或投资收益分成。',
    cancel: '取消',
    agreeAndContinue: '同意并继续'
  }
}

export function getTranslation(locale: Locale, key: Exclude<keyof TranslationKeys, 'aiContentLimitations' | 'investmentRiskPoints'>): string {
  if (!translations[locale]) {
    console.error(`Locale '${locale}' not found in translations`)
    return translations.en[key] || key
  }
  
  return translations[locale][key] || translations.en[key] || key
}

// 为数组类型的翻译键提供特殊函数
export function getTranslationArray(locale: Locale, key: 'aiContentLimitations' | 'investmentRiskPoints'): string[] {
  if (!translations[locale]) {
    return translations.en[key] || []
  }
  
  return translations[locale][key] || translations.en[key] || []
}

export type TranslationKey = keyof TranslationKeys 