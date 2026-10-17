import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Banknote,
  Clock,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { orders, products, navigateToAdmin, updateOrderStatus } = useStore();

  // Metrics
  const totalOrders = orders.length;

  const collectedRevenue = orders
    .filter((o) => o.paymentStatus === 'collected')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingCodRevenue = orders
    .filter((o) => o.paymentStatus === 'pending_cod' && o.orderStatus !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingConfirmation = orders.filter((o) => o.orderStatus === 'pending_confirmation').length;
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 3);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <p className="text-xs text-[#8C7A70] border border-[#E8DFD5] bg-white rounded-lg px-4 py-3">
        Indicateurs calculés sur les commandes fictives de cette interface. Le revenu encaissé est distinct des commandes encore à payer à la livraison.
      </p>
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Collected Cash */}
        <div className="p-5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8C7A70]">
            <span>Revenus Encaissés (COD)</span>
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-semibold text-[#2C2420] tabular-nums">
            {collectedRevenue.toFixed(3)} TND
          </div>
          <p className="text-[11px] text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fonds remis par les livreurs</span>
          </p>
        </div>

        {/* Card 2: Awaiting COD Collection */}
        <div className="p-5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8C7A70]">
            <span>À Encaisser à la Livraison</span>
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-semibold text-[#9A7235] tabular-nums">
            {pendingCodRevenue.toFixed(3)} TND
          </div>
          <p className="text-[11px] text-[#8C7A70]">
            Commandes en cours d'acheminement
          </p>
        </div>

        {/* Card 3: Pending Confirmation */}
        <div className="p-5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8C7A70]">
            <span>En attente de confirmation</span>
            <div className="w-7 h-7 rounded-full bg-[#F4EADA] flex items-center justify-center text-[#9A7235]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-semibold text-[#2C2420] tabular-nums">
            {pendingConfirmation}
          </div>
          <button
            onClick={() => navigateToAdmin('orders')}
            className="text-[11px] text-[#9A7235] hover:underline font-medium block"
          >
            Vérifier les commandes →
          </button>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="p-5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8C7A70]">
            <span>Alertes Stock Faible</span>
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-semibold text-rose-900 tabular-nums">
            {lowStockProducts.length}
          </div>
          <button
            onClick={() => navigateToAdmin('inventory')}
            className="text-[11px] text-rose-700 hover:underline font-medium block"
          >
            Réapprovisionner l'atelier →
          </button>
        </div>
      </div>

      {/* Quick Action Strip */}
      <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[#2C2420]">Actions rapides :</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigateToAdmin('products')}
            className="px-3 py-1.5 bg-[#2C2420] text-white rounded-md text-xs font-medium hover:bg-[#1A1614] flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#C69A58]" />
            <span>Nouveau Bijou</span>
          </button>

          <button
            onClick={() => navigateToAdmin('orders')}
            className="px-3 py-1.5 bg-[#F4EADA] text-[#2C2420] rounded-md text-xs font-medium hover:bg-[#E8DACB] transition-colors"
          >
            Traiter les Commandes
          </button>

          <button
            onClick={() => navigateToAdmin('discounts')}
            className="px-3 py-1.5 bg-[#F4EADA] text-[#2C2420] rounded-md text-xs font-medium hover:bg-[#E8DACB] transition-colors"
          >
            Créer un Code Promo
          </button>
        </div>
      </div>

      {/* Grid: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E8DFD5] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-base font-medium text-[#2C2420]">
                Dernières Commandes Clients
              </h2>
              <p className="text-xs text-[#8C7A70] mt-0.5">
                Suivi du statut de préparation et encaissement à la livraison
              </p>
            </div>
            <button
              onClick={() => navigateToAdmin('orders')}
              className="text-xs text-[#9A7235] hover:underline font-medium"
            >
              Voir tout ({totalOrders})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EFEB] text-[#8C7A70] uppercase tracking-wider text-[10px] border-b border-[#E8DFD5]">
                <tr>
                  <th className="py-3 px-4">Réf & Date</th>
                  <th className="py-3 px-4">Cliente & Ville</th>
                  <th className="py-3 px-4">Montant Total</th>
                  <th className="py-3 px-4">Statut Commande</th>
                  <th className="py-3 px-4">Paiement COD</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD5]/60 text-[#4A3E39]">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#F5EFEB]/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#2C2420] font-serif block">
                        #{o.id}
                      </span>
                      <span className="text-[10px] text-[#8C7A70]">{o.createdAt}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#2C2420] block">{o.customer.fullName}</span>
                      <span className="text-[10px] text-[#8C7A70]">{o.customer.city}, {o.customer.governorate}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#2C2420] tabular-nums">
                      {o.total.toFixed(3)} TND
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          o.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.orderStatus === 'pending_confirmation'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {o.orderStatus === 'pending_confirmation' && 'À confirmer'}
                        {o.orderStatus === 'confirmed' && 'Confirmée'}
                        {o.orderStatus === 'preparing' && 'En préparation'}
                        {o.orderStatus === 'shipped' && 'Expédiée'}
                        {o.orderStatus === 'delivered' && 'Livrée'}
                        {o.orderStatus === 'cancelled' && 'Annulée'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {o.paymentStatus === 'collected' ? (
                        <span className="text-emerald-700 font-medium text-[11px]">
                          ✓ Encaissé
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium text-[11px]">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {o.orderStatus === 'pending_confirmation' && (
                        <button
                          onClick={() => updateOrderStatus(o.id, 'confirmed')}
                          className="px-2 py-1 bg-[#2C2420] text-white rounded text-[10px] hover:bg-[#1A1614]"
                        >
                          Confirmer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Sellers Card */}
        <div className="lg:col-span-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5]">
            <h3 className="font-serif text-base font-medium text-[#2C2420]">
              Pièces Phares
            </h3>
            <span className="text-xs text-[#9A7235]">Top ventes</span>
          </div>

          <div className="space-y-3">
            {bestSellers.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-[#FAF7F2] border border-[#E8DFD5] overflow-hidden shrink-0">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-xs font-semibold text-[#2C2420] truncate">
                    {p.name}
                  </h4>
                  <div className="text-[11px] text-[#8C7A70]">
                    Stock restant : <strong>{p.stock}</strong> pièces
                  </div>
                </div>
                <div className="text-xs font-semibold text-[#2C2420] tabular-nums shrink-0">
                  {p.price.toFixed(3)} TND
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8DFD5]">
            <button
              onClick={() => navigateToAdmin('inventory')}
              className="w-full py-2 bg-[#F4EADA] text-[#2C2420] rounded-md text-xs font-medium hover:bg-[#E8DACB] transition-colors"
            >
              Voir tout le stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
