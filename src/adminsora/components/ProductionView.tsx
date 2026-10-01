import React, { useState } from 'react';
import {
  Factory,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Product, ProductionBatch, CompanyProfile } from '../types';

interface ProductionViewProps {
  products: Product[];
  productions: ProductionBatch[];
  companyProfile: CompanyProfile;
  onSaveProduction: (batch: Omit<ProductionBatch, 'id'>) => void;
  onDeleteProduction: (target: ProductionBatch | number | string) => void;
  onClearAllProductions: () => void;
}

export const ProductionView: React.FC<ProductionViewProps> = ({
  products,
  productions,
  onSaveProduction,
  onDeleteProduction,
  onClearAllProductions,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [batch, setBatch] = useState(`ABH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`);
  const [productName, setProductName] = useState(products[0]?.name || 'Nasi Kotak Premium');
  const [productCode, setProductCode] = useState(products[0]?.code || 'NKP-001');
  const [qty, setQty] = useState<number>(50);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ed, setEd] = useState(new Date().toISOString().slice(0, 10));
  const [buyer, setBuyer] = useState('');

  const openAddModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    const codeSeq = String(productions.length + 1).padStart(3, '0');
    setBatch(`ABH-${today.replace(/-/g, '')}-${codeSeq}`);
    if (products.length > 0) {
      setProductName(products[0].name);
      setProductCode(products[0].code || 'PRD');
    }
    setQty(50);
    setDate(today);
    setEd(today);
    setBuyer('');
    setIsModalOpen(true);
  };

  const handleProductSelect = (selectedName: string) => {
    setProductName(selectedName);
    const found = products.find((p) => p.name === selectedName);
    if (found && found.code) {
      setProductCode(found.code);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProduction({
      batch,
      productName,
      productCode,
      qty,
      date,
      ed,
      buyer: buyer.trim() || undefined,
    });
    setIsModalOpen(false);
  };

  const handlePrintBatch = (p: ProductionBatch) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Label Batch Produksi - ${p.batch}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; text-align: center; }
            .box { border: 2px solid #087443; border-radius: 12px; padding: 16px; max-width: 320px; margin: 0 auto; }
            h2 { color: #087443; margin: 0 0 6px 0; font-size: 16px; }
            p { margin: 4px 0; font-size: 12px; }
            .batch { font-family: monospace; font-size: 14px; font-weight: bold; background: #e6f4ea; padding: 4px; border-radius: 4px; }
            .halal { color: #087443; font-weight: bold; font-size: 10px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>PT. ASASORA BIO HEALTHORA</h2>
            <p><strong>${p.productName}</strong></p>
            <p class="batch">BATCH: ${p.batch}</p>
            <p>Tanggal Produksi: ${p.date}</p>
            <p>Kedaluwarsa (ED): ${p.ed}</p>
            <p>Jumlah: ${p.qty} Unit</p>
            ${p.buyer ? `<p>Pemesan: ${p.buyer}</p>` : ''}
            <div class="halal">100% HALAL RESMI BPJPH (ID36110081134110926)</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filtered = productions.filter(
    (p) =>
      p.batch.toLowerCase().includes(search.toLowerCase()) ||
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      (p.buyer && p.buyer.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Factory className="w-5 h-5 text-[#087443]" />
            <span>Manajemen Batch Produksi Katering</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan nomor batch, tanggal pembuatan, masa kedaluwarsa (ED), dan label instansi pemesan.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#087443] hover:bg-[#065e36] text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cetak / Tambah Batch</span>
          </button>
          {productions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Kosongkan semua riwayat batch produksi?')) {
                  onClearAllProductions();
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
            >
              Kosongkan
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kode batch, nama menu, atau nama pembeli..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087443]"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Kode Batch</th>
                <th className="py-3.5 px-4">Menu Produk</th>
                <th className="py-3.5 px-4">Tanggal Masak</th>
                <th className="py-3.5 px-4">Kedaluwarsa (ED)</th>
                <th className="py-3.5 px-4">Jumlah (Qty)</th>
                <th className="py-3.5 px-4">Tujuan / Pemesan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada catatan batch produksi.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id || prod.batch} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {prod.batch}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{prod.productName}</td>
                    <td className="py-3 px-4 font-medium text-slate-600">{prod.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{prod.ed}</td>
                    <td className="py-3 px-4 font-black text-slate-900">{prod.qty} Unit</td>
                    <td className="py-3 px-4 text-slate-600">{prod.buyer || 'Stok Dapur / Etalase'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePrintBatch(prod)}
                          title="Cetak Label Batch"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus batch ${prod.batch}?`)) {
                              onDeleteProduction(prod);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Batch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-slate-900 mb-4">Input Catatan Batch Produksi</h2>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Kode Batch</label>
                <input
                  type="text"
                  required
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Produk Katering</label>
                <select
                  value={productName}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.code || 'PRD'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Jumlah Porsi</label>
                  <input
                    type="number"
                    required
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Olah</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Kedaluwarsa (ED)</label>
                  <input
                    type="date"
                    required
                    value={ed}
                    onChange={(e) => setEd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tujuan / Pemesan (Opsional)</label>
                <input
                  type="text"
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  placeholder="Contoh: PT. Medika Sejahtera (Seminar 120 Pax)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#087443] hover:bg-[#065e36] text-white shadow-md shadow-emerald-900/20"
                >
                  Simpan Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
