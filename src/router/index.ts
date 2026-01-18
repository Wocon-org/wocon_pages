import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Profile from '@/views/Profile.vue'
import Map from '@/views/Map.vue'
import Signup from '@/views/Signup.vue'
import CreateTrip from '@/views/CreateTrip.vue'
import Settings from '@/views/Settings.vue'
import ChangePassword from '@/views/ChangePassword.vue'
import Feedback from '@/views/Feedback.vue'
import Contact from '@/views/Contact.vue'
import ApiTest from '@/views/ApiTest.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 认证页面
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guestOnly: true }
    },
    // 首页 - 左右布局，底部四选项卡
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup,
      meta: { guestOnly: true }
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact,
      meta: { requiresAuth: false }
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: Feedback,
      meta: { requiresAuth: false }
    },
    // 用户页面
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings/change-password',
      name: 'change-password',
      component: ChangePassword,
      meta: { requiresAuth: true }
    },
    // 行程相关
    {
      path: '/map',
      name: 'map',
      component: Map,
      meta: { requiresAuth: true }
    },
    {
      path: '/create-trip',
      name: 'create-trip',
      component: CreateTrip,
      meta: { requiresAuth: true }
    },
    // API 测试页面
    {
      path: '/api-test',
      name: 'api-test',
      component: ApiTest,
      meta: { requiresAuth: false }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // 本地开发模式：禁用认证
  const devMode = import.meta.env.DEV

  if (devMode) {
    // 开发模式下跳过所有认证检查
    next()
    return
  }

  // 需要认证的页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
  // 游客专属页面（已登录用户不能访问）
  else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'home' })
  }
  else {
    next()
  }
})

export default router
