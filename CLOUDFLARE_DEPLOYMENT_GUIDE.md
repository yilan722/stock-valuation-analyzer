# Cloudflare Pages 部署指南

## 概述
Cloudflare Pages提供免费的静态网站托管，支持Pages Functions实现API路由功能。

## 部署步骤

### 1. 准备代码
确保代码已推送到GitHub仓库。

### 2. 连接Cloudflare Pages
1. 访问 https://pages.cloudflare.com
2. 点击 "Create a project"
3. 选择 "Connect to Git"
4. 授权GitHub并选择仓库 `yilan722/TopAnalyst`

### 3. 配置构建设置
在构建设置页面中：

**Framework preset**: `Next.js`

**Build command**: 
```bash
npm run build:cloudflare
```

**Build output directory**: 
```
.next
```

**Root directory**: 
```
/
```

### 4. 环境变量配置
在 "Environment variables" 部分添加：

```
NEXT_PUBLIC_SUPABASE_URL=https://decmecsshjqymhkykazg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDYzMjI1MywiZXhwIjoyMDcwMjA4MjUzfQ.TYomlDXMETtWVXPcyoL8kDdRga4cw48cJmmQnfxmWkI
TUSHARE_TOKEN=37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9
PERPLEXITY_API_KEY=你的Perplexity_API_KEY
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
- ✅ **完整功能** - 支持所有Next.js功能

### API路由文件结构
```
functions/
  _worker.js           # 入口文件
  tsconfig.json        # Functions专用TypeScript配置
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

### 文件大小限制解决方案
Cloudflare Pages有25MB文件大小限制，已通过以下方式解决：

1. **禁用webpack缓存**: `config.cache = false`
2. **优化构建输出**: 减少不必要的文件
3. **排除缓存目录**: 在`.gitignore`中排除`.next/cache/`

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
| **Cloudflare Pages** | ✅ 无限制 | 100,000请求/月 | ✅ | ⭐⭐⭐⭐⭐ |
| **Railway** | ✅ 无限制 | $5/月 | ❌ | ⭐⭐⭐⭐ |
| **Vercel** | ❌ 10秒 | 100GB/月 | ✅ | ⭐⭐ |

## 故障排除

### 1. 构建失败
- 检查环境变量是否正确设置
- 确保TypeScript配置使用ES2020+
- 查看构建日志中的具体错误信息

### 2. API路由不工作
- 确保`functions/`目录存在且包含API文件
- 检查`functions/_worker.js`入口文件
- 验证环境变量在Pages Functions中可用

### 3. 文件大小超限
- 确保webpack缓存已禁用
- 检查`.gitignore`是否排除了缓存目录
- 使用`npm run build:cloudflare`进行优化构建

## 总结

Cloudflare Pages是部署Next.js应用的优秀选择，特别适合需要API路由且无超时限制的应用。通过Pages Functions，您可以获得：

- 🚀 **无超时限制** - 支持长时间运行的API请求
- 🌍 **全球CDN** - 所有请求享受CDN加速
- 💰 **完全免费** - 100,000请求/月免费额度
- 🔧 **易于部署** - 与GitHub集成，自动部署

现在您可以成功部署并使用`sonar-deep-research`模型生成高质量报告了！