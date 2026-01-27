<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/common/Sidebar.vue'

const router = useRouter()
const showSidebar = ref(false)
const tripType = ref<'private' | 'recruiting'>('private')
const maxParticipants = ref(2)
const tripName = ref('')
const description = ref('')
const isPublic = ref(false)
const invitedUsers = ref<string[]>([])
const inviteInput = ref('')
const loading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const userId = ref<string | null>(null)

const toast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}

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
  const email = inviteInput.value.trim()
  if (email && !invitedUsers.value.includes(email)) {
    invitedUsers.value.push(email)
    inviteInput.value = ''
  }
}

const handleRemoveInvite = (email: string) => {
  const index = invitedUsers.value.indexOf(email)
  if (index > -1) {
    invitedUsers.value.splice(index, 1)
  }
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

    // Handle invited users
    if (invitedUsers.value.length > 0) {
      for (const email of invitedUsers.value) {
        // Get user profile by email
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single()

        if (profile) {
          // Add to trip participants
          await supabase
            .from('trip_participants')
            .insert({
              trip_id: trip.id,
              user_id: profile.id,
              status: 'pending'
            })
        }
      }
    }

    toast('Trip created successfully!')
    setTimeout(() => {
      router.push(`/trip/${trip.id}`)
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

      <form class="trip-form" @submit="handleSubmit">
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
    </div>

    <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
  </div>

  <Sidebar :showSidebar="showSidebar" @update:showSidebar="showSidebar = $event" />
</template>

<style scoped>
.create-trip-container {
  min-height: 100vh;
  background: #0d1117;
  padding: 20px;
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

.create-trip-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
}

.header {
  margin-bottom: 32px;
  border-bottom: 1px solid #30363d;
  padding-bottom: 24px;
}

.header h1 {
  color: #c9d1d9;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #8b949e;
  font-size: 14px;
  margin: 0;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.input-field,
.textarea-field {
  width: 100%;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  padding: 8px 12px;
  transition: border-color 0.15s ease;
}

.input-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: #58a6ff;
}

.textarea-field {
  font-family: inherit;
  resize: vertical;
}

.trip-type-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 16px;
  transition: border-color 0.15s ease;
}

.radio-input:checked + .radio-content {
  border-color: #58a6ff;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c9d1d9;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.radio-icon {
  font-size: 20px;
}

.radio-description {
  color: #8b949e;
  font-size: 13px;
  margin: 0;
}

.participants-control {
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
}

.control-btn {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 16px;
  font-weight: 600;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.control-btn:hover {
  background: #30363d;
  border-color: #8b949e;
}

.number-input {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  width: 80px;
  padding: 8px;
}

.number-input:focus {
  outline: none;
  border-color: #58a6ff;
}

.hint {
  color: #8b949e;
  font-size: 12px;
  margin: 8px 0 0 0;
}

.invite-input-group {
  display: flex;
  gap: 8px;
}

.invite-input-group .input-field {
  flex: 1;
}

.btn-add {
  background: #238636;
  border-color: rgba(240, 246, 252, 0.1);
  min-width: 60px;
}

.btn-add:hover {
  background: #2ea043;
}

.invited-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.invited-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 6px 12px;
}

.invited-email {
  color: #c9d1d9;
  font-size: 13px;
}

.btn-remove {
  background: none;
  border: none;
  color: #8b949e;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  transition: color 0.15s ease;
}

.btn-remove:hover {
  color: #f85149;
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.checkbox-input {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  accent-color: #58a6ff;
}

.checkbox-label {
  color: #c9d1d9;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.checkbox-description {
  color: #8b949e;
  font-size: 13px;
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #30363d;
}

.btn {
  border: 1px solid rgba(27, 31, 36, 0.15);
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.btn-secondary {
  background: #21262d;
  border-color: rgba(240, 246, 252, 0.1);
}

.btn-secondary:hover {
  background: #30363d;
}

.btn-primary {
  background: #238636;
  border-color: rgba(240, 246, 252, 0.1);
}

.btn-primary:hover {
  background: #2ea043;
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

@media (max-width: 640px) {
  .create-trip-card {
    padding: 20px 16px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
