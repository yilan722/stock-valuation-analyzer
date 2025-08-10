-- 迁移: 添加 superanalystpro@gmail.com 到白名单
-- 描述: 为 superanalystpro@gmail.com 提供每日5次报告生成权限
-- 创建时间: 2025-01-27

-- 添加 superanalystpro@gmail.com 到白名单
INSERT INTO whitelist_users (email, daily_report_limit) 
VALUES ('superanalystpro@gmail.com', 5)
ON CONFLICT (email) DO UPDATE SET 
  daily_report_limit = 5,
  updated_at = NOW();

-- 验证添加结果
SELECT * FROM whitelist_users WHERE email = 'superanalystpro@gmail.com'; 