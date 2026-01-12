<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()

const email = ref('')
const message = ref('')
const loading = ref(false)
const emailError = ref('')
const emailTimeout = ref<number | null>(null)
const theme = ref<'dark' | 'light'>('dark')
const showToast = ref(false)
const toastMessage = ref('')

const allowedDomains = [
  'qq.com', 'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com',
  '163.com', '126.com', 'sina.com', 'icloud.com', 'protonmail.com',
  '163.net', '263.net', 'yeah.net', 'foxmail.com', 'aliyun.com',
  'tom.com', 'vip.qq.com', 'vip.sina.com', 'sohu.com',
]

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
  const domain = emailValue.split('@')[1]?.toLowerCase()
  if (domain && !allowedDomains.includes(domain)) {
    return `Please use: ${allowedDomains.slice(0, 6).join(', ')}...`
  }
  return ''
}

watch(email, (newVal) => {
  if (emailTimeout.value) clearTimeout(emailTimeout.value)
  emailTimeout.value = window.setTimeout(() => {
    emailError.value = validateEmail(newVal.trim())
  }, 800)
})

watch(emailError, (newError) => {
  isValidEmail.value = email.value.length > 0 && newError === ''
})

const isValidEmail = ref(false)

const clearInput = () => {
  email.value = ''
  emailError.value = ''
  toast('Input cleared')
}

const loginWithEmail = async () => {
  if (!isValidEmail.value) return
  loading.value = true
  const { error } = await supabase.auth.signInWithOtp({ email: email.value })
  loading.value = false
  if (error) {
    toast(error.message)
  } else {
    toast('Check your email for login link ✉️')
  }
}

