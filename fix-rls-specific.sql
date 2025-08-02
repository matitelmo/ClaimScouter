-- Specific RLS fix for waitlist table
-- This addresses edge cases where RLS might still be blocking

-- 1. First check if we're using the right anon key
-- Run this query to see what role your API is using:
SELECT current_user, current_role;

-- 2. Temporarily disable RLS to test
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;

-- 3. Test an insert (replace with your test data)
-- If this works, it confirms it's an RLS issue
-- INSERT INTO public.waitlist (email, name, position, source, referral_source, flow_progress)
-- VALUES ('test@example.com', 'Test User', 1, 'test', 'direct', 'email_entered');

-- 4. Re-enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 5. Drop ALL existing policies (more comprehensive)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'waitlist'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.waitlist', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- 6. Create a single, simple INSERT policy with explicit checks
CREATE POLICY "anon_insert_all" ON public.waitlist
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 7. Create UPDATE policy
CREATE POLICY "anon_update_all" ON public.waitlist
AS PERMISSIVE
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 8. Grant schema permissions (sometimes needed)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 9. Grant table permissions
GRANT INSERT, UPDATE ON TABLE public.waitlist TO anon;
GRANT INSERT, UPDATE ON TABLE public.waitlist TO authenticated;

-- 10. Fix any sequence permissions (in case position uses a sequence)
DO $$
BEGIN
    -- Grant permissions on all sequences
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- 11. Verify the setup
SELECT 'Current user/role:' as check_type, current_user, current_role
UNION ALL
SELECT 'RLS enabled:', '', rowsecurity::text FROM pg_tables WHERE tablename = 'waitlist'
UNION ALL
SELECT 'Policies:', policyname, cmd FROM pg_policies WHERE tablename = 'waitlist'
UNION ALL
SELECT 'Permissions:', privilege_type, '' FROM information_schema.table_privileges 
WHERE grantee = 'anon' AND table_name = 'waitlist';

-- 12. Important: Check if you're using the right Supabase key
-- The SUPABASE_ANON_KEY should be the one from:
-- Supabase Dashboard > Settings > API > anon/public key
-- NOT the service_role key 