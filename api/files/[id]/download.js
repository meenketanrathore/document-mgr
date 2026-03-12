import { getById, toClientFormat } from '../../_lib/db.js';
import { getPresignedDownloadUrl } from '../../_lib/s3.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').at(-2);

    const row = await getById(id);
    if (!row) return Response.json({ error: 'File not found' }, { status: 404 });

    const downloadUrl = await getPresignedDownloadUrl(row.s3_key, row.original_name);
    return Response.json({ url: downloadUrl });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
