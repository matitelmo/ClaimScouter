import { createClient } from '@supabase/supabase-js';

// Simple Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Single client - no admin/anon distinction needed
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Simple function to add to waitlist
export async function addToWaitlist(email, name, source, referralSource, flowProgress, metadata = {}) {
  // Always use position 1 for simplicity
  const position = 1;
  
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{
        email: email.toLowerCase().trim(),
        name: name.trim(),
        position: position,
        source: source,
        referral_source: referralSource,
        flow_progress: flowProgress,
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata  // Include any additional metadata passed in
        }
      }]);
      // Removed .select() and .single() - RLS blocks SELECT for anon users

    if (error) {
      // If duplicate email, that's fine - just return success
      if (error.code === '23505') {
        return { 
          success: true, 
          alreadyExists: true,
          position: position 
        };
      }
      throw error;
    }

    return { 
      success: true, 
      position: position,  // Always 1
      data: null  // No data returned due to RLS
    };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Simple function to update progress
export async function updateProgress(email, flowProgress) {
  console.log('=== UPDATE PROGRESS CALLED ===');
  console.log('Email:', email);
  console.log('Flow Progress:', flowProgress);
  
  try {
    // First try using the RPC function (if it exists)
    const { data: rpcData, error: rpcError } = await supabase.rpc('update_flow_progress', {
      user_email: email.toLowerCase().trim(),
      new_progress: flowProgress
    });
    
    if (rpcError) {
      console.log('RPC function not available or failed:', rpcError.message);
      console.log('Falling back to standard UPDATE...');
      
      // Fallback to standard update
      const { error } = await supabase
        .from('waitlist')
        .update({ flow_progress: flowProgress })
        .eq('email', email.toLowerCase().trim());
      
      if (error) {
        console.error('Standard update also failed:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
      } else {
        console.log('Standard update completed without error');
      }
    } else {
      console.log('RPC update successful:', rpcData);
      if (rpcData === false) {
        console.warn('WARNING: RPC returned false - no rows were updated');
        console.warn('Possible reasons: email not found or already has this progress value');
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating progress:', error);
    return { success: true }; // Return success anyway - not critical
  }
} 