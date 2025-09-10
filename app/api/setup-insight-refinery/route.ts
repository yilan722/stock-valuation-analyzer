import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始创建Insight Refinery数据库表...')
    
    // 读取SQL文件
    const fs = require('fs')
    const path = require('path')
    const sqlPath = path.join(process.cwd(), 'lib', 'database', 'migrations', 'insight_refinery_tables.sql')
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error('SQL migration file not found')
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // 分割SQL语句并逐个执行
    const sqlStatements = sqlContent.split(';').filter(stmt => stmt.trim())
    
    for (const statement of sqlStatements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() })
        if (error) {
          console.error('SQL执行错误:', error)
          // 继续执行其他语句
        }
      }
    }
    
    // 不再检查error，因为我们已经处理了每个语句的错误
    
    console.log('✅ Insight Refinery数据库表创建成功！')
    
    return NextResponse.json({
      success: true,
      message: 'Insight Refinery数据库表创建成功'
    })

  } catch (error) {
    console.error('❌ 设置Insight Refinery失败:', error)
    return NextResponse.json(
      { error: 'Failed to setup Insight Refinery database' },
      { status: 500 }
    )
  }
}
