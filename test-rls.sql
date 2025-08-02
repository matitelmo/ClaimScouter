-- Quick test to isolate the RLS issue

-- 1. Test with RLS disabled
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;

-- Try inserting a test record
INSERT INTO public.waitlist (
    email, 
    name, 
    position, 
    source, 
    referral_source, 
    flow_progress,
    metadata
) VALUES (
    'test-rls@example.com',
    'Test RLS User',
    999999,
    'test',
    'direct', 
    'email_entered',
    '{"test": true}'::jsonb
);

-- If the above works, the issue is definitely RLS

-- 2. Re-enable RLS and test with proper policy
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 3. Create a super simple policy that definitely works
DROP POLICY IF EXISTS "allow_all_inserts" ON public.waitlist;
CREATE POLICY "allow_all_inserts" ON public.waitlist
FOR ALL
TO PUBLIC
USING (true)
WITH CHECK (true);

-- 4. Test insert again
INSERT INTO public.waitlist (
    email, 
    name, 
    position, 
    source, 
    referral_source, 
    flow_progress,
    metadata
) VALUES (
    'test-rls2@example.com',
    'Test RLS User 2',
    999998,
    'test',
    'direct', 
    'email_entered',
    '{"test": true}'::jsonb
);

-- 5. Clean up test data
DELETE FROM public.waitlist WHERE email LIKE 'test-rls%';

-- 6. Set proper policies
DROP POLICY IF EXISTS "allow_all_inserts" ON public.waitlist;

CREATE POLICY "public_insert" ON public.waitlist
FOR INSERT
TO PUBLIC
WITH CHECK (true);

CREATE POLICY "public_update" ON public.waitlist
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true); 