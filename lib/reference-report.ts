/**
 * 参考报告标准格式
 * 基于 300080_valuation_report_2025-08-30.pdf 提取的专业格式标准
 */

import { readFileSync } from 'fs'
import { join } from 'path'

export interface ReferenceReportData {
  metadata: {
    title: string
    page_count: number
    creation_date: string
  }
  structure: {
    sections: Array<{
      title: string
      start_pos: number
      pattern_used: string
    }>
    tables: Array<{
      page: number
      table_index: number
      headers: string[]
      rows: string[][]
      row_count: number
    }>
    key_metrics: Array<{
      metric: string
      value: string
      unit: string
      position: number
    }>
  }
  pages: Array<{
    page_number: number
    text: string
    length: number
  }>
  full_text: string
}

export interface ReportTableTemplate {
  section: string
  title: string
  headers: string[]
  sample_data: string[][]
  css_classes: string[]
  data_source_required: boolean
}

export interface ReportSectionTemplate {
  key: string
  title: string
  required_tables: number
  min_word_count: number
  required_elements: string[]
  sample_structure: string
}

/**
 * 获取参考报告数据
 */
export function getReferenceReportData(): ReferenceReportData | null {
  try {
    const dataPath = join(process.cwd(), 'reference-reports', 'report_content.json')
    const rawData = readFileSync(dataPath, 'utf-8')
    return JSON.parse(rawData)
  } catch (error) {
    console.error('无法读取参考报告数据:', error)
    return null
  }
}

/**
 * 获取报告章节模板
 */
export function getReportSectionTemplates(): ReportSectionTemplate[] {
  return [
    {
      key: 'fundamentalAnalysis',
      title: '基本面分析',
      required_tables: 2,
      min_word_count: 500,
      required_elements: [
        '公司概览和商业模式',
        '关键财务指标分析',
        '盈利能力和运营效率', 
        '现金流和财务健康状况',
        '数据来源标注'
      ],
      sample_structure: `
        1. 公司概览和商业模式 (100-150字)
        2. 关键财务指标分析 + 财务指标对比表
        3. 盈利能力和运营效率 + 运营指标对比表  
        4. 现金流和财务健康状况 (150-200字)
        5. 数据来源标注
      `
    },
    {
      key: 'businessSegments',
      title: '业务板块分析',
      required_tables: 2,
      min_word_count: 500,
      required_elements: [
        '主营业务收入构成分析',
        '业务板块收入结构表',
        '核心业务板块深度分析',
        '新兴业务板块增长动力',
        '区域分布和市场份额'
      ],
      sample_structure: `
        1. 主营业务收入构成分析 (100字)
        2. 业务板块收入结构表
        3. 核心业务板块深度分析 (150字)
        4. 新兴业务板块增长动力 + 新兴业务分析表
        5. 区域分布和市场份额 (100字)
      `
    },
    {
      key: 'growthCatalysts',
      title: '增长催化剂',
      required_tables: 2,
      min_word_count: 500,
      required_elements: [
        '业务转型升级驱动增长',
        '产业发展机遇',
        '政策支持和行业利好',
        '技术创新和产品升级',
        '市场扩张和战略布局'
      ],
      sample_structure: `
        1. 业务转型升级驱动增长 (100字)
        2. 产业发展机遇 + 市场机会分析表
        3. 政策支持和行业利好 (100字)
        4. 技术创新和产品升级 + 技术发展分析表
        5. 市场扩张和战略布局 (100字)
      `
    },
    {
      key: 'valuationAnalysis',
      title: '估值分析',
      required_tables: 3,
      min_word_count: 500,
      required_elements: [
        '基于重组的价值重估',
        '分部估值分析',
        '现金流折现分析',
        '可比公司估值分析',
        '风险评估和投资建议'
      ],
      sample_structure: `
        1. 基于重组的价值重估 (100字)
        2. 分部估值分析 + 分部估值表
        3. 现金流折现分析 + DCF关键假设表
        4. 可比公司估值分析 + 可比公司对比表
        5. 风险评估和投资建议 + 明确评级
      `
    }
  ]
}

/**
 * 获取表格模板
 */
