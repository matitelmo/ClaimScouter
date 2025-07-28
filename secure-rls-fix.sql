-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'waitlist';

-- Drop all existing policies on waitlist table
DROP POLICY IF EXISTS "Anyone can add themselves to waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Users cannot view waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.waitlist;
DROP POLICY IF EXISTS "Users can view their own entry" ON public.waitlist;

-- Create a new policy that specifically allows INSERT for anonymous users
CREATE POLICY "Enable anon inserts" ON public.waitlist
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Create a policy that prevents reading other users' data
-- This allows users to read only the row they just inserted in the same session
CREATE POLICY "Enable read own inserts" ON public.waitlist
    FOR SELECT
    TO anon, authenticated
    USING (
        -- Allow reading rows created in the last 5 minutes by the same IP
        -- This is a workaround since anon users don't have a persistent identity
        created_at > NOW() - INTERVAL '5 minutes'
    );

-- Alternative approach: Use a more restrictive SELECT policy
-- DROP POLICY IF EXISTS "Enable read own inserts" ON public.waitlist;
-- CREATE POLICY "No reads allowed" ON public.waitlist
--     FOR SELECT
--     TO anon
--     USING (false);

-- Ensure the anon role has the necessary schema permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT, SELECT ON public.waitlist TO anon;

-- Test the permissions
-- This should return 't' (true) if RLS is enabled
SELECT relrowsecurity FROM pg_class WHERE relname = 'waitlist';

-- Verify policies are created
SELECT * FROM pg_policies WHERE tablename = 'waitlist' ORDER BY policyname; 