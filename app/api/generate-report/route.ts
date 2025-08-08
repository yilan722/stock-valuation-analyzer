import { NextRequest, NextResponse } from 'next/server'
import { StockData, ValuationReportData } from '../../../types'
import { verifyToken, canGenerateReport, incrementReportUsage } from '../../../lib/auth'
import { prisma } from '../../../lib/database'

const OPUS4_API_URL = 'https://api.nuwaapi.com/v1/chat/completions'
const OPUS4_API_KEY = 'sk-GNBf5QFmnepeBZddwH612o5vEJQFMq6z8gUAyre7tAIrGeA8'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userSession = verifyToken(token)
    if (!userSession) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if user can generate report
    const canGenerate = await canGenerateReport(userSession.userId)
    if (!canGenerate.canGenerate) {
      return NextResponse.json(
        { error: canGenerate.reason || 'Cannot generate report' },
        { status: 403 }
      )
    }

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

      Please provide a detailed analysis in the following JSON format:
      {
        "fundamentalAnalysis": "<h2>Company Overview</h2><p>Company description with latest financial data.</p><h3>Key Financial Metrics</h3><table class='metric-table'><tr><th>Metric</th><th>Value</th><th>Growth</th></tr><tr><td>Revenue</td><td>$XXX</td><td class='positive'>+XX%</td></tr></table><h3>Latest Financial Performance</h3><p>2024 annual and 2025 quarterly analysis with tables.</p>",
        "businessSegments": "<h2>Business Segment Analysis</h2><h3>Revenue Breakdown</h3><table class='metric-table'><tr><th>Segment</th><th>Revenue</th><th>% of Total</th></tr></table><h3>Segment Performance</h3><p>Growth rates and margins analysis.</p>",
        "growthCatalysts": "<h2>Growth Catalysts & Opportunities</h2><h3>Market Expansion</h3><div class='highlight-box'><h4>Key Opportunities</h4><p>Specific market opportunities.</p></div><h3>Product Development</h3><p>Pipeline information and new products.</p><h3>Strategic Initiatives</h3><p>Timeline and impact analysis.</p>",
        "valuationAnalysis": "<h2>Valuation Methodology</h2><h3>DCF Analysis</h3><table class='metric-table'><tr><th>Assumption</th><th>Value</th></tr></table><h3>Comparable Company Analysis</h3><p>Peer comparison with tables.</p><h3>Investment Recommendation</h3><div class='recommendation-buy'><h4>Target Price: $XXX</h4><p>Detailed recommendation with rationale.</p></div>"
      }

      Use professional HTML styling with tables, highlight boxes, and color coding. Make the analysis data-driven with specific numbers.` :

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

      请提供详细分析，使用以下JSON格式：
      {
        "fundamentalAnalysis": "<h2>公司概况</h2><p>公司描述和最新财务数据。</p><h3>关键财务指标</h3><table class='metric-table'><tr><th>指标</th><th>数值</th><th>增长率</th></tr><tr><td>收入</td><td>XXX</td><td class='positive'>+XX%</td></tr></table><h3>最新财务表现</h3><p>2024年报和2025季报分析，包含表格。</p>",
        "businessSegments": "<h2>业务细分分析</h2><h3>收入分解</h3><table class='metric-table'><tr><th>细分</th><th>收入</th><th>占总收入%</th></tr></table><h3>细分表现</h3><p>增长率和利润率分析。</p>",
        "growthCatalysts": "<h2>增长催化剂与机会</h2><h3>市场扩张</h3><div class='highlight-box'><h4>关键机会</h4><p>具体市场机会。</p></div><h3>产品开发</h3><p>管道信息和新产品。</p><h3>战略举措</h3><p>时间线和影响分析。</p>",
        "valuationAnalysis": "<h2>估值方法</h2><h3>DCF分析</h3><table class='metric-table'><tr><th>假设</th><th>数值</th></tr></table><h3>可比公司分析</h3><p>同行比较，包含表格。</p><h3>投资建议</h3><div class='recommendation-buy'><h4>目标价格: XXX</h4><p>详细建议和理由。</p></div>"
      }

      使用专业的HTML样式，包含表格、高亮框和颜色编码。使分析数据驱动，包含具体数字。`

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
      
      // Save report to database
      await prisma.report.create({
        data: {
          userId: userSession.userId,
          stockSymbol: stockData.symbol,
          stockName: stockData.name,
          reportData: JSON.stringify(reportData)
        }
      })

      // Increment report usage
      const user = await prisma.user.findUnique({
        where: { id: userSession.userId }
      })
      
      if (user && user.freeReportsUsed === 0) {
        await incrementReportUsage(userSession.userId, true)
      } else {
        await incrementReportUsage(userSession.userId, false)
      }

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