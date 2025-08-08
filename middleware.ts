import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './lib/i18n'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 检查路径是否已经包含语言代码
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // 重定向到默认语言
  const locale = defaultLocale
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // 跳过所有内部路径 (_next)
    '/((?!_next|api|favicon.ico).*)',
  ],
} 