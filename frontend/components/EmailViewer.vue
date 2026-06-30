<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
      <button
        @click="$emit('back')"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-3 group"
      >
        <svg class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to inbox
      </button>
      <h2 class="text-xl font-bold text-slate-900 leading-snug break-words">{{ email.subject || '(No subject)' }}</h2>
    </div>

    <!-- Meta -->
    <div class="px-5 py-4 border-b border-slate-100 flex items-start gap-3">
      <div
        class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
        :class="avatarColor"
      >
        {{ initials }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900 truncate">{{ email.sender_name || email.sender }}</p>
            <p class="text-xs text-slate-500 truncate">{{ email.sender }}</p>
          </div>
          <time class="text-xs text-slate-400 whitespace-nowrap font-medium" :datetime="email.received_at">
            {{ formatDate(email.received_at) }}
          </time>
        </div>
      </div>
    </div>

    <!-- Attachments -->
    <div v-if="attachments.length" class="px-5 py-4 border-b border-slate-100 bg-amber-50/40">
      <p class="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
        <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
        Attachments ({{ attachments.length }})
      </p>
      <div class="flex flex-wrap gap-2">
        <a
          v-for="(att, i) in attachments"
          :key="i"
          :href="att.base64 ? `data:${att.contentType};base64,${att.base64}` : '#'"
          :download="att.filename"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {{ att.filename }}
          <span class="text-slate-400 font-normal">({{ formatSize(att.size) }})</span>
        </a>
      </div>
    </div>

    <!-- Body -->
    <div class="px-5 py-5">
      <!-- HTML body -->
      <div v-if="email.body_html" class="email-body">
        <iframe
          :srcdoc="sanitizedHtml"
          sandbox="allow-same-origin"
          class="w-full min-h-[300px] border-0"
          title="Email content"
        />
      </div>

      <!-- Text body -->
      <div v-else-if="email.body_text" class="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
        {{ email.body_text }}
      </div>

      <!-- No body -->
      <div v-else class="text-center py-10 text-slate-400 text-sm">
        No content to display
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FullEmail } from '~/composables/useInbox';

const props = defineProps<{
  email: FullEmail;
}>();

defineEmits<{
  back: [];
}>();

interface Attachment {
  filename: string;
  contentType: string;
  size: number;
  base64: string | null;
}

const AVATAR_COLORS = [
  'bg-gradient-to-br from-indigo-500 to-violet-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-sky-500 to-blue-600',
  'bg-gradient-to-br from-fuchsia-500 to-purple-600',
];

const attachments = computed<Attachment[]>(() => {
  if (!props.email.attachments) return [];
  try {
    return JSON.parse(props.email.attachments);
  } catch {
    return [];
  }
});

const initials = computed(() => {
  const src = props.email.sender_name || props.email.sender || '?';
  const cleaned = src.replace(/<[^>]*>/g, '').trim();
  const match = cleaned.match(/[a-zA-Z0-9]/g);
  if (!match) return '?';
  return match.slice(0, 2).join('').toUpperCase();
});

const avatarColor = computed(() => {
  const id = props.email.sender || '';
  const idx = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
});

const sanitizedHtml = computed(() => {
  if (!props.email.body_html) return '';
  return props.email.body_html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*\/>/gi, '');
});

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<style scoped>
.email-body iframe {
  min-height: 300px;
  border-radius: 0.75rem;
  background: white;
}
</style>
