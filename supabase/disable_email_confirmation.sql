-- Disable email confirmation for development
-- WARNING: Only use this in development environment!

-- Update auth settings to disable email confirmation
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Alternative: Change the email confirmation setting in Supabase Dashboard
-- Go to: Authentication > Settings > Enable Email Confirmations = OFF

-- Note: This is a one-time script to confirm all existing unconfirmed users
-- For new users, you need to disable email confirmation in the dashboard
