import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, Tag } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    closeCartDrawer,
    cart,
    updateCartQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    discountAmount,
    finalTotal,
    appliedDiscount,
    applyDiscountCode,
    removeDiscount,
    settings,
    navigateTo,
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isCartDrawerOpen) return null;

  const freeDeliveryRemaining = Math.max(0, settings.freeDeliveryThreshold - subtotal);
  const freeDeliveryPercent = Math.min(
    100,
    (subtotal / settings.freeDeliveryThreshold) * 100
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyDiscountCode(promoInput);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoError('');
      setPromoInput('');
    }
  };

  const handleCheckoutClick = () => {
    closeCartDrawer();
    navigateTo('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCartDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col justify-between border-l border-[#E8DFD5]">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#E8DFD5] flex items-center justify-between bg-[#F5EFEB]/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#9A7235]" />
              <h2 className="font-serif text-lg font-medium text-[#2C2420]">
                Mon Panier ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCartDrawer}
              className="p-1.5 text-[#8C7A70] hover:text-[#2C2420] rounded-full hover:bg-[#E8DACB]/50 transition-colors"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="px-5 py-3 bg-[#F4EADA]/80 border-b border-[#E8DFD5] text-xs">
            {freeDeliveryRemaining > 0 ? (
              <div>
                <p className="text-[#4A3E39] mb-1.5">
                  Plus que <span className="font-semibold text-[#9A7235]">{freeDeliveryRemaining.toFixed(3)} TND</span> pour profiter de la <span className="font-semibold">Livraison Gratuite</span> !
                </p>
                <div className="w-full bg-[#E8DACB] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C69A58] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${freeDeliveryPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Félicitations ! Vous bénéficiez de la livraison offerte en Tunisie.</span>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E8DFD5]/70">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8C7A70]">
                <div className="w-16 h-16 rounded-full bg-[#F4EADA] flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-[#C69A58]" />
                </div>
                <h3 className="font-serif text-lg text-[#2C2420] mb-1">Votre panier est vide</h3>
                <p className="text-xs text-[#8C7A70] max-w-xs mb-6">
                  Découvrez nos créations délicates en acier inoxydable et trouvez votre bijou coup de cœur.
                </p>
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigateTo('shop');
                  }}
                  className="px-5 py-2.5 bg-[#2C2420] text-[#F5EFEB] rounded-md text-xs font-medium hover:bg-[#1A1614] transition-colors"
                >
                  Découvrir la collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-md bg-[#F4EADA] overflow-hidden shrink-0 border border-[#E8DFD5]">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif text-sm font-medium text-[#2C2420] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#8C7A70] hover:text-rose-700 transition-colors p-1"
                          aria-label="Supprimer du panier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedVariant && (
                        <p className="text-[11px] text-[#8C7A70] mt-0.5">
                          Option : {item.selectedVariant.name}
                        </p>
                      )}

                      <div className="text-xs font-semibold text-[#2C2420] mt-1 tabular-nums">
                        {(item.product.price * item.quantity).toFixed(3)} TND
                      </div>
                    </div>

                    {/* Quantity Steppers */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E8DFD5]/40">
                      <div className="flex items-center border border-[#E8DFD5] rounded-md bg-[#FAF7F2]">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-[#9A7235] text-[#4A3E39] transition-colors"
                          aria-label="Diminuer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium tabular-nums text-[#2C2420]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-[#9A7235] text-[#4A3E39] transition-colors"
                          aria-label="Augmenter"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-[11px] text-[#8C7A70] tabular-nums">
                        {item.product.price.toFixed(3)} TND / pièce
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#E8DFD5] bg-[#F5EFEB]/50 space-y-3">
              {/* Promo Code Input */}
              <div>
                {appliedDiscount ? (
                  <div className="flex items-center justify-between p-2 rounded-md bg-[#FAF7F2] border border-[#C69A58]/30 text-xs">
                    <div className="flex items-center gap-1.5 text-[#9A7235] font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Code appliqué : <strong>{appliedDiscount.code}</strong> (-{discountAmount.toFixed(3)} TND)</span>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-[#8C7A70] hover:text-rose-700 text-xs underline"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Code promo (ex: CHARM10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs uppercase placeholder:normal-case focus:outline-none focus:border-[#9A7235]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#4A3E39] text-[#F5EFEB] rounded-md text-xs font-medium hover:bg-[#2C2420] transition-colors"
                    >
                      Appliquer
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-700 mt-1">{promoError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#4A3E39] pt-2 border-t border-[#E8DFD5]">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span className="font-medium text-[#2C2420] tabular-nums">
                    {subtotal.toFixed(3)} TND
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#9A7235]">
                    <span>Réduction promo</span>
                    <span className="font-medium tabular-nums">-{discountAmount.toFixed(3)} TND</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Livraison (Paiement à la livraison)</span>
                  <span className="font-medium tabular-nums">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-semibold">Gratuite</span>
                    ) : (
                      `${deliveryFee.toFixed(3)} TND`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-semibold text-[#2C2420] pt-2 border-t border-[#E8DFD5]">
                  <span>Total estimé</span>
                  <span className="text-[#9A7235] text-base tabular-nums">
                    {finalTotal.toFixed(3)} TND
                  </span>
                </div>
                <p className="text-[11px] text-[#8C7A70] text-center pt-0.5">
                  Règlement en espèces à la réception de votre colis.
                </p>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => {
                  closeCartDrawer();
                  navigateTo('cart');
                }}
                className="w-full py-2.5 px-4 border border-[#E8DFD5] text-[#2C2420] rounded-md text-xs font-medium hover:bg-[#F4EADA] transition-colors"
              >
                Voir le panier
              </button>
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 px-4 bg-[#2C2420] text-[#F5EFEB] rounded-md text-sm font-medium hover:bg-[#1A1614] transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Commander (Paiement à la livraison)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={closeCartDrawer}
                className="w-full text-center text-xs text-[#8C7A70] hover:text-[#2C2420] transition-colors py-1"
              >
                Continuer mes achats
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
