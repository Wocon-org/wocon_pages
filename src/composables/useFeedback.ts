import { ref } from 'vue'

export function useFeedback() {
  const loading = ref(false)
  const showToast = ref(false)
  const toastMessage = ref('')

  const toast = (msg: string) => {
    toastMessage.value = msg
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }

  return {
    loading,
    showToast,
    toastMessage,
    toast
  }
}