const loginWithOAuth = async (provider: 'github' | 'google' | 'facebook' | 'linkedin') => {
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
  <div :data-theme="theme" class="body">
    <div class="blob a"></div>
    <div class="blob b"></div>
    <div class="blob c"></div>

    <main class="wrap">
      <section class="shell">
        <aside class="card hero">
          <div class="brand">
            <div class="logo"></div>
            <div>
              <h1>wocon</h1>
              <p>Modern workspace · Secure access</p>
            </div>
          </div>

          <div class="headline">Start Here to Meet Someone Surprising</div>
          <div class="subhead">
            Sign in to wocon to connect with professionals, share opportunities, and grow your network.
          </div>

          <div class="chips">
            <div class="chip">Glassmorphism</div>
            <div class="chip">Secure Auth</div>
            <div class="chip">Dark/Light Theme</div>
          </div>

          <div class="stats">
            <div class="stat"><b>99.9%</b><span>Uptime</span></div>
            <div class="stat"><b>OAuth</b><span>Multi-provider</span></div>
            <div class="stat"><b>SSO</b><span>Enterprise ready</span></div>
          </div>
        </aside>

        <section class="card login">
          <div class="topbar">
            <div class="brand" style="margin:0;">
              <img src="/woconlogo.png" alt="wocon" class="brand-logo" />
              <div>
                <h1 style="font-size:16px;margin:0;">wocon</h1>
                <p style="margin:2px 0 0;">Sign in to your account</p>
              </div>
            </div>

            <div class="mode" @click="toggleTheme">
              <span class="dot"></span>
              <span>{{ theme === 'dark' ? 'Dark' : 'Light' }}</span>
            </div>
          </div>

          <h2 class="title">Welcome back</h2>
          <p class="hint">Sign in with email. We'll send you a magic link to sign in instantly.</p>

          <form @submit.prevent="loginWithEmail" autocomplete="on" novalidate>
            <div class="field">
              <label for="email">Email address</label>
              <div class="input">
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  inputmode="email"
                  placeholder="name@wocon.com"
                  required
                  :disabled="loading"
                  :class="{ error: emailError }"
                />
                <button class="iconbtn" type="button" @click="clearInput" title="Clear">
                  <svg class="svg" viewBox="0 0 24 24" fill="none">
                    <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              <div v-if="emailError" class="error-message">{{ emailError }}</div>
            </div>

            <button class="btn" type="submit" :disabled="loading || !isValidEmail">
              {{ loading ? 'Sending...' : 'Send Magic Link' }}
            </button>

            <div class="divider">or continue with</div>

            <div class="oauth">
              <button type="button" @click="loginWithOAuth('github')">
                <svg class="svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.1.8-.25.8-.56v-2.1c-3.26.71-3.95-1.4-3.95-1.4-.54-1.37-1.31-1.73-1.31-1.73-1.07-.73.08-.72.08-.72 1.18.08 1.81 1.22 1.81 1.22 1.06 1.8 2.78 1.28 3.46.98.11-.76.41-1.28.75-1.58-2.6-.3-5.34-1.3-5.34-5.8 0-1.28.46-2.33 1.22-3.15-.12-.3-.53-1.52.12-3.17 0 0 .99-.32 3.25 1.2a11.1 11.1 0 0 1 5.92 0c2.26-1.52 3.25-1.2 3.25-1.2.65 1.65.24 2.87.12 3.17.76.82 1.22 1.87 1.22 3.15 0 4.52-2.75 5.5-5.37 5.8.42.37.8 1.1.8 2.22v3.28c0 .31.22.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>
                </svg>
                GitHub
              </button>
              <button type="button" @click="loginWithOAuth('google')">
                <svg class="svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21.6 12.27c0-.64-.06-1.25-.16-1.85H12v3.5h5.38a4.6 4.6 0 0 1-2 3.02v2.26h3.24c1.9-1.75 2.98-4.33 2.98-7.93Z" fill="currentColor" opacity=".9"/>
                  <path d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.24-2.26c-.9.6-2.06.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.33A10 10 0 0 0 12 22Z" fill="currentColor" opacity=".75"/>
                  <path d="M6.41 13.13A6.02 6.02 0 0 1 6.1 12c0-.39.06-.77.14-1.13V8.54H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.46l3.34-2.33Z" fill="currentColor" opacity=".65"/>
                  <path d="M12 5.75c1.47 0 2.8.5 3.84 1.5l2.88-2.88C16.96 2.74 14.7 2 12 2A10 10 0 0 0 3.07 8.54l3.17 2.33C7.02 7.5 9.28 5.75 12 5.75Z" fill="currentColor" opacity=".8"/>
                </svg>
                Google
              </button>
              <button type="button" @click="loginWithOAuth('facebook')">
                <svg class="svg" viewBox="0 0 24 24" fill="#1877f2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button type="button" @click="loginWithOAuth('linkedin')">
                <svg class="svg" viewBox="0 0 24 24" fill="#0077b5">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
            </div>
          </form>

          <div class="foot">
            <span>Don't have an account? <router-link to="/signup">Sign up</router-link></span>
          </div>
        </section>
      </section>

      <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
    </main>
  </div>
</template>

<style scoped>
.body {
  margin: 0;
  min-height: 100vh;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: radial-gradient(1200px 700px at 18% 18%, rgba(124,58,237,.35), transparent 55%),
              radial-gradient(900px 600px at 88% 22%, rgba(34,211,238,.26), transparent 52%),
              radial-gradient(1000px 700px at 72% 92%, rgba(52,211,153,.20), transparent 55%);
  background-size: cover;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.body[data-theme="dark"] {
  --bg0: #070A12;
  --bg1: #0B1022;
  --card: rgba(255,255,255,.08);
  --card2: rgba(255,255,255,.12);
  --stroke: rgba(255,255,255,.14);
  --text: rgba(255,255,255,.92);
  --muted: rgba(255,255,255,.68);
  --shadow: 0 24px 70px rgba(0,0,0,.55);
  --radius: 22px;
  --accentA: #7C3AED;
  --accentB: #22D3EE;
  --accentC: #34D399;
  --focus: rgba(34,211,238,.35);
  background: radial-gradient(1200px 700px at 18% 18%, rgba(124,58,237,.35), transparent 55%),
              radial-gradient(900px 600px at 88% 22%, rgba(34,211,238,.26), transparent 52%),
              radial-gradient(1000px 700px at 72% 92%, rgba(52,211,153,.20), transparent 55%),
              linear-gradient(160deg, var(--bg0), var(--bg1));
}

.body[data-theme="light"] {
  --bg0: #F6F7FB;
  --bg1: #EEF2FF;
  --card: rgba(255,255,255,.72);
  --card2: rgba(255,255,255,.86);
  --stroke: rgba(10,20,40,.10);
  --text: rgba(10,20,40,.92);
  --muted: rgba(10,20,40,.62);
  --shadow: 0 24px 70px rgba(17,24,39,.18);
  --focus: rgba(124,58,237,.18);
  background: radial-gradient(1200px 700px at 18% 18%, rgba(124,58,237,.20), transparent 55%),
              radial-gradient(900px 600px at 88% 22%, rgba(34,211,238,.15), transparent 52%),
              radial-gradient(1000px 700px at 72% 92%, rgba(52,211,153,.12), transparent 55%),
              linear-gradient(160deg, var(--bg0), var(--bg1));
}

.body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
  opacity: .25;
  pointer-events: none;
}

.blob {
  position: absolute;
  width: 440px;
  height: 440px;
  border-radius: 50%;
  filter: blur(40px);
  opacity: .22;
  animation: floaty 14s ease-in-out infinite;
}
.blob.a {
  background: radial-gradient(circle at 30% 30%, var(--accentA), transparent 60%);
  left: -120px;
  top: -140px;
}
.blob.b {
  background: radial-gradient(circle at 30% 30%, var(--accentB), transparent 60%);
  right: -150px;
  top: -80px;
  animation-duration: 17s;
}
.blob.c {
  background: radial-gradient(circle at 30% 30%, var(--accentC), transparent 60%);
  left: 40%;
  bottom: -220px;
  animation-duration: 19s;
}

@keyframes floaty {
  0%, 100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(20px,-22px) scale(1.04); }
}

