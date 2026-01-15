-- ============================================
-- Create Admin Account
-- ============================================
-- This script creates an admin account without email verification
-- Username: zwz
-- Password: Ihatevex@123
-- ============================================

-- Step 1: Insert user into auth.users (bypassing email verification)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  is_super_admin,
  confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'zwz@admin.wocon',
  crypt('Ihatevex@123', gen_salt('bf')),
  now(),
  '{"username": "zwz", "role": "admin"}',
  now(),
  now(),
  now(),
  '{"provider": "email"}',
  true,
  ''
);

-- Step 2: The trigger will automatically create the profile record
-- Verify the admin account was created
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data->>'username' as username,
  u.raw_user_meta_data->>'role' as role,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'zwz@admin.wocon';

-- ============================================
-- Admin Account Created Successfully
-- ============================================
-- Login credentials:
-- Email: zwz@admin.wocon
-- Username: zwz
-- Password: Ihatevex@123
-- Role: admin
-- Email verified: Yes
-- ============================================
