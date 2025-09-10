import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { reportData, stockName, stockSymbol, locale = 'en' } = await request.json()

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
          <title>${stockName} (${stockSymbol}) - ${locale === 'zh' ? '股票估值分析报告' : 'Stock Valuation Analysis Report'}</title>
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
            
            .watermark {
              position: fixed;
              top: 20px;
              right: 20px;
              z-index: 1000;
              background: rgba(255, 255, 255, 0.9);
              padding: 8px 12px;
              border-radius: 4px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              font-size: 12px;
              font-weight: 500;
            }
            
            .watermark a {
              color: #2563eb;
              text-decoration: none;
            }
            
            .watermark a:hover {
              text-decoration: underline;
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
          <div class="watermark">
            <a href="https://superanalyst.pro" target="_blank">Click superanalyst.pro for more professional research</a>
          </div>
          
          <div class="header">
            <h1>${stockName} (${stockSymbol})</h1>
            <div class="subtitle">${locale === 'zh' ? '专业股票估值分析报告' : 'Professional Stock Valuation Analysis Report'}</div>
          </div>
          
          <div class="report-date">
            ${locale === 'zh' ? '报告生成时间' : 'Report Generated'}: ${locale === 'zh' ? new Date().toLocaleString('zh-CN') : new Date().toLocaleString('en-US')}
          </div>

          <div class="section">
            <h2>1. ${locale === 'zh' ? '基本面分析' : 'Fundamental Analysis'}</h2>
            ${reportData.fundamentalAnalysis || (locale === 'zh' ? '暂无数据' : 'No data available')}
          </div>

          <div class="section page-break">
            <h2>2. ${locale === 'zh' ? '业务板块分析' : 'Business Segments Analysis'}</h2>
            ${reportData.businessSegments || (locale === 'zh' ? '暂无数据' : 'No data available')}
          </div>

          <div class="section page-break">
            <h2>3. ${locale === 'zh' ? '增长催化剂' : 'Growth Catalysts and Strategic Initiatives'}</h2>
            ${reportData.growthCatalysts || (locale === 'zh' ? '暂无数据' : 'No data available')}
          </div>

          <div class="section page-break">
            <h2>4. ${locale === 'zh' ? '估值分析' : 'Valuation Analysis and Investment Recommendation'}</h2>
            ${reportData.valuationAnalysis || (locale === 'zh' ? '暂无数据' : 'No data available')}
          </div>

          <div class="footer">
            <p>${locale === 'zh' ? '本报告由AI智能分析系统生成，仅供参考，不构成投资建议。' : 'This report is generated by AI intelligent analysis system, for reference only, and does not constitute investment advice.'}</p>
            <p>${locale === 'zh' ? '投资有风险，入市需谨慎。' : 'Investment involves risks, market entry needs caution.'}</p>
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