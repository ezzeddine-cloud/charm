import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Plus, Sparkles, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateTo, addToCart, isInWishlist, toggleWishlist, categories } = useStore();
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const category = categories.find((c) => c.id === product.categoryId);
  const inWishlist = isInWishlist(product.id);

  const handleCardClick = () => {
    navigateTo('product_detail', { productId: product.id });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If product has variants, navigate to detail page to select variant
    if (product.variants && product.variants.length > 1) {
      navigateTo('product_detail', { productId: product.id });
      return;
    }

    const defaultVariant = product.variants ? product.variants[0] : undefined;
    const added = addToCart(product, 1, defaultVariant);
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer flex flex-col justify-between transition-all duration-300"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden rounded-md bg-[#F4EADA]/60 border border-[#E8DFD5]/80">
        {!imageError && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-linear-to-b from-[#FAF7F2] to-[#EDE3DA] text-[#8C7A70]">
            <Sparkles className="w-6 h-6 text-[#C69A58] mb-2 opacity-60" />
            <span className="font-serif text-xs text-center text-[#4A3E39]">{product.name}</span>
          </div>
        )}

        {/* Clean, quiet status marker (at most 1 text label, no candy pills) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.isNewArrival && (
            <span className="text-[11px] font-medium tracking-wider text-[#9A7235] bg-[#FAF7F2]/90 backdrop-blur-xs px-2 py-0.5 rounded-xs border border-[#E8DFD5]">
              Nouveau
            </span>
          )}
          {product.isBestSeller && !product.isNewArrival && (
            <span className="text-[11px] font-medium tracking-wider text-[#4A3E39] bg-[#FAF7F2]/90 backdrop-blur-xs px-2 py-0.5 rounded-xs border border-[#E8DFD5]">
              Bestseller
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[11px] font-medium tracking-wider text-rose-800 bg-[#FAF7F2]/90 backdrop-blur-xs px-2 py-0.5 rounded-xs border border-rose-200">
              Rupture de stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors ${
            inWishlist
              ? 'bg-[#FAF7F2] text-[#CFA69B] shadow-xs'
              : 'bg-[#FAF7F2]/80 text-[#4A3E39] hover:text-[#9A7235] hover:bg-[#FAF7F2]'
          }`}
          aria-label={inWishlist ? 'Retirer des coups de cœur' : 'Ajouter aux coups de cœur'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Overlay Button on Hover */}
        {!isOutOfStock && (
          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hidden sm:block">
            <button
              onClick={handleQuickAdd}
              className={`w-full py-2 px-3 rounded-md text-xs font-medium transition-colors shadow-xs flex items-center justify-center gap-1.5 ${
                justAdded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#2C2420] text-[#F5EFEB] hover:bg-[#1A1614]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ajouté !</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{product.variants && product.variants.length > 1 ? 'Choisir une option' : 'Ajout Rapide'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Metadata (Zero-Pill Discipline) */}
      <div className="pt-3 pb-1 flex flex-col gap-1">
        <div className="text-[11px] uppercase tracking-wider text-[#8C7A70] font-medium">
          {category?.name || 'Bijou'}
        </div>

        <h3 className="font-serif text-sm sm:text-base font-medium text-[#2C2420] group-hover:text-[#9A7235] transition-colors line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-sm font-semibold text-[#2C2420] tabular-nums">
            {product.price.toFixed(3)} TND
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-[#8C7A70] line-through tabular-nums">
              {product.originalPrice.toFixed(3)} TND
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
