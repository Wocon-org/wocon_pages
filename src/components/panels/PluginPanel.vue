<script setup lang="ts">
import { ref } from 'vue'

interface Plugin {
  id: number
  name: string
  description: string
  enabled: boolean
  icon: string
}

const plugins = ref<Plugin[]>([
  { id: 1, name: 'Weather Widget', description: 'Show weather on map', enabled: true, icon: '🌤️' },
  { id: 2, name: 'Trip Notes', description: 'Add notes to locations', enabled: true, icon: '📝' },
  { id: 3, name: 'Photo Gallery', description: 'View trip photos', enabled: false, icon: '📷' },
  { id: 4, name: 'Currency Converter', description: 'Convert currencies', enabled: false, icon: '💱' },
  { id: 5, name: 'Time Zone Display', description: 'Show local time zones', enabled: true, icon: '🕐' },
  { id: 6, name: 'Language Translator', description: 'Translate text in real-time', enabled: false, icon: '🌐' }
])

const togglePlugin = (pluginId: number) => {
  const plugin = plugins.value.find(p => p.id === pluginId)
  if (plugin) {
    plugin.enabled = !plugin.enabled
  }
}

const handleAddPlugin = () => {
  console.log('Add plugin clicked')
  // TODO: 实现添加插件的逻辑
}
</script>

<template>
  <div class="plugin-panel">
    <!-- 面板头部 -->
    <div class="panel-header">
      <h2 class="panel-title">Plugins</h2>
      <button class="md3-filled-button" @click="handleAddPlugin">
        <span class="md3-button-label">Add Plugin</span>
      </button>
    </div>

    <!-- 插件列表 -->
    <div class="plugins-list">
      <div v-for="plugin in plugins" :key="plugin.id" class="md3-plugin-card">
        <div class="plugin-icon">{{ plugin.icon }}</div>
        <div class="plugin-info">
          <div class="plugin-name">{{ plugin.name }}</div>
          <div class="plugin-description">{{ plugin.description }}</div>
        </div>
        <label class="md3-switch">
          <input
            type="checkbox"
            :checked="plugin.enabled"
            @change="togglePlugin(plugin.id)"
            class="md3-switch-input"
          />
          <span class="md3-switch-track"></span>
          <span class="md3-switch-thumb"></span>
        </label>
      </div>
    </div>

    <!-- 面板底部 -->
    <div class="panel-footer">
      <div class="footer-text">{{ plugins.filter(p => p.enabled).length }} plugins enabled</div>
    </div>
  </div>
</template>

<style scoped>
.plugin-panel {
  width: 360px;
  max-height: 500px;
  background: #21262d;
  border-radius: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 面板头部 */
.panel-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(139, 148, 158, 0.2);
}

.panel-title {
  color: #c9d1d9;
  font-size: 22px;
  font-weight: 500;
  margin: 0;
  letter-spacing: -0.5px;
}

/* MD3 Filled Button */
.md3-filled-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 24px;
  background: #6750A4;
  color: #FFFFFF;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15);
}

.md3-filled-button:hover {
  background: #7C62A7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2);
}

.md3-filled-button:active {
  background: #633B98;
}

.md3-button-label {
  pointer-events: none;
}

/* 插件列表 */
.plugins-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plugins-list::-webkit-scrollbar {
  width: 6px;
}

.plugins-list::-webkit-scrollbar-track {
  background: transparent;
}

.plugins-list::-webkit-scrollbar-thumb {
  background: rgba(139, 148, 158, 0.3);
  border-radius: 3px;
}

.plugins-list::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 148, 158, 0.5);
}

/* MD3 Plugin Card */
.md3-plugin-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #2A3038;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.md3-plugin-card:hover {
  background: #323942;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.plugin-icon {
  font-size: 32px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #30363d;
  border-radius: 12px;
}

.plugin-info {
  flex: 1;
  min-width: 0;
}

.plugin-name {
  color: #c9d1d9;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  letter-spacing: 0.15px;
}

.plugin-description {
  color: #8b949e;
  font-size: 14px;
  line-height: 1.4;
}

/* MD3 Switch */
.md3-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 32px;
  flex-shrink: 0;
  cursor: pointer;
}

.md3-switch-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.md3-switch-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #42453A;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.md3-switch-thumb {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  background: #E2E7E9;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.md3-switch-input:checked + .md3-switch-track {
  background: #6750A4;
}

.md3-switch-input:checked + .md3-switch-track + .md3-switch-thumb {
  left: 24px;
  background: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.md3-switch:hover .md3-switch-track {
  box-shadow: 0 0 0 1px #42453A;
}

.md3-switch:hover .md3-switch-input:checked + .md3-switch-track {
  box-shadow: 0 0 0 1px #6750A4;
}

/* 面板底部 */
.panel-footer {
  padding: 12px 24px 16px;
  border-top: 1px solid rgba(139, 148, 158, 0.2);
}

.footer-text {
  color: #8b949e;
  font-size: 12px;
  text-align: center;
}
</style>
