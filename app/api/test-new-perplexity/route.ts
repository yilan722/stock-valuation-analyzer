import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testType = searchParams.get('type') || 'models'
  
  const result: {
    timestamp: string
    apiConfig: {
      baseUrl: string
      apiKey: string
      model: string
    }
    testType: string
    results: any
    error: string | null
    summary?: {
      allTestsPassed: boolean
      totalTests: number
      passedTests: number
    }
  } = {
    timestamp: new Date().toISOString(),
    apiConfig: {
      baseUrl: 'https://api.nuwaapi.com',
      apiKey: 'sk-88seMXjnLEzEYYD3ABw8G0Z70f7zoWbXXNhGRwu5jslCzFIR',
      model: 'o4-mini-deep-research'
    },
    testType,
    results: {},
    error: null
  }

  try {
    if (testType === 'models') {
      // 测试1: 列出可用模型
      console.log('🔍 测试1: 获取可用模型列表...')
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
      result.results.models = {
        status: modelsResponse.status,
        data: modelsData,
        success: true
      }
      console.log('✅ 模型列表获取成功:', modelsData)

    } else if (testType === 'chat') {
      // 测试2: 测试聊天功能
      console.log('💬 测试2: 测试聊天功能...')
      
      // o4-mini-deep-research模型使用v1/responses端点
      const chatResponse = await fetch('https://api.nuwaapi.com/v1/responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk-88seMXjnLEzEYYD3ABw8G0Z70f7zoWbXXNhGRwu5jslCzFIR`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'o4-mini-deep-research',
          input: '请简单介绍一下你的能力，用一句话回答。', // 使用input字段
          max_tokens: 100,
          temperature: 0.1
        })
      })

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text()
        throw new Error(`聊天测试失败: ${chatResponse.status} ${chatResponse.statusText} - ${errorText}`)
      }

      const chatData = await chatResponse.json()
      result.results.chat = {
        status: chatResponse.status,
        data: chatData,
        success: true
      }
      console.log('✅ 聊天测试成功:', chatData)

    } else if (testType === 'full') {
      // 测试3: 完整测试（模型列表 + 聊天）
      console.log('🚀 测试3: 完整测试...')
      
      // 先获取模型列表
      const modelsResponse = await fetch('https://api.nuwaapi.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer sk-88seMXjnLEzEYYD3ABw8G0Z70f7zoWbXXNhGRwu5jslCzFIR`,
          'Content-Type': 'application/json'
        }
      })

      const modelsData = await modelsResponse.json()
      result.results.models = {
        status: modelsResponse.status,
        data: modelsData,
        success: modelsResponse.ok
      }

      // 再测试聊天
      const chatResponse = await fetch('https://api.nuwaapi.com/v1/responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk-88seMXjnLEzEYYD3ABw8G0Z70f7zoWbXXNhGRwu5jslCzFIR`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'o4-mini-deep-research',
          input: '请简单介绍一下你的能力，用一句话回答。', // 使用input字段
          max_tokens: 100,
          temperature: 0.1
        })
      })

      const chatData = await chatResponse.json()
      result.results.chat = {
        status: chatResponse.status,
        data: chatData,
        success: chatResponse.ok
      }

      console.log('✅ 完整测试完成')
    }

    // 总结测试结果
    const allSuccess = Object.values(result.results).every((test: any) => test.success)
    result.summary = {
      allTestsPassed: allSuccess,
      totalTests: Object.keys(result.results).length,
      passedTests: Object.values(result.results).filter((test: any) => test.success).length
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ API测试失败:', error)
    
    result.error = error instanceof Error ? error.message : String(error)
    result.summary = {
      allTestsPassed: false,
      totalTests: Object.keys(result.results).length,
      passedTests: Object.values(result.results).filter((test: any) => test.success).length
    }
    
    return NextResponse.json(result, { status: 500 })
  }
}
