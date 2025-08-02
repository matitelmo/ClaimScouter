-- Simple fix to ensure UPDATE operations work with RLS

-- 1. Check current UPDATE policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'waitlist' AND cmd = 'UPDATE';

-- 2. Drop any existing UPDATE policies to start fresh
DROP POLICY IF EXISTS "anon_can_update" ON public.waitlist;
DROP POLICY IF EXISTS "anon_update_all" ON public.waitlist;
DROP POLICY IF EXISTS "allow_update" ON public.waitlist;
DROP POLICY IF EXISTS "anon_can_update_by_email" ON public.waitlist;

-- 3. Create a simple UPDATE policy that works
CREATE POLICY "allow_all_updates" ON public.waitlist
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- 4. Ensure anon has UPDATE permission
GRANT UPDATE ON public.waitlist TO anon;

-- 5. Test with a simple update
UPDATE public.waitlist 
SET flow_progress = 'test_working' 
WHERE email IS NOT NULL 
LIMIT 1;

-- 6. Verify the setup
SELECT 'UPDATE permission granted to anon' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.table_privileges
    WHERE grantee = 'anon' 
    AND table_name = 'waitlist'
    AND privilege_type = 'UPDATE'
); 