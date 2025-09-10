# 🔬 Insight Refinery - 洞察精炼器

## 功能概述

Insight Refinery（洞察精炼器）是一个革命性的AI驱动研报分析系统，允许用户通过深度讨论和洞察合成，对现有研报进行二次精炼和进化。

## 🎯 核心特性

### 1. 交互式讨论引擎
- **AI模型**: Sonar模型
- **功能**: 基于研报内容进行实时问答
- **特点**: 上下文感知、关键洞察标记、智能建议

### 2. 洞察合成模块
- **功能**: 自动提取讨论中的关键思考点
- **输出**: 讨论摘要、关键问题、新观点、信息缺口
- **算法**: 智能内容分析和洞察提取

### 3. 报告进化生成器
- **AI模型**: Sonar-Deep-Research模型
- **输入**: 原始prompt + 讨论洞察 + 关键思考点
- **输出**: 增强版研报，消耗一次生成次数

### 4. 变更检测与高亮
- **功能**: 自动对比新旧版本差异
- **展示**: 并排对比、行内高亮、变更摘要
- **分析**: 内容对比、语义差异、结构变化

## 🏗️ 系统架构

### 数据结构层级
```
Report Hub (研报中心)
├── Company/Topic Folders (公司/主题文件夹)
│   ├── Original Report (原始研报)
│   │   ├── Version 1.0 (初始版本)
│   │   ├── Discussion Threads (讨论线程)
│   │   └── Evolved Reports (进化报告)
│   │       ├── Version 2.0 - Insight Refinery Enhanced
│   │       └── Version 3.0 - Insight Refinery Enhanced
│   └── Change Tracking (变更追踪)
```

### 核心数据表
- `discussion_sessions` - 讨论会话
- `conversations` - 对话记录
- `key_insights` - 关键洞察
- `insight_synthesis` - 洞察合成
- `change_tracking` - 变更追踪
- `report_folders` - 报告文件夹

## 🚀 使用流程

### Phase 1: 讨论分析阶段
1. 用户选择已有研报
2. 进入Insight Refinery界面
3. 基于报告内容进行提问
4. AI使用Sonar模型实时响应
5. 系统记录所有对话内容

### Phase 2: 洞察合成阶段
1. 系统分析所有讨论内容
2. 提取关键思考点和新观点
3. 生成综合结论和补充信息
4. 用户确认或修改合成结果

### Phase 3: 报告进化阶段
1. 组合原始prompt + 讨论洞察
2. 调用Sonar-Deep-Research生成新版本
3. 自动命名：[原标题] - Insight Refinery Enhanced v2.0 - [时间戳]
4. 扣除一次研报生成次数

### Phase 4: 对比审查阶段
1. 自动对比新旧版本差异
2. 高亮显示关键变化
3. 生成变更摘要报告
4. 保存至对应公司文件夹

## 📁 文件结构

```
components/InsightRefinery/
├── InsightRefineryModal.tsx    # 主模态框组件
├── ReportComparison.tsx        # 报告对比组件
├── ReportFolder.tsx           # 报告文件夹组件
└── ReportHub.tsx              # 研报中心主组件

app/api/insight-refinery/
├── start-session/route.ts     # 开始讨论会话
├── ask-question/route.ts      # 提交问题
├── synthesize-insights/route.ts # 合成洞察
├── generate-evolution/route.ts  # 生成进化版
├── compare-versions/route.ts   # 版本对比
├── hub/[userId]/route.ts      # 获取用户文件夹
├── stats/[userId]/route.ts    # 获取统计数据
├── folder/[folderId]/route.ts # 获取文件夹信息
├── versions/[folderId]/route.ts # 获取版本列表
└── discussions/[folderId]/route.ts # 获取讨论会话

lib/types/
└── insight-refinery.ts        # 类型定义

lib/database/migrations/
└── insight_refinery_tables.sql # 数据库迁移脚本
```

## 🔧 技术实现

### API端点
```
POST /api/insight-refinery/start-session
POST /api/insight-refinery/ask-question
POST /api/insight-refinery/synthesize-insights
POST /api/insight-refinery/generate-evolution
POST /api/insight-refinery/compare-versions
GET  /api/insight-refinery/hub/[userId]
GET  /api/insight-refinery/stats/[userId]
GET  /api/insight-refinery/folder/[folderId]
GET  /api/insight-refinery/versions/[folderId]
GET  /api/insight-refinery/discussions/[folderId]
```

### 数据库设计
- 支持PostgreSQL/Supabase
- 包含完整的索引优化
- 自动更新时间戳触发器
- 数据完整性约束

### 前端组件
- React + TypeScript
- Tailwind CSS样式
- 响应式设计
- 实时状态管理

## 💡 使用场景

### 1. 深度分析
- 对现有研报进行更深入的分析
- 通过问答发现新的视角和洞察
- 补充遗漏的重要信息

### 2. 持续更新
- 基于新信息更新研报
- 保持研报的时效性和准确性
- 跟踪市场变化对分析的影响

### 3. 协作讨论
- 团队成员可以共同讨论研报
- 记录讨论过程和关键洞察
- 生成集体智慧的增强版报告

### 4. 学习改进
- 通过对比分析改进分析质量
- 识别分析中的盲点和不足
- 提升未来研报的生成质量

## 🎨 用户界面

### 主界面特性
- 直观的文件夹结构展示
- 实时搜索和筛选功能
- 统计仪表板
- 版本时间线

### 讨论界面
- 聊天式对话界面
- 关键洞察标记
- 建议问题推荐
- 实时状态更新

### 对比界面
- 并排版本对比
- 差异高亮显示
- 变更统计图表
- 导出功能

## 🔒 权限控制

### 订阅等级控制
- 检查用户剩余研报生成次数
- Insight Refinery生成算作一次正式研报生成
- 讨论阶段不计入生成次数

### 数据安全
- 用户数据隔离
- 会话状态管理
- 安全的数据传输

## 📊 性能优化

### 数据库优化
- 合理的索引设计
- 查询性能优化
- 数据分页支持

### 前端优化
- 组件懒加载
- 状态缓存
- 响应式更新

### API优化
- 请求去重
- 错误处理
- 超时控制

## 🚀 部署说明

### 环境要求
- Node.js 18+
- PostgreSQL/Supabase
- Next.js 14+

### 安装步骤
1. 运行数据库迁移脚本
2. 配置环境变量
3. 安装依赖包
4. 启动应用

### 环境变量
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PERPLEXITY_API_KEY=your_perplexity_api_key
```

## 🔮 未来规划

### 短期目标
- 完善用户界面
- 优化AI响应质量
- 增加更多分析工具

### 长期目标
- 支持多语言
- 集成更多AI模型
- 增加协作功能
- 移动端支持

## 📞 支持与反馈

如有问题或建议，请联系开发团队或提交Issue。

---

**Insight Refinery** - 让每一次讨论都成为研报进化的催化剂 🚀



