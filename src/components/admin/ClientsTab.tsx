import React, { useState, useRef } from 'react';
import { ClientPartner } from '../../types';
import { CloudinaryImageField } from './CloudinaryImageField';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from 'lucide-react';

interface ClientsTabProps {
  clients: ClientPartner[];
  onUpdateClient: (client: ClientPartner) => void;
  onAddClient: (client: Omit<ClientPartner, 'id'>) => void;
  onDeleteClient: (clientId: string) => void;
  onNotify?: (msg: string) => void;
}

export const ClientsTab: React.FC<ClientsTabProps> = ({
  clients,
  onUpdateClient,
  onAddClient,
  onDeleteClient,
  onNotify,
}) => {
  const [editingClient, setEditingClient] = useState<ClientPartner | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Confirmation state for deleting a client (Iframe-safe modal)
  const [clientToDelete, setClientToDelete] = useState<ClientPartner | null>(null);

  // New client state
  const [name, setName] = useState('');
  const [type, setType] = useState('Korporat Mitra');
  const [logo, setLogo] = useState('🏢');

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
    setEditingClient(null);
    setClientToDelete(null);
    setIsAdding(true);
    setTimeout(() => {
      addRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleStartEdit = (cli: ClientPartner) => {
    setIsAdding(false);
    setClientToDelete(null);
    setEditingClient({ ...cli });
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddClient({
      name: name.trim(),
      type: type.trim() || 'Korporat Mitra',
      logo: logo.trim() || '🏢',
    });

    setIsAdding(false);
    setName('');
    setType('Korporat Mitra');
    setLogo('🏢');
    showNotification('✅ Klien / Mitra baru berhasil ditambahkan!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient && editingClient.name.trim()) {
      onUpdateClient({
        ...editingClient,
        name: editingClient.name.trim(),
        type: editingClient.type.trim() || 'Korporat Mitra',
        logo: editingClient.logo.trim() || '🏢',
      });
      setEditingClient(null);
      showNotification('✅ Data mitra berhasil diperbarui!');
    }
  };

  const executeDeleteClient = (cli: ClientPartner) => {
    onDeleteClient(cli.id);
    if (editingClient?.id === cli.id) {
      setEditingClient(null);
    }
    setClientToDelete(null);
    showNotification(`🗑️ Mitra "${cli.name}" berhasil dihapus.`);
  };

  const isImageLogo = (val?: string) =>
    val &&
    (val.startsWith('http://') ||
      val.startsWith('https://') ||
      val.startsWith('data:image'));

  return (
    <div className="space-y-5" id="admin-clients-tab">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-[#F3C623]" />
            <span>Kelola Mitra &amp; Klien (Our Client) ({clients.length})</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Daftar instansi, korporat, BUMN, dan rumah sakit rekanan katering &amp; layanan PT. Asasora.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Klien Baru</span>
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
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-base">
                  Hapus Mitra / Klien?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus mitra <strong className="text-gray-900 font-bold">"{clientToDelete.name}"</strong>? Logo dan nama mitra ini tidak akan ditampilkan lagi di slider beranda.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeDeleteClient(clientToDelete)}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Mitra</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Form */}
      {isAdding && (
        <div ref={addRef} id="client-add-form">
          <form
            onSubmit={handleCreate}
            className="p-5 bg-green-50/80 border-2 border-[#2E6F40] rounded-2xl space-y-4 shadow-sm animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-green-200 pb-2">
              <h5 className="font-black text-xs text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#F3C623]" />
                <span>Form Tambah Mitra / Klien Baru</span>
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
                  Nama Perusahaan / Mitra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: PT. Telkom Indonesia Tbk"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Jenis Instansi / Sektor</label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Contoh: BUMN / Rumah Sakit / Korporat"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-green-200">
                <CloudinaryImageField
                  label="Logo Mitra / Klien (URL, Emoji, atau Upload Gambar)"
                  value={logo}
                  onChange={setLogo}
                  description="Logo perusahaan mitra atau ikon emoji untuk ditampilkan di slider mitra beranda."
                  aspectRatio="square"
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
                <span>Simpan Klien</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Existing Client Form */}
      {editingClient && (
        <div ref={editRef} id="client-edit-form">
          <form
            onSubmit={handleSaveEdit}
            className="p-5 bg-amber-50/90 border-2 border-amber-400 rounded-2xl space-y-4 shadow-md animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h5 className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <span>Edit Klien: {editingClient.name}</span>
              </h5>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-amber-100 cursor-pointer"
                title="Tutup Form Edit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Nama Perusahaan / Mitra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingClient.name}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Jenis Instansi / Sektor</label>
                <input
                  type="text"
                  value={editingClient.type}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, type: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-amber-200">
                <CloudinaryImageField
                  label="Logo Mitra / Klien (URL, Emoji, atau Upload Gambar)"
                  value={editingClient.logo}
                  onChange={(url) =>
                    setEditingClient({ ...editingClient, logo: url })
                  }
                  description="Logo perusahaan mitra atau ikon emoji untuk ditampilkan di slider mitra beranda."
                  aspectRatio="square"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
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
                <span>Simpan Perubahan Klien</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clients Cards Grid */}
      {clients.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-bold">Belum ada data klien.</p>
          <button
            type="button"
            onClick={handleStartAdd}
            className="mt-2 text-xs text-[#2E6F40] font-bold hover:underline"
          >
            + Tambah Klien Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {clients.map((cli) => {
            const isCurrentEditing = editingClient?.id === cli.id;
            return (
              <div
                key={cli.id}
                className={`p-3.5 bg-white rounded-2xl border transition flex flex-col justify-between items-center text-center shadow-2xs ${
                  isCurrentEditing
                    ? 'border-2 border-amber-500 ring-2 ring-amber-200'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-2 overflow-hidden">
                  {isImageLogo(cli.logo) ? (
                    <img
                      src={cli.logo}
                      alt={cli.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&q=80';
                      }}
                    />
                  ) : (
                    <span className="text-2xl">{cli.logo || '🏢'}</span>
                  )}
                </div>

                <div>
                  <h5 className="font-extrabold text-xs text-gray-900 line-clamp-1">
                    {cli.name}
                  </h5>
                  <p className="text-[10px] text-gray-500 line-clamp-1">{cli.type}</p>
                </div>

                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-gray-100 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(cli)}
                    className="p-1 text-gray-500 hover:text-[#2E6F40] hover:bg-green-50 rounded-lg border border-gray-200 transition cursor-pointer"
                    title="Edit Klien"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientToDelete(cli)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer"
                    title="Hapus Klien"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
