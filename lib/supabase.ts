import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client with proper session management
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

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