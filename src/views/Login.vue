<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import GraffitiWall from '@/components/GraffitiWall.vue'

const router = useRouter()
const route = useRoute()

const emailOrUsername = ref('')
const password = ref('')
const loading = ref(false)
const inputError = ref('')
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

const validateInput = (value: string): string => {
  if (!value) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value) && value.includes('@')) {
    return 'Please enter a valid email address'
  }
  return ''
}

watch(emailOrUsername, (newVal) => {
  inputError.value = validateInput(newVal.trim())
})

const isValidInput = () => {
  return emailOrUsername.value.length > 0 && password.value.length >= 6
}

const loginWithPassword = async () => {
  if (!isValidInput()) {
    if (password.value.length < 6) {
      toast('Password must be at least 6 characters')
    }
    return
  }

  loading.value = true

  // Check if input is email or username
  const isEmail = emailOrUsername.value.includes('@')

      try {
        let error
        if (isEmail) {
          // Login with email
          const result = await supabase.auth.signInWithPassword({
            email: emailOrUsername.value,
            password: password.value
          })
          error = result.error
        } else {
          // Login with username - use RPC function to get email
          const { data: profile, error: profileError } = await supabase.rpc('get_profile_by_username', {
            username_param: emailOrUsername.value
          })

          if (profileError || !profile || profile.length === 0) {
            toast('User not found. Please check your username or verify your email.')
            loading.value = false
            return
          }

          const result = await supabase.auth.signInWithPassword({
            email: profile[0].email,
            password: password.value
          })
          error = result.error
        }

    loading.value = false
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        toast('Please verify your email first. Check your inbox for the verification link.')
      } else {
        toast(error.message)
      }
    } else {
      toast('Login successful! ✅')
    }
  } catch {
    loading.value = false
    toast('Login failed. Please try again.')
  }
}

const loginWithOAuth = async (provider: 'github' | 'google' | 'facebook') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + '/login/callback' }
  })
  if (error) {
    toast(`${provider} login failed. Please try again.`)
  }
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    router.push(route.query.redirect as string || '/')
  }
})
</script>

