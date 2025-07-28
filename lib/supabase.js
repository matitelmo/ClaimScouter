import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Optional service key

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create client with anon key (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Create service client for admin operations (bypasses RLS) - only if service key is provided
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Helper function to get the next position in the waitlist
export async function getNextWaitlistPosition() {
  // Try using admin client first, fall back to a stored counter
  const client = supabaseAdmin || supabase;
  
  try {
    const { data, error } = await client
      .from('waitlist')
      .select('position')
      .order('position', { ascending: false })
      .limit(1);

    if (error) {
      // If we can't read due to RLS, use a timestamp-based position
      // This ensures unique positions even without reading the table
      console.log('Cannot read position due to RLS, using timestamp-based position');
      return Math.floor(Date.now() / 1000) - 1700000000; // Offset to get reasonable numbers
    }

    if (!data || data.length === 0) {
      return 1; // First person in the waitlist
    }

    return data[0].position + 1;
  } catch (error) {
    // Fallback to timestamp-based position
    return Math.floor(Date.now() / 1000) - 1700000000;
  }
}

// Helper function to check if email already exists
export async function emailExists(email) {
  // If we don't have admin access, we can't check for duplicates
  // The database unique constraint will handle it
  if (!supabaseAdmin) {
    console.log('Cannot check email existence without admin access, relying on unique constraint');
    return false;
  }
  
  try {
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking email:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    // If we can't check, assume it doesn't exist and let the unique constraint handle it
    return false;
  }
} 