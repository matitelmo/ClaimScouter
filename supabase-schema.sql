-- Create the waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    source TEXT DEFAULT 'unknown',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);

-- Create an index on position for ordering
CREATE INDEX idx_waitlist_position ON public.waitlist(position);

-- Create an index on created_at for time-based queries
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anonymous users to insert their own data
CREATE POLICY "Anyone can add themselves to waitlist" ON public.waitlist
    FOR INSERT
    WITH CHECK (true);

-- Create a policy that prevents users from viewing the waitlist
CREATE POLICY "Users cannot view waitlist" ON public.waitlist
    FOR SELECT
    USING (false);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_waitlist_updated_at
    BEFORE UPDATE ON public.waitlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions to the anon role (for public access via API)
GRANT INSERT ON public.waitlist TO anon;

-- Optional: Create a view for admin to see waitlist stats
CREATE OR REPLACE VIEW public.waitlist_stats AS
SELECT 
    COUNT(*) as total_signups,
    COUNT(DISTINCT DATE(created_at)) as days_active,
    MIN(created_at) as first_signup,
    MAX(created_at) as last_signup,
    COUNT(DISTINCT source) as unique_sources
FROM public.waitlist;

-- Grant read access to the stats view for authenticated users (admin)
GRANT SELECT ON public.waitlist_stats TO authenticated;

-- Optional: Function to get waitlist position for a given email (for checking status)
CREATE OR REPLACE FUNCTION get_waitlist_position(user_email TEXT)
RETURNS INTEGER AS $$
DECLARE
    user_position INTEGER;
BEGIN
    SELECT position INTO user_position
    FROM public.waitlist
    WHERE email = LOWER(user_email);
    
    RETURN user_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_waitlist_position TO anon; 