import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { ToastContainer } from './components/Toast';

// Store Views
import { HomeView } from './components/store/HomeView';
import { ShopView } from './components/store/ShopView';
import { ProductDetailView } from './components/store/ProductDetailView';
import { CheckoutView } from './components/store/CheckoutView';
import { OrderConfirmationView } from './components/store/OrderConfirmationView';
import { TrackOrderView } from './components/store/TrackOrderView';
import { AccountView } from './components/store/AccountView';
import { ContactView } from './components/store/ContactView';
import { PolicyView } from './components/store/PolicyView';

// Admin Views
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminProductsView } from './components/admin/AdminProductsView';
import { AdminCategoriesView } from './components/admin/AdminCategoriesView';
import { AdminOrdersView } from './components/admin/AdminOrdersView';
import { AdminInventoryView } from './components/admin/AdminInventoryView';
import { AdminCustomersView } from './components/admin/AdminCustomersView';
import { AdminDiscountsView } from './components/admin/AdminDiscountsView';
import { AdminReportsView } from './components/admin/AdminReportsView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';

const StoreAppContent: React.FC = () => {
  const { mode, storeView, adminView } = useStore();

  if (mode === 'admin') {
    return (
      <AdminLayout>
        {adminView === 'dashboard' && <AdminDashboardView />}
        {adminView === 'products' && <AdminProductsView />}
        {adminView === 'categories' && <AdminCategoriesView />}
        {adminView === 'orders' && <AdminOrdersView />}
        {adminView === 'inventory' && <AdminInventoryView />}
        {adminView === 'customers' && <AdminCustomersView />}
        {adminView === 'discounts' && <AdminDiscountsView />}
        {adminView === 'reports' && <AdminReportsView />}
        {adminView === 'settings' && <AdminSettingsView />}
        <ToastContainer />
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C2420] antialiased">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1">
        {storeView === 'home' && <HomeView />}
        {(storeView === 'shop' || storeView === 'category') && <ShopView />}
        {storeView === 'product_detail' && <ProductDetailView />}
        {storeView === 'checkout' && <CheckoutView />}
        {storeView === 'order_confirmation' && <OrderConfirmationView />}
        {storeView === 'track_order' && <TrackOrderView />}
        {storeView === 'account' && <AccountView />}
        {storeView === 'contact' && <ContactView />}
        {(storeView === 'policy_delivery' ||
          storeView === 'policy_returns' ||
          storeView === 'policy_privacy' ||
          storeView === 'policy_terms') && <PolicyView />}
      </main>

      <Footer />
      <CartDrawer />
      <SearchModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StoreAppContent />
    </StoreProvider>
  );
}
