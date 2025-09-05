import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { reportData, stockName, stockSymbol } = await request.json()

    if (!reportData) {
      return NextResponse.json(
        { error: 'Report data is required' },
        { status: 400 }
      )
    }

    // Create HTML content for PDF with improved styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${stockName} (${stockSymbol}) - 股票估值分析报告</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background: white;
              font-size: 14px;
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
              font-size: 24px;
              font-weight: bold;
            }
            
            .header .subtitle {
              color: #7f8c8d;
              font-size: 16px;
              margin-top: 10px;
            }
            
            .report-date {
              text-align: right;
              color: #7f8c8d;
              font-size: 12px;
              margin-bottom: 30px;
            }
            
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            
            .section h2 {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 8px;
              margin-bottom: 15px;
              font-size: 18px;
              font-weight: bold;
            }
            
            .section h3 {
              color: #34495e;
              margin-top: 20px;
              margin-bottom: 10px;
              font-size: 16px;
              font-weight: bold;
            }
            
            .metric-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 12px;
            }
            
            .metric-table th,
            .metric-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              vertical-align: top;
            }
            
            .metric-table th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #2c3e50;
            }
            
            .metric-table td:first-child {
              font-weight: 500;
            }
            
            .highlight-box {
              background-color: #f8f9fa;
              border-left: 4px solid #3498db;
              padding: 15px;
              margin: 15px 0;
              border-radius: 4px;
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
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
            }
            
            .recommendation-sell {
              background-color: #fadbd8;
              border: 2px solid #e74c3c;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
            }
            
            .recommendation-hold {
              background-color: #fef9e7;
              border: 2px solid #f39c12;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            ul, ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            
            li {
              margin: 5px 0;
            }
            
            p {
              margin: 10px 0;
              text-align: justify;
            }
            
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              color: #7f8c8d;
              font-size: 10px;
            }
            
            /* Print optimizations */
            @media print {
              body {
                font-size: 12px;
              }
              
              .section {
                page-break-inside: avoid;
              }
              
              .metric-table {
                font-size: 10px;
              }
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
            <h2>1. 基本面分析</h2>
            ${reportData.fundamentalAnalysis || '暂无数据'}
          </div>

          <div class="section page-break">
            <h2>2. 业务板块分析</h2>
            ${reportData.businessSegments || '暂无数据'}
          </div>

          <div class="section page-break">
            <h2>3. 增长催化剂</h2>
            ${reportData.growthCatalysts || '暂无数据'}
          </div>

          <div class="section page-break">
            <h2>4. 估值分析</h2>
            ${reportData.valuationAnalysis || '暂无数据'}
          </div>

          <div class="footer">
            <p>本报告由AI智能分析系统生成，仅供参考，不构成投资建议。</p>
            <p>投资有风险，入市需谨慎。</p>
          </div>
        </body>
      </html>
    `

    // Return HTML content with PDF headers for browser to handle
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${stockSymbol}_valuation_report_${new Date().toISOString().split('T')[0]}.html"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again later.' },
      { status: 500 }
    )
  }
} 