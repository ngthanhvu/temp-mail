<template>
  <button
    @click="$emit('select', email)"
    class="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-indigo-50 transition-colors cursor-pointer group"
    :class="{ 'bg-blue-50/50': !email.is_read }"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-0.5">
          <span
            class="text-sm truncate"
            :class="email.is_read ? 'text-gray-600 font-normal' : 'text-gray-900 font-semibold'"
          >
            {{ email.sender_name || email.sender }}
          </span>
          <span
            v-if="email.has_attachments"
            class="text-gray-400 flex-shrink-0"
            title="Has attachments"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </span>
        </div>
        <p
          class="text-sm truncate"
          :class="email.is_read ? 'text-gray-500' : 'text-gray-800'"
        >
          {{ email.subject || '(No subject)' }}
        </p>
      </div>
      <time
        class="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5"
        :datetime="email.received_at"
      >
        {{ formatTime(email.received_at) }}
      </time>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { EmailSummary } from '~/composables/useInbox';

defineProps<{
  email: EmailSummary;
}>();

defineEmits<{
  select: [email: EmailSummary];
}>();

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
</script>
