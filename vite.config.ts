import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 打包优化配置
  build: {
    // 压缩配置
    minify: 'esbuild',
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 生成sourcemap
    sourcemap: false,
    // 配置chunk大小限制
    chunkSizeWarningLimit: 1000,
    // 启用gzip压缩
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          leaflet: ['leaflet'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  // 预加载配置
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'leaflet', '@supabase/supabase-js']
  }
})
