-- 迁移: 添加白名单系统
-- 描述: 为特定用户提供每日5次报告生成权限
-- 创建时间: 2025-08-09

-- 创建白名单用户表
CREATE TABLE IF NOT EXISTS whitelist_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  daily_report_limit INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加你的邮箱到白名单
INSERT INTO whitelist_users (email, daily_report_limit) 
VALUES ('liuyilan72@outlook.com', 5)
ON CONFLICT (email) DO UPDATE SET 
  daily_report_limit = 5,
  updated_at = NOW();

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_whitelist_users_email ON whitelist_users(email);

-- 添加触发器更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whitelist_users_updated_at 
    BEFORE UPDATE ON whitelist_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 