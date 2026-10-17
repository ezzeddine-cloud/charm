import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  X,
  Phone,
  Eye,
  Filter,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export const AdminOrdersView: React.FC<{ initialOrderId?: string }> = ({ initialOrderId }) => {
  const { orders, updateOrderStatus, updatePaymentStatus } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'octobre' | 'septembre'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notesInput, setNotesInput] = useState('');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;
    if (dateFilter === 'octobre' && !o.createdAt.toLowerCase().includes('octobre')) return false;
    if (dateFilter === 'septembre' && !o.createdAt.toLowerCase().includes('septembre')) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = o.customer.fullName.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
      const matchCity = o.customer.city.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchCity) return false;
    }
    return true;
  });

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setNotesInput(order.internalNotes || '');
  };

  useEffect(() => {
    if (!initialOrderId) return;
    const match = orders.find((order) => order.id === initialOrderId);
    if (match) {
      setSelectedOrder(match);
      setNotesInput(match.internalNotes || '');
    }
  }, [initialOrderId, orders]);

  const handleSaveNotes = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, selectedOrder.orderStatus, notesInput);
      setSelectedOrder({ ...selectedOrder, internalNotes: notesInput });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-[#2C2420] font-medium">
            Traitement des Commandes ({orders.length})
          </h1>
          <p className="text-xs text-[#8C7A70] mt-0.5">
            Gérez le flux de validation téléphonique, expédition et encaissement en espèces (COD).
          </p>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par réf (#CHM), cliente, tél..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
          />
          <Search className="w-3.5 h-3.5 text-[#8C7A70] absolute left-2.5 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8C7A70]">Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs focus:outline-none focus:border-[#9A7235]"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending_confirmation">En attente confirmation</option>
              <option value="confirmed">Confirmée</option>
              <option value="preparing">En préparation</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#8C7A70]">Paiement COD :</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs focus:outline-none focus:border-[#9A7235]"
            >
              <option value="all">Tous les encaissements</option>
              <option value="pending_cod">À encaisser à la livraison</option>
              <option value="collected">Encaissé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#8C7A70]">Période :</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'octobre' | 'septembre')}
              className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs"
            >
              <option value="all">Toutes les dates</option>
              <option value="octobre">Octobre 2026</option>
              <option value="septembre">Septembre 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EFEB] text-[#8C7A70] uppercase tracking-wider text-[10px] border-b border-[#E8DFD5]">
              <tr>
                <th className="py-3 px-4">Commande</th>
                <th className="py-3 px-4">Cliente & Contact</th>
                <th className="py-3 px-4">Gouvernorat</th>
                <th className="py-3 px-4">Total COD</th>
                <th className="py-3 px-4">Statut Commande</th>
                <th className="py-3 px-4">Encaissement</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFD5]/60 text-[#4A3E39]">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#F5EFEB]/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#2C2420] font-serif block">
                      #{o.id}
                    </span>
                    <span className="text-[10px] text-[#8C7A70]">{o.createdAt}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-[#2C2420] block">{o.customer.fullName}</span>
                    <span className="text-[10px] text-[#8C7A70] font-mono">
                      +216 {o.customer.phone}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[#2C2420] block">{o.customer.city}</span>
                    <span className="text-[10px] text-[#8C7A70]">{o.customer.governorate}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#2C2420] tabular-nums">
                    {o.total.toFixed(3)} TND
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="px-2 py-1 rounded bg-[#FAF7F2] border border-[#E8DFD5] text-[11px] font-medium text-[#2C2420]"
                    >
                      <option value="pending_confirmation">À confirmer</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="preparing">En préparation</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() =>
                        updatePaymentStatus(
                          o.id,
                          o.paymentStatus === 'collected' ? 'pending_cod' : 'collected'
                        )
                      }
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                        o.paymentStatus === 'collected'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {o.paymentStatus === 'collected' ? '✓ Encaissé' : 'À encaisser'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openOrderDetail(o)}
                      className="px-2.5 py-1 text-xs text-[#9A7235] hover:text-[#2C2420] hover:bg-[#F4EADA] rounded-md transition-colors"
                    >
                      Fiche complète
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-xl shadow-2xl border border-[#E8DFD5] overflow-hidden my-8">
            <div className="p-5 border-b border-[#E8DFD5] flex items-center justify-between bg-[#F5EFEB]/60">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-medium text-[#2C2420]">
                  Fiche Commande #{selectedOrder.id}
                </span>
                <span className="text-xs text-[#8C7A70]">({selectedOrder.createdAt})</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[#8C7A70] hover:text-[#2C2420]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Customer & Address Card */}
              <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E8DFD5] space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD5]">
                  <span className="font-serif text-sm font-semibold text-[#2C2420]">
                    Destinataire
                  </span>
                  <a
                    href={`tel:+216${selectedOrder.customer.phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1 text-[#9A7235] font-semibold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Appeler la cliente</span>
                  </a>
                </div>
                <p><strong>Nom complet :</strong> {selectedOrder.customer.fullName}</p>
                <p><strong>Téléphone :</strong> +216 {selectedOrder.customer.phone}</p>
                {selectedOrder.customer.email && <p><strong>Email :</strong> {selectedOrder.customer.email}</p>}
                <p><strong>Gouvernorat :</strong> {selectedOrder.customer.governorate} — {selectedOrder.customer.city}</p>
                <p><strong>Adresse détaillée :</strong> {selectedOrder.customer.address}</p>
                {selectedOrder.customer.deliveryNotes && (
                  <p className="text-amber-900 bg-amber-50 p-2 rounded">
                    <strong>Note spéciale de livraison :</strong> {selectedOrder.customer.deliveryNotes}
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-serif text-sm font-semibold text-[#2C2420]">
                  Articles commandés ({selectedOrder.items.length})
                </h4>
                <div className="border border-[#E8DFD5] rounded-lg divide-y divide-[#E8DFD5] overflow-hidden">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#FAF7F2] border border-[#E8DFD5] overflow-hidden shrink-0">
                          <img src={it.productImage} alt={it.productName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-serif font-medium text-[#2C2420]">{it.productName}</div>
                          <div className="text-[10px] text-[#8C7A70]">
                            SKU: {it.sku} {it.variantName && `· ${it.variantName}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#2C2420] tabular-nums">
                          {(it.price * it.quantity).toFixed(3)} TND
                        </div>
                        <div className="text-[10px] text-[#8C7A70]">
                          {it.quantity} x {it.price.toFixed(3)} TND
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-[#F5EFEB] space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Sous-total :</span>
                    <span className="tabular-nums">{selectedOrder.subtotal.toFixed(3)} TND</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-[#9A7235]">
                      <span>Remise promo :</span>
                      <span className="tabular-nums">-{selectedOrder.discountAmount.toFixed(3)} TND</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Frais livraison :</span>
                    <span className="tabular-nums">{selectedOrder.deliveryFee.toFixed(3)} TND</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#2C2420] pt-1 border-t border-[#E8DFD5]">
                    <span>Total à encaisser :</span>
                    <span className="text-[#9A7235] text-sm tabular-nums">
                      {selectedOrder.total.toFixed(3)} TND
                    </span>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-[#4A3E39] block mb-1 font-semibold">
                  Notes internes (visibles uniquement par l'équipe)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Ex: Cliente injoignable, relancer à 18h..."
                    className="flex-1 px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3 py-1.5 bg-[#2C2420] text-white rounded-md hover:bg-[#1A1614]"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E8DFD5] bg-[#F5EFEB]/50 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#2C2420] text-white rounded-md text-xs font-medium"
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
