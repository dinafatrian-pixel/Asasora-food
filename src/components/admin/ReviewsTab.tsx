import React, { useState, useRef } from 'react';
import { Review } from '../../types';
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  Edit2,
  Check,
  Star,
  CheckCircle,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ReviewsTabProps {
  reviews: Review[];
  onUpdateReview: (review: Review) => void;
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
  onDeleteReview: (reviewId: string) => void;
  onNotify?: (msg: string) => void;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({
  reviews,
  onUpdateReview,
  onAddReview,
  onDeleteReview,
  onNotify,
}) => {
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Confirmation state for deleting a review (Iframe-safe modal)
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  // New review state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [verified, setVerified] = useState(true);

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
    setEditingReview(null);
    setReviewToDelete(null);
    setIsAdding(true);
    setTimeout(() => {
      addRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleStartEdit = (rev: Review) => {
    setIsAdding(false);
    setReviewToDelete(null);
    setEditingReview({ ...rev });
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    onAddReview({
      name: name.trim(),
      role: role.trim() || 'Pelanggan Setia PT. Asasora',
      rating: Number(rating) || 5,
      comment: comment.trim(),
      verified,
    });

    setIsAdding(false);
    setName('');
    setRole('');
    setRating(5);
    setComment('');
    setVerified(true);
    showNotification('✅ Testimoni baru berhasil ditambahkan!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReview && editingReview.name.trim() && editingReview.comment.trim()) {
      onUpdateReview({
        ...editingReview,
        name: editingReview.name.trim(),
        role: editingReview.role.trim() || 'Pelanggan Setia PT. Asasora',
        comment: editingReview.comment.trim(),
        rating: Number(editingReview.rating) || 5,
        verified: editingReview.verified !== false,
      });
      setEditingReview(null);
      showNotification('✅ Data testimoni berhasil diperbarui!');
    }
  };

  const executeDeleteReview = (rev: Review) => {
    onDeleteReview(rev.id);
    if (editingReview?.id === rev.id) {
      setEditingReview(null);
    }
    setReviewToDelete(null);
    showNotification(`🗑️ Ulasan dari "${rev.name}" berhasil dihapus.`);
  };

  return (
    <div className="space-y-5" id="admin-reviews-tab">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-[#F3C623]" />
            <span>Kelola Testimoni &amp; Review Pelanggan ({reviews.length})</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Tambah testimoni klien korporat, edit komentar dan bintang rating, atau moderasi review.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Review Baru</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-green-50 border border-green-300 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Custom Delete Confirmation Modal (Iframe-Safe) */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-base">
                  Hapus Testimoni / Ulasan?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus ulasan dari <strong className="text-gray-900 font-bold">"{reviewToDelete.name}"</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeDeleteReview(reviewToDelete)}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Ulasan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Review Form */}
      {isAdding && (
        <div ref={addRef} id="review-add-form">
          <form
            onSubmit={handleCreate}
            className="p-5 bg-green-50/80 border-2 border-[#2E6F40] rounded-2xl space-y-4 shadow-sm animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-green-200 pb-2">
              <h5 className="font-black text-xs text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#F3C623]" />
                <span>Form Tambah Review Klien</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nama Klien / Pemesan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ibu Rina S."
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Jabatan / Asal Instansi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Contoh: HR Manager PT. Bank BCA"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Bintang Rating (1-5)</label>
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-gray-300">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-yellow-400 hover:scale-125 transition cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-700 mb-1">
                  Isi Testimoni / Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan kepuasan rasa makanan, ketepatan waktu pengiriman, atau pelayanan katering Asasora..."
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-bold">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="w-4 h-4 text-[#2E6F40] rounded focus:ring-[#2E6F40]"
                  />
                  <span>Tampilkan Badge Terverifikasi Resmi</span>
                </label>
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
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#2E6F40] hover:bg-green-800 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Check className="w-4 h-4 text-[#F3C623]" />
                <span>Simpan Review</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Existing Review Form */}
      {editingReview && (
        <div ref={editRef} id="review-edit-form">
          <form
            onSubmit={handleSaveEdit}
            className="p-5 bg-amber-50/90 border-2 border-amber-400 rounded-2xl space-y-4 shadow-md animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h5 className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <span>Edit Testimoni: {editingReview.name}</span>
              </h5>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-amber-100 cursor-pointer"
                title="Tutup Form Edit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Nama Klien / Pemesan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingReview.name}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Jabatan / Instansi</label>
                <input
                  type="text"
                  value={editingReview.role}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, role: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Bintang Rating (1-5)</label>
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-amber-300">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setEditingReview({ ...editingReview, rating: star })
                      }
                      className="p-1 text-yellow-400 hover:scale-125 transition cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= editingReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-800 mb-1">
                  Isi Testimoni <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingReview.comment}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, comment: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="flex items-center gap-2 cursor-pointer text-gray-800 font-bold">
                  <input
                    type="checkbox"
                    checked={editingReview.verified !== false}
                    onChange={(e) =>
                      setEditingReview({
                        ...editingReview,
                        verified: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#2E6F40] rounded focus:ring-amber-500"
                  />
                  <span>Tampilkan Badge Terverifikasi Resmi</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
              <button
                type="button"
                onClick={() => setEditingReview(null)}
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
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#2E6F40] hover:bg-green-800 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Check className="w-4 h-4 text-[#F3C623]" />
                <span>Simpan Perubahan Review</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Cards Grid */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <MessageSquareQuote className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-bold">Belum ada review testimoni.</p>
          <button
            type="button"
            onClick={handleStartAdd}
            className="mt-2 text-xs text-[#2E6F40] font-bold hover:underline"
          >
            + Tambah Review Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => {
            const isCurrentEditing = editingReview?.id === rev.id;
            return (
              <div
                key={rev.id}
                className={`p-4 bg-white rounded-2xl border transition flex flex-col justify-between shadow-2xs ${
                  isCurrentEditing
                    ? 'border-2 border-amber-500 ring-2 ring-amber-200'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-extrabold text-xs text-[#2E6F40] flex items-center gap-1.5">
                        <span>{rev.name}</span>
                        {rev.verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-50 shrink-0" />
                        )}
                      </h5>
                      <p className="text-[11px] text-gray-500">{rev.role}</p>
                    </div>
                    <div className="flex items-center text-yellow-400 shrink-0">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 text-[10px] text-gray-400">
                  <span>{rev.date || 'Terverifikasi'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(rev)}
                      className="p-1.5 text-gray-600 hover:text-[#2E6F40] hover:bg-green-50 rounded-lg border border-gray-200 transition cursor-pointer"
                      title="Edit Review"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewToDelete(rev)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer"
                      title="Hapus Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
