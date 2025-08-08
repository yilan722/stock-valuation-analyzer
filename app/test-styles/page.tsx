export default function TestStylesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">CSS Styles Test Page</h1>
      
      <div className="report-content">
        <h2>Company Overview</h2>
        <p>This is a test paragraph to verify styling.</p>
        
        <h3>Key Financial Metrics</h3>
        <table className="metric-table">
          <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Growth</th>
          </tr>
          <tr>
            <td>Revenue</td>
            <td>$100B</td>
            <td className="positive">+10%</td>
          </tr>
          <tr>
            <td>Profit</td>
            <td>$20B</td>
            <td className="negative">-5%</td>
          </tr>
        </table>
        
        <div className="highlight-box">
          <h4>Important Note</h4>
          <p>This is a highlight box to test styling.</p>
        </div>
        
        <div className="recommendation-buy">
          <h4>Buy Recommendation</h4>
          <p>This is a buy recommendation box.</p>
        </div>
        
        <div className="data-grid">
          <div className="grid-item">
            <h4>Metric 1</h4>
            <p>Value 1</p>
          </div>
          <div className="grid-item">
            <h4>Metric 2</h4>
            <p>Value 2</p>
          </div>
        </div>
      </div>
    </div>
  )
} 