import { FastifyPluginAsync } from 'fastify';
import { db } from '../db.js';
import { sseManager } from '../services/sse.js';
import type { WebhookPayload } from '../types/email.js';

const webhook: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: WebhookPayload }>('/api/webhook/email', {
    config: { rateLimit: { max: 200, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const secret = request.headers['x-webhook-secret'] as string | undefined;
      const expectedSecret = process.env.WEBHOOK_SECRET;
      if (!expectedSecret || secret !== expectedSecret) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const body = request.body;
      if (!body?.recipient || !body?.sender) {
        return reply.code(400).send({ error: 'Missing required fields: recipient, sender' });
      }

      // Parse recipient into local part and domain
      const atIdx = body.recipient.lastIndexOf('@');
      if (atIdx === -1) {
        return reply.code(400).send({ error: 'Invalid recipient format' });
      }

      const localPart = body.recipient.substring(0, atIdx);
      const domainName = body.recipient.substring(atIdx + 1);

      // Look up domain
      const domain = db.prepare(
        'SELECT id FROM domains WHERE name = ?'
      ).get(domainName) as { id: number } | undefined;

      if (!domain) {
        return reply.code(400).send({ error: `Unknown domain: ${domainName}` });
      }

      // Upsert inbox (create if not exists)
      const existingInbox = db.prepare(
        'SELECT id FROM inboxes WHERE address = ? AND domain_id = ?'
      ).get(localPart, domain.id) as { id: number } | undefined;

      let inboxId: number;
      if (existingInbox) {
        inboxId = existingInbox.id;
      } else {
        const result = db.prepare(
          'INSERT INTO inboxes (address, domain_id) VALUES (?, ?)'
        ).run(localPart, domain.id);
        inboxId = result.lastInsertRowid as number;
      }

      // Email expires after 1 hour
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      // Insert email
      db.prepare(
        `INSERT INTO emails (inbox_id, message_id, sender, sender_name, recipient, subject, body_text, body_html, has_attachments, attachments, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        inboxId,
        body.messageId,
        body.sender,
        body.senderName,
        body.recipient,
        body.subject || '',
        body.bodyText,
        body.bodyHtml,
        body.attachments?.length ? 1 : 0,
        body.attachments ? JSON.stringify(body.attachments) : null,
        expiresAt
      );

      // Broadcast SSE event to subscribers of this inbox
      sseManager.broadcast(inboxId, { event: 'new_email', inboxId: String(inboxId) });

      return reply.send({ ok: true });
    },
  });
};

export default webhook;
