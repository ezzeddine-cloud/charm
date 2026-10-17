'use client';

import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { SearchModal } from '@/components/SearchModal';

export function StoreChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C2420] antialiased">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[#2C2420] focus:text-[#FAF7F2] focus:px-4 focus:py-2 focus:rounded-md"
      >
        Aller au contenu
      </a>
      <AnnouncementBar />
      <Navbar />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal />
    </div>
  );
}
