import React, { useState } from 'react';
import { Calculator, Plus, Trash2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Product, Ingredient, HPPHistoryItem, CompanyProfile } from '../types';
import { rupiah } from '../utils/formatters';

interface HPPViewProps {
  products: Product[];
  ingredients: Ingredient[];
  hppHistory: HPPHistoryItem[];
  companyProfile: CompanyProfile;
  onSaveHPP: (item: Omit<HPPHistoryItem, 'id'>) => void;
  onClearHPPHistory: () => void;
}

export const HPPView: React.FC<HPPViewProps> = ({
  products,
  ingredients,
  hppHistory,
  onSaveHPP,
  onClearHPPHistory,
}) => {
  const [productName, setProductName] = useState(products[0]?.name || 'Nasi Kotak Premium');
  const [rawCost, setRawCost] = useState<number>(25000);
  const [laborCost, setLaborCost] = useState<number>(4000);
  const [overheadCost, setOverheadCost] = useState<number>(2000);
  const [targetMargin, setTargetMargin] = useState<number>(30); // 30%

  const totalHPP = rawCost + laborCost + overheadCost;
  const recommendedSelling = Math.round(totalHPP / (1 - targetMargin / 100));

  const handleSave = () => {
    onSaveHPP({
      date: new Date().toISOString().slice(0, 10),
      productName,
      rawMaterialCost: rawCost,
      laborCost,
      overheadCost,
      totalHPP,
      unit: totalHPP,
      selling: recommendedSelling,
      marginPercent: targetMargin,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#087443]" />
          <span>Kalkulator HPP (Harga Pokok Produksi)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Hitung rincian biaya bahan baku, tenaga kerja dapur, gas/kemasan, dan margin profit ideal per porsi katering.
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900">Komponen Biaya per Porsi</h2>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Produk Katering</label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              {products.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} (Harga Jual Terpasang: {rupiah(p.price)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Bahan Baku (Raw Material)</label>
              <input
                type="number"
                value={rawCost}
                onChange={(e) => setRawCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400">Daging, ayam, beras, sayur</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tenaga Kerja Dapur</label>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400">Upah juru masak & helper</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Overhead Pabrik/Dapur</label>
              <input
                type="number"
                value={overheadCost}
                onChange={(e) => setOverheadCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400">Gas, listrik, box kemasan</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Target Margin Keuntungan (%):</span>
              <span className="text-emerald-700 font-black">{targetMargin}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="1"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full accent-[#087443]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#087443] hover:bg-[#065e36] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-950/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Catatan HPP Ini</span>
            </button>
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="bg-linear-to-br from-[#032e1a] to-[#087443] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Hasil Analisis Biaya</span>
            <h3 className="text-lg font-black text-white mt-1 truncate">{productName}</h3>

            <div className="space-y-3 mt-6">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-emerald-700/60">
                <span className="text-emerald-200">Total HPP per Porsi:</span>
                <span className="text-base font-black text-white">{rupiah(totalHPP)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-emerald-700/60">
                <span className="text-emerald-200">Margin Laba:</span>
                <span className="text-sm font-bold text-[#F3C623]">+{targetMargin}%</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-emerald-200">Harga Jual Rekomendasi:</span>
                <span className="text-xl font-black text-[#F3C623]">{rupiah(recommendedSelling)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-700/60">
            <p className="text-[11px] text-emerald-100 leading-relaxed">
              💡 Harga jual ini menjamin keuntungan katering tetap sehat setelah menutup seluruh pos biaya dapur dan armada.
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Riwayat Perhitungan HPP</h3>
          {hppHistory.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Bersihkan riwayat HPP?')) {
                  onClearHPPHistory();
                }
              }}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Bersihkan Riwayat
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Bahan Baku</th>
                <th className="py-3 px-4">Tenaga Kerja</th>
                <th className="py-3 px-4">Overhead</th>
                <th className="py-3 px-4">Total HPP</th>
                <th className="py-3 px-4">Harga Jual</th>
                <th className="py-3 px-4">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hppHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    Belum ada riwayat perhitungan HPP tersimpan.
                  </td>
                </tr>
              ) : (
                hppHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-400">{h.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{h.productName}</td>
                    <td className="py-3 px-4">{rupiah(h.rawMaterialCost)}</td>
                    <td className="py-3 px-4">{rupiah(h.laborCost)}</td>
                    <td className="py-3 px-4">{rupiah(h.overheadCost)}</td>
                    <td className="py-3 px-4 font-black text-slate-900">{rupiah(h.unit)}</td>
                    <td className="py-3 px-4 font-black text-emerald-800">{rupiah(h.selling)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">+{h.marginPercent}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
