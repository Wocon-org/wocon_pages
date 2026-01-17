<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import GraffitiWall from '@/components/GraffitiWall.vue'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const username = ref('')
const nickname = ref('')
const loading = ref(false)
const theme = ref<'dark' | 'light'>('dark')
const showToast = ref(false)
const toastMessage = ref('')
const emailError = ref('')
const usernameError = ref('')
const nicknameError = ref('')
const passwordError = ref('')
const emailTimeout = ref<number | null>(null)
const usernameTimeout = ref<number | null>(null)
const nicknameTimeout = ref<number | null>(null)
const passwordTimeout = ref<number | null>(null)

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

const validateEmail = (emailValue: string): string => {
  if (!emailValue) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailValue)) return 'Please enter a valid email address'
  return ''
}

const validateUsername = (usernameValue: string): string => {
  if (!usernameValue) return 'Username is required'
  if (usernameValue.length < 3) return 'Username must be at least 3 characters'
  if (usernameValue.length > 39) return 'Username must be at most 39 characters'
  if (!/^[a-zA-Z0-9_-]+$/.test(usernameValue)) return 'Username can only contain letters, numbers, underscores, and hyphens'
  return ''
}

const validateNickname = (nicknameValue: string): string => {
  if (!nicknameValue) return 'Nickname is required'
  if (nicknameValue.length < 2) return 'Nickname must be at least 2 characters'
  if (nicknameValue.length > 50) return 'Nickname must be at most 50 characters'
  return ''
}

const validatePassword = (passwordValue: string): string => {
  if (!passwordValue) return 'Password is required'
  if (passwordValue.length < 8) return 'Password must be at least 8 characters'
  return ''
}

watch(email, (newVal) => {
  if (emailTimeout.value) clearTimeout(emailTimeout.value)
  emailTimeout.value = window.setTimeout(() => {
    emailError.value = validateEmail(newVal.trim())
  }, 800)
})

watch(username, (newVal) => {
  if (usernameTimeout.value) clearTimeout(usernameTimeout.value)
  usernameTimeout.value = window.setTimeout(() => {
    usernameError.value = validateUsername(newVal.trim())
  }, 800)
})

watch(password, (newVal) => {
  if (passwordTimeout.value) clearTimeout(passwordTimeout.value)
  passwordTimeout.value = window.setTimeout(() => {
    passwordError.value = validatePassword(newVal)
  }, 800)
})

watch(nickname, (newVal) => {
  if (nicknameTimeout.value) clearTimeout(nicknameTimeout.value)
  nicknameTimeout.value = window.setTimeout(() => {
    nicknameError.value = validateNickname(newVal.trim())
  }, 800)
})

const isValidEmail = ref(false)
const isValidUsername = ref(false)
const isValidNickname = ref(false)
const isValidPassword = ref(false)

watch([emailError, usernameError, nicknameError, passwordError], () => {
  isValidEmail.value = email.value.length > 0 && emailError.value === ''
  isValidUsername.value = username.value.length > 0 && usernameError.value === ''
  isValidNickname.value = nickname.value.length > 0 && nicknameError.value === ''
  isValidPassword.value = password.value.length > 0 && passwordError.value === ''
})

const signup = async () => {
  if (!isValidEmail.value || !isValidUsername.value || !isValidNickname.value || !isValidPassword.value) return
  loading.value = true
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: { username: username.value, nickname: nickname.value },
    },
  })

  loading.value = false

  if (error) {
    toast(error.message)
  } else if (data.user && !data.session) {
    // Email confirmation required
    toast('Account created! Check your email to verify ✉️')
    setTimeout(() => router.push('/login'), 3000)
  } else if (data.user && data.session) {
    // Auto-signed in (email confirmation disabled or already confirmed)
    router.push('/')
  }
}

const signupWithOAuth = async (provider: 'github' | 'google' | 'facebook') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + '/login/callback' }
  })
  if (error) {
    toast(`${provider} signup failed. Please try again.`)
  }
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    router.push(route.query.redirect as string || '/')
  }
})
</script>

