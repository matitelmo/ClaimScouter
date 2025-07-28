import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Optional service key

console.log('=== SUPABASE INITIALIZATION ===');
console.log('URL configured:', !!supabaseUrl);
console.log('URL value:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET');
console.log('Anon key configured:', !!supabaseAnonKey);
console.log('Anon key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);
console.log('Service key configured:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing Supabase environment variables');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET');
  throw new Error('Missing Supabase environment variables');
}

// Create client with anon key (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
console.log('Anon client created successfully');

// Create service client for admin operations (bypasses RLS) - only if service key is provided
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
console.log('Admin client created:', !!supabaseAdmin);

// Helper function to get the next position in the waitlist
export async function getNextWaitlistPosition() {
  console.log('--- getNextWaitlistPosition called ---');
  
  // Try using admin client first, fall back to a stored counter
  const client = supabaseAdmin || supabase;
  console.log('Using client type:', supabaseAdmin ? 'admin' : 'anon');
  
  try {
    const { data, error } = await client
      .from('waitlist')
      .select('position')
      .order('position', { ascending: false })
      .limit(1);

    if (error) {
      // If we can't read due to RLS, use a timestamp-based position
      // This ensures unique positions even without reading the table
      console.log('Cannot read position due to error:', error.message);
      console.log('Error code:', error.code);
      console.log('Using timestamp-based position');
      const position = Math.floor(Date.now() / 1000) - 1700000000;
      console.log('Generated position:', position);
      return position;
    }

    if (!data || data.length === 0) {
      console.log('No existing positions found, starting at 1');
      return 1; // First person in the waitlist
    }

    const nextPosition = data[0].position + 1;
    console.log('Found highest position:', data[0].position);
    console.log('Next position will be:', nextPosition);
    return nextPosition;
  } catch (error) {
    console.error('Unexpected error in getNextWaitlistPosition:', error);
    // Fallback to timestamp-based position
    const position = Math.floor(Date.now() / 1000) - 1700000000;
    console.log('Using fallback timestamp position:', position);
    return position;
  }
}

// Helper function to check if email already exists
export async function emailExists(email) {
  console.log('--- emailExists called for:', email);
  
  // If we don't have admin access, we can't check for duplicates
  // The database unique constraint will handle it
  if (!supabaseAdmin) {
    console.log('No admin client available, skipping email check');
    console.log('Will rely on database unique constraint');
    return false;
  }
  
  try {
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking email existence:', error.message);
      console.error('Error code:', error.code);
      return false;
    }

    const exists = !!data;
    console.log('Email exists check result:', exists);
    return exists;
  } catch (error) {
    console.error('Unexpected error in emailExists:', error);
    // If we can't check, assume it doesn't exist and let the unique constraint handle it
    return false;
  }
} 