import { ref } from 'vue';

export function useClipboard() {
  const copied = ref(false);
  const error = ref<string | null>(null);

  async function copy(text: string) {
    error.value = null;
    try {
      await navigator.clipboard.writeText(text);
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 2000);
      } catch (e) {
        error.value = 'Failed to copy to clipboard';
      }
      document.body.removeChild(textarea);
    }
  }

  return { copy, copied, error };
}
