<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-gray-700">
        Inbox
        <span v-if="emails.length" class="ml-1.5 text-xs font-normal text-gray-500">
          ({{ emails.length }} message{{ emails.length !== 1 ? 's' : '' }})
        </span>
      </h2>
      <button
        v-if="emails.length"
        @click="$emit('refresh')"
        class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="!loading && emails.length === 0"
      class="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="text-gray-500 font-medium mb-1">No emails yet</p>
      <p class="text-sm text-gray-400">Waiting for incoming messages...</p>
      <div class="flex items-center gap-1.5 mt-3 text-xs text-indigo-500">
        <span class="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Listening for new emails
      </div>
    </div>

    <!-- Email list -->
    <div v-else-if="emails.length" class="max-h-[500px] overflow-y-auto">
      <EmailItem
        v-for="email in emails"
        :key="email.id"
        :email="email"
        @select="$emit('select', email)"
      />
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="flex items-center justify-center py-12">
      <svg class="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EmailSummary } from '~/composables/useInbox';

defineProps<{
  emails: EmailSummary[];
  loading: boolean;
}>();

defineEmits<{
  select: [email: EmailSummary];
  refresh: [];
}>();
</script>
