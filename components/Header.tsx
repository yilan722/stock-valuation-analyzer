import { TrendingUp, BarChart3, FileText } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stock Valuation Analyzer</h1>
                <p className="text-sm text-gray-600">Professional AI-powered stock analysis</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Real-time Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>AI Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 