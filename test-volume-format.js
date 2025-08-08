// 测试成交量格式化
const formatVolume = (num) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toLocaleString()
}

// 测试数据
const testData = [
  620026,    // 应该显示为 620.03K
  554293,    // 应该显示为 554.29K
  1234567,   // 应该显示为 1.23M
  987654321, // 应该显示为 987.65M
  1234567890 // 应该显示为 1.23B
]

console.log('成交量格式化测试:')
testData.forEach(volume => {
  console.log(`${volume} -> ${formatVolume(volume)}`)
}) 