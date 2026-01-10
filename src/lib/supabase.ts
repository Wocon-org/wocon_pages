import { createClient } from '@supabase/supabase-js'

// 从环境变量中读取 Supabase 配置（从 .env 文件中）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

// 初始化 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
