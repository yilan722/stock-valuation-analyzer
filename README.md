# Stock Valuation Analyzer

A professional stock valuation analysis platform powered by Opus4 AI. This application provides comprehensive stock analysis including fundamental data, business segment breakdown, growth catalysts, and detailed valuation metrics.

## Features

- **Professional UI**: Clean, modern interface with professional styling
- **Stock Search**: Search stocks by ticker symbol
- **Real-time Data**: Display current stock information
- **AI-Powered Analysis**: Generate comprehensive valuation reports using Opus4 AI
- **Interactive Charts**: Visualize business segments and financial data
- **Detailed Reports**: Complete analysis including:
  - Company overview and market metrics
  - Business segment analysis with revenue breakdown
  - Growth catalysts and opportunities
  - Valuation analysis using multiple methods (DCF, P/E, P/B ratios)
  - Investment recommendations

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **AI Integration**: Opus4 API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-valuation-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Configuration

The application uses the Opus4 API for generating valuation reports. The API key is configured in `lib/api.ts`:

```typescript
const OPUS4_API_KEY = 'sk-88seMXjnLEzEYYD3ABw8G0Z70f7zoWbXXNhGRwu5jslCzFIR'
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── Header.tsx         # Page header
│   ├── SearchForm.tsx     # Stock search form
│   └── ValuationReport.tsx # Valuation report display
├── lib/                   # Utility functions
│   └── api.ts            # API integration
├── types/                 # TypeScript type definitions
│   └── index.ts          # Type definitions
└── public/               # Static assets
```

## Usage

1. **Search for a Stock**: Enter a stock ticker (e.g., AAPL, MSFT) in the search box
2. **Review Stock Data**: View current price, market cap, P/E ratio, and volume
3. **Generate Report**: Click "Generate Report" to create a comprehensive valuation analysis
4. **Review Analysis**: The report includes:
   - Company overview and description
   - Business segment breakdown with charts
   - Growth catalysts and opportunities
   - Detailed valuation metrics
   - Investment recommendation

## Report Sections

### 1. Company Overview
- Company description and market position
- Key financial metrics
- Interactive pie chart showing revenue by segment

### 2. Business Segments Analysis
- Detailed breakdown of business segments
- Revenue, growth, and margin data
- Interactive bar charts
- Comprehensive data tables

### 3. Growth Catalysts
- Key growth drivers and opportunities
- Strategic initiatives and market expansion
- Innovation and technology trends

### 4. Valuation Analysis
- Multiple valuation methods (DCF, P/E, P/B)
- Target price calculation
- Investment recommendation (BUY/HOLD/SELL)
- Detailed reasoning and insights

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Components**: Add to `components/` directory
2. **API Integration**: Extend `lib/api.ts`
3. **Types**: Update `types/index.ts`
4. **Styling**: Use Tailwind CSS classes

## Deployment

The application can be deployed to Vercel, Netlify, or any other Next.js-compatible platform.

### Environment Variables

Create a `.env.local` file for environment variables:

```env
NEXT_PUBLIC_OPUS4_API_KEY=your_api_key_here
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This application is for educational and informational purposes only. The valuation estimates are based on AI analysis and should not be considered as investment advice. Always conduct your own research and consult with a financial advisor before making investment decisions. 