import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { locales, type Locale } from '../../lib/i18n'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stock Valuation Analyzer',
  description: 'Professional AI-powered stock analysis platform',
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface RootLayoutProps {
  children: React.ReactNode
  params: { locale: Locale }
}

export default function RootLayout({ children, params }: RootLayoutProps) {
  return (
    <html lang={params.locale}>
      <body className={inter.className}>{children}</body>
    </html>
  )
} 