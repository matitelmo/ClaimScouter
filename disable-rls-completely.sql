-- IMPORTANT: This completely disables RLS for testing
-- Only use this to verify the system works, then re-enable RLS with proper policies

-- 1. Disable RLS completely
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;

-- 2. Grant ALL permissions to anon and authenticated roles
GRANT ALL ON public.waitlist TO anon;
GRANT ALL ON public.waitlist TO authenticated;
GRANT ALL ON public.waitlist TO service_role;

-- 3. Make sure the schema permissions are correct
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 4. Grant sequence permissions if any exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'waitlist';

-- Should show: rowsecurity = false

-- 6. Test insert directly (replace with your test data)
-- INSERT INTO public.waitlist (email, name, position, source) 
-- VALUES ('test@example.com', 'Test User', 1, 'direct_test');

-- 7. Verify the insert worked
-- SELECT * FROM public.waitlist ORDER BY created_at DESC LIMIT 5; 