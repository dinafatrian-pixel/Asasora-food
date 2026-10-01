import React, { useState } from 'react';
import {
  Layers,
  Plus,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { Ingredient, CompanyProfile } from '../types';
import { NavPage } from './Sidebar';

interface IngredientsViewProps {
  ingredients: Ingredient[];
  companyProfile: CompanyProfile;
  onAddIngredient: (ing: Omit<Ingredient, 'id'>) => void;
  onUpdateIngredient: (ing: Ingredient) => void;
  onDeleteIngredient: (id: number) => void;
  onResetIngredients: () => void;
  onNavigate: (page: NavPage) => void;
}

export const IngredientsView: React.FC<IngredientsViewProps> = ({
  ingredients,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
  onResetIngredients,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIng, setEditingIng] = useState<Ingredient | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [producer, setProducer] = useState('');
  const [stock, setStock] = useState<number>(10);
  const [unit, setUnit] = useState('Kg');
  const [cert, setCert] = useState('ID36110081134110926');
  const [valid, setValid] = useState('2027-12-31');
  const [status, setStatus] = useState<Ingredient['status']>('Aman');

  const openAddModal = () => {
    setEditingIng(null);
    setName('');
    setBrand('');
    setProducer('');
    setStock(10);
    setUnit('Kg');
    setCert('ID0000000000000');
    setValid('2027-12-31');
    setStatus('Aman');
    setIsModalOpen(true);
  };

  const openEditModal = (ing: Ingredient) => {
    setEditingIng(ing);
    setName(ing.name);
    setBrand(ing.brand);
    setProducer(ing.producer);
    setStock(ing.stock);
    setUnit(ing.unit);
    setCert(ing.cert);
    setValid(ing.valid);
    setStatus(ing.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIng) {
      onUpdateIngredient({
        ...editingIng,
        name,
        brand,
        producer,
        stock,
        unit,
        cert,
        valid,
        status,
      });
    } else {
      onAddIngredient({
        name,
        brand,
        producer,
        stock,
        unit,
        cert,
        valid,
        status,
      });
    }
    setIsModalOpen(false);
  };

  const filtered = ingredients.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.brand.toLowerCase().includes(search.toLowerCase()) ||
      i.cert.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#087443]" />
            <span>Master Bahan Baku & Sertifikat Halal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar bahan baku halal terverifikasi BPJPH untuk seluruh racikan kuliner katering Asasora.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('ingredientImport')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Bahan</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#087443] hover:bg-[#065e36] text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bahan</span>
          </button>
          <button
            onClick={onResetIngredients}
            title="Reset master bahan"
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan nama bahan, merek, atau nomor sertifikat halal..."
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
                <th className="py-3.5 px-4">Nama Bahan</th>
                <th className="py-3.5 px-4">Merek & Produsen</th>
                <th className="py-3.5 px-4">Stok Gudang</th>
                <th className="py-3.5 px-4">Nomor Sertifikat Halal</th>
                <th className="py-3.5 px-4">Masa Berlaku</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada data bahan baku.
                  </td>
                </tr>
              ) : (
                filtered.map((ing) => (
                  <tr key={ing.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{ing.name}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{ing.brand}</p>
                      <span className="text-[10px] text-slate-400">{ing.producer}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{ing.stock}</span> {ing.unit}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {ing.cert}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{ing.valid}</td>
                    <td className="py-3 px-4">
                      {ing.status === 'Aman' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Aman</span>
                        </span>
                      ) : ing.status === 'Kritis' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Kritis</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Kedaluwarsa</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(ing)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus bahan "${ing.name}"?`)) {
                              onDeleteIngredient(ing.id);
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-slate-900 mb-4">
              {editingIng ? 'Edit Data Bahan Baku' : 'Tambah Bahan Baku Halal'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Bahan</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Daging Paru Sapi Segar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Merek</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Contoh: RPH Dharma Jaya"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Produsen / Pemasok</label>
                  <input
                    type="text"
                    required
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    placeholder="Contoh: Perumda Dharma Jaya"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Stok Saat Ini</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Kg / Liter"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status Kepatuhan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Aman">Aman</option>
                    <option value="Kritis">Kritis</option>
                    <option value="Kedaluwarsa">Kedaluwarsa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Sertifikat Halal</label>
                  <input
                    type="text"
                    required
                    value={cert}
                    onChange={(e) => setCert(e.target.value)}
                    placeholder="ID..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Masa Berlaku (Valid s/d)</label>
                  <input
                    type="date"
                    required
                    value={valid}
                    onChange={(e) => setValid(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
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
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
