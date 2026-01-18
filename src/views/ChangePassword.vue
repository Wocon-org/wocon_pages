<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/common/Sidebar.vue'

const router = useRouter()
const showSidebar = ref(false)
const loading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

type Language = 'en' | 'zh'

const currentLanguage = ref<Language>('en')

const t = {
  en: {
    title: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    submit: 'Change Password',
    cancel: 'Cancel',
    currentPasswordPlaceholder: 'Enter your current password',
    newPasswordPlaceholder: 'Enter your new password',
    confirmPasswordPlaceholder: 'Confirm your new password',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordsNotMatch: 'Passwords do not match',
    success: 'Password changed successfully! ✅',
    error: 'Failed to change password',
    currentPasswordIncorrect: 'Current password is incorrect',
    passwordChanged: 'Password changed successfully',
  },
  zh: {
    title: '修改密码',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmPassword: '确认密码',
    submit: '修改密码',
    cancel: '取消',
    currentPasswordPlaceholder: '请输入当前密码',
    newPasswordPlaceholder: '请输入新密码',
    confirmPasswordPlaceholder: '请再次输入新密码',
    passwordTooShort: '密码长度至少为8个字符',
    passwordsNotMatch: '两次输入的密码不一致',
    success: '密码修改成功！✅',
    error: '密码修改失败',
    currentPasswordIncorrect: '当前密码不正确',
    passwordChanged: '密码修改成功',
  }
}

const lang = computed(() => t[currentLanguage.value])

const toast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => showToast.value = false, 2200)
}

const isPasswordValid = computed(() => {
  return newPassword.value.length >= 8
})

const doPasswordsMatch = computed(() => {
  return newPassword.value === confirmPassword.value && newPassword.value.length > 0
})

const isFormValid = computed(() => {
  return currentPassword.value.length > 0 &&
         isPasswordValid.value &&
         doPasswordsMatch.value &&
         !loading.value
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true

  try {
    // First verify current password by signing in
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email || '',
      password: currentPassword.value,
    })

    if (signInError) {
      toast(lang.value.currentPasswordIncorrect)
      loading.value = false
      return
    }

    // Then update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (updateError) {
      toast(lang.value.error)
      console.error('Error updating password:', updateError)
    } else {
      toast(lang.value.success)
      // Clear form
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    }
  } catch (error) {
    console.error('Error changing password:', error)
    toast(lang.value.error)
  }

  loading.value = false
}

const handleCancel = () => {
  router.back()
}
</script>

<template>
  <div class="change-password-container">
    <div class="sidebar-trigger" @click="showSidebar = true"></div>

    <div class="change-password-section">
      <div class="section-header">{{ lang.title }}</div>

      <div class="form-content">
        <div class="form-group">
          <label class="form-label">{{ lang.currentPassword }}</label>
          <input
            v-model="currentPassword"
            type="password"
            class="form-input"
            :placeholder="lang.currentPasswordPlaceholder"
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ lang.newPassword }}</label>
          <input
            v-model="newPassword"
            type="password"
            class="form-input"
            :placeholder="lang.newPasswordPlaceholder"
          />
          <div v-if="newPassword && !isPasswordValid" class="form-error">
            {{ lang.passwordTooShort }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ lang.confirmPassword }}</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="form-input"
            :placeholder="lang.confirmPasswordPlaceholder"
          />
          <div v-if="confirmPassword && !doPasswordsMatch" class="form-error">
            {{ lang.passwordsNotMatch }}
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-cancel" @click="handleCancel">
            {{ lang.cancel }}
          </button>
          <button
            class="btn btn-submit"
            @click="handleSubmit"
            :disabled="!isFormValid"
          >
            {{ loading ? 'Saving...' : lang.submit }}
          </button>
        </div>
      </div>
    </div>

    <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
  </div>

  <Sidebar :showSidebar="showSidebar" @update:showSidebar="showSidebar = $event" />
</template>

<style scoped>
.change-password-container {
  min-height: 100vh;
  background: #0d1117;
  padding: 80px 60px;
  position: relative;
}

.sidebar-trigger {
  position: absolute;
  bottom: 40px;
  left: 60px;
  width: 48px;
  height: 48px;
  background: #21262d;
  border: 1px solid #30363d;
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
  background: #8b949e;
  box-shadow:
    0 -6px 0 #8b949e,
    0 6px 0 #8b949e;
}

.change-password-section {
  max-width: 480px;
}

.section-header {
  font-size: 28px;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 32px;
}

.form-content {
  background: #161b22;
  border-radius: 12px;
  padding: 32px;
  border: 1px solid #30363d;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #c9d1d9;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #5865F2;
}

.form-input::placeholder {
  color: #8b949e;
}

.form-error {
  margin-top: 6px;
  font-size: 13px;
  color: #f85149;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
}

.btn-cancel:hover {
  background: #30363d;
}

.btn-submit {
  background: #5865F2;
  color: #ffffff;
}

.btn-submit:hover:not(:disabled) {
  background: #4752c4;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #1c1c1e;
  border: 1px solid #3a3a3c;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  color: #ffffff;
  font-size: 14px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease, transform 0.22s ease;
  max-width: 400px;
  text-align: center;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
