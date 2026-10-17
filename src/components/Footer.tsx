import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Truck, ShieldCheck, HeartHandshake, Instagram } from 'lucide-react';
import { CategoryId } from '../types';

export const Footer: React.FC = () => {
  const { navigateTo, settings } = useStore();

  const handleCategoryNav = (catId: CategoryId) => {
    navigateTo('category', { categoryId: catId });
  };

  return (
    <footer className="bg-[#2C2420] text-[#F5EFEB] border-t border-[#3D332D]">
      {/* Trust & Guarantees Strip */}
      <div className="border-b border-[#3D332D] py-8 sm:py-10 bg-[#251E1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#3D332D] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-[#C69A58]" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-medium text-[#FAF7F2]">
                  Paiement à la Livraison
                </h4>
                <p className="text-xs text-[#B5A499] mt-0.5">
                  Réglez en espèces à la réception de votre colis partout en Tunisie.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#3D332D] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#C69A58]" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-medium text-[#FAF7F2]">
                  Acier Inoxydable 316L
                </h4>
                <p className="text-xs text-[#B5A499] mt-0.5">
                  Résiste à l'eau, ne noircit pas et respecte les peaux sensibles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#3D332D] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#C69A58]" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-medium text-[#FAF7F2]">
                  Écrin Cadeau Délicat
                </h4>
                <p className="text-xs text-[#B5A499] mt-0.5">
                  Chaque commande est préparée avec amour dans son pochon velours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#3D332D] flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5 text-[#C69A58]" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-medium text-[#FAF7F2]">
                  Service Attentionné
                </h4>
                <p className="text-xs text-[#B5A499] mt-0.5">
                  Suivi de la commande sur Instagram et par téléphone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl tracking-wide text-[#FAF7F2] block">
                CHARMIES
              </span>
              <span className="text-xs uppercase tracking-widest text-[#C69A58]">
                by sousou
              </span>
            </div>
            <p className="font-script text-xl text-[#CFA69B]">
              Little things, big charm ♡
            </p>
            <p className="text-xs text-[#B5A499] leading-relaxed max-w-sm">
              Bijoux féminins et accessoires raffinés conçus pour illuminer votre quotidien tout en délicatesse. Pensés pour vous accompagner au fil des jours sans perdre de leur éclat.
            </p>

            <div className="pt-2">
              <a
                href={`https://www.instagram.com/${(settings.instagramHandle || '@charmies_by_sousou').replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 text-[#B5A499] hover:text-[#FAF7F2] transition-colors"
                aria-label="Instagram Charmies by Sousou"
              >
                <span className="w-9 h-9 rounded-full bg-[#3D332D] hover:bg-[#C69A58] text-[#FAF7F2] flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4" />
                </span>
                <span className="text-xs">
                  {settings.instagramHandle || '@charmies_by_sousou'}
                </span>
              </a>
            </div>
          </div>

          {/* Column 1: Collections */}
          <div>
            <h4 className="font-serif text-sm font-medium text-[#FAF7F2] uppercase tracking-wider mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#B5A499]">
              <li>
                <button
                  onClick={() => handleCategoryNav('necklaces')}
                  className="hover:text-[#FAF7F2] transition-colors"
                >
                  Colliers & Pendentifs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('bracelets')}
                  className="hover:text-[#FAF7F2] transition-colors"
                >
                  Bracelets & Joncs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('earrings')}
                  className="hover:text-[#FAF7F2] transition-colors"
                >
                  Boucles d'Oreilles & Piercings
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('rings')}
                  className="hover:text-[#FAF7F2] transition-colors"
                >
                  Bagues Fines
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('accessories')}
                  className="hover:text-[#FAF7F2] transition-colors"
                >
                  Accessoires & Chouchous
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Service Client & Suivi */}
          <div>
            <h4 className="font-serif text-sm font-medium text-[#FAF7F2] uppercase tracking-wider mb-4">
              Service Client
            </h4>
            <ul className="space-y-2.5 text-xs text-[#B5A499]">
              <li>
                <button
                  onClick={() => navigateTo('track_order')}
                  className="hover:text-[#FAF7F2] transition-colors text-[#C69A58]"
                >
                  Suivre ma commande
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('policy_delivery')}
                  className="hover:text-[#FAF7F2] transition-colors"
                >
                  Livraison & Paiement COD
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="hover:text-[#FAF7F2] transition-colors"
                >
                  Nous contacter
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('policy_returns')}
                  className="hover:text-[#FAF7F2] transition-colors"
                >
                  Échanges & Réclamations
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="mt-12 pt-8 border-t border-[#3D332D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C7A70]">
          <div>
            © {new Date().getFullYear()} Charmies by Sousou.
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigateTo('policy_terms')}
              className="hover:text-[#B5A499] transition-colors"
            >
              Conditions Générales
            </button>
            <span>·</span>
            <button
              onClick={() => navigateTo('policy_privacy')}
              className="hover:text-[#B5A499] transition-colors"
            >
              Confidentialité
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
