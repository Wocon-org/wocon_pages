// ============================================// User API Methods// ============================================
import { supabase } from '@/lib/supabase';
import type { ApiResponse } from '@/lib/api-client';
import type {
  Profile,
  UpdateProfileInput
} from '@/types';

export async function getProfile(userId: string): Promise<ApiResponse<Profile>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function updateProfile(userId: string, updates: UpdateProfileInput): Promise<ApiResponse<Profile>> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

export async function updateAvatar(userId: string, avatarUrl: string): Promise<ApiResponse<Profile>> {
  return updateProfile(userId, { avatar_url: avatarUrl });
}

// Storage Methods
export async function uploadAvatar(userId: string, file: File): Promise<ApiResponse<any>> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file);

  if (error) return { data: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return { data: { path: fileName, url: publicUrl }, error: null };
}

export async function uploadTripCover(tripId: string, file: File): Promise<ApiResponse<any>> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${tripId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('trip-covers')
    .upload(fileName, file);

  if (error) return { data: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from('trip-covers')
    .getPublicUrl(fileName);

  return { data: { path: fileName, url: publicUrl }, error: null };
}

export async function uploadMarkerImage(markerId: string, file: File): Promise<ApiResponse<any>> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${markerId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('marker-images')
    .upload(fileName, file);

  if (error) return { data: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from('marker-images')
    .getPublicUrl(fileName);

  return { data: { path: fileName, url: publicUrl }, error: null };
}