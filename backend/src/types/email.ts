export interface WebhookPayload {
  messageId: string | null;
  sender: string;
  senderName: string | null;
  recipient: string;
  subject: string;
  bodyText: string | null;
  bodyHtml: string | null;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    base64: string | null;
  }> | null;
  receivedAt: string;
  headers: Record<string, string | null>;
}

export interface Email {
  id: number;
  inbox_id: number;
  message_id: string | null;
  sender: string;
  sender_name: string | null;
  recipient: string;
  subject: string;
  body_text: string | null;
  body_html: string | null;
  has_attachments: number;
  attachments: string | null;
  received_at: string;
  expires_at: string;
  is_read: number;
}

export interface EmailSummary {
  id: number;
  sender: string;
  sender_name: string | null;
  subject: string;
  received_at: string;
  is_read: number;
  has_attachments: number;
}

export interface Inbox {
  id: number;
  address: string;
  domain_name: string;
  created_at: string;
  email_count?: number;
}

export interface Domain {
  id: number;
  name: string;
}
