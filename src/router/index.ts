import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Profile from '@/views/Profile.vue'
import Map from '@/views/Map.vue'
import Signup from '@/views/Signup.vue'
import CreateTrip from '@/views/CreateTrip.vue'
import TripDetail from '@/views/TripDetail.vue'
import Settings from '@/views/Settings.vue'
import ChangePassword from '@/views/ChangePassword.vue'
import Feedback from '@/views/Feedback.vue'
import Contact from '@/views/Contact.vue'
import ApiTest from '@/views/ApiTest.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Authentication pages
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guestOnly: true }
    },
    // Home page - Left-right layout, bottom four tabs
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
    // User pages
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
    // Trip related
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
      path: '/trip/:id',
      name: 'trip-detail',
      component: TripDetail,
      meta: { requiresAuth: false }
    },
    // API test page
    {
      path: '/api-test',
      name: 'api-test',
      component: ApiTest,
      meta: { requiresAuth: false }
    }
  ]
})

// Route guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Local development mode: Disable authentication
  const devMode = import.meta.env.DEV

  if (devMode) {
    // Skip all authentication checks in development mode
    next()
    return
  }

  // Pages that require authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
  // Guest-only pages (logged-in users cannot access)
  else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'home' })
  }
  else {
    next()
  }
})

export default router
