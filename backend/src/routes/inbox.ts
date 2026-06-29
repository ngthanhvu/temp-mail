import { FastifyPluginAsync } from 'fastify';
import { db } from '../db.js';
import { nanoid } from 'nanoid';
import type { Inbox, Domain } from '../types/email.js';

const inbox: FastifyPluginAsync = async (fastify) => {
  // GET /api/domains — list available domains
  fastify.get('/api/domains', async (_request, reply) => {
    const domains = db.prepare('SELECT id, name FROM domains ORDER BY name').all() as Domain[];
    return reply.send(domains);
  });

  // GET /api/inboxes — list all active inboxes
  fastify.get('/api/inboxes', async (_request, reply) => {
    const inboxes = db.prepare(`
      SELECT i.id, i.address, d.name as domain_name, i.created_at,
             COUNT(e.id) as email_count
      FROM inboxes i
      JOIN domains d ON i.domain_id = d.id
      LEFT JOIN emails e ON e.inbox_id = i.id AND e.expires_at > datetime('now')
      GROUP BY i.id
      ORDER BY i.created_at DESC
      LIMIT 100
    `).all() as Inbox[];
    return reply.send(inboxes);
  });

  // POST /api/inboxes — create a new random inbox
  fastify.post<{ Body: { domain?: string } }>('/api/inboxes', async (request, reply) => {
    const { domain: requestedDomain } = request.body || {};

    // Pick domain: requested, random, or first available
    let domainRow: Domain | undefined;
    if (requestedDomain) {
      domainRow = db.prepare(
        'SELECT id, name FROM domains WHERE name = ?'
      ).get(requestedDomain) as Domain | undefined;
      if (!domainRow) {
        return reply.code(400).send({ error: `Domain not found: ${requestedDomain}` });
      }
    } else {
      const allDomains = db.prepare('SELECT id, name FROM domains').all() as Domain[];
      if (allDomains.length === 0) {
        return reply.code(500).send({ error: 'No domains configured' });
      }
      domainRow = allDomains[Math.floor(Math.random() * allDomains.length)];
    }

    // Generate unique address
    let address = '';
    let existing = true;
    while (existing) {
      address = nanoid(10);
      const count = db.prepare(
        'SELECT COUNT(*) as count FROM inboxes WHERE address = ? AND domain_id = ?'
      ).get(address, domainRow!.id) as { count: number };
      existing = count.count > 0;
    }

    const result = db.prepare(
      'INSERT INTO inboxes (address, domain_id) VALUES (?, ?)'
    ).run(address, domainRow.id);

    const newInbox = db.prepare(`
      SELECT i.id, i.address, d.name as domain_name, i.created_at
      FROM inboxes i
      JOIN domains d ON i.domain_id = d.id
      WHERE i.id = ?
    `).get(result.lastInsertRowid as number) as Inbox | undefined;

    return reply.code(201).send(newInbox);
  });
};

export default inbox;
