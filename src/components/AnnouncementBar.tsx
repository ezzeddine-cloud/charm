import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Truck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStore();

  if (!settings.announcementActive) return null;

  return (
    <div className="bg-[#2C2420] text-[#F5EFEB] py-2 px-4 text-xs font-medium text-center relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-[#C69A58] shrink-0" />
        <span className="truncate">{settings.announcementText}</span>
        <span className="hidden sm:inline-block text-[#C69A58] opacity-60">|</span>
        <span className="hidden sm:inline-flex items-center gap-1 text-[#E8DACB]">
          <Truck className="w-3.5 h-3.5" />
          Livraison rapide 24-48h
        </span>
      </div>
    </div>
  );
};
