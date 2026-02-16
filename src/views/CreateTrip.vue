<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/common/Sidebar.vue'
import WoconMap from '@/components/WoconMap.vue'
import { useFeedback } from '@/composables/useFeedback'

const router = useRouter()
const showSidebar = ref(false)
const tripType = ref<'private' | 'recruiting'>('private')
const maxParticipants = ref(2)
const tripName = ref('')
const description = ref('')
const isPublic = ref(false)
const invitedUsers = ref<string[]>([])
const inviteInput = ref('')
const { loading, showToast, toastMessage, toast } = useFeedback()
const userId = ref<string | null>(null)
const createdMarkers = ref<Array<{ lat: number; lng: number }>>([])

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    userId.value = user.id
  } else {
    router.push('/login')
  }
})

const handleCancel = () => {
  router.back()
}

const handleAddInvite = () => {
  const identifier = inviteInput.value.trim()
  if (identifier && !invitedUsers.value.includes(identifier)) {
    invitedUsers.value.push(identifier)
    inviteInput.value = ''
  }
}

const handleRemoveInvite = (identifier: string) => {
  const index = invitedUsers.value.indexOf(identifier)
  if (index > -1) {
    invitedUsers.value.splice(index, 1)
  }
}

const handleMarkerAdd = (lat: number, lng: number) => {
  createdMarkers.value.push({ lat, lng })
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()

  if (!userId.value) {
    toast('Please log in first')
    return
  }

  if (!tripName.value.trim()) {
    toast('Please enter a trip name')
    return
  }

  if (isPublic.value && createdMarkers.value.length === 0) {
    toast('Please add at least one location for a public trip')
    return
  }

  loading.value = true

  try {
    // Create trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        name: tripName.value.trim(),
        type: tripType.value,
        max_participants: maxParticipants.value,
        description: description.value.trim() || null,
        is_public: isPublic.value,
        owner_id: userId.value
      })
      .select()
      .single()

    if (tripError) {
      throw tripError
    }

    // Handle invited users (email or username)
    if (invitedUsers.value.length > 0) {
      for (const identifier of invitedUsers.value) {
        let profileId: string | null = null
        // Try by email
        {
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', identifier)
            .maybeSingle()
          if (profileByEmail?.id) {
            profileId = profileByEmail.id
          }
        }
        // Fallback by username
        if (!profileId) {
          const { data: profileByUsername } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', identifier)
            .maybeSingle()
          if (profileByUsername?.id) {
            profileId = profileByUsername.id
          }
        }

        if (profileId) {
          // Add to trip participants
          await supabase
            .from('trip_participants')
            .insert({
              trip_id: trip.id,
              user_id: profileId,
              status: 'pending'
            })
        }
      }
    }

    // Insert created markers
    if (createdMarkers.value.length > 0) {
      const markersPayload = createdMarkers.value.map(m => ({
        trip_id: trip.id,
        lat: m.lat,
        lng: m.lng
      }))
      const { error: markerError } = await supabase
        .from('map_markers')
        .insert(markersPayload)
      if (markerError) {
        console.error('Error inserting markers:', markerError)
      }
    }

    toast('Trip created successfully!')
    setTimeout(() => {
      router.push(`/`)
    }, 1000)

  } catch (error: any) {
    console.error('Error creating trip:', error)
    toast(error.message || 'Failed to create trip')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="create-trip-container">
    <div class="sidebar-trigger" @click="showSidebar = true"></div>
    <div class="top-logo">
      <router-link to="/">
        <img src="/woconlogo.png" alt="wocon logo" class="page-logo" />
      </router-link>
    </div>

    <div class="create-trip-card">
      <div class="header">
        <h1>Create a new trip</h1>
        <p class="subtitle">Trips are the best way to organize your travel plans and collaborate with others</p>
      </div>

      <div class="content-grid">
        <form class="trip-form form-panel" @submit="handleSubmit">
        <div class="form-section">
          <h3>Trip Name</h3>
          <input
            v-model="tripName"
            type="text"
            class="input-field"
            placeholder="Name your trip..."
          />
        </div>

        <div class="form-section">
          <h3>Trip Type</h3>
          <div class="trip-type-selector">
            <label class="radio-option">
              <input
                v-model="tripType"
                type="radio"
                value="private"
                class="radio-input"
              />
              <div class="radio-content">
                <div class="radio-label">
                  <span class="radio-icon">🔒</span>
                  <span>Private</span>
                </div>
                <p class="radio-description">Only you can see and edit this trip</p>
              </div>
            </label>

            <label class="radio-option">
              <input
                v-model="tripType"
                type="radio"
                value="recruiting"
                class="radio-input"
              />
              <div class="radio-content">
                <div class="radio-label">
                  <span class="radio-icon">👥</span>
                  <span>Recruiting</span>
                </div>
                <p class="radio-description">Open for others to join your trip</p>
              </div>
            </label>
          </div>
        </div>

        <div class="form-section">
          <h3>Maximum Participants</h3>
          <div class="participants-control">
            <button type="button" class="control-btn" @click="maxParticipants = Math.max(1, maxParticipants - 1)">
              −
            </button>
            <input
              v-model.number="maxParticipants"
              type="number"
              class="number-input"
              min="1"
              max="100"
            />
            <button type="button" class="control-btn" @click="maxParticipants = Math.min(100, maxParticipants + 1)">
              +
            </button>
          </div>
          <p class="hint">The maximum number of people who can join this trip</p>
        </div>

        <div class="form-section">
          <h3>Description (optional)</h3>
          <textarea
            v-model="description"
            class="textarea-field"
            rows="4"
            placeholder="Describe your trip..."
          ></textarea>
        </div>

        <div class="form-section">
          <label class="checkbox-option">
            <input
              v-model="isPublic"
              type="checkbox"
              class="checkbox-input"
            />
            <div class="checkbox-content">
              <div class="checkbox-label">Public trip</div>
              <p class="checkbox-description">Anyone on wocon can see this trip</p>
            </div>
          </label>
        </div>

        <div class="form-section">
          <h3>Invite Participants</h3>
          <div class="invite-input-group">
            <input
              v-model="inviteInput"
              type="email"
              class="input-field"
              placeholder="Enter email address..."
              @keyup.enter="handleAddInvite"
            />
            <button type="button" class="btn btn-add" @click="handleAddInvite">Add</button>
          </div>
          <div v-if="invitedUsers.length > 0" class="invited-list">
            <div v-for="user in invitedUsers" :key="user" class="invited-item">
              <span class="invited-email">{{ user }}</span>
              <button type="button" class="btn-remove" @click="handleRemoveInvite(user)">×</button>
            </div>
          </div>
          <p class="hint">Invite people to join your trip by their email address</p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="handleCancel" :disabled="loading">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create trip' }}
          </button>
        </div>

        </form>

        <div class="preview-panel">
          <div class="preview-card">
            <div class="preview-header">
              <h3>Preview</h3>
              <p class="preview-subtitle">Explore public trips on the map</p>
            </div>
            <div class="preview-map">
              <WoconMap
                mode="trip"
                :readonly="false"
                :markers="createdMarkers"
                @marker-add="handleMarkerAdd"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
  </div>

  <Sidebar :showSidebar="showSidebar" @update:showSidebar="showSidebar = $event" />
</template>

<style scoped>
.create-trip-container {
  min-height: 100vh;
  background: var(--md3-background-light);
  padding: var(--md3-space-5);
  position: relative;
  font-family: var(--md3-font-family);
}

.sidebar-trigger {
  position: absolute;
  bottom: var(--md3-space-6);
  left: var(--md3-space-5);
  width: 48px;
  height: 48px;
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
  transition: all var(--md3-transition-medium);
}

.sidebar-trigger:hover {
  background: var(--md3-primary);
  transform: translateY(-2px);
  box-shadow: var(--md3-elevation-2);
}

.sidebar-trigger::before {
  content: '';
  display: block;
  width: 20px;
  height: 2px;
  background: var(--md3-primary);
  box-shadow:
    0 -6px 0 var(--md3-primary),
    0 6px 0 var(--md3-primary);
  transition: all var(--md3-transition-medium);
}

.sidebar-trigger:hover::before {
  background: var(--md3-on-primary);
  box-shadow:
    0 -6px 0 var(--md3-on-primary),
    0 6px 0 var(--md3-on-primary);
}

.top-logo {
  position: absolute;
  top: var(--md3-space-5);
  left: var(--md3-space-5);
  z-index: 10;
}

.top-logo a {
  display: block;
}

.page-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  transition: transform var(--md3-transition-medium);
}

