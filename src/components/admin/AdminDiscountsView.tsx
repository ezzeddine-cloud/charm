import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';

export const AdminDiscountsView: React.FC = () => {
  const { discounts, addDiscount, toggleDiscountActive, deleteDiscount, showToast } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('10');
  const [minOrder, setMinOrder] = useState('50.000');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('Le code est obligatoire.', 'error');
      return;
    }

    addDiscount({
      code: code.trim().toUpperCase(),
      type,
      value: parseFloat(value) || 0,
      minOrderValue: minOrder ? parseFloat(minOrder) : undefined,
      startDate,
      endDate,
      isActive: true,
    });

    setModalOpen(false);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-[#2C2420] font-medium">
            Codes Promo & Réductions ({discounts.length})
          </h1>
          <p className="text-xs text-[#8C7A70] mt-0.5">
            Configurez des offres promotionnelles applicables au panier d'achat.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#2C2420] text-white rounded-md text-xs font-medium hover:bg-[#1A1614] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#C69A58]" />
          <span>Créer un Code Promo</span>
        </button>
      </div>

      {/* Grid of Discounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {discounts.map((d) => (
          <div
            key={d.id}
            className={`p-5 rounded-xl border transition-all ${
              d.isActive
                ? 'bg-[#FAF7F2] border-[#E8DFD5] shadow-xs'
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-base font-bold text-[#2C2420] tracking-wider px-2.5 py-1 bg-[#F4EADA] rounded border border-[#C69A58]/30">
                {d.code}
              </span>
              <button
                onClick={() => toggleDiscountActive(d.id)}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  d.isActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {d.isActive ? 'Actif' : 'Inactif'}
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-[#4A3E39] mb-4">
              <p>
                <strong>Avantage :</strong>{' '}
                {d.type === 'percentage' ? `${d.value}% de remise` : `${d.value.toFixed(3)} TND de remise fixe`}
              </p>
              {d.minOrderValue && (
                <p className="text-[#8C7A70]">
                  Minimum d'achat : {d.minOrderValue.toFixed(3)} TND
                </p>
              )}
              <p className="text-[#8C7A70]">
                Utilisations : <strong>{d.usageCount}</strong> fois
              </p>
              <p className="text-[#8C7A70] text-[11px]">
                Validité : du {d.startDate} au {d.endDate}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E8DFD5] flex justify-end">
              <button
                onClick={() => deleteDiscount(d.id)}
                className="text-xs text-[#8C7A70] hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FAF7F2] rounded-xl p-5 border border-[#E8DFD5] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD5]">
              <h3 className="font-serif text-base font-semibold text-[#2C2420]">
                Nouveau Code Promotionnel
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-4 h-4 text-[#8C7A70]" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[#4A3E39] block mb-1 font-medium">Code (ex: CHARM15) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="CHARM15"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md font-mono uppercase focus:outline-none focus:border-[#9A7235]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#4A3E39] block mb-1 font-medium">Type de remise</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (TND)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#4A3E39] block mb-1 font-medium">Valeur *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#4A3E39] block mb-1 font-medium">Panier minimum (TND)</label>
                <input
                  type="number"
                  step="1"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="Ex: 50.000"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-[#E8DFD5] text-[#8C7A70] rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2C2420] text-white rounded-md font-medium hover:bg-[#1A1614]"
                >
                  Créer le code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
