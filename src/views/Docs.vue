<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/TopBar.vue'

const router = useRouter()
const selectedDoc = ref('index')
const docContent = ref('')
const isLoading = ref(true)
const currentLang = ref('zh') // 默认中文

const handleBack = () => {
  router.push('/')
}

// 多语言支持
const languages = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' }
]

// 文档列表（多语言）
const docs = {
  zh: [
    { id: 'index', label: '首页' },
    { id: 'quickstart', label: '快速开始' },
    { id: 'features', label: '功能特性' },
    { id: 'faq', label: '常见问题' },
    { id: 'deployment', label: '部署指南' },
    { id: 'DATABASE_SCHEMA', label: '数据库架构' },
    { id: 'Backend Logic Documentation', label: '后端逻辑' },
    { id: 'Startup screen prompts', label: '启动提示' }
  ],
  en: [
    { id: 'index', label: 'Home' },
    { id: 'quickstart', label: 'Quickstart' },
    { id: 'features', label: 'Features' },
    { id: 'faq', label: 'FAQ' },
    { id: 'deployment', label: 'Deployment' },
    { id: 'DATABASE_SCHEMA', label: 'Database Schema' },
    { id: 'Backend Logic Documentation', label: 'Backend Logic' },
    { id: 'Startup screen prompts', label: 'Startup Prompts' }
  ]
}

// 加载文档内容
const loadDoc = async (docId: string) => {
  isLoading.value = true
  selectedDoc.value = docId

  try {
    // 尝试加载文档内容
    const response = await fetch(`/docs/${docId}.md`)
    if (response.ok) {
      docContent.value = await response.text()
    } else {
      // 尝试加载带空格的文件名
      const spacedResponse = await fetch(`/docs/${encodeURIComponent(docId)}.md`)
      if (spacedResponse.ok) {
        docContent.value = await spacedResponse.text()
      } else {
        docContent.value = currentLang.value === 'zh'
          ? `# 文档未找到\n\n无法加载文档 ${docId}。`
          : `# Document Not Found\n\nThe document ${docId} could not be loaded.`
      }
    }
  } catch (error) {
    docContent.value = currentLang.value === 'zh'
      ? `# 加载文档错误\n\n加载文档时发生错误：${error}`
      : `# Error Loading Document\n\nAn error occurred while loading the document: ${error}`
  } finally {
    isLoading.value = false
  }
}

// 切换语言
const changeLanguage = (lang: string) => {
  currentLang.value = lang
  // 重新加载当前文档
  loadDoc(selectedDoc.value)
}

onMounted(() => {
  loadDoc(selectedDoc.value)
})
</script>

<template>
  <div class="docs-container">
    <!-- TopBar -->
    <TopBar />

    <main class="docs-main">
      <div class="docs-card">
        <div class="card-header">
          <h1 class="card-title">{{ currentLang === 'zh' ? '文档中心' : 'Documentation' }}</h1>
          <div class="header-actions">
            <!-- Language selector -->
            <div class="language-selector">
              <button
                v-for="lang in languages"
                :key="lang.id"
                class="language-button"
                :class="{ active: currentLang === lang.id }"
                @click="changeLanguage(lang.id)"
              >
                {{ lang.label }}
              </button>
            </div>
            <!-- Back button -->
            <button class="back-button" @click="handleBack" aria-label="Back to home">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m19 12-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <div class="card-body">
          <div class="docs-layout">
            <!-- Sidebar with document list -->
            <div class="docs-sidebar">
              <nav class="docs-nav">
                <ul class="docs-list">
                  <li v-for="doc in docs[currentLang]" :key="doc.id">
                    <button
                      class="docs-nav-item"
                      :class="{ active: selectedDoc === doc.id }"
                      @click="loadDoc(doc.id)"
                    >
                      {{ doc.label }}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            <!-- Main document content -->
            <div class="docs-content">
              <div v-if="isLoading" class="docs-loading">
                <div class="loading-spinner"></div>
                <p>{{ currentLang === 'zh' ? '加载文档中...' : 'Loading document...' }}</p>
              </div>
              <div v-else class="docs-markdown">
                <div class="markdown-content">
                  <h2 v-if="selectedDoc === 'index'" class="doc-title">{{ currentLang === 'zh' ? '欢迎使用文档中心' : 'Welcome to Documentation Center' }}</h2>
                  <h2 v-else-if="selectedDoc === 'quickstart'" class="doc-title">{{ currentLang === 'zh' ? '快速开始' : 'Quickstart' }}</h2>
                  <h2 v-else-if="selectedDoc === 'features'" class="doc-title">{{ currentLang === 'zh' ? '功能特性' : 'Features' }}</h2>
                  <h2 v-else-if="selectedDoc === 'faq'" class="doc-title">{{ currentLang === 'zh' ? '常见问题' : 'FAQ' }}</h2>
                  <h2 v-else-if="selectedDoc === 'deployment'" class="doc-title">{{ currentLang === 'zh' ? '部署指南' : 'Deployment' }}</h2>
                  <h2 v-else-if="selectedDoc === 'DATABASE_SCHEMA'" class="doc-title">{{ currentLang === 'zh' ? '数据库架构' : 'Database Schema' }}</h2>
                  <h2 v-else-if="selectedDoc === 'Backend Logic Documentation'" class="doc-title">{{ currentLang === 'zh' ? '后端逻辑' : 'Backend Logic' }}</h2>
                  <h2 v-else-if="selectedDoc === 'Startup screen prompts'" class="doc-title">{{ currentLang === 'zh' ? '启动提示' : 'Startup Prompts' }}</h2>

                  <div class="doc-content">
                    {{ docContent }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.docs-container {
  min-height: 100vh;
  background: var(--md3-background);
  font-family: var(--md3-font-family);
  position: relative;
}

.docs-main {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  margin-top: 60px;
}

.docs-card {
  width: 100%;
  max-width: 1200px;
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-large);
  box-shadow: var(--md3-elevation-3);
  overflow: hidden;
  transition: all var(--md3-transition-medium);
}

