-- Debug why UPDATE operations aren't working

-- 1. First, check if records exist (run as admin in Supabase dashboard)
SELECT email, flow_progress, created_at 
FROM public.waitlist 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Test UPDATE without RLS (as admin)
UPDATE public.waitlist 
SET flow_progress = 'test_admin_update' 
WHERE email = 'test10@test.com';

-- Check if it worked
SELECT email, flow_progress 
FROM public.waitlist 
WHERE email = 'test10@test.com';

-- 3. Create a function that bypasses RLS for updates
CREATE OR REPLACE FUNCTION public.update_flow_progress(
    user_email TEXT,
    new_progress TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- This runs with the privileges of the function owner (bypasses RLS)
AS $$
BEGIN
    UPDATE public.waitlist 
    SET flow_progress = new_progress,
        updated_at = NOW()
    WHERE LOWER(email) = LOWER(user_email);
    
    -- Return true if at least one row was updated
    RETURN FOUND;
END;
$$;

-- Grant execute permission to anon
GRANT EXECUTE ON FUNCTION public.update_flow_progress TO anon;

-- Test the function
SELECT update_flow_progress('test10@test.com', 'test_function_update');

-- 4. Alternative: Create a more permissive UPDATE policy
-- Drop existing update policies
DROP POLICY IF EXISTS "allow_all_updates" ON public.waitlist;
DROP POLICY IF EXISTS "anon_can_update" ON public.waitlist;

-- Create a policy that allows updates based on email matching
CREATE POLICY "update_by_email" ON public.waitlist
FOR UPDATE
TO anon
USING (true)  -- Can attempt to update any row
WITH CHECK (true);  -- Allow the update to proceed

-- 5. Check current RLS and policies
SELECT 
    'RLS Enabled:' as check,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'waitlist') as value
UNION ALL
SELECT 
    'Update Policies:',
    STRING_AGG(policyname || ' (' || cmd || ')', ', ')
FROM pg_policies 
WHERE tablename = 'waitlist' AND cmd = 'UPDATE'; 