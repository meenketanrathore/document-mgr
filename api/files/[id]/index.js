import { getById, deleteById } from '../../_lib/db.js';
import { deleteFromS3 } from '../../_lib/s3.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'DELETE') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').at(-1);

    const row = await getById(id);
    if (!row) return Response.json({ error: 'File not found' }, { status: 404 });

    await deleteFromS3(row.s3_key);
    await deleteById(id);

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
