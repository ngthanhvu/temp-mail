<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
      <button
        @click="$emit('back')"
        class="text-sm text-gray-600 hover:text-gray-900 transition-colors mb-2"
      >
        <svg class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to inbox
      </button>
      <h2 class="text-lg font-semibold text-gray-900 truncate">{{ email.subject || '(No subject)' }}</h2>
    </div>

    <!-- Meta -->
    <div class="px-4 py-3 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-900">{{ email.sender_name || email.sender }}</p>
          <p class="text-xs text-gray-500">{{ email.sender }}</p>
        </div>
        <time class="text-xs text-gray-400" :datetime="email.received_at">
          {{ formatDate(email.received_at) }}
        </time>
      </div>
    </div>

    <!-- Attachments -->
    <div v-if="attachments.length" class="px-4 py-3 border-b border-gray-100 bg-amber-50/50">
      <p class="text-xs font-medium text-gray-600 mb-2">
        <svg class="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {{ att.filename }}
          <span class="text-gray-400">({{ formatSize(att.size) }})</span>
        </a>
      </div>
    </div>

    <!-- Body -->
    <div class="px-4 py-4">
      <!-- HTML body -->
      <div
        v-if="email.body_html"
        class="email-body"
      >
        <iframe
          :srcdoc="sanitizedHtml"
          sandbox="allow-same-origin"
          class="w-full min-h-[300px] border-0"
          title="Email content"
        />
      </div>

      <!-- Text body -->
      <div v-else-if="email.body_text" class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
        {{ email.body_text }}
      </div>

      <!-- No body -->
      <div v-else class="text-center py-8 text-gray-400 text-sm">
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

const attachments = computed<Attachment[]>(() => {
  if (!props.email.attachments) return [];
  try {
    return JSON.parse(props.email.attachments);
  } catch {
    return [];
  }
});

// Sanitize HTML: strip script tags as defense-in-depth
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
  border-radius: 0.5rem;
  background: white;
}
</style>
