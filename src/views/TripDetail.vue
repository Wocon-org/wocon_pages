<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import WoconMap from '@/components/WoconMap.vue'
import Sidebar from '@/components/common/Sidebar.vue'

const router = useRouter()
const route = useRoute()
const showSidebar = ref(false)
const loading = ref(true)
const trip = ref<any>(null)
const isOwner = ref(false)
const isParticipant = ref(false)
const showJoinModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const toast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}

const loadTrip = async () => {
  const tripId = route.params.id as string
  const { data: { user } } = await supabase.auth.getUser()

  try {
    // Get trip details
    const { data: tripData, error } = await supabase
      .from('trips')
      .select(`
        *,
        owner:profiles!trips_owner_id_fkey(username, avatar_url, nickname),
        trip_participants!inner(user_id, status, profile:profiles(username, avatar_url))
      `)
      .eq('id', tripId)
      .single()

    if (error) throw error

    trip.value = tripData

    // Check if current user is owner
    if (user) {
      isOwner.value = tripData.owner_id === user.id
      isParticipant.value = tripData.trip_participants.some((p: any) => p.user_id === user.id && p.status === 'accepted')
    }
  } catch (error: any) {
    console.error('Error loading trip:', error)
    toast('Failed to load trip')
  } finally {
    loading.value = false
  }
}

const handleJoinTrip = async () => {
  const tripId = route.params.id as string
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    toast('Please log in to join this trip')
    return
  }

  if (isOwner.value) {
    toast('You are the owner of this trip')
    return
  }

  try {
    // Check if already a participant
    const { data: existing } = await supabase
      .from('trip_participants')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      if (existing.status === 'accepted') {
        toast('You have already joined this trip')
        return
      } else {
        // Update status to accepted
        const { error } = await supabase
          .from('trip_participants')
          .update({ status: 'accepted' })
          .eq('id', existing.id)

        if (error) throw error
      }
    } else {
      // Add new participant
      const { error } = await supabase
        .from('trip_participants')
        .insert({
          trip_id: tripId,
          user_id: user.id,
          status: 'pending'
        })

      if (error) throw error
    }

    toast('Request to join trip sent!')
    showJoinModal.value = false
    loadTrip()
  } catch (error: any) {
    console.error('Error joining trip:', error)
    toast('Failed to join trip')
  }
}

onMounted(() => {
  loadTrip()
})
</script>

<template>
  <div class="trip-detail-container">
    <div class="sidebar-trigger" @click="showSidebar = true"></div>
    <div class="top-logo">
      <router-link to="/">
        <img src="/woconlogo.png" alt="wocon logo" class="page-logo" />
      </router-link>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="trip" class="trip-detail-content">
      <div class="map-section">
        <WoconMap :mode="'trip'" :tripId="trip.id" />
      </div>

      <div class="info-section">
        <div class="trip-header">
          <h1>{{ trip.name }}</h1>
          <div class="trip-badges">
            <span v-if="trip.is_public" class="badge public">Public</span>
            <span v-else class="badge private">Private</span>
            <span v-if="trip.type === 'recruiting'" class="badge recruiting">Recruiting</span>
            <span v-else class="badge invite-only">Invite Only</span>
          </div>
        </div>

        <div v-if="trip.description" class="trip-description">
          <h2>Description</h2>
          <p>{{ trip.description }}</p>
        </div>

        <div class="trip-owner">
          <h2>Organizer</h2>
          <div class="owner-info">
            <div class="owner-avatar">
              <img v-if="trip.owner.avatar_url" :src="trip.owner.avatar_url" :alt="trip.owner.username" />
              <div v-else class="avatar-placeholder">{{ (trip.owner.nickname || trip.owner.username)?.charAt(0).toUpperCase() }}</div>
            </div>
            <div class="owner-details">
              <div class="owner-name">{{ trip.owner.nickname || trip.owner.username }}</div>
              <div class="owner-username">@{{ trip.owner.username }}</div>
            </div>
          </div>
        </div>

        <div class="trip-participants">
          <h2>Participants ({{ trip.trip_participants?.filter((p: any) => p.status === 'accepted').length || 0 }})</h2>
          <div class="participants-list">
            <div v-for="participant in trip.trip_participants?.filter((p: any) => p.status === 'accepted')" :key="participant.user_id" class="participant-item">
              <div class="participant-avatar">
                <img v-if="participant.profile.avatar_url" :src="participant.profile.avatar_url" :alt="participant.profile.username" />
                <div v-else class="avatar-placeholder">{{ (participant.profile.username)?.charAt(0).toUpperCase() }}</div>
              </div>
              <div class="participant-name">@{{ participant.profile.username }}</div>
            </div>
            <div v-if="!trip.trip_participants || trip.trip_participants.filter((p: any) => p.status === 'accepted').length === 0" class="no-participants">
              No participants yet
            </div>
          </div>
        </div>

        <div v-if="trip.type === 'recruiting' && !isOwner && !isParticipant" class="trip-actions">
          <button class="btn btn-primary" @click="handleJoinTrip">
            Join This Trip
          </button>
        </div>

        <div v-else-if="isParticipant" class="trip-actions">
          <div class="joined-badge">
            ✓ You have joined this trip
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error">
      <h2>Trip not found</h2>
      <button class="btn btn-secondary" @click="router.push('/')">Back to Home</button>
    </div>

    <Sidebar :showSidebar="showSidebar" @update:showSidebar="showSidebar = $event" />

    <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
  </div>
