import React, { useState } from 'react';
import { SHOP_EMAIL, SHOP_INSTAGRAM } from '@/lib/shop-rules';
import { useStore } from '../../context/StoreContext';
import { Phone, Mail, Instagram, Send, CheckCircle2 } from 'lucide-react';

export const ContactView: React.FC = () => {
  const { settings, showToast } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !phone.trim()) return;
    setSending(true);
    void fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, message }),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) {
          showToast(payload.error || `Écrivez directement à ${SHOP_EMAIL}.`, 'error');
          return;
        }
        setSent(true);
        showToast('Message envoyé à la boutique.', 'success');
      })
      .catch(() => showToast(`Écrivez directement à ${SHOP_EMAIL}.`, 'error'))
      .finally(() => setSending(false));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#9A7235] font-medium">
          À Votre Écoute
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2420] font-medium">
          Contactez-Nous
        </h1>
        <p className="text-xs sm:text-sm text-[#8C7A70]">
          Une question sur un bijou, une taille de bague ou le suivi de votre commande ? Notre équipe vous répond avec grand plaisir.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4 text-xs">
          <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
            <h3 className="font-serif text-base text-[#2C2420] pb-2 border-b border-[#E8DFD5]">
              Coordonnées Directes
            </h3>

            {settings.contactPhone ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F4EADA] flex items-center justify-center text-[#9A7235]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Téléphone</span>
                  <span className="font-semibold text-[#2C2420]">{settings.contactPhone}</span>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F4EADA] flex items-center justify-center text-[#9A7235]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[#8C7A70] block">Email</span>
                <a href={`mailto:${settings.contactEmail || SHOP_EMAIL}`} className="font-semibold text-[#2C2420] hover:underline">
                  {settings.contactEmail || SHOP_EMAIL}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F4EADA] flex items-center justify-center text-[#9A7235]">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[#8C7A70] block">Instagram</span>
                <a
                  href={SHOP_INSTAGRAM}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#9A7235] hover:underline"
                >
                  {settings.instagramHandle || '@charmies_by_sousou'}
                </a>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#F5EFEB] border border-[#E8DFD5] space-y-2">
            <h4 className="font-serif text-sm text-[#2C2420]">Horaires de réponse</h4>
            <p className="text-[#8C7A70]">
              Du Lundi au Samedi de 09h00 à 19h30. Nous répondons également en soirée par message Instagram pour vos commandes urgentes.
            </p>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-7 bg-[#FAF7F2] p-6 sm:p-8 rounded-xl border border-[#E8DFD5] shadow-xs">
          <h2 className="font-serif text-xl text-[#2C2420] mb-4">
            Envoyez-nous un petit mot
          </h2>

          {sent ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-lg text-[#2C2420]">Message transmis avec succès !</h3>
              <p className="text-xs text-[#8C7A70]">
                La boutique vous répond sur le numéro indiqué.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-3 px-4 py-2 bg-[#2C2420] text-white rounded text-xs"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[#4A3E39] block mb-1">Votre Nom & Prénom *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Syrine B."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                />
              </div>

              <div>
                <label className="text-[#4A3E39] block mb-1">Téléphone de contact *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 28 456 789"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                />
              </div>

              <div>
                <label className="text-[#4A3E39] block mb-1">Votre message ou question *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Dites-nous ce qui vous ferait plaisir ou posez votre question..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-[#2C2420] text-white rounded-md text-xs font-medium hover:bg-[#1A1614] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#C69A58]" />
                <span>{sending ? 'Envoi…' : 'Envoyer mon message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