.wrap {
  position: relative;
  width: 100%;
  display: grid;
  place-items: center;
  padding: 28px 16px;
}

.shell {
  width: min(1040px, 100%);
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 22px;
  align-items: stretch;
}

@media (max-width: 920px) {
  .shell { grid-template-columns: 1fr; }
  .hero { display: none; }
}

.card {
  border-radius: var(--radius);
  background: linear-gradient(180deg, var(--card2), var(--card));
  border: 1px solid var(--stroke);
  box-shadow: var(--shadow);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  overflow: hidden;
  position: relative;
}

.hero {
  padding: 34px 34px 28px;
  min-height: 560px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}
.logo {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: radial-gradient(10px 10px at 30% 35%, rgba(255,255,255,.75), transparent 60%),
              linear-gradient(135deg, var(--accentA), var(--accentB));
  box-shadow: 0 14px 30px rgba(124,58,237,.25);
  border: 1px solid rgba(255,255,255,.22);
}
.brand h1 {
  margin: 0;
  font-size: 18px;
  letter-spacing: .2px;
}
.brand p {
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 12px;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  object-fit: contain;
}

.headline {
  margin-top: 10px;
  font-size: 34px;
  line-height: 1.12;
  letter-spacing: -0.6px;
}
.subhead {
  margin-top: 12px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
  max-width: 54ch;
}

.chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.chip {
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--stroke);
  background: rgba(255,255,255,.06);
  color: var(--muted);
  font-size: 12px;
}

.stats {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.stat {
  padding: 14px 14px;
  border-radius: 16px;
  border: 1px solid var(--stroke);
  background: rgba(255,255,255,.06);
}
.stat b { display: block; font-size: 18px; }
.stat span { color: var(--muted); font-size: 12px; }

.login {
  padding: 28px 26px 22px;
  min-height: 560px;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.mode {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--stroke);
  background: rgba(255,255,255,.06);
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
}
.mode .dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accentA), var(--accentB));
  box-shadow: 0 10px 18px rgba(124,58,237,.25);
}

.title {
  margin: 8px 0 6px;
  font-size: 22px;
  letter-spacing: -0.2px;
}
.hint {
  margin: 0 0 18px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}
label {
  font-size: 12px;
  color: var(--muted);
}
.input {
  position: relative;
}
input {
  width: 100%;
  padding: 12px 44px 12px 12px;
  border-radius: 14px;
  border: 1px solid var(--stroke);
  background: rgba(255,255,255,.06);
  color: var(--text);
  outline: none;
  font-size: 14px;
  transition: box-shadow .2s ease, border-color .2s ease, transform .05s ease;
}
input::placeholder { color: rgba(255,255,255,.45); }
.body[data-theme="light"] input::placeholder { color: rgba(10,20,40,.38); }
input:focus {
  border-color: rgba(34,211,238,.35);
  box-shadow: 0 0 0 4px var(--focus);
}
input:active { transform: translateY(1px); }
input.error {
  border-color: #FF4D6D;
}

.error-message {
  color: #FF4D6D;
  font-size: 12px;
  margin-top: 4px;
}

.iconbtn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid var(--stroke);
  background: rgba(255,255,255,.06);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--muted);
}
.iconbtn:hover { background: rgba(255,255,255,.10); color: var(--text); }

.btn {
  margin-top: 16px;
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  color: white;
  font-weight: 600;
  letter-spacing: .2px;
  background: linear-gradient(135deg, var(--accentA), var(--accentB));
  box-shadow: 0 18px 40px rgba(124,58,237,.22);
  transition: transform .08s ease, filter .2s ease, box-shadow .2s ease;
}
.btn:hover:not(:disabled) {
  filter: brightness(1.06);
  box-shadow: 0 18px 50px rgba(34,211,238,.16);
}
.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.divider {
  margin: 16px 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
}
.divider:before, .divider:after {
  content: "";
  height: 1px;
  flex: 1;
  background: var(--stroke);
}

.oauth {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.oauth button {
  border-radius: 14px;
  border: 1px solid var(--stroke);
  background: rgba(255,255,255,.06);
  color: var(--text);
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  font-size: 13px;
}
.oauth button:hover { background: rgba(255,255,255,.10); }

.foot {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-top: 16px;
  color: var(--muted);
  font-size: 12px;
  border-top: 1px solid rgba(255,255,255,.08);
}
.body[data-theme="light"] .foot { border-top-color: rgba(10,20,40,.08); }
.foot a {
  color: var(--text);
  text-decoration: none;
  opacity: .9;
}
.foot a:hover { opacity: 1; text-decoration: underline; text-underline-offset: 3px; }

.toast {
  position: fixed;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%) translateY(18px);
  background: rgba(0,0,0,.55);
  color: rgba(255,255,255,.95);
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  opacity: 0;
  pointer-events: none;
  transition: opacity .22s ease, transform .22s ease;
  font-size: 13px;
  max-width: min(560px, calc(100% - 32px));
  text-align: center;
}
.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.svg { width: 18px; height: 18px; display: block; }
</style>
