import { getPresignedDownloadUrl } from '../_lib/s3.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: 'key is required' });

    const url = await getPresignedDownloadUrl(key, key.split('/').pop());
    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
