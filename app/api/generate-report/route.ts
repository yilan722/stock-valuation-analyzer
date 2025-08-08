import { NextRequest, NextResponse } from 'next/server'
import { StockData, ValuationReportData } from '../../../types'

const OPUS4_API_URL = 'https://api.nuwaapi.com/v1/chat/completions'
const OPUS4_API_KEY = 'sk-GNBf5QFmnepeBZddwH612o5vEJQFMq6z8gUAyre7tAIrGeA8'

export async function POST(request: NextRequest) {
  try {
    const { stockData, locale } = await request.json()

    if (!stockData) {
      return NextResponse.json(
        { error: 'Stock data is required' },
        { status: 400 }
      )
    }

    const isEnglish = locale === 'en'

    const prompt = isEnglish ?
      `Generate a comprehensive stock valuation analysis report for ${stockData.name} (${stockData.symbol}) with the following data:

      Current Price: $${stockData.price}
      Market Cap: $${(stockData.marketCap / 1e9).toFixed(2)}B
      P/E Ratio: ${stockData.peRatio}
      Trading Amount: $${(stockData.amount / 1e6).toFixed(2)}M
      Change: ${stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)

      IMPORTANT: Please use the LATEST available financial data:
      - 2024 Annual Report (latest available)
      - 2025 Quarterly Reports (latest available)
      - Most recent financial statements and metrics

      Please provide a detailed analysis in the following JSON format with BEAUTIFUL HTML formatting:
      {
        "fundamentalAnalysis": "HTML content with professional styling including:
          - <h2>Company Overview</h2> with company description
          - <h3>Key Financial Metrics</h3> with a styled table showing revenue, profit, growth rates
          - <h3>Latest Financial Performance</h3> with 2024 annual and 2025 quarterly data in tables
          - Use CSS classes: 'metric-table', 'highlight-box', 'data-grid'
          - Include tables with proper styling for financial data
          - Use color coding for positive/negative values",
        "businessSegments": "HTML content with:
          - <h2>Business Segment Analysis</h2>
          - <h3>Revenue Breakdown</h3> with pie chart data in table format
          - <h3>Segment Performance</h3> with growth rates and margins
          - Use styled tables with headers and alternating row colors
          - Include percentage bars or visual indicators",
        "growthCatalysts": "HTML content with:
          - <h2>Growth Catalysts & Opportunities</h2>
          - <h3>Market Expansion</h3> with specific opportunities
          - <h3>Product Development</h3> with pipeline information
          - <h3>Strategic Initiatives</h3> with timeline and impact
          - Use bullet points with icons and progress indicators
          - Include risk factors in highlighted boxes",
        "valuationAnalysis": "HTML content with:
          - <h2>Valuation Methodology</h2>
          - <h3>DCF Analysis</h3> with key assumptions in table
          - <h3>Comparable Company Analysis</h3> with peer comparison table
          - <h3>Investment Recommendation</h3> with target price and rating
          - Use professional tables with financial models
          - Include sensitivity analysis in grid format
          - Add color-coded recommendation boxes"
      }

      Use professional HTML styling with:
      - Clean typography with proper heading hierarchy
      - Styled tables with borders, padding, and alternating row colors
      - Color-coded data (green for positive, red for negative, blue for neutral)
      - Highlight boxes for key insights
      - Professional spacing and layout
      - Data visualization elements where appropriate
      Make the analysis data-driven with specific numbers and professional presentation.` :

      `为${stockData.name} (${stockData.symbol})生成一份全面的股票估值分析报告，数据如下：

      当前价格: $${stockData.price}
      市值: $${(stockData.marketCap / 1e9).toFixed(2)}B
      市盈率: ${stockData.peRatio}
      成交额: $${(stockData.amount / 1e6).toFixed(2)}M
      涨跌幅: ${stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)

      重要提示：请使用最新的财务数据：
      - 2024年年报（最新可用）
      - 2025年季报（最新可用）
      - 最新的财务报表和指标

      请提供详细分析，使用以下JSON格式，包含美观的HTML格式：
      {
        "fundamentalAnalysis": "HTML内容，包含专业样式：
          - <h2>公司概况</h2> 包含公司描述
          - <h3>关键财务指标</h3> 使用样式表格显示收入、利润、增长率
          - <h3>最新财务表现</h3> 包含2024年报和2025季报数据的表格
          - 使用CSS类：'metric-table', 'highlight-box', 'data-grid'
          - 包含财务数据的样式表格
          - 对正负值使用颜色编码",
        "businessSegments": "HTML内容，包含：
          - <h2>业务细分分析</h2>
          - <h3>收入分解</h3> 以表格形式显示饼图数据
          - <h3>细分表现</h3> 包含增长率和利润率
          - 使用带标题和交替行颜色的样式表格
          - 包含百分比条或视觉指示器",
        "growthCatalysts": "HTML内容，包含：
          - <h2>增长催化剂与机会</h2>
          - <h3>市场扩张</h3> 包含具体机会
          - <h3>产品开发</h3> 包含管道信息
          - <h3>战略举措</h3> 包含时间线和影响
          - 使用带图标和进度指示器的要点
          - 在高亮框中包含风险因素",
        "valuationAnalysis": "HTML内容，包含：
          - <h2>估值方法</h2>
          - <h3>DCF分析</h3> 在表格中显示关键假设
          - <h3>可比公司分析</h3> 包含同行比较表格
          - <h3>投资建议</h3> 包含目标价格和评级
          - 使用带财务模型的专业表格
          - 在网格格式中包含敏感性分析
          - 添加颜色编码的建议框"
      }

      使用专业的HTML样式：
      - 清晰的排版，具有适当的标题层次结构
      - 带边框、内边距和交替行颜色的样式表格
      - 颜色编码数据（绿色为正，红色为负，蓝色为中性）
      - 关键见解的高亮框
      - 专业的间距和布局
      - 适当的数据可视化元素
      使分析数据驱动，包含具体数字和专业呈现。`

    const models = ['claude-opus-4-20250514', 'opus4', 'gpt-4', 'gpt-3.5-turbo']
    let content: string | null = null

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`)

        const response = await fetch(OPUS4_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPUS4_API_KEY}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 4000,
            temperature: 0.7
          })
        })

        if (!response.ok) {
          console.log(`Model ${model} failed with status: ${response.status}`)
          const errorText = await response.text()
          console.log(`Error response: ${errorText}`)
          continue
        }

        const data = await response.json()
        content = data.choices?.[0]?.message?.content

        if (content) {
          console.log(`Successfully generated report using ${model}`)
          break
        }
      } catch (error) {
        console.log(`Error with model ${model}:`, error)
        continue
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate report. All AI models are unavailable.' },
        { status: 500 }
      )
    }

    try {
      // 清理markdown代码块
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '')
      }

      const reportData = JSON.parse(cleanContent) as ValuationReportData
      return NextResponse.json(reportData)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw content:', content)
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 