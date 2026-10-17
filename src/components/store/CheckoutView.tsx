import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { TUNISIAN_GOVERNORATES } from '../../data/mockData';
import { CustomerAddress } from '../../types';
import {
  ShieldCheck,
  Truck,
  Banknote,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    subtotal,
    deliveryFee,
    discountAmount,
    finalTotal,
    appliedDiscount,
    applyDiscountCode,
    removeDiscount,
    settings,
    createOrder,
    navigateTo,
    showToast,
    hydrated,
  } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [governorate, setGovernorate] = useState(TUNISIAN_GOVERNORATES[0]);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [consentTerms, setConsentTerms] = useState(false);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-sm text-[#8C7A70]">
        Chargement de la commande…
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F4EADA] flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-[#C69A58]" />
        </div>
        <h2 className="font-serif text-2xl text-[#2C2420] mb-2">Votre panier est vide</h2>
        <p className="text-xs sm:text-sm text-[#8C7A70] max-w-sm mx-auto mb-6">
          Ajoutez un ou plusieurs bijoux à votre panier pour procéder à la commande en paiement à la livraison.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-3 bg-[#2C2420] text-[#F5EFEB] rounded-md text-xs font-medium hover:bg-[#1A1614] transition-colors"
        >
          Découvrir la Boutique
        </button>
      </div>
    );
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    const res = applyDiscountCode(promoCodeInput);
    setPromoMessage({ text: res.message, error: !res.success });
    if (res.success) {
      setPromoCodeInput('');
    }
  };

  const validatePhone = (val: string) => {
    // Tunisian numbers are generally 8 digits (e.g. 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 50-58, 90-99)
    const digits = val.replace(/\D/g, '');
    if (digits.length !== 8) {
      return 'Veuillez saisir un numéro de téléphone tunisien valide à 8 chiffres (ex: 28 456 789).';
    }
    return '';
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const err = validatePhone(phone);
    if (err) {
      setPhoneError(err);
      showToast(err, 'error');
      return;
    }
    setPhoneError('');

    if (!fullName.trim() || !city.trim() || !address.trim()) {
      showToast('Veuillez renseigner tous les champs obligatoires marqués d\'un astérisque (*).', 'error');
      return;
    }

    if (!consentTerms) {
      showToast('Veuillez accepter les conditions de commande pour continuer.', 'info');
      return;
    }

    setSubmitting(true);

    const customerData: CustomerAddress = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      governorate,
      city: city.trim(),
      address: address.trim(),
      deliveryNotes: deliveryNotes.trim() || undefined,
    };

    void (async () => {
      try {
        await createOrder(customerData);
      } catch {
        // The store already explains a failed save.
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#8C7A70] mb-6">
        <button onClick={() => navigateTo('home')} className="hover:text-[#2C2420]">
          Accueil
        </button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigateTo('shop')} className="hover:text-[#2C2420]">
          Boutique
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#2C2420] font-medium">Validation de commande</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl text-[#2C2420] font-medium">
          Finaliser ma Commande
        </h1>
        <p className="text-xs sm:text-sm text-[#8C7A70] mt-1">
          Paiement à la livraison partout en Tunisie (Cash on Delivery). Réglez en toute tranquillité à la remise du colis.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Delivery Details & Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Coordonnées du Destinataire */}
            <div className="p-5 sm:p-6 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E8DFD5]">
                <span className="w-6 h-6 rounded-full bg-[#2C2420] text-[#F5EFEB] text-xs font-semibold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-serif text-base sm:text-lg font-medium text-[#2C2420]">
                  Coordonnées de Livraison
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-[#4A3E39] block mb-1">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Nour Ben Salem"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs sm:text-sm text-[#2C2420] focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#4A3E39] block mb-1">
                    Numéro de Téléphone (Tunisie) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-[#8C7A70] font-medium">
                      +216
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError('');
                      }}
                      placeholder="Ex: 28 456 789"
                      className="w-full pl-13 pr-3 py-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs sm:text-sm text-[#2C2420] focus:outline-none focus:border-[#9A7235]"
                    />
                  </div>
                  {phoneError ? (
                    <p className="text-[11px] text-rose-700 mt-1">{phoneError}</p>
                  ) : (
                    <p className="text-[10px] text-[#8C7A70] mt-1">
                      Indispensable pour la confirmation téléphonique et le livreur.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-[#4A3E39] block mb-1">
                    Email (facultatif)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Pour recevoir le récapitulatif"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs sm:text-sm text-[#2C2420] focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#4A3E39] block mb-1">
                    Gouvernorat *
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs sm:text-sm text-[#2C2420] focus:outline-none focus:border-[#9A7235]"
                  >
                    {TUNISIAN_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#4A3E39] block mb-1">
                    Délégation / Cité / Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: La Marsa, El Menzah 9, Sahloul..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs sm:text-sm text-[#2C2420] focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-[#4A3E39] block mb-1">
                    Adresse Complète de Livraison *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rue, numéro, résidence, bâtiment, étage..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs sm:text-sm text-[#2C2420] focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-[#4A3E39] block mb-1">
                    Instructions spécifiques pour le livreur (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Ex: Appeler avant de passer, livrer l'après-midi, etc."
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs text-[#2C2420] focus:outline-none focus:border-[#9A7235]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method Selection (Cash on Delivery) */}
            <div className="p-5 sm:p-6 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E8DFD5]">
                <span className="w-6 h-6 rounded-full bg-[#2C2420] text-[#F5EFEB] text-xs font-semibold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-serif text-base sm:text-lg font-medium text-[#2C2420]">
                  Mode de Règlement
                </h2>
              </div>

              {/* COD Option Highlight */}
              <div className="p-4 rounded-lg bg-[#F4EADA]/70 border-2 border-[#C69A58] flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#C69A58]/40 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5 text-[#9A7235]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-semibold text-[#2C2420]">
                      Paiement en espèces à la livraison (Cash on Delivery)
                    </span>
                    <span className="text-[11px] font-semibold text-[#9A7235] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E8DFD5]">
                      Actif
                    </span>
                  </div>
                  <p className="text-xs text-[#615249] mt-1 leading-relaxed">
                    Vous ne déboursez rien en ligne. Vous réglerez le montant total de <strong className="text-[#2C2420] font-semibold tabular-nums">{finalTotal.toFixed(3)} TND</strong> directement en espèces au coursier lorsqu'il vous remettra votre colis.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-md border border-[#E8DFD5] text-[11px] text-[#8C7A70] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#9A7235] shrink-0" />
                <span>
                  <strong>Distinction importante :</strong> L'envoi de ce formulaire enregistre votre demande de commande. Le paiement ne sera considéré comme effectué qu'une fois la somme collectée par le livreur.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Confirmation Action */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="p-5 sm:p-6 bg-[#F5EFEB]/70 rounded-xl border border-[#E8DFD5] shadow-xs space-y-5">
              <h2 className="font-serif text-base sm:text-lg font-medium text-[#2C2420] pb-3 border-b border-[#E8DFD5]">
                Récapitulatif de Commande ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>

              {/* Items List */}
              <div className="divide-y divide-[#E8DFD5]/60 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-2.5 first:pt-0 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-[#FAF7F2] border border-[#E8DFD5] overflow-hidden shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-xs font-medium text-[#2C2420] truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-[#8C7A70]">
                        Qté : {item.quantity} {item.selectedVariant && `· ${item.selectedVariant.name}`}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-[#2C2420] tabular-nums shrink-0">
                      {(item.product.price * item.quantity).toFixed(3)} TND
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-[#E8DFD5]">
                {appliedDiscount ? (
                  <div className="flex items-center justify-between p-2 rounded-md bg-[#FAF7F2] border border-[#C69A58]/30 text-xs">
                    <span className="text-[#9A7235]">
                      Code <strong>{appliedDiscount.code}</strong> appliqué (-{discountAmount.toFixed(3)} TND)
                    </span>
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="text-xs text-[#8C7A70] hover:text-rose-700 underline"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Code promo (ex: CHARM10)"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs uppercase placeholder:normal-case focus:outline-none focus:border-[#9A7235]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3 py-1.5 bg-[#4A3E39] text-[#F5EFEB] rounded-md text-xs font-medium hover:bg-[#2C2420]"
                    >
                      Appliquer
                    </button>
                  </div>
                )}
                {promoMessage && (
                  <p
                    className={`text-[11px] mt-1 ${
                      promoMessage.error ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Financial Totals */}
              <div className="space-y-2 text-xs text-[#4A3E39] pt-3 border-t border-[#E8DFD5]">
                <div className="flex justify-between">
                  <span>Sous-total articles</span>
                  <span className="font-medium text-[#2C2420] tabular-nums">
                    {subtotal.toFixed(3)} TND
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#9A7235]">
                    <span>Réduction</span>
                    <span className="font-medium tabular-nums">-{discountAmount.toFixed(3)} TND</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Frais de livraison (Tunisie)</span>
                  <span className="font-medium tabular-nums">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-semibold">Gratuit</span>
                    ) : (
                      `${deliveryFee.toFixed(3)} TND`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-semibold text-[#2C2420] pt-2 border-t border-[#E8DFD5]">
                  <span>Total à payer à la livraison</span>
                  <span className="text-[#9A7235] text-lg tabular-nums">
                    {finalTotal.toFixed(3)} TND
                  </span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2 text-xs text-[#615249] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#9A7235] focus:ring-0"
                />
                <span>
                  J’accepte les{' '}
                  <button type="button" onClick={() => navigateTo('policy_terms')} className="underline">
                    conditions générales
                  </button>{' '}
                  et la{' '}
                  <button type="button" onClick={() => navigateTo('policy_privacy')} className="underline">
                    politique de confidentialité
                  </button>
                  . Je confirme une commande à régler à la livraison pour{' '}
                  <strong>{finalTotal.toFixed(3)} TND</strong>.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-[#2C2420] text-[#F5EFEB] rounded-md text-xs sm:text-sm font-semibold hover:bg-[#1A1614] transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Validation en cours...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#C69A58]" />
                    <span>Confirmer la Commande ({finalTotal.toFixed(3)} TND)</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-[#8C7A70] flex items-center justify-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C69A58]" />
                <span>Expédition rapide en 24h à 48h partout en Tunisie</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
