import Database, { type Database as DB } from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'tempmail.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
mkdirSync(join(__dirname, '..', 'data'), { recursive: true });

export const db: DB = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS domains (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS inboxes (
    id         INTEGER PRIMARY KEY,
    address    TEXT NOT NULL,
    domain_id  INTEGER REFERENCES domains(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT,
    UNIQUE(address, domain_id)
  );

  CREATE TABLE IF NOT EXISTS emails (
    id            INTEGER PRIMARY KEY,
    inbox_id      INTEGER REFERENCES inboxes(id) ON DELETE CASCADE,
    message_id    TEXT,
    sender        TEXT NOT NULL,
    sender_name   TEXT,
    recipient     TEXT NOT NULL,
    subject       TEXT DEFAULT '',
    body_text     TEXT,
    body_html     TEXT,
    has_attachments INTEGER DEFAULT 0,
    attachments   TEXT,
    received_at   TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at    TEXT NOT NULL,
    is_read       INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_emails_inbox ON emails(inbox_id);
  CREATE INDEX IF NOT EXISTS idx_emails_expires ON emails(expires_at);
  CREATE INDEX IF NOT EXISTS idx_inboxes_domain ON inboxes(domain_id);
`);

// Seed default placeholder domains — user replaces these with real ones
const defaultDomains = ['tempmail.example.com', 'mail.example.org'];
const insertDomain = db.prepare('INSERT OR IGNORE INTO domains (name) VALUES (?)');

for (const domain of defaultDomains) {
  insertDomain.run(domain);
}

export function seedDomain(domainName: string): void {
  insertDomain.run(domainName);
}
