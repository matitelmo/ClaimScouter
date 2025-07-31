-- Add referral source and flow progress tracking to waitlist table

-- Add referral_source column to track where users came from
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- Add flow_progress column to track how far users got in the funnel
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS flow_progress TEXT DEFAULT 'email_entered';

-- Add an index on flow_progress for analytics queries
CREATE INDEX IF NOT EXISTS idx_waitlist_flow_progress ON public.waitlist(flow_progress);

-- Add an index on referral_source for analytics queries
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_source ON public.waitlist(referral_source);

-- Update existing rows to have default values (optional)
UPDATE public.waitlist 
SET 
    referral_source = COALESCE(referral_source, 'direct'),
    flow_progress = COALESCE(flow_progress, 'email_entered')
WHERE referral_source IS NULL OR flow_progress IS NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'waitlist' 
AND table_schema = 'public'
ORDER BY ordinal_position; 