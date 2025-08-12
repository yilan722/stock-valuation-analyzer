// app/sitemap.ts

import { MetadataRoute } from 'next'

// 定义您网站的基础URL
const baseUrl = 'https://superanalyst.pro'

export default function sitemap(): MetadataRoute.Sitemap {
  // 在这里列出您所有需要被收录的页面
  // 这是最重要的部分
  const routes = [
    '/en',          // 英文主页
    '/zh',          // 中文主页 (如果未来有的话)
    // ... 为您网站的其他每个重要页面添加一行
  ]

  // 使用map函数为每个路由生成一个完整的站点地图条目
  const sitemapEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  return sitemapEntries;
}