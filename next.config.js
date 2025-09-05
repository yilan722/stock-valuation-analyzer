/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages支持 - 使用Pages Functions
  // output: 'export', // 注释掉，使用Pages Functions支持API路由
  
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
  
  // Webpack优化 - 简化配置
  webpack: (config, { isServer, dev }) => {
    // 基本fallback配置
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    }
    
    return config
  },
  
  // 安全头 - 临时禁用 CSP 以解决 eval 问题
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
          // 临时完全禁用 CSP 以解决 eval 问题
          // {
          //   key: 'Content-Security-Policy',
          //   value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'unsafe-inline' data: blob:; img-src * data: blob:; connect-src * data: blob:; frame-src * data: blob:; font-src * data: blob:; object-src *; media-src *;",
          // },
        ],
      },
    ]
  },
}

module.exports = nextConfig 