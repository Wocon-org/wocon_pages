<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { getProfile, updateProfile, uploadAvatar } from '@/lib/api'
import type { Profile } from '@/types'
import Sidebar from '@/components/common/Sidebar.vue'

const showSidebar = ref(false)
const loading = ref(false)
const saving = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const profile = ref<Profile | null>(null)
const editingNickname = ref(false)
const nicknameInput = ref('')
const bioInput = ref('')
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string>('')
const searchUsername = ref('')
const searchingUser = ref(false)
const foundUser = ref<any>(null)

const toast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => showToast.value = false, 2200)
}

onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  loading.value = true
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data, error } = await getProfile(user.id)
    if (error) {
      console.error('Error fetching profile:', error)
      toast('Failed to load profile')
    } else {
      profile.value = data
      nicknameInput.value = data.nickname || ''
      bioInput.value = data.bio || ''
      avatarPreview.value = data.avatar_url || ''
    }
  }
  loading.value = false
}

const handleSearchUser = async () => {
  const username = searchUsername.value.trim()
  if (!username) {
    foundUser.value = null
    return
  }

  searchingUser.value = true
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, nickname, avatar_url')
    .eq('username', username)
    .single()

  if (error || !data) {
    foundUser.value = null
    toast('User not found')
  } else {
    foundUser.value = data
  }
  searchingUser.value = false
}

