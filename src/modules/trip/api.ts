// ============================================// Trip API Methods// ============================================import { supabase } from '@/lib/supabase';import type { ApiResponse } from '@/lib/api-client';
import type {
  Trip,
  CreateTripInput,
  UpdateProfileInput
} from '@/types';

export async function getTrips(filters?: {
  type?: 'private' | 'recruiting'
  is_public?: boolean
  limit?: number
}): Promise<ApiResponse<Trip[]>> {
  let query = supabase
    .from('trips_with_participants')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.is_public !== undefined) {
    query = query.eq('is_public', filters.is_public)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query
  return { data, error };
}

export async function getTripById(tripId: string): Promise<ApiResponse<Trip>> {
  const { data, error } = await supabase
    .from('trips_with_participants')
    .select('*')
    .eq('id', tripId)
    .single()
  return { data, error };
}

export async function getTripsByOwner(ownerId: string): Promise<ApiResponse<Trip[]>> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  return { data, error };
}

export async function createTrip(input: CreateTripInput): Promise<ApiResponse<Trip>> {
  const user = (await supabase.auth.getUser()).data?.user;
  if (!user) return { data: null, error: new Error('User not authenticated') };

  const { data, error } = await supabase
    .from('trips')
    .insert({
      ...input,
      owner_id: user.id,
    })
    .select()
    .single()
  return { data, error };
}

export async function updateTrip(tripId: string, updates: Partial<Trip>): Promise<ApiResponse<Trip>> {
  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)
    .select()
    .single()
  return { data, error };
}

export async function deleteTrip(tripId: string): Promise<ApiResponse<any>> {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
  return { data: null, error };
}

// Trip Participants
export async function joinTrip(tripId: string): Promise<ApiResponse<any>> {
  const user = (await supabase.auth.getUser()).data?.user;
  if (!user) return { data: null, error: new Error('User not authenticated') };

  const { data, error } = await supabase
    .from('trip_participants')
    .insert({
      trip_id: tripId,
      user_id: user.id,
      status: 'pending',
    })
    .select()
    .single()
  return { data, error };
}

export async function acceptParticipant(participantId: string): Promise<ApiResponse<any>> {
  const { data, error } = await supabase
    .from('trip_participants')
    .update({ status: 'accepted' })
    .eq('id', participantId)
    .select()
    .single()
  return { data, error };
}

export async function declineParticipant(participantId: string): Promise<ApiResponse<any>> {
  const { data, error } = await supabase
    .from('trip_participants')
    .update({ status: 'declined' })
    .eq('id', participantId)
    .select()
    .single()
  return { data, error };
}

export async function leaveTrip(tripId: string): Promise<ApiResponse<any>> {
  const user = (await supabase.auth.getUser()).data?.user;
  if (!user) return { data: null, error: new Error('User not authenticated') };

  const { error } = await supabase
    .from('trip_participants')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
  return { data: null, error };
}

export async function getTripParticipants(tripId: string): Promise<ApiResponse<any[]>> {
  const { data, error } = await supabase
    .from('trip_participants')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        avatar_url
      )
    `)
    .eq('trip_id', tripId)
    .order('joined_at', { ascending: true })
  return { data, error };
}