import { auth } from '@/lib/auth/server';
import { recordStoredFile } from '@/lib/db';
import { productImageType } from '@/lib/product-images';
import { Files } from 'files-sdk';
import { neon as neonStorage } from 'files-sdk/neon';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BUCKET = 'assets';

export async function POST(request: Request) {
  const { data: session } = await auth.getSession({ query: {} });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
  }
  if (!productImageType(file.type)) {
    return NextResponse.json({ error: 'Formats acceptés : JPG, PNG ou WebP.' }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (4 Mo maximum).' }, { status: 400 });
  }

  const extension = (file.name.split('.').pop() || 'bin').replace(/[^a-zA-Z0-9]/g, '') || 'bin';
  const key = `avatars/${session.user.id}/${randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const files = new Files({ adapter: neonStorage({ bucket: BUCKET }) });
  await files.upload(key, bytes, { contentType: file.type || 'application/octet-stream' });
  const url = await files.url(key, { expiresIn: 3600 });
  const id = randomUUID();
  await recordStoredFile({
    id,
    userId: session.user.id,
    objectKey: key,
    contentType: file.type || 'application/octet-stream',
  });

  return NextResponse.json({
    id,
    key,
    url,
    contentType: file.type || 'application/octet-stream',
  });
}
