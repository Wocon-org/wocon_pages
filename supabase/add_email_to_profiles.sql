-- ============================================
-- Add Email Field to Profiles Table
-- ============================================
-- Purpose: Enable username-based login by storing email in profiles table
-- Date: 2026-01-18

-- Step 1: Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Update existing users' email
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Step 3: Verify the update
SELECT 
  p.id,
  p.username,
  p.email as profile_email,
  u.email as auth_email,
  CASE 
    WHEN p.email = u.email THEN 'MATCH' 
    ELSE 'MISMATCH' 
  END as status
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
LIMIT 10;
