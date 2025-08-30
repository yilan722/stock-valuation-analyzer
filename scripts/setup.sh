#!/bin/bash

echo "🚀 设置Python yfinance环境..."

# 检查Python3是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装Python3"
    exit 1
fi

# 检查pip3是否安装
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 未安装，请先安装pip3"
    exit 1
fi

echo "✅ Python3 和 pip3 已安装"

# 创建虚拟环境（可选）
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📚 安装Python依赖..."
pip3 install -r requirements.txt

echo "✅ 设置完成！"
echo "💡 使用方法:"
echo "   python3 scripts/stock_search.py 'AAPL'"
echo "   或者在虚拟环境中:"
echo "   source scripts/venv/bin/activate"
echo "   python scripts/stock_search.py 'AAPL'"


