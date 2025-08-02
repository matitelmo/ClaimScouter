-- Simple RLS policies for waitlist table
-- Goal: Allow inserts and updates, block reads for security

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "anon_insert_policy" ON public.waitlist;
DROP POLICY IF EXISTS "anon_update_own_progress" ON public.waitlist;
DROP POLICY IF EXISTS "Enable anon inserts" ON public.waitlist;
DROP POLICY IF EXISTS "Enable read own inserts" ON public.waitlist;
DROP POLICY IF EXISTS "Anyone can add themselves to waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Users cannot view waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.waitlist;
DROP POLICY IF EXISTS "Users can view their own entry" ON public.waitlist;

-- Simple INSERT policy - anyone can add to waitlist
CREATE POLICY "allow_insert" ON public.waitlist
FOR INSERT
TO anon
WITH CHECK (true);

-- Simple UPDATE policy - anyone can update (we control what they update in the API)
CREATE POLICY "allow_update" ON public.waitlist
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- NO SELECT policy - this prevents reading the waitlist

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT, UPDATE ON public.waitlist TO anon;

-- Verify the setup
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'waitlist'; 