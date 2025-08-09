-- 检查 RLS 状态的脚本
-- 运行这个脚本来查看当前的表和 RLS 策略状态

-- 检查表是否存在
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'payments', 'reports');

-- 检查 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'payments', 'reports');

-- 检查用户表的数据
SELECT 
  id,
  email,
  created_at,
  free_reports_used,
  paid_reports_used
FROM public.users 
LIMIT 5;

-- 检查认证用户
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
LIMIT 5; 