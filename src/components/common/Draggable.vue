<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface Position {
  x: number
  y: number
}

interface Props {
  initialPosition?: Position
  enabled?: boolean
  boundary?: {
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
  }
}

interface Emits {
  (e: 'dragStart', position: Position): void
  (e: 'dragEnd', position: Position): void
  (e: 'positionChange', position: Position): void
}

const props = withDefaults(defineProps<Props>(), {
  initialPosition: () => ({ x: 100, y: 100 }),
  enabled: true,
  boundary: () => ({})
})

const emit = defineEmits<Emits>()

const container = ref<HTMLElement | null>(null)
const position = ref<Position>({ ...props.initialPosition })
const isDragging = ref(false)
const dragOffset = ref<Position>({ x: 0, y: 0 })

const handleMouseDown = (e: MouseEvent | TouchEvent) => {
  if (!props.enabled || !container.value) return

  isDragging.value = true

  const tStart = 'touches' in e ? e.touches?.[0] : null
  const clientX = tStart?.clientX ?? (e as MouseEvent).clientX
  const clientY = tStart?.clientY ?? (e as MouseEvent).clientY

  dragOffset.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y
  }

  emit('dragStart', position.value)

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchmove', handleMouseMove, { passive: false })
  document.addEventListener('touchend', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return

  e.preventDefault()

  const tMove = 'touches' in e ? e.touches?.[0] : null
  const clientX = tMove?.clientX ?? (e as MouseEvent).clientX
  const clientY = tMove?.clientY ?? (e as MouseEvent).clientY

  let newX = clientX - dragOffset.value.x
  let newY = clientY - dragOffset.value.y

  // Apply boundary constraints if provided
  if (props.boundary) {
    if (props.boundary.minX !== undefined) {
      newX = Math.max(newX, props.boundary.minX)
    }
    if (props.boundary.maxX !== undefined) {
      newX = Math.min(newX, props.boundary.maxX)
    }
    if (props.boundary.minY !== undefined) {
      newY = Math.max(newY, props.boundary.minY)
    }
    if (props.boundary.maxY !== undefined) {
      newY = Math.min(newY, props.boundary.maxY)
    }
  }

  position.value = { x: newX, y: newY }
  emit('positionChange', position.value)
}

const handleMouseUp = () => {
  if (!isDragging.value) return

  isDragging.value = false
  emit('dragEnd', position.value)

  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleMouseMove)
  document.removeEventListener('touchend', handleMouseUp)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleMouseMove)
  document.removeEventListener('touchend', handleMouseUp)
})
</script>

<template>
  <div
    ref="container"
    class="draggable-container"
    :class="{ dragging: isDragging, disabled: !enabled }"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`
    }"
  >
    <div
      class="drag-handle"
      @mousedown="handleMouseDown"
      @touchstart="handleMouseDown"
    >
      <slot name="handle">
        <div class="default-handle"></div>
      </slot>
    </div>
    <div class="drag-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.draggable-container {
  position: absolute;
  z-index: 1000;
  cursor: move;
  user-select: none;
}

.draggable-container.disabled {
  cursor: default;
}

.draggable-container.dragging {
  z-index: 1001;
}

.drag-handle {
  width: 100%;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
}

.default-handle {
  width: 40px;
  height: 4px;
  background: rgba(139, 148, 158, 0.3);
  border-radius: 2px;
  margin: 4px auto;
}

.drag-content {
  pointer-events: auto;
}

/* Touch optimization */
@media (hover: none) {
  .drag-handle {
    height: 24px;
  }

  .default-handle {
    height: 4px;
    width: 60px;
  }
}
</style>