export function getReportTableTemplates(): ReportTableTemplate[] {
  return [
    {
      section: 'fundamentalAnalysis',
      title: '关键财务指标分析',
      headers: ['财务指标', '2025年上半年', '2024年上半年', '同比变化', '评价'],
      sample_data: [
        ['营业收入', '20.69亿元', '18.86亿元', '+9.71%', '收入增长稳健'],
        ['归母净利润', '-1.70亿元', '-4.43亿元', '收窄61.65%', '亏损大幅收窄'],
        ['扣非归母净利润', '-1.95亿元', '-4.64亿元', '收窄58%', '经营性亏损改善'],
        ['基本每股收益', '-0.0907元', '-0.2080元', '改善56.39%', '盈利能力提升'],
        ['资产负债率', '63.97%', '--', '--', '偏高']
      ],
      css_classes: ['metric-table', 'highlight-box'],
      data_source_required: true
    },
    {
      section: 'fundamentalAnalysis', 
      title: '盈利能力和运营效率',
      headers: ['运营指标', '2025年上半年', '2024年上半年', '同比变化', '行业对比'],
      sample_data: [
        ['毛利率', '6.19%', '4.65%', '+33.19%', '低于行业平均'],
        ['净利率', '-10.59%', '-28.87%', '+63.24%', '仍处负值'],
        ['三费占收比', '11.88%', '17.30%', '-31.32%', '费用控制改善'],
        ['流动比率', '1.07', '1.18', '-9.32%', '流动性承压'],
        ['每股净资产', '2.64元', '2.88元', '-8.35%', '资产价值下降']
      ],
      css_classes: ['metric-table'],
      data_source_required: true
    },
    {
      section: 'businessSegments',
      title: '业务板块收入结构',
      headers: ['业务板块', '收入金额(万元)', '收入占比', '同比增长率', '发展趋势'],
      sample_data: [
        ['其他产品', '1016.93', '29.72%', '-33.94%', '规模最大但下降'],
        ['边框', '921.08', '26.92%', '+1.62%', '稳定增长'],
        ['石墨电极及相关产品', '445.32', '13.01%', '-41.18%', '传统业务承压'],
        ['电池片', '389.76', '11.39%', '-93.74%', '战略性剥离'],
        ['石墨产品', '212.84', '6.22%', '+59.67%', '高成长潜力']
      ],
      css_classes: ['metric-table', 'positive', 'negative'],
      data_source_required: true
    },
    {
      section: 'businessSegments',
      title: '新兴业务板块增长动力',
      headers: ['新兴业务', '2025H1收入', '增长率', '市场地位', '发展前景'],
      sample_data: [
        ['光伏发电', '181.13万元', '+70.23%', '计划新增500MW', '装机1GW左右'],
        ['石墨产品', '212.84万元', '+59.67%', '技术升级中', '向特种石墨转型'],
        ['锂电池', '161.82万元', '-19.22%', '负极材料优势', '目标增长50%'],
        ['光伏施工', '93.28万元', '+432.57%', '快速扩张期', '受益新能源建设'],
        ['储能业务', '未单独披露', '--', '全钒液流1GW产能', '扩至2GW产能']
      ],
      css_classes: ['metric-table', 'positive'],
      data_source_required: true
    },
    {
      section: 'growthCatalysts',
      title: '储能产业发展机遇',
      headers: ['储能市场指标', '2024年数据', '增长率', '2025年预期', '市场机会'],
      sample_data: [
        ['全球储能电池出货', '369.8GWh', '+64.9%', '430.7GWh', '千亿级市场'],
        ['中国储能锂电池出货', '335GWh', '+64%', '持续高增长', '龙头地位巩固'],
        ['中国新型储能装机', '78.3GW', '+149.4%', '持续翻倍增长', '政策强力支持'],
        ['易成新能全钒液流产能', '1GW', '--', '计划扩至2GW', '产能翻倍扩张'],
        ['风光电站装机目标', '1GW存量', '--', '新增500MW', '发电收入增长']
      ],
      css_classes: ['metric-table', 'positive'],
      data_source_required: true
    },
    {
      section: 'growthCatalysts',
      title: '技术创新和产品升级',
      headers: ['技术领域', '当前状况', '技术优势', '市场前景', '投资计划'],
      sample_data: [
        ['全钒液流电池', '1GW产能', '技术相对成熟', 'GWh级集采启动', '扩至2GW产能'],
        ['特种石墨', '产品升级中', '半导体级产品', '百亿美元市场', '持续研发投入'],
        ['碳化硅材料', '布局阶段', '高成长赛道', '第三代半导体', '重点发展领域'],
        ['锂电负极材料', '产业化生产', '一体化优势', '竞争激烈', '技术升级改造'],
        ['四代金刚石半导体', '前瞻布局', '前沿技术', '未来蓝海', '重点关注领域']
      ],
      css_classes: ['metric-table'],
      data_source_required: true
    },
    {
      section: 'valuationAnalysis',
      title: '分部估值分析 (Sum-of-Parts)',
      headers: ['业务分部', '收入占比', '估值倍数', '估值(亿元)', '发展阶段'],
      sample_data: [
        ['高端碳材料', '48.95%', '2.5x P/S', '25.35', '转型升级期'],
        ['储能业务', '未单独披露', '8x P/S', '35-40', '高成长期'],
        ['光伏发电', '5.29%', '12x P/E', '15-20', '稳定收益期'],
        ['光伏施工', '2.73%', '3x P/S', '1.86', '快速扩张期'],
        ['其他业务', '43.03%', '1.5x P/S', '13.34', '传统业务']
      ],
      css_classes: ['metric-table', 'recommendation-buy'],
      data_source_required: true
    },
    {
      section: 'valuationAnalysis',
      title: '现金流折现分析 (DCF)',
      headers: ['DCF关键假设', '2025E', '2026E', '2027E', '长期增长率'],
      sample_data: [
        ['营业收入(亿元)', '45', '52', '60', '3%'],
        ['营业利润率', '2%', '5%', '8%', '8%'],
        ['税率', '25%', '25%', '25%', '25%'],
        ['WACC', '9.5%', '9.5%', '9.5%', '9.5%'],
        ['自由现金流(亿元)', '-2', '1.5', '4.2', '稳定增长']
      ],
      css_classes: ['metric-table'],
      data_source_required: true
    },
    {
      section: 'valuationAnalysis',
      title: '可比公司估值分析',
      headers: ['可比公司', '市值(亿元)', '2025E P/S', '业务相似度', '估值溢价/折价'],
      sample_data: [
        ['贝特瑞', '380', '2.8x', '负极材料', '溢价30%'],
        ['上海电气', '650', '1.2x', '储能系统', '折价20%'],
        ['杉杉科技', '280', '2.1x', '碳材料', '溢价15%'],
        ['易成新能', '78.68', '1.75x', '综合业务', '基准'],
        ['行业平均', '--', '2.0x', '--', '--']
      ],
      css_classes: ['metric-table'],
      data_source_required: true
    }
  ]
}

