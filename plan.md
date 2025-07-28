# ClaimScouter Waitlist Implementation Plan

## Overview
Transform the current frontend-only landing page into a functional waitlist system that stores user signups in Supabase via Vercel Functions.

## Architecture

```
User Browser → Frontend (index.html) → Vercel Function (/api/signup) → Supabase Database
```

## Implementation Steps

### 1. Database Setup (Supabase)

Create a waitlist table with:
- `id` - UUID primary key
- `email` - User's email (unique)
- `name` - User's full name
- `created_at` - Timestamp of signup
- `position` - Their position in the waitlist
- `source` - Where they signed up from (for tracking)
- `metadata` - JSON field for additional data

### 2. Backend Setup (Vercel Functions)

Create API endpoints:
- `/api/signup` - POST endpoint to add users to waitlist
- `/api/waitlist-position` - GET endpoint to check position (optional)

### 3. Environment Variables

Required in Vercel:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key for Supabase
- `SUPABASE_SERVICE_KEY` - Service key for admin operations (optional)

### 4. Frontend Updates

Modify the JavaScript to:
1. Capture form submission
2. Send POST request to `/api/signup`
3. Handle success/error responses
4. Update UI accordingly

### 5. Security Considerations

- Rate limiting on the API endpoint
- Email validation
- CORS configuration
- Input sanitization
- Duplicate email handling

### 6. Data Flow

1. User enters name and email in modal
2. Frontend validates input
3. POST request to `/api/signup` with:
   ```json
   {
     "email": "user@example.com",
     "name": "John Doe",
     "source": "hero_form"
   }
   ```
4. Vercel Function:
   - Validates data
   - Checks for existing email
   - Calculates position
   - Inserts into Supabase
   - Returns response
5. Frontend shows success/error message

### 7. Response Format

Success:
```json
{
  "success": true,
  "position": 1248,
  "message": "You're on the waitlist!"
}
```

Error:
```json
{
  "success": false,
  "error": "Email already registered"
}
```

## File Structure

```
/
├── api/
│   └── signup.js          # Vercel Function
├── lib/
│   └── supabase.js       # Supabase client setup
├── index.html            # Updated with API calls
├── script.js             # Updated with fetch logic
└── .env.local           # Local environment variables
```

## Testing Plan

1. Test successful signup
2. Test duplicate email
3. Test invalid email format
4. Test missing fields
5. Test database connection errors
6. Test rate limiting

## Future Enhancements

1. Email confirmation system
2. Admin dashboard to view signups
3. Export functionality
4. Analytics integration
5. A/B testing different funnel flows
6. Automated email sequences 