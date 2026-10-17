import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  CheckCircle2,
  Package,
  PhoneCall,
  Truck,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Copy,
} from 'lucide-react';

export const OrderConfirmationView: React.FC = () => {
  const { selectedOrderRef, orders, navigateTo, showToast, hydrated } = useStore();
  const [queryRef, setQueryRef] = React.useState<string | null>(null);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    setQueryRef(new URLSearchParams(window.location.search).get('ref'));
    setChecked(true);
  }, []);

  const order = orders.find((item) => item.id === (queryRef || selectedOrderRef));

  const handleCopyRef = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      showToast('Référence de commande copiée !', 'success');
    }
  };

  if (!hydrated || !checked) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-sm text-[#8C7A70]">
        Préparation de la confirmation…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl text-[#2C2420]">Aucune commande trouvée</h2>
        <button
          onClick={() => navigateTo('shop')}
          className="mt-4 px-5 py-2.5 bg-[#2C2420] text-white rounded-md text-xs"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header Banner */}
      <div className="text-center space-y-4 mb-10">
        <div className="w-16 h-16 rounded-full bg-[#F4EADA] border border-[#C69A58]/30 flex items-center justify-center mx-auto text-[#9A7235] shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#C69A58]/30 text-xs font-medium text-[#9A7235]">
          <Sparkles className="w-3.5 h-3.5 text-[#C69A58]" />
          <span>Commande enregistrée</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2420] font-medium">
          Merci, {order.customer.fullName.split(' ')[0]}
        </h1>

        <p className="text-xs sm:text-sm text-[#615249] max-w-lg mx-auto leading-relaxed">
          Votre commande est enregistrée. Le paiement se fait en espèces à la remise du colis. Notre équipe vous contacte pour confirmer la livraison.
        </p>

        {/* Order Reference Pill */}
        <div className="inline-flex items-center gap-2 p-2 bg-[#F4EADA] rounded-md border border-[#E8DFD5] text-xs">
          <span className="text-[#8C7A70]">Référence de commande :</span>
          <strong className="text-[#2C2420] font-serif text-sm tracking-wide">
            #{order.id}
          </strong>
          <button
            onClick={handleCopyRef}
            className="p-1 hover:text-[#9A7235] text-[#4A3E39] transition-colors"
            title="Copier la référence"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Next Steps & Payment Notice */}
        <div className="md:col-span-7 space-y-6">
          <div className="p-5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-4">
            <h2 className="font-serif text-base font-medium text-[#2C2420] pb-2 border-b border-[#E8DFD5]">
              Que va-t-il se passer maintenant ?
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F4EADA] text-[#9A7235] font-semibold flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C2420]">
                    1. Confirmation téléphonique
                  </h3>
                  <p className="text-[#8C7A70] mt-0.5">
                    Notre service client vous contactera au <strong>+216 {order.customer.phone}</strong> pour confirmer votre adresse et vos disponibilités.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F4EADA] text-[#9A7235] font-semibold flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C2420]">
                    2. Préparation soignée
                  </h3>
                  <p className="text-[#8C7A70] mt-0.5">
                    Vos bijoux sont vérifiés minutieusement et placés dans leurs pochons velours satinés avec une carte personnalisée.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F4EADA] text-[#9A7235] font-semibold flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C2420]">
                    3. Livraison & Paiement en espèces
                  </h3>
                  <p className="text-[#8C7A70] mt-0.5">
                    Le livreur vous remet le colis en mains propres à <strong>{order.customer.city}, {order.customer.governorate}</strong>. Vous lui réglez le montant exact de <strong>{order.total.toFixed(3)} TND</strong> en espèces.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Details */}
          <div className="p-5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs text-xs space-y-2">
            <h3 className="font-serif text-sm font-medium text-[#2C2420] pb-2 border-b border-[#E8DFD5]">
              Adresse de Livraison Enregistrée
            </h3>
            <p><strong>Destinataire :</strong> {order.customer.fullName}</p>
            <p><strong>Téléphone :</strong> +216 {order.customer.phone}</p>
            <p><strong>Localité :</strong> {order.customer.city}, Gouvernorat de {order.customer.governorate}</p>
            <p><strong>Adresse :</strong> {order.customer.address}</p>
            {order.customer.deliveryNotes && (
              <p><strong>Note pour le livreur :</strong> {order.customer.deliveryNotes}</p>
            )}
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="md:col-span-5 space-y-5">
          <div className="p-5 bg-[#F5EFEB]/70 rounded-xl border border-[#E8DFD5] shadow-xs space-y-4">
            <h2 className="font-serif text-base font-medium text-[#2C2420] pb-2 border-b border-[#E8DFD5]">
              Articles Commandés
            </h2>

            <div className="divide-y divide-[#E8DFD5]/60 space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-[#FAF7F2] border border-[#E8DFD5] overflow-hidden shrink-0">
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-xs font-medium text-[#2C2420] truncate">
                      {item.productName}
                    </h3>
                    <div className="text-[11px] text-[#8C7A70]">
                      Qté: {item.quantity} {item.variantName && `· ${item.variantName}`}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[#2C2420] tabular-nums">
                    {(item.price * item.quantity).toFixed(3)} TND
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-[#E8DFD5] space-y-1.5 text-xs text-[#4A3E39]">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span className="font-medium tabular-nums">{order.subtotal.toFixed(3)} TND</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#9A7235]">
                  <span>Réduction</span>
                  <span className="font-medium tabular-nums">-{order.discountAmount.toFixed(3)} TND</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frais de livraison</span>
                <span className="font-medium tabular-nums">
                  {order.deliveryFee === 0 ? 'Offerte' : `${order.deliveryFee.toFixed(3)} TND`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#2C2420] pt-2 border-t border-[#E8DFD5]">
                <span>Total à régler à la livraison</span>
                <span className="text-[#9A7235] text-base tabular-nums">
                  {order.total.toFixed(3)} TND
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => navigateTo('track_order', { orderRef: order.id })}
              className="w-full py-3 bg-[#2C2420] text-[#F5EFEB] rounded-md text-xs font-medium hover:bg-[#1A1614] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Truck className="w-4 h-4 text-[#C69A58]" />
              <span>Suivre l'état de ma commande</span>
            </button>

            <button
              onClick={() => navigateTo('shop')}
              className="w-full py-2.5 bg-transparent border border-[#E8DFD5] text-[#4A3E39] rounded-md text-xs font-medium hover:bg-[#F4EADA] transition-colors"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
