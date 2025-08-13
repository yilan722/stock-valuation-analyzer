import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side Supabase client
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
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
}

// 专门用于API路由的Supabase客户端
export function createApiSupabaseClient(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  console.log('Raw cookie header for API:', cookieHeader) // Added for debugging
  
  // 更准确的cookie解析
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const trimmedCookie = cookie.trim()
    const equalIndex = trimmedCookie.indexOf('=')
    if (equalIndex > 0) {
      const key = trimmedCookie.substring(0, equalIndex)
      const value = trimmedCookie.substring(equalIndex + 1)
      if (key && value) {
        acc[key] = value
      }
    }
    return acc
  }, {} as Record<string, string>)

  console.log('Parsed cookies for API:', Object.keys(cookies))
  
  // 检查是否有Supabase相关的cookies
  const supabaseCookies = Object.keys(cookies).filter(key => 
    key.includes('supabase') || key.includes('sb-') || key.includes('auth')
  )
  console.log('Supabase-related cookies found:', supabaseCookies)

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return Object.entries(cookies).map(([name, value]) => ({ name, value }))
        },
        setAll(cookiesToSet) {
          // 在API路由中，我们不需要设置cookies
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
} 