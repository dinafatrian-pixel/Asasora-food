import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, Search, ArrowDownRight } from 'lucide-react';
import { Purchase, Ingredient, CompanyProfile } from '../types';
import { rupiah } from '../utils/formatters';

interface PurchasesViewProps {
  purchases: Purchase[];
  ingredients: Ingredient[];
  companyProfile: CompanyProfile;
  onSavePurchase: (purchase: Omit<Purchase, 'id'>) => void;
  onDeletePurchase: (id: number) => void;
  onClearAllPurchases: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  ingredients,
  onSavePurchase,
  onDeletePurchase,
  onClearAllPurchases,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ingredient, setIngredient] = useState(ingredients[0]?.name || 'Beras Premium Ramos');
  const [supplier, setSupplier] = useState('');
  const [qty, setQty] = useState<number>(10);
  const [unit, setUnit] = useState('Kg');
  const [price, setPrice] = useState<number>(15000);

  const openAddModal = () => {
    setDate(new Date().toISOString().slice(0, 10));
    if (ingredients.length > 0) {
      setIngredient(ingredients[0].name);
      setUnit(ingredients[0].unit || 'Kg');
    }
    setSupplier('');
    setQty(10);
    setPrice(15000);
    setIsModalOpen(true);
  };

  const handleIngredientChange = (selectedName: string) => {
    setIngredient(selectedName);
    const found = ingredients.find((i) => i.name === selectedName);
    if (found) {
      setUnit(found.unit || 'Kg');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = qty * price;
    onSavePurchase({
      date,
      ingredient,
      supplier: supplier.trim() || 'Supplier Umum',
      qty,
      unit,
      price,
      total,
    });
    setIsModalOpen(false);
  };

  const filtered = purchases.filter(
    (p) =>
      p.ingredient.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpent = purchases.reduce((sum, p) => sum + (p.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#087443]" />
            <span>Pembelian Bahan Baku (Otomatis Tambah Stok)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total Pengeluaran Belanja Bahan: <strong className="text-slate-900">{rupiah(totalSpent)}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#087443] hover:bg-[#065e36] text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pembelian</span>
          </button>
          {purchases.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Kosongkan semua riwayat transaksi pembelian?')) {
                  onClearAllPurchases();
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
          placeholder="Cari nama bahan atau supplier..."
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
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Bahan Baku</th>
                <th className="py-3.5 px-4">Supplier / Toko</th>
                <th className="py-3.5 px-4">Jumlah (Qty)</th>
                <th className="py-3.5 px-4">Harga Satuan</th>
                <th className="py-3.5 px-4">Total Biaya</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada riwayat pembelian bahan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-medium text-slate-500">{item.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.ingredient}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{item.supplier}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      +{item.qty} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{rupiah(item.price)}</td>
                    <td className="py-3 px-4 font-black text-rose-700">{rupiah(item.total)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus catatan pembelian ${item.ingredient}?`)) {
                            onDeletePurchase(item.id);
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

      {/* Modal Add Purchase */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-slate-900 mb-4">Catat Pembelian Bahan Baku</h2>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Pembelian</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pemasok / Toko</label>
                  <input
                    type="text"
                    required
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Contoh: RPH Halal / Grosir Beras"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Bahan Baku</label>
                <select
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.name}>
                      {ing.name} (Stok: {ing.stock} {ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Jumlah (Qty)</label>
                  <input
                    type="number"
                    required
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 font-bold flex justify-between items-center">
                <span>Total Estimasi Biaya:</span>
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
                  Simpan & Tambah Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
