export type CategoryId = 'necklaces' | 'bracelets' | 'earrings' | 'rings' | 'sets' | 'accessories';

export interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Doré", "Argenté", "Taille 52", "Noir & Blanc"
  type: 'color' | 'size' | 'style';
  inStock: boolean;
  sku?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  city?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: CategoryId;
  price: number; // In TND (Tunisian Dinars)
  originalPrice?: number; // For sale items
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  stock: number;
  lowStockThreshold: number;
  shortDescription: string;
  fullDescription: string;
  material: string;
  dimensions?: string;
  careInstructions?: string;
  images: string[];
  variants?: ProductVariant[];
  reviews: Review[];
  rating: number;
  published: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (product.id + variant)
  productId: string;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'pending_cod' // Cash on Delivery pending receipt
  | 'collected'   // Cash collected upon delivery
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  price: number;
  quantity: number;
  variantName?: string;
}

export interface CustomerAddress {
  fullName: string;
  phone: string;
  email?: string;
  governorate: string; // One of 24 Tunisian Governorates
  city: string;        // Delegation / Ville
  address: string;     // Street address
  deliveryNotes?: string;
}

export interface Order {
  id: string;          // e.g. "CHM-8492"
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  paymentMethod: 'cash_on_delivery';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  customer: CustomerAddress;
  internalNotes?: string;
  trackingTimeline: {
    status: OrderStatus;
    label: string;
    date: string;
    completed: boolean;
    description: string;
  }[];
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  governorate: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  notes?: string;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10% or 5 for 5 TND
  minOrderValue?: number;
  usageCount: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  instagramHandle: string;
  address: string;
  currency: string; // TND
  standardDeliveryFee: number; // 7 TND
  freeDeliveryThreshold: number; // 120 TND
  estimatedDeliveryDays: string; // "24 à 48 heures"
  announcementText: string;
  announcementActive: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'sale' | 'restock' | 'adjustment';
  quantityDelta: number;
  resultingStock: number;
  date: string;
  reason: string;
}

export type StoreView =
  | 'home'
  | 'shop'
  | 'category'
  | 'product_detail'
  | 'cart'
  | 'checkout'
  | 'order_confirmation'
  | 'track_order'
  | 'account'
  | 'contact'
  | 'policy_delivery'
  | 'policy_returns'
  | 'policy_privacy'
  | 'policy_terms'
  | 'search'
  | 'new_arrivals'
  | 'bestsellers'
  | 'wishlist';

export type AdminView =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'inventory'
  | 'customers'
  | 'discounts'
  | 'reports'
  | 'settings';
