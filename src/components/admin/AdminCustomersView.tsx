import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Customer } from '../../types';
import { Users, Search, Phone, Mail, ShoppingBag, Eye, X } from 'lucide-react';

export const AdminCustomersView: React.FC = () => {
  const { customers, orders } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
      c.governorate.toLowerCase().includes(q)
    );
  });

  const customerOrders = selectedCustomer
    ? orders.filter(
        (o) => o.customer.phone.replace(/\s+/g, '') === selectedCustomer.phone.replace(/\s+/g, '')
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#2C2420] font-medium">
          Fichier Clientes ({customers.length})
        </h1>
        <p className="text-xs text-[#8C7A70] mt-0.5">
          Consultez les coordonnées, localités en Tunisie et historique d'achats de vos clientes.
        </p>
      </div>

      {/* Search */}
      <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] flex items-center gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, gouvernorat..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs focus:outline-none focus:border-[#9A7235]"
          />
          <Search className="w-3.5 h-3.5 text-[#8C7A70] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EFEB] text-[#8C7A70] uppercase tracking-wider text-[10px] border-b border-[#E8DFD5]">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4">Gouvernorat</th>
                <th className="py-3 px-4">Commandes</th>
                <th className="py-3 px-4">Total Dépensé</th>
                <th className="py-3 px-4">Dernière Commande</th>
                <th className="py-3 px-4 text-right">Fiche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFD5]/60 text-[#4A3E39]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#F5EFEB]/50 transition-colors">
                  <td className="py-3 px-4 font-serif font-semibold text-[#2C2420]">
                    {c.fullName}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#8C7A70]">
                    +216 {c.phone}
                  </td>
                  <td className="py-3 px-4">{c.governorate}</td>
                  <td className="py-3 px-4 font-semibold tabular-nums">
                    {c.totalOrders} commande(s)
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#2C2420] tabular-nums">
                    {c.totalSpent.toFixed(3)} TND
                  </td>
                  <td className="py-3 px-4 text-[#8C7A70] text-[11px]">
                    {c.lastOrderDate}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-2.5 py-1 text-xs text-[#9A7235] hover:bg-[#F4EADA] rounded"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#FAF7F2] rounded-xl p-5 border border-[#E8DFD5] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD5]">
              <h3 className="font-serif text-base font-semibold text-[#2C2420]">
                Fiche Cliente : {selectedCustomer.fullName}
              </h3>
              <button onClick={() => setSelectedCustomer(null)}>
                <X className="w-4 h-4 text-[#8C7A70]" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E8DFD5] space-y-1">
                <p><strong>Téléphone :</strong> +216 {selectedCustomer.phone}</p>
                {selectedCustomer.email && <p><strong>Email :</strong> {selectedCustomer.email}</p>}
                <p><strong>Gouvernorat habituel :</strong> {selectedCustomer.governorate}</p>
                {selectedCustomer.notes && (
                  <p className="text-[#8C7A70] italic pt-1">Note : {selectedCustomer.notes}</p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-serif text-sm font-semibold text-[#2C2420]">
                  Commandes passées ({customerOrders.length})
                </h4>
                {customerOrders.length === 0 ? (
                  <p className="text-[#8C7A70] italic">Aucune commande enregistrée.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {customerOrders.map((o) => (
                      <div
                        key={o.id}
                        className="p-2.5 bg-[#FAF7F2] rounded border border-[#E8DFD5] flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-[#2C2420]">#{o.id}</strong>
                          <span className="text-[10px] text-[#8C7A70] ml-2">{o.createdAt}</span>
                        </div>
                        <span className="font-semibold tabular-nums text-[#9A7235]">
                          {o.total.toFixed(3)} TND
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 bg-[#2C2420] text-white rounded text-xs font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
