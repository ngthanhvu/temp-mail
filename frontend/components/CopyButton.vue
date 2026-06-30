<template>
  <button
    @click="copy(text)"
    class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors"
    :class="copied
      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
      : dark
        ? 'bg-slate-800/60 border border-slate-700/60 text-slate-100 hover:bg-slate-800 hover:border-slate-600'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
    :title="copied ? 'Copied!' : 'Copy to clipboard'"
  >
    <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <span v-if="label">{{ copied ? 'Copied!' : label }}</span>
    <span v-else-if="copied" class="sr-only">Copied!</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string;
  label?: string;
  dark?: boolean;
}>();

const { copy, copied } = useClipboard();
</script>