.page-logo:hover {
  transform: scale(1.05);
}

.create-trip-card {
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--md3-space-6);
  box-shadow: var(--md3-elevation-1);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--md3-space-6);
}

.form-panel {
  display: block;
}

.preview-panel {
  display: block;
}

.preview-card {
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  height: 100%;
  overflow: hidden;
  box-shadow: var(--md3-elevation-1);
}

.preview-header {
  padding: var(--md3-space-4);
  border-bottom: 2px solid var(--md3-primary);
  background: var(--md3-primary-container);
}

.preview-header h3 {
  color: var(--md3-primary);
  font-size: var(--md3-title-small);
  font-weight: 700;
  margin: 0 0 var(--md3-space-2) 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-subtitle {
  color: var(--md3-on-surface-variant);
  font-size: var(--md3-body-small);
  margin: 0;
}

.preview-map {
  height: 480px;
}

.header {
  margin-bottom: var(--md3-space-6);
  border-bottom: 2px solid var(--md3-primary);
  padding-bottom: var(--md3-space-5);
}

.header h1 {
  color: var(--md3-primary);
  font-size: var(--md3-headline-medium);
  font-weight: 700;
  margin: 0 0 var(--md3-space-3) 0;
  text-transform: uppercase;
  letter-spacing: -0.01em;
}

.subtitle {
  color: var(--md3-on-surface-variant);
  font-size: var(--md3-body-medium);
  margin: 0;
}

.form-section {
  margin-bottom: var(--md3-space-6);
}

.form-section h3 {
  color: var(--md3-on-surface);
  font-size: var(--md3-label-large);
  font-weight: 700;
  margin: 0 0 var(--md3-space-3) 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-field,
.textarea-field {
  width: 100%;
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  color: var(--md3-on-surface);
  font-size: var(--md3-body-medium);
  padding: var(--md3-space-3) var(--md3-space-4);
  transition: all var(--md3-transition-medium);
  font-family: var(--md3-font-family);
}

.input-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: var(--md3-primary-light);
  box-shadow: 0 0 0 3px rgba(0, 180, 171, 0.2);
  transform: translateY(-1px);
}

.input-field::placeholder,
.textarea-field::placeholder {
  color: var(--md3-on-surface-variant);
}

.textarea-field {
  resize: vertical;
  min-height: 120px;
}

.trip-type-selector {
  display: flex;
  flex-direction: column;
  gap: var(--md3-space-4);
}

.radio-option {
  display: block;
  cursor: pointer;
}

.radio-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-content {
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  padding: var(--md3-space-4);
  transition: all var(--md3-transition-medium);
}

.radio-input:checked + .radio-content {
  background: var(--md3-primary-container);
  border-color: var(--md3-primary-light);
  transform: translateY(-2px);
  box-shadow: var(--md3-elevation-2);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: var(--md3-space-3);
  color: var(--md3-on-surface);
  font-size: var(--md3-body-large);
  font-weight: 600;
  margin-bottom: var(--md3-space-2);
}

.radio-icon {
  font-size: 24px;
}

.radio-description {
  color: var(--md3-on-surface-variant);
  font-size: var(--md3-body-small);
  margin: 0;
}

.participants-control {
  display: flex;
  align-items: center;
  gap: var(--md3-space-3);
  width: fit-content;
}

.control-btn {
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  color: var(--md3-primary);
  font-size: var(--md3-title-medium);
  font-weight: 700;
  width: 44px;
  height: 44px;
  cursor: pointer;
  transition: all var(--md3-transition-medium);
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  transform: scale(1.05);
  box-shadow: var(--md3-elevation-2);
}

.number-input {
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  color: var(--md3-on-surface);
  font-size: var(--md3-body-medium);
  font-weight: 600;
  text-align: center;
  width: 100px;
  padding: var(--md3-space-3);
  transition: all var(--md3-transition-medium);
}

.number-input:focus {
  outline: none;
  border-color: var(--md3-primary-light);
  box-shadow: 0 0 0 3px rgba(0, 180, 171, 0.2);
  transform: translateY(-1px);
}

.hint {
  color: var(--md3-on-surface-variant);
  font-size: var(--md3-label-small);
  margin: var(--md3-space-2) 0 0 0;
  font-weight: 500;
}

.invite-input-group {
  display: flex;
  gap: var(--md3-space-3);
}

.invite-input-group .input-field {
  flex: 1;
}

.btn {
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  font-size: var(--md3-label-medium);
  font-weight: 700;
  padding: var(--md3-space-3) var(--md3-space-4);
  cursor: pointer;
  transition: all var(--md3-transition-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-add {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  min-width: 80px;
}

.btn-add:hover {
  background: var(--md3-primary-light);
  transform: translateY(-2px);
  box-shadow: var(--md3-elevation-2);
}

.invited-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--md3-space-3);
  margin-top: var(--md3-space-4);
}

.invited-item {
  display: flex;
  align-items: center;
  gap: var(--md3-space-2);
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  padding: var(--md3-space-2) var(--md3-space-3);
  transition: all var(--md3-transition-medium);
}

.invited-item:hover {
  background: var(--md3-primary-container);
  transform: translateY(-2px);
  box-shadow: var(--md3-elevation-1);
}

.invited-email {
  color: var(--md3-on-surface);
  font-size: var(--md3-body-small);
  font-weight: 500;
}

.btn-remove {
  background: none;
  border: none;
  color: var(--md3-primary);
  font-size: 20px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  transition: all var(--md3-transition-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.btn-remove:hover {
  background: var(--md3-error);
  color: var(--md3-on-error);
  transform: scale(1.1);
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: var(--md3-space-3);
  cursor: pointer;
  padding: var(--md3-space-3);
  border-radius: var(--md3-radius-small);
  transition: all var(--md3-transition-medium);
}

.checkbox-option:hover {
  background: var(--md3-surface-variant);
}

.checkbox-input {
  margin-top: 2px;
  width: 20px;
  height: 20px;
  accent-color: var(--md3-primary);
}

.checkbox-label {
  color: var(--md3-on-surface);
  font-size: var(--md3-body-large);
  font-weight: 600;
  margin-bottom: var(--md3-space-2);
}

.checkbox-description {
  color: var(--md3-on-surface-variant);
  font-size: var(--md3-body-small);
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--md3-space-4);
  margin-top: var(--md3-space-8);
  padding-top: var(--md3-space-6);
  border-top: 2px solid var(--md3-primary);
}

.btn-secondary {
  background: var(--md3-surface);
  color: var(--md3-primary);
}

.btn-secondary:hover {
  background: var(--md3-surface-variant);
  transform: translateY(-2px);
  box-shadow: var(--md3-elevation-2);
}

.btn-primary {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
}

.btn-primary:hover {
  background: var(--md3-primary-light);
  transform: translateY(-2px);
  box-shadow: var(--md3-elevation-3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.toast {
  position: fixed;
  bottom: var(--md3-space-6);
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--md3-primary);
  border: 2px solid var(--md3-primary-light);
  padding: var(--md3-space-4) var(--md3-space-5);
  border-radius: var(--md3-radius-small);
  box-shadow: var(--md3-elevation-3);
  color: var(--md3-on-primary);
  font-size: var(--md3-body-medium);
  font-weight: 600;
  opacity: 0;
  pointer-events: none;
  transition: all var(--md3-transition-medium);
  max-width: 400px;
  text-align: center;
  z-index: 9999;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Dark Theme */
.dark {
  .create-trip-container {
    background: var(--md3-background);
  }

  .create-trip-card {
    background: var(--md3-surface);
    border-color: var(--md3-primary);
  }

  .preview-card {
    background: var(--md3-surface);
    border-color: var(--md3-primary);
  }

  .input-field,
  .textarea-field,
  .number-input {
    background: var(--md3-surface);
    color: var(--md3-on-surface);
    border-color: var(--md3-primary);
  }

  .radio-content {
    background: var(--md3-surface);
    border-color: var(--md3-primary);
  }

  .radio-input:checked + .radio-content {
    background: rgba(0, 180, 171, 0.1);
  }

  .control-btn {
    background: var(--md3-surface);
    border-color: var(--md3-primary);
    color: var(--md3-primary);
  }

  .control-btn:hover {
    background: var(--md3-primary);
    color: var(--md3-on-primary);
  }

  .invited-item {
    background: var(--md3-surface);
    border-color: var(--md3-primary);
  }

  .invited-item:hover {
    background: rgba(0, 180, 171, 0.1);
  }

  .checkbox-option:hover {
    background: var(--md3-surface-variant);
  }

  .btn-secondary {
    background: var(--md3-surface);
    color: var(--md3-primary);
  }

  .btn-secondary:hover {
    background: var(--md3-surface-variant);
  }

  .toast {
    background: var(--md3-primary);
    color: var(--md3-on-primary);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .create-trip-container {
    padding: var(--md3-space-4);
  }

  .create-trip-card {
    padding: var(--md3-space-5);
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: var(--md3-space-5);
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: var(--md3-space-3);
  }

  .btn {
    width: 100%;
  }

  .participants-control {
    width: 100%;
    justify-content: center;
  }

  .invite-input-group {
    flex-direction: column;
  }

  .btn-add {
    width: 100%;
  }

  .preview-map {
    height: 350px;
  }
}
</style>
