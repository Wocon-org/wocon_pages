<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from '@/components/common/Sidebar.vue'

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
    <div class="sidebar-trigger" @click="showSidebar = true"></div>

    <!-- Language -->
    <div class="settings-section">
      <div class="section-header">{{ lang.value.language }}</div>
      <div class="section-content">
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.language }}</span>
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
      <div class="section-header">{{ lang.value.accountSecurity }}</div>
      <div class="section-content">
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.changePassword }}</span>
            <span class="item-sublabel">{{ lang.value.changePasswordSub }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.loginDevices }}</span>
            <span class="item-sublabel">{{ lang.value.loginDevicesSub }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Notification Settings -->
    <div class="settings-section">
      <div class="section-header">{{ lang.value.notificationSettings }}</div>
      <div class="section-content">
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.emailNotifications }}</span>
            <span class="item-sublabel">{{ lang.value.emailNotificationsSub }}</span>
          </div>
          <div class="toggle-switch">
            <input type="checkbox" checked />
            <span class="toggle-slider"></span>
          </div>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.tripInvitations }}</span>
            <span class="item-sublabel">{{ lang.value.tripInvitationsSub }}</span>
          </div>
          <div class="toggle-switch">
            <input type="checkbox" checked />
            <span class="toggle-slider"></span>
          </div>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.tripUpdates }}</span>
            <span class="item-sublabel">{{ lang.value.tripUpdatesSub }}</span>
          </div>
          <div class="toggle-switch">
            <input type="checkbox" checked />
            <span class="toggle-slider"></span>
          </div>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.friendRequests }}</span>
            <span class="item-sublabel">{{ lang.value.friendRequestsSub }}</span>
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
      <div class="section-header">{{ lang.value.privacySettings }}</div>
      <div class="section-content">
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.accountVisibility }}</span>
            <span class="item-sublabel">{{ lang.value.public }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.tripVisibility }}</span>
            <span class="item-sublabel">{{ lang.value.friendsOnly }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.profileVisibility }}</span>
            <span class="item-sublabel">{{ lang.value.public }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- About -->
    <div class="settings-section">
      <div class="section-header">{{ lang.value.about }}</div>
      <div class="section-content">
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.version }}</span>
            <span class="item-sublabel">1.0.0</span>
          </div>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.termsOfService }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.privacyPolicy }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-item">
          <div class="item-info">
            <span class="item-label">{{ lang.value.helpFeedback }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  </div>

  <Sidebar :showSidebar="showSidebar" @update:showSidebar="showSidebar = $event" />
</template>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: #000000;
  padding: 80px 60px;
  position: relative;
}

.sidebar-trigger {
  position: absolute;
  bottom: 40px;
  left: 60px;
  width: 48px;
  height: 48px;
  background: #1c1c1e;
  border: 1px solid #3a3a3c;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
}

.sidebar-trigger::before {
  content: '';
  display: block;
  width: 20px;
  height: 2px;
  background: #86868b;
  box-shadow:
    0 -6px 0 #86868b,
    0 6px 0 #86868b;
}

.settings-section {
  margin-bottom: 32px;
}

.section-header {
  font-size: 13px;
  color: #86868b;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.section-content {
  background: #1c1c1e;
  border-radius: 12px;
  overflow: hidden;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  min-height: 52px;
  border-bottom: 0.5px solid #38383a;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:hover {
  background-color: #2c2c2e;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-label {
  font-size: 17px;
  color: #ffffff;
  font-weight: 400;
}

.item-sublabel {
  font-size: 15px;
  color: #86868b;
  font-weight: 400;
}

.chevron {
  width: 12px;
  height: 12px;
  color: #86868b;
  flex-shrink: 0;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 51px;
  height: 31px;
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
  background-color: #39393d;
  transition: 0.3s;
  border-radius: 16px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 27px;
  width: 27px;
  left: 2px;
  bottom: 2px;
  background-color: #ffffff;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #0a84ff;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Language Selector */
.language-selector {
  appearance: none;
  background: #2c2c2e;
  border: 1px solid #3a3a3c;
  border-radius: 8px;
  padding: 8px 32px 8px 12px;
  color: #ffffff;
  font-size: 17px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  position: relative;
}

.language-selector:hover {
  background: #3a3a3c;
}

.language-selector:focus {
  border-color: #0a84ff;
}

.language-selector::-ms-expand {
  display: none;
}

.language-selector::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #86868b;
  pointer-events: none;
}
</style>
