import { getById, renameFile, toClientFormat } from '../../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { id } = req.query;
    const { newName, userName } = req.body;
    if (!newName?.trim()) return res.status(400).json({ error: 'New name required' });

    const existing = await getById(id);
    if (!existing) return res.status(404).json({ error: 'File not found' });

    await renameFile(id, newName.trim(), userName || 'Unknown');
    const updated = await getById(id);
    return res.status(200).json(toClientFormat(updated));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
