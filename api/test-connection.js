import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Test 1: Check if we can connect to Supabase
    const { data: testConnection, error: connectionError } = await supabase
      .from('waitlist')
      .select('count')
      .limit(1);
    
    // Test 2: Try to get the count of records
    const { count, error: countError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });
    
    // Test 3: Check RLS policies
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'waitlist' })
      .catch(() => ({ data: null, error: 'RPC function not available' }));
    
    // Return diagnostic information
    return res.status(200).json({
      success: true,
      diagnostics: {
        connection: {
          status: connectionError ? 'failed' : 'success',
          error: connectionError?.message || null
        },
        count: {
          status: countError ? 'failed' : 'success',
          value: count || 0,
          error: countError?.message || null
        },
        policies: {
          status: policyError ? 'failed' : 'success',
          error: policyError || null
        },
        environment: {
          hasUrl: !!process.env.SUPABASE_URL,
          hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
          urlPrefix: process.env.SUPABASE_URL?.substring(0, 30) + '...'
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 