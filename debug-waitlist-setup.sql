-- Diagnostic script to check waitlist table setup

-- 1. Check column types
SELECT 
    column_name, 
    data_type,
    numeric_precision,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'waitlist' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'waitlist'
AND schemaname = 'public';

-- 3. Check all existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'waitlist'
AND schemaname = 'public';

-- 4. Check permissions for anon role
SELECT 
    privilege_type,
    table_schema,
    table_name
FROM information_schema.table_privileges
WHERE grantee = 'anon'
AND table_name = 'waitlist'
AND table_schema = 'public';

-- 5. Check if anon role exists
SELECT 
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles
WHERE rolname = 'anon';

-- 6. Check current data in waitlist (if any)
SELECT COUNT(*) as total_rows FROM public.waitlist;
SELECT MAX(position) as max_position FROM public.waitlist; 