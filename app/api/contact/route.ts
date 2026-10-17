import { sendAdminEmail } from '@/lib/order-mail';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { isTunisianPhone, normalizePhone, SHOP_EMAIL } from '@/lib/shop-rules';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!rateLimit(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de messages. Réessayez dans quelques minutes.' }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    phone?: string;
    message?: string;
  } | null;
  const name = body?.name?.trim().slice(0, 80) || '';
  const phone = normalizePhone(body?.phone || '');
  const message = body?.message?.trim().slice(0, 1000) || '';
  if (name.length < 2 || message.length < 5 || !isTunisianPhone(phone)) {
    return NextResponse.json({ error: 'Le message est incomplet.' }, { status: 400 });
  }

  try {
    const sent = await sendAdminEmail(
      `Message boutique — ${name}`,
      [`De : ${name}`, `Téléphone : ${phone}`, '', message].join('\n'),
    );
    if (!sent) {
      return NextResponse.json(
        { error: `Le message n’a pas pu être transmis. Écrivez à ${SHOP_EMAIL}.` },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error('Contact email failed', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: `Le message n’a pas pu être transmis. Écrivez à ${SHOP_EMAIL}.` },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
