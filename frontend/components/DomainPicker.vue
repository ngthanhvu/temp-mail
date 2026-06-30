<template>
  <div class="relative">
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="appearance-none w-full text-sm rounded-xl px-3 py-2.5 pr-9 cursor-pointer transition-colors font-medium"
      :class="dark
        ? 'bg-slate-800/60 border border-slate-700/60 text-slate-100 hover:bg-slate-800 hover:border-slate-600'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
    >
      <option value="" disabled>Select domain</option>
      <option v-for="domain in domains" :key="domain.name" :value="domain.name">
        @{{ domain.name }}
      </option>
    </select>
    <svg
      class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      :class="dark ? 'text-slate-400' : 'text-slate-500'"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import type { Domain } from '~/composables/useInbox';

defineProps<{
  modelValue: string;
  domains: Domain[];
  dark?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>
