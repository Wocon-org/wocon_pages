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

const feedbackType = ref<'bug' | 'feature' | 'other'>('bug')
const feedbackContent = ref('')
const userEmail = ref('')

type Language = 'en' | 'zh'

const currentLanguage = ref<Language>('en')

const t = {
  en: {
    title: 'Send Feedback',
    subtitle: 'We value your feedback. Help us improve!',
    feedbackType: 'Feedback Type',
    bug: 'Bug Report',
    feature: 'Feature Request',
    other: 'Other',
    feedbackContent: 'Feedback',
    feedbackPlaceholder: 'Describe your feedback in detail...',
    userEmail: 'Email (Optional)',
    emailPlaceholder: 'your@email.com',
    submit: 'Submit Feedback',
    cancel: 'Cancel',
    success: 'Feedback submitted! Thank you! ✅',
    error: 'Failed to submit feedback',
    contentRequired: 'Please provide feedback content',
    contentTooShort: 'Feedback must be at least 10 characters',
  },
  zh: {
    title: '发送反馈',
    subtitle: '我们重视您的反馈。帮助我们改进！',
    feedbackType: '反馈类型',
    bug: '错误报告',
    feature: '功能建议',
    other: '其他',
    feedbackContent: '反馈内容',
    feedbackPlaceholder: '详细描述您的反馈...',
    userEmail: '邮箱（可选）',
    emailPlaceholder: 'your@email.com',
    submit: '提交反馈',
    cancel: '取消',
    success: '反馈已提交！谢谢！✅',
    error: '提交反馈失败',
    contentRequired: '请提供反馈内容',
    contentTooShort: '反馈内容至少需要10个字符',
  }
}

const lang = computed(() => t[currentLanguage.value])

const toast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => showToast.value = false, 2200)
}

const feedbackTypes = [
  { value: 'bug' as const, label: 'Bug Report', labelZh: '错误报告' },
  { value: 'feature' as const, label: 'Feature Request', labelZh: '功能建议' },
  { value: 'other' as const, label: 'Other', labelZh: '其他' },
]

const isFormValid = computed(() => {
  return feedbackContent.value.length >= 10 && !loading.value
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    if (feedbackContent.value.length < 10) {
      toast(lang.value.contentTooShort)
    }
    return
  }

  loading.value = true

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Insert feedback into feedbacks table
    const { error } = await supabase
      .from('feedbacks')
      .insert({
        type: feedbackType.value,
        content: feedbackContent.value,
        email: userEmail.value || null,
        user_id: user?.id || null,
      })

    if (error) {
      console.error('Error submitting feedback:', error)
      toast(lang.value.error)
    } else {
      toast(lang.value.success)
      // Clear form
      feedbackContent.value = ''
      userEmail.value = ''
      feedbackType.value = 'bug'
    }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    toast(lang.value.error)
  }

  loading.value = false
}

const handleCancel = () => {
  router.back()
}

const getFeedbackTypeLabel = (type: typeof feedbackType.value) => {
  const found = feedbackTypes.find(t => t.value === type)
  if (!found) return type
  return currentLanguage.value === 'zh' ? found.labelZh : found.label
}
</script>

<template>
  <div class="feedback-container">
    <div class="sidebar-trigger" @click="showSidebar = true"></div>

    <div class="feedback-section">
      <div class="section-header">
        {{ lang.title }}
      </div>
      <p class="subtitle">{{ lang.subtitle }}</p>

      <div class="form-content">
        <div class="form-group">
          <label class="form-label">{{ lang.feedbackType }}</label>
          <div class="feedback-types">
            <div
              v-for="type in feedbackTypes"
              :key="type.value"
              class="type-option"
              :class="{ active: feedbackType === type.value }"
              @click="feedbackType = type.value"
            >
              {{ currentLanguage === 'zh' ? type.labelZh : type.label }}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ lang.feedbackContent }} <span class="required">*</span></label>
          <textarea
            v-model="feedbackContent"
            class="form-textarea"
            :placeholder="lang.feedbackPlaceholder"
            rows="6"
          />
          <div v-if="feedbackContent && feedbackContent.length < 10" class="form-error">
            {{ lang.contentTooShort }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ lang.userEmail }}</label>
          <input
            v-model="userEmail"
            type="email"
            class="form-input"
            :placeholder="lang.emailPlaceholder"
          />
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
            {{ loading ? 'Submitting...' : lang.submit }}
          </button>
        </div>
      </div>
    </div>

    <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
  </div>

  <Sidebar :showSidebar="showSidebar" @update:showSidebar="showSidebar = $event" />
</template>

<style scoped>
.feedback-container {
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

.feedback-section {
  max-width: 600px;
}

.section-header {
  font-size: 28px;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #8b949e;
  margin-bottom: 32px;
  line-height: 1.5;
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

.required {
  color: #f85149;
  margin-left: 2px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #5865F2;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #8b949e;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.form-error {
  margin-top: 6px;
  font-size: 13px;
  color: #f85149;
}

.feedback-types {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.type-option {
  flex: 1;
  min-width: 120px;
  padding: 12px 20px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #8b949e;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.type-option:hover {
  border-color: #5865F2;
  color: #c9d1d9;
}

.type-option.active {
  background: #5865F2;
  border-color: #5865F2;
  color: #ffffff;
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
