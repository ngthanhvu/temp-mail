import PostalMime from 'postal-mime';

interface Env {
  WEBHOOK_URL: string;
  WEBHOOK_SECRET: string;
}

export default {
  async email(
    message: ForwardableEmailMessage,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    try {
      // Parse raw MIME email
      const parsed = await PostalMime.parse(message.raw);

      // Build payload — only essential fields, no trace headers
      const attachments = (parsed.attachments || []).map((a) => ({
        filename: a.filename || 'untitled',
        contentType: a.mimeType || 'application/octet-stream',
        size: a.size || 0,
        base64: a.content
          ? btoa(String.fromCharCode(...new Uint8Array(a.content)))
          : null,
      }));

      const payload = {
        messageId: parsed.messageId || null,
        sender: parsed.from?.address || message.from,
        senderName: parsed.from?.name || null,
        recipient: message.to,
        subject: parsed.subject || '',
        bodyText: parsed.text || null,
        bodyHtml: parsed.html || null,
        attachments,
        receivedAt: new Date().toISOString(),
        headers: {
          'message-id': parsed.messageId || null,
          'reply-to':
            parsed.headers?.find((h) => h.key === 'reply-to')?.value || null,
        },
      };

      // Forward to backend webhook
      const response = await fetch(env.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': env.WEBHOOK_SECRET,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error(
          `Webhook failed: ${response.status} ${response.statusText} — ${body}`
        );
      }
    } catch (err) {
      console.error('Error processing email:', err);
    }
  },
};
