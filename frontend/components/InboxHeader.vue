<template>
  <header class="bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-4xl mx-auto px-4 py-4">
      <!-- Logo -->
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-gray-900">Temp Mail</h1>
      </div>

      <!-- Email bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Email display -->
        <div class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-800 truncate">
          {{ email }}
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 flex-wrap">
          <CopyButton :text="email" label="Copy" />

          <DomainPicker
            v-if="showDomainPicker"
            v-model="selectedDomain"
            :domains="domains"
          />

          <button
            @click="$emit('new-address')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            New Address
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Domain } from '~/composables/useInbox';

const props = defineProps<{
  email: string;
  domains: Domain[];
  showDomainPicker?: boolean;
}>();

const emit = defineEmits<{
  'new-address': [];
}>();

const selectedDomain = ref('');
watch(selectedDomain, (val) => {
  if (val) emit('new-address');
});
</script>
