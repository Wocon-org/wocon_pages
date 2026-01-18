// ============================================// Auth API Methods// ============================================
import { supabase } from '@/lib/supabase';
import type { ApiResponse } from '@/lib/api-client';

export async function signUp(email: string, password: string, username: string): Promise<ApiResponse<any>> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: { username },
    },
  });
  return { data, error };
}

export async function signInWithEmail(email: string): Promise<ApiResponse<any>> {
  const { data, error } = await supabase.auth.signInWithOtp({ email });
  return { data, error };
}

export async function signInWithPassword(email: string, password: string): Promise<ApiResponse<any>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithOAuth(provider: 'github' | 'google' | 'facebook' | 'linkedin'): Promise<ApiResponse<any>> {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider });
  return { data, error };
}

export async function signOut(): Promise<ApiResponse<any>> {
  const { error } = await supabase.auth.signOut();
  return { data: null, error };
}

export async function getCurrentUser(): Promise<ApiResponse<any>> {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
}