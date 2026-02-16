import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSeo } from '@/composables/useSeo'
import { useStructuredData } from '@/composables/useStructuredData'
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
import Documentation from '@/views/Documentation.vue'
import Docs from '@/views/Docs.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Authentication pages
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        guestOnly: true,
        seo: {
          title: 'Login - Wocon Travel Platform',
          description: 'Login to your Wocon account to access your travel plans, connections, and saved destinations.',
          keywords: ['login', 'sign in', 'Wocon account', 'travel platform login']
        }
      }
    },
    {
      path: '/login/callback',
      name: 'login-callback',
      component: Login,
      meta: { guestOnly: true }
    },
    // Home page - Left-right layout, bottom four tabs
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true,
        seo: {
          title: 'Wocon - Interactive World Map and Travel Discovery',
          description: 'Explore the world with Wocon\'s interactive map, discover new destinations, and plan your next adventure.',
          keywords: ['interactive map', 'world discovery', 'travel destinations', 'trip planning', 'explore the world']
        }
      }
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup,
      meta: {
        guestOnly: true,
        seo: {
          title: 'Sign Up - Wocon Travel Platform',
          description: 'Create a Wocon account to start planning your travels, discovering new destinations, and connecting with fellow travelers.',
          keywords: ['sign up', 'create account', 'Wocon signup', 'travel platform registration']
        }
      }
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact,
      meta: {
        requiresAuth: false,
        seo: {
          title: 'Contact Us - Wocon Travel Platform',
          description: 'Get in touch with the Wocon team for questions, feedback, or support related to our travel planning and discovery platform.',
          keywords: ['contact us', 'support', 'feedback', 'travel platform', 'Wocon team']
        }
      }
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: Feedback,
      meta: {
        requiresAuth: false,
        seo: {
          title: 'Feedback - Wocon Travel Platform',
          description: 'Share your feedback with the Wocon team to help us improve our travel planning and discovery platform.',
          keywords: ['feedback', 'suggestions', 'improvements', 'Wocon platform']
        }
      }
    },
    // User pages
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: {
        requiresAuth: true,
        seo: {
          title: 'My Profile - Wocon Travel Platform',
          description: 'Manage your Wocon profile, update your personal information, and view your travel history.',
          keywords: ['profile', 'personal information', 'travel history', 'Wocon account']
        }
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: {
        requiresAuth: true,
        seo: {
          title: 'Settings - Wocon Travel Platform',
          description: 'Manage your Wocon account settings, including notification preferences, privacy options, and more.',
          keywords: ['settings', 'account settings', 'preferences', 'privacy', 'Wocon']
        }
      }
    },
    {
      path: '/settings/change-password',
      name: 'change-password',
      component: ChangePassword,
      meta: {
        requiresAuth: true,
        seo: {
          title: 'Change Password - Wocon Travel Platform',
          description: 'Update your Wocon account password to keep your account secure.',
          keywords: ['change password', 'update password', 'account security', 'Wocon']
        }
      }
    },
    // Trip related
    {
      path: '/map',
      name: 'map',
      component: Map,
      meta: {
        requiresAuth: true,
        seo: {
          title: 'World Map - Wocon Travel Platform',
          description: 'Explore the world with Wocon\'s interactive world map, discover new destinations, and plan your travels.',
          keywords: ['world map', 'interactive map', 'travel destinations', 'explore the world', 'Wocon']
        }
      }
    },
    {
      path: '/create-trip',
      name: 'create-trip',
      component: CreateTrip,
      meta: {
        requiresAuth: true,
        seo: {
          title: 'Create Trip - Wocon Travel Platform',
          description: 'Create a new trip plan with Wocon, including destinations, dates, and activities.',
          keywords: ['create trip', 'trip planning', 'travel itinerary', 'Wocon']
        }
      }
    },
    {
      path: '/trip/:id',
      name: 'trip-detail',
      component: TripDetail,
      meta: {
        requiresAuth: false,
        seo: {
          title: 'Trip Detail - Wocon Travel Platform',
          description: 'View detailed information about your trip, including destinations, dates, and activities.',
          keywords: ['trip detail', 'travel itinerary', 'trip information', 'Wocon']
        }
      }
    },
    // API test page
    {
      path: '/api-test',
      name: 'api-test',
      component: ApiTest,
      meta: {
        requiresAuth: false,
        seo: {
          title: 'API Test - Wocon Travel Platform',
          description: 'Test Wocon\'s API endpoints and explore the platform\'s capabilities.',
          keywords: ['API test', 'API endpoints', 'Wocon API', 'developer tools']
        }
      }
    },
    // Documentation page
    {
      path: '/documentation',
      name: 'documentation',
      component: Documentation,
      meta: {
        requiresAuth: false,
        seo: {
          title: 'Documentation - Wocon Travel Platform',
          description: 'Explore Wocon\'s documentation, including guides, tutorials, and API references.',
          keywords: ['documentation', 'guides', 'tutorials', 'API reference', 'Wocon']
        }
      }
    },
    // New Docs page
    {
      path: '/docs',
      name: 'docs',
      component: Docs,
      meta: {
        requiresAuth: false,
        seo: {
          title: 'Docs - Wocon Travel Platform',
          description: 'Access Wocon\'s comprehensive documentation, including user guides and API references.',
          keywords: ['docs', 'documentation', 'user guides', 'API reference', 'Wocon']
        }
      }
    }
  ]
})

// Route guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Update SEO on route change
  if (to.meta.seo) {
    const { updateSeo } = useSeo()
    const { updateStructuredData } = useStructuredData()

    // Update SEO
    updateSeo({
      title: to.meta.seo.title,
      description: to.meta.seo.description,
      keywords: to.meta.seo.keywords,
      canonical: `https://www.woconapp.com${to.path}`
    })

    // Update structured data
    updateStructuredData({
      webpage: {
        name: to.meta.seo.title,
        url: `https://www.woconapp.com${to.path}`,
        description: to.meta.seo.description,
        breadcrumb: {
          type: 'BreadcrumbList',
          itemListElement: [
            {
              type: 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://www.woconapp.com/'
            },
            ...(to.path !== '/' ? [{
              type: 'ListItem',
              position: 2,
              name: to.meta.seo.title.replace(' - Wocon Travel Platform', ''),
              item: `https://www.woconapp.com${to.path}`
            }] : [])
          ]
        }
      }
    })
  }

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
