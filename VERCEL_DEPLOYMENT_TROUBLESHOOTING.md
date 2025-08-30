# Vercel 部署故障排除指南

## 🚨 当前问题
Vercel 构建时仍然使用旧的 commit (773ecb5)，而不是最新的修复代码。

## 📊 状态检查
- ✅ 本地代码已修复 TypeScript 错误
- ✅ 代码已推送到 super2 仓库 (commit: db1a946)
- ❌ Vercel 仍在构建旧版本

## 🔧 解决方案

### 方案1: 手动触发部署 ⭐ 推荐
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到您的项目
3. 进入 **Deployments** 页面
4. 点击 **"Redeploy"** 按钮
5. 选择 **"Use existing build cache: No"**
6. 点击 **"Redeploy"**

### 方案2: 检查 Git 连接
1. 进入项目 **Settings**
2. 找到 **Git** 部分
3. 确认连接的仓库是 `yilan722/super2`
4. 确认分支是 `main`
5. 如果不正确，点击 **"Disconnect"** 然后重新连接

### 方案3: 清除 Vercel 缓存
1. 在 **Settings** → **Advanced**
2. 找到 **"Clear Build Cache"**
3. 点击清除缓存
4. 然后手动触发重新部署

### 方案4: 删除项目重新部署
如果以上方案都不工作：
1. 删除当前 Vercel 项目
2. 使用一键部署重新创建：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyilan722%2Fsuper2&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,PERPLEXITY_API_KEY,TUSHARE_TOKEN)

## 📋 需要的环境变量
确保在 Vercel 中配置以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
PERPLEXITY_API_KEY=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
TUSHARE_TOKEN=your_tushare_token
```

## 🔍 验证部署成功
部署完成后检查：
- ✅ 构建日志中显示最新 commit (db1a946 或更新)
- ✅ 没有 TypeScript 编译错误
- ✅ 网站可以正常访问
- ✅ 股票搜索和报告生成功能正常

## 💡 为什么会发生这个问题？
1. **Webhook 延迟**: GitHub 到 Vercel 的 webhook 可能有延迟
2. **缓存问题**: Vercel 可能缓存了旧的 git 状态
3. **分支同步问题**: Git 分支可能没有正确同步

## 🚀 推荐操作
1. **立即尝试方案1** (手动触发部署)
2. **如果失败，使用方案4** (删除重建)

---
*最后更新: $(date)*
