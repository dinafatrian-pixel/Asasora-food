import React, { useState } from 'react';
import { TrendingUp, Plus, Trash2, Search, FileText } from 'lucide-react';
import { Sale, Product, CompanyProfile } from '../types';
import { rupiah } from '../utils/formatters';
import { NavPage } from './Sidebar';

interface SalesViewProps {
  sales: Sale[];
  products: Product[];
  companyProfile: CompanyProfile;
  onSaveSale: (sale: Omit<Sale, 'id'>) => void;
  onDeleteSale: (id: number) => void;
  onClearAllSales: () => void;
  onNavigate: (page: NavPage) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  sales,
  products,
  onSaveSale,
  onDeleteSale,
  onClearAllSales,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [productName, setProductName] = useState(products[0]?.name || 'Nasi Kotak Premium');
  const [qty, setQty] = useState<number>(30);
  const [price, setPrice] = useState<number>(products[0]?.price || 45000);
  const [buyer, setBuyer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer BCA Perusahaan');
  const [invoiceNo, setInvoiceNo] = useState(`INV/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/AS-01`);

  const openAddModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    if (products.length > 0) {
      setProductName(products[0].name);
      setPrice(products[0].price);
    }
    setQty(30);
    setBuyer('');
    setPaymentMethod('Transfer BCA Perusahaan');
    setInvoiceNo(`INV/${today.replace(/-/g, '')}/AS-${String(sales.length + 1).padStart(2, '0')}`);
    setIsModalOpen(true);
  };

  const handleProductSelect = (selectedName: string) => {
    setProductName(selectedName);
    const found = products.find((p) => p.name === selectedName);
    if (found) {
      setPrice(found.price);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = qty * price;
    onSaveSale({
      date,
      productName,
      qty,
      price,
      buyer: buyer.trim() || 'Pelanggan Umum',
      total,
      paymentMethod,
      invoiceNo,
    });
    setIsModalOpen(false);
  };

  const totalOmzet = sales.reduce((sum, s) => sum + (s.total || 0), 0);

  const filtered = sales.filter(
    (s) =>
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      s.buyer.toLowerCase().includes(search.toLowerCase()) ||
      (s.invoiceNo && s.invoiceNo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#087443]" />
            <span>Pencatatan Penjualan & Invoice Katering</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total Omzet Terkumpul: <strong className="text-emerald-700 font-black">{rupiah(totalOmzet)}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#087443] hover:bg-[#065e36] text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Penjualan Baru</span>
          </button>
          {sales.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Kosongkan semua transaksi penjualan?')) {
                  onClearAllSales();
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
          placeholder="Cari pembeli, invoice, atau produk..."
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
                <th className="py-3.5 px-4">Invoice & Tanggal</th>
                <th className="py-3.5 px-4">Instansi / Pembeli</th>
                <th className="py-3.5 px-4">Menu Katering</th>
                <th className="py-3.5 px-4">Jumlah (Qty)</th>
                <th className="py-3.5 px-4">Harga Satuan</th>
                <th className="py-3.5 px-4">Total Omzet</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada data penjualan tercatat.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-slate-800">{s.invoiceNo || `TRX-${s.id}`}</p>
                      <span className="text-[10px] text-slate-400">{s.date}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{s.buyer}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{s.productName}</td>
                    <td className="py-3 px-4 font-black text-slate-900">{s.qty} Pax</td>
                    <td className="py-3 px-4 text-slate-600">{rupiah(s.price)}</td>
                    <td className="py-3 px-4 font-black text-emerald-800">{rupiah(s.total)}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {s.paymentMethod || 'Tunai / Transfer'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus transaksi penjualan untuk ${s.buyer}?`)) {
                            onDeleteSale(s.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Sale */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-slate-900 mb-4">Catat Penjualan Katering</h2>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Invoice</label>
                  <input
                    type="text"
                    required
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Perusahaan / Pembeli</label>
                <input
                  type="text"
                  required
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  placeholder="Contoh: PT. Medika Sejahtera (Seminar HRD)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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
                      {p.name} - {rupiah(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Jumlah Porsi (Qty)</label>
                  <input
                    type="number"
                    required
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Metode Pembayaran</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Transfer BCA Perusahaan">Transfer BCA Perusahaan</option>
                  <option value="Term of Payment (TOP 14 Hari)">Term of Payment (TOP 14 Hari)</option>
                  <option value="QRIS / Dompet Digital">QRIS / Dompet Digital</option>
                  <option value="Tunai / Kasir">Tunai / Kasir</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 font-bold flex justify-between items-center">
                <span>Total Omzet:</span>
                <span className="text-base text-emerald-800">{rupiah(qty * price)}</span>
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
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
