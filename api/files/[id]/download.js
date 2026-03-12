import { getById, toClientFormat } from '../../_lib/db.js';
import { getPresignedDownloadUrl } from '../../_lib/s3.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { id } = req.query;
    const row = await getById(id);
    if (!row) return res.status(404).json({ error: 'File not found' });

    const url = await getPresignedDownloadUrl(row.s3_key, row.original_name);
    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
