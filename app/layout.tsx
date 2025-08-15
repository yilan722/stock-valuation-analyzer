import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SuperAnalyst - AI-Powered Pro Equity Research',
  description: 'Professional equity research powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

