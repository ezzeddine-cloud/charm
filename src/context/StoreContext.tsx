'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ADMIN_PATHS, storePath } from '@/lib/routes';
import {
  Category,
  CategoryId,
  Product,
  ProductVariant,
  CartItem,
  Order,
  OrderStatus,
  PaymentStatus,
  Customer,
  CustomerAddress,
  Discount,
  StoreSettings,
  InventoryMovement,
  StoreView,
  AdminView,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_DISCOUNTS,
  INITIAL_SETTINGS,
  INITIAL_INVENTORY_LOGS,
} from '../data/mockData';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  // Navigation
  mode: 'store' | 'admin';
  setMode: (mode: 'store' | 'admin') => void;
  storeView: StoreView;
  setStoreView: (view: StoreView) => void;
  adminView: AdminView;
  setAdminView: (view: AdminView) => void;
  selectedCategoryId: CategoryId | null;
  selectedProductId: string | null;
  selectedOrderRef: string | null;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  navigateTo: (
    view: StoreView,
    options?: { categoryId?: CategoryId; productId?: string; orderRef?: string }
  ) => void;
  navigateToAdmin: (view: AdminView) => void;

  // Products & Categories
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  adjustStock: (productId: string, delta: number, reason: string) => void;
  addCategory: (cat: Omit<Category, 'id' | 'itemCount'>) => Promise<boolean>;
  updateCategory: (id: CategoryId, cat: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: CategoryId) => Promise<boolean>;

  // Cart
  cart: CartItem[];
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => boolean;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  finalTotal: number;
  appliedDiscount: Discount | null;
  applyDiscountCode: (code: string) => { success: boolean; message: string };
  removeDiscount: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders
  orders: Order[];
  createOrder: (customer: CustomerAddress) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;
  findOrder: (query: string) => Order | undefined;
  hydrated: boolean;
  recentIds: string[];
  recordRecent: (productId: string) => void;

  // Customers & Discounts & Inventory
  customers: Customer[];
  discounts: Discount[];
  addDiscount: (discount: Omit<Discount, 'id' | 'usageCount'>) => void;
  toggleDiscountActive: (id: string) => void;
  deleteDiscount: (id: string) => void;
  inventoryLogs: InventoryMovement[];

  // Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Toasts
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function customersFromOrders(list: Order[]): Customer[] {
  const map = new Map<string, Customer>();
  for (const order of list) {
    const key = order.customer.phone.replace(/\D/g, '');
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        id: `c-${key || order.id}`,
        fullName: order.customer.fullName,
        phone: order.customer.phone,
        email: order.customer.email || '',
        governorate: order.customer.governorate,
        totalOrders: 1,
        totalSpent: order.total,
        lastOrderDate: order.createdAt,
      });
    } else {
      existing.totalOrders += 1;
      existing.totalSpent += order.total;
    }
  }
  return [...map.values()];
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Navigation State
  const [mode, setMode] = useState<'store' | 'admin'>('store');
  const [storeView, setStoreView] = useState<StoreView>('home');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderRef, setSelectedOrderRef] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart Drawer
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Entities State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>(INITIAL_DISCOUNTS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryMovement[]>(INITIAL_INVENTORY_LOGS);

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    try {
      const cartRaw = localStorage.getItem('charmies-cart');
      if (cartRaw) {
        const saved = JSON.parse(cartRaw) as {
          productId: string;
          quantity: number;
          variantId?: string;
        }[];
        const restored: CartItem[] = [];
        saved.forEach((item) => {
          const product = INITIAL_PRODUCTS.find((entry) => entry.id === item.productId);
          if (!product || item.quantity <= 0) return;
          const variant = product.variants?.find((entry) => entry.id === item.variantId);
          const quantity = Math.min(item.quantity, Math.max(product.stock, 0));
          if (quantity <= 0) return;
          restored.push({
            id: `${product.id}-${variant?.id || 'standard'}`,
            productId: product.id,
            product,
            quantity,
            selectedVariant: variant,
          });
        });
        setCart(restored);
      }
      const wish = localStorage.getItem('charmies-wishlist');
      if (wish) setWishlist(JSON.parse(wish));
      const recent = localStorage.getItem('charmies-recent');
      if (recent) setRecentIds(JSON.parse(recent));
      const lastOrder = sessionStorage.getItem('charmies-last-order');
      if (lastOrder) {
        const parsed = JSON.parse(lastOrder) as Order;
        if (parsed?.id) setOrders([parsed]);
      }
    } catch {
      // Prototype storage can be ignored when it is unreadable.
    }
    fetch('/api/catalog')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProducts(data as Product[]);
      })
      .catch(() => undefined);
    fetch('/api/categories')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setCategories(data as Category[]);
      })
      .catch(() => undefined);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      'charmies-cart',
      JSON.stringify(
        cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.selectedVariant?.id,
        })),
      ),
    );
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('charmies-wishlist', JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('charmies-recent', JSON.stringify(recentIds));
  }, [recentIds, hydrated]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin')) {
      setMode('admin');
      fetch('/api/orders?scope=admin')
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!Array.isArray(data)) return;
          const list = data as Order[];
          setOrders(list);
          setCustomers(customersFromOrders(list));
        })
        .catch(() => undefined);
      const match = (Object.entries(ADMIN_PATHS) as [AdminView, string][])
        .sort((a, b) => b[1].length - a[1].length)
        .find(([, path]) => pathname === path || pathname.startsWith(`${path}/`));
      if (match) setAdminView(match[0]);
      return;
    }

    setMode('store');
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) setSelectedOrderRef(ref);

    if (pathname === '/') setStoreView('home');
    else if (pathname === '/boutique') {
      setStoreView('shop');
      setSelectedCategoryId(null);
    } else if (pathname.startsWith('/boutique/')) {
      const slug = decodeURIComponent(pathname.split('/')[2] || '');
      const category = categories.find((item) => item.slug === slug);
      setStoreView('category');
      if (category) setSelectedCategoryId(category.id);
    } else if (pathname.startsWith('/produit/')) {
      const slug = decodeURIComponent(pathname.split('/')[2] || '');
      const product = products.find((item) => item.slug === slug);
      setStoreView('product_detail');
      if (product) setSelectedProductId(product.id);
    } else if (pathname === '/panier') setStoreView('cart');
    else if (pathname === '/commande') setStoreView('checkout');
    else if (pathname.startsWith('/confirmation')) setStoreView('order_confirmation');
    else if (pathname.startsWith('/suivi')) setStoreView('track_order');
    else if (pathname.startsWith('/compte')) setStoreView('account');
    else if (pathname === '/contact') setStoreView('contact');
    else if (pathname === '/livraison') setStoreView('policy_delivery');
    else if (pathname === '/retours') setStoreView('policy_returns');
    else if (pathname === '/confidentialite') setStoreView('policy_privacy');
    else if (pathname === '/conditions') setStoreView('policy_terms');
    else if (pathname === '/recherche') setStoreView('search');
    else if (pathname === '/nouveautes') setStoreView('new_arrivals');
    else if (pathname === '/meilleures-ventes') setStoreView('bestsellers');
    else if (pathname === '/coups-de-coeur') setStoreView('wishlist');
  }, [pathname, categories, products]);

  const navigateTo = (
    view: StoreView,
    options?: { categoryId?: CategoryId; productId?: string; orderRef?: string }
  ) => {
    setMode('store');
    setStoreView(view);
    if (options?.categoryId !== undefined) {
      setSelectedCategoryId(options.categoryId);
    }
    if (options?.productId !== undefined) {
      setSelectedProductId(options.productId);
    }
    if (options?.orderRef !== undefined) {
      setSelectedOrderRef(options.orderRef);
    }
    router.push(storePath(view, options, categories, products));
  };

  const navigateToAdmin = (view: AdminView) => {
    setMode('admin');
    setAdminView(view);
    router.push(ADMIN_PATHS[view]);
  };

  const recordRecent = (productId: string) => {
    setRecentIds((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 8));
  };

  const displayCategories = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        itemCount: products.filter((product) => product.published && product.categoryId === category.id)
          .length,
      })),
    [categories, products],
  );

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    if (subtotal >= settings.freeDeliveryThreshold) return 0;
    return settings.standardDeliveryFee;
  }, [cart, subtotal, settings]);

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.minOrderValue && subtotal < appliedDiscount.minOrderValue) return 0;
    if (appliedDiscount.type === 'percentage') {
      return (subtotal * appliedDiscount.value) / 100;
    }
    return Math.min(appliedDiscount.value, subtotal);
  }, [appliedDiscount, subtotal]);

  const finalTotal = useMemo(() => {
    const total = subtotal - discountAmount + deliveryFee;
    return Math.max(0, total);
  }, [subtotal, discountAmount, deliveryFee]);

  // Cart Actions
  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant): boolean => {
    const variantId = variant?.id || 'standard';
    const cartItemId = `${product.id}-${variantId}`;

    const existingIndex = cart.findIndex((item) => item.id === cartItemId);
    const currentQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const targetQty = currentQty + quantity;

    if (targetQty > product.stock) {
      showToast(
        `Désolé, il ne reste que ${product.stock} pièce(s) disponible(s) en stock.`,
        'error'
      );
      return false;
    }

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity = targetQty;
      setCart(updated);
    } else {
      setCart((prev) => [
        ...prev,
        {
          id: cartItemId,
          productId: product.id,
          product,
          quantity,
          selectedVariant: variant,
        },
      ]);
    }

    showToast(`"${product.name}" a été ajouté à votre panier ♡`, 'success');
    setIsCartDrawerOpen(true);
    return true;
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const clamped = Math.min(quantity, item.product.stock);
          if (clamped < quantity) {
            showToast(`Quantité limitée au stock disponible (${item.product.stock})`, 'info');
          }
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Article retiré du panier', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedDiscount(null);
  };

  const applyDiscountCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = discounts.find((d) => d.code === clean && d.isActive);

    if (!found) {
      return { success: false, message: 'Code promo invalide ou expiré.' };
    }

    if (found.minOrderValue && subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Montant minimum requis pour ce code : ${found.minOrderValue.toFixed(3)} TND`,
      };
    }

    setAppliedDiscount(found);
    return {
      success: true,
      message: `Code ${found.code} appliqué avec succès !`,
    };
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    showToast('Code promo retiré', 'info');
  };

  // Wishlist Actions
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Retiré de vos coups de cœur', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Ajouté à vos coups de cœur ♡', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Orders Management
  const createOrder = async (customer: CustomerAddress): Promise<Order> => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variantName: item.selectedVariant?.name,
        })),
        customer,
        promoCode: appliedDiscount?.code,
        acceptTerms: true,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as Order & { error?: string };
    if (!response.ok || !payload.id) {
      showToast(payload.error || 'La commande n’a pas pu être enregistrée.', 'error');
      throw new Error('order-persist-failed');
    }
    const newOrder = payload;
    const newOrderId = newOrder.id;
    const formattedDate = newOrder.createdAt;

    sessionStorage.setItem('charmies-last-order', JSON.stringify(newOrder));
    setOrders((prev) => [newOrder, ...prev.filter((order) => order.id !== newOrder.id)]);

    // Inventory reduction & logs
    cart.forEach((item) => {
      adjustStock(
        item.productId,
        -item.quantity,
        `Commande client #${newOrderId} (Paiement à la livraison)`
      );
    });

    // Update or create customer
    setCustomers((prev) => {
      const existing = prev.find((c) => c.phone === customer.phone);
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpent: c.totalSpent + newOrder.total,
                lastOrderDate: formattedDate,
              }
            : c
        );
      }
      return [
        {
          id: `c-${Date.now()}`,
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email || '',
          governorate: customer.governorate,
          totalOrders: 1,
          totalSpent: newOrder.total,
          lastOrderDate: formattedDate,
        },
        ...prev,
      ];
    });

    // Clear cart and route to confirmation
    clearCart();
    setSelectedOrderRef(newOrderId);
    navigateTo('order_confirmation', { orderRef: newOrderId });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, notes?: string) => {
    void fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, orderStatus: status, internalNotes: notes }),
    })
      .then(async (response) => {
        const saved = (await response.json().catch(() => null)) as Order | { error?: string } | null;
        if (!response.ok || !saved || !('id' in saved)) {
          showToast('Le statut n’a pas pu être enregistré.', 'error');
          return;
        }
        setOrders((prev) => prev.map((order) => (order.id === orderId ? saved : order)));
        showToast(`Statut de la commande ${orderId} mis à jour.`, 'success');
      })
      .catch(() => showToast('Le statut n’a pas pu être enregistré.', 'error'));
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: PaymentStatus) => {
    void fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, paymentStatus }),
    })
      .then(async (response) => {
        const saved = (await response.json().catch(() => null)) as Order | null;
        if (!response.ok || !saved?.id) {
          showToast('Le paiement n’a pas pu être enregistré.', 'error');
          return;
        }
        setOrders((prev) => prev.map((order) => (order.id === orderId ? saved : order)));
        showToast(`Statut de paiement de ${orderId} actualisé.`, 'info');
      })
      .catch(() => showToast('Le paiement n’a pas pu être enregistré.', 'error'));
  };

  const findOrder = (query: string): Order | undefined => {
    const clean = query.trim().toUpperCase().replace('#', '');
    return orders.find(
      (o) =>
        o.id.replace('#', '').toUpperCase() === clean ||
        o.customer.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, '')
    );
  };

  const persistProduct = async (product: Product) => {
    const response = await fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (response.status === 401) {
      showToast('Seule une adresse autorisée peut modifier la boutique.', 'error');
      return false;
    }
    if (!response.ok) {
      showToast('Le bijou n’a pas pu être enregistré.', 'error');
      return false;
    }
    return true;
  };

  // Product CRUD
  const addProduct = async (data: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
    const newId = `p-${Date.now()}`;
    const newProduct: Product = {
      ...data,
      id: newId,
      slug: `${data.slug}-${newId}`,
      rating: 5.0,
      reviews: [],
    };
    const saved = await persistProduct(newProduct);
    if (!saved) return false;
    setProducts((prev) => [newProduct, ...prev]);

    // Update category count
    setCategories((prev) =>
      prev.map((c) => (c.id === data.categoryId ? { ...c, itemCount: c.itemCount + 1 } : c))
    );

    // Log inventory
    setInventoryLogs((prev) => [
      {
        id: `inv-${Date.now()}`,
        productId: newId,
        productName: data.name,
        type: 'restock',
        quantityDelta: data.stock,
        resultingStock: data.stock,
        date: new Date().toLocaleDateString('fr-FR'),
        reason: 'Création produit initiale',
      },
      ...prev,
    ]);

    showToast(`Nouveau produit "${data.name}" créé avec succès`, 'success');
    return true;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const current = products.find((product) => product.id === id);
    if (!current) return false;
    const next = { ...current, ...updates };
    const saved = await persistProduct(next);
    if (!saved) return false;
    setProducts((prev) => prev.map((product) => (product.id === id ? next : product)));
    showToast('Produit mis à jour avec succès', 'success');
    return true;
  };

  const deleteProduct = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return false;
    const response = await fetch(`/api/catalog?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (response.status === 401) {
      showToast('Seule une adresse autorisée peut modifier la boutique.', 'error');
      return false;
    }
    if (!response.ok) {
      showToast('Le bijou n’a pas pu être supprimé.', 'error');
      return false;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCategories((prev) =>
      prev.map((c) =>
        c.id === prod.categoryId ? { ...c, itemCount: Math.max(0, c.itemCount - 1) } : c
      )
    );
    showToast(`Produit "${prod.name}" supprimé`, 'info');
    return true;
  };

  const adjustStock = (productId: string, delta: number, reason: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + delta);
          setInventoryLogs((logs) => [
            {
              id: `inv-${Date.now()}-${Math.random().toString().slice(2, 5)}`,
              productId,
              productName: p.name,
              type: delta > 0 ? 'restock' : 'adjustment',
              quantityDelta: delta,
              resultingStock: newStock,
              date: new Date().toLocaleDateString('fr-FR'),
              reason,
            },
            ...logs,
          ]);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  const persistCategory = async (category: Category) => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (response.status === 401) {
      showToast('Seule une adresse autorisée peut modifier la boutique.', 'error');
      return false;
    }
    if (!response.ok) {
      showToast('La catégorie n’a pas pu être enregistrée.', 'error');
      return false;
    }
    return true;
  };

  // Category CRUD
  const addCategory = async (cat: Omit<Category, 'id' | 'itemCount'>) => {
    const id = cat.slug as CategoryId;
    const next: Category = { ...cat, id, itemCount: 0 };
    if (!(await persistCategory(next))) return false;
    setCategories((prev) => [...prev, next]);
    showToast(`Nouvelle catégorie "${cat.name}" créée`, 'success');
    return true;
  };

  const updateCategory = async (id: CategoryId, cat: Partial<Category>) => {
    const current = categories.find((entry) => entry.id === id);
    if (!current) return false;
    const next = { ...current, ...cat };
    if (!(await persistCategory(next))) return false;
    setCategories((prev) => prev.map((entry) => (entry.id === id ? next : entry)));
    showToast('Catégorie mise à jour', 'success');
    return true;
  };

  const deleteCategory = async (id: CategoryId) => {
    const response = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (response.status === 401) {
      showToast('Seule une adresse autorisée peut modifier la boutique.', 'error');
      return false;
    }
    if (!response.ok) {
      showToast('La catégorie n’a pas pu être supprimée.', 'error');
      return false;
    }
    setCategories((prev) => prev.filter((entry) => entry.id !== id));
    showToast('Catégorie supprimée', 'info');
    return true;
  };

  // Discounts
  const addDiscount = (discount: Omit<Discount, 'id' | 'usageCount'>) => {
    const newDiscount: Discount = {
      ...discount,
      id: `d-${Date.now()}`,
      usageCount: 0,
      code: discount.code.toUpperCase(),
    };
    setDiscounts((prev) => [newDiscount, ...prev]);
    showToast(`Code promo "${newDiscount.code}" ajouté`, 'success');
  };

  const toggleDiscountActive = (id: string) => {
    setDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const deleteDiscount = (id: string) => {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
    showToast('Code promo supprimé', 'info');
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Paramètres de la boutique enregistrés', 'success');
  };

  return (
    <StoreContext.Provider
      value={{
        mode,
        setMode,
        storeView,
        setStoreView,
        adminView,
        setAdminView,
        selectedCategoryId,
        selectedProductId,
        selectedOrderRef,
        searchModalOpen,
        setSearchModalOpen,
        searchQuery,
        setSearchQuery,
        navigateTo,
        navigateToAdmin,

        products,
        categories: displayCategories,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCategory,
        updateCategory,
        deleteCategory,

        cart,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        discountAmount,
        finalTotal,
        appliedDiscount,
        applyDiscountCode,
        removeDiscount,

        wishlist,
        toggleWishlist,
        isInWishlist,

        orders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        findOrder,
        hydrated,
        recentIds,
        recordRecent,

        customers,
        discounts,
        addDiscount,
        toggleDiscountActive,
        deleteDiscount,
        inventoryLogs,

        settings,
        updateSettings,

        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
