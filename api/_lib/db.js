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

// --- Transaction helpers ---

export function toTransactionClientFormat(row) {
  return {
    id: row.id,
    type: row.type,
    date: row.date,
    amount: row.amount,
    category: row.category,
    description: row.description,
    payeeVendor: row.payee_vendor,
    paymentMode: row.payment_mode,
    receiptFileId: row.receipt_file_id,
    approvedBy: row.approved_by,
    projectDepartment: row.project_department,
    transactionDetails: row.transaction_details,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listTransactions(filters = {}) {
  const client = getClient();
  let sql = 'SELECT * FROM transactions WHERE 1=1';
  const args = [];

  if (filters.type) {
    sql += ' AND type = ?';
    args.push(filters.type);
  }
  if (filters.category) {
    sql += ' AND category = ?';
    args.push(filters.category);
  }
  if (filters.year) {
    sql += " AND strftime('%Y', date) = ?";
    args.push(String(filters.year));
  }
  if (filters.month) {
    sql += " AND strftime('%m', date) = ?";
    args.push(String(filters.month).padStart(2, '0'));
  }

  sql += ' ORDER BY date DESC, created_at DESC';
  const result = await client.execute({ sql, args });
  return result.rows.map(toTransactionClientFormat);
}

export async function getTransactionById(id) {
  const client = getClient();
  const result = await client.execute({ sql: 'SELECT * FROM transactions WHERE id = ?', args: [id] });
  return result.rows[0] || null;
}

export async function insertTransaction(entry) {
  const client = getClient();
  return client.execute({
    sql: `INSERT INTO transactions (id, type, date, amount, category, description, payee_vendor, payment_mode, receipt_file_id, approved_by, project_department, transaction_details, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      entry.id, entry.type, entry.date, entry.amount, entry.category,
      entry.description, entry.payee_vendor, entry.payment_mode,
      entry.receipt_file_id, entry.approved_by, entry.project_department,
      entry.transaction_details, entry.created_by, entry.created_at, entry.updated_at,
    ],
  });
}

export async function updateTransaction(id, fields) {
  const client = getClient();
  const sets = [];
  const args = [];
  const allowed = ['type', 'date', 'amount', 'category', 'description', 'payee_vendor', 'payment_mode', 'receipt_file_id', 'approved_by', 'project_department', 'transaction_details'];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      args.push(fields[key]);
    }
  }
  if (sets.length === 0) return;

  sets.push('updated_at = ?');
  args.push(new Date().toISOString());
  args.push(id);

  return client.execute({ sql: `UPDATE transactions SET ${sets.join(', ')} WHERE id = ?`, args });
}

export async function deleteTransaction(id) {
  const client = getClient();
  return client.execute({ sql: 'DELETE FROM transactions WHERE id = ?', args: [id] });
}

export async function getTransactionSummary(year) {
  const client = getClient();
  const yearFilter = year ? String(year) : new Date().getFullYear().toString();

  const totals = await client.execute({
    sql: `SELECT type, SUM(amount) as total FROM transactions WHERE strftime('%Y', date) = ? GROUP BY type`,
    args: [yearFilter],
  });

  const monthly = await client.execute({
    sql: `SELECT strftime('%m', date) as month, type, SUM(amount) as total
          FROM transactions WHERE strftime('%Y', date) = ?
          GROUP BY month, type ORDER BY month`,
    args: [yearFilter],
  });

  const byCategory = await client.execute({
    sql: `SELECT category, type, SUM(amount) as total
          FROM transactions WHERE strftime('%Y', date) = ?
          GROUP BY category, type ORDER BY total DESC`,
    args: [yearFilter],
  });

  return {
    totals: totals.rows.map((r) => ({ type: r.type, total: r.total })),
    monthly: monthly.rows.map((r) => ({ month: r.month, type: r.type, total: r.total })),
    byCategory: byCategory.rows.map((r) => ({ category: r.category, type: r.type, total: r.total })),
  };
}
