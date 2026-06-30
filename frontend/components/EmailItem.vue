<template>
  <button
    @click="$emit('select', email)"
    class="w-full text-left px-5 py-3.5 hover:bg-indigo-50/60 transition-colors cursor-pointer group relative"
    :class="{ 'bg-indigo-50/40': !email.is_read }"
  >
    <span
      v-if="!email.is_read"
      class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-400 to-violet-500 rounded-r-full"
    />
    <div class="flex items-start justify-between gap-3">
      <!-- Avatar + content -->
      <div class="flex gap-3 flex-1 min-w-0">
        <div
          class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
          :class="avatarColor"
        >
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-0.5">
            <span
              class="text-sm truncate"
              :class="email.is_read ? 'text-slate-600 font-normal' : 'text-slate-900 font-semibold'"
            >
              {{ email.sender_name || email.sender }}
            </span>
            <span
              v-if="email.has_attachments"
              class="text-amber-500 flex-shrink-0"
              title="Has attachments"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
            </span>
          </div>
          <p
            class="text-sm truncate"
            :class="email.is_read ? 'text-slate-500' : 'text-slate-700'"
          >
            {{ email.subject || '(No subject)' }}
          </p>
        </div>
      </div>
      <time
        class="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-1 font-medium"
        :datetime="email.received_at"
      >
        {{ formatTime(email.received_at) }}
      </time>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { EmailSummary } from '~/composables/useInbox';

const props = defineProps<{
  email: EmailSummary;
}>();

defineEmits<{
  select: [email: EmailSummary];
}>();

const AVATAR_COLORS = [
  'bg-gradient-to-br from-indigo-500 to-violet-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-sky-500 to-blue-600',
  'bg-gradient-to-br from-fuchsia-500 to-purple-600',
];

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
