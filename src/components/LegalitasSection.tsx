import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Eye, ExternalLink, X } from 'lucide-react';
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
    <section className="py-16 sm:py-24 bg-[#F7F8F6] border-b border-stone-200" id="legalitas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#0F5132] font-bold text-xs tracking-[0.14em] uppercase">
            {t('legality.tag', 'Dokumen Perusahaan')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 mt-2 leading-tight tracking-tight">
            {t('legality.title', 'Legalitas Resmi PT Asasora Bio Healthora - Catering Halal Tangerang')}
          </h2>
          <p className="text-stone-600 mt-4 text-sm sm:text-base leading-relaxed">
            {t(
              'legality.subtitle',
              'Sebagai komitmen penuh dalam menyajikan kuliner yang aman dan higienis, PT Asasora Bio Healthora memastikan seluruh layanan Asasora Catering telah mengantongi izin resmi pemerintah. Kami bangga menjadi mitra katering prasmanan pesta dan catering hajatan Tangerang yang tepercaya melalui kelengkapan dokumen hukum yang sah, mulai dari NIB, Izin Edar PIRT, hingga Sertifikat Halal Resmi BPJPH RI.'
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
                className="card-hover group bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#F7F8F6] text-[#0F5132] flex items-center justify-center border border-stone-200 shrink-0 transition-transform duration-200 group-hover:scale-105">
                      <ShieldCheck className="w-5 h-5 text-[#0F5132]" strokeWidth={1.75} />
                    </div>
                    <span className="text-[11px] font-bold text-[#0F5132] bg-[#F7F8F6] border border-stone-200 px-3 py-1 rounded-md uppercase tracking-wider">
                      {doc.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-stone-900 leading-snug">
                      {doc.title}
                    </h3>
                    <div className="text-xs font-mono font-bold text-stone-700 bg-[#FAFBF9] border border-stone-200 px-2.5 py-1 rounded-md inline-block mt-2 tabular-nums">
                      No: {doc.docNumber}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {doc.description}
                  </p>

                  <div className="pt-3 border-t border-stone-100 text-xs text-stone-500 space-y-1">
                    <div>
                      <span className="font-semibold text-stone-700">{t('legality.issuer', 'Penerbit:')}</span> {doc.issuer}
                    </div>
                    <div>
                      <span className="font-semibold text-stone-700">{t('legality.validity', 'Masa Berlaku:')}</span>{' '}
                      <span className="text-[#0F5132] font-bold">{doc.validUntil}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(doc)}
                    className="btn-micro text-xs font-bold text-[#0F5132] hover:text-white flex items-center gap-1.5 cursor-pointer bg-[#F7F8F6] hover:bg-[#0F5132] border border-stone-200 hover:border-[#0F5132] px-3.5 py-2 rounded-lg"
                  >
                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                    <span>{t('legality.btn_view', 'Lihat Lembar Dokumen')}</span>
                  </button>

                  <span className="text-xs text-[#0F5132] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>{t('legality.verified', 'Sah & Legal')}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Document Modal */}
        {selectedDoc && (
          <div
            className="fixed inset-0 z-50 bg-stone-950/75 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
            onClick={() => setSelectedDoc(null)}
          >
            <div
              className="bg-white rounded-2xl overflow-hidden max-w-xl w-full relative border border-stone-300 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 sm:px-6 bg-[#0F5132] text-white flex items-center justify-between shrink-0 border-b border-[#0b3d26]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#F3C623]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm sm:text-base leading-tight text-white">
                      {t('legality.modal_title', 'Lembar Dokumen Legalitas')}
                    </p>
                    <p className="text-[11px] text-stone-200 font-mono">
                      {selectedDoc.docNumber}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="bg-white/15 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/25"
                  title={t('legality.close_exit', 'Tutup / Keluar (Esc)')}
                  aria-label="Tutup jendela dokumen"
                >
                  <X className="w-4 h-4" strokeWidth={1.75} />
                  <span className="hidden sm:inline">{t('legality.modal_close', 'Keluar')}</span>
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-stone-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold bg-[#F7F8F6] text-[#0F5132] px-3 py-1 rounded-md border border-stone-200">
                    {selectedDoc.status}
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">
                    {t('legality.validity', 'Masa Berlaku:')} <strong className="text-[#0F5132]">{selectedDoc.validUntil}</strong>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900 leading-snug">
                    {selectedDoc.title}
                  </h3>
                  <div className="text-xs font-mono text-stone-700 bg-[#FAFBF9] p-2.5 rounded-lg mt-2 border border-stone-200">
                    {t('legality.doc_no', 'Nomor Surat / Sertifikat:')} <strong>{selectedDoc.docNumber}</strong>
                  </div>
                </div>

                {/* Document Scan / Image Preview */}
                {(selectedDoc.image || selectedDoc.previewUrl) && (
                  <div className="my-3 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 group relative">
                    <img
                      src={selectedDoc.image || selectedDoc.previewUrl}
                      alt={selectedDoc.title}
                      width={600}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="w-full max-h-72 object-contain mx-auto"
                    />
                    <a
                      href={selectedDoc.image || selectedDoc.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 bg-stone-900 hover:bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-white/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>{t('legality.open_full', 'Buka Ukuran Penuh')}</span>
                    </a>
                  </div>
                )}

                <div className="bg-[#FAFBF9] p-4 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <p>{selectedDoc.description}</p>
                </div>

                <div className="p-4 bg-[#FAFBF9] border border-stone-200 rounded-xl text-xs space-y-1.5 text-stone-700">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-stone-800 min-w-28">{t('legality.issuer', 'Instansi Penerbit:')}</span>
                    <span>{selectedDoc.issuer}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-stone-800 min-w-28">{lang === 'en' ? 'Validity Status:' : 'Status Keabsahan:'}</span>
                    <span className="text-[#0F5132] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 inline" strokeWidth={1.75} />
                      {t('legality.verified', 'Aktif & Terverifikasi Resmi')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 sm:p-5 bg-[#FAFBF9] border-t border-stone-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="btn-micro w-full bg-[#0F5132] hover:bg-[#0b3d26] text-white font-bold py-3 px-5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" strokeWidth={1.75} />
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
