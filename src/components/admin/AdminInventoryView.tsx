import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { Boxes, Plus, Minus, Search, AlertTriangle, CheckCircle2, History, X } from 'lucide-react';

export const AdminInventoryView: React.FC = () => {
  const { products, adjustStock, inventoryLogs, showToast } = useStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [deltaValue, setDeltaValue] = useState('5');
  const [deltaReason, setDeltaReason] = useState('Réception nouvel arrivage atelier');

  const filteredProducts = products.filter((p) => {
    if (filter === 'low' && (p.stock > p.lowStockThreshold || p.stock <= 0)) return false;
    if (filter === 'out' && p.stock > 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalProduct) return;
    const delta = parseInt(deltaValue, 10);
    if (isNaN(delta) || delta === 0) {
      showToast('Veuillez indiquer un nombre de pièces valide.', 'error');
      return;
    }

    adjustStock(adjustModalProduct.id, delta, deltaReason || 'Ajustement manuel admin');
    showToast(`Stock de "${adjustModalProduct.name}" actualisé (${delta > 0 ? `+${delta}` : delta})`, 'success');
    setAdjustModalProduct(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-[#2C2420] font-medium">
          Gestion des Stocks & Mouvements
        </h1>
        <p className="text-xs text-[#8C7A70] mt-0.5">
          Suivez l'état de l'inventaire en temps réel et réapprovisionnez l'atelier.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par bijou ou SKU..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
          />
          <Search className="w-3.5 h-3.5 text-[#8C7A70] absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#2C2420] text-white'
                : 'bg-[#F4EADA] text-[#4A3E39] hover:bg-[#E8DACB]'
            }`}
          >
            Tous ({products.length})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'low'
                ? 'bg-[#2C2420] text-white'
                : 'bg-[#F4EADA] text-[#4A3E39] hover:bg-[#E8DACB]'
            }`}
          >
            Stock Faible ({products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length})
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'out'
                ? 'bg-[#2C2420] text-white'
                : 'bg-[#F4EADA] text-[#4A3E39] hover:bg-[#E8DACB]'
            }`}
          >
            Rupture ({products.filter((p) => p.stock <= 0).length})
          </button>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EFEB] text-[#8C7A70] uppercase tracking-wider text-[10px] border-b border-[#E8DFD5]">
              <tr>
                <th className="py-3 px-4">Bijou</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Stock Disponible</th>
                <th className="py-3 px-4">Seuil Alerte</th>
                <th className="py-3 px-4">État</th>
                <th className="py-3 px-4 text-right">Ajustement Rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFD5]/60 text-[#4A3E39]">
              {filteredProducts.map((p) => {
                const isOut = p.stock <= 0;
                const isLow = !isOut && p.stock <= p.lowStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-[#F5EFEB]/50 transition-colors">
                    <td className="py-3 px-4 font-serif font-semibold text-[#2C2420]">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#8C7A70]">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4 font-semibold tabular-nums text-sm text-[#2C2420]">
                      {p.stock} pièces
                    </td>
                    <td className="py-3 px-4 text-[#8C7A70] tabular-nums">
                      {p.lowStockThreshold} pièces
                    </td>
                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full text-[10px]">
                          Rupture
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Stock critique
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Optimal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => adjustStock(p.id, -1, 'Vente physique atelier ou ajustement rapide')}
                          disabled={p.stock <= 0}
                          className="w-7 h-7 rounded border border-[#E8DFD5] flex items-center justify-center hover:bg-[#F4EADA] disabled:opacity-30"
                          title="Diminuer de 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustStock(p.id, 1, 'Réassort rapide (+1)')}
                          className="w-7 h-7 rounded border border-[#E8DFD5] flex items-center justify-center hover:bg-[#F4EADA]"
                          title="Ajouter 1 pièce"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setAdjustModalProduct(p);
                            setDeltaValue('10');
                            setDeltaReason('Nouvel arrivage atelier');
                          }}
                          className="px-2.5 py-1 text-[11px] bg-[#2C2420] text-white rounded hover:bg-[#1A1614] ml-1"
                        >
                          Ajuster lot
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement History Log */}
      <div className="p-5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E8DFD5]">
          <History className="w-4 h-4 text-[#9A7235]" />
          <h2 className="font-serif text-base font-medium text-[#2C2420]">
            Journal d'audit des mouvements de stock
          </h2>
        </div>

        <div className="divide-y divide-[#E8DFD5]/60 text-xs">
          {inventoryLogs.slice(0, 8).map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-[#2C2420]">{log.productName}</span>
                <p className="text-[11px] text-[#8C7A70] mt-0.5">{log.reason}</p>
              </div>

              <div className="text-right">
                <span
                  className={`font-semibold tabular-nums ${
                    log.quantityDelta > 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {log.quantityDelta > 0 ? `+${log.quantityDelta}` : log.quantityDelta}
                </span>
                <span className="text-[10px] text-[#8C7A70] block">
                  Stock après : {log.resultingStock} pcs ({log.date})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Batch Adjust Modal */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FAF7F2] rounded-xl p-5 border border-[#E8DFD5] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD5]">
              <h3 className="font-serif text-base font-semibold text-[#2C2420]">
                Ajuster le stock : {adjustModalProduct.name}
              </h3>
              <button onClick={() => setAdjustModalProduct(null)}>
                <X className="w-4 h-4 text-[#8C7A70]" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="text-[#4A3E39] block mb-1">
                  Variation de stock (Positif pour réassort, Négatif pour perte) *
                </label>
                <input
                  type="number"
                  required
                  value={deltaValue}
                  onChange={(e) => setDeltaValue(e.target.value)}
                  placeholder="Ex: 10 ou -2"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                />
              </div>

              <div>
                <label className="text-[#4A3E39] block mb-1">Motif de l'ajustement</label>
                <input
                  type="text"
                  value={deltaReason}
                  onChange={(e) => setDeltaReason(e.target.value)}
                  placeholder="Ex: Réception atelier, inventaire de contrôle..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalProduct(null)}
                  className="px-3 py-1.5 border border-[#E8DFD5] text-[#8C7A70] rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2C2420] text-white rounded-md font-medium hover:bg-[#1A1614]"
                >
                  Appliquer la modification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
