export const PRODUCT_BUCKET = 'products';
export const PRODUCT_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function productImageType(fileType: string) {
  return ALLOWED_TYPES.has(fileType);
}

export function publicObjectUrl(bucket: string, key: string) {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/$/, '');
  if (!endpoint) throw new Error('AWS_ENDPOINT_URL_S3 is not set');
  const path = key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${endpoint}/${bucket}/${path}`;
}

export function storageKeyFromPublicUrl(url: string): string | null {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/$/, '');
  if (!endpoint) return null;

  let parsed: URL;
  let base: URL;
  try {
    parsed = new URL(url);
    base = new URL(endpoint);
  } catch {
    return null;
  }
  if (parsed.origin !== base.origin) return null;

  const prefix = `${base.pathname.replace(/\/$/, '')}/${PRODUCT_BUCKET}/`;
  if (!parsed.pathname.startsWith(prefix)) return null;

  let key: string;
  try {
    key = decodeURIComponent(parsed.pathname.slice(prefix.length));
  } catch {
    return null;
  }
  if (!key || key.split('/').some((part) => !part || part === '.' || part === '..')) return null;
  return key;
}
