<template>
  <div class="flex min-h-screen">
    <!-- Sidebar (desktop) -->
    <AppSidebar
      :email="currentEmail"
      :domains="domains"
      :show-domain-picker="true"
      :loading="loading"
      :message-count="emails.length"
      @new-address="handleNewAddress"
    />

    <!-- Mobile top bar (replaces sidebar on small screens) -->
    <MobileTopBar
      :email="currentEmail"
      :domains="domains"
      :loading="loading"
      @new-address="handleNewAddress"
    />

    <!-- Main content -->
    <main class="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 md:py-8 md:ml-0">
      <div class="max-w-3xl mx-auto">
        <!-- Error banner -->
        <div
          v-if="error"
          class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between"
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
      </div>
    </main>
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
    await connectSSE();
    await loadEmails();
  } else {
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
