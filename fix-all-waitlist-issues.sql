-- Comprehensive fix for all waitlist issues

-- 1. First, disable RLS temporarily to make changes
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;

-- 2. Fix the position column type (if not already BIGINT)
DO $$
BEGIN
    -- Check if position is still INTEGER
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'waitlist' 
        AND column_name = 'position' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE public.waitlist ALTER COLUMN position TYPE BIGINT;
        RAISE NOTICE 'Changed position column to BIGINT';
    ELSE
        RAISE NOTICE 'Position column is already BIGINT or another type';
    END IF;
END $$;

-- 3. Add missing columns if they don't exist
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS referral_source TEXT;

ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS flow_progress TEXT DEFAULT 'email_entered';

-- 4. Drop ALL existing policies (comprehensive list)
DO $$
DECLARE
    policy_rec RECORD;
BEGIN
    FOR policy_rec IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'waitlist' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.waitlist', policy_rec.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_rec.policyname;
    END LOOP;
END $$;

-- 5. Re-enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 6. Create simple, permissive policies
CREATE POLICY "anon_can_insert" ON public.waitlist
AS PERMISSIVE
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "anon_can_update" ON public.waitlist
AS PERMISSIVE
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- 7. Grant all necessary permissions to anon
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT, UPDATE ON TABLE public.waitlist TO anon;

-- 8. Grant sequence permissions if any sequences exist
DO $$
BEGIN
    -- Grant permissions on all sequences in public schema
    EXECUTE (
        SELECT string_agg('GRANT USAGE, SELECT ON SEQUENCE ' || quote_ident(sequence_name) || ' TO anon;', ' ')
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'No sequences to grant permissions on';
END $$;

-- 9. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON public.waitlist(position);
CREATE INDEX IF NOT EXISTS idx_waitlist_flow_progress ON public.waitlist(flow_progress);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_source ON public.waitlist(referral_source);

-- 10. Verify the fix
SELECT 'VERIFICATION RESULTS:' as info;

-- Check column types
SELECT 
    'Column Types:' as check_type,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'waitlist' 
AND table_schema = 'public'
AND column_name IN ('position', 'referral_source', 'flow_progress');

-- Check RLS status
SELECT 
    'RLS Status:' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'waitlist'
AND schemaname = 'public';

-- Check policies
SELECT 
    'Policies:' as check_type,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'waitlist'
AND schemaname = 'public';

-- Check permissions
SELECT 
    'Permissions:' as check_type,
    privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon'
AND table_name = 'waitlist'
AND table_schema = 'public'; 