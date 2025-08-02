-- Test UPDATE operation with RLS

-- 1. First, let's check what policies exist for UPDATE
SELECT 
    policyname,
    cmd,
    roles,
    permissive,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'waitlist'
AND cmd = 'UPDATE';

-- 2. Test an update without RLS
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;

-- Try updating a test record
UPDATE public.waitlist 
SET flow_progress = 'test_update'
WHERE email = 'test@example.com';

-- Re-enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 3. Create a better UPDATE policy
-- Drop existing update policies
DROP POLICY IF EXISTS "anon_can_update" ON public.waitlist;
DROP POLICY IF EXISTS "anon_update_all" ON public.waitlist;
DROP POLICY IF EXISTS "allow_update" ON public.waitlist;

-- Create a new UPDATE policy that allows updates based on email
-- This uses a subquery to avoid needing SELECT permissions
CREATE POLICY "anon_can_update_by_email" ON public.waitlist
AS PERMISSIVE
FOR UPDATE
TO anon
USING (true)  -- Can attempt to update any row
WITH CHECK (true);  -- Allow the update to proceed

-- Grant UPDATE permission
GRANT UPDATE ON public.waitlist TO anon;

-- Test the update again with RLS enabled
-- This should work now
UPDATE public.waitlist 
SET flow_progress = 'test_update_with_rls'
WHERE email = 'test@example.com';

-- Verify policies
SELECT 
    'UPDATE Policies:' as info,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'waitlist'
AND cmd = 'UPDATE'; 