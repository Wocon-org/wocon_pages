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

const handleClick