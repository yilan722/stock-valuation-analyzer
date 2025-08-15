# API Keys 设置指南

为了获取高质量的股票数据，我们需要配置以下API keys：

## 🔑 必需的API Keys

### 1. Alpha Vantage API Key (推荐)
- **用途**: 获取实时股票价格、财务数据
- **获取地址**: https://www.alphavantage.co/support/#api-key
- **免费额度**: 500次/天
- **环境变量**: `ALPHA_VANTAGE_API_KEY`

### 2. Polygon API Key (可选，最准确)
- **用途**: 获取最准确的实时股票数据
- **获取地址**: https://polygon.io/
- **免费额度**: 5次/分钟
- **环境变量**: `POLYGON_API_KEY`

### 3. IEX Cloud API Key (可选)
- **用途**: 备用数据源
- **获取地址**: https://iexcloud.io/
- **免费额度**: 50,000次/月
- **环境变量**: `IEXCLOUD_API_KEY`

## 📝 环境变量配置

在 `.env.local` 文件中添加：

```env
# 股票数据API Keys
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
POLYGON_API_KEY=your_polygon_key_here
IEXCLOUD_API_KEY=your_iexcloud_key_here

# 现有的API Keys
OPUS4_API_KEY=your_opus4_key_here
```

## 🚀 数据源优先级

系统会按以下优先级尝试获取数据：

1. **Polygon API** - 最准确，实时数据
2. **Alpha Vantage** - 稳定，财务数据完整
3. **Yahoo Finance** - 免费，基础数据
4. **IEX Cloud** - 备用数据源

## 💰 成本说明

### Alpha Vantage (推荐)
- **免费计划**: 500次/天
- **付费计划**: $49.99/月，75,000次/天

### Polygon
- **免费计划**: 5次/分钟
- **付费计划**: $99/月，5次/秒

### IEX Cloud
- **免费计划**: 50,000次/月
- **付费计划**: $9/月，1,000,000次/月

## 🔧 测试配置

配置完成后，运行测试脚本验证：

```bash
# 测试股票数据API
node scripts/test-real-time-api.js

# 测试报告生成
node scripts/test-report-generation.js
```

## ⚠️ 注意事项

1. **API限制**: 注意各平台的请求频率限制
2. **数据缓存**: 系统使用2分钟缓存减少API调用
3. **备用方案**: 即使某个API失败，系统仍能正常工作
4. **环境变量**: 重启应用后环境变量才会生效

## 🆘 故障排除

### 常见问题

1. **API Key无效**
   - 检查环境变量是否正确设置
   - 确认API key是否激活
   - 检查账户余额和限制

2. **请求频率超限**
   - 减少测试频率
   - 升级到付费计划
   - 使用缓存数据

3. **数据不准确**
   - 检查API响应格式
   - 验证数据源优先级
   - 查看控制台日志

## 📊 预期结果

配置完成后，你应该能看到：

- ✅ 准确的股票价格
- ✅ 真实的市值数据
- ✅ 正确的P/E比率
- ✅ 实时的成交量和成交额
- ✅ 专业的分析报告

---

**提示**: 建议先配置Alpha Vantage API Key，它提供免费额度且数据质量较高。
