import { ref, onUnmounted } from 'vue';

export interface EmailSummary {
  id: number;
  sender: string;
  sender_name: string | null;
  subject: string;
  received_at: string;
  is_read: number;
  has_attachments: number;
}

export interface FullEmail {
  id: number;
  sender: string;
  sender_name: string | null;
  recipient: string;
  subject: string;
  body_text: string | null;
  body_html: string | null;
  has_attachments: number;
  attachments: string | null;
  received_at: string;
  is_read: number;
}

export interface Domain {
  id: number;
  name: string;
}

export interface Inbox {
  id: number;
  address: string;
  domain_name: string;
  created_at: string;
}

async function apiFetch<T>(path: string, apiBase: string): Promise<T> {
  const res = await fetch(`${apiBase}${path}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }
  return res.json();
}

async function apiPost<T>(path: string, apiBase: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }
  return res.json();
}

export function useInbox() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const currentEmail = ref<string>('');
  const currentAddress = ref<string>('');
  const currentDomain = ref<string>('');
  const emails = ref<EmailSummary[]>([]);
  const selectedEmail = ref<FullEmail | null>(null);
  const emailDetail = ref<FullEmail | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const domains = ref<Domain[]>([]);
  let eventSource: EventSource | null = null;

  // Restore email from localStorage on init
  const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('temp-email') : null;
  if (savedEmail) {
    currentEmail.value = savedEmail;
    const parts = savedEmail.split('@');
    currentAddress.value = parts[0];
    currentDomain.value = parts[1] || '';
  }

  function saveCurrentEmail(email: string) {
    currentEmail.value = email;
    const parts = email.split('@');
    currentAddress.value = parts[0];
    currentDomain.value = parts[1] || '';
    if (typeof window !== 'undefined') {
      localStorage.setItem('temp-email', email);
    }
  }

  async function createInbox(domain?: string) {
    loading.value = true;
    error.value = null;
    try {
      const inbox = await apiPost<Inbox>('/api/inboxes', apiBase, domain ? { domain } : undefined);
      saveCurrentEmail(`${inbox.address}@${inbox.domain_name}`);
      emails.value = [];
      selectedEmail.value = null;
      await connectSSE(inbox.address);
      return inbox;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function loadEmails(address?: string) {
    const addr = address || currentAddress.value;
    if (!addr) return;

    loading.value = true;
    error.value = null;
    try {
      emails.value = await apiFetch<EmailSummary[]>(`/api/inboxes/${addr}/emails`, apiBase);
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function loadEmailDetail(id: number) {
    loading.value = true;
    error.value = null;
    try {
      selectedEmail.value = await apiFetch<FullEmail>(`/api/emails/${id}`, apiBase);
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function loadDomains() {
    try {
      domains.value = await apiFetch<Domain[]>('/api/domains', apiBase);
    } catch {
      domains.value = [];
    }
  }

  async function connectSSE(address?: string) {
    const addr = address || currentAddress.value;
    if (!addr) return;

    // Close existing connection
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource(`${apiBase}/api/inboxes/${addr}/sse`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'new_email') {
        loadEmails(addr);
      }
    };

    eventSource.onerror = () => {
      // Auto-reconnect after 3 seconds
      if (eventSource) {
        eventSource.close();
        setTimeout(() => connectSSE(addr), 3000);
      }
    };
  }

  function closeSSE() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  }

  function clearSelection() {
    selectedEmail.value = null;
  }

  onUnmounted(() => {
    closeSSE();
  });

  return {
    currentEmail,
    currentAddress,
    currentDomain,
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
    closeSSE,
    clearSelection,
    saveCurrentEmail,
  };
}
