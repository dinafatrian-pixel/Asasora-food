import React, { useState, useEffect } from 'react';
import { CompanyInfo } from '../../types';
import { Check, Sparkles, LayoutTemplate, Plus, Trash2, Save, Eye } from 'lucide-react';

interface HomeHeroTabProps {
  company: CompanyInfo;
  onUpdateCompany: (company: CompanyInfo) => void;
  onNotify?: (msg: string) => void;
}

export const HomeHeroTab: React.FC<HomeHeroTabProps> = ({
  company,
  onUpdateCompany,
  onNotify,
}) => {
  const [form, setForm] = useState<CompanyInfo>(() => ({ ...company }));
  const [valueProps, setValueProps] = useState(() => {
    const list =
      company.heroValueProps && company.heroValueProps.length > 0
        ? company.heroValueProps
        : [
            { title: '100% Halal Resmi', subtitle: 'Bahan Baku Terjamin' },
            { title: 'Higienis & Sanitasi', subtitle: 'Standar Jasaboga' },
            { title: 'Cek Ongkir Otomatis', subtitle: '7 Opsi Kurir' },
          ];
    return list;
  });
  const [saved, setSaved] = useState(false);

  const handleSaveData = () => {
    const updatedCompany: CompanyInfo = {
      ...company,
      ...form,
      heroValueProps: valueProps,
    };
    onUpdateCompany(updatedCompany);
    try {
      localStorage.setItem('asasora_company', JSON.stringify(updatedCompany));
    } catch (e) {}
    setSaved(true);
    if (onNotify) {
      onNotify('✅ Konten Beranda (Hero Section & USP) berhasil disimpan!');
    }
    setTimeout(() => setSaved(false), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveData();
  };

  const handlePropChange = (
    index: number,
    field: 'title' | 'subtitle',
    value: string
  ) => {
    const updated = [...valueProps];
    updated[index] = { ...updated[index], [field]: value };
    setValueProps(updated);
  };

  const handleAddProp = () => {
    if (valueProps.length >= 6) return;
    setValueProps([...valueProps, { title: 'Keunggulan Baru', subtitle: 'Kategori' }]);
  };

  const handleDeleteProp = (index: number) => {
    if (valueProps.length <= 1) return;
    setValueProps(valueProps.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-[#F3C623]" />
            <span>Edit Konten Beranda (Home / Hero Section)</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Ubah teks slogan, badge penghargaan, deskripsi beranda, serta 4 pilar keunggulan nilai.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-300">
            <Check className="w-4 h-4" />
            <span>Beranda Berhasil Diperbarui!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Badges & Tagline */}
        <div className="bg-green-50/50 p-4 rounded-2xl border border-green-200 space-y-4">
          <div className="font-extrabold text-xs text-[#2E6F40] uppercase tracking-wider">
            Badge &amp; Slogan Beranda
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Judul Utama Beranda (Depan)
              </label>
              <input
                type="text"
                value={form.heroTitlePrefix || ''}
                onChange={(e) =>
                  setForm({ ...form, heroTitlePrefix: e.target.value })
                }
                placeholder="Contoh: PT. ASASORA"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold text-emerald-900 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Teks Highlight Emas (Opsional)
              </label>
              <input
                type="text"
                value={form.heroTitleHighlight || ''}
                onChange={(e) =>
                  setForm({ ...form, heroTitleHighlight: e.target.value })
                }
                placeholder="Contoh: FOOD HEALTHORA (kosongkan jika tidak perlu)"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold text-[#D1A310] focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Teks Badge Sorotan (Badge Kuning Emas)
              </label>
              <input
                type="text"
                value={form.badgeText}
                onChange={(e) =>
                  setForm({ ...form, badgeText: e.target.value })
                }
                placeholder="Contoh: Food Health Partner"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Teks Badge Halal (Badge Hijau)
              </label>
              <input
                type="text"
                value={form.halalBadgeText}
                onChange={(e) =>
                  setForm({ ...form, halalBadgeText: e.target.value })
                }
                placeholder="Contoh: Sertifikat Halal BPJPH No. ID36110001859011123"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">
                Slogan / Tagline Resmi
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) =>
                  setForm({ ...form, tagline: e.target.value })
                }
                placeholder="Contoh: 'PRODUK TERSERTIFIKASI HALAL BPJPH'"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 italic font-semibold focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Home Description */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2">
          <label className="block font-extrabold text-xs text-gray-800 uppercase tracking-wider">
            Deskripsi Pengantar Beranda
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Tuliskan deskripsi lengkap pengantar PT. Asasora..."
            className="w-full text-xs p-3 bg-gray-50 rounded-xl border border-gray-300 focus:bg-white focus:ring-2 focus:ring-[#2E6F40] outline-none leading-relaxed"
          />
        </div>

        {/* 4 Value Props Grid Editor */}
        <div className="bg-yellow-50/40 p-4 rounded-2xl border border-yellow-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-extrabold text-xs text-yellow-900 uppercase tracking-wider">
              Kartu Pilar Keunggulan Nilai (Value Props)
            </div>
            {valueProps.length < 6 && (
              <button
                type="button"
                onClick={handleAddProp}
                className="text-[11px] font-bold text-[#2E6F40] bg-white border border-green-300 hover:bg-green-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kartu</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {valueProps.map((prop, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-xl border border-yellow-200 shadow-2xs space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-yellow-800 uppercase">
                    Pilar #{idx + 1}
                  </span>
                  {valueProps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProp(idx)}
                      className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                      title="Hapus Pilar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-semibold">
                      Label Subtitle (Kecil)
                    </label>
                    <input
                      type="text"
                      value={prop.subtitle}
                      onChange={(e) =>
                        handlePropChange(idx, 'subtitle', e.target.value)
                      }
                      className="w-full p-1.5 bg-gray-50 rounded-lg border border-gray-200 text-xs text-justify"
                      placeholder="Contoh: Bahan Baku"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-semibold">
                      Judul Utama (Tebal Hijau)
                    </label>
                    <input
                      type="text"
                      value={prop.title}
                      onChange={(e) =>
                        handlePropChange(idx, 'title', e.target.value)
                      }
                      className="w-full p-1.5 bg-gray-50 rounded-lg border border-gray-200 text-xs font-bold text-[#2E6F40]"
                      placeholder="Contoh: 100% Halal Resmi"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="bg-gradient-to-br from-green-50 to-yellow-50/50 p-4 rounded-2xl border border-green-100 space-y-2 text-center sm:text-left">
          <div className="text-[10px] font-extrabold text-gray-500 uppercase">
            Live Preview Beranda:
          </div>
          <div className="space-y-1.5">
            <span className="inline-block bg-[#F3C623]/25 text-yellow-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#F3C623]/40">
              {form.badgeText}
            </span>
            <h2 className="text-lg font-black text-[#2E6F40]">
              {form.heroTitlePrefix || 'PT. ASASORA'}{' '}
              <span className="text-[#D1A310]">{form.heroTitleHighlight || 'BIO HEALTHORA'}</span>
            </h2>
            <p className="text-xs italic text-gray-600 font-medium">{form.tagline}</p>
            <p className="text-xs text-gray-500 line-clamp-2">{form.description}</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 font-medium">
            {saved ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> Perubahan tersimpan ke Beranda!
              </span>
            ) : (
              <span>Pastikan data sudah benar sebelum menyimpan.</span>
            )}
          </div>
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleSaveData();
            }}
            className="flex items-center gap-2 bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-bold px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 text-[#F3C623]" />
            <span>Simpan Perubahan Beranda</span>
          </button>
        </div>
      </form>
    </div>
  );
};