<template>
  <div :data-theme="theme" class="signup-container">
    <GraffitiWall />
    <div class="signup-card">
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
        <h2 class="title">Sign up</h2>
        <p class="subtitle">Welcome! Enter your details to create your account.</p>

        <form @submit.prevent="signup" autocomplete="on" novalidate>
          <div class="form-group">
            <label for="email">Email address</label>
            <div class="input-wrapper">
              <input
                id="email"
                v-model="email"
                type="email"
                inputmode="email"
                placeholder="name@wocon.com"
                required
                :disabled="loading"
                :class="{ error: emailError }"
                autocomplete="email"
              />
              <div v-if="emailError" class="error-text">{{ emailError }}</div>
            </div>
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-wrapper">
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="wocon_user"
                required
                :disabled="loading"
                :class="{ error: usernameError }"
                autocomplete="username"
              />
              <div v-if="usernameError" class="error-text">{{ usernameError }}</div>
            </div>
            <div class="helper-text">Username cannot be changed after registration</div>
          </div>

          <div class="form-group">
            <label for="nickname">Nickname</label>
            <div class="input-wrapper">
              <input
                id="nickname"
                v-model="nickname"
                type="text"
                placeholder="John Doe"
                required
                :disabled="loading"
                :class="{ error: nicknameError }"
                autocomplete="nickname"
              />
              <div v-if="nicknameError" class="error-text">{{ nicknameError }}</div>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="Create a password"
                required
                :disabled="loading"
                :class="{ error: passwordError }"
                autocomplete="new-password"
              />
              <div v-if="passwordError" class="error-text">{{ passwordError }}</div>
            </div>
          </div>

          <button type="submit" class="submit-button" :disabled="loading || !isValidEmail || !isValidUsername || !isValidNickname || !isValidPassword">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">Or continue with</span>
          <span class="divider-line"></span>
        </div>

        <div class="oauth-buttons">
          <button type="button" class="oauth-button github" @click="signupWithOAuth('github')">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.1.8-.25.8-.56v-2.1c-3.26.71-3.95-1.4-3.95-1.4-.54-1.37-1.31-1.73-1.31-1.73-1.07-.73.08-.72.08-.72 1.18.08 1.81 1.22 1.81 1.22 1.06 1.8 2.78 1.28 3.46.98.11-.76.41-1.28.75-1.58-2.6-.3-5.34-1.3-5.34-5.8 0-1.28.46-2.33 1.22-3.15-.12-.3-.53-1.52.12-3.17 0 0 .99-.32 3.25 1.2a11.1 11.1 0 0 1 5.92 0c2.26-1.52 3.25-1.2 3.25-1.2.65 1.65.24 2.87.12 3.17.76.82 1.22 1.87 1.22 3.15 0 4.52-2.75 5.5-5.37 5.8.42.37.8 1.1.8 2.22v3.28c0 .31.22.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>
            </svg>
            Continue with GitHub
          </button>
          <button type="button" class="oauth-button google" @click="signupWithOAuth('google')">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21.6 12.27c0-.64-.06-1.25-.16-1.85H12v3.5h5.38a4.6 4.6 0 0 1-2 3.02v2.26h3.24c1.9-1.75 2.98-4.33 2.98-7.93Z" fill="currentColor" opacity=".9"/>
              <path d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.24-2.26c-.9.6-2.06.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.33A10 10 0 0 0 12 22Z" fill="currentColor" opacity=".75"/>
              <path d="M6.41 13.13A6.02 6.02 0 0 1 6.1 12c0-.39.06-.77.14-1.13V8.54H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.46l3.34-2.33Z" fill="currentColor" opacity=".65"/>
              <path d="M12 5.75c1.47 0 2.8.5 3.84 1.5l2.88-2.88C16.96 2.74 14.7 2 12 2A10 10 0 0 0 3.07 8.54l3.17 2.33C7.02 7.5 9.28 5.75 12 5.75Z" fill="currentColor" opacity=".8"/>
            </svg>
            Continue with Google
          </button>
          <button type="button" class="oauth-button facebook" @click="signupWithOAuth('facebook')">
            <svg viewBox="0 0 24 24" fill="#1877f2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>
        </div>
      </div>

      <div class="card-footer">
        <span>Already have an account? </span>
        <router-link to="/login" class="login-link">Sign in</router-link>
      </div>

      <div class="contact-link">
        <router-link to="/contact" class="contact-text">Contact Us</router-link>
      </div>
    </div>

    <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
  </div>
</template>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
}

.signup-container[data-theme="dark"] {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --border-color: #30363d;
  --text-primary: #c9d1d9;
  --text-secondary: #8b949e;
  --text-muted: #6e7681;
  --accent: #238636;
  --accent-hover: #2ea043;
  --error: #da3633;
  --shadow: rgba(0, 0, 0, 0.3);
}

.signup-container[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f6f8fc;
  --bg-tertiary: #ffffff;
  --border-color: #d0d7de;
  --text-primary: #24292f;
  --text-secondary: #57606a;
  --text-muted: #8c959f;
  --accent: #1f6feb;
  --accent-hover: #1a61db;
  --error: #cf222e;
  --shadow: rgba(0, 0, 0, 0.08);
}

.signup-card {
  width: 100%;
  max-width: 340px;
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
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.subtitle {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input-wrapper input::placeholder {
  color: var(--text-muted);
}

.input-wrapper input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(35, 134, 54, 0.1);
}

.input-wrapper input.error {
  border-color: var(--error);
}

.error-text {
  margin-top: 6px;
  font-size: 12px;
  color: var(--error);
}

.helper-text {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.submit-button {
  width: 100%;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
  margin-top: 16px;
}

.submit-button:hover:not(:disabled) {
  background: var(--accent-hover);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  gap: 16px;
  color: var(--text-muted);
  font-size: 12px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.oauth-button {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.oauth-button:hover {
  background: var(--bg-secondary);
  border-color: var(--text-muted);
}

.oauth-button svg {
  width: 16px;
  height: 16px;
}

.card-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.login-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
}

.login-link:hover {
  text-decoration: underline;
}

.contact-link {
  padding: 12px 24px;
  border-top: 1px solid var(--border-color);
  text-align: left;
}

.contact-text {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.15s ease;
}

.contact-text:hover {
  color: var(--text-primary);
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
