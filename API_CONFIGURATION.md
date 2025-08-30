# API配置说明文档

## 🎯 **API配置总览**

### 1. **股票数据API**
- **A股数据**: Tushare API (使用 `TUSHARE_TOKEN`)
- **美股/港股数据**: YFinance API (无需API key)

### 2. **大模型API**
- **统一API Key**: Nuwa API Key (`OPUS4_API_KEY`)
- **模型1**: Claude Opus 4.1 (20250805) - 用于报告生成
- **模型2**: Gemini Pro 2.5 - 用于公司对比和个人研究中心

## 🔑 **环境变量配置**

```bash
# .env.local
TUSHARE_TOKEN=your_tushare_token_here
OPUS4_API_KEY=your_nuwa_api_key_here
```

## 📊 **各功能模块API使用**

### **股票搜索功能**
- A股搜索: `app/api/stock-search/route.ts` → Tushare API
- 美股/港股搜索: `app/api/stock-search/route.ts` → YFinance API

### **股票数据获取**
- A股数据: `app/api/stock-data/route.ts` → Tushare API
- 美股/港股数据: `app/api/stock-data/route.ts` → YFinance API

### **报告生成**
- 文件: `app/api/generate-report/route.ts`
- 模型: Claude Opus 4.1 (通过Nuwa API调用)

### **多公司对比分析**
- 文件: `app/api/gemini-analysis/route.ts`
- 模型: Gemini Pro 2.5 (通过Nuwa API调用)

### **个人研究中心**
- 文件: `src/services/gemini-service.ts`
- 模型: Gemini Pro 2.5 (通过Nuwa API调用)

## 🚫 **已废弃的API**
- ~~Google Gemini API~~ (已替换为Nuwa API)
- ~~OpenAI API~~ (已替换为Nuwa API)
- ~~Akshare API~~ (已替换为Tushare API)

## ✅ **当前状态**
- ✅ Tushare API: 正常工作，用于A股数据
- ✅ YFinance API: 正常工作，用于美股/港股数据  
- ✅ Nuwa API: 正常工作，统一调用Claude和Gemini模型
- ❌ 需要清理: 前端代码中仍有一些旧的API引用
