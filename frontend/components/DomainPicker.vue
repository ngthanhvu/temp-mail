<template>
  <div class="relative">
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="appearance-none bg-gray-100 text-gray-700 text-sm rounded-lg px-3 py-1.5 pr-8 cursor-pointer hover:bg-gray-200 transition-colors"
    >
      <option value="" disabled>Select domain</option>
      <option v-for="domain in domains" :key="domain.name" :value="domain.name">
        @{{ domain.name }}
      </option>
    </select>
    <svg class="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import type { Domain } from '~/composables/useInbox';

defineProps<{
  modelValue: string;
  domains: Domain[];
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>
