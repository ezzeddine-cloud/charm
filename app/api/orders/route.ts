import { auth } from '@/lib/auth/server';
import {
  getOrderRecord,
  insertOrder,
  listAllOrders,
  listOrdersForUser,
  listProducts,
  saveOrder,
} from '@/lib/db';
import { notifyAdminsOfOrder } from '@/lib/order-mail';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { requireAdmin } from '@/lib/require-admin';
import { normalizePhone } from '@/lib/shop-rules';
import { buildTrustedOrder, customerOrder, OrderInputError } from '@/lib/trusted-order';
import type { OrderStatus, PaymentStatus } from '@/types';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ORDER_STATUSES: OrderStatus[] = [
  'pending_confirmation',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
];
const PAYMENT_STATUSES: PaymentStatus[] = ['pending_cod', 'collected', 'cancelled'];

function phonesMatch(left: string, right: string) {
  return normalizePhone(left) === normalizePhone(right) && normalizePhone(left).length === 8;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get('reference')?.trim().slice(0, 40) || '';
  const ip = clientIp(request);
  if (!rateLimit(`orders-read:${ip}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de demandes. Réessayez dans quelques minutes.' }, { status: 429 });
  }

  if (reference) {
    const record = await getOrderRecord(reference);
    if (!record) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    const { data: session } = await auth.getSession({ query: {} });
    const owns = Boolean(session?.user?.id && session.user.id === record.userId);
    const phone = url.searchParams.get('phone') || '';
    const phoneOk = phonesMatch(phone, record.order.customer.phone);
    const admin = await requireAdmin();
    if (!owns && !phoneOk && !admin) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }
    return NextResponse.json(admin && !owns ? record.order : customerOrder(record.order));
  }

  if (url.searchParams.get('scope') === 'admin') {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Accès admin requis.' }, { status: 401 });
    return NextResponse.json(await listAllOrders());
  }

  const { data: session } = await auth.getSession({ query: {} });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const orders = await listOrdersForUser(session.user.id);
  return NextResponse.json(orders.map(customerOrder));
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`orders-write:${ip}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de commandes. Réessayez dans quelques minutes.' }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as Parameters<typeof buildTrustedOrder>[0] | null;
  if (!body) return NextResponse.json({ error: 'Commande incomplète' }, { status: 400 });

  let order;
  try {
    order = buildTrustedOrder(body, await listProducts());
  } catch (error) {
    if (error instanceof OrderInputError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const { data: session } = await auth.getSession({ query: {} });
  try {
    await insertOrder(order, session?.user?.id ?? null);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'STOCK') {
      return NextResponse.json({ error: 'Un article vient d’être épuisé. Vérifiez le panier.' }, { status: 409 });
    }
    const status = /duplicate key/i.test(message) ? 409 : 500;
    return NextResponse.json({ error: 'La commande n’a pas pu être enregistrée.' }, { status });
  }

  let notified = false;
  try {
    notified = await notifyAdminsOfOrder(order);
  } catch (error) {
    console.error('Admin order email failed', error instanceof Error ? error.message : error);
  }

  return NextResponse.json({ ...customerOrder(order), notified });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Accès admin requis.' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    internalNotes?: string;
  } | null;
  if (!body?.id) return NextResponse.json({ error: 'Commande manquante.' }, { status: 400 });

  const record = await getOrderRecord(body.id);
  if (!record) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  const order = record.order;
  if (body.orderStatus) {
    if (!ORDER_STATUSES.includes(body.orderStatus)) {
      return NextResponse.json({ error: 'Statut inconnu.' }, { status: 400 });
    }
    order.orderStatus = body.orderStatus;
    const stamp = new Date().toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
    order.trackingTimeline = order.trackingTimeline.map((step) =>
      step.status === body.orderStatus ? { ...step, completed: true, date: stamp } : step,
    );
  }
  if (body.paymentStatus) {
    if (!PAYMENT_STATUSES.includes(body.paymentStatus)) {
      return NextResponse.json({ error: 'Paiement inconnu.' }, { status: 400 });
    }
    order.paymentStatus = body.paymentStatus;
  }
  if (typeof body.internalNotes === 'string') {
    order.internalNotes = body.internalNotes.slice(0, 500);
  }

  await saveOrder(order);
  return NextResponse.json(order);
}
