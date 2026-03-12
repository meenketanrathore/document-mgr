import { listAll } from '../_lib/db.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  try {
    const files = await listAll();
    return Response.json(files);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
