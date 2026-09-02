import React, { useState, useRef } from 'react';
import { Product } from '../../types';
import { handleFileUpload } from './adminUtils';
import { formatRupiah } from '../../utils/distance';
import { CloudinaryImageField } from './CloudinaryImageField';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Upload,
  Star,
  X,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Copy,
  Download,
} from 'lucide-react';

interface KatalogTabProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (productId: string) => void;
  onNotify?: (msg: string) => void;
}

export const KatalogTab: React.FC<KatalogTabProps> = ({
  products,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Confirmation state for deleting a product (modal / inline)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showFormDeleteConfirm, setShowFormDeleteConfirm] = useState(false);

  // New product state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(35000);
  const [newProdUnit, setNewProdUnit] = useState('box');
  const [newProdCategory, setNewProdCategory] = useState<string>('catering & event');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImg, setNewProdImg] = useState('');
  const [newProdMin, setNewProdMin] = useState<number>(1);
  const [newProdBadge, setNewProdBadge] = useState('Menu Pilihan');
  const [newProdPopular, setNewProdPopular] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const editFormRef = useRef<HTMLDivElement | null>(null);
  const addFormRef = useRef<HTMLDivElement | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    if (onNotify) {
      onNotify(msg);
    }
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCat = filterCategory === 'all';
    if (!matchesCat) {
      const pCat = (prod.category || '').toLowerCase();
      const fCat = filterCategory.toLowerCase();
      if (pCat === fCat) {
        matchesCat = true;
      } else if (fCat === 'catering & event' && (pCat === 'catering' || pCat === 'paket')) {
        matchesCat = true;
      } else if (fCat === 'produk siap santap' && (pCat === 'olahan' || pCat === 'siap-santap')) {
        matchesCat = true;
      } else if (fCat === 'snak dan cemilan' && (pCat === 'snack' || pCat === 'minuman' || pCat === 'snack & cemilan')) {
        matchesCat = true;
      }
    }
    return matchesSearch && matchesCat;
  });

  const handleStartAdd = () => {
    setEditingProduct(null);
    setShowFormDeleteConfirm(false);
    setIsAddingProduct(true);
    setTimeout(() => {
      addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleStartEdit = (prod: Product) => {
    setIsAddingProduct(false);
    setShowFormDeleteConfirm(false);
    setEditingProduct({
      ...prod,
      minOrder: prod.minOrder || 1,
      badge: prod.badge || '',
      isPopular: !!prod.isPopular,
      image:
        prod.image ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    });
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    onAddProduct({
      name: newProdName.trim(),
      price: Number(newProdPrice) || 0,
      unit: newProdUnit.trim() || 'box',
      category: newProdCategory,
      description:
        newProdDesc.trim() || 'Deskripsi produk resmi PT. Asasora',
      image:
        newProdImg.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      minOrder: Number(newProdMin) || 1,
      badge: newProdBadge.trim(),
      isPopular: newProdPopular,
      stock: 100,
    });

    setIsAddingProduct(false);
    setNewProdName('');
    setNewProdPrice(35000);
    setNewProdDesc('');
    setNewProdImg('');
    setNewProdBadge('Menu Pilihan');
    setNewProdPopular(false);
    showNotification('✅ Produk baru berhasil ditambahkan ke katalog!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct.name.trim()) {
      onUpdateProduct({
        ...editingProduct,
        name: editingProduct.name.trim(),
        category: editingProduct.category || 'catering & event',
        description: editingProduct.description?.trim() || '',
        image:
          editingProduct.image?.trim() ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        price: Number(editingProduct.price) || 0,
        unit: editingProduct.unit?.trim() || 'box',
        minOrder: Number(editingProduct.minOrder) || 1,
        badge: editingProduct.badge?.trim() || '',
        isPopular: !!editingProduct.isPopular,
      });
      setEditingProduct(null);
      setShowFormDeleteConfirm(false);
      showNotification('✅ Data produk berhasil diperbarui!');
    }
  };

  // Perform deletion of a product safely
  const executeDeleteProduct = (id: string, name: string) => {
    onDeleteProduct(id);
    if (editingProduct?.id === id) {
      setEditingProduct(null);
      setShowFormDeleteConfirm(false);
    }
    setProductToDelete(null);
    showNotification(`🗑️ Produk "${name}" berhasil dihapus dari katalog.`);
  };

  return (
    <div className="space-y-5" id="admin-katalog-tab">
      {/* Tab Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-[#F3C623]" />
            <span>Kelola Katalog Produk &amp; Layanan ({products.length})</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Tambah menu baru, edit foto/harga/deskripsi, atur batas minimal pemesanan, atau hapus produk dari katalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const jsonStr = JSON.stringify(products, null, 2);
              navigator.clipboard.writeText(jsonStr);
              setCopiedJson(true);
              showNotification('📋 Seluruh data katalog produk berhasil disalin (format JSON)!');
              setTimeout(() => setCopiedJson(false), 2500);
            }}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
            title="Salin seluruh data katalog JSON ke clipboard"
          >
            {copiedJson ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>JSON Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Data JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStartAdd}
            className="bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-3.5 bg-green-50 border border-green-300 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Custom Global Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-extrabold text-gray-900 leading-snug">
                  Hapus Produk dari Katalog?
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Apakah Anda yakin ingin menghapus produk{' '}
                  <strong className="text-red-700 font-bold">"{productToDelete.name}"</strong>?
                  Item ini akan dihapus dari katalog publik dan formulir pemesanan.
                </p>
              </div>
            </div>

            {/* Product Quick Info */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3 text-xs">
              <img
                src={productToDelete.image}
                alt={productToDelete.name}
                className="w-12 h-12 rounded-lg object-cover border border-gray-300 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 truncate">{productToDelete.name}</div>
                <div className="text-[11px] text-emerald-800 font-bold">
                  {formatRupiah(productToDelete.price)} / {productToDelete.unit}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeDeleteProduct(productToDelete.id, productToDelete.name)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-md transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Produk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-2.5 items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama menu / produk / alat..."
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#2E6F40] outline-none"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'Semua Kategori' },
            { id: 'catering & event', label: 'catering & event' },
            { id: 'Produk Siap Santap', label: 'Produk Siap Santap' },
            { id: 'Snak dan cemilan', label: 'Snak dan cemilan' },
          ].map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                filterCategory === cat.id
                  ? 'bg-[#2E6F40] text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Product Form */}
      {isAddingProduct && (
        <div ref={addFormRef} id="product-add-form">
          <form
            onSubmit={handleCreateProduct}
            className="p-5 bg-green-50/80 border-2 border-[#2E6F40] rounded-2xl space-y-4 shadow-sm animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-green-200 pb-2">
              <h5 className="font-black text-xs text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#F3C623]" />
                <span>Form Tambah Produk Baru</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsAddingProduct(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-green-100 cursor-pointer"
                title="Tutup Form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  Nama Produk / Paket <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Contoh: Paket Nasi Box Premium Halal"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                >
                  <option value="catering & event">catering &amp; event</option>
                  <option value="Produk Siap Santap">Produk Siap Santap</option>
                  <option value="Snak dan cemilan">Snak dan cemilan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Harga Satuan (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold text-[#2E6F40] focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Satuan</label>
                <input
                  type="text"
                  value={newProdUnit}
                  onChange={(e) => setNewProdUnit(e.target.value)}
                  placeholder="Contoh: box / porsi / pax / bulan"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Minimal Pemesanan</label>
                <input
                  type="number"
                  min={1}
                  value={newProdMin}
                  onChange={(e) => setNewProdMin(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Badge Promo / Label</label>
                <input
                  type="text"
                  value={newProdBadge}
                  onChange={(e) => setNewProdBadge(e.target.value)}
                  placeholder="Contoh: Best Seller / Promo Halal"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-bold">
                  <input
                    type="checkbox"
                    checked={newProdPopular}
                    onChange={(e) => setNewProdPopular(e.target.checked)}
                    className="w-4 h-4 text-[#2E6F40] rounded focus:ring-green-500"
                  />
                  <span>Tandai Menu Populer</span>
                </label>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-700 mb-1">Deskripsi Menu / Produk</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Isi menu, komposisi bahan makanan, atau spesifikasi barang..."
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div className="sm:col-span-3 bg-white p-3.5 rounded-2xl border border-green-200">
                <CloudinaryImageField
                  label="Foto Produk Makanan / Katering"
                  value={newProdImg}
                  onChange={setNewProdImg}
                  description="Upload foto produk lezat & higienis untuk ditampilkan di katalog pelanggan."
                  aspectRatio="square"
                  onNotify={onNotify}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-green-200">
              <button
                type="button"
                onClick={() => setIsAddingProduct(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleCreateProduct(e);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#2E6F40] hover:bg-green-800 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4 text-[#F3C623]" />
                <span>Simpan Produk</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Existing Product Form */}
      {editingProduct && (
        <div ref={editFormRef} id="product-edit-form">
          <form
            onSubmit={handleSaveEdit}
            className="p-5 bg-amber-50/90 border-2 border-amber-400 rounded-2xl space-y-4 shadow-md animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h5 className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <span>Edit Produk: {editingProduct.name}</span>
              </h5>

              <div className="flex items-center gap-2">
                {/* Header Delete Button */}
                <button
                  type="button"
                  onClick={() => setShowFormDeleteConfirm(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg border border-red-300 transition cursor-pointer"
                  title="Hapus produk ini dari katalog"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Hapus Produk</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowFormDeleteConfirm(false);
                  }}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-amber-100 cursor-pointer"
                  title="Tutup Form Edit"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inline Form Delete Confirmation Banner */}
            {showFormDeleteConfirm && (
              <div className="p-3.5 bg-red-50 border-2 border-red-400 rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-red-900 font-extrabold text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Konfirmasi: Anda yakin ingin menghapus produk "{editingProduct.name}"?</span>
                </div>
                <p className="text-[11px] text-red-700">
                  Tindakan ini permanen dan akan menghapus menu ini dari katalog produk.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowFormDeleteConfirm(false)}
                    className="px-3 py-1.5 bg-white text-gray-700 font-bold text-xs rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => executeDeleteProduct(editingProduct.id, editingProduct.name)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Sekarang</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-800 mb-1">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Kategori</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="catering & event">catering &amp; event</option>
                  <option value="Produk Siap Santap">Produk Siap Santap</option>
                  <option value="Snak dan cemilan">Snak dan cemilan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-bold text-[#2E6F40] focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Satuan</label>
                <input
                  type="text"
                  value={editingProduct.unit}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, unit: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Minimal Order</label>
                <input
                  type="number"
                  min={1}
                  value={editingProduct.minOrder || 1}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      minOrder: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Badge Label</label>
                <input
                  type="text"
                  value={editingProduct.badge || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, badge: e.target.value })
                  }
                  placeholder="Contoh: Best Seller / Promo"
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-gray-800 font-bold">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isPopular}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        isPopular: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#2E6F40] rounded focus:ring-amber-500"
                  />
                  <span>Tandai Menu Populer</span>
                </label>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-800 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="sm:col-span-3 bg-white p-3.5 rounded-2xl border border-amber-200">
                <CloudinaryImageField
                  label="Foto Produk Makanan / Katering"
                  value={editingProduct.image}
                  onChange={(url) =>
                    setEditingProduct({ ...editingProduct, image: url })
                  }
                  description="Upload foto produk lezat & higienis untuk ditampilkan di katalog pelanggan."
                  aspectRatio="square"
                  onNotify={onNotify}
                />
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-amber-200">
              <button
                type="button"
                onClick={() => setShowFormDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Hapus Produk Ini</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowFormDeleteConfirm(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveEdit(e);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#2E6F40] hover:bg-green-800 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                >
                  <Check className="w-4 h-4 text-[#F3C623]" />
                  <span>Simpan Perubahan Produk</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Product List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => {
          const isCurrentEditing = editingProduct?.id === prod.id;
          return (
            <div
              key={prod.id}
              className={`bg-white rounded-2xl border transition flex flex-col justify-between overflow-hidden shadow-2xs ${
                isCurrentEditing
                  ? 'border-2 border-amber-500 ring-2 ring-amber-200'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                {prod.badge && (
                  <span className="absolute top-2 left-2 bg-[#F3C623] text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                    {prod.badge}
                  </span>
                )}
                {prod.isPopular && (
                  <span className="absolute top-2 right-2 bg-[#2E6F40] text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 fill-current text-[#F3C623]" />
                    <span>Favorit</span>
                  </span>
                )}
                {isCurrentEditing && (
                  <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    Sedang Diedit
                  </span>
                )}
              </div>

              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                    {prod.category === 'catering' || prod.category === 'paket'
                      ? 'catering & event'
                      : prod.category === 'olahan'
                      ? 'Produk Siap Santap'
                      : prod.category === 'minuman' || prod.category === 'snack'
                      ? 'Snak dan cemilan'
                      : prod.category || 'catering & event'}
                  </div>
                  <h5 className="font-extrabold text-xs text-gray-900 leading-snug line-clamp-2 mt-0.5">
                    {prod.name}
                  </h5>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-[#2E6F40]">
                      {formatRupiah(prod.price)}
                    </span>
                    <span className="text-[10px] text-gray-400"> / {prod.unit}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(prod)}
                      className="p-1.5 text-gray-600 hover:text-[#2E6F40] hover:bg-green-50 rounded-lg border border-gray-200 transition cursor-pointer active:scale-95 flex items-center gap-1 text-[11px] font-bold"
                      title="Edit Produk"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#F3C623]" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProductToDelete(prod)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer active:scale-95 flex items-center gap-1 text-[11px] font-bold"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
