import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Settings, Save, Sparkles, Truck, Phone, Instagram, Check } from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { settings, updateSettings, showToast } = useStore();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [instagramHandle, setInstagramHandle] = useState(settings.instagramHandle);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(settings.standardDeliveryFee.toString());
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(settings.freeDeliveryThreshold.toString());
  const [announcementText, setAnnouncementText] = useState(settings.announcementText);
  const [announcementActive, setAnnouncementActive] = useState(settings.announcementActive);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      tagline,
      contactEmail,
      contactPhone,
      instagramHandle,
      standardDeliveryFee: parseFloat(standardDeliveryFee) || 7,
      freeDeliveryThreshold: parseFloat(freeDeliveryThreshold) || 120,
      announcementText,
      announcementActive,
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#2C2420] font-medium">
          Paramètres Généraux de la Boutique
        </h1>
        <p className="text-xs text-[#8C7A70] mt-0.5">
          Configurez les tarifs de livraison en Tunisie, coordonnées et bandeau d'annonce.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Brand identity */}
        <div className="p-6 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#2C2420] pb-2 border-b border-[#E8DFD5]">
            Identité de la Marque
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#4A3E39] block mb-1 font-medium">Nom de la marque</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
              />
            </div>

            <div>
              <label className="text-[#4A3E39] block mb-1 font-medium">Slogan / Poésie</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Cash on Delivery Rates */}
        <div className="p-6 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#2C2420] pb-2 border-b border-[#E8DFD5]">
            Tarification Livraison (Cash on Delivery)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#4A3E39] block mb-1 font-medium">
                Frais de livraison standard (TND)
              </label>
              <input
                type="number"
                step="0.5"
                value={standardDeliveryFee}
                onChange={(e) => setStandardDeliveryFee(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
              />
              <p className="text-[10px] text-[#8C7A70] mt-1">
                Frais appliqués automatiquement au panier pour les 24 gouvernorats.
              </p>
            </div>

            <div>
              <label className="text-[#4A3E39] block mb-1 font-medium">
                Seuil de livraison gratuite (TND)
              </label>
              <input
                type="number"
                step="1"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
              />
              <p className="text-[10px] text-[#8C7A70] mt-1">
                La livraison devient offerte dès que le sous-total atteint ce montant.
              </p>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="p-6 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD5]">
            <h2 className="font-serif text-base font-semibold text-[#2C2420]">
              Bandeau d'Annonce Supérieur
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
                className="rounded text-[#9A7235]"
              />
              <span className="text-xs font-medium">Afficher le bandeau</span>
            </label>
          </div>

          <div>
            <label className="text-[#4A3E39] block mb-1 font-medium">Texte du bandeau</label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="p-6 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#2C2420] pb-2 border-b border-[#E8DFD5]">
            Coordonnées du Service Client
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[#4A3E39] block mb-1 font-medium">Téléphone / WhatsApp</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
              />
            </div>

            <div>
              <label className="text-[#4A3E39] block mb-1 font-medium">Email de contact</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
              />
            </div>

            <div>
              <label className="text-[#4A3E39] block mb-1 font-medium">Compte Instagram</label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#2C2420] text-white rounded-md text-xs font-semibold hover:bg-[#1A1614] flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4 text-[#C69A58]" />
            <span>Enregistrer les paramètres</span>
          </button>
        </div>
      </form>
    </div>
  );
};
