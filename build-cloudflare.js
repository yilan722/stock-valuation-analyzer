#!/usr/bin/env node

// Cloudflare Pages专用构建脚本
// 优化构建输出以符合Cloudflare Pages要求

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始Cloudflare Pages构建...');

// 设置Cloudflare Pages环境变量
process.env.CF_PAGES = '1';
process.env.NODE_ENV = 'production';

// 清理缓存目录
const cacheDirs = ['.next/cache', 'cache'];
cacheDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`🧹 清理缓存目录: ${dir}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

try {
  // 执行构建
  console.log('📦 执行Next.js构建...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      CF_PAGES: '1',
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

  // 检查构建输出大小
  console.log('📊 检查构建输出大小...');
  const buildDir = '.next';
  if (fs.existsSync(buildDir)) {
    const stats = fs.statSync(buildDir);
    console.log(`📁 构建目录大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }

  console.log('✅ Cloudflare Pages构建完成！');
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}
