// ============================================// Map API Methods// ============================================
import { supabase } from '@/lib/supabase';
import type { ApiResponse } from '@/lib/api-client';
import type {
  MapMarker,
  Route,
  CreateMarkerInput,
  CreateRouteInput
} from '@/types';

export async function getMarkersByTrip(tripId: string): Promise<ApiResponse<MapMarker[]>> {
  const { data, error } = await supabase
    .from('map_markers')
    .select('*')
    .eq('trip_id', tripId)
    .order('order_index', { ascending: true })
  return { data, error };
}

export async function createMarker(input: CreateMarkerInput): Promise<ApiResponse<MapMarker>> {
  const user = (await supabase.auth.getUser()).data?.user;
  if (!user) return { data: null, error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' } };

  const { data, error } = await supabase
    .from('map_markers')
    .insert({
      ...input,
      created_by: user.id,
    })
    .select()
    .single()
  return { data, error };
}

export async function updateMarker(markerId: string, updates: Partial<MapMarker>): Promise<ApiResponse<MapMarker>> {
  const { data, error } = await supabase
    .from('map_markers')
    .update(updates)
    .eq('id', markerId)
    .select()
    .single()
  return { data, error };
}

export async function deleteMarker(markerId: string): Promise<ApiResponse<any>> {
  const { error } = await supabase
    .from('map_markers')
    .delete()
    .eq('id', markerId)
  return { data: null, error };
}

// Routes
export async function getRoutesByTrip(tripId: string): Promise<ApiResponse<Route[]>> {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('trip_id', tripId)
    .order('order_index', { ascending: true })
  return { data, error };
}

export async function createRoute(input: CreateRouteInput): Promise<ApiResponse<Route>> {
  const user = (await supabase.auth.getUser()).data?.user;
  if (!user) return { data: null, error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' } };

  const { data, error } = await supabase
    .from('routes')
    .insert({
      ...input,
      created_by: user.id,
    })
    .select()
    .single()
  return { data, error };
}

export async function updateRoute(routeId: string, updates: Partial<Route>): Promise<ApiResponse<Route>> {
  const { data, error } = await supabase
    .from('routes')
    .update(updates)
    .eq('id', routeId)
    .select()
    .single()
  return { data, error };
}

export async function deleteRoute(routeId: string): Promise<ApiResponse<any>> {
  const { error } = await supabase
    .from('routes')
    .delete()
    .eq('id', routeId)
  return { data: null, error };
}
