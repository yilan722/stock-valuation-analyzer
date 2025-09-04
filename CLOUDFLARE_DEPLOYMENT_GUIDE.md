# Cloudflare Pages部署指南

## 为什么选择Cloudflare Pages？

- ✅ **无函数超时限制** - 支持长时间运行的API请求
- ✅ **免费额度充足** - 每月100,000次请求
- ✅ **全球CDN** - 访问速度极快
- ✅ **自动部署** - 从GitHub自动部署
- ✅ **支持Next.js** - 完美支持我们的应用

## 部署步骤

### 1. 注册Cloudflare账户
1. 访问 [https://pages.cloudflare.com](https://pages.cloudflare.com)
2. 使用GitHub账户登录
3. 连接您的GitHub账户

### 2. 创建新项目
1. 点击 "Create a project"
2. 选择 "Connect to Git"
3. 选择 `yilan722/TopAnalyst` 仓库
4. 点击 "Begin setup"

### 3. 配置构建设置
在构建设置页面中：

**Framework preset**: `Next.js`

**Build command**: 
```bash
npm run build
```

**Build output directory**: 
```
.next
```

**Root directory**: 
```
/
```

**Node.js version**: `18.x` 或 `20.x`

### 4. 配置环境变量
在 "Environment variables" 部分添加：

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
NODE_ENV=production
```

### 5. 部署完成
1. 点击 "Save and Deploy"
2. Cloudflare会自动构建和部署您的应用
3. 部署完成后会提供一个URL，类似：`https://your-project.pages.dev`

## 重要配置说明

### Pages Functions支持
Cloudflare Pages通过Pages Functions支持API路由：

- ✅ **支持API路由** - 通过 `/functions` 目录
- ✅ **无超时限制** - 支持长时间运行的API请求
- ✅ **全球CDN** - API请求也享受CDN加速
- ✅ **自动部署** - 与前端一起部署

### API路由文件结构
```
functions/
  api/
    stock-data.js      # 股票数据API
    generate-report.js # 报告生成API
```

### 环境变量配置
Pages Functions可以访问在Cloudflare Pages中设置的环境变量。

### TypeScript配置
确保 `tsconfig.json` 使用ES2020+目标：

```json
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["dom", "dom.iterable", "es2020"]
  }
}
```

### Pages Functions文件结构
```
functions/
  _worker.js           # 入口文件
  tsconfig.json        # Functions专用TypeScript配置
  api/
    stock-data.js      # 股票数据API
    generate-report.js # 报告生成API
```

## 优势对比

| 平台 | 免费超时限制 | 免费额度 | 全球CDN | 推荐度 |
|------|-------------|----------|---------|--------|
| **Cloudflare Pages** | 无限制 | 100,000请求/月 | ✅ | ⭐⭐⭐⭐⭐ |
| **Railway** | 无限制 | $5/月 | ❌ | ⭐⭐⭐⭐ |
| **Render** | 15分钟 | 750小时/月 | ❌ | ⭐⭐⭐⭐ |
| **Vercel** | 10秒 | 100GB/月 | ✅ | ⭐⭐ |

## 测试部署

部署完成后，测试以下功能：

1. **环境检查**: `https://your-project.pages.dev/api/check-env`
2. **股票数据**: `https://your-project.pages.dev/api/stock-data?ticker=300080`
3. **报告生成**: 使用完整的 `sonar-deep-research` 模型

## 注意事项

- Cloudflare Pages的免费额度通常足够个人项目使用
- 如果超出免费额度，会暂停服务，但不会收费
- 可以随时升级到付费计划获得更多资源
- 全球CDN确保访问速度极快
