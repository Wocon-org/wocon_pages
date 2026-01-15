// ============================================
// wocon Supabase API Functions
// ============================================

import { supabase } from './supabase'
import type {
  Profile,
  Trip,
  TripParticipant,
  MapMarker,
  Route,
  CreateTripInput,
  CreateMarkerInput,
  CreateRouteInput,
  UpdateProfileInput,
} from '@/types'

// ============================================
// AUTHENTICATION
// ============================================

export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: { username },
    },
  })
  return { data, error }
}

export async function signInWithEmail(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({ email })
  return { data, error }
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signInWithOAuth(provider: 'github' | 'google' | 'facebook' | 'linkedin') {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// ============================================
// PROFILES
// ============================================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function updateProfile(userId: string, updates: UpdateProfileInput) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  return updateProfile(userId, { avatar_url: avatarUrl })
}

// ============================================
// TRIPS
// ============================================

export async function getTrips(filters?: {
  type?: 'private' | 'recruiting'
  is_public?: boolean
  limit?: number
}) {
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
  return { data, error }
}

export async function getTripById(tripId: string) {
  const { data, error } = await supabase
    .from('trips_with_participants')
    .select('*')
    .eq('id', tripId)
    .single()
  return { data, error }
}

export async function getTripsByOwner(ownerId: string) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createTrip(input: CreateTripInput) {
  const user = (await getCurrentUser()).user
  if (!user) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('trips')
    .insert({
      ...input,
      owner_id: user.id,
    })
    .select()
    .single()
  return { data, error }
}

export async function updateTrip(tripId: string, updates: Partial<Trip>) {
  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)
    .select()
    .single()
  return { data, error }
}

export async function deleteTrip(tripId: string) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
  return { error }
}

// ============================================
// TRIP PARTICIPANTS
// ============================================

export async function joinTrip(tripId: string) {
  const user = (await getCurrentUser()).user
  if (!user) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('trip_participants')
    .insert({
      trip_id: tripId,
      user_id: user.id,
      status: 'pending',
    })
    .select()
    .single()
  return { data, error }
}

export async function acceptParticipant(participantId: string) {
  const { data, error } = await supabase
    .from('trip_participants')
    .update({ status: 'accepted' })
    .eq('id', participantId)
    .select()
    .single()
  return { data, error }
}

export async function declineParticipant(participantId: string) {
  const { data, error } = await supabase
    .from('trip_participants')
    .update({ status: 'declined' })
    .eq('id', participantId)
    .select()
    .single()
  return { data, error }
}

export async function leaveTrip(tripId: string) {
  const user = (await getCurrentUser()).user
  if (!user) return { error: new Error('User not authenticated') }

  const { error } = await supabase
    .from('trip_participants')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
  return { error }
}

export async function getTripParticipants(tripId: string) {
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
  return { data, error }
}

// ============================================
// MAP MARKERS
// ============================================

export async function getMarkersByTrip(tripId: string) {
  const { data, error } = await supabase
    .from('map_markers')
    .select('*')
    .eq('trip_id', tripId)
    .order('order_index', { ascending: true })
  return { data, error }
}

export async function createMarker(input: CreateMarkerInput) {
  const user = (await getCurrentUser()).user
  if (!user) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('map_markers')
    .insert({
      ...input,
      created_by: user.id,
    })
    .select()
    .single()
  return { data, error }
}

export async function updateMarker(markerId: string, updates: Partial<MapMarker>) {
  const { data, error } = await supabase
    .from('map_markers')
    .update(updates)
    .eq('id', markerId)
    .select()
    .single()
  return { data, error }
}

export async function deleteMarker(markerId: string) {
  const { error } = await supabase
    .from('map_markers')
    .delete()
    .eq('id', markerId)
  return { error }
}

// ============================================
// ROUTES
// ============================================

export async function getRoutesByTrip(tripId: string) {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('trip_id', tripId)
    .order('order_index', { ascending: true })
  return { data, error }
}

export async function createRoute(input: CreateRouteInput) {
  const user = (await getCurrentUser()).user
  if (!user) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('routes')
    .insert({
      ...input,
      created_by: user.id,
    })
    .select()
    .single()
  return { data, error }
}

export async function updateRoute(routeId: string, updates: Partial<Route>) {
  const { data, error } = await supabase
    .from('routes')
    .update(updates)
    .eq('id', routeId)
    .select()
    .single()
  return { data, error }
}

export async function deleteRoute(routeId: string) {
  const { error } = await supabase
    .from('routes')
    .delete()
    .eq('id', routeId)
  return { error }
}

// ============================================
// STORAGE
// ============================================

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)

  if (error) return { data: null, error }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  return { data: { path: fileName, url: publicUrl }, error: null }
}

export async function uploadTripCover(tripId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${tripId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('trip-covers')
    .upload(fileName, file)

  if (error) return { data: null, error }

  const { data: { publicUrl } } = supabase.storage
    .from('trip-covers')
    .getPublicUrl(fileName)

  return { data: { path: fileName, url: publicUrl }, error: null }
}

export async function uploadMarkerImage(markerId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${markerId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('marker-images')
    .upload(fileName, file)

  if (error) return { data: null, error }

  const { data: { publicUrl } } = supabase.storage
    .from('marker-images')
    .getPublicUrl(fileName)

  return { data: { path: fileName, url: publicUrl }, error: null }
}
