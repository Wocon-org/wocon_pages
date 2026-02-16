<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/TopBar.vue'
import { useSeo } from '@/composables/useSeo'
import { useStructuredData } from '@/composables/useStructuredData'

// Set SEO options
useSeo({
  title: 'Contact Us - Wocon Travel Platform',
  description: 'Get in touch with the Wocon team for questions, feedback, or support related to our travel planning and discovery platform.',
  keywords: ['contact us', 'support', 'feedback', 'travel platform', 'Wocon team'],
  canonical: 'https://www.woconapp.com/contact'
})

// Set structured data
useStructuredData({
  webpage: {
    name: 'Contact Us - Wocon Travel Platform',
    url: 'https://www.woconapp.com/contact',
    description: 'Get in touch with the Wocon team for questions, feedback, or support related to our travel planning and discovery platform.',
    breadcrumb: {
      type: 'BreadcrumbList',
      itemListElement: [
        {
          type: 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.woconapp.com/'
        },
        {
          type: 'ListItem',
          position: 2,
          name: 'Contact Us',
          item: 'https://www.woconapp.com/contact'
        }
      ]
    }
  }
})

const router = useRouter()
const showToast = ref(false)
const toastMessage = ref('')

const toast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => showToast.value = false, 2200)
}

const handleBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="contact-container">
    <!-- TopBar -->
    <TopBar />

    <main class="contact-main">
      <div class="contact-card">
        <div class="card-header">
          <h1 class="card-title">Contact Us</h1>
          <button class="back-button" @click="handleBack" aria-label="Back to home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m19 12-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div class="card-body">
          <p class="card-subtitle">We'd love to hear from you. Get in touch with us!</p>

          <div class="contact-options">
            <a href="mailto:zhaoceaser@gmail.com" class="contact-option" @click="toast('Opening email client...')">
              <div class="option-icon email-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22 6 12 13 2 6"/>
                </svg>
              </div>
              <div class="option-content">
                <h3 class="option-title">Email</h3>
                <p class="option-description">zhaoceaser@gmail.com</p>
              </div>
              <div class="option-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </a>

            <a href="https://github.com/Wocon-org" target="_blank" rel="noopener" class="contact-option" @click="toast('Opening GitHub...')">
              <div class="option-icon github-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.1.8-.25.8-.56v-2.1c-3.26.71-3.95-1.4-3.95-1.4-.54-1.37-1.31-1.73-1.31-1.73-1.07-.73.08-.72.08-.72 1.18.08 1.81 1.22 1.81 1.22 1.06 1.8 2.78 1.28 3.46.98.11-.76.41-1.28.75-1.58-2.6-.3-5.34-1.3-5.34-5.8 0-1.28.46-2.33 1.22-3.15-.12-.3-.53-1.52.12-3.17 0 0 .99-.32 3.25 1.2a11.1 11.1 0 0 1 5.92 0c2.26-1.52 3.25-1.2 3.25-1.2.65 1.65.24 2.87.12 3.17.76.82 1.22 1.87 1.22 3.15 0 4.52-2.75 5.5-5.37 5.8.42.37.8 1.1.8 2.22v3.28c0 .31.22.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>
                </svg>
              </div>
              <div class="option-content">
                <h3 class="option-title">GitHub</h3>
                <p class="option-description">github.com/Wocon-org</p>
              </div>
              <div class="option-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </a>

            <a href="https://discord.gg/K8WApyWa" target="_blank" rel="noopener" class="contact-option" @click="toast('Opening Discord...')">
              <div class="option-icon discord-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <div class="option-content">
                <h3 class="option-title">Discord</h3>
                <p class="option-description">Join our community</p>
              </div>
              <div class="option-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </a>
          </div>

          <div class="team-section">
            <h2 class="section-title">Development Team</h2>
            <p class="section-description">We are a passionate team dedicated to building the best travel experience for you.</p>

            <div class="team-members">
              <div class="team-member">
                <div class="member-avatar">
                  <img src="/wocon_ceo.jpg" alt="Ceaser Zhao" />
                </div>
                <div class="member-info">
                  <h3 class="member-name">Ceaser Zhao</h3>
                  <p class="member-role">Founder & CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
  </div>
</template>

<style scoped>
.contact-container {
  min-height: 100vh;
  background: var(--md3-background);
  font-family: var(--md3-font-family);
  position: relative;
}

.contact-main {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  margin-top: 60px;
}

.contact-card {
  width: 100%;
  max-width: 500px;
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-large);
  box-shadow: var(--md3-elevation-3);
  overflow: hidden;
  transition: all var(--md3-transition-medium);
}

