import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  // 初始化认证状态
  const initAuth = async () => {
    loading.value = true

    // 获取当前会话
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    loading.value = false

    // 监听认证状态变化
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
      loading.value = false
    })
  }

  // 登出
  const signOut = async () => {
    await supabase.auth.signOut()
    user.value = null
  }

  return {
    user,
    loading,
    isAuthenticated,
    initAuth,
    signOut
  }
})
