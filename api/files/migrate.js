import { getLegacyMetadata } from '../_lib/s3.js';
import { fileCount, insertMany } from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const count = await fileCount();
    if (count > 0) {
      return res.status(200).json({ message: `Database already has ${count} files. Skipping migration.` });
    }

    const legacy = await getLegacyMetadata();
    if (!legacy?.files?.length) {
      return res.status(200).json({ message: 'No legacy _metadata.json found in S3.' });
    }

    const entries = legacy.files.map((f) => ({
      id: f.id,
      display_name: f.displayName,
      original_name: f.originalName,
      s3_key: f.s3Key,
      content_type: f.contentType || 'application/octet-stream',
      size: f.size || 0,
      uploaded_at: f.uploadedAt || new Date().toISOString(),
      uploaded_by: f.uploadedBy || 'Unknown',
      last_updated_by: f.lastUpdatedBy || 'Unknown',
      last_updated_at: f.lastUpdatedAt || new Date().toISOString(),
    }));

    await insertMany(entries);
    return res.status(200).json({ message: `Imported ${entries.length} file(s) from _metadata.json.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
