# 股票估值报告生成配置示例

> 记录优化后的高质量报告生成配置，解决了英文思考过程、业务细分为空、估值表格错误、表格数量不足等关键问题

## 📊 API配置参数

```typescript
{
  model: 'sonar-deep-research',              // Sonar Deep Research学术级模型
  max_tokens: 20000,                         // 支持长篇详细分析
  temperature: 0.05,                         // 极低温度确保学术级精确性
  search_queries: true,                      // 启用深度搜索查询
  search_recency_filter: 'month',            // 搜索最近一个月的深度信息
  return_citations: true,                    // 返回学术级引用信息
  top_p: 0.9,                               // 聚焦输出
  presence_penalty: 0.15                    // 增强分析深度和多样性
}
```

## 📝 System Prompt (中文版)

```
您是一位在基本面分析和估值方面具有专业知识的股票分析师,具备投资银行级别的深度研究能力。请根据给定的股票数据，生成一份全面、详细的估值报告。

报告结构 (请以有效 JSON 格式返回，并使用以下确切的键名)：

fundamentalAnalysis (基本面分析):
- 公司概览和商业模式
- 关键财务指标 (市盈率P/E, 市净率P/B, 净资产收益率ROE, 资产收益率ROA, 负债比率)
- 最新季度/年度业绩与同比比较
- 营收增长、利润率、现金流分析
- 行业地位和竞争优势

businessSegments (业务板块):
- 按业务板块划分的详细收入明细
- 业务板块业绩分析与增长率
- 区域收入分布
- 按业务板块划分的市场份额分析
- 业务板块盈利能力和利润率
- 未来业务板块增长预测

growthCatalysts (增长催化剂):
- 主要增长驱动因素和市场机遇
- 战略举措和扩张计划
- 新产品/服务发布
- 市场扩张机会
- 技术投资和研发
- 监管利好或利空
- 竞争优势和护城河

valuationAnalysis (估值分析):
- DCF (现金流折现) 分析及详细假设
- 可比公司分析 (市盈率P/E, 企业价值/息税折旧摊销前利润EV/EBITDA, 市销率P/S)
- 适用时的分部加总估值 (Sum-of-parts valuation)
- 采用多种方法计算目标价格
- 风险调整回报分析
- 投资建议 (买入/持有/卖出) 及理由
- 主要风险和缓解因素

🔑 核心要求：
- 使用最新的 2024 年度和 2025 季度财务数据
- 显示"Trading Amount"（交易金额）而非"Volume"（交易量）
- 包含具体的数字、百分比和数据点
- 提供详细分析及支持性证据
- 使用专业的 HTML 样式，并带有以下类名：'metric-table', 'highlight-box', 'positive', 'negative', 'neutral', 'recommendation-buy', 'recommendation-sell', 'recommendation-hold'
- 确保 JSON 格式正确且有效
- 每个部分都应全面且详细 (每个部分最少 500 字)
- 每个部分必须包含至少2-3个数据表格来支撑分析
- 所有表格数据必须与文字分析内容相匹配，不能出现矛盾
- 绝对不要显示任何英文思考过程或推理步骤
- 确保四个部分内容均衡分布，每个部分都有实质性内容
- businessSegments部分必须包含详细的业务收入细分和增长数据
- valuationAnalysis部分的估值表格必须使用准确的财务计算结果
- 仅返回一个包含这四个部分的有效 JSON 对象，内容为 HTML 字符串。
```

## 👤 User Prompt (统一版本)

```
Generate a comprehensive, professional stock valuation report for ${stockData.name} (${stockData.symbol}) with the following data:

STOCK DATA:
- Current Price: ${stockData.price}
- Market Cap: ${stockData.marketCap}
- P/E Ratio: ${stockData.peRatio}
- Trading Amount: ${stockData.amount}

REQUIREMENTS:
- Provide detailed, professional analysis with specific data points and percentages
- Include comprehensive business segment analysis with revenue breakdowns
- Analyze growth catalysts with specific market opportunities
- Provide detailed valuation analysis with multiple methodologies
- Use the latest annual and quarterly financial data, or current stock price, p/e, trading volume data
- Ensure each section is comprehensive and detailed
- Format as professional HTML with proper styling

Please provide a comprehensive, detailed analysis in ${locale === 'zh' ? 'Chinese' : 'English'} that matches the quality of professional investment research reports. 针对中英文报告分别使用对应的语言
```

## 🎯 解决的关键问题

### ❌ 修复前的问题
1. **英文思考过程显示** - 报告中出现模型的英文推理步骤
2. **业务细分部分为空** - businessSegments没有实质内容
3. **估值表格数据错误** - DCF目标价等与分析不匹配
4. **表格数量不足** - 每个部分缺少数据支撑

### ✅ 修复后的改进
1. **纯净中文输出** - 明确禁止英文思考过程
2. **业务细分完整** - 强制要求详细收入细分数据
3. **估值数据准确** - 要求表格与分析内容匹配
4. **表格数量充足** - 每个部分至少2-3个数据表格

## 📊 预期输出结构

```json
{
  "fundamentalAnalysis": "<div class='highlight-box'>基本面分析内容 + 2-3个财务数据表格</div>",
  "businessSegments": "<div class='highlight-box'>业务细分分析 + 收入结构表格 + 增长数据表格</div>",
  "growthCatalysts": "<div class='highlight-box'>增长催化剂分析 + 市场机会表格 + 风险评估表格</div>",
  "valuationAnalysis": "<div class='highlight-box'>估值分析 + DCF估值表格 + 可比公司表格 + 目标价汇总表格</div>"
}
```

## 🏆 质量标准

- ✅ **内容深度**: 每个部分最少500字
- ✅ **数据支撑**: 每个部分2-3个专业表格
- ✅ **数据一致性**: 表格数据与文字分析完全匹配
- ✅ **语言纯净**: 无英文思考过程或推理步骤
- ✅ **结构均衡**: 四个部分内容分布合理
- ✅ **专业样式**: 使用指定的CSS类名
- ✅ **投行级质量**: 专业投资研究报告水准

## 📈 成功案例特征

当前配置可以生成具有以下特征的高质量报告：

1. **基本面分析**: 包含完整的财务指标表格、同比分析表格
2. **业务细分**: 详细的收入结构表格、各板块增长率对比表格
3. **增长催化剂**: 市场机会量化表格、风险因素评估表格
4. **估值分析**: DCF假设与结果表格、可比公司估值表格、综合目标价表格

## 🔮 后续优化方向

- 根据不同行业特点调整表格结构
- 增加更多可视化数据展示
- 优化HTML样式和响应式设计
- 加强数据来源标注和引用

---

**此配置已验证可生成高质量、专业的股票估值报告，建议后续开发严格按照此标准执行。** 🚀
