# ⚡ 快速部署清单

## 🎯 **立即部署 - 3分钟搞定**

### **方法1: 一键部署按钮** ⭐ 推荐
1. 点击README中的 [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyilan722%2Fstock-valuation-analyzer&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,PERPLEXITY_API_KEY,TUSHARE_TOKEN&envDescription=Required%20API%20keys%20for%20full%20functionality&envLink=https%3A%2F%2Fgithub.com%2Fyilan722%2Fstock-valuation-analyzer%2Fblob%2Fmain%2FVERCEL_DEPLOYMENT_GUIDE.md)
2. 登录Vercel (使用GitHub账户)
3. 填入环境变量 (见下方)
4. 点击Deploy

### **方法2: 手动导入**
1. 访问 [https://vercel.com](https://vercel.com)
2. New Project → Import Git Repository
3. 选择 `yilan722/stock-valuation-analyzer`
4. 配置环境变量
5. Deploy

## 🔑 **必需的API密钥**

### **核心功能密钥** (必填):
```bash
# Perplexity API - 报告生成核心
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase - 用户系统和数据库
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxxxxxxxxxxxx

# Tushare - 股票数据源
TUSHARE_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **基础配置**:
```bash
# 应用配置
NEXT_PUBLIC_BASE_URL=https://你的域名.vercel.app
NODE_ENV=production
```

## 📋 **部署后检查清单**

### **✅ 功能验证**:
- [ ] 首页正常加载
- [ ] 用户注册/登录工作
- [ ] 股票搜索功能
- [ ] 报告生成 (测试一个股票代码)
- [ ] 报告历史查看
- [ ] 移动端响应

### **🔧 如果遇到问题**:

#### **报告生成失败**:
- 检查 `PERPLEXITY_API_KEY` 是否正确
- 确认API密钥有足够额度

#### **用户系统问题**:
- 验证所有Supabase环境变量
- 检查Supabase项目状态

#### **股票数据问题**:
- 确认 `TUSHARE_TOKEN` 有效
- 检查API调用限制

#### **构建失败**:
- 查看Vercel构建日志
- 确认package.json依赖完整

## 🚀 **部署成功！接下来做什么？**

### **1. 设置自定义域名** (可选)
- 在Vercel Dashboard → Settings → Domains
- 添加你的域名并配置DNS

### **2. 监控和优化**
- 查看Vercel Analytics
- 监控API使用情况
- 设置错误追踪

### **3. 功能扩展**
- 添加更多股票数据源
- 实现用户偏好设置
- 集成支付系统 (可选)

## 💡 **专业提示**

1. **首次部署可能需要5-10分钟**
2. **建议设置环境变量后再部署**
3. **Perplexity API是核心，确保密钥正确**
4. **部署后更新 `NEXT_PUBLIC_BASE_URL`**

---

**🎉 部署完成后，您就拥有了一个专业的AI驱动股票分析平台！**

**访问地址**: `https://你的项目名.vercel.app`
