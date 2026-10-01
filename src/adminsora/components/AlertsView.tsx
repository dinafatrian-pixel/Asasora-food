import React from 'react';
import { Bell, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { Ingredient } from '../types';
import { NavPage } from './Sidebar';

interface AlertsViewProps {
  ingredients: Ingredient[];
  onNavigate: (page: NavPage) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  ingredients,
  onNavigate,
}) => {
  const criticalStock = ingredients.filter((i) => i.stock <= 5);
  const statusIssues = ingredients.filter((i) => i.status !== 'Aman');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <span>Pusat Notifikasi & Peringatan Operasional Dapur</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Peringatan dini stok bahan baku menipis dan masa berlaku sertifikat halal BPJPH.
        </p>
      </div>

      <div className="space-y-4">
        {/* Stok Menipis */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Peringatan Stok Bahan Baku Kritis (≤ 5 Satuan)</span>
          </h2>

          {criticalStock.length === 0 ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Alhamdulillah, semua stok bahan baku dalam batas aman.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {criticalStock.map((ing) => (
                <div key={ing.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{ing.name}</p>
                    <span className="text-[11px] text-slate-400">Merek: {ing.brand}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                      Sisa {ing.stock} {ing.unit}
                    </span>
                    <button
                      onClick={() => onNavigate('purchases')}
                      className="text-xs font-bold text-[#087443] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Beli Lagi</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Halal / Expired */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Kepatuhan Sertifikat Halal & Tanggal Kadaluwarsa</span>
          </h2>

          {statusIssues.length === 0 ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Seluruh sertifikat halal bahan baku berstatus aktif dan aman.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {statusIssues.map((ing) => (
                <div key={ing.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{ing.name}</p>
                    <span className="text-[11px] font-mono text-slate-400">No. Sertifikat: {ing.cert}</span>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                    {ing.status} (Valid s/d {ing.valid})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
