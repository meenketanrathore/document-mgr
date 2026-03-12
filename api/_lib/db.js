import { createClient } from '@libsql/client';

let _client;

export function getClient() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

export function toClientFormat(row) {
  return {
    id: row.id,
    displayName: row.display_name,
    originalName: row.original_name,
    s3Key: row.s3_key,
    contentType: row.content_type,
    size: row.size,
    uploadedAt: row.uploaded_at,
    uploadedBy: row.uploaded_by,
    lastUpdatedBy: row.last_updated_by,
    lastUpdatedAt: row.last_updated_at,
  };
}

export async function listAll() {
  const client = getClient();
  const result = await client.execute('SELECT * FROM files ORDER BY uploaded_at DESC');
  return result.rows.map(toClientFormat);
}

export async function getById(id) {
  const client = getClient();
  const result = await client.execute({ sql: 'SELECT * FROM files WHERE id = ?', args: [id] });
  return result.rows[0] || null;
}

export async function insertFile(entry) {
  const client = getClient();
  return client.execute({
    sql: `INSERT INTO files (id, display_name, original_name, s3_key, content_type, size, uploaded_at, uploaded_by, last_updated_by, last_updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      entry.id,
      entry.display_name,
      entry.original_name,
      entry.s3_key,
      entry.content_type,
      entry.size,
      entry.uploaded_at,
      entry.uploaded_by,
      entry.last_updated_by,
      entry.last_updated_at,
    ],
  });
}

export async function renameFile(id, displayName, updatedBy) {
  const client = getClient();
  const now = new Date().toISOString();
  return client.execute({
    sql: 'UPDATE files SET display_name = ?, last_updated_by = ?, last_updated_at = ? WHERE id = ?',
    args: [displayName, updatedBy, now, id],
  });
}

export async function deleteById(id) {
  const client = getClient();
  return client.execute({ sql: 'DELETE FROM files WHERE id = ?', args: [id] });
}

export async function deleteByS3Key(s3Key) {
  const client = getClient();
  return client.execute({ sql: 'DELETE FROM files WHERE s3_key = ?', args: [s3Key] });
}

export async function fileCount() {
  const client = getClient();
  const result = await client.execute('SELECT COUNT(*) as cnt FROM files');
  return result.rows[0].cnt;
}

export async function allS3Keys() {
  const client = getClient();
  const result = await client.execute('SELECT s3_key FROM files');
  return result.rows.map((r) => r.s3_key);
}

export async function insertMany(entries) {
  const client = getClient();
  const stmts = entries.map((e) => ({
    sql: `INSERT INTO files (id, display_name, original_name, s3_key, content_type, size, uploaded_at, uploaded_by, last_updated_by, last_updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [e.id, e.display_name, e.original_name, e.s3_key, e.content_type, e.size, e.uploaded_at, e.uploaded_by, e.last_updated_by, e.last_updated_at],
  }));
  return client.batch(stmts);
}
