# 股票分析提示词文档

这个目录包含了用于生成专业股票估值分析报告的AI提示词。

## 文件说明

### 📄 `stock-analysis-prompt.md`
**完整版提示词文档**
- 包含详细的系统提示词和用户提示词
- 技术配置和参数说明
- 输出格式要求和HTML样式类
- 使用说明和版本历史
- 适合深入了解和定制

### 📄 `quick-reference.md`
**快速参考文档**
- 核心提示词的简洁版本
- 技术配置要点
- JSON清理代码
- 适合快速复制使用

## 提示词特点

### ✅ 高质量输出
- 专业的投资分析报告格式
- 详细的财务指标分析
- 具体的数字和百分比
- 支持中英文双语

### ✅ 结构化内容
1. **基本面分析** - 公司概况、财务指标、业绩分析
2. **业务细分** - 收入分解、地理分布、市场份额
3. **增长催化剂** - 增长动力、战略举措、市场机会
4. **估值分析** - DCF分析、可比公司、投资建议

### ✅ 技术优化
- JSON格式输出，便于解析
- HTML样式类，支持专业展示
- 错误处理和清理机制
- 多模型备选方案

## 使用方法

### 1. 直接使用
复制 `quick-reference.md` 中的提示词到你的AI应用中

### 2. 定制修改
参考 `stock-analysis-prompt.md` 中的详细说明进行定制

### 3. 变量替换
将以下变量替换为实际数据：
- `{stockData.name}` - 公司名称
- `{stockData.symbol}` - 股票代码
- `{stockData.price}` - 当前价格
- `{stockData.marketCap}` - 市值
- `{stockData.peRatio}` - 市盈率
- `{stockData.amount}` - 成交额
- `{locale}` - 语言设置

## 输出格式

### JSON结构
```json
{
  "fundamentalAnalysis": "<HTML内容>",
  "businessSegments": "<HTML内容>",
  "growthCatalysts": "<HTML内容>",
  "valuationAnalysis": "<HTML内容>"
}
```

### HTML样式类
- `metric-table` - 数据表格
- `highlight-box` - 高亮信息框
- `positive` - 正面指标（绿色）
- `negative` - 负面指标（红色）
- `neutral` - 中性指标（灰色）
- `recommendation-buy` - 买入建议
- `recommendation-sell` - 卖出建议
- `recommendation-hold` - 持有建议

## 版本信息

- **当前版本**: v1.0
- **创建日期**: 2025-08-08
- **适用场景**: 股票投资分析、研究报告生成
- **支持语言**: 中文、英文

## 注意事项

1. **数据时效性**: 确保使用最新的2024年度和2025季度财务数据
2. **质量要求**: 每个部分至少500字，包含具体数字和百分比
3. **格式验证**: 确保JSON格式正确，避免解析错误
4. **模型选择**: 优先使用Claude Opus 4，备选GPT-4和GPT-3.5

---

**提示**: 这些提示词经过优化测试，能够生成高质量的专业股票分析报告，适合投资研究和决策参考。 