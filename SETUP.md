# ClaimScouter Waitlist Setup Instructions

## Prerequisites

1. A Supabase account (free tier is fine)
2. A Vercel account
3. Node.js 18+ installed locally

## Step 1: Set up Supabase

1. **Create a new Supabase project** at https://app.supabase.com

2. **Run the SQL schema**:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the entire contents of `supabase-schema.sql`
   - Paste and run it in the SQL editor
   - This will create the `waitlist` table with proper permissions

3. **Get your API keys**:
   - Go to Settings → API in your Supabase dashboard
   - Copy your `Project URL` (looks like: `https://abcdefghijklmnop.supabase.co`)
   - Copy your `anon` public key (a long string starting with `eyJ...`)

## Step 2: Set up Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create a `.env.local` file** in the root directory with your actual values:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...rest-of-your-key
   ```
   
   ⚠️ **Important**: Replace these with your actual values from Step 1.3

3. **Test locally**:
   ```bash
   vercel dev
   ```
   
   Your site should now be running at http://localhost:3000

## Step 3: Deploy to Vercel

1. **Deploy to Vercel**:
   ```bash
   vercel
   ```

2. **Add environment variables to Vercel**:
   - Go to your project dashboard in Vercel
   - Navigate to Settings → Environment Variables
   - Add these variables:
     - `SUPABASE_URL` - Your Supabase project URL (same as in .env.local)
     - `SUPABASE_ANON_KEY` - Your Supabase anon key (same as in .env.local)
   - Make sure they're enabled for Production, Preview, and Development

## Step 4: Test the Setup

1. **Test locally**:
   - Open http://localhost:3000
   - Fill out the form and submit
   - Check the browser console for any errors
   - You should see "Successfully added to waitlist at position: X" in the console

2. **Check Supabase**:
   - Go to Table Editor in Supabase
   - Select the `waitlist` table
   - You should see new entries when users sign up
   - Each entry will have a unique position number

## Troubleshooting

### "Missing Supabase environment variables" Error
This means your `.env.local` file is missing or has incorrect values. Make sure:
1. The file is named exactly `.env.local` (with the dot)
2. It's in the root directory of your project
3. The values are copied correctly from Supabase

### CORS Issues
The Vercel configuration already includes CORS headers. If you still have issues:
1. Check the browser console for specific error messages
2. Ensure your Supabase project allows connections from your domain

### Database Permissions
If signups aren't working:
1. Check that Row Level Security (RLS) is enabled on the `waitlist` table
2. Verify the INSERT policy exists
3. Check Supabase logs for any errors

### Environment Variables
Make sure:
1. No trailing slashes on SUPABASE_URL
2. You're using the `anon` key, not the `service` key
3. Variables are added to Vercel's production environment

## Monitoring

### View Signups
To see all signups in Supabase:
```sql
SELECT * FROM waitlist ORDER BY position DESC;
```

### View Stats
```sql
SELECT * FROM waitlist_stats;
```

### Check for Duplicates
```sql
SELECT email, COUNT(*) 
FROM waitlist 
GROUP BY email 
HAVING COUNT(*) > 1;
``` 