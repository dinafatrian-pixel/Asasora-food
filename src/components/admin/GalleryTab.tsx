import React, { useState, useRef } from 'react';
import { GalleryItem } from '../../types';
import { handleFileUpload } from './adminUtils';
import { CloudinaryImageField } from './CloudinaryImageField';
import {
  Camera,
  Plus,
  Trash2,
  Edit2,
  Check,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';

interface GalleryTabProps {
  gallery: GalleryItem[];
  onUpdateGalleryItem: (item: GalleryItem) => void;
  onAddGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  onDeleteGalleryItem: (itemId: string) => void;
  onNotify?: (msg: string) => void;
}

export const GalleryTab: React.FC<GalleryTabProps> = ({
  gallery,
  onUpdateGalleryItem,
  onAddGalleryItem,
  onDeleteGalleryItem,
  onNotify,
}) => {
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Confirmation state for deleting a photo
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [showFormDeleteConfirm, setShowFormDeleteConfirm] = useState(false);

  // New item state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'dapur' | 'event' | 'olahan' | 'sertifikasi'>('dapur');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  const editRef = useRef<HTMLDivElement | null>(null);
  const addRef = useRef<HTMLDivElement | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    if (onNotify) {
      onNotify(msg);
    }
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const handleStartAdd = () => {
    setEditingItem(null);
    setShowFormDeleteConfirm(false);
    setIsAdding(true);
    setTimeout(() => {
      addRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleStartEdit = (item: GalleryItem) => {
    setIsAdding(false);
    setShowFormDeleteConfirm(false);
    setEditingItem({ ...item });
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    onAddGalleryItem({
      title: title.trim(),
      category,
      image: imageUrl.trim(),
      caption: caption.trim() || 'Dokumentasi operasional PT. Asasora',
    });

    setIsAdding(false);
    setTitle('');
    setCategory('dapur');
    setImageUrl('');
    setCaption('');
    showNotification('✅ Foto dokumentasi baru berhasil ditambahkan!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.title.trim() && editingItem.image.trim()) {
      onUpdateGalleryItem({
        ...editingItem,
        title: editingItem.title.trim(),
        image: editingItem.image.trim(),
        caption: editingItem.caption?.trim() || '',
      });
      setEditingItem(null);
      setShowFormDeleteConfirm(false);
      showNotification('✅ Data foto galeri berhasil diperbarui!');
    }
  };

  // Perform deletion of a gallery item safely
  const executeDeleteGalleryItem = (id: string, itemTitle: string) => {
    onDeleteGalleryItem(id);
    if (editingItem?.id === id) {
      setEditingItem(null);
      setShowFormDeleteConfirm(false);
    }
    setItemToDelete(null);
    showNotification(`🗑️ Foto "${itemTitle}" berhasil dihapus dari galeri.`);
  };

  return (
    <div className="space-y-5" id="admin-gallery-tab">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#F3C623]" />
            <span>Kelola Galeri Foto &amp; Dokumentasi ({gallery.length})</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Foto dapur higienis, penyajian catering event, fasilitas operasional, dan proses sertifikasi halal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Foto Baru</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-green-50 border border-green-300 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Custom Global Delete Confirmation Modal for Card Buttons */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-extrabold text-gray-900 leading-snug">
                  Hapus Foto dari Galeri?
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Apakah Anda yakin ingin menghapus foto dokumentasi{' '}
                  <strong className="text-red-700 font-bold">"{itemToDelete.title}"</strong>?
                  Foto ini tidak akan ditampilkan lagi di halaman galeri publik.
                </p>
              </div>
            </div>

            {/* Photo Preview in Modal */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3 text-xs">
              <img
                src={itemToDelete.image}
                alt={itemToDelete.title}
                className="w-14 h-14 rounded-lg object-cover border border-gray-300 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 truncate">{itemToDelete.title}</div>
                <div className="text-[11px] text-emerald-800 font-semibold uppercase">
                  Kategori: {itemToDelete.category}
                </div>
                {itemToDelete.caption && (
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{itemToDelete.caption}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeDeleteGalleryItem(itemToDelete.id, itemToDelete.title)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-md transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Foto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Photo Form */}
      {isAdding && (
        <div ref={addRef} id="gallery-add-form">
          <form
            onSubmit={handleCreate}
            className="p-5 bg-green-50/80 border-2 border-[#2E6F40] rounded-2xl space-y-4 shadow-sm animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-green-200 pb-2">
              <h5 className="font-black text-xs text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#F3C623]" />
                <span>Form Tambah Foto Dokumentasi Galeri</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-green-100 cursor-pointer"
                title="Tutup Form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Judul Foto / Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Dapur Higienis & Peralatan Stainless"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Kategori Galeri</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none font-semibold"
                >
                  <option value="event">🏢 Even Perusahaan</option>
                  <option value="dapur">🍳 Fasilitas Dapur &amp; Produksi</option>
                  <option value="olahan">🍲 Olahan Pangan &amp; Frozen Food</option>
                  <option value="sertifikasi">📜 Sertifikasi &amp; Audit Mutu</option>
                </select>
              </div>

              <div className="sm:col-span-2 bg-white p-3.5 rounded-2xl border border-green-200">
                <CloudinaryImageField
                  label="File Foto Dokumentasi Galeri"
                  value={imageUrl}
                  onChange={setImageUrl}
                  description="Upload foto dokumentasi dapur, event katering, atau sertifikasi ke Cloudinary CDN."
                  aspectRatio="video"
                  required
                  onNotify={onNotify}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Keterangan / Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Keterangan singkat dokumentasi..."
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-green-200">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleCreate(e);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#2E6F40] hover:bg-green-800 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4 text-[#F3C623]" />
                <span>Simpan Foto</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Existing Photo Form */}
      {editingItem && (
        <div ref={editRef} id="gallery-edit-form">
          <form
            onSubmit={handleSaveEdit}
            className="p-5 bg-amber-50/90 border-2 border-amber-400 rounded-2xl space-y-4 shadow-md animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h5 className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <span>Edit Foto: {editingItem.title}</span>
              </h5>

              <div className="flex items-center gap-2">
                {/* Header Delete Button in Edit Form */}
                <button
                  type="button"
                  onClick={() => setShowFormDeleteConfirm(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg border border-red-300 transition cursor-pointer"
                  title="Hapus foto ini dari galeri"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Hapus Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
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
                  <span>Konfirmasi: Anda yakin ingin menghapus foto "{editingItem.title}"?</span>
                </div>
                <p className="text-[11px] text-red-700">
                  Tindakan ini permanen dan akan menghapus foto ini dari galeri dokumentasi perusahaan.
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
                    onClick={() => executeDeleteGalleryItem(editingItem.id, editingItem.title)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Sekarang</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Judul Foto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Kategori Galeri</label>
                <select
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({
                       ...editingItem,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none font-semibold"
                >
                  <option value="event">🏢 Even Perusahaan</option>
                  <option value="dapur">🍳 Fasilitas Dapur &amp; Produksi</option>
                  <option value="olahan">🍲 Olahan Pangan &amp; Frozen Food</option>
                  <option value="sertifikasi">📜 Sertifikasi &amp; Audit Mutu</option>
                </select>
              </div>

              <div className="sm:col-span-2 bg-white p-3.5 rounded-2xl border border-amber-200">
                <CloudinaryImageField
                  label="File Foto Dokumentasi Galeri"
                  value={editingItem.image}
                  onChange={(url) =>
                    setEditingItem({ ...editingItem, image: url })
                  }
                  description="Upload foto dokumentasi dapur, event katering, atau sertifikasi ke Cloudinary CDN."
                  aspectRatio="video"
                  required
                  onNotify={onNotify}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-800 mb-1">Keterangan / Caption</label>
                <input
                  type="text"
                  value={editingItem.caption || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, caption: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
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
                <span>Hapus Foto Ini</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
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
                  <span>Simpan Perubahan Foto</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Photo Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {gallery.map((item) => {
          const isCurrentEditing = editingItem?.id === item.id;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border overflow-hidden transition flex flex-col justify-between shadow-2xs ${
                isCurrentEditing
                  ? 'border-2 border-amber-500 ring-2 ring-amber-200'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="relative h-28 bg-gray-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80';
                  }}
                />
                <span className="absolute top-1.5 left-1.5 bg-[#2E6F40] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {item.category === 'event' || item.category === 'even perusahaan' || item.category === 'event-perusahaan' ? 'Even Perusahaan' : item.category}
                </span>
                {isCurrentEditing && (
                  <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    Sedang Diedit
                  </span>
                )}
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h5 className="font-extrabold text-xs text-gray-900 line-clamp-1">
                    {item.title}
                  </h5>
                  {item.caption && (
                    <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                      {item.caption}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 text-gray-600 hover:text-[#2E6F40] hover:bg-green-50 rounded-lg border border-gray-200 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    title="Edit Foto"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#F3C623]" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