<template>
  <div class="login-container">
    <GraffitiWall />
    <div class="login-card">
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
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 7 0 0 0-3.22-3.03-3.6-5.3l2.4-1.4a8.25 8.25 0 0 1-6.23 6.6v.85a8.25 8.25 0 0 1 6.23-6.6V16.7a8.25 8.25 0 0 1-3.03-1.55-3.6-5.3l-2.4 1.4a8.25 8.25 0 0 0-3.12-6.1-5.3-9.4Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <div class="card-body">
        <h2 class="title">Sign in</h2>
        <p class="subtitle">Welcome back! Please enter your details.</p>

        <form @submit.prevent="loginWithPassword" autocomplete="on" novalidate>
          <div class="form-group">
            <label for="emailOrUsername">Email or Username</label>
            <div class="input-wrapper">
              <input
                id="emailOrUsername"
                v-model="emailOrUsername"
                type="text"
                placeholder="name@wocon.com or username"
                required
                :disabled="loading"
                :class="{ error: inputError }"
                autocomplete="username"
              />
            </div>
            <div v-if="inputError" class="error-text">{{ inputError }}</div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="Enter your password"
                required
                :disabled="loading"
                autocomplete="current-password"
              />
            </div>
          </div>

          <button type="submit" class="submit-button" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">Or continue with</span>
          <span class="divider-line"></span>
        </div>

        <div class="oauth-buttons">
          <button type="button" class="oauth-button github" @click="loginWithOAuth('github')">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.1.8-.25.8-.56v-2.1c-3.26.71-3.95-1.4-3.95-1.4-.54-1.37-1.31-1.73-1.31-1.73-1.07-.73.08-.72.08-.72 1.18.08 1.81 1.22 1.81 1.22 1.06 1.8 2.78 1.28 3.46.98.11-.76.41-1.28.75-1.58-2.6-.3-5.34-1.3-5.34-5.8 0-1.28.46-2.33 1.22-3.15-.12-.3-.53-1.52.12-3.17 0 0 .99-.32 3.25 1.2a11.1 11.1 0 0 1 5.92 0c2.26-1.52 3.25-1.2 3.25-1.2.65 1.65.24 2.87.12 3.17.76.82 1.22 1.87 1.22 3.15 0 4.52-2.75 5.5-5.37 5.8.42.37.8 1.1.8 2.22v3.28c0 .31.22.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>
            </svg>
            Continue with GitHub
          </button>
          <button type="button" class="oauth-button google" @click="loginWithOAuth('google')">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21.6 12.27c0-.64-.06-1.25-.16-1.85H12v3.5h5.38a4.6 4.6 0 0 1-2 3.02v2.26h3.24c1.9-1.75 2.98-4.33 2.98-7.93Z" fill="currentColor" opacity=".9"/>
              <path d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.24-2.26c-.9.6-2.06.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.33A10 10 0 0 0 12 22Z" fill="currentColor" opacity=".75"/>
              <path d="M6.41 13.13A6.02 6.02 0 0 1 6.1 12c0-.39.06-.77.14-1.13V8.54H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.46l3.34-2.33Z" fill="currentColor" opacity=".65"/>
              <path d="M12 5.75c1.47 0 2.8.5 3.84 1.5l2.88-2.88C16.96 2.74 14.7 2 12 2A10 10 0 0 0 3.07 8.54l3.17 2.33C7.02 7.5 9.28 5.75 12 5.75Z" fill="currentColor" opacity=".8"/>
            </svg>
            Continue with Google
          </button>
          <button type="button" class="oauth-button facebook" @click="loginWithOAuth('facebook')">
            <svg viewBox="0 0 24 24" fill="#1877f2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>
        </div>
      </div>

      <div class="card-footer">
        <span>Don't have an account? </span>
        <router-link to="/signup" class="signup-link">Sign up</router-link>
      </div>

      <div class="contact-link">
        <router-link to="/contact" class="contact-text">Contact Us</router-link>
      </div>
    </div>

    <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--md3-space-5);
  font-family: var(--md3-font-family);
  background: var(--md3-background);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  box-shadow: var(--md3-elevation-2);
  overflow: hidden;
  backdrop-filter: blur(10px);
  z-index: 1;
  position: relative;
  transition: transform var(--md3-transition-medium), box-shadow var(--md3-transition-medium);
}

.login-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--md3-elevation-3);
}

.card-header {
  padding: var(--md3-space-5);
  border-bottom: 2px solid var(--md3-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--md3-primary-container);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--md3-space-2);
}

.brand-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.brand h1 {
  margin: 0;
  font-size: var(--md3-title-medium);
  font-weight: 700;
  color: var(--md3-primary);
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  background: var(--md3-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--md3-transition-medium);
  color: var(--md3-primary);
}

.theme-toggle:hover {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  transform: scale(1.05);
}

.sun-icon, .moon-icon {
  width: 20px;
  height: 20px;
}

.card-body {
  padding: var(--md3-space-5);
}

.title {
  margin: 0 0 var(--md3-space-4);
  font-size: var(--md3-headline-small);
  font-weight: 700;
  color: var(--md3-on-surface);
  text-align: center;
  letter-spacing: -0.01em;
}

.subtitle {
  margin: 0 0 var(--md3-space-6);
  font-size: var(--md3-body-medium);
  color: var(--md3-on-surface-variant);
  text-align: center;
}

.form-group {
  margin-bottom: var(--md3-space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--md3-space-2);
  font-size: var(--md3-label-medium);
  font-weight: 600;
  color: var(--md3-on-surface);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: var(--md3-space-3) var(--md3-space-4);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  background: var(--md3-surface);
  color: var(--md3-on-surface);
  font-size: var(--md3-body-medium);
  outline: none;
  transition: all var(--md3-transition-medium);
  font-family: var(--md3-font-family);
}

.input-wrapper input::placeholder {
  color: var(--md3-on-surface-variant);
}

.input-wrapper input:focus {
  border-color: var(--md3-primary-light);
  box-shadow: 0 0 0 3px rgba(0, 180, 171, 0.2);
  transform: translateY(-1px);
}

.input-wrapper input.error {
  border-color: var(--md3-error);
}

.clear-button {
  position: absolute;
  right: var(--md3-space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md3-on-surface-variant);
  padding: 0;
  transition: all var(--md3-transition-medium);
}

