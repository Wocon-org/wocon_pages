<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'

const router = useRouter()
const showSidebar = ref(false)

type Language = 'en' | 'zh'

const currentLanguage = ref<Language>('en')

const t = {
  en: {
    accountSecurity: 'Account Security',
    changePassword: 'Change Password',
    changePasswordSub: 'Update your password regularly',
    loginDevices: 'Login Devices',
    loginDevicesSub: 'Manage logged in devices',
    notificationSettings: 'Notification Settings',
    emailNotifications: 'Email Notifications',
    emailNotificationsSub: 'Receive important updates and reminders',
    tripInvitations: 'Trip Invitations',
    tripInvitationsSub: 'Get notified of new trip invitations',
    tripUpdates: 'Trip Updates',
    tripUpdatesSub: 'Get notified when trips change',
    friendRequests: 'Friend Requests',
    friendRequestsSub: 'Get notified of new friend requests',
    privacySettings: 'Privacy Settings',
    accountVisibility: 'Account Visibility',
    tripVisibility: 'Trip Visibility',
    profileVisibility: 'Profile Visibility',
    public: 'Public',
    friendsOnly: 'Friends Only',
    about: 'About',
    version: 'Version',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    helpFeedback: 'Help & Feedback',
    language: 'Language'
  },
  zh: {
    accountSecurity: '账号安全',
    changePassword: '修改密码',
    changePasswordSub: '定期更新密码以保护账号安全',
    loginDevices: '登录设备',
    loginDevicesSub: '管理已登录的设备',
    notificationSettings: '通知设置',
    emailNotifications: '邮件通知',
    emailNotificationsSub: '接收重要更新和提醒',
    tripInvitations: '行程邀请',
    tripInvitationsSub: '收到新的行程邀请时通知',
    tripUpdates: '行程更新',
    tripUpdatesSub: '行程有变更时通知',
    friendRequests: '好友请求',
    friendRequestsSub: '收到好友请求时通知',
    privacySettings: '隐私设置',
    accountVisibility: '账号可见性',
    tripVisibility: '行程可见性',
    profileVisibility: '个人资料可见性',
    public: '公开',
    friendsOnly: '仅好友可见',
    about: '关于',
    version: '版本',
    termsOfService: '用户协议',
    privacyPolicy: '隐私政策',
    helpFeedback: '帮助与反馈',
    language: '语言'
  }
}

const lang = computed(() => t[currentLanguage.value])

const languageOptions = [
  { value: 'en' as Language, label: 'English' },
  { value: 'zh' as Language, label: '中文' }
]

const changeLanguage = (newLang: Language) => {
  currentLanguage.value = newLang
}
</script>

<template>
  <div class="settings-container">
    <!-- Language -->
    <div class="settings-section">
      <div class="section-header">{{ lang.language }}</div>
      <div class="section-content">
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.language }}</span>
          </div>
          <select v-model="currentLanguage" @change="changeLanguage(currentLanguage)" class="language-selector">
            <option v-for="option in languageOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Account Security -->
    <div class="settings-section">
      <div class="section-header">{{ lang.accountSecurity }}</div>
      <div class="section-content">
        <div class="settings-item" @click="router.push('/settings/change-password')">
          <div class="item-info">
            <span class="item-label">{{ lang.changePassword }}</span>
            <span class="item-sublabel">{{ lang.changePasswordSub }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.loginDevices }}</span>
            <span class="item-sublabel">{{ lang.loginDevicesSub }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Notification Settings -->
    <div class="settings-section">
      <div class="section-header">{{ lang.notificationSettings }}</div>
      <div class="section-content">
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.emailNotifications }}</span>
            <span class="item-sublabel">{{ lang.emailNotificationsSub }}</span>
          </div>
          <div class="toggle-switch">
            <input type="checkbox" checked />
            <span class="toggle-slider"></span>
          </div>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.tripInvitations }}</span>
            <span class="item-sublabel">{{ lang.tripInvitationsSub }}</span>
          </div>
          <div class="toggle-switch">
            <input type="checkbox" checked />
            <span class="toggle-slider"></span>
          </div>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.tripUpdates }}</span>
            <span class="item-sublabel">{{ lang.tripUpdatesSub }}</span>
          </div>
          <div class="toggle-switch">
            <input type="checkbox" checked />
            <span class="toggle-slider"></span>
          </div>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.friendRequests }}</span>
            <span class="item-sublabel">{{ lang.friendRequestsSub }}</span>
          </div>
          <div class="toggle-switch">
            <input type="checkbox" />
            <span class="toggle-slider"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Privacy Settings -->
    <div class="settings-section">
      <div class="section-header">{{ lang.privacySettings }}</div>
      <div class="section-content">
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.accountVisibility }}</span>
            <span class="item-sublabel">{{ lang.public }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.tripVisibility }}</span>
            <span class="item-sublabel">{{ lang.friendsOnly }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.profileVisibility }}</span>
            <span class="item-sublabel">{{ lang.public }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- About -->
    <div class="settings-section">
      <div class="section-header">{{ lang.about }}</div>
      <div class="section-content">
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.version }}</span>
            <span class="item-sublabel">1.0.0</span>
          </div>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.termsOfService }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.privacyPolicy }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-item" @click="router.push('/feedback')">
          <div class="item-info">
            <span class="item-label">{{ lang.helpFeedback }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: var(--md3-background);
  padding: 80px 60px;
  position: relative;
  font-family: var(--md3-font-family);
}

