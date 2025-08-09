# 🚀 股票估值分析网站部署指南

## 📋 部署前检查清单

### ✅ 必需的环境变量
```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API 密钥
TUSHARE_TOKEN=your-tushare-token
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key

# 支付宝配置
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-private-key
ALIPAY_PUBLIC_KEY=your-public-key
```

### ✅ 数据库设置
1. 在 Supabase Dashboard 中运行 SQL 脚本
2. 确保 RLS 策略正确配置
3. 测试用户注册和登录功能

### ✅ 功能测试
- [ ] 股票数据获取 (A股/美股)
- [ ] AI 报告生成
- [ ] 用户认证
- [ ] 订阅支付
- [ ] PDF 下载

## 🎯 推荐部署平台

### 1. Vercel (强烈推荐)

**优势:**
- 专为 Next.js 优化
- 自动部署和预览
- 内置 CDN 和 SSL
- 免费计划足够使用

**部署步骤:**
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署
vercel --prod

# 4. 配置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... 添加所有环境变量
```

### 2. Railway

**优势:**
- 全栈应用托管
- 自动 HTTPS
- 数据库集成
- 简单易用

**部署步骤:**
1. 访问 [railway.app](https://railway.app)
2. 连接 GitHub 仓库
3. 配置环境变量
4. 自动部署

### 3. Netlify

**优势:**
- 静态站点优化
- 全球 CDN
- 免费 SSL
- 自动部署

**部署步骤:**
1. 连接 GitHub 仓库
2. 构建命令: `npm run build`
3. 发布目录: `.next`
4. 配置环境变量

## 🔧 部署配置

### 生产环境优化

1. **启用压缩**
```javascript
// next.config.js
module.exports = {
  compress: true,
  swcMinify: true,
}
```

2. **安全头设置**
```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
  ]
}
```

3. **环境变量验证**
```javascript
// lib/env.ts
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'TUSHARE_TOKEN',
    'ALPHA_VANTAGE_API_KEY',
  ]
  
  for (const var_name of required) {
    if (!process.env[var_name]) {
      throw new Error(`Missing required environment variable: ${var_name}`)
    }
  }
}
```

## 🌐 域名和 SSL

### 自定义域名设置

1. **购买域名** (推荐: Namecheap, GoDaddy)
2. **配置 DNS 记录**
   - A 记录指向部署平台 IP
   - CNAME 记录指向平台域名
3. **启用 SSL 证书** (平台通常自动处理)

### 推荐域名
- `stock-valuation.com`
- `stock-analysis.com`
- `investment-ai.com`

## 📊 监控和分析

### 1. 性能监控
```bash
# 安装监控工具
npm install @vercel/analytics
```

### 2. 错误追踪
```bash
# 安装错误监控
npm install @sentry/nextjs
```

### 3. 用户分析
- Google Analytics
- Vercel Analytics
- Supabase Analytics

## 🔒 安全配置

### 1. 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用平台的环境变量管理
- 定期轮换 API 密钥

### 2. 数据库安全
- 启用 Supabase RLS
- 限制 API 访问
- 监控异常访问

### 3. 应用安全
- 启用 CSP 头
- 防止 XSS 攻击
- 输入验证和清理

## 🚀 快速部署命令

```bash
# 1. 准备部署
./scripts/deploy.sh

# 2. Vercel 部署
vercel --prod

# 3. 检查部署状态
vercel ls

# 4. 查看日志
vercel logs
```

## 📞 部署后检查

### 功能测试清单
- [ ] 首页加载正常
- [ ] 股票搜索功能
- [ ] AI 报告生成
- [ ] 用户注册/登录
- [ ] 支付功能
- [ ] PDF 下载
- [ ] 多语言切换
- [ ] 移动端适配

### 性能检查
- [ ] 页面加载速度 < 3秒
- [ ] 图片优化
- [ ] 代码分割
- [ ] 缓存策略

### 安全检查
- [ ] HTTPS 启用
- [ ] 安全头配置
- [ ] 环境变量保护
- [ ] 数据库访问控制

## 🆘 常见问题

### Q: 部署后环境变量不生效
**A:** 确保在平台设置中正确配置环境变量，并重新部署

### Q: 数据库连接失败
**A:** 检查 Supabase 配置和网络连接

### Q: API 调用失败
**A:** 验证 API 密钥和配额限制

### Q: 支付功能不工作
**A:** 检查支付宝配置和回调 URL

## 📈 上线后优化

1. **性能优化**
   - 启用 CDN
   - 图片懒加载
   - 代码分割

2. **SEO 优化**
   - Meta 标签
   - Sitemap
   - 结构化数据

3. **用户体验**
   - 加载状态
   - 错误处理
   - 用户反馈

---

**🎉 恭喜！你的股票估值分析网站已经准备就绪！**

选择你喜欢的部署平台，按照上述步骤操作即可成功上线。 