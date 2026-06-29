<template>
  <div>
    <!-- Header -->
    <InboxHeader
      :email="currentEmail"
      :domains="domains"
      :show-domain-picker="true"
      @new-address="handleNewAddress"
    />

    <!-- Main content -->
    <main class="max-w-4xl mx-auto px-4 py-6">
      <!-- Error banner -->
      <div
        v-if="error"
        class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between"
      >
        <span>{{ error }}</span>
        <button @click="error = null" class="text-red-400 hover:text-red-600 ml-4">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Email viewer -->
      <EmailViewer
        v-if="selectedEmail"
        :email="selectedEmail"
        @back="clearSelection"
      />

      <!-- Email list -->
      <EmailList
        v-else
        :emails="emails"
        :loading="loading"
        @select="handleSelectEmail"
        @refresh="handleRefresh"
      />
    </main>

    <!-- Footer -->
    <footer class="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
      Emails are automatically deleted after 1 hour. No registration required.
    </footer>
  </div>
</template>

<script setup lang="ts">
const {
  currentEmail,
  emails,
  selectedEmail,
  loading,
  error,
  domains,
  createInbox,
  loadEmails,
  loadEmailDetail,
  loadDomains,
  connectSSE,
  clearSelection,
} = useInbox();

// Initialize on mount
onMounted(async () => {
  await loadDomains();

  if (currentEmail.value) {
    // Restore existing inbox
    await connectSSE();
    await loadEmails();
  } else {
    // Create new inbox automatically
    await createInbox();
  }
});

async function handleNewAddress() {
  clearSelection();
  await createInbox();
}

async function handleSelectEmail(emailSummary: { id: number }) {
  await loadEmailDetail(emailSummary.id);
}

async function handleRefresh() {
  await loadEmails();
}
</script>
