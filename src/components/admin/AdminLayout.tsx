'use client';

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminView } from '../../types';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Boxes,
  Users,
  Tag,
  BarChart3,
  Settings,
  Store,
  Menu,
  X,
  Bell,
  Sparkles,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminView, navigateToAdmin, navigateTo, orders, products } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'pending_confirmation').length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  const navItems: { id: AdminView; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'orders', label: 'Commandes (COD)', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'products', label: 'Produits & Bijoux', icon: Package },
    { id: 'categories', label: 'Catégories', icon: FolderTree },
    { id: 'inventory', label: 'Gestion des Stocks', icon: Boxes, badge: lowStockCount },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'discounts', label: 'Codes Promo & Réductions', icon: Tag },
    { id: 'reports', label: 'Rapports & Ventes', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres Boutique', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5EFEB] flex text-[#2C2420]">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#2C2420] text-[#FAF7F2] p-5 flex flex-col justify-between transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Store Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#3D332D]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-medium text-[#FAF7F2]">
                  CHARMIES
                </span>
                <span className="text-[10px] bg-[#C69A58] text-[#2C2420] font-bold px-1.5 py-0.5 rounded-xs uppercase">
                  Admin
                </span>
              </div>
              <span className="text-[11px] text-[#8C7A70] block mt-0.5">
                E-Commerce Management
              </span>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-[#8C7A70] hover:text-[#FAF7F2]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateToAdmin(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#C69A58] text-[#2C2420] font-semibold'
                      : 'text-[#B5A499] hover:bg-[#3D332D] hover:text-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
                        isActive
                          ? 'bg-[#2C2420] text-[#F5EFEB]'
                          : 'bg-[#C69A58] text-[#2C2420]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switcher: Back to Storefront */}
        <div className="pt-4 border-t border-[#3D332D] space-y-2">
          <button
            onClick={() => navigateTo('home')}
            className="w-full py-2.5 px-3 bg-[#FAF7F2] text-[#2C2420] hover:bg-[#F4EADA] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Store className="w-4 h-4 text-[#9A7235]" />
            <span>Voir la boutique en ligne</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-[#FAF7F2] border-b border-[#E8DFD5] h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#4A3E39] hover:text-[#2C2420]"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-serif text-base sm:text-lg font-medium text-[#2C2420] truncate">
              {navItems.find((n) => n.id === adminView)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {pendingOrdersCount > 0 && (
              <button
                onClick={() => navigateToAdmin('orders')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-medium"
              >
                <Bell className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>{pendingOrdersCount} commande(s) à confirmer</span>
              </button>
            )}

            <button
              onClick={() => navigateTo('home')}
              className="px-3 py-1.5 text-xs text-[#4A3E39] hover:text-[#2C2420] border border-[#E8DFD5] rounded-md hover:bg-[#F4EADA] transition-colors flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-[#9A7235]" />
              <span className="hidden sm:inline">Boutique</span>
            </button>
          </div>
        </header>

        {/* Dynamic Admin View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
