<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('features')

const documentationContent = {
  features: {
    title: 'Features',
    content: `
### Itinerary Creation
- **Map-based Planning**: Add destinations by clicking on the map in Create Trip page
- **Interactive Markers**: Custom blue-green markers with hover effects and animations
- **Multiple Destinations**: Support for adding multiple locations to a single trip
- **Timeline View**: Visual timeline of trip activities
- **Collaborative Editing**: Multiple users can contribute to trip plans

### Map Features
- **Interactive Maps**: Powered by OpenStreetMap with custom styling
- **Multiple Layers**: Switch between dark mode and satellite view
- **Geolocation**: Auto-detect user location for quick planning
- **Zoom Controls**: Intuitive zoom in/out functionality
- **Marker Management**: Add, edit, and remove trip destinations

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Swiss Design Style**: Clean, geometric interface with teal-blue accents
- **Smooth Animations**: Fluid transitions and hover effects
- **Accessibility**: Keyboard navigation and screen reader support
- **Dark Mode**: Automatic theme detection and manual toggle

### Collaboration
- **Invite Friends**: Share trip plans with other users
- **Real-time Updates**: Changes sync across all participants
- **Comment System**: Discuss trip details with collaborators
- **Version History**: Track changes and revert if needed

### Export Options
- **PDF Itineraries**: Generate printable trip documents
- **Shareable Links**: Create public links to trip plans
- **Calendar Integration**: Export trip dates to Google Calendar
- **Navigation Apps**: Generate directions for popular GPS apps
    `
  },
  quickstart: {
    title: 'Quick Start',
    content: `
## Quick Start Guide

### 1. Create an Account
- Visit the login page and sign up with your email
- Verify your account through the confirmation email
- Log in to access all features

### 2. Create Your First Trip
- Click the "Create Trip" button in the top navigation
- Enter a trip name, date range, and description
- Click on the map to add destinations
- Add multiple markers for different locations

### 3. Add Destinations
- In the Create Trip page, locate the map preview panel on the right
- Click anywhere on the map to add a blue-green marker
- Add multiple markers for different destinations in your trip

### 4. Customize Your Trip
- Add activities for each destination
- Set departure and arrival times
- Add notes and important information
- Upload photos for each location

### 5. Share with Friends
- Click the "Invite" button to add collaborators
- Enter email addresses of friends you want to share with
- Set permission levels (view-only or edit)
- Collaborators will receive an email invitation

### 6. Export Your Itinerary
- Click the "Export" button in the trip details page
- Choose your preferred format (PDF, calendar, etc.)
- Download or share the exported itinerary
- Print for offline reference

### 7. Navigate Your Trip
- Use the timeline view to see your trip schedule
- Click on destinations for detailed information
- Get directions between locations
- Access your trip plans offline with the mobile app
    `
  }
}

const handleBack = () => {
  router.back()
}
</script>

<template>
  <div class="documentation-page">
    <!-- Header -->
    <header class="doc-header">
      <button class="back-btn" @click="handleBack" aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <h1>Documentation</h1>
    </header>

    <!-- Tabs -->
    <div class="doc-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'features' }"
        @click="activeTab = 'features'"
      >
        Features
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'quickstart' }"
        @click="activeTab = 'quickstart'"
      >
        Quick Start
      </button>
    </div>

    <!-- Content -->
    <main class="doc-content">
      <h2>{{ documentationContent[activeTab as keyof typeof documentationContent].title }}</h2>
      <div class="markdown-content">
        <div v-html="documentationContent[activeTab as keyof typeof documentationContent].content"></div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.documentation-page {
  min-height: 100vh;
  background: var(--md3-surface);
  color: var(--md3-on-surface);
  padding-top: 60px;
}

.doc-header {
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid var(--md3-primary);
  background: var(--md3-surface);
  position: sticky;
  top: 60px;
  z-index: 100;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--md3-radius-small);
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  color: var(--md3-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--md3-transition-short);
  margin-right: 16px;
}

.back-btn:hover {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  transform: translateY(-2px);
}

.doc-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--md3-primary);
  margin: 0;
  font-family: var(--md3-font-family);
}

.doc-tabs {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid var(--md3-outline);
  background: var(--md3-surface);
  position: sticky;
  top: 140px;
  z-index: 90;
}

.tab-btn {
  padding: 16px 24px;
  background: transparent;
  border: none;
  color: var(--md3-on-surface);
  font-size: var(--md3-body-medium);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--md3-transition-short);
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  color: var(--md3-primary);
}

.tab-btn.active {
  color: var(--md3-primary);
  border-bottom-color: var(--md3-primary);
}

.doc-content {
  padding: 32px 24px;
  max-width: 800px;
  margin: 0 auto;
}

.doc-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--md3-primary);
  margin-bottom: 24px;
  font-family: var(--md3-font-family);
}

.markdown-content {
  font-size: var(--md3-body-medium);
  line-height: 1.6;
  color: var(--md3-on-surface);
}

.markdown-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--md3-primary);
  margin: 24px 0 16px 0;
  font-family: var(--md3-font-family);
}

.markdown-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--md3-on-surface);
  margin: 20px 0 12px 0;
}

.markdown-content p {
  margin: 16px 0;
}

.markdown-content ul {
  margin: 16px 0;
  padding-left: 24px;
}

.markdown-content li {
  margin: 8px 0;
}

.markdown-content strong {
  color: var(--md3-primary);
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .documentation-page {
    padding-top: 56px;
  }

  .doc-header {
    padding: 16px;
    top: 56px;
  }

  .doc-header h1 {
    font-size: 1.5rem;
  }

  .doc-tabs {
    top: 120px;
    padding: 0 16px;
  }

  .tab-btn {
    padding: 12px 16px;
    font-size: var(--md3-body-small);
  }

  .doc-content {
    padding: 24px 16px;
  }

  .doc-content h2 {
    font-size: 1.25rem;
  }

  .markdown-content h3 {
    font-size: 1.1rem;
  }

  .markdown-content {
    font-size: var(--md3-body-small);
  }
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  .documentation-page {
    background: var(--md3-surface);
  }

  .doc-header {
    background: var(--md3-surface);
  }

  .doc-tabs {
    background: var(--md3-surface);
  }

  .markdown-content {
    color: var(--md3-on-surface);
  }

  .markdown-content h3 {
    color: var(--md3-primary-light);
  }

  .markdown-content strong {
    color: var(--md3-primary-light);
  }
}
</style>