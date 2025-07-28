-- Alternative approach that works with stricter Supabase configurations

-- First, ensure RLS is enabled
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable anon inserts" ON public.waitlist;
    DROP POLICY IF EXISTS "Enable read own inserts" ON public.waitlist;
    DROP POLICY IF EXISTS "Anyone can add themselves to waitlist" ON public.waitlist;
    DROP POLICY IF EXISTS "Users cannot view waitlist" ON public.waitlist;
    DROP POLICY IF EXISTS "Enable insert for anon users" ON public.waitlist;
    DROP POLICY IF EXISTS "Users can view their own entry" ON public.waitlist;
END $$;

-- Create a single, simple INSERT policy for the anon role
CREATE POLICY "anon_insert_policy" ON public.waitlist
AS PERMISSIVE
FOR INSERT
TO anon
WITH CHECK (true);

-- No SELECT policy for anon users (they can't read any data)
-- This is the most secure approach

-- Grant table-level permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE public.waitlist TO anon;

-- Important: Also grant permissions on any sequences if they exist
-- Since we use UUID, this might not be necessary, but it doesn't hurt
DO $$ 
BEGIN
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Verify the setup
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