import type { Discount } from '@/types';

export const SHOP_NAME = 'Charmies by Sousou';
export const SHOP_EMAIL = 'ezzedine.zouiten@gmail.com';
export const SHOP_INSTAGRAM = 'https://www.instagram.com/charmies_by_sousou';
export const STANDARD_DELIVERY_FEE = 7;
export const FREE_DELIVERY_THRESHOLD = 120;

const PROMOS: Pick<Discount, 'code' | 'type' | 'value' | 'minOrderValue' | 'endDate'>[] = [
  { code: 'CHARM10', type: 'percentage', value: 10, minOrderValue: 50, endDate: '2026-11-30' },
  { code: 'BIENVENUE', type: 'fixed', value: 5, minOrderValue: 40, endDate: '2026-12-31' },
];

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('216') && digits.length === 11) return digits.slice(3);
  return digits;
}

export function isTunisianPhone(value: string) {
  return /^\d{8}$/.test(normalizePhone(value));
}

export function deliveryFeeFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return STANDARD_DELIVERY_FEE;
}

export function discountFor(code: string | undefined, subtotal: number) {
  const clean = code?.trim().toUpperCase();
  if (!clean) return 0;
  const promo = PROMOS.find((item) => item.code === clean);
  if (!promo) return 0;
  const today = new Date().toISOString().slice(0, 10);
  if (today > promo.endDate) return 0;
  if (promo.minOrderValue && subtotal < promo.minOrderValue) return 0;
  if (promo.type === 'percentage') return Math.round(((subtotal * promo.value) / 100) * 1000) / 1000;
  return Math.min(promo.value, subtotal);
}
