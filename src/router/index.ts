import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Profile from '@/views/Profile.vue'
import Map from '@/views/Map.vue'
import Signup from '@/views/Signup.vue'
import CreateTrip from '@/views/CreateTrip.vue'
import Settings from '@/views/Settings.vue'
import Search from '@/views/Search.vue'
import Connections from '@/views/Connections.vue'
import Discover from '@/views/Discover.vue'
import HomePage from '@/views/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
      meta: { requiresAuth: true }
    },
    {
      path: '/connections',
      name: 'connections',
      component: Connections,
      meta: { requiresAuth: true }
    },
    {
      path: '/discover',
      name: 'discover',
      component: Discover,
      meta: { requiresAuth: true }
    },
    {
      path: '/home',
      name: 'homepage',
      component: HomePage,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guestOnly: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup,
      meta: { guestOnly: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
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
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // 首页访问 - 未登录重定向到登录页
  if (to.path === '/' && !isAuthenticated) {
    next({ name: 'login' })
  }
  // 需要认证的页面
  else if (to.meta.requiresAuth && !isAuthenticated) {
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