.contact-card:hover {
  box-shadow: var(--md3-elevation-4);
  transform: translateY(-4px);
}

.card-header {
  padding: 24px;
  border-bottom: 2px solid var(--md3-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--md3-primary-container);
}

.card-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--md3-primary);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.back-button {
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
  padding: 0;
}

.back-button:hover {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  transform: translateX(-4px);
}

.card-body {
  padding: 32px 24px;
}

.card-subtitle {
  margin: 0 0 32px;
  font-size: var(--md3-body-medium);
  color: var(--md3-on-surface-variant);
  text-align: center;
  line-height: 1.6;
}

.contact-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.contact-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid var(--md3-surface-variant);
  border-radius: var(--md3-radius-large);
  background: var(--md3-surface);
  transition: all var(--md3-transition-medium);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.contact-option:hover {
  border-color: var(--md3-primary);
  background: var(--md3-primary-container);
  transform: translateX(8px);
  box-shadow: var(--md3-elevation-2);
}

.option-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--md3-radius-large);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--md3-transition-medium);
}

.contact-option:hover .option-icon {
  transform: scale(1.1);
}

.option-icon svg {
  width: 28px;
  height: 28px;
}

.email-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.github-icon {
  background: linear-gradient(135deg, #333 0%, #24292f 100%);
  color: white;
}

.discord-icon {
  background: linear-gradient(135deg, #5865F2 0%, #4752c4 100%);
  color: white;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-title {
  margin: 0 0 4px;
  font-size: var(--md3-body-medium);
  font-weight: 600;
  color: var(--md3-on-surface);
}

.option-description {
  margin: 0;
  font-size: var(--md3-body-small);
  color: var(--md3-on-surface-variant);
}

.option-arrow {
  flex-shrink: 0;
  color: var(--md3-primary);
  transition: all var(--md3-transition-medium);
}

.contact-option:hover .option-arrow {
  transform: translateX(8px);
}

.team-section {
  padding: 24px;
  border: 2px solid var(--md3-surface-variant);
  border-radius: var(--md3-radius-large);
  background: var(--md3-surface);
}

.section-title {
  margin: 0 0 12px;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--md3-primary);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-description {
  margin: 0 0 24px;
  font-size: var(--md3-body-medium);
  color: var(--md3-on-surface-variant);
  text-align: center;
  line-height: 1.6;
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: var(--md3-radius-large);
  background: var(--md3-primary-container);
  transition: all var(--md3-transition-medium);
}

.team-member:hover {
  transform: translateX(8px);
  box-shadow: var(--md3-elevation-2);
}

.member-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--md3-primary);
  flex-shrink: 0;
  transition: all var(--md3-transition-medium);
}

.team-member:hover .member-avatar {
  transform: scale(1.1);
  box-shadow: var(--md3-elevation-3);
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info {
  flex: 1;
}

.member-name {
  margin: 0 0 4px;
  font-size: var(--md3-body-medium);
  font-weight: 600;
  color: var(--md3-primary);
}

.member-role {
  margin: 0;
  font-size: var(--md3-body-small);
  color: var(--md3-on-primary-container);
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  padding: 16px 24px;
  border-radius: var(--md3-radius-large);
  box-shadow: var(--md3-elevation-4);
  color: var(--md3-on-surface);
  font-size: var(--md3-body-medium);
  font-weight: 600;
  opacity: 0;
  pointer-events: none;
  transition: all var(--md3-transition-medium);
  max-width: 400px;
  text-align: center;
  z-index: 1000;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .contact-main {
    padding: 24px 16px;
  }

  .contact-card {
    max-width: 100%;
  }

  .card-header {
    padding: 20px 16px;
  }

  .card-body {
    padding: 24px 16px;
  }

  .card-title {
    font-size: 1.25rem;
    letter-spacing: 1px;
  }

  .contact-option {
    padding: 16px;
  }

  .option-icon {
    width: 48px;
    height: 48px;
  }

  .option-icon svg {
    width: 24px;
    height: 24px;
  }

  .team-section {
    padding: 20px 16px;
  }

  .team-member {
    padding: 12px;
  }

  .member-avatar {
    width: 56px;
    height: 56px;
  }
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  .contact-option:hover {
    background: rgba(0, 180, 171, 0.1);
  }

  .team-member {
    background: rgba(0, 180, 171, 0.1);
  }

  .member-name {
    color: var(--md3-primary-light);
  }

  .member-role {
    color: var(--md3-on-surface-variant);
  }
}
</style>
