import { getById, renameFile, toClientFormat } from '../../_lib/db.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'PATCH') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').at(-2);

    const { newName, userName } = await request.json();
    if (!newName?.trim()) return Response.json({ error: 'New name required' }, { status: 400 });

    const existing = await getById(id);
    if (!existing) return Response.json({ error: 'File not found' }, { status: 404 });

    await renameFile(id, newName.trim(), userName || 'Unknown');
    const updated = await getById(id);
    return Response.json(toClientFormat(updated));
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
