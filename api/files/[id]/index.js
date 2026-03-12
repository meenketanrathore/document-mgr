import { getById, deleteById } from '../../_lib/db.js';
import { deleteFromS3 } from '../../_lib/s3.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { id } = req.query;
    const row = await getById(id);
    if (!row) return res.status(404).json({ error: 'File not found' });

    await deleteFromS3(row.s3_key);
    await deleteById(id);

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