</template>

<style scoped>
.trip-detail-container {
  min-height: 100vh;
  background: #0d1117;
  position: relative;
}

.sidebar-trigger {
  position: absolute;
  bottom: 40px;
  left: 20px;
  width: 48px;
  height: 48px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
}

.sidebar-trigger::before {
  content: '';
  display: block;
  width: 20px;
  height: 2px;
  background: #8b949e;
  box-shadow:
    0 -6px 0 #8b949e,
    0 6px 0 #8b949e;
}

.top-logo {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
}

.top-logo a {
  display: block;
}

.page-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.2s ease;
}

.page-logo:hover {
  transform: scale(1.05);
}

.trip-detail-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  min-height: 100vh;
}

.map-section {
  height: 100vh;
  position: relative;
}

.info-section {
  background: #161b22;
  padding: 80px 40px 40px;
  overflow-y: auto;
  border-left: 1px solid #30363d;
}

.trip-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #30363d;
}

.trip-header h1 {
  color: #c9d1d9;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.trip-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge.public {
  background: rgba(35, 134, 54, 0.2);
  color: #3fb950;
}

.badge.private {
  background: rgba(210, 153, 34, 0.2);
  color: #d29922;
}

.badge.recruiting {
  background: rgba(88, 166, 255, 0.2);
  color: #58a6ff;
}

.badge.invite-only {
  background: rgba(139, 148, 158, 0.2);
  color: #8b949e;
}

.trip-description {
  margin-bottom: 32px;
}

.trip-description h2 {
  color: #c9d1d9;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.trip-description p {
  color: #8b949e;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.trip-owner {
  margin-bottom: 32px;
  padding: 20px;
  background: #0d1117;
  border-radius: 8px;
}

.trip-owner h2 {
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.owner-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.owner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #238636;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.owner-details {
  flex: 1;
}

.owner-name {
  color: #c9d1d9;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.owner-username {
  color: #8b949e;
  font-size: 14px;
}

.trip-participants {
  margin-bottom: 32px;
}

.trip-participants h2 {
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #0d1117;
  border-radius: 8px;
}

.participant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.participant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.participant-name {
  color: #c9d1d9;
  font-size: 14px;
}

.no-participants {
  color: #8b949e;
  font-size: 14px;
  text-align: center;
  padding: 24px;
}

.trip-actions {
  padding: 20px;
  background: #0d1117;
  border-radius: 8px;
}

.btn {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(27, 31, 36, 0.15);
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.btn-primary {
  background: #238636;
  border-color: rgba(240, 246, 252, 0.1);
}

.btn-primary:hover {
  background: #2ea043;
}

.btn-secondary {
  background: #21262d;
  border-color: rgba(240, 246, 252, 0.1);
}

.btn-secondary:hover {
  background: #30363d;
}

.joined-badge {
  text-align: center;
  color: #3fb950;
  font-size: 16px;
  font-weight: 500;
  padding: 12px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #30363d;
  border-top-color: #238636;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
}

.error h2 {
  color: #c9d1d9;
  margin: 0;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #238636;
  border: 1px solid #2ea043;
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 14px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease, transform 0.22s ease;
  max-width: 400px;
  text-align: center;
  z-index: 9999;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

@media (max-width: 1024px) {
  .trip-detail-content {
    grid-template-columns: 1fr;
  }

  .map-section {
    height: 50vh;
  }

  .info-section {
    padding: 40px 20px;
  }
}
</style>
