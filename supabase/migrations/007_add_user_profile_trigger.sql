-- 创建函数来自动创建用户profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at, free_reports_used, paid_reports_used, monthly_report_limit)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL),
    NEW.created_at,
    NEW.updated_at,
    0,
    0,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器，当新用户注册时自动创建profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 为现有用户创建profile（如果不存在）
INSERT INTO public.users (id, email, name, created_at, updated_at, free_reports_used, paid_reports_used, monthly_report_limit)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', NULL),
  au.created_at,
  COALESCE(au.updated_at, au.created_at),
  0,
  0,
  0
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