.docs-card:hover {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Language selector */
.language-selector {
  display: flex;
  gap: 8px;
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  padding: 4px;
}

.language-button {
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: var(--md3-primary);
  font-size: var(--md3-label-small);
  font-weight: 600;
  cursor: pointer;
  border-radius: var(--md3-radius-small);
  transition: all var(--md3-transition-medium);
}

.language-button:hover {
  background: rgba(0, 180, 171, 0.1);
}

.language-button.active {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
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
  padding: 0;
}

.docs-layout {
  display: flex;
  height: 70vh;
  min-height: 500px;
}

.docs-sidebar {
  width: 280px;
  border-right: 2px solid var(--md3-primary);
  background: var(--md3-surface-variant);
  overflow-y: auto;
}

.docs-nav {
  padding: 24px 0;
}

.docs-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.docs-nav-item {
  width: 100%;
  padding: 16px 24px;
  text-align: left;
  border: none;
  background: transparent;
  color: var(--md3-on-surface-variant);
  font-size: var(--md3-body-medium);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--md3-transition-medium);
  border-left: 3px solid transparent;
}

.docs-nav-item:hover {
  background: var(--md3-primary-container);
  color: var(--md3-primary);
  transform: translateX(8px);
}

.docs-nav-item.active {
  background: var(--md3-primary-container);
  color: var(--md3-primary);
  border-left-color: var(--md3-primary);
  font-weight: 700;
}

.docs-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background: var(--md3-surface);
}

.docs-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--md3-on-surface-variant);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--md3-surface-variant);
  border-top: 4px solid var(--md3-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Markdown content styling */
.markdown-content {
  font-size: var(--md3-body-medium);
  line-height: 1.8;
  color: var(--md3-on-surface);
}

.doc-title {
  margin: 0 0 32px 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--md3-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 3px solid var(--md3-primary);
  padding-bottom: 16px;
}

.doc-content {
  white-space: pre-wrap;
  font-family: var(--md3-font-family);
  background: var(--md3-surface-variant);
  border: 1px solid var(--md3-outline);
  border-radius: var(--md3-radius-large);
  padding: 32px;
  box-shadow: var(--md3-elevation-1);
  transition: all var(--md3-transition-medium);
}

.doc-content:hover {
  box-shadow: var(--md3-elevation-2);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .docs-main {
    padding: 24px 16px;
  }

  .docs-card {
    max-width: 100%;
  }

  .card-header {
    padding: 20px 16px;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .card-title {
    font-size: 1.25rem;
    letter-spacing: 1px;
  }

  .docs-layout {
    flex-direction: column;
    height: auto;
    min-height: 600px;
  }

  .docs-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 2px solid var(--md3-primary);
    max-height: 200px;
  }

  .docs-content {
    padding: 24px 16px;
    min-height: 400px;
  }

  .doc-content {
    padding: 24px 16px;
  }

  .doc-title {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }

  .docs-nav-item {
    padding: 12px 16px;
  }

  .docs-nav-item:hover {
    transform: translateX(4px);
  }

  .language-selector {
    gap: 4px;
  }

  .language-button {
    padding: 4px 12px;
    font-size: var(--md3-label-small);
  }
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  .docs-nav-item:hover {
    background: rgba(0, 180, 171, 0.1);
  }

  .docs-nav-item.active {
    background: rgba(0, 180, 171, 0.1);
  }

  .doc-content {
    background: rgba(0, 0, 0, 0.1);
    border-color: var(--md3-primary);
  }
}
</style>
