export default function Footer() {
  return (
    <footer className="bg-slate-800 border-t border-amber-500/30 mt-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Disclaimer - Centered */}
        <div className="text-center mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 font-inter">Disclaimer</h3>
          <div className="text-xs sm:text-sm text-gray-300 space-y-2 font-inter leading-relaxed max-w-4xl mx-auto px-2">
            <p>
              This report is for informational purposes only and does not constitute investment advice, 
              financial advice, trading advice, or any other sort of advice. The information provided 
              should not be used as the basis for making investment decisions.
            </p>
            <p>
              Past performance does not guarantee future results. All investments involve risk, 
              including the possible loss of principal. You should consult with a qualified financial 
              advisor before making any investment decisions.
            </p>
            <p>
              SuperAnalyst is not responsible for any investment decisions made based on the 
              information provided in this report.
            </p>
          </div>
        </div>
        
        {/* Contact Information - Bottom Right */}
        <div className="flex justify-center sm:justify-end mb-6">
          <div className="text-center sm:text-right">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 font-inter">Feedback & Contact</h3>
            <div className="text-xs sm:text-sm text-gray-300 space-y-3 font-inter">
              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a 
                  href="mailto:superanalystpro@gmail.com" 
                  className="text-amber-400 hover:text-amber-300 transition-colors break-all"
                >
                  superanalystpro@gmail.com
                </a>
              </div>
              <p className="text-gray-400 px-2 sm:px-0">
                We welcome your feedback and suggestions for improving our analysis platform.
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-4 sm:pt-6 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="flex items-center space-x-2">
              <svg width="20" height="20" viewBox="0 0 32 32" className="text-amber-400 sm:w-6 sm:h-6" fill="currentColor">
                <path d="M22 22L28 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <rect x="10" y="18" width="2" height="4" fill="currentColor"/>
                <rect x="13" y="16" width="2" height="6" fill="currentColor"/>
                <rect x="16" y="12" width="2" height="10" fill="currentColor"/>
                <path d="M17 10L19 8L21 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-white font-semibold font-inter text-sm sm:text-base">SuperAnalyst</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-inter text-center">
              © 2025 SuperAnalyst. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 