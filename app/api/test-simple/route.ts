import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.TUSHARE_TOKEN
  const result = {
    timestamp: new Date().toISOString(),
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenStart: token ? token.substring(0, 12) : 'none',
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'not-vercel'
  }
  
  return NextResponse.json(result)
}