/**
 * 获取专业样式CSS类名
 */
export function getProfessionalStyleClasses(): Record<string, string> {
  return {
    'metric-table': 'width: 100%; border-collapse: collapse; border: 1px solid #ddd; background: white;',
    'highlight-box': 'margin: 20px 0; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);',
    'positive': 'color: #059669; font-weight: 600;',
    'negative': 'color: #dc2626; font-weight: 600;',
    'neutral': 'color: #6b7280; font-weight: 600;',
    'recommendation-buy': 'background: #dcfce7; color: #166534; padding: 8px 12px; border-radius: 4px; font-weight: bold;',
    'recommendation-sell': 'background: #fecaca; color: #991b1b; padding: 8px 12px; border-radius: 4px; font-weight: bold;',
    'recommendation-hold': 'background: #fef3c7; color: #92400e; padding: 8px 12px; border-radius: 4px; font-weight: bold;'
  }
}

/**
 * 生成数据来源标注HTML
 */
export function generateDataSourceAnnotation(sources: string[]): string {
  return `
    <div style="position: absolute; top: -5px; right: 0; font-size: 11px; color: #666; background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">
      数据来源: ${sources.join(', ')}
    </div>
  `
}

/**
 * 验证报告格式是否符合标准
 */
export function validateReportFormat(report: any): {
  isValid: boolean
  errors: string[]
  score: number
} {
  const errors: string[] = []
  const templates = getReportSectionTemplates()
  let score = 0
  const maxScore = 100
  
  // 检查必需字段
  const requiredSections = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis']
  for (const section of requiredSections) {
    if (!report[section]) {
      errors.push(`缺少必需部分: ${section}`)
    } else {
      score += 20 // 每个部分20分
      
      // 检查内容长度
      const template = templates.find(t => t.key === section)
      if (template) {
        const content = report[section].replace(/<[^>]*>/g, '').trim()
        if (content.length < template.min_word_count) {
          errors.push(`${section} 内容过短 (${content.length} < ${template.min_word_count})`)
          score -= 5
        }
        
        // 检查表格数量
        const tableCount = (report[section].match(/<table/g) || []).length
        if (tableCount < template.required_tables) {
          errors.push(`${section} 表格不足 (${tableCount} < ${template.required_tables})`)
          score -= 5
        }
      }
    }
  }
  
  // 检查数据来源
  for (const section of requiredSections) {
    if (report[section] && !report[section].includes('数据来源')) {
      errors.push(`${section} 缺少数据来源标注`)
      score -= 2
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    score: Math.max(0, Math.min(maxScore, score))
  }
}

export default {
  getReferenceReportData,
  getReportSectionTemplates,
  getReportTableTemplates,
  getProfessionalStyleClasses,
  generateDataSourceAnnotation,
  validateReportFormat
}
