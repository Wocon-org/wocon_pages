# OAuth Guide

## Overview

Wocon uses Supabase Authentication to handle user authentication, including support for third-party OAuth providers. This guide will walk you through setting up and configuring OAuth for your Wocon project.

## Supported OAuth Providers

Supabase Authentication supports the following OAuth providers out-of-the-box:

- **Google**
- **GitHub**
- **Facebook**
- **Twitter** (X)
- **Discord**
- **LinkedIn**
- **Apple**
- **Microsoft**

## Configuration

### 1. Supabase Dashboard Setup

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Enable the OAuth providers you want to use
5. For each provider, you'll need to:
   - Enter the **Client ID**
   - Enter the **Client Secret**
   - Configure the **Redirect URI**

### 2. Provider-Specific Setup

#### Google

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application** as the application type
6. Enter a name for your OAuth client
7. Add the following redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**
10. Paste these values into your Supabase Dashboard

#### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Enter the **Application name** (e.g., "Wocon")
4. Enter the **Homepage URL** (e.g., "https://your-wocon-app.com")
5. Enter the **Application description**
6. Enter the **Authorization callback URL**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
7. Click **Register application**
8. Copy the **Client ID**
9. Click **Generate a new client secret**
10. Copy the **Client Secret**
11. Paste these values into your Supabase Dashboard

#### Other Providers

