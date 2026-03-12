import { listAll } from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const files = await listAll();
    return res.status(200).json(files);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
