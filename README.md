# SuperAnalystPro

A professional AI-powered stock analysis platform (SuperAnalystPro) powered by Perplexity Sonar Pro Deep Research. This application provides comprehensive stock analysis including fundamental data, business segment breakdown, growth catalysts, and detailed valuation metrics.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyilan722%2Fstock-valuation-analyzer&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,PERPLEXITY_API_KEY,TUSHARE_TOKEN&envDescription=Required%20API%20keys%20for%20full%20functionality&envLink=https%3A%2F%2Fgithub.com%2Fyilan722%2Fstock-valuation-analyzer%2Fblob%2Fmain%2FVERCEL_DEPLOYMENT_GUIDE.md)

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
cd superanalystpro
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

The application uses multiple APIs for different purposes. **⚠️ Never commit API keys to version control!**

Create a `.env.local` file and add your API keys:

```env
# Tushare API for A-share data
TUSHARE_TOKEN=your_tushare_token_here

# Nuwa API for AI models (Claude Opus 4.1 + Gemini Pro 2.5)
OPUS4_API_KEY=your_nuwa_api_key_here

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PayPal (optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_public_paypal_client_id
```

**Important**: 
- `TUSHARE_TOKEN`: For A-share stock data retrieval
- `OPUS4_API_KEY`: For AI analysis (reports, company comparison, personal research)
- YFinance API: No API key required for US/HK stock data

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
# Opus4 API (Required)
OPUS4_API_KEY=your_api_key_here

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PayPal (Optional - for payment features)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_public_paypal_client_id
PAYPAL_WEBHOOK_ID=your_webhook_id

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# Google Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-HS935K4G8C
```

**⚠️ Security Note**: Never commit API keys or sensitive credentials to version control. All sensitive information should be stored in environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This application is for educational and informational purposes only. The valuation estimates are based on AI analysis and should not be considered as investment advice. Always conduct your own research and consult with a financial advisor before making investment decisions. # 触发部署
