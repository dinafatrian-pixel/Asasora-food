import React from 'react';
import {
  ShieldCheck,
  MessageCircle,
  ChevronRight,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { CompanyInfo } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MinsoraAvatar } from './MinsoraAvatar';

interface HeroSectionProps {
  company: CompanyInfo;
  onOrderClick: () => void;
}

const DEFAULT_HALAL_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Halal_Indonesia.svg/512px-Halal_Indonesia.svg.png';

export const HeroSection: React.FC<HeroSectionProps> = ({ company, onOrderClick }) => {
  const { t, lang } = useLanguage();
  const halalLogo = company.halalLogoUrl || DEFAULT_HALAL_LOGO;

  const scrollToLegalitas = () => {
    const el = document.getElementById('legalitas');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative bg-gradient-to-br from-green-50/80 via-yellow-50/30 to-white py-10 sm:py-16 lg:py-24 overflow-hidden border-b border-green-50"
    >
      {/* Subtle decorative background circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Hero Content & CTA */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 bg-[#F3C623]/25 text-yellow-900 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-[#F3C623]/40 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-yellow-700" />
                {lang === 'en' ? 'Food & Health Partner' : company.badgeText || 'Food & Health Partner'}
              </span>
              <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-900 text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-300 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'en' ? t('hero.halal_badge', 'Official BPJPH Halal Certified') : company.halalBadgeText || t('hero.halal_badge', 'Sertifikat Halal Resmi BPJPH')}</span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#2E6F40] leading-tight tracking-tight">
              {company.heroTitlePrefix || 'PT. ASASORA'}
              {company.heroTitleHighlight &&
              company.heroTitleHighlight.toUpperCase() !== 'BIO HEALTHORA' ? (
                <span className="text-[#D1A310]"> {company.heroTitleHighlight}</span>
              ) : null}
            </h1>

            {/* Tagline */}
            <p className="text-base sm:text-xl italic font-semibold text-gray-700">
              {lang === 'en'
                ? t('hero.tagline', '"BPJPH HALAL CERTIFIED PRODUCTS"')
                : company.tagline}
            </p>

            {/* Description */}
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl whitespace-pre-line">
              {lang === 'en'
                ? t('hero.description', 'High-quality products produced from safe, hygienic, and authentic halal ingredients.')
                : company.description}
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOrderClick}
                className="bg-[#2E6F40] hover:bg-green-800 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition duration-200 text-center text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer group active:scale-95"
              >
                <span>{t('hero.btn_order', 'Pesan Sekarang')}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
              <a
                href={`https://wa.me/${company.whatsapp}?text=Halo%20MinSora%20${encodeURIComponent(
                  company.name
                )},%20saya%20ingin%20berkonsultasi%20menu`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F3C623] hover:bg-[#D1A310] text-gray-900 font-extrabold px-6 py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2.5 text-sm sm:text-base active:scale-95 border border-[#e5b719]"
              >
                <MinsoraAvatar size="sm" showWaBadge={true} />
                <span>{t('hero.btn_consult', 'Chat WhatsApp MinSora')}</span>
              </a>
            </div>

            {/* Value Props Row */}
            {(() => {
              const rawProps =
                company.heroValueProps && company.heroValueProps.length > 0
                  ? company.heroValueProps
                  : [
                      {
                        title: t('hero.vp1_title', '100% Halal Resmi'),
                        subtitle: t('hero.vp1_desc', 'Bahan Baku Terjamin'),
                      },
                      {
                        title: t('hero.vp2_title', 'Higienis & Sanitasi'),
                        subtitle: t('hero.vp2_desc', 'Standar Jasaboga'),
                      },
                      {
                        title: t('hero.vp3_title', 'Cek Ongkir Otomatis'),
                        subtitle: t('hero.vp3_desc', '7 Opsi Kurir'),
                      },
                    ];

              return (
                <div className={`grid grid-cols-1 ${rawProps.length === 2 ? 'sm:grid-cols-2' : rawProps.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'} gap-3 pt-5 border-t border-green-100/80 text-left`}>
                  {rawProps.map((prop, idx) => (
                    <div
                      key={idx}
                      className="bg-white/85 backdrop-blur-xs p-3 rounded-xl border border-green-100 shadow-2xs hover:border-green-200 transition"
                    >
                      <div className="text-[11px] text-gray-500 font-medium leading-tight">
                        {lang === 'en' ? t(`hero.vp${idx + 1}_desc`, prop.subtitle) : prop.subtitle}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-[#2E6F40] mt-0.5">
                        {lang === 'en' ? t(`hero.vp${idx + 1}_title`, prop.title) : prop.title}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Right Column: Halal Certification & Showcase Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm bg-gradient-to-b from-white via-emerald-50/20 to-amber-50/20 p-4 sm:p-5 rounded-2xl border border-emerald-200/90 shadow-lg relative overflow-hidden backdrop-blur-xs group hover:border-emerald-300 transition duration-300">
              {/* Background ambient glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

              {/* Card Top Pill Badge */}
              <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-3 mb-3.5">
                <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{t('hero.card_halal_tag', 'TERSERTIFIKASI HALAL RESMI')}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                  BPJPH RI
                </span>
              </div>

              {/* Central Logo Container */}
              <div className="flex flex-col items-center text-center">
                <div className="relative p-3 bg-white rounded-2xl shadow-xs border border-emerald-100 group-hover:shadow-md transition duration-300">
                  <picture>
                    <source srcSet={halalLogo} type="image/svg+xml" />
                    <img
                      src={halalLogo}
                      alt="Logo Sertifikat Halal BPJPH Kemenag RI"
                      width={128}
                      height={128}
                      fetchPriority="high"
                      decoding="async"
                      className="h-28 sm:h-32 w-auto object-contain transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_HALAL_LOGO;
                      }}
                    />
                  </picture>
                  <div className="absolute bottom-1 right-1 bg-[#F3C623] text-gray-900 p-1 rounded-full shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-950" />
                  </div>
                </div>

                <div className="mt-3">
                  <p className="font-extrabold text-gray-900 text-xs sm:text-sm tracking-tight">
                    {lang === 'en' ? 'Halal Product Assurance Organizing Agency' : company.halalAgency || 'Badan Penyelenggara Jaminan Produk Halal'}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-bold mt-0.5 font-mono">
                    No. Reg: {company.halalNumber || 'ID3611000000000'}
                  </p>
                </div>
              </div>

              {/* 3 Key Trust Badges */}
              <div className="mt-4 pt-3 border-t border-emerald-100 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-gray-700 font-medium bg-white/80 p-1.5 rounded-lg border border-emerald-50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{t('hero.card_trust1', '100% Bahan Baku & Dapur Halal')}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-700 font-medium bg-white/80 p-1.5 rounded-lg border border-emerald-50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{t('hero.card_trust2', 'Standar Sanitasi & Uji Higiene')}</span>
                </div>
              </div>

              {/* Action Button to Legalitas */}
              <button
                type="button"
                onClick={scrollToLegalitas}
                className="mt-3.5 w-full bg-emerald-50 hover:bg-emerald-100 text-[#2E6F40] text-xs font-bold py-2 rounded-xl border border-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{t('hero.card_btn_verify', 'Verifikasi Dokumen Legalitas')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
