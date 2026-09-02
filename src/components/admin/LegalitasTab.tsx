import React, { useState, useRef } from 'react';
import { LegalDocument } from '../../types';
import { CloudinaryImageField } from './CloudinaryImageField';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface LegalitasTabProps {
  documents: LegalDocument[];
  onUpdateLegalDocument: (doc: LegalDocument) => void;
  onAddLegalDocument: (doc: Omit<LegalDocument, 'id'>) => void;
  onDeleteLegalDocument: (docId: string) => void;
  onNotify?: (msg: string) => void;
}

export const LegalitasTab: React.FC<LegalitasTabProps> = ({
  documents,
  onUpdateLegalDocument,
  onAddLegalDocument,
  onDeleteLegalDocument,
  onNotify,
}) => {
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Confirmation state for deleting a document (Iframe-safe modal)
  const [docToDelete, setDocToDelete] = useState<LegalDocument | null>(null);

  // New document state
  const [title, setTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [issuer, setIssuer] = useState('');
  const [desc, setDesc] = useState('');
  const [validUntil, setValidUntil] = useState('Berlaku Selamanya');
  const [status, setStatus] = useState('TERVERIFIKASI RESMI');
  const [imageUrl, setImageUrl] = useState('');

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
    setEditingDoc(null);
    setDocToDelete(null);
    setIsAdding(true);
    setTimeout(() => {
      addRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleStartEdit = (doc: LegalDocument) => {
    setIsAdding(false);
    setDocToDelete(null);
    setEditingDoc({ ...doc });
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !docNumber.trim()) return;

    onAddLegalDocument({
      title: title.trim(),
      docNumber: docNumber.trim(),
      issuer: issuer.trim() || 'Pemerintah Republik Indonesia',
      description: desc.trim() || 'Dokumen legalitas resmi PT. Asasora Bio Healthora.',
      validUntil: validUntil.trim() || 'Berlaku Selamanya',
      status: status.trim() || 'TERVERIFIKASI RESMI',
      image:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    });

    setIsAdding(false);
    setTitle('');
    setDocNumber('');
    setIssuer('');
    setDesc('');
    setValidUntil('Berlaku Selamanya');
    setStatus('TERVERIFIKASI RESMI');
    setImageUrl('');
    showNotification('✅ Dokumen legalitas baru berhasil ditambahkan!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoc && editingDoc.title.trim() && editingDoc.docNumber.trim()) {
      onUpdateLegalDocument({
        ...editingDoc,
        title: editingDoc.title.trim(),
        docNumber: editingDoc.docNumber.trim(),
        issuer: editingDoc.issuer.trim(),
        description: editingDoc.description.trim(),
        validUntil: editingDoc.validUntil.trim(),
        status: editingDoc.status.trim(),
        image: editingDoc.image?.trim() || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      });
      setEditingDoc(null);
      showNotification('✅ Data legalitas berhasil diperbarui!');
    }
  };

  const executeDeleteDoc = (doc: LegalDocument) => {
    onDeleteLegalDocument(doc.id);
    if (editingDoc?.id === doc.id) {
      setEditingDoc(null);
    }
    setDocToDelete(null);
    showNotification(`🗑️ Dokumen "${doc.title}" berhasil dihapus.`);
  };

  return (
    <div className="space-y-5" id="admin-legalitas-tab">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F3C623]" />
            <span>Kelola Legalitas &amp; Sertifikasi Perusahaan ({documents.length})</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Sertifikat Halal BPJPH, NIB OSS, Sertifikat Laik Higiene Sanitasi Dinkes, dan perizinan resmi.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Dokumen Baru</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-green-50 border border-green-300 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Custom Delete Confirmation Modal (Iframe Safe) */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-base">
                  Hapus Dokumen Legalitas?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus dokumen <strong className="text-gray-900 font-bold">"{docToDelete.title}"</strong> ({docToDelete.docNumber})?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeDeleteDoc(docToDelete)}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Form */}
      {isAdding && (
        <div ref={addRef} id="legal-add-form">
          <form
            onSubmit={handleCreate}
            className="p-5 bg-green-50/80 border-2 border-[#2E6F40] rounded-2xl space-y-4 shadow-sm animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-green-200 pb-2">
              <h5 className="font-black text-xs text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#F3C623]" />
                <span>Form Tambah Dokumen Legalitas Baru</span>
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
              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  Judul Dokumen / Izin <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Sertifikat Laik Higiene Sanitasi Jasaboga"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nomor Surat / Sertifikat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="Contoh: 443.51/012/DINKES/2023"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-mono font-bold text-emerald-900 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Instansi Penerbit</label>
                <input
                  type="text"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="Contoh: Dinas Kesehatan Kab. Tangerang"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Masa Berlaku</label>
                <input
                  type="text"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  placeholder="Contoh: Berlaku s/d 2028 / Selamanya"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status Verifikasi</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="Contoh: TERVERIFIKASI RESMI"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold text-emerald-800 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-700 mb-1">
                  Deskripsi / Ruang Lingkup Dokumen
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Contoh: Standar higienis dapur katering, kelayakan air, dan sanitasi pengolahan makanan."
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div className="sm:col-span-3 bg-white p-3 rounded-xl border border-green-200">
                <CloudinaryImageField
                  label="Foto Dokumen / Sertifikat (URL atau Upload)"
                  value={imageUrl}
                  onChange={setImageUrl}
                  description="Scan atau foto sertifikat resmi legalitas PT. Asasora."
                  aspectRatio="video"
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
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#2E6F40] hover:bg-green-800 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Check className="w-4 h-4 text-[#F3C623]" />
                <span>Simpan Dokumen</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Existing Document Form */}
      {editingDoc && (
        <div ref={editRef} id="legal-edit-form">
          <form
            onSubmit={handleSaveEdit}
            className="p-5 bg-amber-50/90 border-2 border-amber-400 rounded-2xl space-y-4 shadow-md animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h5 className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <span>Edit Dokumen: {editingDoc.title}</span>
              </h5>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-amber-100 cursor-pointer"
                title="Tutup Form Edit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-800 mb-1">
                  Judul Dokumen / Izin <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingDoc.title}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Nomor Surat / Sertifikat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingDoc.docNumber}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, docNumber: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-mono font-bold text-emerald-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Instansi Penerbit</label>
                <input
                  type="text"
                  value={editingDoc.issuer}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, issuer: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Masa Berlaku</label>
                <input
                  type="text"
                  value={editingDoc.validUntil}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, validUntil: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Status Verifikasi</label>
                <input
                  type="text"
                  value={editingDoc.status}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, status: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-bold text-emerald-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-800 mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={editingDoc.description}
                  onChange={(e) =>
                    setEditingDoc({
                      ...editingDoc,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="sm:col-span-3 bg-white p-3 rounded-xl border border-amber-200">
                <CloudinaryImageField
                  label="Foto Dokumen / Sertifikat (URL atau Upload)"
                  value={editingDoc.image}
                  onChange={(url) =>
                    setEditingDoc({ ...editingDoc, image: url })
                  }
                  description="Scan atau foto sertifikat resmi legalitas PT. Asasora."
                  aspectRatio="video"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
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
                <span>Simpan Perubahan Dokumen</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents Cards Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <ShieldCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-bold">Belum ada dokumen legalitas.</p>
          <button
            type="button"
            onClick={handleStartAdd}
            className="mt-2 text-xs text-[#2E6F40] font-bold hover:underline"
          >
            + Tambah Dokumen Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {documents.map((doc) => {
            const isCurrentEditing = editingDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                className={`p-4 bg-white rounded-2xl border transition flex flex-col justify-between shadow-2xs ${
                  isCurrentEditing
                    ? 'border-2 border-amber-500 ring-2 ring-amber-200'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-green-50 text-[#2E6F40] rounded-xl border border-green-200">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-gray-900 leading-snug">
                          {doc.title}
                        </h5>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mt-0.5">
                          {doc.docNumber}
                        </span>
                      </div>
                    </div>

                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                      {doc.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {doc.description}
                  </p>

                  <div className="text-[11px] text-gray-500 space-y-0.5 pt-1">
                    <p>
                      <span className="font-bold text-gray-700">Penerbit:</span> {doc.issuer}
                    </p>
                    <p>
                      <span className="font-bold text-gray-700">Masa Berlaku:</span>{' '}
                      <span className="font-semibold text-emerald-700">{doc.validUntil}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-2">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(doc)}
                    className="text-xs font-bold text-[#2E6F40] hover:bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocToDelete(doc)}
                    className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
