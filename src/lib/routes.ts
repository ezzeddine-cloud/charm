import { AdminView, Category, CategoryId, Product, StoreView } from '@/types';

export const ADMIN_PATHS: Record<AdminView, string> = {
  dashboard: '/admin',
  products: '/admin/produits',
  categories: '/admin/categories',
  orders: '/admin/commandes',
  inventory: '/admin/stocks',
  customers: '/admin/clientes',
  discounts: '/admin/promotions',
  reports: '/admin/rapports',
  settings: '/admin/parametres',
};

export function storePath(
  view: StoreView,
  options: { categoryId?: CategoryId; productId?: string; orderRef?: string } | undefined,
  categories: Category[],
  products: Product[],
): string {
  switch (view) {
    case 'home':
      return '/';
    case 'shop':
      return '/boutique';
    case 'category': {
      const category = categories.find((item) => item.id === options?.categoryId);
      return category ? `/boutique/${category.slug}` : '/boutique';
    }
    case 'product_detail': {
      const product = products.find((item) => item.id === options?.productId);
      return product ? `/produit/${product.slug}` : '/boutique';
    }
    case 'cart':
      return '/panier';
    case 'checkout':
      return '/commande';
    case 'order_confirmation':
      return options?.orderRef
        ? `/confirmation?ref=${encodeURIComponent(options.orderRef)}`
        : '/confirmation';
    case 'track_order':
      return options?.orderRef ? `/suivi?ref=${encodeURIComponent(options.orderRef)}` : '/suivi';
    case 'account':
      return '/compte';
    case 'contact':
      return '/contact';
    case 'policy_delivery':
      return '/livraison';
    case 'policy_returns':
      return '/retours';
    case 'policy_privacy':
      return '/confidentialite';
    case 'policy_terms':
      return '/conditions';
    case 'search':
      return '/recherche';
    case 'new_arrivals':
      return '/nouveautes';
    case 'bestsellers':
      return '/meilleures-ventes';
    case 'wishlist':
      return '/coups-de-coeur';
    default:
      return '/';
  }
}
