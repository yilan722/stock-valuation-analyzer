# Railway部署指南

## 为什么选择Railway？

- ✅ **无函数超时限制** - 支持长时间运行的API请求
- ✅ **免费额度充足** - 每月$5信用额度，足够个人项目使用
- ✅ **自动部署** - 从GitHub自动部署
- ✅ **简单易用** - 配置简单，部署快速
- ✅ **支持Next.js** - 完美支持我们的应用

## 部署步骤

### 1. 注册Railway账户
1. 访问 [https://railway.app](https://railway.app)
2. 使用GitHub账户登录
3. 连接您的GitHub账户

### 2. 创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择 `yilan722/TopAnalyst` 仓库
4. 点击 "Deploy"

### 3. 配置环境变量
在Railway项目设置中添加以下环境变量：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://decmecsshjqymhkykazg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDYzMjI1MywiZXhwIjoyMDcwMjA4MjUzfQ.TYomlDXMETtWVXPcyoL8kDdRga4cw48cJmmQnfxmWkI

# Perplexity API配置
PERPLEXITY_API_KEY=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

# Tushare API配置
TUSHARE_TOKEN=37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9

# 应用配置
NEXT_PUBLIC_BASE_URL=https://your-app-name.railway.app
NODE_ENV=production
```

### 4. 部署完成
1. Railway会自动构建和部署您的应用
2. 部署完成后会提供一个URL，类似：`https://your-app-name.railway.app`
3. 更新 `NEXT_PUBLIC_BASE_URL` 环境变量为实际URL

## 优势对比

| 平台 | 免费超时限制 | 免费额度 | 部署难度 | 推荐度 |
|------|-------------|----------|----------|--------|
| **Railway** | 无限制 | $5/月 | 简单 | ⭐⭐⭐⭐⭐ |
| **Render** | 15分钟 | 750小时/月 | 简单 | ⭐⭐⭐⭐ |
| **Fly.io** | 无限制 | 2340小时/月 | 中等 | ⭐⭐⭐⭐ |
| **Vercel** | 10秒 | 100GB/月 | 简单 | ⭐⭐ |

## 测试部署

部署完成后，测试以下功能：

1. **环境检查**: `https://your-app.railway.app/api/check-env`
2. **股票数据**: `https://your-app.railway.app/api/stock-data?ticker=300080`
3. **报告生成**: 使用完整的 `sonar-deep-research` 模型

## 注意事项

- Railway免费额度通常足够个人项目使用
- 如果超出免费额度，会暂停服务，但不会收费
- 可以随时升级到付费计划获得更多资源
