import React, { useState } from 'react';
import { Receipt, FileText, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { Sale, CompanyProfile } from '../types';
import { rupiah } from '../utils/formatters';
import { NavPage } from './Sidebar';

interface TaxReportViewProps {
  sales: Sale[];
  companyProfile: CompanyProfile;
  onNavigate: (page: NavPage) => void;
  onUpdateProfile: (prof: CompanyProfile) => void;
}

export const TaxReportView: React.FC<TaxReportViewProps> = ({
  sales,
  companyProfile,
  onUpdateProfile,
}) => {
  const [npwp, setNpwp] = useState(companyProfile.npwp || '40.824.912.8-416.000');
  const [ptName, setPtName] = useState(companyProfile.ptName || 'PT. ASASORA BIO HEALTHORA');
  const [isSaved, setIsSaved] = useState(false);

  const totalOmzet = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const pphFinalTarif = 0.005; // 0.5% PPh Final UMKM PP 55 / 2022
  const pphFinalAmount = Math.round(totalOmzet * pphFinalTarif);

  const handleSaveTaxProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...companyProfile,
      npwp,
      ptName,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#087443]" />
          <span>Laporan Pajak & Identitas NPWP PT. Asasora</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kompilasi omzet bruto, perhitungan estimasi PPh Final jasaboga, dan data legalitas faktur pajak.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Summary Tax Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Omzet Bruto Periode Berjalan</span>
              <p className="text-2xl font-black text-slate-900 mt-2">{rupiah(totalOmzet)}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Dasar Pengenaan Pajak (DPP)</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Estimasi PPh Final UMKM (0.5%)</span>
              <p className="text-2xl font-black text-emerald-800 mt-2">{rupiah(pphFinalAmount)}</p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Sesuai PP No. 55 / 2022</span>
            </div>
          </div>

          {/* Form Legalitas NPWP PT */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Data Entitas Wajib Pajak Badan</span>
            </h2>

            {isSaved && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Data entitas pajak berhasil diperbarui!</span>
              </div>
            )}

            <form onSubmit={handleSaveTaxProfile} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Perusahaan Terdaftar</label>
                <input
                  type="text"
                  required
                  value={ptName}
                  onChange={(e) => setPtName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Pokok Wajib Pajak (NPWP Badan)</label>
                <input
                  type="text"
                  required
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#087443] hover:bg-[#065e36] text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-950/20 cursor-pointer"
                >
                  Perbarui Profil Pajak
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Info Note */}
        <div className="bg-linear-to-br from-[#032e1a] to-[#087443] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-extrabold uppercase text-[#F3C623] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Legalitas Resmi B2B Korporat</span>
            </div>
            <h3 className="text-base font-black text-white">Faktur Pajak & TOP Korporat</h3>
            <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
              Sebagai badan hukum resmi (PT. ASASORA BIO HEALTHORA), katering kami melayani instansi BUMN, pabrik, dan korporat swasta dengan kemudahan administrasi faktur pajak, kwitansi bertempel materai, dan sistem pembayaran termin (Term of Payment / TOP).
            </p>
          </div>

          <div className="pt-6 border-t border-emerald-700/60 text-[11px] text-emerald-200">
            NIB: <span className="font-mono text-white font-bold">{companyProfile.nib || '2408220023412'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
