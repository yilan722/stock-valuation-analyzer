const OPUS4_API_URL = 'https://api.nuwaapi.com/v1/chat/completions'
const OPUS4_API_KEY = 'sk-GNBf5QFmnepeBZddwH612o5vEJQFMq6z8gUAyre7tAIrGeA8'

async function testOpus4API() {
  console.log('Testing Opus4 API...')
  
  try {
    const response = await fetch(OPUS4_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPUS4_API_KEY}`
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        messages: [
          {
            role: 'user',
            content: 'Hello, please respond with "API is working"'
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    })

    console.log(`Response status: ${response.status}`)
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`Error response: ${errorText}`)
      return
    }

    const data = await response.json()
    console.log('Success! API response:', data)
    
  } catch (error) {
    console.error('Error testing API:', error)
  }
}

testOpus4API() 