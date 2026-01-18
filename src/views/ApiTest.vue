<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as api from '@/lib/api'
import { supabase } from '@/lib/supabase'

const results = ref<Record<string, any>>({})
const loading = ref(false)
const testEmail = ref(`test${Date.now()}@example.com`)

onMounted(async () => {
  await testAllAPIs()
})

async function testAllAPIs() {
  loading.value = true
  results.value = {}

  // 1. Test getCurrentUser
  try {
    const { user, error } = await api.getCurrentUser()
    results.value['getCurrentUser'] = error ? { error: error.message } : { user: user?.id }
  } catch (e: any) {
    results.value['getCurrentUser'] = { error: e.message }
  }

  // 2. Test getTrips
  try {
    const { data, error } = await api.getTrips()
    results.value['getTrips'] = error ? { error: error.message } : { count: data?.length }
  } catch (e: any) {
    results.value['getTrips'] = { error: e.message }
  }

  // 3. Test getTripById (will fail if no trips exist)
  try {
    const { data, error } = await api.getTripById('test-id')
    results.value['getTripById'] = error ? { error: error.message } : { success: true }
  } catch (e: any) {
    results.value['getTripById'] = { error: e.message }
  }

  loading.value = false
}

async function testAuthAPIs() {
  results.value = {}

  // Test signUp
  try {
    const { data, error } = await api.signUp(testEmail.value, 'password123', `user${Date.now()}`)
    results.value['signUp'] = error ? { error: error.message } : { success: true }
  } catch (e: any) {
    results.value['signUp'] = { error: e.message }
  }

  // Test signInWithEmail
  try {
    const { data, error } = await api.signInWithEmail(testEmail.value)
    results.value['signInWithEmail'] = error ? { error: error.message } : { success: true }
  } catch (e: any) {
    results.value['signInWithEmail'] = { error: e.message }
  }

  // Test signInWithOAuth
  try {
    const { data, error } = await api.signInWithOAuth('github')
    results.value['signInWithOAuth'] = error ? { error: error.message } : { success: true }
  } catch (e: any) {
    results.value['signInWithOAuth'] = { error: e.message }
  }
}

async function testProfileAPIs() {
  loading.value = true
  results.value = {}

  const { user } = await api.getCurrentUser()

  if (!user) {
    results.value['Profile APIs'] = { error: 'User not authenticated' }
    loading.value = false
    return
  }

  // Test getProfile
  try {
    const { data, error } = await api.getProfile(user.id)
    results.value['getProfile'] = error ? { error: error.message } : { username: data?.username }
  } catch (e: any) {
    results.value['getProfile'] = { error: e.message }
  }

  // Test updateProfile
  try {
    const { data, error } = await api.updateProfile(user.id, { bio: 'Test bio' })
    results.value['updateProfile'] = error ? { error: error.message } : { success: true }
  } catch (e: any) {
    results.value['updateProfile'] = { error: e.message }
  }

  loading.value = false
}

async function testTripAPIs() {
  loading.value = true
  results.value = {}

  const { user } = await api.getCurrentUser()

  if (!user) {
    results.value['Trip APIs'] = { error: 'User not authenticated' }
    loading.value = false
    return
  }

  // Test createTrip
  try {
    const { data, error } = await api.createTrip({
      name: `Test Trip ${Date.now()}`,
      description: 'Test description',
      type: 'private',
      max_participants: 5,
      is_public: false,
    })
    results.value['createTrip'] = error ? { error: error.message } : { id: data?.id }
  } catch (e: any) {
    results.value['createTrip'] = { error: e.message }
  }

  // Test getTripsByOwner
  try {
    const { data, error } = await api.getTripsByOwner(user.id)
    results.value['getTripsByOwner'] = error ? { error: error.message } : { count: data?.length }
  } catch (e: any) {
    results.value['getTripsByOwner'] = { error: e.message }
  }

  loading.value = false
}

async function testProfilesTable() {
  loading.value = true
  results.value = {}

  // Test count profiles
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    results.value['profiles.count'] = error ? { error: error.message } : { count }
  } catch (e: any) {
    results.value['profiles.count'] = { error: e.message }
  }

  // Test fetch first 5 profiles
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    results.value['profiles.list'] = error ? { error: error.message } : { count: data?.length, first: data?.[0]?.username }
  } catch (e: any) {
    results.value['profiles.list'] = { error: e.message }
  }

  loading.value = false
}

function getStatusColor(result: any) {
  if (result.error) return '#ff4d6d'
  return '#34d399'
}
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>API Test Panel</h1>
      <p>Test Supabase API connection and functionality</p>
    </div>

    <div class="controls">
      <button @click="testAllAPIs" :disabled="loading">
        Test Basic APIs
      </button>
      <button @click="testAuthAPIs" :disabled="loading">
        Test Auth APIs
      </button>
      <button @click="testProfileAPIs" :disabled="loading">
        Test Profile APIs
      </button>
      <button @click="testTripAPIs" :disabled="loading">
        Test Trip APIs
      </button>
      <button @click="testProfilesTable" :disabled="loading">
        Test Profiles Table
      </button>
    </div>

    <div class="test-input" v-if="Object.keys(results).includes('signUp') || Object.keys(results).includes('signInWithEmail')">
      <label>测试邮箱:</label>
      <input v-model="testEmail" type="email" />
    </div>

    <div class="results" v-if="Object.keys(results).length > 0">
      <div class="result-group">
        <h2>Test Results</h2>
        <div class="result-list">
          <div
            v-for="(result, apiName) in results"
            :key="apiName"
            class="result-item"
            :style="{ borderLeftColor: getStatusColor(result) }"
          >
            <div class="api-name">{{ apiName }}</div>
            <div class="api-result">
              <span v-if="result.error" class="error">{{ result.error }}</span>
              <span v-else class="success">
                {{ JSON.stringify(result) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loading" v-if="loading">
      <div class="spinner"></div>
      <p>Testing...</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 32px;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #7c3aed, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  color: #666;
  margin: 0;
}

.controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  justify-content: center;
}

.controls button {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #22d3ee);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.controls button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
}

.controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-input {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.test-input label {
  color: #666;
  font-size: 14px;
}

.test-input input {
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  width: 300px;
}

.test-input input:focus {
  outline: none;
  border-color: #7c3aed;
}

.results {
  margin-top: 32px;
}

.result-group h2 {
  font-size: 20px;
  margin: 0 0 20px 0;
  color: #333;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  padding: 16px 20px;
  border-radius: 12px;
  background: #f8f9fa;
  border-left: 4px solid;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.api-name {
  font-weight: 600;
  color: #333;
  font-family: monospace;
  font-size: 15px;
}

.api-result {
  font-size: 13px;
  max-width: 500px;
  text-align: right;
  word-break: break-all;
}

.api-result .error {
  color: #ff4d6d;
}

.api-result .success {
  color: #34d399;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: #666;
  margin: 0;
}
</style>
