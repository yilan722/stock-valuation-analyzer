-- 临时禁用 RLS 以解决认证问题
-- 这个脚本会暂时禁用所有表的 RLS，以便调试认证问题

-- 删除现有的 RLS 策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON public.reports;

-- 禁用 RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;

-- 或者，如果你想保持 RLS 但允许所有操作，可以使用以下策略：
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all operations on users" ON public.users
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations on payments" ON public.payments
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations on reports" ON public.reports
--   FOR ALL USING (true) WITH CHECK (true); 