<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/common/Sidebar.vue'
import WoconMap from '@/components/WoconMap.vue'

const router = useRouter()
const activeSection = ref(0)
const showSidebar = ref(false)
const showCreateMenu = ref(false)
const searchQuery = ref('')
const createMenuPosition = ref({ top: '0px', left: '0px' })

// Connections data
const friends = ref<any[]>([])
const friendRequests = ref<any[]>([])
const searchResults = ref<any[]>([])
const loading = ref(false)
const currentUser = ref<any>(null)
const connectionsSearchQuery = ref('')
const connectionsSearchResults = ref<any[]>([])
const sentRequests = ref<Set<string>>(new Set())

const toggleCreateMenu = () => {
  showCreateMenu.value = !showCreateMenu.value
  if (showCreateMenu.value) {
    const button = document.querySelector('.create-button')
    if (button) {
      const rect = button.getBoundingClientRect()
      createMenuPosition.value = {
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`
      }
    }
  }
}

const handleCreateTrip = () => {
  showCreateMenu.value = false
  router.push('/create-trip')
}

const goToSettings = () => {
  console.log('Settings button clicked')
  router.push('/settings')
}

const goToProfile = () => {
  console.log('Profile button clicked')
  router.push('/profile')
}

const handleMarkerClick = (tripId: string) => {
  console.log('Marker clicked, trip ID:', tripId)
  router.push(`/trip/${tripId}`)
}

const handleMenuClickOutside = () => {
  showCreateMenu.value = false
}

const sliderStyle = computed(() => ({
  transform: `translateX(${activeSection.value * 100}%)`,
}))

const sections = [
  { name: 'Search', placeholder: 'Search destinations or trip ID', activity: 'No activities currently' },
  { name: 'Connections', placeholder: 'View friends', activity: null },
  { name: 'Discover', placeholder: 'Discover page' },
  { name: 'Home', placeholder: 'Home page' }
]

const getIconSvg = (index: number) => {
  const icons = [
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="#8b949e" stroke-width="2"/>
      <path d="M16 16L21 21" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" stroke="#8b949e" stroke-width="2"/>
      <path d="M6 21V19C6 15.6863 8.68629 13 12 13C15.3137 13 18 15.6863 18 19V21" stroke="#8b949e" stroke-width="2"/>
      <path d="M18 7C18 9.20914 19.7909 11 22 11" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#8b949e" stroke-width="2"/>
      <path d="M12 2V6" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 18V22" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
      <path d="M2 12H6" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 12H22" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="3" fill="#8b949e"/>
    </svg>`,
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12L12 3L21 12" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 12V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V12" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  ]
  return icons[index]
}

// Load connections data
const loadConnections = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load friends (accepted)
    const { data: friendsData } = await supabase
      .from('friends')
      .select(`
        id,
        status,
        friend_id!inner(id, username, nickname, avatar_url, bio)
      `)
      .or(`and(user_id.eq.${user.id},status.eq.accepted),and(friend_id.eq.${user.id},status.eq.accepted)`)

    // Load friend requests (pending received)
    const { data: requestsData } = await supabase
      .from('friends')
      .select(`
        id,
        status,
        user_id!inner(id, username, nickname, avatar_url, bio)
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending')

    friends.value = friendsData?.map((f: any) => ({
      id: f.friend_id.id,
      username: f.friend_id.username,
      nickname: f.friend_id.nickname,
      avatar_url: f.friend_id.avatar_url,
      bio: f.friend_id.bio
    })) || []

    friendRequests.value = requestsData?.map((f: any) => ({
      id: f.user_id.id,
      username: f.user_id.username,
      nickname: f.user_id.nickname,
      avatar_url: f.user_id.avatar_url,
      bio: f.user_id.bio,
      friendship_id: f.id
    })) || []
  } catch (error) {
    console.error('Error loading connections:', error)
  } finally {
    loading.value = false
  }
}

// Search users
const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('id, username, nickname, avatar_url, bio')
      .ilike('username', `%${searchQuery.value}%`)
      .neq('id', user.id)
      .limit(10)

    searchResults.value = data || []
  } catch (error) {
    console.error('Error searching users:', error)
  } finally {
    loading.value = false
  }
}

// Send friend request
const sendFriendRequest = async (friendId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      })

    if (!error) {
      sentRequests.value.add(friendId)
      connectionsSearchResults.value = connectionsSearchResults.value.filter(u => u.id !== friendId)
      searchResults.value = searchResults.value.filter(u => u.id !== friendId)
    }
  } catch (error) {
    console.error('Error sending friend request:', error)
  }
}

// Check if request is already sent
const isRequestSent = (userId: string) => {
  return sentRequests.value.has(userId)
}

// Search users in Connections tab
const searchConnectionsUsers = async () => {
  if (!connectionsSearchQuery.value.trim()) {
    connectionsSearchResults.value = []
    return
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('id, username, nickname, avatar_url, bio')
      .or(`username.ilike.%${connectionsSearchQuery.value}%,nickname.ilike.%${connectionsSearchQuery.value}%`)
      .neq('id', user.id)
      .limit(10)

    connectionsSearchResults.value = data || []
  } catch (error) {
    console.error('Error searching users:', error)
  }
}

// Accept friend request
const acceptFriendRequest = async (requestId: string) => {
  try {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    if (!error) {
      friendRequests.value = friendRequests.value.filter(r => r.friendship_id !== requestId)
      await loadConnections()
    }
  } catch (error) {
    console.error('Error accepting friend request:', error)
  }
}

// Reject friend request
const rejectFriendRequest = async (requestId: string) => {
  try {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', requestId)

    if (!error) {
      friendRequests.value = friendRequests.value.filter(r => r.friendship_id !== requestId)
    }
  } catch (error) {
    console.error('Error rejecting friend request:', error)
  }
}

// Watch search query
import { watch } from 'vue'
let searchTimeout: number | null = null
let connectionsSearchTimeout: number | null = null
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    searchUsers()
  }, 500)
})

watch(connectionsSearchQuery, (newVal) => {
  if (connectionsSearchTimeout) clearTimeout(connectionsSearchTimeout)
  connectionsSearchTimeout = window.setTimeout(() => {
    searchConnectionsUsers()
  }, 500)
})

// Load data on mount
onMounted(() => {
  loadConnections()
})
</script>

<template>
  <div class="homepage-container" @click="handleMenuClickOutside">
    <div class="top-logo">
      <img src="/woconlogo.png" alt="wocon logo" class="page-logo" />
    </div>

    <div class="home-layout" @click.stop>
      <div class="home-left">
        <WoconMap mode="global" @marker-click="handleMarkerClick" />
        <div class="sidebar-trigger" @click="showSidebar = true"></div>
      </div>

      <div class="home-right">
        <!-- Top bar with circular buttons -->
        <div class="top-bar">
          <div class="top-bar-left">
            <div class="create-menu-wrapper">
              <div class="create-button" @click="toggleCreateMenu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <Teleport to="body">
                <div v-if="showCreateMenu" class="create-menu-overlay" @click="handleMenuClickOutside">
                  <div class="create-menu" @click.stop>
                    <div class="menu-item" @click="handleCreateTrip">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>Create Trip</span>
                    </div>
                    <div class="menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#8b949e" stroke-width="2"/>
                        <path d="M12 6V12L16 14" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      <span>Create Event</span>
                    </div>
                    <div class="menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.7893 3 19.5304 3 19V15" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17 8L12 3L7 8" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 3V15" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>Upload Content</span>
                    </div>
                  </div>
                </div>
              </Teleport>
            </div>
          </div>
          <div class="top-bar-right">
            <div class="circular-button settings-button" @click="goToSettings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1 1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
              </svg>
            </div>
            <div class="circular-button profile-button" @click="goToProfile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Content sections -->
        <div class="content-container">
          <div class="content-slider" :style="sliderStyle">
            <div v-for="(section, index) in sections" :key="index" class="content-section">
              <!-- Search Tab -->
              <div v-if="index === 0" class="search-section">
                <div class="search-input-wrapper">
                  <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="7" stroke="#8b949e" stroke-width="2"/>
                    <path d="M16 16L21 21" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <input v-model="searchQuery" type="text" class="search-input" :placeholder="section.placeholder" />
                </div>
                <div v-if="searchQuery === ''" class="activity-placeholder">{{ section.activity }}</div>
                <div v-else-if="loading" class="loading">Loading...</div>
                <div v-else-if="searchResults.length > 0" class="search-results">
                  <div v-for="user in searchResults" :key="user.id" class="search-result-item" @click="router.push(`/profile/${user.username}`)">
                    <img :src="user.avatar_url || '/default-avatar.png'" class="result-avatar" />
                    <div class="result-info">
                      <div class="result-name">{{ user.nickname || user.username }}</div>
                      <div class="result-username">@{{ user.username }}</div>
                    </div>
                    <button class="add-friend-btn" @click.stop="sendFriendRequest(user.id)">Add</button>
                  </div>
                </div>
                <div v-else class="no-results">No users found</div>
              </div>

              <!-- Connections Tab -->
              <div v-else-if="index === 1" class="connections-section">
                <div class="connections-content">
                  <!-- Search Users -->
                  <div class="search-users-section">
                    <div class="search-users-input-wrapper">
                      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="7" stroke="#8b949e" stroke-width="2"/>
                        <path d="M16 16L21 21" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      <input v-model="connectionsSearchQuery" type="text" class="search-users-input" placeholder="Search users to add friends..." />
                    </div>
                    <div v-if="connectionsSearchResults.length > 0" class="search-users-results">
                      <div v-for="user in connectionsSearchResults" :key="user.id" class="search-users-result-item">
                        <img :src="user.avatar_url || '/default-avatar.png'" class="search-result-avatar" />
                        <div class="search-result-info" @click="router.push(`/profile/${user.username}`)">
                          <div class="search-result-name">{{ user.nickname || user.username }}</div>
                          <div class="search-result-username">@{{ user.username }}</div>
                        </div>
                        <button class="add-friend-btn-small" @click="sendFriendRequest(user.id)" :disabled="isRequestSent(user.id)">
                          {{ isRequestSent(user.id) ? 'Sent' : 'Add' }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Friend Requests -->
                  <div v-if="friendRequests.length > 0" class="requests-section">
                    <div class="section-title">Friend Requests ({{ friendRequests.length }})</div>
                    <div v-for="user in friendRequests" :key="user.id" class="request-item">
                      <img :src="user.avatar_url || '/default-avatar.png'" class="request-avatar" />
                      <div class="request-info">
                        <div class="request-name">{{ user.nickname || user.username }}</div>
                        <div class="request-username">@{{ user.username }}</div>
                      </div>
                      <div class="request-actions">
                        <button class="accept-btn" @click="acceptFriendRequest(user.friendship_id)">✓</button>
                        <button class="reject-btn" @click="rejectFriendRequest(user.friendship_id)">✕</button>
                      </div>
                    </div>
                  </div>

                  <!-- Friends List -->
                  <div class="friends-section">
                    <div class="section-title">Friends ({{ friends.length }})</div>
                    <div v-if="loading" class="loading">Loading...</div>
                    <div v-else-if="friends.length === 0" class="empty-state">
                      <div class="empty-icon">👥</div>
                      <div class="empty-text">No friends yet</div>
                      <div class="empty-hint">Search for users to add friends</div>
                    </div>
                    <div v-else class="friends-list">
                      <div v-for="user in friends" :key="user.id" class="friend-item" @click="router.push(`/profile/${user.username}`)">
                        <img :src="user.avatar_url || '/default-avatar.png'" class="friend-avatar" />
                        <div class="friend-info">
                          <div class="friend-name">{{ user.nickname || user.username }}</div>
                          <div class="friend-username">@{{ user.username }}</div>
                          <div v-if="user.bio" class="friend-bio">{{ user.bio }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Discover Tab -->
              <div v-else-if="index === 2" class="content-placeholder">
                <div class="placeholder-icon">🌍</div>
                <div>Discover Coming Soon</div>
              </div>

              <!-- Home Tab -->
              <div v-else-if="index === 3" class="content-placeholder">
                <div class="placeholder-icon">🏠</div>
                <div>My Trips Coming Soon</div>
              </div>
            </div>
          </div>
        </div>

        <div class="bottom-bar">
          <div class="bar-slider" :style="sliderStyle"></div>
          <div
            v-for="(section, index) in sections"
            :key="index"
            class="bar-section"
            :class="{ active: activeSection === index }"
            @click="activeSection = index"
          >
            <div class="icon-wrapper" v-html="getIconSvg(index)"></div>
          </div>
        </div>
      </div>
    </div>

    <Sidebar :showSidebar="showSidebar" @update:showSidebar="showSidebar = $event" />
  </div>
</template>

<style scoped>
.homepage-container {
  min-height: 100vh;
  background: #0d1117;
  position: relative;
}

.top-logo {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 1000;
}

.page-logo {
  width: 40px;
  height: 40px;
}

.home-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.home-left {
  background: #161b22;
  position: relative;
  overflow: hidden;
}

.home-right {
  background: #0d1117;
  padding: 80px 60px;
  position: relative;
}

.top-bar {
  position: absolute;
  top: 24px;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.top-bar-left {
  display: flex;
  gap: 12px;
}

.top-bar-right {
  display: flex;
  gap: 12px;
}

.circular-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(22, 27, 34, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(48, 54, 61, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b949e;
  transition: all 0.2s ease;
}

.circular-button:hover {
  background: rgba(33, 38, 45, 0.9);
  color: #c9d1d9;
  transform: scale(1.05);
}

.circular-button:active {
  transform: scale(0.95);
}

.circular-button svg {
  flex-shrink: 0;
}

.create-button {
  width: 40px;
  height: 40px;
  background: #238636;
  border: 1px solid #2ea043;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.create-menu-wrapper {
  position: relative;
}

.create-button:hover {
  background: #2ea043;
}

.create-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  animation: fadeIn 0.15s ease;
}

.create-menu {
  position: fixed;
  top: v-bind('createMenuPosition.top');
  left: v-bind('createMenuPosition.left');
  background: rgba(33, 38, 45, 0.98);
  backdrop-filter: blur(8px);
  border: 1px solid #30363d;
  border-radius: 8px;
  min-width: 180px;
  overflow: hidden;
  animation: fadeIn 0.15s ease;
  z-index: 102;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
  color: #c9d1d9;
  font-size: 14px;
}

.menu-item:hover {
  background: #21262d;
}

.menu-item span {
  flex: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-container {
  width: 100%;
  height: calc(100% - 180px);
  overflow: hidden;
  position: relative;
}

.content-slider {
  display: flex;
  width: 400%;
  height: 100%;
  transition: transform 0.3s ease;
}

.content-section {
  width: 25%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-placeholder {
  color: #8b949e;
  font-size: 48px;
  text-align: center;
}

.search-section {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 60px;
  gap: 20px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 400px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 12px 16px;
  transition: border-color 0.2s ease;
}

.search-input-wrapper:focus-within {
  border-color: #5865F2;
}

.search-icon {
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #c9d1d9;
  font-size: 16px;
}

.search-input::placeholder {
  color: #8b949e;
}

.activity-placeholder {
  color: #8b949e;
  font-size: 24px;
  text-align: center;
  margin-top: 20px;
}

/* Search Results */
.search-results {
  width: 100%;
  max-width: 500px;
  max-height: calc(100% - 100px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 20px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  background: #30363d;
  border-color: #8b949e;
}

.result-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 500;
}

.result-username {
  color: #8b949e;
  font-size: 12px;
}

.add-friend-btn {
  padding: 6px 12px;
  background: #238636;
  border: 1px solid #2ea043;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.add-friend-btn:hover {
  background: #2ea043;
}

.no-results {
  color: #8b949e;
  font-size: 16px;
  text-align: center;
}

/* Connections Section */
.connections-section {
  width: 100%;
  height: 100%;
  padding: 20px 40px;
  overflow-y: auto;
}

.connections-content {
  max-width: 600px;
  margin: 0 auto;
}

/* Search Users Section */
.search-users-section {
  margin-bottom: 32px;
}

.search-users-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 12px 16px;
  transition: border-color 0.2s ease;
}

.search-users-input-wrapper:focus-within {
  border-color: #5865F2;
}

.search-users-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #c9d1d9;
  font-size: 14px;
}

.search-users-input::placeholder {
  color: #8b949e;
}

.search-users-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.search-users-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.search-users-result-item:hover {
  background: #30363d;
  border-color: #8b949e;
}

.search-result-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.search-result-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.search-result-name {
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 500;
}

.search-result-username {
  color: #8b949e;
  font-size: 12px;
}

.add-friend-btn-small {
  padding: 6px 12px;
  background: #238636;
  border: 1px solid #2ea043;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;
}

.add-friend-btn-small:hover:not(:disabled) {
  background: #2ea043;
}

.add-friend-btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.section-title {
  color: #c9d1d9;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.requests-section {
  margin-bottom: 32px;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  margin-bottom: 8px;
}

.request-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.request-info {
  flex: 1;
  min-width: 0;
}

.request-name {
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 500;
}

.request-username {
  color: #8b949e;
  font-size: 12px;
}

.request-actions {
  display: flex;
  gap: 8px;
}

.accept-btn,
.reject-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

.accept-btn {
  background: #238636;
  color: white;
}

.accept-btn:hover {
  background: #2ea043;
}

.reject-btn {
  background: #da3633;
  color: white;
}

.reject-btn:hover {
  background: #f85149;
}

/* Friends List */
.friends-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.friend-item:hover {
  background: #30363d;
  border-color: #8b949e;
}

.friend-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 500;
}

.friend-username {
  color: #8b949e;
  font-size: 12px;
}

.friend-bio {
  color: #6e7681;
  font-size: 12px;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  color: #c9d1d9;
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-hint {
  color: #8b949e;
  font-size: 14px;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.loading {
  color: #8b949e;
  font-size: 16px;
  text-align: center;
  padding: 40px;
}

.bottom-bar {
  position: absolute;
  bottom: 40px;
  left: 60px;
  right: 60px;
  height: 60px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 30px;
  display: flex;
}

.bar-slider {
  position: absolute;
  width: 25%;
  height: 100%;
  background: #30363d;
  transition: transform 0.3s ease;
  border-radius: 30px;
}

.bar-section {
  flex: 1;
  height: 100%;
  cursor: pointer;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-section:first-child {
  border-top-left-radius: 30px;
  border-bottom-left-radius: 30px;
}

.bar-section:last-child {
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
}

.bar-section.active {
  color: #ffffff;
}

.icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-section.active svg {
  stroke: #ffffff;
}

.sidebar-trigger {
  position: absolute;
  bottom: 40px;
  left: 60px;
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
</style>
