# OAuth (GitHub) Setup

Default site language: English

## Prerequisites
- Supabase project created and configured
- GitHub account with access to Developer Settings
- Environment variables set for Supabase URL and anon key

## Steps
1. Enable GitHub provider in Supabase:
   - Go to Supabase → Authentication → Providers → GitHub
   - Create a new GitHub OAuth App:
     - Homepage URL: https://your-domain.example/
     - Authorization callback URL:
       - Production: https://your-domain.example/login/callback
       - Development: http://localhost:5173/login/callback
   - Copy Client ID and Client Secret into Supabase Provider settings

2. Frontend redirect configuration:
   - The app uses `supabase.auth.signInWithOAuth` with `redirectTo = window.location.origin + '/login/callback'`
   - No extra router changes required beyond the `/login/callback` route

3. Routes
   - `/login` for initiating OAuth
   - `/login/callback` for handling the OAuth return (session is set by Supabase)

4. Usage in code
```ts
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: { redirectTo: window.location.origin + '/login/callback' }
})
```

## Notes
- Ensure your Supabase URL and anon key are not exposed in client logs
- For local development, verify the Vite dev server port (default 5173) matches the callback URL
- GitHub scopes: default scopes are sufficient for basic login; do not request extra scopes unless necessary
