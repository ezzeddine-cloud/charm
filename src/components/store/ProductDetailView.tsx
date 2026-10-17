import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../ProductCard';
import { ProductVariant } from '../../types';
import {
  ChevronRight,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProductId,
    products,
    categories,
    addToCart,
    isInWishlist,
    toggleWishlist,
    navigateTo,
    showToast,
    recentIds,
    recordRecent,
    settings,
  } = useStore();

  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : undefined;
  const product =
    (slug
      ? products.find((item) => item.slug === slug)
      : products.find((item) => item.id === selectedProductId)) || null;

  const category = categories.find((c) => c.id === product?.categoryId);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'delivery'>('details');

  useEffect(() => {
    if (!product) return;
    recordRecent(product.id);
    setActiveImageIndex(0);
    setQuantity(1);
    setSelectedVariant(product.variants?.[0]);
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p>Produit introuvable.</p>
        <button
          onClick={() => navigateTo('shop')}
          className="mt-4 px-4 py-2 bg-[#2C2420] text-white rounded-md text-xs"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId && p.published)
    .slice(0, 4);

  const recentProducts = recentIds
    .map((id) => products.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => !!item && item.id !== product.id)
    .slice(0, 4);

  const variantUnavailable = !!selectedVariant && !selectedVariant.inStock;
  const cannotAdd = isOutOfStock || variantUnavailable || quantity < 1 || quantity > product.stock;

  const handleAddToCart = () => {
    if (cannotAdd) {
      if (variantUnavailable) showToast('Cette variante est indiquée en rupture.', 'error');
      return;
    }
    addToCart(product, quantity, selectedVariant);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-[#8C7A70]">
        <button onClick={() => navigateTo('home')} className="hover:text-[#2C2420]">
          Accueil
        </button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigateTo('shop')} className="hover:text-[#2C2420]">
          Boutique
        </button>
        {category && (
          <>
            <ChevronRight className="w-3 h-3" />
            <button
              onClick={() => navigateTo('category', { categoryId: category.id })}
              className="hover:text-[#2C2420]"
            >
              {category.name}
            </button>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#2C2420] font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid (Sticky Purchase Module Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-4/3 sm:aspect-square w-full rounded-xl overflow-hidden bg-[#F5EFEB] border border-[#E8DFD5] shadow-xs">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                inWishlist
                  ? 'bg-[#FAF7F2] text-[#CFA69B] shadow-sm'
                  : 'bg-[#FAF7F2]/80 text-[#4A3E39] hover:text-[#9A7235] hover:bg-[#FAF7F2]'
              }`}
              aria-label="Ajouter aux coups de cœur"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              {product.isNewArrival && (
                <span className="text-xs font-medium text-[#9A7235] bg-[#FAF7F2]/95 px-2.5 py-1 rounded-xs border border-[#E8DFD5] shadow-xs">
                  Nouveauté
                </span>
              )}
              {product.isBestSeller && (
                <span className="text-xs font-medium text-[#4A3E39] bg-[#FAF7F2]/95 px-2.5 py-1 rounded-xs border border-[#E8DFD5] shadow-xs">
                  Bestseller
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-md overflow-hidden bg-[#FAF7F2] border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#9A7235] shadow-xs'
                      : 'border-[#E8DFD5] opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#9A7235] font-semibold mb-1">
              {category?.name || 'Charmies Accessoires'}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#2C2420] font-medium leading-snug">
              {product.name}
            </h1>

            <p className="mt-2 text-xs text-[#8C7A70]">Réf: {product.sku}</p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 py-3 border-y border-[#E8DFD5]">
            <span className="font-serif text-2xl sm:text-3xl font-medium text-[#2C2420] tabular-nums">
              {product.price.toFixed(3)} TND
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-sm text-[#8C7A70] line-through tabular-nums">
                  {product.originalPrice.toFixed(3)} TND
                </span>
                <span className="text-xs text-[#9A7235] font-medium">
                  Économisez {(product.originalPrice - product.price).toFixed(3)} TND
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-[#615249] leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#2C2420]">
                  Option / Finition :
                </span>
                <span className="text-[#9A7235] font-medium">
                  {selectedVariant?.name || 'Standard'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 rounded-md text-xs font-medium border transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-[#2C2420] bg-[#2C2420] text-[#F5EFEB] shadow-xs'
                        : 'border-[#E8DFD5] bg-[#FAF7F2] text-[#4A3E39] hover:bg-[#F4EADA]'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="text-xs flex items-center gap-2">
            {isOutOfStock || variantUnavailable ? (
              <span className="text-rose-700 font-medium">
                {variantUnavailable
                  ? 'Cette variante est indiquée en rupture'
                  : 'Actuellement en rupture de stock'}
              </span>
            ) : isLowStock ? (
              <span className="text-amber-800 font-medium">
                Attention : Plus que {product.stock} pièce(s) en stock !
              </span>
            ) : (
              <span className="text-emerald-800 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                En stock (Disponible immédiatement)
              </span>
            )}
          </div>

          {/* Quantity and Add to Cart Row */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-[#E8DFD5] rounded-md bg-[#FAF7F2] p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-[#4A3E39] hover:text-[#2C2420] disabled:opacity-30 transition-colors"
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-semibold tabular-nums text-[#2C2420]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2 text-[#4A3E39] hover:text-[#2C2420] disabled:opacity-30 transition-colors"
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                disabled={cannotAdd}
                className={`flex-1 py-3.5 px-6 rounded-md text-xs sm:text-sm font-medium transition-all shadow-xs flex items-center justify-center gap-2 ${
                  cannotAdd
                    ? 'bg-[#E8DACB] text-[#8C7A70] cursor-not-allowed'
                    : 'bg-[#2C2420] text-[#F5EFEB] hover:bg-[#1A1614] active:scale-[0.99]'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#C69A58]" />
                <span>
                  {cannotAdd
                    ? 'Indisponible'
                    : `Ajouter au panier · ${(product.price * quantity).toFixed(3)} TND`}
                </span>
              </button>
            </div>
          </div>

          {/* Cash on Delivery Trust Box */}
          <div className="p-4 rounded-lg bg-[#F5EFEB] border border-[#E8DFD5] space-y-2.5 text-xs text-[#4A3E39]">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#C69A58] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#2C2420]">Paiement à la livraison (Cash on Delivery) :</strong>
                <p className="text-[11px] text-[#8C7A70] mt-0.5">
                  Commandez en toute sérénité. Vous ne réglez le montant qu'en espèces au livreur lors de la réception de votre colis.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-[#E8DFD5]/60">
              <ShieldCheck className="w-4 h-4 text-[#C69A58] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#2C2420]">Qualité hypoallergénique :</strong>
                <p className="text-[11px] text-[#8C7A70] mt-0.5">
                  Conçu en acier inoxydable de haute résistance, sans plomb ni nickel.
                </p>
              </div>
            </div>
          </div>

          {/* Details & Care Tabs */}
          <div className="pt-2 border-t border-[#E8DFD5]">
            <div className="flex border-b border-[#E8DFD5] text-xs">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2.5 pr-4 font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'details'
                    ? 'border-[#2C2420] text-[#2C2420]'
                    : 'border-transparent text-[#8C7A70] hover:text-[#2C2420]'
                }`}
              >
                Matières & Dimensions
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`pb-2.5 px-4 font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'care'
                    ? 'border-[#2C2420] text-[#2C2420]'
                    : 'border-transparent text-[#8C7A70] hover:text-[#2C2420]'
                }`}
              >
                Entretien
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`pb-2.5 px-4 font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'delivery'
                    ? 'border-[#2C2420] text-[#2C2420]'
                    : 'border-transparent text-[#8C7A70] hover:text-[#2C2420]'
                }`}
              >
                Livraison & Frais
              </button>
            </div>

            <div className="py-4 text-xs text-[#615249] leading-relaxed">
              {activeTab === 'details' && (
                <div className="space-y-2">
                  <p><strong>Composition :</strong> {product.material}</p>
                  {product.dimensions && <p><strong>Dimensions :</strong> {product.dimensions}</p>}
                  <p className="text-[#8C7A70]">{product.fullDescription}</p>
                </div>
              )}
              {activeTab === 'care' && (
                <div className="space-y-2">
                  <p>{product.careInstructions || 'Nos bijoux en acier inoxydable résistent à l\'eau douce du quotidien. Pour préserver leur brillance optimale, évitez les produits décapants, l\'eau chlorée des piscines et les parfums pulvérisés directement sur le bijou.'}</p>
                  <p className="text-[#8C7A70]">Chaque bijou est accompagné de son pochon de rangement velours protecteur.</p>
                </div>
              )}
              {activeTab === 'delivery' && (
                <div className="space-y-2">
                  <p>
                    <strong>Tarif livraison :</strong> {settings.standardDeliveryFee.toFixed(3)} TND
                    (offerte dès {settings.freeDeliveryThreshold.toFixed(3)} TND).
                  </p>
                  <p>
                    <strong>Délai indiqué :</strong> {settings.estimatedDeliveryDays}. Le paiement à la
                    livraison n&apos;est encaissé qu&apos;à la remise du colis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-[#E8DFD5]">
          <div className="text-center max-w-md mx-auto mb-8">
            <span className="text-xs uppercase tracking-widest text-[#9A7235] font-medium">
              Harmonie de style
            </span>
            <h3 className="font-serif text-2xl text-[#2C2420] mt-1">
              Vous aimerez aussi
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {recentProducts.length > 0 && (
        <section className="pt-10 border-t border-[#E8DFD5]">
          <h3 className="font-serif text-2xl text-[#2C2420] mb-6">Vus récemment</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