For detailed setup instructions for other providers, refer to the [Supabase Authentication documentation](https://supabase.com/docs/guides/auth#third-party-providers).

## Implementation

### Frontend Integration

#### Sign In with OAuth

```typescript
import { supabase } from '@/lib/supabase'

const signInWithOAuth = async (provider: 'google' | 'github' | 'facebook' | 'twitter' | 'discord' | 'linkedin' | 'apple' | 'microsoft') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
      scopes: provider === 'google' ? 'email profile' : undefined
    }
  })

  if (error) {
    console.error('OAuth sign in error:', error)
  }
}
```

#### Sign Out

```typescript
const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign out error:', error)
  }
}
```

### Handling Redirects

After the user authenticates with the OAuth provider, they will be redirected back to your application. You need to handle this redirect to complete the authentication process.

#### Using the Redirect Method

When using `signInWithOAuth`, Supabase will redirect the user to the OAuth provider's login page. After authentication, the user will be redirected back to your application with an access code.

Supabase Auth automatically handles this redirect and exchanges the access code for a session.

#### Using the PKCE Flow (Recommended)

The PKCE (Proof Key for Code Exchange) flow is recommended for single-page applications as it provides better security.

```typescript
const signInWithOAuthPKCE = async (provider: string) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
      skipBrowserRedirect: false // Set to true for manual handling
    }
  })

  if (error) {
    console.error('OAuth error:', error)
  }
}
```

## User Management

### Get Current User

```typescript
import { supabase } from '@/lib/supabase'

const { data: { user } } = await supabase.auth.getUser()
if (user) {
  console.log('Current user:', user)
}
```

### Listen for Auth Changes

```typescript
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'

const currentUser = ref(null)
let authSubscription = null

onMounted(() => {
  // Get initial user
  const { data: { user } } = supabase.auth.getUser()
  currentUser.value = user

  // Listen for auth changes
  authSubscription = supabase.auth.onAuthStateChange((event, session) => {
    currentUser.value = session?.user || null
  })
})

onUnmounted(() => {
  if (authSubscription) {
    authSubscription.data.unsubscribe()
  }
})
```

## User Profiles

### Creating User Profiles

When a user signs up with OAuth, you'll likely want to create a profile for them in your database. You can use a Supabase Database Function and Trigger to automatically create user profiles.

#### 1. Create Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[],
  travel_style TEXT,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### 2. Create Database Function

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3. Create Trigger

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Security Considerations

### 1. OAuth Best Practices

- **Use PKCE Flow**: Always use the PKCE flow for single-page applications
- **Validate Redirect URIs**: Only allow pre-registered redirect URIs
- **Secure Client Secrets**: Never expose client secrets in frontend code
- **Use HTTPS**: Always use HTTPS for your application

### 2. Supabase Security

- **Row Level Security**: Enable RLS on all user-related tables
- **Auth Policies**: Create granular access policies
- **Environment Variables**: Use environment variables for sensitive configuration
- **Service Roles**: Use service roles only for server-side operations

### 3. Rate Limiting

Supabase Auth includes rate limiting to prevent abuse. If you encounter rate limiting issues:

- Implement exponential backoff for retry attempts
- Cache frequently used data
- Optimize your authentication flow

## Troubleshooting

### Common Issues

#### 1. Redirect URI Mismatch

**Error**: "Redirect URI mismatch"

**Solution**:
- Ensure the redirect URI in your OAuth provider's settings matches exactly what's configured in Supabase
- Include the full URL (including protocol: http/https)
- Avoid trailing slashes unless they're part of your actual URL

#### 2. Client ID/Secret Errors

**Error**: "Invalid client ID" or "Invalid client secret"

**Solution**:
- Double-check your client ID and secret
- Ensure you're using the correct credentials for the environment (sandbox vs production)
- Regenerate your client secret if necessary

#### 3. CORS Issues

**Error**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution**:
- Supabase handles CORS for you, but ensure your redirect URI is correctly configured
- Check your browser's developer console for more detailed error messages

#### 4. Session Management

**Error**: "Session not found" or "Invalid session"

**Solution**:
- Ensure you're properly handling the OAuth redirect
- Check that your application is correctly storing and retrieving the session
- Verify that your Supabase client is properly initialized

## Advanced Configuration

### Custom OAuth Providers

If you need to use an OAuth provider not supported by Supabase out-of-the-box, you can implement a custom OAuth flow.

### Token Exchange

For advanced use cases, you may need to exchange the OAuth access token for additional services:

```typescript
// After successful OAuth authentication
const { data: { session } } = await supabase.auth.getSession()
if (session) {
  // Use the access token for additional API calls
  const accessToken = session.provider_token
  // Make API calls to the OAuth provider's API
}
```

### Scopes

You can request additional scopes from OAuth providers to access more user data:

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin,
    scopes: 'email profile https://www.googleapis.com/auth/calendar.readonly'
  }
})
```

## Testing

### Local Development

For local development, you'll need to:

1. Use `http://localhost:5173` as your redirect URI
2. Add this URI to your OAuth provider's allowed redirect URIs
3. Update your Supabase project's site URL to `http://localhost:5173`

### Staging Environment

For staging environments, create separate OAuth applications with appropriate redirect URIs:

1. Create a staging OAuth application in each provider's developer console
2. Configure the staging redirect URI (e.g., `https://staging-wocon.pages.dev`)
3. Update your Supabase staging project's OAuth settings

## Deployment

### Production Environment

When deploying to production:

1. Create production OAuth applications in each provider's developer console
2. Configure the production redirect URI (e.g., `https://wocon.pages.dev`)
3. Update your Supabase production project's OAuth settings
4. Ensure all environment variables are correctly set
5. Test the complete OAuth flow end-to-end

### Cloudflare Pages Setup

When deploying to Cloudflare Pages:

1. Add your OAuth provider credentials as environment variables in Cloudflare Pages
2. Ensure your production URL is correctly configured in both Supabase and your OAuth providers
3. Enable HTTPS (Cloudflare Pages provides this automatically)

## References

- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [PKCE Specification](https://tools.ietf.org/html/rfc7636)

## Support

If you encounter issues with OAuth integration:

1. Check the [Supabase Auth Debugging Guide](https://supabase.com/docs/guides/auth/debugging)
2. Visit the [Supabase Community Forum](https://github.com/supabase/supabase/discussions)
3. Review your OAuth provider's documentation for specific issues