.settings-section {
  margin-bottom: var(--md3-space-6);
}

.section-header {
  font-size: var(--md3-label-small);
  color: var(--md3-on-surface-variant);
  text-transform: uppercase;
  margin-bottom: var(--md3-space-2);
  letter-spacing: 0.1em;
  font-weight: 600;
}

.section-content {
  background: var(--md3-surface);
  border-radius: var(--md3-radius-small);
  overflow: hidden;
  border: 2px solid var(--md3-primary);
  box-shadow: var(--md3-elevation-1);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--md3-space-4) var(--md3-space-5);
  min-height: 64px;
  border-bottom: 1px solid var(--md3-surface-variant);
  cursor: pointer;
  transition: all var(--md3-transition-medium);
  position: relative;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:hover {
  background: var(--md3-primary-container);
  transform: translateX(4px);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--md3-space-1);
}

.item-label {
  font-size: var(--md3-body-medium);
  color: var(--md3-on-surface);
  font-weight: 500;
}

.item-sublabel {
  font-size: var(--md3-body-small);
  color: var(--md3-on-surface-variant);
  font-weight: 400;
}

.chevron {
  width: 20px;
  height: 20px;
  color: var(--md3-primary);
  flex-shrink: 0;
  transition: transform var(--md3-transition-medium);
}

.settings-item:hover .chevron {
  transform: translateX(4px);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 56px;
  height: 32px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--md3-surface-variant);
  transition: all var(--md3-transition-medium);
  border-radius: var(--md3-radius-full);
  border: 2px solid var(--md3-primary);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: var(--md3-primary);
  transition: all var(--md3-transition-medium);
  border-radius: 50%;
  box-shadow: var(--md3-elevation-1);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--md3-primary-container);
  border-color: var(--md3-primary);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
  background-color: var(--md3-primary);
}

/* Language Selector */
.language-selector {
  appearance: none;
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  padding: var(--md3-space-2) 40px var(--md3-space-2) var(--md3-space-3);
  color: var(--md3-on-surface);
  font-size: var(--md3-body-medium);
  cursor: pointer;
  outline: none;
  transition: all var(--md3-transition-medium);
  position: relative;
  font-family: var(--md3-font-family);
  font-weight: 500;
}

.language-selector:hover {
  background: var(--md3-primary-container);
  border-color: var(--md3-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--md3-elevation-1);
}

.language-selector:focus {
  border-color: var(--md3-primary-light);
  box-shadow: 0 0 0 3px rgba(0, 180, 171, 0.2);
}

.language-selector::-ms-expand {
  display: none;
}

/* Custom arrow for select */
.language-selector {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2300B4AB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-container {
    padding: 80px 24px;
  }
  
  .settings-item {
    padding: var(--md3-space-3) var(--md3-space-4);
    min-height: 56px;
  }
  
  .item-label {
    font-size: var(--md3-body-small);
  }
  
  .item-sublabel {
    font-size: var(--md3-label-small);
  }
  
  .toggle-switch {
    width: 48px;
    height: 28px;
  }
  
  .toggle-slider:before {
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
  }
  
  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }
  
  .language-selector {
    padding: var(--md3-space-1) 32px var(--md3-space-1) var(--md3-space-2);
    font-size: var(--md3-body-small);
  }
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  .settings-item:hover {
    background: rgba(0, 180, 171, 0.1);
  }
  
  .toggle-slider {
    background-color: var(--md3-surface-variant);
  }
  
  .toggle-switch input:checked + .toggle-slider {
    background-color: rgba(0, 180, 171, 0.2);
  }
  
  .language-selector {
    background-color: var(--md3-surface);
    color: var(--md3-on-surface);
  }
  
  .language-selector:hover {
    background-color: var(--md3-surface-variant);
  }
}
</style>
