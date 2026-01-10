<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/common/Sidebar.vue'

const profile = ref({ username: '', score: 0, avatar_url: '' })
const showSidebar = ref(false)

// 获取当前登录用户的 profile
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (error) {
      console.error('Error fetching profile:', error)
    } else {
      profile.value = data
    }
  }
})
</script>

<template>
  <div class="profile-container">
    <div class="sidebar-trigger" @click="showSidebar = true"></div>
    <div class="top-logo">
      <router-link to="/">
        <img src="/woconlogo.png" alt="wocon logo" class="page-logo" />
      </router-link>
    </div>
    <div class="profile-header">
      <img v-if="profile.avatar_url" :src="profile.avatar_url" alt="Avatar" class="avatar" />
      <div v-else class="avatar-placeholder">
        {{ profile.username?.charAt(0).toUpperCase() || '?' }}
      </div>
      <h2 class="username">{{ profile.username || 'Guest' }}</h2>
      <p class="score">Score: {{ profile.score || 0 }}</p>
    </div>

    <div class="profile-content">
      <h3>Your Profile</h3>
      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-label">Username</span>
          <span class="stat-value">{{ profile.username || '-' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Score</span>
          <span class="stat-value">{{ profile.score || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Avatar</span>
          <span class="stat-value">
            {{ profile.avatar_url ? 'Uploaded' : 'Not set' }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <Sidebar v-model="showSidebar" />
</template>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
}

.sidebar-trigger {
  position: absolute;
  bottom: 40px;
  left: 20px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.5);
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
  background: white;
  box-shadow:
    0 -6px 0 white,
    0 6px 0 white;
}

.top-logo {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
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

.profile-header {
  text-align: center;
  margin-bottom: 32px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  margin-bottom: 16px;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 48px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.username {
  color: white;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.score {
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  margin: 0;
}

.profile-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 255, 0.95) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.profile-content h3 {
  color: #333;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
}

.profile-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
}

.stat-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.stat-value {
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .profile-content {
    padding: 24px;
  }

  .username {
    font-size: 24px;
  }
}
</style>
