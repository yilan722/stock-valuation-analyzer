import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface ReportHistoryItem {
  symbol: string
  reportData: any
  createdAt: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companies, userId, locale = 'zh' } = body

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({ error: '公司列表不能为空' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: '用户ID不能为空' }, { status: 400 })
    }

    console.log('🔍 服务器端开始Gemini分析:', companies.map(c => ({ symbol: c.symbol, name: c.name })))

    // 1. 首先尝试从Report History获取最新数据
    let reportHistoryData: ReportHistoryItem[] = []
    try {
      const symbols = companies.map(c => c.symbol)
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .in('stock_symbol', symbols)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('⚠️ Supabase查询失败:', error)
        // 继续执行，不因为Supabase失败而中断整个分析
      } else if (reports) {
        reportHistoryData = reports.map(report => ({
          symbol: report.stock_symbol,
          reportData: JSON.parse(report.report_data),
          createdAt: report.created_at
        }))
        console.log('✅ 成功加载Report History数据:', reportHistoryData.length, '份报告')
      }
    } catch (error) {
      console.warn('⚠️ 加载Report History数据失败:', error)
      // 继续执行，不因为Supabase失败而中断整个分析
    }

    // 2. 构建增强的提示词，整合Report History数据
    const reportHistoryContext = reportHistoryData.length > 0 
      ? `\n\n**重要：已从Report History获取到以下最新数据，请优先使用：**
${reportHistoryData.map(r => `- ${r.symbol}: ${r.reportData.fundamentalAnalysis?.substring(0, 200) || '无详细数据'} (更新时间: ${new Date(r.createdAt).toLocaleDateString('zh-CN')})`).join('\n')}

请基于这些最新数据进行分析，确保数据的一致性和时效性。`
      : ''

    const enhancedPrompt = `你是一位专业的股票分析师，请对以下公司进行多公司对比分析，生成专业的投资分析报告。

**CRITICAL QUALITY REQUIREMENTS (MOST IMPORTANT):**
- **MUST generate ONLY high-quality, accurate, and professional content**
- **MUST use ONLY verified, up-to-date financial data from official sources**
- **MUST NOT generate any low-quality, generic, or inaccurate content**
- **MUST NOT use placeholder data, estimated values, or fabricated information**
- **MUST verify all data points before including them in the report**
- **MUST provide specific, actionable insights based on real data**

**分析要求：**
- 使用${locale === 'zh' ? '中文' : 'English'}进行分析
- 必须基于最新的财务数据和市场信息
- 提供客观、专业的分析，不构成投资建议
- 重点关注公司间的对比优势和投资价值

**公司列表：**
${companies.map(c => `${c.symbol} (${c.name})`).join(', ')}

**CRITICAL DATA REQUIREMENTS (MOST IMPORTANT):**
- **MUST use ONLY 2025 Q1/Q2 financial data if available, 2024 Q4 as absolute latest fallback**
- **MUST search for and include the most recent quarterly/annual reports published in the last 3 months**
- **MUST verify data freshness - NO data older than 3 months unless explicitly stated as historical**
- **MUST include exact publication dates for all financial data (e.g., "Q1 2025 Report published March 15, 2025")**
- **MUST search official company websites, SEC filings, and financial news for latest data**
- **MUST clearly label each data point as "PUBLISHED" (released) or "PREDICTED" (analyst estimates)**
- **MUST provide source links for ALL financial data, news, and market information**
- **MUST include data sources and references for ALL key metrics and analysis points**
- **MUST add source links for users to verify EVERY piece of data**

**分析结构要求：**
请按照以下格式生成分析结果，返回JSON格式：

1. **overview** (概览分析): 行业整体趋势、各公司地位、投资机会和风险，包含数据来源
2. **radarData** (雷达图数据): 五维评分数据，格式为：
   - ${companies.map(c => `${c.symbol}: [盈利能力, 财务健康, 成长性, 估值, 政策受益]`).join('\n   - ')}
   - 每个评分必须基于最新财务数据，并标注数据来源
3. **comparisonTable** (对比表): 关键指标对比表格，包含：
   - 公司名称、营收、净利润、ROE、资产负债率、PE、PB、收入增速等
   - 所有数据必须包含来源链接和发布日期
4. **aiRecommendation** (AI推荐): 投资建议和风险提示，基于最新市场数据

**数据要求：**
- **CRITICAL: Use ONLY the LATEST available financial data (2025 Q1/Q2 if available, 2024 Q4 as fallback)**
- **CRITICAL: NO financial data older than 3 months unless explicitly stated as historical**
- **CRITICAL: ALL data points MUST include source links and publication dates**
- **CRITICAL: Clearly label data as "PUBLISHED" or "PREDICTED"**
- 如果Report History中有数据，优先使用但必须验证其时效性
- 确保数据的一致性和准确性
- 提供数据来源说明和验证链接

**质量要求：**
- 所有分析必须基于真实、可验证的数据
- 必须包含具体的数字、百分比和财务指标
- 必须提供详细的分析逻辑和推理过程
- 禁止使用通用模板或占位符内容

**输出格式：**
请返回有效的JSON格式，包含上述四个字段。${reportHistoryContext}

请确保分析内容详细、专业，符合投资研究标准。所有数据必须是最新的，并且包含可验证的来源链接。

**重要：如果无法获取足够的最新数据或无法验证信息准确性，请明确说明原因，不要生成低质量的分析内容。**`

    // 3. 调用Gemini API
    console.log('🚀 调用Gemini API进行真实分析...')
    
    try {
      const geminiResponse = await fetch('https://api.nuwaapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPUS4_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gemini-2.5-pro',
          messages: [
            {
              role: 'system',
              content: enhancedPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 15000
        })
      })

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API调用失败: ${geminiResponse.status} ${geminiResponse.statusText}`)
      }

      const geminiData = await geminiResponse.json()
      console.log('📡 Gemini API响应:', geminiData)
      
      if (!geminiData.choices || geminiData.choices.length === 0) {
        throw new Error('Gemini API返回空响应')
      }

      const content = geminiData.choices[0].message.content
      console.log('📝 Gemini生成内容长度:', content.length)
      console.log('📝 Gemini生成内容前500字符:', content.substring(0, 500))
      
      // 解析Gemini响应
      const parsedAnalysis = parseGeminiResponse(content, companies)
      console.log('🔍 解析后的分析数据:', parsedAnalysis)
      
      // 验证分析一致性
      const validatedAnalysis = validateAnalysisConsistency(parsedAnalysis, companies)
      console.log('✅ 验证后的分析数据:', validatedAnalysis)
      
      return NextResponse.json(validatedAnalysis)

    } catch (apiError) {
      console.error('❌ Gemini API调用异常:', apiError)
      // 如果API调用失败，返回备用分析
      return NextResponse.json({
        success: true,
        analysis: generateFallbackAnalysis(companies, locale, reportHistoryData),
        reportHistoryCount: reportHistoryData.length,
        dataSource: '备用分析逻辑 (API调用失败)',
        error: apiError instanceof Error ? apiError.message : '未知API错误'
      })
    }

  } catch (error) {
    console.error('❌ Gemini分析失败:', error)
    return NextResponse.json({ 
      error: '分析失败', 
      details: error instanceof Error ? error.message : '未知错误' 
    }, { status: 500 })
  }
}

// 备用分析逻辑
function generateFallbackAnalysis(companies: any[], locale: string, reportHistoryData: any[]) {
  const currentDate = new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')
  
  return {
    overview: `基于${currentDate}的数据，对${companies.map(c => `${c.symbol}(${c.name})`).join('、')}进行分析。建议投资者关注基本面变化，谨慎投资。`,
    radarData: {
      rawText: companies.map(c => `${c.symbol}评分：盈利能力6/10，财务健康6/10，成长性6/10，估值6/10，政策受益6/10`).join('\n')
    },
    comparisonTable: `| 公司 | 目标价 | 上涨空间 | PE比率 | ROE |\n|------|--------|----------|--------|-----|\n${companies.map(c => `${c.symbol} | $${c.keyMetrics?.targetPrice?.toFixed(2) || '0.00'} | +${c.keyMetrics?.upsidePotential?.toFixed(1) || '0.0'}% | ${c.keyMetrics?.peRatio?.toFixed(2) || '0.00'} | ${c.keyMetrics?.roe?.toFixed(1) || '0.0'}%`).join('\n')}`,
    aiRecommendation: `基于当前市场环境，建议投资者：\n1. 关注基本面变化\n2. 控制投资风险\n3. 分散投资组合\n4. 定期评估持仓`
  }
}

// 解析Gemini响应
function parseGeminiResponse(content: string, companies: any[]) {
  console.log('🔍 开始解析Gemini响应...')
  console.log('📝 原始内容长度:', content.length)
  
  try {
    // 方法1: 尝试提取JSON代码块
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      console.log('✅ 找到JSON代码块，长度:', jsonMatch[1].length)
      const jsonString = jsonMatch[1]
      const parsed = JSON.parse(jsonString)
      console.log('✅ JSON解析成功:', Object.keys(parsed))
      
      return {
        overview: parsed.overview || '概览分析内容',
        radarData: {
          rawText: parsed.radarData || companies.map(c => `${c.symbol}: [6, 6, 6, 6, 6]`).join('\n')
        },
        comparisonTable: parsed.comparisonTable || '对比表内容',
        aiRecommendation: parsed.aiRecommendation || 'AI推荐内容'
      }
    }
    
    // 方法2: 尝试直接解析整个内容为JSON
    console.log('🔄 尝试直接解析为JSON...')
    const parsed = JSON.parse(content)
    console.log('✅ 直接JSON解析成功:', Object.keys(parsed))
    
    return {
      overview: parsed.overview || '概览分析内容',
      radarData: {
        rawText: parsed.radarData || companies.map(c => `${c.symbol}: [6, 6, 6, 6, 6]`).join('\n')
      },
      comparisonTable: parsed.comparisonTable || '对比表内容',
      aiRecommendation: parsed.aiRecommendation || 'AI推荐内容'
    }
    
  } catch (error) {
    console.warn('⚠️ JSON解析失败，使用智能分割:', error)
    return intelligentContentSplit(content, companies)
  }
}

// 智能内容分割
function intelligentContentSplit(content: string, companies: any[]) {
  console.log('🔍 开始智能内容分割...')
  
  const sections = {
    overview: '',
    radarData: { rawText: '' },
    comparisonTable: '',
    aiRecommendation: ''
  }
  
  // 尝试识别概览部分
  const overviewPatterns = [
    /概览分析?[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i,
    /overview[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i,
    /行业整体趋势[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i
  ]
  
  for (const pattern of overviewPatterns) {
    const match = content.match(pattern)
    if (match && match[1].trim().length > 50) {
      sections.overview = match[1].trim()
      console.log('✅ 找到概览部分，长度:', sections.overview.length)
      break
    }
  }
  
  // 尝试识别雷达图数据
  const radarPatterns = [
    /雷达图数据[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i,
    /radarData[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i,
    /五维评分[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i
  ]
  
  for (const pattern of radarPatterns) {
    const match = content.match(pattern)
    if (match && match[1].trim().length > 20) {
      sections.radarData.rawText = match[1].trim()
      console.log('✅ 找到雷达图数据，长度:', sections.radarData.rawText.length)
      break
    }
  }
  
  // 如果没有找到雷达图数据，生成默认数据
  if (!sections.radarData.rawText) {
    sections.radarData.rawText = companies.map(c => `${c.symbol}: [6, 6, 6, 6, 6]`).join('\n')
    console.log('⚠️ 生成默认雷达图数据')
  }
  
  // 尝试识别对比表
  const tablePatterns = [
    /对比表[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i,
    /comparisonTable[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i,
    /关键指标对比[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i
  ]
  
  for (const pattern of tablePatterns) {
    const match = content.match(pattern)
    if (match && match[1].trim().length > 50) {
      sections.comparisonTable = match[1].trim()
      console.log('✅ 找到对比表，长度:', sections.comparisonTable.length)
      break
    }
  }
  
  // 如果没有找到对比表，生成默认表格
  if (!sections.comparisonTable) {
    sections.comparisonTable = `| 公司 | 目标价 | 上涨空间 | PE比率 | ROE |\n|------|--------|----------|--------|-----|\n${companies.map(c => `${c.symbol} | $0.00 | +0.0% | 0.00 | 0.0%`).join('\n')}`
    console.log('⚠️ 生成默认对比表')
  }
  
  // 尝试识别AI推荐
  const recommendationPatterns = [
    /AI推荐[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i,
    /aiRecommendation[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i,
    /投资建议[：:]\s*([\s\S]*?)(?=\n\n|\n##|\n#|\n\d+\.|$)/i
  ]
  
  for (const pattern of recommendationPatterns) {
    const match = content.match(pattern)
    if (match && match[1].trim().length > 50) {
      sections.aiRecommendation = match[1].trim()
      console.log('✅ 找到AI推荐，长度:', sections.aiRecommendation.length)
      break
    }
  }
  
  // 如果没有找到AI推荐，生成默认内容
  if (!sections.aiRecommendation) {
    sections.aiRecommendation = '基于分析，建议投资者关注基本面变化，谨慎投资。'
    console.log('⚠️ 生成默认AI推荐')
  }
  
  // 如果没有找到概览，使用内容开头作为概览
  if (!sections.overview) {
    sections.overview = content.substring(0, Math.min(500, content.length))
    console.log('⚠️ 使用内容开头作为概览，长度:', sections.overview.length)
  }
  
  console.log('✅ 智能分割完成，各字段长度:', {
    overview: sections.overview.length,
    radarData: sections.radarData.rawText.length,
    comparisonTable: sections.comparisonTable.length,
    aiRecommendation: sections.aiRecommendation.length
  })
  
  return sections
}

// 验证分析一致性
function validateAnalysisConsistency(analysis: any, companies: any[]) {
  // 确保所有必需字段都存在
  const requiredFields = ['overview', 'radarData', 'comparisonTable', 'aiRecommendation']
  requiredFields.forEach(field => {
    if (!analysis[field]) {
      analysis[field] = `默认${field}内容`
    }
  })
  
  // 确保雷达图数据包含所有公司
  if (analysis.radarData?.rawText) {
    const hasAllCompanies = companies.every(c => analysis.radarData.rawText.includes(c.symbol))
    if (!hasAllCompanies) {
      analysis.radarData.rawText += '\n' + companies.map(c => `${c.symbol}: [6, 6, 6, 6, 6]`).join('\n')
    }
  }
  
  return analysis
}
