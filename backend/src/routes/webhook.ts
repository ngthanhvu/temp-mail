import { FastifyPluginAsync } from 'fastify';
import { simpleParser } from 'mailparser';
import { db } from '../db.js';
import { sseManager } from '../services/sse.js';

const webhook: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: WebhookBody }>('/api/webhook/email', {
    config: { rateLimit: { max: 200, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const secret = request.headers['x-webhook-secret'] as string | undefined;
      const expectedSecret = process.env.WEBHOOK_SECRET;
      if (!expectedSecret || secret !== expectedSecret) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const body = request.body;
      if (!body?.to || !body?.from || !body?.raw) {
        return reply.code(400).send({ error: 'Missing required fields: to, from, raw' });
      }

      // Parse raw base64 email
      const rawBuffer = Buffer.from(body.raw, 'base64');
      const parsed = await simpleParser(rawBuffer);

      // Parse recipient into local part and domain
      const atIdx = body.to.lastIndexOf('@');
      if (atIdx === -1) {
        return reply.code(400).send({ error: 'Invalid recipient format' });
      }

      const localPart = body.to.substring(0, atIdx);
      const domainName = body.to.substring(atIdx + 1);

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

      // Extract attachments as base64
      const attachments = (parsed.attachments || []).map((a) => ({
        filename: a.filename || 'untitled',
        contentType: a.contentType || 'application/octet-stream',
        size: a.size || 0,
        base64: a.content ? a.content.toString('base64') : null,
      }));

      // Insert email
      db.prepare(
        `INSERT INTO emails (inbox_id, message_id, sender, sender_name, recipient, subject, body_text, body_html, has_attachments, attachments, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        inboxId,
        parsed.messageId || null,
        parsed.from?.text || body.from,
        parsed.from?.value?.[0]?.name || null,
        body.to,
        parsed.subject || '',
        parsed.text || null,
        parsed.html || null,
        attachments.length ? 1 : 0,
        attachments.length ? JSON.stringify(attachments) : null,
        expiresAt
      );

      // Broadcast SSE event to subscribers of this inbox
      sseManager.broadcast(inboxId, { event: 'new_email', inboxId: String(inboxId) });

      return reply.send({ ok: true });
    },
  });
};

interface WebhookBody {
  from: string;
  to: string;
  raw: string; // base64-encoded raw email
}

export default webhook;
