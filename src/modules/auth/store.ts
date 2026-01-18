// ============================================// Auth Store// ============================================import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { getCurrentUser, signOut } from './api';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null);
  const loading = ref(true);
  const profile = ref<any>(null);

  // 计算属性
  const isAuthenticated = computed(() => !!user.value);

  // 初始化认证状态
  const initAuth = async () => {
    loading.value = true;

    try {
      // 获取当前会话
      const { data: { session } } = await supabase.auth.getSession();
      user.value = session?.user ?? null;

      // 如果用户已登录，获取用户资料
      if (user.value) {
        await fetchProfile(user.value.id);
      }
    } catch (error) {
      console.error('初始化认证状态失败:', error);
    } finally {
      loading.value = false;
    }

    // 监听认证状态变化
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null;
      loading.value = false;
    });
  };

  // 获取用户资料
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        profile.value = data;
      }
    } catch (error) {
      console.error('获取用户资料失败:', error);
    }
  };

  // 登出
  const handleSignOut = async () => {
    try {
      await signOut();
      user.value = null;
      profile.value = null;
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return {
    // 状态
    user,
    loading,
    profile,
    isAuthenticated,
    // 方法
    initAuth,
    signOut: handleSignOut,
    fetchProfile
  };
});