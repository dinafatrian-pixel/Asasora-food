import React, { useState, useEffect } from 'react';
import { CompanyInfo } from '../../types';
import {
  Settings,
  Check,
  RotateCcw,
  Building2,
  CreditCard,
  MapPin,
  AlertTriangle,
  X,
  Sparkles,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';

interface CompanyProfileTabProps {
  company: CompanyInfo;
  onUpdateCompany: (company: CompanyInfo) => void;
  onResetAllData?: () => void;
  onNotify?: (msg: string) => void;
}

export const CompanyProfileTab: React.FC<CompanyProfileTabProps> = ({
  company,
  onUpdateCompany,
  onResetAllData,
  onNotify,
}) => {
  const [form, setForm] = useState<CompanyInfo>(() => ({ ...company }));
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveData = () => {
    setIsSaving(true);
    const bankName = form.bankAccount?.bankName?.trim() || form.bcaAccount?.bank?.trim() || 'BCA (Bank Central Asia)';
    const accountNumber = form.bankAccount?.accountNumber?.trim() || form.bcaAccount?.number?.trim() || '4971531139';
    const accountHolder = form.bankAccount?.accountHolder?.trim() || form.bcaAccount?.holder?.trim() || 'Dina Fatrian';

    const warehouseName = form.warehouse?.name?.trim() || form.warehouseLocation?.name?.trim() || 'Gudang Asasora Tangerang';
    const warehouseLat = Number(form.warehouse?.lat ?? form.warehouseLocation?.lat ?? -6.1783) || -6.1783;
    const warehouseLng = Number(form.warehouse?.lng ?? form.warehouseLocation?.lng ?? 106.6319) || 106.6319;
    const warehouseAddress = form.warehouse?.address || form.warehouseLocation?.address || form.address || 'Buaran Indah, Kota Tangerang, Banten';

    const operationalHours = form.operationalHours?.trim() || 'Senin - Minggu (06.00 - 21.00 WIB)';
    const operationalDays = form.operationalDays?.trim() || 'Senin - Minggu (Setiap Hari)';
    const operationalTime = form.operationalTime?.trim() || '06.00 - 21.00 WIB';
    const deliveryHours = form.deliveryHours?.trim() || '06.00 - 20.00 WIB';
    const operationalNote = form.operationalNote?.trim() || 'Menerima pesanan katering & nasi boks setiap hari. Khusus pengiriman subuh/pagi hari, disarankan konfirmasi H-1.';

    const updatedCompany: CompanyInfo = {
      ...company,
      ...form,
      name: form.name?.trim() || 'PT. ASASORA BIO HEALTHORA',
      whatsapp: form.whatsapp?.trim() || '6285271000900',
      phone: form.phone?.trim() || '+62 852-7100-0900',
      email: form.email?.trim() || 'healthoraplus@gmail.com',
      website: form.website?.trim() || 'www.asasorfood.com',
      address: form.address?.trim() || '',
      description: form.description?.trim() || '',
      operationalHours,
      operationalDays,
      operationalTime,
      deliveryHours,
      operationalNote,
      bankAccount: {
        bankName,
        accountNumber,
        accountHolder,
        bank: bankName,
        number: accountNumber,
        holder: accountHolder,
      },
      bcaAccount: {
        bankName,
        accountNumber,
        accountHolder,
        bank: bankName,
        number: accountNumber,
        holder: accountHolder,
      },
      warehouse: {
        name: warehouseName,
        lat: warehouseLat,
        lng: warehouseLng,
        address: warehouseAddress,
      },
      warehouseLocation: {
        name: warehouseName,
        lat: warehouseLat,
        lng: warehouseLng,
        address: warehouseAddress,
      },
    };

    onUpdateCompany(updatedCompany);
    try {
      localStorage.setItem('asasora_company', JSON.stringify(updatedCompany));
    } catch (e) {}

    setIsSaving(false);
    setSaved(true);
    if (onNotify) {
      onNotify('✅ Profil perusahaan, jam operasional, nomor rekening, dan lokasi gudang berhasil disimpan!');
    }
    setTimeout(() => setSaved(false), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveData();
  };

  const handleConfirmReset = () => {
    if (onResetAllData) {
      onResetAllData();
      setShowResetConfirm(false);
      if (onNotify) {
        onNotify('🔄 Seluruh data website berhasil di-reset ke setelan awal default!');
      }
    }
  };

  return (
    <div className="space-y-6" id="admin-company-profile-tab">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#F3C623]" />
            <span>Profil Perusahaan, Rekening Bank &amp; Lokasi Dapur</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola nomor WhatsApp MinSora, rekening bank tujuan transfer pembayaran invoice, dan koordinat GPS gudang pengiriman.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-emerald-300 shadow-2xs animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profil &amp; Rekening Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal (Iframe Safe) */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-base">
                  Konfirmasi Reset Seluruh Data?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Tindakan ini akan mengembalikan seluruh konten website (produk katalog, profil, klien, dokumen legalitas, galeri, dan ulasan) ke data default bawaan awal PT. Asasora.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ya, Reset Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Company Identity */}
        <div className="bg-green-50/50 p-4 sm:p-5 rounded-2xl border border-green-200 space-y-4 shadow-2xs">
          <div className="font-extrabold text-xs text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#2E6F40]" />
            <span>1. Kontak &amp; Identitas Badan Usaha</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">
                Nama Badan Hukum / Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold text-gray-900 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                No. WhatsApp Admin / MinSora (Format 62...) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.whatsapp || ''}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="6281234567890"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-mono font-bold text-[#2E6F40] focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Nomor ini yang akan menerima pesanan WhatsApp &amp; invoice instan.
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                No. Telepon Kantor (Opsional)
              </label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="021-..."
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Email Resmi Perusahaan
              </label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="healthoraplus@gmail.com"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Alamat Website Resmi
              </label>
              <input
                type="text"
                value={form.website || ''}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="www.asasorfood.com"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none font-medium text-emerald-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">
                Alamat Kantor &amp; Dapur Utama
              </label>
              <input
                type="text"
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">
                Deskripsi Singkat / Profil Perusahaan (Footer &amp; Meta)
              </label>
              <textarea
                rows={2}
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none text-xs"
                placeholder="Deskripsi singkat profil PT. Asasora..."
              />
            </div>
          </div>
        </div>

        {/* 2. Jam Operasional & Pengiriman */}
        <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-extrabold text-xs text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#2E6F40]" />
              <span>2. Jam Operasional &amp; Jadwal Pengiriman (Operational Hours)</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
              Tampil di Kontak &amp; Informasi Pelanggan
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Sesuaikan jam kerja MinSora Customer Care, jam operasional dapur katering, serta jadwal pengiriman armada untuk pelanggan.
          </p>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-600">
              Pilihan Cepat / Preset Template Jam:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: 'Senin - Minggu (06.00 - 21.00 WIB)',
                  days: 'Senin - Minggu (Setiap Hari)',
                  time: '06.00 - 21.00 WIB',
                  delivery: '06.00 - 20.00 WIB',
                },
                {
                  label: 'Senin - Sabtu (07.00 - 20.00 WIB)',
                  days: 'Senin - Sabtu (Minggu Libur)',
                  time: '07.00 - 20.00 WIB',
                  delivery: '07.00 - 19.00 WIB',
                },
                {
                  label: 'Setiap Hari 24 Jam (Siaga Event)',
                  days: 'Senin - Minggu (24 Jam)',
                  time: '24 Jam Non-Stop',
                  delivery: 'Fleksibel Sesuai Jadwal Event',
                },
                {
                  label: 'Senin - Jumat (08.00 - 17.00 WIB)',
                  days: 'Senin - Jumat (Hari Kerja)',
                  time: '08.00 - 17.00 WIB',
                  delivery: '08.30 - 16.30 WIB',
                },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      operationalHours: preset.label,
                      operationalDays: preset.days,
                      operationalTime: preset.time,
                      deliveryHours: preset.delivery,
                    })
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-emerald-100/70 text-emerald-900 border border-emerald-300 rounded-lg transition cursor-pointer shadow-2xs"
                >
                  ⚡ {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">
                Jam Operasional Utama / Label Tampilan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.operationalHours || ''}
                onChange={(e) => setForm({ ...form, operationalHours: e.target.value })}
                placeholder="Contoh: Senin - Minggu (06.00 - 21.00 WIB)"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold text-[#2E6F40] focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Teks ini ditampilkan di halaman Kontak, kartu layanan, dan informasi jam operasional website.
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Hari Kerja / Buka Pelayanan
              </label>
              <input
                type="text"
                value={form.operationalDays || ''}
                onChange={(e) => setForm({ ...form, operationalDays: e.target.value })}
                placeholder="Contoh: Senin - Minggu (Setiap Hari)"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Jam Layanan Chat &amp; Admin (MinSora)
              </label>
              <input
                type="text"
                value={form.operationalTime || ''}
                onChange={(e) => setForm({ ...form, operationalTime: e.target.value })}
                placeholder="Contoh: 06.00 - 21.00 WIB"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-mono text-emerald-900 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Jadwal Jam Pengiriman Armada &amp; Katering
              </label>
              <input
                type="text"
                value={form.deliveryHours || ''}
                onChange={(e) => setForm({ ...form, deliveryHours: e.target.value })}
                placeholder="Contoh: 06.00 - 20.00 WIB (Katering Subuh H-1)"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Catatan / Ketentuan Khusus Pemesanan
              </label>
              <input
                type="text"
                value={form.operationalNote || ''}
                onChange={(e) => setForm({ ...form, operationalNote: e.target.value })}
                placeholder="Contoh: Melayani katering subuh dengan konfirmasi H-1"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#2E6F40] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-extrabold text-[#2E6F40]">Pratinjau Tampilan Jam Operasional:</div>
              <div className="text-gray-800 font-bold">
                {form.operationalHours || 'Senin - Minggu (06.00 - 21.00 WIB)'}
              </div>
              {form.deliveryHours && (
                <div className="text-[11px] text-gray-500">
                  Pengiriman: {form.deliveryHours}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="bg-yellow-50/50 p-4 sm:p-5 rounded-2xl border border-yellow-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="font-extrabold text-xs text-yellow-900 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-yellow-700" />
              <span>3. Rekening Bank Pembayaran Resmi (Tujuan Transfer Pesanan)</span>
            </div>
            <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-md border border-yellow-300">
              Otomatis tercetak di Invoice &amp; Checkout WA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Nama Bank <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.bankAccount?.bankName || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankAccount: {
                      bankName: e.target.value,
                      accountNumber: form.bankAccount?.accountNumber || '',
                      accountHolder: form.bankAccount?.accountHolder || '',
                    },
                  })
                }
                placeholder="Contoh: BCA (Bank Central Asia)"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold text-gray-900 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Nomor Rekening <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.bankAccount?.accountNumber || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankAccount: {
                      bankName: form.bankAccount?.bankName || '',
                      accountNumber: e.target.value,
                      accountHolder: form.bankAccount?.accountHolder || '',
                    },
                  })
                }
                placeholder="Contoh: 8831294819"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-mono font-bold text-blue-900 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Atas Nama Rekening <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.bankAccount?.accountHolder || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankAccount: {
                      bankName: form.bankAccount?.bankName || '',
                      accountNumber: form.bankAccount?.accountNumber || '',
                      accountHolder: e.target.value,
                    },
                  })
                }
                placeholder="Contoh: PT ASASORA BIO HEALTHORA"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold text-gray-900 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Warehouse Coordinates for Shipping Calculator */}
        <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-4 shadow-2xs">
          <div className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>4. Titik Asal Gudang &amp; Dapur Pengiriman (Kalkulator Ongkir Jarak)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Nama Lokasi Dapur / Gudang</label>
              <input
                type="text"
                value={form.warehouse?.name || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    warehouse: {
                      name: e.target.value,
                      lat: form.warehouse?.lat || 0,
                      lng: form.warehouse?.lng || 0,
                    },
                  })
                }
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Latitude Gudang</label>
              <input
                type="number"
                step="any"
                value={form.warehouse?.lat ?? 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    warehouse: {
                      name: form.warehouse?.name || '',
                      lat: parseFloat(e.target.value) || 0,
                      lng: form.warehouse?.lng || 0,
                    },
                  })
                }
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-mono focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Longitude Gudang</label>
              <input
                type="number"
                step="any"
                value={form.warehouse?.lng ?? 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    warehouse: {
                      name: form.warehouse?.name || '',
                      lat: form.warehouse?.lat || 0,
                      lng: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-mono focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
          {onResetAllData && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-xl transition border border-red-200 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Data ke Default</span>
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {saved && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> Tersimpan!
              </span>
            )}
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleSaveData();
              }}
              className="flex items-center gap-2 bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-bold px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 text-[#F3C623]" />
              <span>Simpan Profil, Jam Operasional &amp; Rekening</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
