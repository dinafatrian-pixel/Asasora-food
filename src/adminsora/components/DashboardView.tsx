import React from 'react';
import {
  TrendingUp,
  UtensilsCrossed,
  Layers,
  Factory,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { Product, Ingredient, ProductionBatch, Sale, Activity } from '../types';
import { rupiah } from '../utils/formatters';
import { NavPage } from './Sidebar';

interface DashboardViewProps {
  products: Product[];
  ingredients: Ingredient[];
  productions: ProductionBatch[];
  sales: Sale[];
  activities: Activity[];
  onNavigate: (page: NavPage) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  ingredients,
  productions,
  sales,
  activities,
  onNavigate,
}) => {
  const totalOmzet = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalBatches = productions.length;
  const totalIngredients = ingredients.length;
  const criticalIngredients = ingredients.filter((i) => i.status !== 'Aman' || i.stock <= 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-[#032e1a] via-[#087443] to-[#0b9657] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-emerald-100 mb-3 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F3C623]" />
            <span>Sistem Jaminan Produk Halal (SJPH) BPJPH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Dashboard Operasional MinSora ERP
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
            Pantau arus bahan baku halal, jadwal produksi katering instansi, penghitungan HPP, dan kepatuhan standar higienis jasaboga PT. Asasora Bio Healthora secara terpusat.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={() => onNavigate('production')}
              className="px-4 py-2.5 bg-[#F3C623] hover:bg-[#d8ae1a] text-slate-900 text-xs font-black rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Batch Produksi</span>
            </button>
            <button
              onClick={() => onNavigate('sales')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 border border-white/20 cursor-pointer backdrop-blur-xs"
            >
              <span>Catat Penjualan Katering</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative Halal Stamp Background */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <ShieldCheck className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Omzet Katering</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{rupiah(totalOmzet)}</p>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{sales.length} Transaksi Tercatat</span>
            </span>
          </div>
        </div>

        {/* Produksi Batches Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch Produksi</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{totalBatches} Batch</p>
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-1">
              <span>Tercetak kode batch & ED</span>
            </span>
          </div>
        </div>

        {/* Master Produk Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Master Produk</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{products.length} Menu</p>
            <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mt-1">
              <span>Siap saji, bento & nasi kotak</span>
            </span>
          </div>
        </div>

        {/* Bahan Baku Halal Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bahan Baku Halal</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{totalIngredients} Bahan</p>
            {criticalIngredients.length > 0 ? (
              <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{criticalIngredients.length} Perlu Perhatian</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Seluruh Bahan Aman</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Recent Activities & Quick Halal Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Aktivitas Operasional */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Aktivitas Operasional Terkini</h2>
              <p className="text-xs text-slate-400">Riwayat audit trail produksi & pencatatan sistem</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-[#087443] hover:underline cursor-pointer"
            >
              Lihat Laporan Audit →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Belum ada catatan aktivitas hari ini.
              </div>
            ) : (
              activities.slice(0, 6).map((act) => (
                <div key={act.id} className="py-3 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 truncate">{act.action}</p>
                      <span className="text-[11px] text-slate-400 shrink-0">{act.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{act.detail}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Halal BPJPH Compliance Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Kepatuhan SJPH BPJPH</h3>
                <p className="text-[11px] text-slate-400">ID36110081134110926</p>
              </div>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>Sertifikat Bahan Baku</span>
                  <span className="text-emerald-700">100% Valid</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">Semua bumbu & daging berlisensi Halal</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Sanitasi Laik Higiene</span>
                  <span className="text-emerald-600">Dinkes Terverifikasi</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Dapur steril & armada boks termal</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Penyelia Halal Resmi</span>
                  <span className="text-slate-700">Dina Fatrian</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Penanggung jawab operasional</p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('reports')}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Audit 60 Butir SJPH</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
