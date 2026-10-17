import { ADMIN_EMAILS } from '@/lib/admin-access';
import type { Order } from '@/types';

function orderText(order: Order) {
  const lines = order.items.map(
    (item) =>
      `- ${item.productName}${item.variantName ? ` (${item.variantName})` : ''} × ${item.quantity} — ${item.price.toFixed(3)} TND`,
  );
  return [
    `Nouvelle commande à livrer : ${order.id}`,
    '',
    `${order.customer.fullName}`,
    `Téléphone : ${order.customer.phone}`,
    order.customer.email ? `Email : ${order.customer.email}` : '',
    `${order.customer.address}`,
    `${order.customer.city}, ${order.customer.governorate}`,
    order.customer.deliveryNotes ? `Note : ${order.customer.deliveryNotes}` : '',
    '',
    ...lines,
    '',
    `Livraison : ${order.deliveryFee.toFixed(3)} TND`,
    `Total à encaisser : ${order.total.toFixed(3)} TND`,
    'Paiement à la livraison, pas encore encaissé.',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function sendAdminEmail(subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_FROM_EMAIL;
  if (!apiKey || !from || ADMIN_EMAILS.length === 0) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: ADMIN_EMAILS,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || 'Envoi de la notification impossible.');
  }
  return true;
}

export async function notifyAdminsOfOrder(order: Order) {
  return sendAdminEmail(`Livraison ${order.id} — ${order.customer.fullName}`, orderText(order));
}
