<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <svg class="w-4.5 h-4.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-800 leading-tight">Inbox</h2>
          <p v-if="emails.length" class="text-[11px] text-slate-400 font-medium">
            {{ emails.length }} message{{ emails.length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
      <button
        v-if="emails.length"
        @click="$emit('refresh')"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="!loading && emails.length === 0"
      class="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div class="relative mb-5">
        <div class="absolute inset-0 bg-indigo-200/40 blur-2xl rounded-full" />
        <div class="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center border border-indigo-100">
          <svg class="w-9 h-9 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <p class="text-slate-600 font-semibold mb-1">No emails yet</p>
      <p class="text-sm text-slate-400 mb-4">Waiting for incoming messages...</p>
      <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-600">
        <span class="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        Listening for new emails
      </div>
    </div>

    <!-- Email list -->
    <div v-else-if="emails.length" class="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
      <EmailItem
        v-for="email in emails"
        :key="email.id"
        :email="email"
        @select="$emit('select', email)"
      />
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="flex flex-col items-center justify-center py-16 gap-3">
      <svg class="w-7 h-7 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p class="text-xs text-slate-400 font-medium">Loading inbox...</p>
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
