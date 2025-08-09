import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { locales, defaultLocale } from './lib/i18n'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 创建响应对象
  let response = NextResponse.next()

  // 处理Supabase会话
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set(name, value, options)
          })
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )

  // 刷新会话 - 这对API路由也很重要
  const { data: { session } } = await supabase.auth.getSession()
  
  // 如果是API路由，确保会话被正确传递
  if (pathname.startsWith('/api/')) {
    // 对于API路由，我们需要确保会话信息被正确传递
    if (session) {
      // 如果会话存在，将其添加到请求头中
      response.headers.set('x-user-id', session.user.id)
      response.headers.set('x-session-valid', 'true')
    }
    return response
  }
  
  // 检查路径是否已经包含语言代码
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // 处理语言重定向
  if (pathnameHasLocale) {
    return response
  }

  // 重定向到默认语言
  const locale = defaultLocale
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // 包含API路由，但不包含静态文件
    '/((?!_next|favicon.ico).*)',
  ],
} 