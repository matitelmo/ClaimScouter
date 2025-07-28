import { supabase, supabaseAdmin, getNextWaitlistPosition, emailExists } from '../lib/supabase.js';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  console.log('=== SIGNUP ENDPOINT CALLED ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('ERROR: Method not allowed:', req.method);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { email, name, source = 'unknown' } = req.body;
    console.log('Extracted data:', { email, name, source });

    // Validate input
    if (!email || !name) {
      console.log('ERROR: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Email and name are required' 
      });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      console.log('ERROR: Invalid email format:', email);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    // Sanitize and normalize email
    const normalizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();
    console.log('Normalized data:', { normalizedEmail, sanitizedName });

    // Check if email already exists (only if we have admin access)
    console.log('Checking if email exists...');
    const exists = await emailExists(normalizedEmail);
    console.log('Email exists result:', exists);
    
    if (exists) {
      console.log('ERROR: Email already on waitlist');
      return res.status(409).json({ 
        success: false, 
        error: 'This email is already on the waitlist' 
      });
    }

    // Get the next position in the waitlist
    console.log('Getting next waitlist position...');
    const position = await getNextWaitlistPosition();
    console.log('Next position:', position);

    // Use admin client if available, otherwise use regular client
    const client = supabaseAdmin || supabase;
    console.log('Using client:', supabaseAdmin ? 'admin' : 'anon');
    console.log('Supabase URL configured:', !!process.env.SUPABASE_URL);
    console.log('Supabase ANON key configured:', !!process.env.SUPABASE_ANON_KEY);
    console.log('Supabase SERVICE key configured:', !!process.env.SUPABASE_SERVICE_KEY);

    // Insert into database
    console.log('Attempting to insert into database...');
    const insertData = {
      email: normalizedEmail,
      name: sanitizedName,
      position: position,
      source: source,
      metadata: {
        user_agent: req.headers['user-agent'] || 'unknown',
        ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        timestamp: new Date().toISOString()
      }
    };
    console.log('Insert data:', JSON.stringify(insertData, null, 2));
    
    const { data, error } = await client
      .from('waitlist')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('=== SUPABASE INSERT ERROR ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        console.log('Unique constraint violation detected');
        return res.status(409).json({ 
          success: false, 
          error: 'This email is already on the waitlist' 
        });
      }
      
      // If it's an RLS error, provide more helpful message
      if (error.code === '42501') {
        console.log('RLS policy violation detected');
        return res.status(500).json({ 
          success: false, 
          error: 'Database permission error. Please contact support.' 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to add to waitlist. Please try again.' 
      });
    }

    console.log('=== INSERT SUCCESS ===');
    console.log('Returned data:', JSON.stringify(data, null, 2));

    // Return success response
    // If we couldn't get data back due to RLS, just return the position
    const actualPosition = data?.position || position;
    
    const response = {
      success: true,
      position: actualPosition,
      message: `You're #${actualPosition} on the waitlist!`
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    return res.status(200).json(response);

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred. Please try again.' 
    });
  }
}

// Handle preflight requests for CORS
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}; 