import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import webhook from './routes/webhook.js';
import inbox from './routes/inbox.js';
import emails from './routes/emails.js';
import { startCleanupJob } from './services/cleanup.js';

const PORT = parseInt(process.env.PORT || '4000', 10);

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// CORS
await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
});

// Rate limiting
await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: (_request, context) => ({
    error: 'Too many requests',
    limit: context.max,
    retryAfter: Math.ceil((Number(context.after) - Date.now()) / 1000),
  }),
});

// Routes
await app.register(webhook);
await app.register(inbox);
await app.register(emails);

// Health check
app.get('/api/health', async () => ({ status: 'ok', uptime: process.uptime() }));

// Start cleanup scheduler
startCleanupJob();

// Start server
try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[server] Running on http://0.0.0.0:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
