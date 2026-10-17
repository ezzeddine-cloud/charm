import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Order } from '../../types';

export const TrackOrderView: React.FC = () => {
  const { selectedOrderRef, navigateTo } = useStore();

  const [inputVal, setInputVal] = useState(selectedOrderRef || '');
  const [phoneVal, setPhoneVal] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = inputVal.trim().toUpperCase().replace('#', '');
    const phone = phoneVal.replace(/\D/g, '');
    if (!ref || phone.length < 8) {
      setSearchedOrder(null);
      setNotFound(true);
      return;
    }
    setSearching(true);
    fetch(`/api/orders?reference=${encodeURIComponent(ref)}&phone=${encodeURIComponent(phone)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.id) {
          setSearchedOrder(data as Order);
          setNotFound(false);
        } else {
          setSearchedOrder(null);
          setNotFound(true);
        }
      })
      .catch(() => {
        setSearchedOrder(null);
        setNotFound(true);
      })
      .finally(() => setSearching(false));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#8C7A70]">
        <button onClick={() => navigateTo('home')} className="hover:text-[#2C2420]">
          Accueil
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#2C2420] font-medium">Suivi de commande</span>
      </nav>

      {/* Header & Search Bar */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#F4EADA] border border-[#C69A58]/30 flex items-center justify-center mx-auto text-[#9A7235]">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl text-[#2C2420] font-medium">
          Suivre Mon Colis Charmies
        </h1>
        <p className="text-xs sm:text-sm text-[#8C7A70]">
          Indiquez la référence et le téléphone utilisés lors de la commande.
        </p>

        <form onSubmit={handleSearch} className="pt-3 space-y-2 max-w-md mx-auto text-left">
          <label className="block text-xs text-[#4A3E39]" htmlFor="order-ref">
            Référence
          </label>
          <input
            id="order-ref"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="CHM-8492"
            className="w-full px-3 py-2.5 bg-white border border-[#E8DFD5] rounded-md text-sm"
          />
          <label className="block text-xs text-[#4A3E39]" htmlFor="order-phone">
            Téléphone (8 chiffres)
          </label>
          <input
            id="order-phone"
            type="tel"
            inputMode="numeric"
            value={phoneVal}
            onChange={(e) => setPhoneVal(e.target.value)}
            placeholder="28 456 789"
            className="w-full px-3 py-2.5 bg-white border border-[#E8DFD5] rounded-md text-sm"
          />
          <button
            type="submit"
            className="w-full px-5 py-2.5 bg-[#2C2420] text-[#F5EFEB] rounded-md text-xs font-medium"
          >
            {searching ? 'Recherche…' : 'Afficher le suivi'}
          </button>
        </form>
      </div>

      {notFound && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-md mx-auto space-y-2">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
          <h3 className="font-serif text-sm font-semibold text-rose-950">
            Aucune commande correspondante
          </h3>
          <p className="text-xs text-rose-800">
            Vérifiez l'orthographe de votre référence ou le numéro de téléphone saisi.
          </p>
        </div>
      )}

      {/* Order Status Display */}
      {searchedOrder && (
        <div className="space-y-8 animate-in fade-in">
          {/* Status Header Strip */}
          <div className="p-5 sm:p-6 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-medium text-[#2C2420]">
                  Commande #{searchedOrder.id}
                </span>
                <span className="text-xs text-[#8C7A70]">· {searchedOrder.createdAt}</span>
              </div>
              <p className="text-xs text-[#8C7A70] mt-0.5">
                Destinataire : <strong>{searchedOrder.customer.fullName}</strong> ({searchedOrder.customer.city}, {searchedOrder.customer.governorate})
              </p>
            </div>

            {/* Status Indicator */}
            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#F4EADA] text-[#9A7235] border border-[#C69A58]/30">
                {searchedOrder.orderStatus === 'pending_confirmation' && 'En attente de confirmation'}
                {searchedOrder.orderStatus === 'confirmed' && 'Commande confirmée'}
                {searchedOrder.orderStatus === 'preparing' && 'En cours de préparation'}
                {searchedOrder.orderStatus === 'shipped' && 'Expédiée / Avec le coursier'}
                {searchedOrder.orderStatus === 'delivered' && 'Livrée avec succès'}
                {searchedOrder.orderStatus === 'cancelled' && 'Commande annulée'}
              </span>

              <div className="text-[11px] text-[#8C7A70] mt-1 tabular-nums">
                {searchedOrder.paymentStatus === 'collected' ? (
                  <span className="text-emerald-700 font-semibold">✓ Montant collecté en espèces</span>
                ) : (
                  <span>À régler à la livraison : <strong>{searchedOrder.total.toFixed(3)} TND</strong></span>
                )}
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="p-6 sm:p-8 bg-[#F5EFEB]/70 rounded-xl border border-[#E8DFD5] shadow-xs">
            <h2 className="font-serif text-base font-medium text-[#2C2420] mb-8 text-center sm:text-left">
              Étape d'Acheminement
            </h2>

            <div className="relative">
              <div className="space-y-8 before:absolute before:inset-0 before:left-4 sm:before:left-5 before:h-full before:w-0.5 before:bg-[#E8DFD5]">
                {searchedOrder.trackingTimeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 sm:gap-6">
                    {/* Circle icon */}
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors z-10 ${
                        step.completed
                          ? 'bg-[#2C2420] text-[#F5EFEB] border-[#2C2420]'
                          : 'bg-[#FAF7F2] text-[#8C7A70] border-[#E8DFD5]'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#C69A58]" />
                      ) : (
                        <Clock className="w-4 h-4 opacity-50" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4
                          className={`text-xs sm:text-sm font-semibold ${
                            step.completed ? 'text-[#2C2420]' : 'text-[#8C7A70]'
                          }`}
                        >
                          {step.label}
                        </h4>
                        <span className="text-[11px] text-[#8C7A70] tabular-nums">
                          {step.date}
                        </span>
                      </div>
                      <p className="text-xs text-[#615249] mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery & Items Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Delivery address */}
            <div className="p-5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#9A7235] font-medium pb-1 border-b border-[#E8DFD5]">
                <MapPin className="w-4 h-4" />
                <span>Adresse de Destination</span>
              </div>
              <p><strong>{searchedOrder.customer.fullName}</strong></p>
              <p>{searchedOrder.customer.address}</p>
              <p>{searchedOrder.customer.city}, {searchedOrder.customer.governorate}</p>
              <p>Tél : +216 {searchedOrder.customer.phone}</p>
            </div>

            {/* Articles */}
            <div className="p-5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#9A7235] font-medium pb-1 border-b border-[#E8DFD5]">
                <Package className="w-4 h-4" />
                <span>Articles dans ce colis</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {searchedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="truncate pr-2">{it.quantity}x {it.productName}</span>
                    <span className="font-semibold tabular-nums shrink-0">{(it.price * it.quantity).toFixed(3)} TND</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-[#E8DFD5] flex justify-between font-semibold text-[#2C2420]">
                <span>Total à payer</span>
                <span className="tabular-nums text-[#9A7235]">{searchedOrder.total.toFixed(3)} TND</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
