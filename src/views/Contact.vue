<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import GraffitiWall from '@/components/GraffitiWall.vue'

const theme = ref<'dark' | 'light'>('dark')
const showToast = ref(false)
const toastMessage = ref('')

const toast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => showToast.value = false, 2200)
}

onMounted(() => {
  const saved = localStorage.getItem('wocon_theme') as 'dark' | 'light' | null
  if (saved) theme.value = saved
})

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('wocon_theme', theme.value)
}
</script>

<template>
  <div :data-theme="theme" class="contact-container">
    <GraffitiWall />
    <div class="contact-card">
      <div class="card-header">
        <div class="brand">
          <img src="/woconlogo.png" alt="wocon" class="brand-logo" />
          <h1>wocon</h1>
        </div>
        <div class="theme-toggle" @click="toggleTheme">
          <svg v-if="theme === 'dark'" class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="5" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42-1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42 1.42" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0-3.22-3.03-3.6-5.3l2.4-1.4a8.25 8.25 0 0 1-6.23 6.6v.85a8.25 8.25 0 0 1 6.23-6.6V16.7a8.25 8.25 0 0 1-3.03-1.55-3.6-5.3l-2.4 1.4a8.25 8.25 0 0 0-3.12-6.1-5.3-9.4Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <div class="card-body">
        <h2 class="title">Contact Us</h2>
        <p class="subtitle">We'd love to hear from you. Get in touch with us!</p>

        <div class="contact-options">
          <a href="mailto:zhaoceaser@gmail.com" class="contact-option">
            <div class="option-icon email-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div class="option-content">
              <h3>Email</h3>
              <p>zhaoceaser@gmail.com</p>
            </div>
          </a>

          <a href="https://github.com/Wocon-org" target="_blank" class="contact-option">
            <div class="option-icon github-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.1.8-.25.8-.56v-2.1c-3.26.71-3.95-1.4-3.95-1.4-.54-1.37-1.31-1.73-1.31-1.73-1.07-.73.08-.72.08-.72 1.18.08 1.81 1.22 1.81 1.22 1.06 1.8 2.78 1.28 3.46.98.11-.76.41-1.28.75-1.58-2.6-.3-5.34-1.3-5.34-5.8 0-1.28.46-2.33 1.22-3.15-.12-.3-.53-1.52.12-3.17 0 0 .99-.32 3.25 1.2a11.1 11.1 0 0 1 5.92 0c2.26-1.52 3.25-1.2 3.25-1.2.65 1.65.24 2.87.12 3.17.76.82 1.22 1.87 1.22 3.15 0 4.52-2.75 5.5-5.37 5.8.42.37.8 1.1.8 2.22v3.28c0 .31.22.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>
              </svg>
            </div>
            <div class="option-content">
              <h3>GitHub</h3>
              <p>github.com/Wocon-org</p>
            </div>
          </a>

          <a href="https://discord.gg/K8WApyWa" target="_blank" class="contact-option">
            <div class="option-icon discord-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <div class="option-content">
              <h3>Discord</h3>
              <p>Join our community</p>
            </div>
          </a>
        </div>

        <div class="team-section">
          <h3 class="section-title">Development Team</h3>
          <p class="team-desc">We are a passionate team dedicated to building the best travel experience for you.</p>

          <div class="team-members">
            <div class="team-member">
              <img src="/wocon_ceo.jpg" alt="CEO" class="member-avatar" />
              <div class="member-info">
                <h4 class="member-name">Ceaser Zhao</h4>
                <p class="member-role">Founder & CEO</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <router-link to="/login" class="back-link">← Back to Login</router-link>
      </div>
    </div>

    <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
  </div>
</template>

<style scoped>
.contact-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
}

.contact-container[data-theme="dark"] {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --border-color: #30363d;
  --text-primary: #c9d1d9;
  --text-secondary: #8b949e;
  --text-muted: #6e7681;
  --accent: #238636;
  --accent-hover: #2ea043;
  --shadow: rgba(0, 0, 0, 0.3);
}

.contact-container[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f6f8fc;
  --bg-tertiary: #ffffff;
  --border-color: #d0d7de;
  --text-primary: #24292f;
  --text-secondary: #57606a;
  --text-muted: #8c959f;
  --accent: #1f6feb;
  --accent-hover: #1a61db;
  --shadow: rgba(0, 0, 0, 0.08);
}

.contact-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 8px 24px var(--shadow);
  overflow: hidden;
  backdrop-filter: blur(10px);
  z-index: 1;
  position: relative;
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.brand h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.theme-toggle {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.sun-icon, .moon-icon {
  width: 16px;
  height: 16px;
}

.card-body {
  padding: 24px;
}

.title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.subtitle {
  margin: 0 0 32px;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}

.contact-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
  text-decoration: none;
}

.contact-option:hover {
  border-color: var(--accent);
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-icon svg {
  width: 20px;
  height: 20px;
}

.email-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.github-icon {
  background: linear-gradient(135deg, #333 0%, #24292f 100%);
  color: white;
}

.discord-icon {
  background: linear-gradient(135deg, #5865F2 0%, #4752c4 100%);
  color: white;
}

.option-content h3 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.option-content p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.team-section {
  margin-top: 32px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.section-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.team-desc {
  margin: 0 0 20px;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-primary);
  transition: transform 0.2s ease;
}

.team-member:hover {
  transform: translateX(4px);
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.member-role {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.card-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.back-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.back-link:hover {
  text-decoration: underline;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 4px 12px var(--shadow);
  color: var(--text-primary);
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

@media (max-width: 400px) {
  .card-header, .card-body, .card-footer {
    padding: 16px;
  }
}
</style>
