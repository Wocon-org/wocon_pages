// ============================================// wocon API Client// ============================================
import { supabase } from './supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

// API错误类型
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// API响应类型
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API客户端类
export class ApiClient {
  private supabase = supabase;

  // 认证状态变化监听
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // 获取当前会话
  async getSession(): Promise<ApiResponse<{ session: Session | null }>> {
    const { data, error } = await this.supabase.auth.getSession();
    return {
      data: { session: data.session },
      error: error ? { message: error.message, code: error.code } : null
    };
  }

  // 统一的请求处理方法
  async request<T>(fn: () => Promise<any>): Promise<ApiResponse<T>> {
    try {
      const result = await fn();
      return { 
        data: result.data as T, 
        error: result.error ? { 
          message: result.error.message, 
          code: result.error.code 
        } : null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'UNKNOWN_ERROR'
        } 
      };
    }
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient();