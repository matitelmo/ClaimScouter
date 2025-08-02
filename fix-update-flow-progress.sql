-- Comprehensive fix for flow_progress updates

-- 1. Create a SECURITY DEFINER function that bypasses RLS
CREATE OR REPLACE FUNCTION public.update_flow_progress(
    user_email TEXT,
    new_progress TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with owner privileges, bypasses RLS
SET search_path = public
AS $$
DECLARE
    rows_updated INTEGER;
BEGIN
    -- Update using case-insensitive email matching
    UPDATE waitlist 
    SET 
        flow_progress = new_progress,
        updated_at = NOW()
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(user_email));
    
    -- Get number of rows updated
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    
    -- Log for debugging (visible in Supabase logs)
    RAISE NOTICE 'update_flow_progress: email=%, progress=%, rows_updated=%', 
        user_email, new_progress, rows_updated;
    
    -- Return true if at least one row was updated
    RETURN rows_updated > 0;
END;
$$;

-- 2. Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION public.update_flow_progress TO anon;
GRANT EXECUTE ON FUNCTION public.update_flow_progress TO authenticated;

-- 3. Create a companion function to check if email exists (for debugging)
CREATE OR REPLACE FUNCTION public.check_email_exists(
    user_email TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM waitlist 
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(user_email))
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_email_exists TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists TO authenticated;

-- 4. Test the functions
SELECT 
    'Function created successfully' as status,
    check_email_exists('test10@test.com') as email_exists,
    update_flow_progress('test10@test.com', 'test_from_sql') as update_result;

-- 5. Verify current update policies exist
SELECT 
    policyname,
    cmd,
    roles,
    permissive
FROM pg_policies
WHERE tablename = 'waitlist'
AND schemaname = 'public'
ORDER BY cmd, policyname; 