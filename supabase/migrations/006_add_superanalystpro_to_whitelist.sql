-- 迁移: 添加 superanalystpro@gmail.com 到白名单
-- 描述: 为 superanalystpro@gmail.com 提供每日100免费积分
-- 创建时间: 2025-01-27

-- 首先修改白名单用户表结构，添加积分相关字段
ALTER TABLE whitelist_users 
ADD COLUMN IF NOT EXISTS daily_free_credits INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS credits_reset_date DATE DEFAULT CURRENT_DATE;

-- 添加 superanalystpro@gmail.com 到白名单
INSERT INTO whitelist_users (email, daily_report_limit, daily_free_credits, credits_reset_date) 
VALUES ('superanalystpro@gmail.com', 0, 100, CURRENT_DATE)
ON CONFLICT (email) DO UPDATE SET 
  daily_free_credits = 100,
  credits_reset_date = CURRENT_DATE,
  updated_at = NOW();

-- 验证添加结果
SELECT * FROM whitelist_users WHERE email = 'superanalystpro@gmail.com'; 