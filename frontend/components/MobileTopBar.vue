<template>
  <header class="md:hidden sticky top-0 z-20 bg-slate-900 text-slate-100 border-b border-slate-700/50 shadow-lg shadow-slate-900/20">
    <div class="px-4 py-3">
      <!-- Brand row -->
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="text-base font-bold text-white">Temp Mail</h1>
        <span class="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
          <span class="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live
        </span>
      </div>

      <!-- Address row -->
      <div class="flex items-center gap-2">
        <div class="flex-1 min-w-0 rounded-lg bg-slate-800/70 border border-slate-700/60 px-3 py-2 flex items-center gap-2">
          <span class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <p class="font-mono text-xs text-slate-100 truncate" :title="email">
            {{ email || 'Generating...' }}
          </p>
        </div>
        <CopyButton :text="email" label="" dark />
      </div>

      <!-- Actions row -->
      <div class="flex items-center gap-2 mt-2">
        <div class="flex-1">
          <DomainPicker
            :model-value="''"
            :domains="domains"
            dark
            @update:model-value="$emit('new-address')"
          />
        </div>
        <button
          @click="$emit('new-address')"
          :disabled="loading"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md disabled:opacity-60 transition"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Domain } from '~/composables/useInbox';

defineProps<{
  email: string;
  domains: Domain[];
  loading?: boolean;
}>();

defineEmits<{
  'new-address': [];
}>();
</script>
