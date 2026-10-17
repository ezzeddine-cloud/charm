'use client';

import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export function CartView() {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    discountAmount,
    finalTotal,
    navigateTo,
    settings,
    hydrated,
  } = useStore();

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-sm text-[#8C7A70]">Chargement du panier…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2420]">Votre panier</h1>
      <p className="text-sm text-[#8C7A70] mt-2 mb-8">
        Le panier est conservé dans ce navigateur.
      </p>

      {cart.length === 0 ? (
        <div className="border border-dashed border-[#E8DFD5] rounded-xl p-10 text-center">
          <ShoppingBag className="w-8 h-8 text-[#C69A58] mx-auto mb-3" />
          <h2 className="font-serif text-2xl">Votre panier est vide</h2>
          <p className="text-sm text-[#8C7A70] mt-2 mb-6">Ajoutez une pièce pour passer commande.</p>
          <button
            onClick={() => navigateTo('shop')}
            className="px-5 py-3 bg-[#2C2420] text-[#FAF7F2] rounded-md text-xs font-medium"
          >
            Continuer mes achats
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8">
          <ul className="lg:col-span-7 divide-y divide-[#E8DFD5] border-y border-[#E8DFD5]">
            {cart.map((item) => (
              <li key={item.id} className="py-5 flex gap-4">
                <img
                  src={item.product.images[0]}
                  alt=""
                  className="w-24 h-24 object-cover rounded-md border border-[#E8DFD5] bg-[#F4EADA]"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-lg leading-tight">{item.product.name}</h2>
                  {item.selectedVariant && (
                    <p className="text-xs text-[#8C7A70] mt-1">{item.selectedVariant.name}</p>
                  )}
                  <p className="text-sm mt-2 tabular-nums">{item.product.price.toFixed(3)} TND</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center border border-[#E8DFD5] rounded-md">
                      <button
                        type="button"
                        aria-label="Diminuer"
                        className="p-2"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Augmenter"
                        className="p-2"
                        disabled={item.quantity >= item.product.stock}
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-[#8C7A70] inline-flex items-center gap-1 hover:text-rose-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Retirer
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium tabular-nums">
                  {(item.product.price * item.quantity).toFixed(3)} TND
                </p>
              </li>
            ))}
          </ul>

          <aside className="lg:col-span-5 bg-[#F5EFEB] border border-[#E8DFD5] rounded-xl p-6 h-fit space-y-3 text-sm">
            <h2 className="font-serif text-xl">Récapitulatif</h2>
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span className="tabular-nums">{subtotal.toFixed(3)} TND</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#9A7235]">
                <span>Réduction</span>
                <span className="tabular-nums">-{discountAmount.toFixed(3)} TND</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Livraison estimée</span>
              <span className="tabular-nums">
                {deliveryFee === 0 ? 'Offerte' : `${deliveryFee.toFixed(3)} TND`}
              </span>
            </div>
            <p className="text-xs text-[#8C7A70]">
              Seuil de livraison offerte configuré à {settings.freeDeliveryThreshold.toFixed(3)} TND.
            </p>
            <div className="flex justify-between font-medium pt-3 border-t border-[#E8DFD5] text-base">
              <span>Total</span>
              <span className="tabular-nums">{finalTotal.toFixed(3)} TND</span>
            </div>
            <p className="text-xs text-[#8C7A70]">
              Paiement à la livraison : ce total n&apos;est pas encaissé tant que le colis n&apos;est pas remis.
            </p>
            <button
              onClick={() => navigateTo('checkout')}
              className="w-full py-3 bg-[#2C2420] text-[#FAF7F2] rounded-md text-sm font-medium inline-flex items-center justify-center gap-2"
            >
              Passer à la commande
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('shop')}
              className="w-full py-2 text-xs text-[#4A3E39] hover:text-[#2C2420]"
            >
              Continuer mes achats
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
