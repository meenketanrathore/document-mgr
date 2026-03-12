import formidable from 'formidable';
import { readFile } from 'fs/promises';
import { uploadToS3 } from '../_lib/s3.js';

export const config = { api: { bodyParser: false } };

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 200);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const form = formidable({ maxFileSize: 20 * 1024 * 1024 });
    const [, files] = await form.parse(req);

    const file = files.file?.[0];
    if (!file) return res.status(400).json({ error: 'No file provided' });

    const buffer = await readFile(file.filepath);
    const safeName = sanitizeFilename(file.originalFilename || 'receipt');
    const s3Key = `receipts/${Date.now()}_${safeName}`;

    await uploadToS3(s3Key, buffer, file.mimetype || 'application/octet-stream');

    return res.status(201).json({
      s3Key,
      originalName: file.originalFilename,
      contentType: file.mimetype,
      size: file.size,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
