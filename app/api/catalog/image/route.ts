import { recordStoredFile } from '@/lib/db';
import { requireAdmin } from '@/lib/require-admin';
import { PRODUCT_BUCKET, PRODUCT_IMAGE_MAX_BYTES, productImageType, publicObjectUrl } from '@/lib/product-images';
import { Files } from 'files-sdk';
import { neon as neonStorage } from 'files-sdk/neon';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Accès admin requis.' }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Choisissez une photo.' }, { status: 400 });
  }
  if (!productImageType(file.type)) {
    return NextResponse.json({ error: 'Formats acceptés : JPG, PNG ou WebP.' }, { status: 400 });
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return NextResponse.json({ error: 'Photo trop lourde. Maximum 4 Mo (4 096 Ko).' }, { status: 400 });
  }

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const folder = form.get('kind') === 'category' ? 'categories' : 'bijoux';
  const key = `${folder}/${randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const files = new Files({ adapter: neonStorage({ bucket: PRODUCT_BUCKET }) });
  await files.upload(key, bytes, {
    contentType: file.type,
    cacheControl: 'public, max-age=31536000, immutable',
  });

  const id = randomUUID();
  await recordStoredFile({
    id,
    userId: admin.id,
    objectKey: `${PRODUCT_BUCKET}/${key}`,
    contentType: file.type,
  });

  return NextResponse.json({
    id,
    key,
    url: publicObjectUrl(PRODUCT_BUCKET, key),
    bytes: file.size,
  });
}
