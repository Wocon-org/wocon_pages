<script setup lang="ts">
interface Props {
  label: string;
  to?: string;
  onClick?: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'click'): void;
}>();

const handleClick = () => {
  if (props.onClick) {
    props.onClick();
  }
  emit('click');
};
</script>

<template>
  <div class="sidebar-item" @click="handleClick">
    {{ label }}
  </div>
</template>

<style scoped>
.sidebar-item {
  padding: 16px 20px;
  border-bottom: 1px solid #30363d;
  color: #c9d1d9;
  cursor: pointer;
  transition: background 0.2s ease;
}

.sidebar-item:hover {
  background: #21262d;
}
</style>