import { listS3Objects } from '../_lib/s3.js';
import { allS3Keys, deleteByS3Key } from '../_lib/db.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  try {
    const s3Keys = new Set(await listS3Objects());
    const dbKeys = new Set(await allS3Keys());

    const orphanedInDb = [...dbKeys].filter((k) => !s3Keys.has(k));
    for (const key of orphanedInDb) {
      await deleteByS3Key(key);
    }

    const orphanedInS3 = [...s3Keys].filter((k) => !dbKeys.has(k));

    return Response.json({
      removedFromDb: orphanedInDb.length,
      orphanedInS3: orphanedInS3.length,
      orphanedS3Keys: orphanedInS3,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
