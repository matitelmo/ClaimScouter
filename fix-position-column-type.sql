-- Fix position column to handle larger numbers
-- Run this if you want to use larger position values

ALTER TABLE public.waitlist 
ALTER COLUMN position TYPE BIGINT;

-- Verify the change
SELECT 
    column_name, 
    data_type,
    numeric_precision
FROM information_schema.columns 
WHERE table_name = 'waitlist' 
AND column_name = 'position'; 