const handleAddFriend = async () => {
  if (!profile.value || !foundUser.value) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    toast('Please log in first')
    return
  }

  if (foundUser.value.id === user.id) {
    toast('You cannot add yourself as a friend')
    return
  }

  try {
    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${foundUser.value.id}),and(user_id.eq.${foundUser.value.id},friend_id.eq.${user.id})`)
      .single()

    if (existing) {
      toast('Friend request already sent or already friends')
      return
    }

    // Send friend request - ensure smaller ID is user_id to avoid duplicates
    const userIds = [user.id, foundUser.value.id].sort()
    const { error } = await supabase
      .from('friends')
      .insert({
        user_id: userIds[0],
        friend_id: userIds[1],
        status: 'pending'
      })

    if (error) throw error
    toast('Friend request sent!')
    foundUser.value = null
    searchUsername.value = ''
  } catch (error: any) {
    console.error('Error sending friend request:', error)
    toast('Failed to send friend request')
  }
}

const handleAvatarClick = () => {
  document.getElementById('avatar-input')?.click()
}

const handleAvatarChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file')
      return
    }
    // Validate file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      toast('Image size must be less than 1MB')
      return
    }
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

const uploadNewAvatar = async () => {
  if (!avatarFile.value || !profile.value) return

  saving.value = true
  const { data: uploadData, error: uploadError } = await uploadAvatar(profile.value.id, avatarFile.value)

  if (uploadError) {
    toast('Failed to upload avatar')
    saving.value = false
    return
  }

  const { error: updateError } = await updateAvatar(profile.value.id, uploadData.url)

  if (updateError) {
    toast('Failed to update profile')
  } else {
    toast('Avatar updated successfully! ✅')
    if (profile.value) {
      profile.value.avatar_url = uploadData.url
    }
  }

  avatarFile.value = null
  saving.value = false
}

const startEditingNickname = () => {
  editingNickname.value = true
}

const cancelEditingNickname = () => {
  editingNickname.value = false
  nicknameInput.value = profile.value?.nickname || ''
}

const saveNickname = async () => {
  if (!profile.value) return

  saving.value = true
  const { error } = await updateProfile(profile.value.id, { nickname: nicknameInput.value })

  if (error) {
    toast('Failed to update nickname')
  } else {
    toast('Nickname updated! ✅')
    if (profile.value) {
      profile.value.nickname = nicknameInput.value
    }
    editingNickname.value = false
  }
  saving.value = false
}

const saveBio = async () => {
  if (!profile.value) return

  saving.value = true
  const { error } = await updateProfile(profile.value.id, { bio: bioInput.value })

  if (error) {
    toast('Failed to update bio')
  } else {
    toast('Bio updated! ✅')
    if (profile.value) {
      profile.value.bio = bioInput.value
    }
  }
  saving.value = false
}

const updateAvatar = async (userId: string, avatarUrl: string) => {
  return updateProfile(userId, { avatar_url: avatarUrl })
}
</script>

<template>
  <div class="profile-container">
    <div class="sidebar-trigger" @click="showSidebar = true"></div>

    <div class="profile-section">
      <!-- Avatar Section -->
      <div class="avatar-section">
        <div class="avatar-wrapper" @click="handleAvatarClick">
          <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" class="avatar" />
          <div v-else class="avatar-placeholder">
            {{ profile?.username?.charAt(0).toUpperCase() || '?' }}
          </div>
          <div class="avatar-overlay">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
            </svg>
            <span>Change</span>
          </div>
        </div>
        <input
          id="avatar-input"
          type="file"
          accept="image/*"
          @change="handleAvatarChange"
          style="display: none"
        />
        <button
          v-if="avatarFile && avatarFile !== (profile?.avatar_url ? null : null)"
          class="save-avatar-btn"
          @click="uploadNewAvatar"
          :disabled="saving"
        >
          {{ saving ? 'Saving...' : 'Save Avatar' }}
        </button>
      </div>

      <!-- Username (Read-only) -->
      <div class="settings-section">
        <div class="section-header">Account</div>
        <div class="section-content">
          <div class="settings-item">
            <div class="item-info">
              <span class="item-label">Username</span>
              <span class="item-value">{{ profile?.username || '-' }}</span>
            </div>
          </div>
          <div class="settings-item">
            <div class="item-info">
              <span class="item-label">Email</span>
              <span class="item-value">{{ profile?.email || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Nickname (Editable) -->
      <div class="settings-section">
        <div class="section-header">Display Name</div>
        <div class="section-content">
          <div class="settings-item editable">
            <div class="item-info">
              <span class="item-label">Nickname</span>
              <input
                v-if="editingNickname"
                v-model="nicknameInput"
                class="inline-input"
                @blur="saveNickname"
                @keyup.enter="saveNickname"
                @keyup.esc="cancelEditingNickname"
              />
              <span v-else class="item-value" @click="startEditingNickname">
                {{ profile?.nickname || 'Not set' }}
              </span>
            </div>
            <div class="item-actions" v-if="editingNickname">
              <button class="action-btn cancel" @click="cancelEditingNickname">Cancel</button>
              <button class="action-btn save" @click="saveNickname" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
            <svg v-else class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Bio (Editable) -->
      <div class="settings-section">
        <div class="section-header">About</div>
        <div class="section-content">
          <div class="bio-section">
            <textarea
              v-model="bioInput"
              class="bio-input"
              placeholder="Tell others about yourself..."
              :disabled="saving"
              @blur="saveBio"
            ></textarea>
            <button
              v-if="bioInput !== (profile?.bio || '')"
              class="save-bio-btn"
              @click="saveBio"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save Bio' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add Friend -->
      <div class="settings-section">
        <div class="section-header">Friends</div>
        <div class="section-content">
          <div class="friend-search">
            <div class="search-wrapper">
              <input
                v-model="searchUsername"
                type="text"
                class="search-input"
                placeholder="Search by username..."
                @keyup.enter="handleSearchUser"
              />
              <button
                v-if="searchUsername"
                class="search-btn"
                @click="handleSearchUser"
                :disabled="searchingUser"
              >
                {{ searchingUser ? 'Searching...' : 'Search' }}
              </button>
            </div>
            <div v-if="foundUser" class="found-user">
              <div class="user-info">
                <div class="user-avatar">
                  <img v-if="foundUser.avatar_url" :src="foundUser.avatar_url" :alt="foundUser.username" />
                  <div v-else class="avatar-placeholder">{{ foundUser.username.charAt(0).toUpperCase() }}</div>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ foundUser.nickname || foundUser.username }}</div>
                  <div class="user-username">@{{ foundUser.username }}</div>
                </div>
              </div>
              <button class="add-friend-btn" @click="handleAddFriend">
                Add Friend
              </button>
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
.profile-container {
  min-height: 100vh;
  background: #000000;
  padding: 80px 60px;
  position: relative;
}

.sidebar-trigger {
  position: absolute;
  bottom: 40px;
  left: 60px;
  width: 48px;
  height: 48px;
  background: #1c1c1e;
  border: 1px solid #3a3a3c;
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
  background: #86868b;
  box-shadow:
    0 -6px 0 #86868b,
    0 6px 0 #86868b;
}

.profile-section {
  max-width: 480px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3a3a3c;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #0a84ff, #5e5ce6);
  color: #ffffff;
  font-size: 48px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #3a3a3c;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay svg {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.avatar-overlay span {
  font-size: 12px;
}

.save-avatar-btn {
  margin-top: 12px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #0a84ff;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.save-avatar-btn:hover:not(:disabled) {
  background: #0a7ae5;
}

.save-avatar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-section {
  margin-bottom: 32px;
}

.section-header {
  font-size: 13px;
  color: #86868b;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.section-content {
  background: #1c1c1e;
  border-radius: 12px;
  overflow: hidden;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  min-height: 52px;
  border-bottom: 0.5px solid #38383a;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item.editable {
  align-items: flex-start;
  padding-top: 18px;
  padding-bottom: 18px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-label {
  font-size: 17px;
  color: #ffffff;
  font-weight: 400;
}

.item-value {
  font-size: 15px;
  color: #86868b;
  cursor: pointer;
  padding: 4px 0;
}

.item-value:hover {
  color: #ffffff;
}

.inline-input {
  font-size: 15px;
  color: #ffffff;
  background: #2c2c2e;
  border: 1px solid #0a84ff;
  border-radius: 6px;
  padding: 6px 10px;
  outline: none;
}

.chevron {
  width: 12px;
  height: 12px;
  color: #86868b;
  flex-shrink: 0;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.cancel {
  background: #3a3a3c;
  color: #ffffff;
}

.action-btn.cancel:hover {
  background: #48484a;
}

.action-btn.save {
  background: #0a84ff;
  color: white;
}

.action-btn.save:hover:not(:disabled) {
  background: #0a7ae5;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bio-section {
  padding: 20px;
}

.bio-input {
  width: 100%;
  min-height: 120px;
  background: #2c2c2e;
  border: 1px solid #38383a;
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 16px;
  resize: vertical;
  outline: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  line-height: 1.5;
}

.bio-input::placeholder {
  color: #86868b;
}

.bio-input:focus {
  border-color: #0a84ff;
}

.save-bio-btn {
  margin-top: 12px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #0a84ff;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.save-bio-btn:hover:not(:disabled) {
  background: #0a7ae5;
}

.save-bio-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #1c1c1e;
  border: 1px solid #3a3a3c;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  color: #ffffff;
  font-size: 14px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease, transform 0.22s ease;
  max-width: 400px;
  text-align: center;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.friend-search {
  padding: 20px;
}

.search-wrapper {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  background: #2c2c2e;
  border: 1px solid #38383a;
  border-radius: 8px;
  padding: 10px 14px;
  color: #ffffff;
  font-size: 15px;
  outline: none;
}

.search-input::placeholder {
  color: #86868b;
}

.search-input:focus {
  border-color: #0a84ff;
}

.search-btn {
  padding: 10px 16px;
  background: #0a84ff;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  background: #0a7ae5;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.found-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #2c2c2e;
  border-radius: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar .avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a84ff, #5e5ce6);
  color: white;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
}

.user-username {
  color: #86868b;
  font-size: 13px;
}

.add-friend-btn {
  padding: 8px 14px;
  background: #0a84ff;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.add-friend-btn:hover {
  background: #0a7ae5;
}
</style>
