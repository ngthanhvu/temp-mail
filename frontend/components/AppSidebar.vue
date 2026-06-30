<template>
  <aside class="hidden md:flex md:flex-col w-72 lg:w-80 h-screen sticky top-0 shrink-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-slate-100 border-r border-slate-700/50">
    <!-- Brand -->
    <div class="px-5 pt-6 pb-5 border-b border-slate-700/50">
      <div class="flex items-center gap-3">
        <div class="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span class="absolute -inset-1 rounded-xl bg-indigo-500/20 blur-md -z-10" />
        </div>
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white">Temp Mail</h1>
          <p class="text-[11px] text-slate-400 font-medium">Disposable inbox</p>
        </div>
      </div>
    </div>

    <!-- Email address card -->
    <div class="px-5 py-5">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
        Your address
      </p>
      <div class="group relative rounded-xl bg-slate-800/60 border border-slate-700/60 p-3 hover:border-slate-600 transition-colors">
        <div class="flex items-center gap-2">
          <span class="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/60" />
          <p class="font-mono text-sm text-slate-100 truncate flex-1" :title="email">
            {{ email || 'Generating...' }}
          </p>
        </div>
        <div class="mt-2 flex items-center gap-1.5">
          <CopyButton :text="email" label="Copy" dark />
        </div>
      </div>
    </div>

    <!-- Address actions -->
    <div class="px-5 pb-5 space-y-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Domain
        </p>
        <DomainPicker
          v-if="showDomainPicker"
          v-model="selectedDomain"
          :domains="domains"
          dark
        />
      </div>

      <button
        @click="$emit('new-address')"
        :disabled="loading"
        class="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-400 hover:to-violet-500 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path d="M12 4v16m8-8H4" />
        </svg>
        New Address
      </button>
    </div>

    <!-- Stats -->
    <div class="px-5 pb-5">
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-xl bg-slate-800/40 border border-slate-700/40 px-3 py-2.5">
          <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Messages</p>
          <p class="text-xl font-bold text-white tabular-nums">{{ messageCount }}</p>
        </div>
        <div class="rounded-xl bg-slate-800/40 border border-slate-700/40 px-3 py-2.5">
          <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Status</p>
          <p class="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-1">
            <span class="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live
          </p>
        </div>
      </div>
    </div>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Footer -->
    <div class="px-5 py-4 border-t border-slate-700/50">
      <div class="flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
        <svg class="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <p>Emails auto-delete after 1 hour. No registration required.</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Domain } from '~/composables/useInbox';

const props = defineProps<{
  email: string;
  domains: Domain[];
  showDomainPicker?: boolean;
  loading?: boolean;
  messageCount?: number;
}>();

const emit = defineEmits<{
  'new-address': [];
}>();

const selectedDomain = ref('');
watch(selectedDomain, (val) => {
  if (val) emit('new-address');
});

const messageCount = computed(() => props.messageCount ?? 0);
</script>
