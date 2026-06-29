import { FastifyPluginAsync } from 'fastify';
import { db } from '../db.js';
import { sseManager } from '../services/sse.js';
import type { Email, EmailSummary } from '../types/email.js';

const emails: FastifyPluginAsync = async (fastify) => {
  // GET /api/inboxes/:address/emails — list emails for an inbox
  fastify.get<{ Params: { address: string } }>('/api/inboxes/:address/emails', async (request, reply) => {
    const address = request.params.address;

    // Find inbox by address (across all domains)
    const inboxRow = db.prepare(
      'SELECT id FROM inboxes WHERE address = ?'
    ).get(address) as { id: number } | undefined;

    if (!inboxRow) {
      return reply.code(404).send({ error: 'Inbox not found' });
    }

    const emailList = db.prepare(`
      SELECT id, sender, sender_name, subject, received_at, is_read, has_attachments
      FROM emails
      WHERE inbox_id = ? AND expires_at > datetime('now')
      ORDER BY received_at DESC
      LIMIT 50
    `).all(inboxRow.id) as EmailSummary[];

    return reply.send(emailList);
  });

  // GET /api/emails/:id — get full email detail + mark as read
  fastify.get<{ Params: { id: string } }>('/api/emails/:id', async (request, reply) => {
    const emailId = parseInt(request.params.id, 10);

    const emailRow = db.prepare(`
      SELECT * FROM emails WHERE id = ? AND expires_at > datetime('now')
    `).get(emailId) as Email | undefined;

    if (!emailRow) {
      return reply.code(404).send({ error: 'Email not found or expired' });
    }

    // Mark as read
    db.prepare('UPDATE emails SET is_read = 1 WHERE id = ?').run(emailId);

    return reply.send(emailRow);
  });

  // GET /api/inboxes/:address/sse — SSE subscription
  fastify.get<{ Params: { address: string } }>('/api/inboxes/:address/sse', async (request, reply) => {
    const address = request.params.address;

    const inboxRow = db.prepare(
      'SELECT id FROM inboxes WHERE address = ?'
    ).get(address) as { id: number } | undefined;

    if (!inboxRow) {
      return reply.code(404).send({ error: 'Inbox not found' });
    }

    // Set SSE headers
    reply.header('Content-Type', 'text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');
    reply.header('X-Accel-Buffering', 'no');

    // Send initial connected event
    const raw = reply.raw;
    raw.write(`data: ${JSON.stringify({ event: 'connected', address })}\n\n`);

    // Subscribe to inbox events
    sseManager.subscribe(inboxRow.id, (data) => {
      raw.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    // Cleanup on disconnect
    request.raw.on('close', () => {
      sseManager.unsubscribe(inboxRow.id);
      raw.end();
    });
  });
};

export default emails;
