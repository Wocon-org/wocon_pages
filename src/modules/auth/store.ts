// ============================================// Auth Store// ============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { getCurrentUser, signOut } from './api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(true)
  const profile = ref<any>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)

  // Initialize auth state
  const initAuth = async () => {
    loading.value = true

    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      user.value = session?.user ?? null

      // If user is logged in, fetch user profile
      if (user.value) {
        await fetchProfile(user.value.id)
      }
    } catch (error) {
      console.error('Failed to initialize auth state:', error)
    } finally {
      loading.value = false
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
      loading.value = false
    })
  }

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

      if (data) {
        profile.value = data
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      user.value = null
      profile.value = null
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return {
    // State
    user,
    loading,
    profile,
    isAuthenticated,
    // Methods
    initAuth,
    signOut: handleSignOut,
    fetchProfile,
  }
})
