import { createClient } from '@supabase/supabase-js'

// 使用环境变量配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0'

// 验证配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? '***' : 'undefined' })
}

// Client-side Supabase client with proper session management
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.x'
    }
  }
})

// 测试连接
export async function testSupabaseConnection() {
  try {
    console.log('🔍 测试Supabase连接...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Supabase连接失败:', error.message)
      return false
    }
    
    console.log('✅ Supabase连接成功')
    return true
  } catch (error) {
    console.error('💥 Supabase连接异常:', error)
    return false
  }
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
          free_reports_used: number
          paid_reports_used: number
          subscription_id: string | null
          subscription_type: string | null
          subscription_start: string | null
          subscription_end: string | null
          monthly_report_limit: number
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
          free_reports_used?: number
          paid_reports_used?: number
          subscription_id?: string | null
          subscription_type?: string | null
          subscription_start?: string | null
          subscription_end?: string | null
          monthly_report_limit?: number
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
          free_reports_used?: number
          paid_reports_used?: number
          subscription_id?: string | null
          subscription_type?: string | null
          subscription_start?: string | null
          subscription_end?: string | null
          monthly_report_limit?: number
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          type: string
          status: string
          alipay_trade_no: string | null
          alipay_order_id: string | null
          subscription_type: string | null
          report_limit: number | null
          report_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          type: string
          status?: string
          alipay_trade_no?: string | null
          alipay_order_id?: string | null
          subscription_type?: string | null
          report_limit?: number | null
          report_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          type?: string
          status?: string
          alipay_trade_no?: string | null
          alipay_order_id?: string | null
          subscription_type?: string | null
          report_limit?: number | null
          report_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          stock_symbol: string
          stock_name: string
          report_data: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stock_symbol: string
          stock_name: string
          report_data: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stock_symbol?: string
          stock_name?: string
          report_data?: string
          created_at?: string
        }
      }
    }
  }
} 