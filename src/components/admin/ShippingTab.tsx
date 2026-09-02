import React, { useState, useRef } from 'react';
import { ShippingMethod } from '../../types';
import { formatRupiah } from '../../utils/distance';
import { Truck, Check, Edit2, X, CheckCircle2 } from 'lucide-react';

interface ShippingTabProps {
  shippingMethods: ShippingMethod[];
  onUpdateShippingMethod: (method: ShippingMethod) => void;
  onNotify?: (msg: string) => void;
}

export const ShippingTab: React.FC<ShippingTabProps> = ({
  shippingMethods,
  onUpdateShippingMethod,
  onNotify,
}) => {
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const editRef = useRef<HTMLDivElement | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    if (onNotify) {
      onNotify(msg);
    }
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const handleStartEdit = (method: ShippingMethod) => {
    setEditingMethod({ ...method });
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMethod && editingMethod.name.trim()) {
      const updated: ShippingMethod = {
        ...editingMethod,
        name: editingMethod.name.trim(),
        baseFare: Number(editingMethod.baseFare) || 0,
        perKmRate: Number(editingMethod.perKmRate) || 0,
        minDistance: Number(editingMethod.minDistance) || 0,
        maxDistance: Number(editingMethod.maxDistance) || 100,
        estimatedTime: editingMethod.estimatedTime.trim() || '30-45 Menit',
        description: editingMethod.description.trim(),
      };
      onUpdateShippingMethod(updated);
      setEditingMethod(null);
      showNotification(`✅ Tarif armada "${updated.name}" berhasil diperbarui!`);
    }
  };

  return (
    <div className="space-y-5" id="admin-shipping-tab">
      <div className="border-b border-gray-100 pb-3">
        <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#F3C623]" />
          <span>Pengaturan Tarif Ongkos Kirim &amp; Armada ({shippingMethods.length})</span>
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          Sesuaikan tarif dasar (base fare), tarif per kilometer, jarak minimal, dan estimasi waktu pengantaran armada.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-green-50 border border-green-300 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Edit Existing Shipping Method */}
      {editingMethod && (
        <div ref={editRef} id="shipping-edit-form">
          <form
            onSubmit={handleSaveEdit}
            className="p-5 bg-amber-50/90 border-2 border-amber-400 rounded-2xl space-y-4 shadow-md animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h5 className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <span>Edit Tarif: {editingMethod.name}</span>
              </h5>
              <button
                type="button"
                onClick={() => setEditingMethod(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-amber-100 cursor-pointer"
                title="Tutup Form Edit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Nama Metode / Armada <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingMethod.name}
                  onChange={(e) =>
                    setEditingMethod({ ...editingMethod, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Tarif Dasar (Base Fare Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={editingMethod.baseFare}
                  onChange={(e) =>
                    setEditingMethod({
                      ...editingMethod,
                      baseFare: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-bold text-[#2E6F40] focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Tarif Per Km (Rp/km) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={editingMethod.perKmRate}
                  onChange={(e) =>
                    setEditingMethod({
                      ...editingMethod,
                      perKmRate: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-bold text-[#2E6F40] focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Jarak Minimal (Km)</label>
                <input
                  type="number"
                  value={editingMethod.minDistance}
                  onChange={(e) =>
                    setEditingMethod({
                      ...editingMethod,
                      minDistance: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Jarak Maksimal (Km)</label>
                <input
                  type="number"
                  value={editingMethod.maxDistance}
                  onChange={(e) =>
                    setEditingMethod({
                      ...editingMethod,
                      maxDistance: parseInt(e.target.value) || 100,
                    })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Estimasi Waktu Sampai</label>
                <input
                  type="text"
                  value={editingMethod.estimatedTime}
                  onChange={(e) =>
                    setEditingMethod({
                      ...editingMethod,
                      estimatedTime: e.target.value,
                    })
                  }
                  placeholder="Contoh: 30-45 Menit"
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-800 mb-1">Deskripsi Armada</label>
                <input
                  type="text"
                  value={editingMethod.description}
                  onChange={(e) =>
                    setEditingMethod({
                      ...editingMethod,
                      description: e.target.value,
                    })
                  }
                  placeholder="Kapasitas armada, box thermal, mobil berpendingin..."
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
              <button
                type="button"
                onClick={() => setEditingMethod(null)}
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
                <span>Simpan Perubahan Tarif</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shipping Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shippingMethods.map((m) => {
          const isCurrentEditing = editingMethod?.id === m.id;
          return (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border p-4 transition flex flex-col justify-between shadow-2xs ${
                isCurrentEditing
                  ? 'border-2 border-amber-500 ring-2 ring-amber-200'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-50 text-[#2E6F40] rounded-xl border border-green-200">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-gray-900">{m.name}</h5>
                      <span className="text-[10px] text-gray-500">{m.estimatedTime}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#2E6F40]">
                    {formatRupiah(m.baseFare)}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-2.5 leading-relaxed">
                  {m.description}
                </p>

                <div className="mt-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200 grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Tarif Dasar</span>
                    <span className="font-bold text-gray-800">{formatRupiah(m.baseFare)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Per Km</span>
                    <span className="font-bold text-emerald-700">+{formatRupiah(m.perKmRate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Maks Jarak</span>
                    <span className="font-bold text-gray-800">{m.maxDistance} Km</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 mt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleStartEdit(m)}
                  className="text-xs font-bold text-[#2E6F40] hover:bg-green-50 px-3.5 py-1.5 rounded-lg border border-green-200 flex items-center gap-1 transition cursor-pointer active:scale-95"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Tarif</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
