import * as schedule from 'node-schedule';
import { db } from '../db.js';

export function startCleanupJob(): void {
  // Run every 5 minutes
  schedule.scheduleJob('*/5 * * * *', () => {
    const emailResult = db.prepare(
      "DELETE FROM emails WHERE expires_at < datetime('now')"
    ).run();

    if (emailResult.changes > 0) {
      console.log(`[cleanup] Deleted ${emailResult.changes} expired emails`);
    }

    // Delete orphaned inboxes (no emails, older than 24h)
    const inboxResult = db.prepare(`
      DELETE FROM inboxes
      WHERE id NOT IN (SELECT DISTINCT inbox_id FROM emails)
        AND created_at < datetime('now', '-24 hours')
    `).run();

    if (inboxResult.changes > 0) {
      console.log(`[cleanup] Deleted ${inboxResult.changes} orphaned inboxes`);
    }
  });

  console.log('[cleanup] Scheduled job running every 5 minutes');
}
