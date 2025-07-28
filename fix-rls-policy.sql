-- First, let's check if RLS is enabled and what policies exist
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'waitlist';

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can add themselves to waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Users cannot view waitlist" ON public.waitlist;

-- Temporarily disable RLS to test
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create a more permissive insert policy for anon users
CREATE POLICY "Enable insert for anon users" ON public.waitlist
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create a policy that allows reading only your own entry (optional, but useful)
CREATE POLICY "Users can view their own entry" ON public.waitlist
    FOR SELECT
    TO anon
    USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Alternative: If the above doesn't work, create a completely open policy for testing
-- DROP POLICY IF EXISTS "Enable insert for anon users" ON public.waitlist;
-- CREATE POLICY "Allow all operations" ON public.waitlist
--     FOR ALL
--     TO anon
--     USING (true)
--     WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'waitlist';

-- Make sure anon role has the right permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.waitlist TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon; 