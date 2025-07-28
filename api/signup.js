import { supabase, supabaseAdmin, getNextWaitlistPosition, emailExists } from '../lib/supabase.js';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { email, name, source = 'unknown' } = req.body;

    // Validate input
    if (!email || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and name are required' 
      });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    // Sanitize and normalize email
    const normalizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();

    // Check if email already exists (only if we have admin access)
    const exists = await emailExists(normalizedEmail);
    if (exists) {
      return res.status(409).json({ 
        success: false, 
        error: 'This email is already on the waitlist' 
      });
    }

    // Get the next position in the waitlist
    const position = await getNextWaitlistPosition();

    // Use admin client if available, otherwise use regular client
    const client = supabaseAdmin || supabase;

    // Insert into database
    const { data, error } = await client
      .from('waitlist')
      .insert([
        {
          email: normalizedEmail,
          name: sanitizedName,
          position: position,
          source: source,
          metadata: {
            user_agent: req.headers['user-agent'] || 'unknown',
            ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
            timestamp: new Date().toISOString()
          }
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(409).json({ 
          success: false, 
          error: 'This email is already on the waitlist' 
        });
      }
      
      // If it's an RLS error, provide more helpful message
      if (error.code === '42501') {
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

    // Return success response
    // If we couldn't get data back due to RLS, just return the position
    const actualPosition = data?.position || position;
    
    return res.status(200).json({
      success: true,
      position: actualPosition,
      message: `You're #${actualPosition} on the waitlist!`
    });

  } catch (error) {
    console.error('Signup error:', error);
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