.clear-button:hover {
  color: var(--md3-primary);
  transform: translateY(-50%) scale(1.1);
}

.clear-button svg {
  width: 16px;
  height: 16px;
}

.error-text {
  margin-top: var(--md3-space-2);
  font-size: var(--md3-label-small);
  color: var(--md3-error);
  font-weight: 500;
}

.submit-button {
  width: 100%;
  padding: var(--md3-space-3) var(--md3-space-4);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  font-size: var(--md3-label-large);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--md3-transition-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: var(--md3-space-2);
}

.submit-button:hover:not(:disabled) {
  background: var(--md3-primary-light);
  border-color: var(--md3-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--md3-elevation-2);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.divider {
  display: flex;
  align-items: center;
  margin: var(--md3-space-6) 0;
  gap: var(--md3-space-4);
  color: var(--md3-on-surface-variant);
  font-size: var(--md3-label-small);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.divider-line {
  flex: 1;
  height: 2px;
  background: var(--md3-primary);
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--md3-space-3);
}

.oauth-button {
  width: 100%;
  padding: var(--md3-space-3) var(--md3-space-4);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  background: var(--md3-surface);
  color: var(--md3-primary);
  font-size: var(--md3-label-medium);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--md3-space-3);
  transition: all var(--md3-transition-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.oauth-button:hover {
  background: var(--md3-primary-container);
  border-color: var(--md3-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--md3-elevation-1);
}

.oauth-button svg {
  width: 20px;
  height: 20px;
}

.card-footer {
  padding: var(--md3-space-4) var(--md3-space-5);
  border-top: 2px solid var(--md3-primary);
  text-align: center;
  font-size: var(--md3-body-medium);
  color: var(--md3-on-surface-variant);
  background: var(--md3-primary-container);
}

.signup-link {
  color: var(--md3-primary);
  text-decoration: none;
  font-weight: 700;
  transition: all var(--md3-transition-medium);
  position: relative;
}

.signup-link:hover {
  color: var(--md3-primary-light);
  text-decoration: none;
}

.signup-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--md3-primary);
  transform: scaleX(0);
  transition: transform var(--md3-transition-medium);
}

.signup-link:hover::after {
  transform: scaleX(1);
  background: var(--md3-primary-light);
}

.contact-link {
  padding: var(--md3-space-3) var(--md3-space-5);
  border-top: 1px solid var(--md3-surface-variant);
  text-align: center;
}

.contact-text {
  color: var(--md3-on-surface-variant);
  text-decoration: none;
  font-size: var(--md3-label-small);
  font-weight: 500;
  transition: all var(--md3-transition-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.contact-text:hover {
  color: var(--md3-primary);
  text-decoration: none;
}

.toast {
  position: fixed;
  bottom: var(--md3-space-6);
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  padding: var(--md3-space-3) var(--md3-space-4);
  border-radius: var(--md3-radius-small);
  box-shadow: var(--md3-elevation-3);
  color: var(--md3-on-surface);
  font-size: var(--md3-body-medium);
  font-weight: 500;
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

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    padding: var(--md3-space-4);
  }

  .login-card {
    max-width: 100%;
  }

  .card-header, .card-body, .card-footer {
    padding: var(--md3-space-4);
  }

  .brand-logo {
    width: 28px;
    height: 28px;
  }

  .brand h1 {
    font-size: var(--md3-title-small);
  }

  .title {
    font-size: var(--md3-title-large);
  }

  .oauth-button {
    font-size: var(--md3-label-small);
  }
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  .login-container {
    background: var(--md3-background);
  }

  .login-card {
    background: var(--md3-surface);
    border-color: var(--md3-primary);
  }

  .card-header {
    background: rgba(0, 180, 171, 0.1);
  }

  .input-wrapper input {
    background: var(--md3-surface);
    color: var(--md3-on-surface);
  }

  .oauth-button {
    background: var(--md3-surface);
    color: var(--md3-primary);
  }

  .oauth-button:hover {
    background: rgba(0, 180, 171, 0.1);
  }

  .card-footer {
    background: rgba(0, 180, 171, 0.1);
  }

  .toast {
    background: var(--md3-surface);
    color: var(--md3-on-surface);
  }
}
</style>
