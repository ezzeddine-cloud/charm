import React, { useState } from 'react';
import { SHOP_EMAIL, SHOP_INSTAGRAM, SHOP_NAME } from '@/lib/shop-rules';
import { Truck, RotateCcw, ShieldCheck, FileText } from 'lucide-react';

interface PolicyViewProps {
  initialTab?: 'delivery' | 'returns' | 'privacy' | 'terms';
}

export const PolicyView: React.FC<PolicyViewProps> = ({ initialTab = 'delivery' }) => {
  const [activeTab, setActiveTab] = useState<'delivery' | 'returns' | 'privacy' | 'terms'>(
    initialTab
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#9A7235] font-medium">
          Informations
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2420] font-medium">
          Livraison, échanges et conditions
        </h1>
        <p className="text-xs sm:text-sm text-[#8C7A70]">
          Ces règles s’appliquent aux commandes passées sur la boutique {SHOP_NAME}, en Tunisie.
        </p>
      </div>

      <div className="flex border-b border-[#E8DFD5] overflow-x-auto text-xs font-medium">
        <TabButton active={activeTab === 'delivery'} onClick={() => setActiveTab('delivery')} icon={<Truck className="w-4 h-4 text-[#C69A58]" />} label="Livraison & paiement" />
        <TabButton active={activeTab === 'returns'} onClick={() => setActiveTab('returns')} icon={<RotateCcw className="w-4 h-4 text-[#C69A58]" />} label="Rétractation & échanges" />
        <TabButton active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')} icon={<ShieldCheck className="w-4 h-4 text-[#C69A58]" />} label="Confidentialité" />
        <TabButton active={activeTab === 'terms'} onClick={() => setActiveTab('terms')} icon={<FileText className="w-4 h-4 text-[#C69A58]" />} label="Conditions générales" />
      </div>

      <div className="text-xs sm:text-sm text-[#615249] leading-relaxed">
        {activeTab === 'delivery' && (
          <Panel title="Livraison et paiement à la livraison">
            <h3 className="font-semibold text-[#2C2420]">Paiement</h3>
            <p>
              Le règlement se fait en espèces, au livreur, au moment de la remise du colis. Aucun paiement en ligne n’est demandé.
            </p>
            <h3 className="font-semibold text-[#2C2420] pt-2">Frais</h3>
            <p>
              Les frais de livraison sont de <strong>7.000 TND</strong> pour les 24 gouvernorats. Ils sont offerts lorsque le montant des articles atteint <strong>120.000 TND</strong>. Le total à payer est affiché avant la confirmation.
            </p>
            <h3 className="font-semibold text-[#2C2420] pt-2">Délai et confirmation</h3>
            <p>
              L’expédition est prévue sous 24 à 48 heures après confirmation. La boutique appelle le numéro indiqué pour vérifier l’adresse avant l’envoi. Une commande non confirmée ou dont le destinataire est injoignable peut être annulée.
            </p>
          </Panel>
        )}

        {activeTab === 'returns' && (
          <Panel title="Droit de rétractation et échanges">
            <p>
              Conformément à la loi n° 2000-83 du 9 août 2000 relative aux échanges et au commerce électronique, la cliente dispose d’un délai de <strong>dix jours</strong> à compter de la réception pour revenir sur sa commande.
            </p>
            <h3 className="font-semibold text-[#2C2420]">Pour exercer ce droit</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Écrire à {SHOP_EMAIL} ou sur Instagram, avec la référence de commande.</li>
              <li>Renvoyer le bijou non porté, dans son état d’origine, avec son emballage.</li>
              <li>Les boucles d’oreilles et piercings dont le sachet d’hygiène a été ouvert ne peuvent pas être repris, pour des raisons d’hygiène.</li>
              <li>Les pièces réalisées spécialement pour une cliente ne sont pas reprises.</li>
            </ul>
            <p>
              Si l’article reçu est abîmé ou ne correspond pas à la commande, la boutique le reprend ou l’échange. Le montant encaissé à la livraison est alors restitué pour les articles concernés.
            </p>
          </Panel>
        )}

        {activeTab === 'privacy' && (
          <Panel title="Protection des données personnelles">
            <p>
              {SHOP_NAME} traite les données nécessaires à la commande, conformément à la loi organique n° 2004-63 du 27 juillet 2004 relative à la protection des données à caractère personnel.
            </p>
            <h3 className="font-semibold text-[#2C2420]">Données utilisées</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom, téléphone, adresse et gouvernorat, pour livrer et confirmer la commande.</li>
              <li>E-mail, s’il est indiqué, pour le compte et les messages liés à la commande.</li>
              <li>Contenu du panier, référence et statut de livraison.</li>
            </ul>
            <h3 className="font-semibold text-[#2C2420]">Destinataires</h3>
            <p>
              Ces informations sont utilisées par la boutique et transmises au transporteur pour la livraison. L’hébergement du site, du compte et des photos est assuré par Neon. Elles ne sont pas vendues. Un e-mail de notification peut être envoyé à la boutique lors d’une nouvelle commande.
            </p>
            <h3 className="font-semibold text-[#2C2420]">Conservation et cookies</h3>
            <p>
              Les commandes sont conservées le temps du suivi, des échanges et des obligations comptables. Le panier reste dans ce navigateur. Un cookie de session est utilisé uniquement pour le compte cliente. Aucun cookie publicitaire n’est déposé.
            </p>
          </Panel>
        )}

        {activeTab === 'terms' && (
          <Panel title="Conditions générales de vente">
            <h3 className="font-semibold text-[#2C2420]">Éditeur</h3>
            <p>
              La boutique en ligne {SHOP_NAME} vend des bijoux et accessoires à des clientes en Tunisie. Contact : <a className="underline" href={`mailto:${SHOP_EMAIL}`}>{SHOP_EMAIL}</a> et <a className="underline" href={SHOP_INSTAGRAM} target="_blank" rel="noreferrer">Instagram</a>. Le téléphone sera indiqué sur la page Contact dès qu’il est publié.
            </p>
            <h3 className="font-semibold text-[#2C2420]">Commande</h3>
            <p>
              Les prix sont affichés en dinars tunisiens et comprennent les taxes applicables. La commande est formée lorsque la cliente confirme le formulaire après avoir accepté ces conditions. Le total enregistré est celui calculé par la boutique à partir des prix et du stock affichés, pas d’un montant modifié dans le navigateur.
            </p>
            <h3 className="font-semibold text-[#2C2420]">Disponibilité</h3>
            <p>
              Une pièce en rupture n’est pas confirmée. Si un article n’est plus disponible après la commande, la boutique contacte la cliente avant l’expédition.
            </p>
            <h3 className="font-semibold text-[#2C2420]">Droit applicable</h3>
            <p>
              Les ventes sont soumises au droit tunisien, notamment la loi n° 2000-83 du 9 août 2000 relative aux échanges et au commerce électronique. Les litiges sont portés devant les juridictions tunisiennes compétentes.
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
};

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors -mb-px ${
        active ? 'border-[#2C2420] text-[#2C2420]' : 'border-transparent text-[#8C7A70] hover:text-[#2C2420]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 bg-[#FAF7F2] p-6 sm:p-8 rounded-xl border border-[#E8DFD5]">
      <h2 className="font-serif text-xl text-[#2C2420]">{title}</h2>
      {children}
    </div>
  );
}
