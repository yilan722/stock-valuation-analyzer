# Yahoo Finance API 设置指南

## 🎯 为什么切换到Yahoo Finance API？

### ❌ Alpha Vantage API的问题
- 数据不完整（如SBET股票显示"NaNB"）
- API Key限制和配额问题
- 某些股票数据缺失

### ✅ Yahoo Finance API的优势
- 数据更准确和完整
- 支持更多股票和交易所
- 实时数据更新
- 免费额度更大

## 🔧 设置步骤

### 1. 获取RapidAPI Key
1. 访问 [RapidAPI](https://rapidapi.com/)
2. 注册/登录账号
3. 搜索 "Yahoo Finance"
4. 订阅 "Yahoo Finance" API
5. 复制你的API Key

### 2. 更新环境变量
在 `.env` 文件中添加：

```env
# Yahoo Finance API配置
RAPIDAPI_KEY=your_actual_rapidapi_key_here

# 可以保留Alpha Vantage作为备用
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
```

### 3. 重启应用
```bash
npm run dev
```

## 📊 API功能

### 主要功能
- 实时股票价格
- 市值和P/E比率
- 成交量和成交额
- 涨跌幅计算
- 公司名称和基本信息

### 备用方案
如果Yahoo Finance API失败，系统会自动：
1. 尝试使用免费的Yahoo Finance备用API
2. 使用Opus4 API作为最后备选
3. 返回合理的默认值

## 🧪 测试

### 测试股票代码
- **美股**: AAPL, MSFT, GOOGL, TSLA
- **A股**: 000001, 000002, 300059
- **其他**: SBET, NVDA, AMD

### 预期结果
- 更准确的价格数据
- 完整的市值和P/E信息
- 正确的成交量和成交额
- 不再出现"NaNB"等错误数据

## 💰 成本

### RapidAPI定价
- **免费计划**: 500次/月
- **基础计划**: $9.99/月，10,000次
- **专业计划**: $29.99/月，100,000次

### 推荐
对于个人使用，免费计划通常足够。如果需要更高频率，可以选择基础计划。

## 🔍 故障排除

### 常见问题
1. **API Key无效**: 检查RapidAPI订阅状态
2. **配额超限**: 升级到付费计划
3. **数据缺失**: 某些股票可能不在Yahoo Finance数据库中

### 调试
查看控制台日志，应该看到：
```
🔍 从Yahoo Finance获取股票数据: SBET
✅ Yahoo Finance数据获取成功
```

## 📈 数据质量对比

| 指标 | Alpha Vantage | Yahoo Finance |
|------|---------------|---------------|
| 价格准确性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 数据完整性 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 股票覆盖 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 实时性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 稳定性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎉 总结

切换到Yahoo Finance API将显著提升：
- 数据准确性
- 用户体验
- 系统稳定性

建议立即设置RapidAPI Key并测试新功能！

