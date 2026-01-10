import { createRouter, createWebHistory } from 'vue-router'
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
      component: Search
    },
    {
      path: '/connections',
      name: 'connections',
      component: Connections
    },
    {
      path: '/discover',
      name: 'discover',
      component: Discover
    },
    {
      path: '/home',
      name: 'homepage',
      component: HomePage
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/map',
      name: 'map',
      component: Map
    },
    {
      path: '/create-trip',
      name: 'create-trip',
      component: CreateTrip
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
})

export default router
