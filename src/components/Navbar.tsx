import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { authClient } from '@/lib/auth/client';
import { isAdminEmail } from '@/lib/admin-access';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Truck,
  Sparkles,
  User,
} from 'lucide-react';
import { CategoryId } from '../types';

export const Navbar: React.FC = () => {
  const {
    navigateTo,
    navigateToAdmin,
    cart,
    wishlist,
    openCartDrawer,
    setSearchModalOpen,
    categories,
    storeView,
    selectedCategoryId,
  } = useStore();

  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authClient
      .getSession({ query: {} })
      .then((result) => {
        if (!cancelled) setIsAdmin(isAdminEmail(result.data?.user?.email));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCategoryClick = (catId: CategoryId) => {
    setCategoriesDropdownOpen(false);
    setMobileMenuOpen(false);
    navigateTo('category', { categoryId: catId });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD5] transition-all">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#2C2420] hover:text-[#9A7235] transition-colors -ml-2"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigateTo('home')}
            className="text-left group flex items-center gap-2.5 focus:outline-none"
          >
            {/* Elegant bow motif inspired by Instagram logo */}
            <div className="w-9 h-9 rounded-full bg-[#F4EADA] border border-[#C69A58]/30 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-5 h-5 text-[#9A7235]"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Dainty bow icon */}
                <path d="M12 12c-2.5-3-6-3-6 0s3.5 3 6 0z" fill="currentColor" fillOpacity="0.15" />
                <path d="M12 12c2.5-3 6-3 6 0s-3.5 3-6 0z" fill="currentColor" fillOpacity="0.15" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <path d="M11 13.5l-2.5 5" />
                <path d="M13 13.5l2.5 5" />
              </svg>
            </div>

            <div>
              <span className="font-serif text-xl sm:text-2xl font-medium tracking-wide text-[#2C2420] block leading-none">
                CHARMIES
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A7235] font-medium block mt-0.5">
                by sousou
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-Line, 4-5 items) */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-[13px] tracking-wide font-medium text-[#4A3E39]">
          <button
            onClick={() => navigateTo('home')}
            className={`whitespace-nowrap transition-colors hover:text-[#9A7235] ${
              storeView === 'home' ? 'text-[#9A7235] font-semibold underline underline-offset-8' : ''
            }`}
          >
            Accueil
          </button>

          <button
            onClick={() => navigateTo('shop')}
            className={`whitespace-nowrap transition-colors hover:text-[#9A7235] ${
              storeView === 'shop' && !selectedCategoryId ? 'text-[#9A7235] font-semibold underline underline-offset-8' : ''
            }`}
          >
            Boutique
          </button>

          {/* Categories Dropdown */}
          <div className="relative group">
            <button
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              className={`flex items-center gap-1 whitespace-nowrap transition-colors hover:text-[#9A7235] ${
                storeView === 'category' ? 'text-[#9A7235] font-semibold underline underline-offset-8' : ''
              }`}
            >
              <span>Collections</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
            </button>

            {/* Dropdown Menu */}
            {categoriesDropdownOpen && (
              <div
                onMouseLeave={() => setCategoriesDropdownOpen(false)}
                className="absolute top-full left-0 mt-2 w-64 bg-[#FAF7F2] border border-[#E8DFD5] shadow-lg rounded-md py-2 z-50 animate-in fade-in slide-in-from-top-1"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#2C2420] hover:bg-[#F4EADA] hover:text-[#9A7235] transition-colors flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-[#8C7A70]">{cat.itemCount}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigateTo('new_arrivals')}
            className={`whitespace-nowrap transition-colors hover:text-[#9A7235] ${
              storeView === 'new_arrivals' ? 'text-[#9A7235] font-semibold underline underline-offset-8' : ''
            }`}
          >
            Nouveautés
          </button>
          <button
            onClick={() => navigateTo('bestsellers')}
            className={`whitespace-nowrap transition-colors hover:text-[#9A7235] ${
              storeView === 'bestsellers' ? 'text-[#9A7235] font-semibold underline underline-offset-8' : ''
            }`}
          >
            Best-sellers
          </button>

        </nav>

        {/* Zone 3: Actions (Search, Wishlist, Cart, Admin toggle) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={() => navigateTo('search')}
            className="p-2 text-[#4A3E39] hover:text-[#9A7235] hover:bg-[#F4EADA]/60 rounded-full transition-colors"
            aria-label="Rechercher un bijou"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigateTo('account')}
            className="p-2 text-[#4A3E39] hover:text-[#9A7235] hover:bg-[#F4EADA]/60 rounded-full transition-colors hidden sm:flex"
            aria-label="Espace cliente"
          >
            <User className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigateTo('wishlist')}
            className="relative p-2 text-[#4A3E39] hover:text-[#9A7235] hover:bg-[#F4EADA]/60 rounded-full transition-colors hidden sm:flex items-center"
            title="Coups de cœur"
            aria-label="Coups de cœur"
          >
            <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#CFA69B]" />
            )}
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={openCartDrawer}
            className="relative p-2 text-[#2C2420] hover:text-[#9A7235] hover:bg-[#F4EADA]/60 rounded-full transition-colors flex items-center gap-2"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="w-5 h-5 text-[#2C2420]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2C2420] text-[#F5EFEB] text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center border border-[#FAF7F2] tabular-nums">
                {totalCartCount}
              </span>
            )}
          </button>

          {isAdmin ? (
            <button
              onClick={() => navigateToAdmin('dashboard')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2420] bg-[#F4EADA] border border-[#C69A58]/40 rounded-md hover:bg-[#E8DACB] transition-colors ml-1"
              title="Accéder au panneau d'administration"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#9A7235]" />
              <span>Admin Store</span>
            </button>
          ) : null}
        </div>
      </div>

      {mobileMenuOpen
        ? createPortal(
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF7F2] p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E8DFD5]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#F4EADA] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#9A7235]" />
                  </div>
                  <span className="font-serif text-lg font-medium text-[#2C2420]">
                    CHARMIES
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#4A3E39] hover:text-[#2C2420]"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="py-4 space-y-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('home');
                  }}
                  className="w-full text-left py-2.5 px-3 text-sm font-medium text-[#2C2420] hover:bg-[#F4EADA] rounded-md transition-colors"
                >
                  Accueil
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('shop');
                  }}
                  className="w-full text-left py-2.5 px-3 text-sm font-medium text-[#2C2420] hover:bg-[#F4EADA] rounded-md transition-colors"
                >
                  Boutique
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('new_arrivals');
                  }}
                  className="w-full text-left py-2.5 px-3 text-sm font-medium text-[#2C2420] hover:bg-[#F4EADA] rounded-md transition-colors"
                >
                  Nouveautés
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('bestsellers');
                  }}
                  className="w-full text-left py-2.5 px-3 text-sm font-medium text-[#2C2420] hover:bg-[#F4EADA] rounded-md transition-colors"
                >
                  Best-sellers
                </button>

                <div className="pt-2 pb-1 px-3 text-[11px] font-semibold text-[#8C7A70] uppercase tracking-wider">
                  Catégories
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="w-full text-left py-2 px-5 text-sm text-[#4A3E39] hover:text-[#9A7235] hover:bg-[#F4EADA]/60 rounded-md transition-colors flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-[#8C7A70]">{cat.itemCount}</span>
                  </button>
                ))}

                <div className="pt-4 border-t border-[#E8DFD5] mt-4 space-y-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('track_order');
                    }}
                    className="w-full text-left py-2.5 px-3 text-sm text-[#2C2420] hover:bg-[#F4EADA] rounded-md transition-colors flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4 text-[#C69A58]" />
                    <span>Suivre ma commande</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('account');
                    }}
                    className="w-full text-left py-2.5 px-3 text-sm text-[#2C2420] hover:bg-[#F4EADA] rounded-md transition-colors"
                  >
                    Espace cliente
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('contact');
                    }}
                    className="w-full text-left py-2.5 px-3 text-sm text-[#2C2420] hover:bg-[#F4EADA] rounded-md transition-colors"
                  >
                    Contact & Aide
                  </button>
                </div>
              </div>
            </div>

            {isAdmin ? (
              <div className="pt-6 border-t border-[#E8DFD5]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateToAdmin('dashboard');
                  }}
                  className="w-full py-2.5 px-3 bg-[#2C2420] text-[#F5EFEB] rounded-md text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#1A1614] transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#C69A58]" />
                  <span>Panneau Administration</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>,
        document.body,
      )
        : null}
    </header>
  );
};
