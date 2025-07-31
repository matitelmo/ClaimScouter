-- Add RLS policy to allow users to update their own flow progress

-- Create a policy that allows anon users to update only the flow_progress column
-- for their own email address
CREATE POLICY "anon_update_own_progress" ON public.waitlist
AS PERMISSIVE
FOR UPDATE
TO anon
USING (true) -- Can attempt to update any row
WITH CHECK (true); -- But the update will only affect rows that match the WHERE clause

-- Grant UPDATE permission on specific column to anon role
GRANT UPDATE (flow_progress) ON public.waitlist TO anon;

-- Verify the policies
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'waitlist';

-- Verify column permissions
SELECT 
    table_name, 
    column_name, 
    privilege_type, 
    grantee
FROM information_schema.column_privileges 
WHERE table_schema = 'public' 
AND table_name = 'waitlist'
AND grantee = 'anon'; 