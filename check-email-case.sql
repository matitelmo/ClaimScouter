-- Check if email case sensitivity is the issue

-- 1. Show all emails in the waitlist (as admin)
SELECT 
    email,
    LOWER(email) as email_lower,
    flow_progress,
    created_at
FROM public.waitlist
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 2. Check if your test email exists
SELECT 
    email,
    flow_progress,
    CASE 
        WHEN email = 'test10@test.com' THEN 'Exact match'
        WHEN LOWER(email) = LOWER('test10@test.com') THEN 'Case insensitive match'
        ELSE 'No match'
    END as match_type
FROM public.waitlist
WHERE LOWER(email) = LOWER('test10@test.com');

-- 3. Test update with exact email case
UPDATE public.waitlist 
SET flow_progress = 'manual_update_test'
WHERE email = 'test10@test.com';

-- 4. Test update with LOWER
UPDATE public.waitlist 
SET flow_progress = 'manual_update_lower_test'
WHERE LOWER(email) = LOWER('test10@test.com'); 