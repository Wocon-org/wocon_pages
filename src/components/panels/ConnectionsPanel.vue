<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  show?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  show: true
})

const emit = defineEmits<Emits>()

const handleClose = () => {
  emit('close')
}

// 模拟好友列表数据(后续使用Supabase数据)
const connections = ref<any[]>([])

// 添加连接弹窗状态
const showAddModal = ref(false)
const newConnectionName = ref('')
const isAdding = ref(false)

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return '#10b981'
    case 'away':
      return '#f59e0b'
    case 'offline':
      return '#9ca3af'
    default:
      return '#9ca3af'
  }
}

const handleConnectionClick = (id: string) => {
  console.log('Connection clicked:', id)
  // TODO: 打开聊天窗口
}

const handleAddConnection = () => {
  showAddModal.value = true
}

const handleAddConnectionSubmit = () => {
  if (newConnectionName.value.trim()) {
    isAdding.value = true
    
    // 模拟添加连接的过程
    setTimeout(() => {
      const newConnection = {
        id: (connections.value.length + 1).toString(),
        name: newConnectionName.value.trim(),
        status: 'online',
        lastMessage: 'New connection added!',
        unread: 0
      }
      
      connections.value.unshift(newConnection)
      showAddModal.value = false
      newConnectionName.value = ''
      isAdding.value = false
    }, 1000)
  }
}

const handleAddConnectionCancel = () => {
  showAddModal.value = false
  newConnectionName.value = ''
}
</script>

<template>
  <div class="connections-panel">
    <!-- 添加好友按钮 -->
    <button class="add-btn" @click="handleAddConnection">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span>Add Connection</span>
    </button>

    <!-- 连接列表 -->
    <div class="connections-list">
      <div
        v-for="connection in connections"
        :key="connection.id"
        class="connection-item"
        @click="handleConnectionClick(connection.id)"
      >
        <!-- 头像 -->
        <div class="connection-avatar">
          <div class="avatar-placeholder">
            {{ connection.name.charAt(0) }}
          </div>
          <div
            class="status-indicator"
            :style="{ background: getStatusColor(connection.status) }"
          ></div>
        </div>

        <!-- 信息 -->
        <div class="connection-info">
          <div class="connection-name">
            {{ connection.name }}
          </div>
          <div class="connection-message">
            {{ connection.lastMessage }}
          </div>
        </div>

        <!-- 未读消息 -->
        <div v-if="connection.unread > 0" class="unread-badge">
          {{ connection.unread }}
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="connections.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
        <circle cx="12" cy="7" r="4"></circle>
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path>
      </svg>
      <p>No connections yet</p>
      <p class="empty-hint">Add friends to start chatting</p>
    </div>

    <!-- 添加连接弹窗 -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="add-modal">
        <h3>Add New Connection</h3>
        <div class="modal-content">
          <label for="connection-name">Name</label>
          <input
            id="connection-name"
            type="text"
            v-model="newConnectionName"
            placeholder="Enter connection name"
            :disabled="isAdding"
          />
        </div>
        <div class="modal-actions">
          <button
            class="btn-cancel"
            @click="handleAddConnectionCancel"
            :disabled="isAdding"
          >
            Cancel
          </button>
          <button
            class="btn-submit"
            @click="handleAddConnectionSubmit"
            :disabled="isAdding || !newConnectionName.trim()"
          >
            <span v-if="!isAdding">Add</span>
            <span v-else>Adding...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.connections-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-btn {
  width: 100%;
  padding: var(--md3-space-3) var(--md3-space-4);
  background: var(--md3-primary);
  border: none;
  border-radius: var(--md3-radius-large);
  color: var(--md3-on-primary);
  font-size: var(--md3-body-medium);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all var(--md3-transition-short);
  box-shadow: var(--md3-elevation-2);
}

.add-btn:hover {
  background: var(--md3-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--md3-elevation-3);
}

.add-btn:active {
  transform: translateY(0);
  box-shadow: var(--md3-elevation-1);
}

.connections-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.connection-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--md3-space-3);
  background: var(--md3-surface);
  border-radius: var(--md3-radius-large);
  cursor: pointer;
  transition: all var(--md3-transition-short);
  position: relative;
  box-shadow: var(--md3-elevation-1);
}

.connection-item:hover {
  background: var(--md3-surface-variant-light);
  transform: translateX(2px);
  box-shadow: var(--md3-elevation-2);
}

.connection-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 44px;
  height: 44px;
  background: var(--md3-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md3-on-primary);
  font-size: 18px;
  font-weight: 600;
  box-shadow: var(--md3-elevation-1);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--md3-surface);
  box-shadow: var(--md3-elevation-1);
}

.connection-info {
  flex: 1;
  min-width: 0;
}

.connection-name {
  font-size: var(--md3-body-medium);
  font-weight: 600;
  color: var(--md3-on-surface);
  margin-bottom: 2px;
}

.connection-message {
  font-size: var(--md3-body-small);
  color: var(--md3-on-surface-variant);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  width: 20px;
  height: 20px;
  background: var(--md3-error);
  color: var(--md3-on-error);
  border-radius: 50%;
  font-size: var(--md3-label-small);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--md3-elevation-1);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--md3-on-surface-variant);
  background: var(--md3-surface);
  border-radius: var(--md3-radius-large);
  box-shadow: var(--md3-elevation-1);
}

.empty-state p {
  margin: 12px 0 4px;
  font-size: var(--md3-body-medium);
  font-weight: 500;
  color: var(--md3-on-surface);
}

.empty-hint {
  font-size: var(--md3-body-small) !important;
  color: var(--md3-on-surface-variant) !important;
}

/* 添加连接弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--md3-transition-medium);
}

.add-modal {
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-large);
  padding: 24px;
  min-width: 300px;
  box-shadow: var(--md3-elevation-4);
  animation: slideIn var(--md3-transition-medium);
}

.add-modal h3 {
  margin: 0 0 20px 0;
  font-size: var(--md3-title-medium);
  font-weight: 700;
  color: var(--md3-primary);
  text-align: center;
}

.modal-content {
  margin-bottom: 20px;
}

.modal-content label {
  display: block;
  margin-bottom: 8px;
  font-size: var(--md3-label-medium);
  font-weight: 600;
  color: var(--md3-on-surface);
}

.modal-content input {
  width: 100%;
  padding: 10px 16px;
  border: 2px solid var(--md3-outline);
  border-radius: var(--md3-radius-small);
  font-size: var(--md3-body-medium);
  background: var(--md3-surface-variant);
  color: var(--md3-on-surface);
  transition: all var(--md3-transition-medium);
}

.modal-content input:focus {
  outline: none;
  border-color: var(--md3-primary);
  box-shadow: 0 0 0 3px rgba(0, 180, 171, 0.1);
}

.modal-content input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 10px 20px;
  border: 2px solid var(--md3-outline);
  border-radius: var(--md3-radius-small);
  background: var(--md3-surface);
  color: var(--md3-on-surface);
  font-size: var(--md3-body-medium);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--md3-transition-medium);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--md3-surface-variant);
  border-color: var(--md3-primary);
}

.btn-cancel:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-submit {
  padding: 10px 20px;
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  font-size: var(--md3-body-medium);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--md3-transition-medium);
}

.btn-submit:hover:not(:disabled) {
  background: var(--md3-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--md3-elevation-2);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
