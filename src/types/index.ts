// ============================================
// wocon Type Definitions
// ============================================

export interface Profile {
  id: string
  username: string
  nickname: string | null
  email: string
  score: number
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  name: string
  description: string | null
  type: 'private' | 'recruiting'
  max_participants: number
  is_public: boolean
  cover_image_url: string | null
  owner_id: string
  created_at: string
  updated_at: string
  participant_count?: number
  participants?: Profile[]
}

export interface TripParticipant {
  id: string
  trip_id: string
  user_id: string
  status: 'pending' | 'accepted' | 'declined'
  joined_at: string
  created_at: string
}

export interface MapMarker {
  id: string
  trip_id: string
  lat: number
  lng: number
  title: string | null
  description: string | null
  category: 'point_of_interest' | 'accommodation' | 'restaurant' | 'attraction' | 'transport' | 'other'
  order_index: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface Route {
  id: string
  trip_id: string
  name: string | null
  description: string | null
  coordinates: Array<[number, number]>
  distance: number | null
  duration: number | null
  color: string
  order_index: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateTripInput {
  name: string
  description?: string
  type: 'private' | 'recruiting'
  max_participants: number
  is_public: boolean
}

export interface CreateMarkerInput {
  trip_id: string
  lat: number
  lng: number
  title?: string
  description?: string
  category?: MapMarker['category']
}

export interface CreateRouteInput {
  trip_id: string
  name?: string
  description?: string
  coordinates: Array<[number, number]>
  color?: string
}

export interface UpdateProfileInput {
  username?: string
  nickname?: string
  bio?: string
  avatar_url?: string
}
