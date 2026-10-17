import React from 'react';
import { useStore } from '../../context/StoreContext';
import { BarChart3, TrendingUp, DollarSign, Package, PieChart, CheckCircle2 } from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const { orders, products } = useStore();

  const totalRevenueCollected = orders
    .filter((o) => o.paymentStatus === 'collected')
    .reduce((a, b) => a + b.total, 0);

  const pendingCollection = orders
    .filter((o) => o.paymentStatus === 'pending_cod' && o.orderStatus !== 'cancelled')
    .reduce((a, b) => a + b.total, 0);

  const totalVolume = orders.reduce((a, b) => a + b.total, 0);

  // Status breakdown
  const statusCounts = {
    pending: orders.filter((o) => o.orderStatus === 'pending_confirmation').length,
    confirmed: orders.filter((o) => o.orderStatus === 'confirmed').length,
    preparing: orders.filter((o) => o.orderStatus === 'preparing').length,
    shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
    cancelled: orders.filter((o) => o.orderStatus === 'cancelled').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-[#2C2420] font-medium">
          Rapports Financiers & Activité Commerciale
        </h1>
        <p className="text-xs text-[#8C7A70] mt-0.5">
          Suivi des performances de vente, ventilations Cash on Delivery et distribution des commandes.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] shadow-xs space-y-1">
          <span className="text-xs text-[#8C7A70]">Total Volume Commandé</span>
          <div className="font-serif text-2xl font-semibold text-[#2C2420] tabular-nums">
            {totalVolume.toFixed(3)} TND
          </div>
          <span className="text-[11px] text-[#8C7A70]">{orders.length} commandes au total</span>
        </div>

        <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] shadow-xs space-y-1">
          <span className="text-xs text-[#8C7A70]">Encaissé & Versé (Espèces)</span>
          <div className="font-serif text-2xl font-semibold text-emerald-800 tabular-nums">
            {totalRevenueCollected.toFixed(3)} TND
          </div>
          <span className="text-[11px] text-emerald-700">Collecté après livraison</span>
        </div>

        <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] shadow-xs space-y-1">
          <span className="text-xs text-[#8C7A70]">En Transit / À Collecter</span>
          <div className="font-serif text-2xl font-semibold text-[#9A7235] tabular-nums">
            {pendingCollection.toFixed(3)} TND
          </div>
          <span className="text-[11px] text-[#8C7A70]">Sous la garde des livreurs</span>
        </div>
      </div>

      {/* Visual Distribution of Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8DFD5]">
            <PieChart className="w-4 h-4 text-[#9A7235]" />
            <h3 className="font-serif text-base text-[#2C2420]">
              Répartition par Statut de Commande
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span>Livrées & Payées ({statusCounts.delivered})</span>
                <span className="font-semibold">{Math.round((statusCounts.delivered / (orders.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-[#E8DFD5] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${(statusCounts.delivered / (orders.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Confirmées & Préparation ({statusCounts.confirmed + statusCounts.preparing})</span>
                <span className="font-semibold">{Math.round(((statusCounts.confirmed + statusCounts.preparing) / (orders.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-[#E8DFD5] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#C69A58] h-full rounded-full"
                  style={{ width: `${((statusCounts.confirmed + statusCounts.preparing) / (orders.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>En attente de validation ({statusCounts.pending})</span>
                <span className="font-semibold">{Math.round((statusCounts.pending / (orders.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-[#E8DFD5] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(statusCounts.pending / (orders.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Categories */}
        <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8DFD5]">
            <TrendingUp className="w-4 h-4 text-[#9A7235]" />
            <h3 className="font-serif text-base text-[#2C2420]">
              Répartition des Ventes par Gamme
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-[#FAF7F2]">
              <span>Colliers & Pendentifs</span>
              <strong className="text-[#2C2420]">52% des ventes</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-[#FAF7F2]">
              <span>Bracelets & Mailles Serpent</span>
              <strong className="text-[#2C2420]">24% des ventes</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-[#FAF7F2]">
              <span>Bagues Stacking & Cœurs</span>
              <strong className="text-[#2C2420]">15% des ventes</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-[#FAF7F2]">
              <span>Boucles & Accessoires</span>
              <strong className="text-[#2C2420]">9% des ventes</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
