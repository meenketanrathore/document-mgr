import { uploadToS3 } from '../_lib/s3.js';
import { insertFile, toClientFormat } from '../_lib/db.js';

export const config = { runtime: 'edge' };

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 200);
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const displayName = formData.get('displayName');
    const userName = formData.get('userName') || 'Unknown';

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!displayName?.trim()) {
      return Response.json({ error: 'Display name required' }, { status: 400 });
    }

    const safeName = sanitizeFilename(file.name);
    const s3Key = `uploads/${Date.now()}_${safeName}`;
    const buffer = await file.arrayBuffer();

    await uploadToS3(s3Key, buffer, file.type || 'application/octet-stream');

    const now = new Date().toISOString();
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      display_name: displayName.trim(),
      original_name: file.name,
      s3_key: s3Key,
      content_type: file.type || 'application/octet-stream',
      size: file.size,
      uploaded_at: now,
      uploaded_by: userName,
      last_updated_by: userName,
      last_updated_at: now,
    };

    await insertFile(entry);
    return Response.json(toClientFormat(entry), { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
