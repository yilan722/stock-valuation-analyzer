/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用静态导出（可选）
  // output: 'export',
  
  // 图片优化
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 重定向配置
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
    ]
  },
  
  // 压缩配置
  compress: true,
  
  // 生产环境优化
  swcMinify: true,
  
  // 安全头
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.nuwaapi.com https://www.alphavantage.co; frame-src 'self' https://www.paypal.com;",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 