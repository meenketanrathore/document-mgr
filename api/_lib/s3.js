import { AwsClient } from 'aws4fetch';

function getClient() {
  return new AwsClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-southeast-2',
  });
}

function bucketUrl() {
  const region = process.env.AWS_REGION || 'ap-southeast-2';
  const bucket = process.env.S3_BUCKET_NAME || 'bandhanam-doc';
  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

export async function uploadToS3(key, body, contentType) {
  const aws = getClient();
  const url = `${bucketUrl()}/${key}`;
  const res = await aws.fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body,
  });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
}

export async function deleteFromS3(key) {
  const aws = getClient();
  const url = `${bucketUrl()}/${key}`;
  const res = await aws.fetch(url, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error(`S3 delete failed: ${res.status}`);
}

export async function getPresignedDownloadUrl(key, fileName) {
  const aws = getClient();
  const url = new URL(`${bucketUrl()}/${key}`);
  url.searchParams.set('X-Amz-Expires', '300');
  url.searchParams.set('response-content-disposition', `attachment; filename="${fileName}"`);

  const signed = await aws.sign(new Request(url), { aws: { signQuery: true } });
  return signed.url;
}

export async function listS3Objects(prefix = 'uploads/') {
  const aws = getClient();
  const objects = [];
  let continuationToken;

  do {
    const url = new URL(bucketUrl());
    url.searchParams.set('list-type', '2');
    url.searchParams.set('prefix', prefix);
    if (continuationToken) url.searchParams.set('continuation-token', continuationToken);

    const res = await aws.fetch(url);
    if (!res.ok) throw new Error(`S3 list failed: ${res.status}`);

    const text = await res.text();
    const keys = [...text.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => m[1]);
    objects.push(...keys);

    const truncated = text.includes('<IsTruncated>true</IsTruncated>');
    const tokenMatch = text.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/);
    continuationToken = truncated && tokenMatch ? tokenMatch[1] : undefined;
  } while (continuationToken);

  return objects;
}

export async function getLegacyMetadata() {
  const aws = getClient();
  const url = `${bucketUrl()}/_metadata.json`;
  const res = await aws.fetch(url);
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`S3 metadata fetch failed: ${res.status}`);
  return res.json();
}
