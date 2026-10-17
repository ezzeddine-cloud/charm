import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../ProductCard';
import {
  Sparkles,
  ArrowRight,
  Instagram,
  CheckCircle2,
} from 'lucide-react';
import { IMAGES } from '../../data/mockData';
import { CategoryId } from '../../types';

export const HomeView: React.FC = () => {
  const { navigateTo, products, categories, settings } = useStore();
  const instagramHandle = settings.instagramHandle.replace('@', '') || 'charmies_by_sousou';
  const instagramUrl = `https://www.instagram.com/${instagramHandle}`;

  const featuredProducts = products.filter((p) => p.published && p.isFeatured).slice(0, 4);
  const newArrivals = products.filter((p) => p.published && p.isNewArrival).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative overflow-hidden bg-linear-to-b from-[#F5EFEB] to-[#FAF7F2] border-b border-[#E8DFD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Text Column */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF7F2] border border-[#C69A58]/30 rounded-full text-xs font-medium text-[#9A7235]">
                <Sparkles className="w-3.5 h-3.5 text-[#C69A58]" />
                <span>Nouvelle Collection 2026</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#2C2420] tracking-tight leading-[1.15] text-balance">
                L'élégance délicate au creux de votre quotidien.
              </h1>

              <p className="text-sm sm:text-base text-[#615249] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Des bijoux raffinés en acier inoxydable doré à l'or fin, pensés pour être portés chaque jour sans jamais ternir. Livrés avec soin partout en Tunisie.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => navigateTo('shop')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#2C2420] text-[#F5EFEB] rounded-md text-xs sm:text-sm font-medium hover:bg-[#1A1614] transition-colors flex items-center justify-center gap-2 shadow-xs group"
                >
                  <span>Explorer la Boutique</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => navigateTo('category', { categoryId: 'necklaces' })}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#F4EADA] text-[#2C2420] border border-[#C69A58]/30 rounded-md text-xs sm:text-sm font-medium hover:bg-[#E8DACB] transition-colors"
                >
                  Nos Colliers Phares
                </button>
              </div>

              {/* Trust Subtext */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#8C7A70]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9A7235]" />
                  <span>Paiement à la livraison (COD)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9A7235]" />
                  <span>Acier 316L résistant à l'eau</span>
                </div>
              </div>
            </div>

            {/* Visual Column */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden shadow-lg border border-[#E8DFD5] bg-[#F5EFEB]">
                <img
                  src={IMAGES.hero}
                  alt="Charmies by Sousou Collection de Bijoux"
                  className="w-full h-full object-cover object-center"
                />

                {/* Floating Aesthetic Card */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-[#FAF7F2]/95 backdrop-blur-md p-3.5 rounded-lg border border-[#E8DFD5] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#E8DFD5]">
                      <img src={IMAGES.necklaces} alt="Collier Signature" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-serif text-xs font-semibold text-[#2C2420] block">
                        Collier Cœur & Chaîne Serpent
                      </span>
                      <span className="text-[11px] text-[#9A7235] font-medium block">
                        36.000 TND · Bestseller
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SHOWCASE TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#9A7235] font-medium">
            Explorez l'univers
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2420] mt-1">
            Nos Collections Délicates
          </h2>
          <p className="text-xs sm:text-sm text-[#8C7A70] mt-2">
            Des pièces pensées pour s'associer avec harmonie et sublimer tous vos moments.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateTo('category', { categoryId: cat.id })}
              className="group cursor-pointer flex flex-col items-center text-center p-3 rounded-lg border border-[#E8DFD5] bg-[#FAF7F2] hover:bg-[#F4EADA]/60 hover:border-[#C69A58]/50 transition-all duration-300"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#F5EFEB] mb-3 border border-[#E8DFD5] group-hover:scale-105 transition-transform duration-300 shadow-xs">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-serif text-xs sm:text-sm font-medium text-[#2C2420] group-hover:text-[#9A7235] transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[11px] text-[#8C7A70] mt-0.5">
                {cat.itemCount} pièces
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8 pb-4 border-b border-[#E8DFD5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#9A7235] font-medium">
              Nouveautés de la semaine
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2420] mt-1">
              Les Dernières Créations
            </h2>
          </div>

          <button
            onClick={() => navigateTo('new_arrivals')}
            className="text-xs font-medium text-[#2C2420] hover:text-[#9A7235] flex items-center gap-1 group"
          >
            <span>Voir toute la boutique</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. BEST SELLERS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8 pb-4 border-b border-[#E8DFD5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#9A7235] font-medium">
              Sélection mise en avant
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2420] mt-1">
              Les Incontournables
            </h2>
          </div>

          <button
            onClick={() => navigateTo('bestsellers')}
            className="text-xs font-medium text-[#2C2420] hover:text-[#9A7235] flex items-center gap-1 group"
          >
            <span>Tout découvrir</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. VALUES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ['Délicatesse', 'Des pièces fines, pensées pour le quotidien, dans une palette ivoire et or.'],
            ['Clarté', 'Prix en dinars tunisiens, variantes et stock visibles avant l’ajout au panier.'],
            ['Paiement à la livraison', 'Le règlement se fait à la remise du colis. Une commande n’est pas payée tant que les espèces ne sont pas encaissées.'],
          ].map(([title, text]) => (
            <article key={title} className="p-6 rounded-xl border border-[#E8DFD5] bg-white">
              <h3 className="font-serif text-xl">{title}</h3>
              <p className="text-sm text-[#615249] mt-2 leading-relaxed">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Instagram */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="block text-center max-w-xl mx-auto rounded-2xl border border-[#E8DFD5] bg-white px-6 py-10 hover:border-[#C69A58] transition-colors"
        >
          <div className="inline-flex items-center gap-1.5 text-xs text-[#9A7235] font-medium mb-1">
            <Instagram className="w-3.5 h-3.5" />
            <span>Inspirations</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2420]">
            Suivez l'univers sur Instagram
          </h2>
          <p className="text-sm text-[#9A7235] mt-2 font-medium">@{instagramHandle}</p>
          <p className="text-xs text-[#8C7A70] mt-1">
            Retrouvez nos mises en scène, inspirations de looks et coulisses de l'atelier.
          </p>
        </a>
      </section>
    </div>
  );
};
