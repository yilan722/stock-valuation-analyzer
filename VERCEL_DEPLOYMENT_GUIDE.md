# 🚀 Vercel部署指南

## 📋 **部署步骤**

### **1. 前期准备**
确保您有以下账户和资源：
- ✅ [Vercel账户](https://vercel.com) 
- ✅ GitHub仓库已更新 (https://github.com/yilan722/stock-valuation-analyzer)
- ✅ 所需的API密钥

### **2. 登录Vercel控制台**
1. 访问 [https://vercel.com](https://vercel.com)
2. 使用GitHub账户登录
3. 点击 "Add New Project"

### **3. 导入GitHub仓库**
1. 选择 "Import Git Repository"
2. 找到 `yilan722/stock-valuation-analyzer` 仓库
3. 点击 "Import"

### **4. 配置项目设置**
在Project Configuration页面：

#### **Framework Preset**
- 选择 `Next.js`

#### **Root Directory**
- 保持默认 `./` (根目录)

#### **Build and Output Settings**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### **5. 配置环境变量**
在Environment Variables部分添加以下变量：

#### **必需的环境变量**:
```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=你的supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的supabase服务角色密钥

# Perplexity API (核心功能)
PERPLEXITY_API_KEY=你的perplexity_api_key

# Tushare API (股票数据)
TUSHARE_TOKEN=你的tushare_token

# App配置
NEXT_PUBLIC_BASE_URL=https://你的vercel域名.vercel.app
NODE_ENV=production
```

#### **可选的环境变量**:
```bash
# Alpha Vantage API
ALPHA_VANTAGE_API_KEY=你的alpha_vantage_api_key

# PayPal (如果启用支付功能)
PAYPAL_CLIENT_ID=你的paypal_client_id
PAYPAL_CLIENT_SECRET=你的paypal_client_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=你的public_paypal_client_id

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=你的ga_measurement_id
```

### **6. 部署设置**
1. 确保 "Automatically deploy" 选项已启用
2. 点击 "Deploy" 开始部署

### **7. 部署完成后的配置**

#### **域名配置**
- 部署成功后，Vercel会提供一个默认域名
- 如需自定义域名，可在Project Settings > Domains中配置

#### **函数配置**
- Vercel会自动识别 `app/api/` 下的API路由
- 每个API函数默认超时时间为10秒，我们的配置设置为60秒

#### **更新环境变量中的域名**
部署成功后，更新以下环境变量：
```bash
NEXT_PUBLIC_BASE_URL=https://你的实际域名.vercel.app
```

### **8. 验证部署**

#### **检查项目功能**:
1. ✅ 访问首页是否正常加载
2. ✅ 用户注册/登录功能
3. ✅ 股票搜索功能  
4. ✅ 报告生成功能 (Perplexity API)
5. ✅ 报告历史查看
6. ✅ 数据源连接 (Tushare, Yahoo Finance)

#### **常见问题排查**:
- **API调用失败**: 检查环境变量是否正确设置
- **构建失败**: 查看Vercel构建日志
- **页面404**: 检查路由配置和构建输出

## 🔧 **高级配置**

### **自动部署**
- 每次推送到GitHub main分支会自动触发Vercel部署
- 可在Project Settings > Git中配置部署分支

### **预览部署**
- Pull Request会自动创建预览部署
- 方便测试新功能

### **监控和日志**
- 在Vercel Dashboard中查看:
  - Functions日志
  - 性能监控
  - 错误追踪

## 📱 **移动端优化**
项目已包含响应式设计，在移动设备上也能良好显示。

## 🔒 **安全配置**
- CSP头部已在vercel.json中配置
- 环境变量加密存储
- API密钥安全管理

## 💡 **部署提示**
1. **首次部署可能需要5-10分钟**
2. **确保所有API密钥都正确配置**
3. **Perplexity API密钥是核心功能必需的**
4. **建议设置自定义域名以获得更好的用户体验**

---

**部署成功后，您的专业股票分析平台将可以通过Vercel域名全球访问！** 🌍✨
