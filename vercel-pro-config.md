# Vercel Pro 配置指南

## 超时配置

### 1. vercel.json 配置
```json
{
  "functions": {
    "app/api/generate-report-perplexity/route.ts": {
      "maxDuration": 900
    }
  }
}
```

### 2. 环境变量检查
确保在Vercel Dashboard中设置了以下环境变量：
- `PERPLEXITY_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TUSHARE_TOKEN`

### 3. 部署设置
1. 访问 Vercel Dashboard
2. 选择项目
3. 进入 Settings > Functions
4. 确保 "Max Duration" 设置为 15 minutes (900 seconds)

### 4. 监控和调试
- 查看 Function Logs 了解执行时间
- 检查是否真的使用了 Pro 计划
- 确认函数配置已生效

## 常见问题

### Q: 为什么还是504超时？
A: 可能的原因：
1. Vercel配置没有生效 - 需要重新部署
2. 没有正确升级到Pro计划
3. 函数配置没有正确应用

### Q: 如何确认Pro计划生效？
A: 检查：
1. Vercel Dashboard 显示 Pro 计划
2. Function Logs 显示更长的执行时间
3. 不再有10秒限制

### Q: 如何强制重新部署？
A: 
1. 推送新代码到GitHub
2. 在Vercel Dashboard点击 "Redeploy"
3. 确保使用最新的vercel.json配置
