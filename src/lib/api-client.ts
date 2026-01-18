// ============================================// wocon API Client// ============================================import { supabase } from './supabase';import type { AuthChangeEvent, Session } from '@supabase/supabase-js';// API响应类型export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

// API客户端类export class ApiClient {
  private supabase = supabase;

  // 认证状态变化监听
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // 获取当前会话
  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    return { data, error };
  }

  // 统一的请求处理方法
  async request<T>(fn: () => Promise<any>): Promise<ApiResponse<T>> {
    try {
      const result = await fn();
      return { data: result.data as T, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

// 创建API客户端实例export const apiClient = new ApiClient();