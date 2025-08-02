import { addToWaitlist } from '../lib/supabase-simple.js';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { email, name, source = 'unknown', referralSource = 'direct', flowProgress = 'email_entered' } = req.body;

  // Basic validation
  if (!email || !name) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and name are required' 
    });
  }

  // Add metadata from request
  const metadata = {
    user_agent: req.headers['user-agent'] || 'unknown',
    ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown'
  };

  // Add to waitlist with metadata
  const result = await addToWaitlist(email, name, source, referralSource, flowProgress, metadata);
  
  // Always return success to the user (even if duplicate)
  if (result.success) {
    return res.status(200).json({
      success: true,
      message: 'Added to waitlist!'
    });
  }

  // Only fail if there's a real error
  return res.status(500).json({ 
    success: false, 
    error: 'Failed to add to waitlist' 
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}; 