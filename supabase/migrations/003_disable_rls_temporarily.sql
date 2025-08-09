-- Temporarily disable RLS for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create more permissive policies
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- CREATE POLICY "Allow all operations for authenticated users" ON public.users
--   FOR ALL USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow all operations for service role" ON public.users
--   FOR ALL USING (auth.role() = 'service_role'); 