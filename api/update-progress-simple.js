import { updateProgress } from '../lib/supabase-simple.js';

export default async function handler(req, res) {
  console.log('=== UPDATE-PROGRESS-SIMPLE ENDPOINT CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { email, flowProgress } = req.body;
  
  console.log('Extracted email:', email);
  console.log('Extracted flowProgress:', flowProgress);
  
  // Basic validation
  if (!email || !flowProgress) {
    console.log('Validation failed - missing fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Update progress - always returns success
  console.log('Calling updateProgress function...');
  const result = await updateProgress(email, flowProgress);
  console.log('updateProgress result:', result);
  
  // Always return success
  return res.status(200).json({ success: true });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}; 