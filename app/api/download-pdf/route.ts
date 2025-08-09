import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const { reportData, stockName, stockSymbol } = await request.json()

    if (!reportData) {
      return NextResponse.json(
        { error: 'Report data is required' },
        { status: 400 }
      )
    }

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${stockName} (${stockSymbol}) - 股票估值分析报告</title>
          <style>
            body {
              font-family: 'Microsoft YaHei', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2c3e50;
              margin: 0;
              font-size: 28px;
            }
            .header .subtitle {
              color: #7f8c8d;
              font-size: 16px;
              margin-top: 10px;
            }
            .report-date {
              text-align: right;
              color: #7f8c8d;
              font-size: 14px;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .metric-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .metric-table th,
            .metric-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .metric-table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .highlight-box {
              background-color: #f8f9fa;
              border-left: 4px solid #3498db;
              padding: 20px;
              margin: 20px 0;
            }
            .positive {
              color: #27ae60;
              font-weight: bold;
            }
            .negative {
              color: #e74c3c;
              font-weight: bold;
            }
            .neutral {
              color: #7f8c8d;
            }
            .recommendation-buy {
              background-color: #d5f4e6;
              border: 2px solid #27ae60;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .recommendation-sell {
              background-color: #fadbd8;
              border: 2px solid #e74c3c;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .recommendation-hold {
              background-color: #fef9e7;
              border: 2px solid #f39c12;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .page-break {
              page-break-before: always;
            }
            ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            li {
              margin: 5px 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #7f8c8d;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${stockName} (${stockSymbol})</h1>
            <div class="subtitle">专业股票估值分析报告</div>
          </div>
          
          <div class="report-date">
            报告生成时间: ${new Date().toLocaleString('zh-CN')}
          </div>

          <div class="section">
            <h2>基本面分析</h2>
            ${reportData.fundamentalAnalysis}
          </div>

          <div class="section page-break">
            <h2>业务板块分析</h2>
            ${reportData.businessSegments}
          </div>

          <div class="section page-break">
            <h2>成长催化剂</h2>
            ${reportData.growthCatalysts}
          </div>

          <div class="section page-break">
            <h2>估值分析</h2>
            ${reportData.valuationAnalysis}
          </div>

          <div class="footer">
            <p>本报告由AI智能分析系统生成，仅供参考，不构成投资建议。</p>
            <p>投资有风险，入市需谨慎。</p>
          </div>
        </body>
      </html>
    `

    // Launch browser and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #7f8c8d;">第 <span class="pageNumber"></span> 页，共 <span class="totalPages"></span> 页</div>'
    })

    await browser.close()

    // Return PDF as response
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${stockSymbol}_valuation_report.pdf"`
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
} 