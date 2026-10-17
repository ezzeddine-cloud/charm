import { TUNISIAN_GOVERNORATES } from '@/data/mockData';
import { deliveryFeeFor, discountFor, isTunisianPhone, normalizePhone } from '@/lib/shop-rules';
import type { CustomerAddress, Order, OrderItem, Product } from '@/types';
import { randomInt } from 'crypto';

export class OrderInputError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type CheckoutItem = {
  productId?: string;
  quantity?: number;
  variantName?: string;
};

type CheckoutBody = {
  items?: CheckoutItem[];
  customer?: Partial<CustomerAddress>;
  promoCode?: string;
  acceptTerms?: boolean;
};

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function newOrderId() {
  return `CHM-${randomInt(100000, 999999)}`;
}

export function buildTrustedOrder(body: CheckoutBody, products: Product[]): Order {
  if (body.acceptTerms !== true) {
    throw new OrderInputError('Les conditions générales doivent être acceptées.');
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length < 1 || items.length > 12) {
    throw new OrderInputError('La commande doit contenir entre 1 et 12 articles.');
  }

  const customerInput = body.customer ?? {};
  const fullName = clean(customerInput.fullName, 80);
  const phone = normalizePhone(clean(customerInput.phone, 20));
  const email = clean(customerInput.email, 120);
  const governorate = clean(customerInput.governorate, 40);
  const city = clean(customerInput.city, 80);
  const address = clean(customerInput.address, 180);
  const deliveryNotes = clean(customerInput.deliveryNotes, 240);

  if (fullName.length < 3 || city.length < 2 || address.length < 5) {
    throw new OrderInputError('Les coordonnées de livraison sont incomplètes.');
  }
  if (!isTunisianPhone(phone)) {
    throw new OrderInputError('Le téléphone doit comporter 8 chiffres.');
  }
  if (!TUNISIAN_GOVERNORATES.includes(governorate)) {
    throw new OrderInputError('Le gouvernorat n’est pas reconnu.');
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new OrderInputError('L’adresse e-mail n’est pas valable.');
  }

  const orderItems: OrderItem[] = [];
  for (const item of items) {
    const productId = clean(item.productId, 80);
    const quantity = Number(item.quantity);
    const product = products.find((entry) => entry.id === productId && entry.published);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
      throw new OrderInputError('Un article de la commande n’est pas disponible.');
    }
    if (product.stock < quantity) {
      throw new OrderInputError(`${product.name} n’est plus disponible dans cette quantité.`, 409);
    }
    const variantName = clean(item.variantName, 80);
    if (variantName) {
      const variant = product.variants?.find((entry) => entry.name === variantName);
      if (!variant || !variant.inStock) {
        throw new OrderInputError(`La variante « ${variantName} » n’est pas disponible.`);
      }
    }
    orderItems.push({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] || '',
      sku: product.sku,
      price: Number(product.price),
      quantity,
      variantName: variantName || undefined,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discountFor(body.promoCode, subtotal);
  const deliveryFee = deliveryFeeFor(subtotal);
  const total = Math.max(0, Math.round((subtotal - discountAmount + deliveryFee) * 1000) / 1000);
  const now = new Date();
  const formattedDate = `${now.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })} à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

  const customer: CustomerAddress = {
    fullName,
    phone,
    email: email || undefined,
    governorate,
    city,
    address,
    deliveryNotes: deliveryNotes || undefined,
  };

  return {
    id: newOrderId(),
    createdAt: formattedDate,
    items: orderItems,
    subtotal,
    deliveryFee,
    discountAmount,
    total,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_cod',
    orderStatus: 'pending_confirmation',
    customer,
    internalNotes: 'Commande enregistrée depuis la boutique.',
    trackingTimeline: [
      {
        status: 'pending_confirmation',
        label: 'Commande enregistrée',
        date: formattedDate,
        completed: true,
        description: 'Nous avons bien reçu votre commande. Notre équipe vous appellera sous peu.',
      },
      {
        status: 'confirmed',
        label: 'Confirmation téléphonique',
        date: 'En attente',
        completed: false,
        description: 'Confirmation de l’adresse et de la disponibilité.',
      },
      {
        status: 'preparing',
        label: 'Préparation',
        date: 'À venir',
        completed: false,
        description: 'Préparation du colis.',
      },
      {
        status: 'shipped',
        label: 'Expédition',
        date: 'À venir',
        completed: false,
        description: 'Acheminement vers votre gouvernorat.',
      },
      {
        status: 'delivered',
        label: 'Livraison et paiement',
        date: 'À venir',
        completed: false,
        description: 'Règlement en espèces à la remise du colis.',
      },
    ],
  };
}

export function customerOrder(order: Order): Order {
  const copy = { ...order };
  delete copy.internalNotes;
  return copy;
}
