# Google OAuth Setup with Supabase

This guide explains how to configure Google OAuth for authentication in the Streaky application using Supabase Auth.

## Prerequisites

- A Google Cloud Platform account
- A configured Supabase project
- Access to Supabase Dashboard

## Step 1: Create Project in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note the **Project ID** for future reference

## Step 2: Configure OAuth 2.0 Credentials

1. In Google Cloud Console, navigate to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If this is your first time, you'll need to configure the **OAuth consent screen**:
   - User type: **External** (or Internal if using Google Workspace)
   - Complete the application information:
     - App name: `Streaky` (or your preferred name)
     - User support email: your email
     - Developer contact: your email
   - Add necessary scopes (by default, `email`, `profile`, `openid` are sufficient)
   - Add test users if the app is in "Testing" mode

4. Create the **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Name: `Streaky Web Client` (or your preferred name)
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://your-production-domain.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     https://your-production-domain.com/auth/callback
     ```
   
   > **Note:** Replace `[YOUR-PROJECT-REF]` with your Supabase project reference ID. You can find it in your project URL: `https://[YOUR-PROJECT-REF].supabase.co`

5. Click **CREATE**
6. **Copy the Client ID and Client Secret** - you'll need these in the next step

## Step 3: Configure Google OAuth in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list of providers
5. Click the toggle to **enable Google**
6. Enter the credentials:
   - **Client ID (for OAuth)**: Paste the Client ID from Google Cloud Console
   - **Client Secret (for OAuth)**: Paste the Client Secret from Google Cloud Console
7. Click **Save**

## Step 4: Configure Redirect URLs in Supabase

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add the following URLs in **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://your-production-domain.com/auth/callback
   ```
3. Make sure **Site URL** is configured correctly:
   - Development: `http://localhost:3000`
   - Production: `https://your-production-domain.com`

## Step 5: Verify Configuration

### Important Callback URLs

The application redirects to `/auth/callback` after authentication. Make sure this route is configured in:

1. **Google Cloud Console** → OAuth 2.0 Client → Authorized redirect URIs:
   - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback` (Supabase handles this internally)
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://your-production-domain.com/auth/callback` (for production)

2. **Supabase Dashboard** → Authentication → URL Configuration → Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback`

### Authentication Flow

1. User clicks "Sign in with Google"
2. Redirects to Google for authentication
3. Google redirects to Supabase: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
4. Supabase processes authentication and redirects to your app: `http://localhost:3000/auth/callback`
5. Your application handles the session and redirects the user to the dashboard

## Troubleshooting

### Error: "redirect_uri_mismatch"

This error occurs when the redirect URL doesn't match those configured in Google Cloud Console.

**Solution:**
- Verify that all callback URLs are added in **Authorized redirect URIs** in Google Cloud Console
- Make sure the Supabase URL (`https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`) is included
- Check that there are no extra spaces or characters in the URLs

### Error: "invalid_client"

This error indicates that the Client ID or Client Secret are incorrect.

**Solution:**
- Verify that you've correctly copied the Client ID and Client Secret in Supabase Dashboard
- Make sure there are no leading or trailing spaces in the credentials

### Authentication works but user is not redirected correctly

**Solution:**
- Verify that the `/auth/callback` page exists in your application
- Make sure Redirect URLs in Supabase include your correct domain
- Verify that `Site URL` in Supabase is configured correctly

## Environment Variables

No additional environment variables are required for Google OAuth. Credentials are configured directly in the Supabase Dashboard.

The only required environment variables are for Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login/auth-google)
