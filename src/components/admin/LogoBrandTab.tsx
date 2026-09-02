import React, { useState, useEffect } from 'react';
import { CompanyInfo } from '../../types';
import { CloudinaryImageField } from './CloudinaryImageField';
import {
  RotateCcw,
  Check,
  Sparkles,
  ShieldCheck,
  Award,
  RefreshCw,
  Eye,
  FileCheck,
  Layers,
  Cloud,
} from 'lucide-react';

interface LogoBrandTabProps {
  company: CompanyInfo;
  onUpdateCompany: (company: CompanyInfo) => void;
  onNotify?: (msg: string) => void;
}

const DEFAULT_LOGO = '/logo-asasora.png';

const DEFAULT_HALAL_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Halal_Indonesia.svg/512px-Halal_Indonesia.svg.png';

export const LogoBrandTab: React.FC<LogoBrandTabProps> = ({
  company,
  onUpdateCompany,
  onNotify,
}) => {
  const [logoUrl, setLogoUrl] = useState(() => company.logoUrl || DEFAULT_LOGO);
  const [halalLogoUrl, setHalalLogoUrl] = useState(
    () => company.halalLogoUrl || DEFAULT_HALAL_LOGO
  );
  const [heroPrefix, setHeroPrefix] = useState(
    () => company.heroTitlePrefix || 'PT. ASASORA'
  );
  const [heroHighlight, setHeroHighlight] = useState(
    () => company.heroTitleHighlight || ''
  );
  const [halalBadgeText, setHalalBadgeText] = useState(
    () => company.halalBadgeText || 'Sertifikat Halal Resmi BPJPH'
  );
  const [halalNumber, setHalalNumber] = useState(
    () => company.halalNumber || 'ID3611000000000'
  );
  const [halalAgency, setHalalAgency] = useState(
    () => company.halalAgency || 'BPJPH Kemenag RI'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveData = () => {
    setIsSaving(true);

    const updated: CompanyInfo = {
      ...company,
      logoUrl: logoUrl.trim() || DEFAULT_LOGO,
      halalLogoUrl: halalLogoUrl.trim() || DEFAULT_HALAL_LOGO,
      heroTitlePrefix: heroPrefix.trim() || 'PT. ASASORA',
      heroTitleHighlight: heroHighlight.trim(),
      halalBadgeText: halalBadgeText.trim(),
      halalNumber: halalNumber.trim(),
      halalAgency: halalAgency.trim(),
    };

    onUpdateCompany(updated);

    try {
      localStorage.setItem('asasora_company', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save to localStorage', err);
    }

    setIsSaving(false);
    setSaved(true);
    if (onNotify) {
      onNotify('✅ Pengaturan logo dan branding berhasil disimpan!');
    }
    setTimeout(() => setSaved(false), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveData();
  };

  const handleResetToDefault = () => {
    setLogoUrl(DEFAULT_LOGO);
    setHalalLogoUrl(DEFAULT_HALAL_LOGO);
    setHeroPrefix('PT. ASASORA');
    setHeroHighlight('');
    setHalalBadgeText('Sertifikat Halal Resmi BPJPH');
    setHalalNumber('ID3611000000000');
    setHalalAgency('BPJPH Kemenag RI');

    const updated = {
      ...company,
      logoUrl: DEFAULT_LOGO,
      halalLogoUrl: DEFAULT_HALAL_LOGO,
      heroTitlePrefix: 'PT. ASASORA',
      heroTitleHighlight: '',
      halalBadgeText: 'Sertifikat Halal Resmi BPJPH',
      halalNumber: 'ID3611000000000',
      halalAgency: 'BPJPH Kemenag RI',
    };
    onUpdateCompany(updated);
    try {
      localStorage.setItem('asasora_company', JSON.stringify(updated));
    } catch (e) {}
    setShowResetConfirm(false);
    setSaved(true);
    if (onNotify) {
      onNotify('🔄 Logo dan branding berhasil di-reset ke setelan awal default!');
    }
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6" id="admin-logo-brand-tab">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F3C623]" />
            <span>Pengaturan Logo Utama &amp; Logo Halal (Home Kanan)</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Ganti logo utama PT. Asasora, upload logo halal BPJPH untuk showcase kanan beranda (Home), serta sesuaikan teks nama brand.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3.5 py-2 rounded-xl border border-emerald-300 shadow-2xs animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Perubahan Logo &amp; Brand Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two-Column Logo Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Main Company Logo */}
          <div className="bg-emerald-50/40 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block font-extrabold text-xs text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#2E6F40]" />
                <span>1. Logo Utama PT. Asasora</span>
              </label>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Navbar &amp; Footer
              </span>
            </div>

            <CloudinaryImageField
              label="File Logo Utama (Unggah ke Cloudinary CDN)"
              value={logoUrl}
              onChange={setLogoUrl}
              description="Tampil pada bilah atas (Navbar), Footer, dan Kop Formulir Pemesanan."
              aspectRatio="square"
              onNotify={onNotify}
            />
          </div>

          {/* Halal Logo & Certificate (Shows in Home Right Side) */}
          <div className="bg-amber-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block font-extrabold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. Logo Halal BPJPH (Home Sebelah Kanan)</span>
              </label>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                Showcase Beranda
              </span>
            </div>

            <CloudinaryImageField
              label="File Logo Halal (Unggah ke Cloudinary CDN)"
              value={halalLogoUrl}
              onChange={setHalalLogoUrl}
              description="Ditampilkan di kartu sertifikasi Halal sebelah kanan Home (Beranda), banner halal, & dokumen legalitas."
              aspectRatio="square"
              onNotify={onNotify}
            />
          </div>
        </div>

        {/* Halal Badge & Certificate Meta */}
        <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h5 className="font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#2E6F40]" />
              <span>Detail Informasi Sertifikat Halal (Home Kanan)</span>
            </h5>
            <span className="text-[11px] text-gray-400">
              Menyesuaikan teks pada kartu sertifikasi halal di beranda
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Teks Badge Halal
              </label>
              <input
                type="text"
                value={halalBadgeText}
                onChange={(e) => setHalalBadgeText(e.target.value)}
                placeholder="Sertifikat Halal Resmi BPJPH"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                No. Registrasi / ID Halal
              </label>
              <input
                type="text"
                value={halalNumber}
                onChange={(e) => setHalalNumber(e.target.value)}
                placeholder="Contoh: ID3611000000000"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Lembaga / Penerbit Sertifikat
              </label>
              <input
                type="text"
                value={halalAgency}
                onChange={(e) => setHalalAgency(e.target.value)}
                placeholder="BPJPH Kemenag RI"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Brand Text Settings */}
        <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3">
          <div className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">
            Format Teks Nama Brand (Navbar &amp; Footer)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Teks Awalan Nama (Prefix)
              </label>
              <input
                type="text"
                value={heroPrefix}
                onChange={(e) => setHeroPrefix(e.target.value)}
                placeholder="Contoh: PT. ASASORA"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold text-[#2E6F40] focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Teks Sorotan Emas (Highlight)
              </label>
              <input
                type="text"
                value={heroHighlight}
                onChange={(e) => setHeroHighlight(e.target.value)}
                placeholder="Contoh: BIO HEALTHORA"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold text-amber-700 focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Dual Live Interactive Mockup Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Mockup 1: Navbar Brand */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2 shadow-2xs">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#2E6F40]" />
              <span>Pratinjau Bilah Menu (Navbar)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-green-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img
                  src={logoUrl}
                  alt="Live Navbar Preview"
                  className="h-10 w-10 object-contain rounded-lg border border-green-100 p-0.5 bg-white"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-[#2E6F40] leading-none">
                    {heroPrefix ? heroPrefix.replace('PT. ', '').trim() || 'ASASORA' : 'ASASORA'}
                  </span>
                  {heroHighlight ? (
                    <span className="text-[11px] font-bold text-[#F3C623] tracking-wide mt-0.5">
                      {heroHighlight}
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2.5 py-1 rounded-full border border-green-200">
                Navbar Live
              </span>
            </div>
          </div>

          {/* Mockup 2: Home Right-Side Halal Card */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2 shadow-2xs">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pratinjau Halal Sebelah Kanan Beranda (Home)</span>
            </div>
            <div className="bg-gradient-to-br from-white via-amber-50/40 to-emerald-50/40 p-3.5 rounded-xl border border-amber-300/80 shadow-xs flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-xl border border-amber-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                <img
                  src={halalLogoUrl}
                  alt="Live Halal Home Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-xs flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                    100% Halal Resmi
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {halalNumber || 'ID3611000000000'}
                  </span>
                </div>
                <div className="font-extrabold text-gray-900 mt-1 text-xs">
                  {halalBadgeText || 'Sertifikat Halal Resmi BPJPH'}
                </div>
                <div className="text-[10px] text-gray-500">
                  Penerbit: {halalAgency || 'BPJPH Kemenag RI'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Reset Confirm Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-gray-900 text-base">
                    Kembalikan Logo ke Default?
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Kembalikan logo utama dan logo halal BPJPH ke setelan bawaan default Asasora.
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
                  onClick={handleResetToDefault}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ya, Reset Logo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions & Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan Logo Default</span>
          </button>

          <button
            type="submit"
            id="btn-save-logo-brand"
            disabled={isSaving}
            onClick={(e) => {
              e.preventDefault();
              handleSaveData();
            }}
            className="flex items-center gap-2 bg-[#2E6F40] hover:bg-green-800 active:scale-95 disabled:opacity-50 text-white text-xs font-bold px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#F3C623]" />
            ) : (
              <Check className="w-4 h-4 text-[#F3C623]" />
            )}
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Logo & Brand'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
