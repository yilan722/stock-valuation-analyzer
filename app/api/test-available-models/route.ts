import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const result = {
    timestamp: new Date().toISOString(),
    apiConfig: {
      baseUrl: 'https://api.nuwaapi.com',
      apiKey: 'sk-88seMXjnLEzEYYD3ABw8G0Z70f7zoWbXXNhGRwu5jslCzFIR'
    },
    availableModels: [] as any[],
    error: null as string | null
  }

  try {
    console.log('🔍 检查可用的模型...')
    
    // 获取模型列表
    const modelsResponse = await fetch('https://api.nuwaapi.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer sk-88seMXjnLEzEYYD3ABw8G0Z70f7zoWbXXNhGRwu5jslCzFIR`,
        'Content-Type': 'application/json'
      }
    })

    if (!modelsResponse.ok) {
      throw new Error(`获取模型列表失败: ${modelsResponse.status} ${modelsResponse.statusText}`)
    }

    const modelsData = await modelsResponse.json()
    result.availableModels = modelsData.data || []
    
    console.log('✅ 获取到可用模型:', result.availableModels.length)
    
    // 测试几个可能的模型
    const testModels = [
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-3.5-turbo',
      'claude-3-5-sonnet',
      'claude-3-5-haiku'
    ]
    
    for (const testModel of testModels) {
      try {
        console.log(`🧪 测试模型: ${testModel}`)
        const testResponse = await fetch('https://api.nuwaapi.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer sk-88seMXjnLEzEYYD3ABw8G0Z70f7zoWbXXNhGRwu5jslCzFIR`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: testModel,
            messages: [
              {
                role: 'user',
                content: 'Hello'
              }
            ],
            max_tokens: 10
          })
        })
        
        if (testResponse.ok) {
          console.log(`✅ 模型 ${testModel} 可用`)
        } else {
          console.log(`❌ 模型 ${testModel} 不可用: ${testResponse.status}`)
        }
      } catch (error) {
        console.log(`❌ 测试模型 ${testModel} 失败:`, error)
      }
    }
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ 检查可用模型失败:', error)
    
    result.error = error instanceof Error ? error.message : String(error)
    
    return NextResponse.json(result, { status: 500 })
  }
}
