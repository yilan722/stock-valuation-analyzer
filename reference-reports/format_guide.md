# 股票估值报告格式参考指南

## 📋 参考文档
- **主要参考**: `300053_valuation_report_2025-09-03.pdf`
- **备用参考**: `300080_valuation_report_2025-08-30.pdf`

## 🎨 目标格式要求

### 1. 整体布局
- **专业标题**: 使用大标题突出公司名称和股票代码
- **清晰分段**: 每个分析部分有明确的标题和分隔
- **数据表格**: 使用专业的表格格式展示财务数据
- **视觉层次**: 通过字体大小、颜色、间距创建清晰的视觉层次

### 2. 标题结构
```
# 公司名称 (股票代码) 估值分析报告
## 报告日期: YYYY-MM-DD

## 1. 基本面分析
### 1.1 公司概况
### 1.2 财务指标分析
### 1.3 行业对比

## 2. 业务板块分析
### 2.1 收入结构分析
### 2.2 业务板块表现
### 2.3 区域分布

## 3. 增长催化剂
### 3.1 主要增长驱动因素
### 3.2 战略举措
### 3.3 市场机会

## 4. 估值分析
### 4.1 DCF估值模型
### 4.2 相对估值分析
### 4.3 投资建议
```

### 3. 表格格式要求
- **表头**: 使用粗体，背景色区分
- **数据对齐**: 数字右对齐，文本左对齐
- **颜色编码**: 
  - 绿色: 正面指标
  - 红色: 负面指标
  - 灰色: 中性指标
- **边框**: 使用细线边框，内部分隔线

### 4. 关键指标展示
- **重要数据**: 使用高亮框突出显示
- **百分比**: 使用颜色编码 (+/-)
- **趋势**: 使用箭头符号表示趋势方向
- **评级**: 使用醒目的标签样式

### 5. HTML样式类
```css
.report-title { font-size: 2em; font-weight: bold; color: #2c3e50; }
.section-title { font-size: 1.5em; font-weight: bold; color: #34495e; margin-top: 2em; }
.subsection-title { font-size: 1.2em; font-weight: bold; color: #7f8c8d; }
.metric-table { border-collapse: collapse; width: 100%; margin: 1em 0; }
.metric-table th { background-color: #ecf0f1; font-weight: bold; padding: 0.5em; }
.metric-table td { padding: 0.5em; border: 1px solid #bdc3c7; }
.highlight-box { background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 1em; margin: 1em 0; }
.positive { color: #27ae60; font-weight: bold; }
.negative { color: #e74c3c; font-weight: bold; }
.neutral { color: #7f8c8d; }
.recommendation-buy { background-color: #d5f4e6; color: #27ae60; padding: 0.3em 0.6em; border-radius: 4px; }
.recommendation-sell { background-color: #fadbd8; color: #e74c3c; padding: 0.3em 0.6em; border-radius: 4px; }
.recommendation-hold { background-color: #f8f9fa; color: #7f8c8d; padding: 0.3em 0.6em; border-radius: 4px; }
```

### 6. 内容要求
- **数据准确性**: 所有财务数据必须准确，来源清晰
- **分析深度**: 每个部分至少500字，包含具体数据支撑
- **逻辑清晰**: 分析结论与数据一致，逻辑链条完整
- **专业术语**: 使用专业的投资分析术语和表达

### 7. 图表建议
- **财务指标图表**: 使用柱状图或折线图展示趋势
- **业务结构饼图**: 展示收入结构分布
- **估值对比表**: 多维度估值方法对比
- **风险矩阵**: 风险因素评估和权重

## 📊 实施建议

1. **更新System Prompt**: 加入格式要求说明
2. **优化HTML生成**: 使用更专业的CSS样式
3. **数据验证**: 确保表格数据与文字分析一致
4. **视觉测试**: 在不同设备上测试显示效果

---

**注意**: 此格式指南基于专业投资研究报告标准，旨在提升报告的专业性和可读性。
