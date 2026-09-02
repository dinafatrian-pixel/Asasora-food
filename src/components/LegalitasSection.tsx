import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, CheckCircle2, Eye, ExternalLink, X, ArrowLeft, Download } from 'lucide-react';
import { LegalDocument } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedLegalDoc } from '../utils/translator';

interface LegalitasSectionProps {
  documents: LegalDocument[];
}

export const LegalitasSection: React.FC<LegalitasSectionProps> = ({ documents }) => {
  const { t, lang } = useLanguage();
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);

  // Close modal with Escape key and prevent background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDoc(null);
      }
    };

    if (selectedDoc) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDoc]);

  return (
    <section className="py-16 sm:py-24 bg-[#F9FDF9] border-t border-green-100" id="legalitas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#4A9E60] font-bold text-xs sm:text-sm tracking-widest uppercase">
            {t('legality.tag', 'Dokumen Perusahaan')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2E6F40] mt-2">
            {t('legality.title', 'Legalitas PT. ASASORA BIO HEALTHORA')}
          </h2>
          <div className="w-24 h-1.5 bg-[#F3C623] mx-auto mt-4 rounded-full" />
          <p className="text-gray-600 mt-4 text-sm sm:text-base">
            {t(
              'legality.subtitle',
              'Dokumen legalitas resmi perusahaan yang terdaftar dan terverifikasi pada kementerian dan dinas terkait Republik Indonesia.'
            )}
          </p>
        </div>

        {/* Legal Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto" id="legalitas-content">
          {documents.map((rawDoc) => {
            const doc = getLocalizedLegalDoc(rawDoc, lang);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-green-200/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group hover:border-[#2E6F40]"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#2E6F40] flex items-center justify-center font-bold text-xl border border-green-200 shrink-0">
                      <ShieldCheck className="w-6 h-6 text-[#2E6F40]" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider">
                      {doc.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#2E6F40] leading-snug">
                      {doc.title}
                    </h3>
                    <div className="text-xs font-mono font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg inline-block mt-2">
                      No: {doc.docNumber}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {doc.description}
                  </p>

                  <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
                    <div>
                      <span className="font-semibold text-gray-700">{t('legality.issuer', 'Penerbit:')}</span> {doc.issuer}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">{t('legality.validity', 'Masa Berlaku:')}</span>{' '}
                      <span className="text-emerald-700 font-bold">{doc.validUntil}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-green-50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(doc)}
                    className="text-xs font-bold text-[#2E6F40] hover:text-green-800 flex items-center gap-1.5 cursor-pointer bg-green-50 hover:bg-green-100 px-3.5 py-2 rounded-xl transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{t('legality.btn_view', 'Lihat Lembar Dokumen')}</span>
                  </button>

                  <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('legality.verified', 'Sah & Legal')}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Document Modal (With Prominent Close/Exit Controls) */}
        {selectedDoc && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
            onClick={() => setSelectedDoc(null)}
          >
            <div
              className="bg-white rounded-3xl overflow-hidden max-w-xl w-full shadow-2xl relative border-2 border-emerald-500 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Prominent Exit / Close Buttons */}
              <div className="px-5 py-4 sm:px-6 bg-gradient-to-r from-emerald-900 to-[#2E6F40] text-white flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base leading-tight text-white">
                      {t('legality.modal_title', 'Lembar Dokumen Legalitas')}
                    </h4>
                    <p className="text-[11px] text-emerald-200 font-mono">
                      {selectedDoc.docNumber}
                    </p>
                  </div>
                </div>

                {/* Explicit Exit / Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="bg-white/20 hover:bg-red-500 hover:text-white text-white px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 border border-white/30"
                  title={t('legality.close_exit', 'Tutup / Keluar (Esc)')}
                  aria-label="Tutup jendela dokumen"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('legality.modal_close', 'Keluar')}</span>
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                    {selectedDoc.status}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">
                    {t('legality.validity', 'Masa Berlaku:')} <strong className="text-emerald-700">{selectedDoc.validUntil}</strong>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#2E6F40] leading-snug">
                    {selectedDoc.title}
                  </h3>
                  <div className="text-xs font-mono text-gray-700 bg-gray-100 p-2.5 rounded-xl mt-2 border border-gray-200">
                    {t('legality.doc_no', 'Nomor Surat / Sertifikat:')} <strong>{selectedDoc.docNumber}</strong>
                  </div>
                </div>

                {/* Document Scan / Image Preview */}
                {(selectedDoc.image || selectedDoc.previewUrl) && (
                  <div className="my-3 rounded-2xl overflow-hidden border-2 border-emerald-200/80 bg-gray-50 shadow-inner group relative">
                    <img
                      src={selectedDoc.image || selectedDoc.previewUrl}
                      alt={selectedDoc.title}
                      className="w-full max-h-72 object-contain bg-slate-900/5 mx-auto"
                    />
                    <a
                      href={selectedDoc.image || selectedDoc.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 bg-gray-900/85 hover:bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md transition backdrop-blur-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{t('legality.open_full', 'Buka Ukuran Penuh')}</span>
                    </a>
                  </div>
                )}

                <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-gray-700 leading-relaxed">
                  <p>{selectedDoc.description}</p>
                </div>

                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs space-y-1.5 text-gray-700">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-gray-800 min-w-28">{t('legality.issuer', 'Instansi Penerbit:')}</span>
                    <span>{selectedDoc.issuer}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-gray-800 min-w-28">{lang === 'en' ? 'Validity Status:' : 'Status Keabsahan:'}</span>
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 inline" />
                      {t('legality.verified', 'Aktif & Terverifikasi Resmi')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fixed Footer with Large Prominent Exit / Close Button */}
              <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="w-full bg-[#2E6F40] hover:bg-emerald-800 active:bg-emerald-950 text-white font-extrabold py-3 px-5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>{t('legality.close_exit', 'Tutup & Keluar Dokumen')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};


