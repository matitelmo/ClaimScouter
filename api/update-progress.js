import { supabase, supabaseAdmin } from '../lib/supabase.js';

export default async function handler(req, res) {
  console.log('=== UPDATE PROGRESS ENDPOINT CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { email, flowProgress } = req.body;
    
    // Validate input
    if (!email || !flowProgress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and flowProgress are required' 
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Valid progress steps
    const validProgressSteps = [
      'email_entered',
      'name_captured', 
      'search_started',
      'search_completed',
      'viewed_upgrade',
      'joined_waitlist'
    ];
    
    if (!validProgressSteps.includes(flowProgress)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid flow progress value' 
      });
    }

    // Use admin client if available, otherwise use regular client
    const client = supabaseAdmin || supabase;
    console.log('Using client:', supabaseAdmin ? 'admin' : 'anon');

    // Update the flow progress
    console.log('Updating flow progress for:', normalizedEmail, 'to:', flowProgress);
    
    const { data, error } = await client
      .from('waitlist')
      .update({ flow_progress: flowProgress })
      .eq('email', normalizedEmail)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      
      // If it's an RLS error, we might need special handling
      if (error.code === '42501') {
        return res.status(500).json({ 
          success: false, 
          error: 'Permission error updating progress' 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update progress' 
      });
    }

    console.log('Update successful:', data);
    
    return res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      flowProgress: flowProgress
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}; 