#!/usr/bin/env node

// Cloudflare Pages专用构建脚本
// 禁用webpack缓存以避免25MB文件大小限制

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始Cloudflare Pages构建...');

// 清理缓存目录
const cacheDirs = ['.next/cache', 'cache'];
cacheDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`🧹 清理缓存目录: ${dir}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// 设置环境变量禁用webpack缓存
process.env.NEXT_WEBPACK_CACHE = 'false';
process.env.NODE_ENV = 'production';

try {
  // 执行构建
  console.log('📦 执行Next.js构建...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_WEBPACK_CACHE: 'false',
      NODE_ENV: 'production'
    }
  });

  // 清理构建后的缓存文件
  console.log('🧹 清理构建后的缓存文件...');
  const buildCacheDir = path.join('.next', 'cache');
  if (fs.existsSync(buildCacheDir)) {
    fs.rmSync(buildCacheDir, { recursive: true, force: true });
    console.log('✅ 已清理构建缓存');
  }

  console.log('✅ Cloudflare Pages构建完成！');
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}
