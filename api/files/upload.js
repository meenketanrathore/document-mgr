import formidable from 'formidable';
import { readFile } from 'fs/promises';
import { uploadToS3 } from '../_lib/s3.js';
import { insertFile, toClientFormat } from '../_lib/db.js';

export const config = { api: { bodyParser: false } };

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 200);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const form = formidable({ maxFileSize: 50 * 1024 * 1024 });
    const [fields, files] = await form.parse(req);

    const file = files.file?.[0];
    const displayName = fields.displayName?.[0];
    const userName = fields.userName?.[0] || 'Unknown';

    if (!file) return res.status(400).json({ error: 'No file provided' });
    if (!displayName?.trim()) return res.status(400).json({ error: 'Display name required' });

    const buffer = await readFile(file.filepath);
    const safeName = sanitizeFilename(file.originalFilename || 'file');
    const s3Key = `uploads/${Date.now()}_${safeName}`;

    await uploadToS3(s3Key, buffer, file.mimetype || 'application/octet-stream');

    const now = new Date().toISOString();
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      display_name: displayName.trim(),
      original_name: file.originalFilename || 'file',
      s3_key: s3Key,
      content_type: file.mimetype || 'application/octet-stream',
      size: file.size,
      uploaded_at: now,
      uploaded_by: userName,
      last_updated_by: userName,
      last_updated_at: now,
    };

    await insertFile(entry);
    return res.status(201).json(toClientFormat(entry));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
