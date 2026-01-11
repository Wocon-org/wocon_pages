<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()

const email = ref('')
const message = ref('')
const loading = ref(false)
const emailError = ref('')
const emailTimeout = ref<number | null>(null)

const allowedDomains = [
  'qq.com',
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  '163.com',
  '126.com',
  'sina.com',
  'icloud.com',
  'protonmail.com',
  '163.net',
  '263.net',
  'yeah.net',
  'foxmail.com',
  'aliyun.com',
  'tom.com',
  'vip.qq.com',
  'vip.sina.com',
  'sohu.com',
]

const validateEmail = (emailValue: string): string => {
  if (!emailValue) return ''

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailValue)) {
    return 'Please enter a valid email address'
  }

  const domain = emailValue.split('@')[1]?.toLowerCase()
  if (domain && !allowedDomains.includes(domain)) {
    return `Please use: ${allowedDomains.slice(0, 6).join(', ')}...`
  }

  return ''
}

watch(email, (newVal) => {
  // Clear previous timeout
  if (emailTimeout.value) {
    clearTimeout(emailTimeout.value)
  }

  // Debounce validation - only validate after user stops typing for 800ms
  emailTimeout.value = window.setTimeout(() => {
    emailError.value = validateEmail(newVal.trim())
  }, 800)
})

const isValidEmail = ref(false)

watch(emailError, (newError) => {
  isValidEmail.value = email.value.length > 0 && newError === ''
})

const loginWithEmail = async () => {
  if (!isValidEmail.value) return

  loading.value = true
  message.value = ''

  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
  })

  loading.value = false

  if (error) {
    message.value = error.message
  } else {
    message.value = 'Check your email for login link ✉️'
  }
}

const loginWithGitHub = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin + '/login/callback'
    }
  })

  if (error) {
    console.error('GitHub login error:', error)
    message.value = 'GitHub login failed. Please try again.'
  }
}

const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/login/callback'
    }
  })

  if (error) {
    console.error('Google login error:', error)
    message.value = 'Google login failed. Please try again.'
  }
}

const loginWithFacebook = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: window.location.origin + '/login/callback'
    }
  })

  if (error) {
    console.error('Facebook login error:', error)
    message.value = 'Facebook login failed. Please try again.'
  }
}

const loginWithLinkedIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin',
    options: {
      redirectTo: window.location.origin + '/login/callback'
    }
  })

  if (error) {
    console.error('LinkedIn login error:', error)
    message.value = 'LinkedIn login failed. Please try again.'
  }
}

// 监听认证状态变化，登录后跳转
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  }
})
</script>

<template>
  <div class="login-container">
    <div class="top-logo">
      <router-link to="/">
        <img src="/woconlogo.png" alt="wocon logo" class="page-logo" />
      </router-link>
    </div>
    <div class="login-card">
      <div class="login-header">
        <h1>Welcome to wocon</h1>
        <p>Sign in to continue</p>
      </div>

      <div class="login-form">
        <div class="form-group">
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="email-input"
            :class="{ error: emailError }"
            :disabled="loading"
          />
          <div v-if="emailError" class="error-message">{{ emailError }}</div>
          <button
            @click="loginWithEmail"
            class="email-button"
            :disabled="loading || !isValidEmail"
          >
            {{ loading ? 'Sending...' : 'Send Login Link' }}
          </button>
        </div>

        <div class="divider">
          <span>or continue with</span>
        </div>

        <div class="social-buttons">
          <button @click="loginWithGitHub" class="social-button github">
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
          <button @click="loginWithGoogle" class="social-button google">
            <svg class="icon" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button @click="loginWithFacebook" class="social-button facebook">
            <svg class="icon" viewBox="0 0 24 24" fill="#1877f2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
          <button @click="loginWithLinkedIn" class="social-button linkedin">
            <svg class="icon" viewBox="0 0 24 24" fill="#0077b5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>
        </div>
      </div>

      <div
        v-if="message"
        class="message"
        :class="{ error: message.includes('failed') || message.includes('error') }"
      >
        {{ message }}
      </div>

      <div class="login-footer">
        <p>Don't have an account? <router-link to="/signup">Sign up</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
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
  width: 50px;
  height: 50px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.page-logo:hover {
  transform: scale(1.05);
}

.login-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 255, 0.88) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 480px;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.login-header p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.email-input {
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.email-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.email-input.error {
  border-color: #f85149;
}

.email-input.error:focus {
  box-shadow: 0 0 0 3px rgba(248, 81, 73, 0.1);
}

.error-message {
  color: #f85149;
  font-size: 13px;
  margin-top: -8px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(248, 81, 73, 0.1);
  border-radius: 8px;
  border-left: 3px solid #f85149;
}

.email-button {
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.email-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.email-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e0e0e0;
}

.divider span {
  padding: 0 16px;
}

.social-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.social-button {
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.social-button:hover {
  border-color: #667eea;
  background: #f8f9ff;
  transform: translateY(-2px);
}

.social-button .icon {
  width: 20px;
  height: 20px;
}

.social-button.github:hover {
  border-color: #333;
  background: #f0f0f0;
}

.social-button.google:hover {
  border-color: #4285f4;
  background: #f0f8ff;
}

.social-button.facebook:hover {
  border-color: #1877f2;
  background: #f0f5ff;
}

.social-button.linkedin:hover {
  border-color: #0077b5;
  background: #f0f8ff;
}

.message {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  background: #d4edda;
  color: #155724;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
}

.login-footer p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-footer a:hover {
  color: #764ba2;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .login-card {
    padding: 24px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .social-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
