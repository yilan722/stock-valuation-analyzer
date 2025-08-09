#!/bin/bash

# 股票估值分析网站部署脚本
# 使用方法: ./scripts/deploy.sh [platform]

set -e

echo "🚀 开始部署股票估值分析网站..."

# 检查环境变量
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ 错误: 缺少必要的环境变量"
    echo "请确保设置了以下环境变量:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    echo "- TUSHARE_TOKEN"
    echo "- ALPHA_VANTAGE_API_KEY"
    echo "- ALIPAY_APP_ID"
    echo "- ALIPAY_PRIVATE_KEY"
    echo "- ALIPAY_PUBLIC_KEY"
    exit 1
fi

# 清理缓存
echo "🧹 清理缓存..."
rm -rf .next
rm -rf node_modules/.cache

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 构建成功!"
else
    echo "❌ 构建失败!"
    exit 1
fi

# 运行测试（如果有）
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    echo "🧪 运行测试..."
    npm test
fi

echo "🎉 部署准备完成!"
echo ""
echo "📋 下一步操作:"
echo "1. 选择部署平台 (Vercel/Netlify/Railway)"
echo "2. 配置环境变量"
echo "3. 连接域名"
echo "4. 设置SSL证书"
echo ""
echo "💡 推荐部署平台:"
echo "- Vercel (推荐): 最适合Next.js"
echo "- Netlify: 静态站点托管"
echo "- Railway: 全栈应用托管" 