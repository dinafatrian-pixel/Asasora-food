import React from 'react';
import {
  ShieldCheck,
  ChevronRight,
  FileCheck2,
  CheckCircle2,
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
      className="bg-[#F7F8F6] py-12 sm:py-20 lg:py-24 border-b border-stone-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-Column Row: Left Hero Content & Right Halal Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Hero Content & CTA */}
          <div className="lg:col-span-7 flex flex-col justify-between text-center lg:text-left">
            {/* Top Content Block: Editorial Kicker, Title, Tagline, Description */}
            <div className="space-y-5">
              {/* Quiet Editorial Kicker (Zero-Pill) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#0F5132]">
                <span>
                  {lang === 'en' ? 'Food & Catering Partner' : company.badgeText || 'Food & Catering Partner'}
                </span>
                <span className="text-stone-300" aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5 text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-[#0F5132]" strokeWidth={1.75} />
                  <span>
                    {lang === 'en'
                      ? t('hero.halal_badge', 'Official BPJPH Halal Certified')
                      : company.halalBadgeText || t('hero.halal_badge', 'Sertifikat Halal Resmi BPJPH')}
                  </span>
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black text-[#0F5132] leading-[1.08] tracking-tight">
                {company.heroTitlePrefix || 'PT. ASASORA'}
                {company.heroTitleHighlight &&
                company.heroTitleHighlight.toUpperCase() !== 'BIO HEALTHORA' ? (
                  <span className="text-stone-900"> {company.heroTitleHighlight}</span>
                ) : null}
              </h1>

              {/* Tagline */}
              <p className="text-base sm:text-lg font-semibold text-stone-700 tracking-tight">
                {lang === 'en'
                  ? t('hero.tagline', '"BPJPH HALAL CERTIFIED PRODUCTS"')
                  : company.tagline}
              </p>

              {/* Description */}
              <p className="text-stone-600 text-sm sm:text-base lg:text-[17px] leading-relaxed max-w-2xl whitespace-pre-line mx-auto lg:mx-0">
                {lang === 'en'
                  ? t('hero.description', 'High-quality products produced from safe, hygienic, and authentic halal ingredients.')
                  : company.description}
              </p>
            </div>

            {/* Bottom Content Block: Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5 pt-8">
              <button
                onClick={onOrderClick}
                className="btn-micro min-h-[48px] bg-[#0F5132] hover:bg-[#0b3d26] text-white font-bold px-7 py-3.5 rounded-xl border border-[#0b3d26] text-center text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{t('hero.btn_order', 'Pesan Sekarang')}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </button>
              <a
                href={`https://wa.me/${company.whatsapp}?text=Halo%20MinSora%20${encodeURIComponent(
                  company.name
                )},%20saya%20ingin%20berkonsultasi%20menu`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-micro min-h-[48px] bg-[#F3C623] hover:bg-[#D9AE14] text-stone-900 font-bold px-6 py-3 rounded-xl border border-[#D9AE14] flex items-center justify-center space-x-2.5 text-sm sm:text-base"
              >
                <MinsoraAvatar size="sm" showWaBadge={true} />
                <span>{t('hero.btn_consult', 'Chat WhatsApp MinSora')}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Halal Certification & Showcase Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="card-hover w-full max-w-sm bg-white p-6 rounded-2xl border border-stone-200 hover:border-[#0F5132]/50 flex flex-col justify-between h-full">
              {/* Card Top Header */}
              <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-3.5">
                <div className="inline-flex items-center gap-2 text-[#0F5132] text-[11px] font-extrabold uppercase tracking-[0.1em]">
                  <ShieldCheck className="w-4 h-4 text-[#0F5132]" strokeWidth={1.75} />
                  <span>{t('hero.card_halal_tag', 'TERSERTIFIKASI HALAL RESMI')}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 border border-stone-200 bg-stone-50 px-2 py-0.5 rounded">
                  Terverifikasi
                </span>
              </div>

              {/* Central Logo Container */}
              <div className="flex flex-col items-center text-center my-auto py-6">
                <div className="relative p-5 bg-[#FAFBF9] rounded-2xl border border-stone-200">
                  <picture>
                    <source srcSet={halalLogo} type="image/svg+xml" />
                    <img
                      src={halalLogo}
                      alt="Logo Sertifikat Halal Resmi"
                      width={180}
                      height={180}
                      fetchPriority="high"
                      decoding="async"
                      className="h-32 sm:h-36 lg:h-40 w-auto max-w-[180px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_HALAL_LOGO;
                      }}
                    />
                  </picture>
                  <div className="absolute -bottom-2 -right-2 bg-[#F3C623] text-stone-900 p-1.5 rounded-lg border border-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-stone-900" strokeWidth={2} />
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="font-extrabold text-stone-900 text-sm tracking-tight">
                    {lang === 'en'
                      ? 'Halal Product Assurance Organizing Agency (SH-BPJPH)'
                      : (company.halalAgency || 'SH-BPJPH')
                          .replace(/SH-Kemenag/gi, 'SH-BPJPH')
                          .replace(/Kemenag RI/gi, 'SH-BPJPH')
                          .replace(/Kemenag/gi, 'BPJPH')
                          .trim() || 'SH-BPJPH'}
                  </p>
                  <p className="text-xs sm:text-[13px] text-[#0F5132] font-bold font-mono tracking-wide tabular-nums">
                    No. Reg: {company.halalNumber || 'ID36110081134110926'}
                  </p>
                </div>
              </div>

              {/* Bottom: Trust Points & Verify Button */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] shrink-0" strokeWidth={1.75} />
                    <span>{t('hero.card_trust1', '100% Bahan Baku & Dapur Halal')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] shrink-0" strokeWidth={1.75} />
                    <span>{t('hero.card_trust2', 'Standar Sanitasi & Uji Higiene')}</span>
                  </div>
                </div>

                {/* Action Button to Legalitas */}
                <button
                  type="button"
                  onClick={scrollToLegalitas}
                  className="btn-micro w-full bg-[#F7F8F6] hover:bg-stone-100 text-[#0F5132] text-xs font-bold py-2.5 rounded-xl border border-stone-200 hover:border-[#0F5132]/40 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{t('hero.card_btn_verify', 'Verifikasi Dokumen Legalitas')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Value Props Row across the bottom */}
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
            <div className="mt-10 sm:mt-14 pt-8 border-t border-stone-200 text-left">
              <div
                id="hero-value-props"
                className={`grid grid-cols-1 ${
                  rawProps.length === 2
                    ? 'sm:grid-cols-2'
                    : rawProps.length >= 4
                    ? 'sm:grid-cols-2 lg:grid-cols-4'
                    : 'sm:grid-cols-3'
                } gap-4 sm:gap-6`}
              >
                {rawProps.map((prop, idx) => (
                  <div
                    key={idx}
                    className="card-hover bg-white p-5 rounded-xl border border-stone-200 hover:border-[#0F5132]/50"
                  >
                    <div className="text-xs text-stone-500 font-medium leading-snug">
                      {lang === 'en' ? t(`hero.vp${idx + 1}_desc`, prop.subtitle) : prop.subtitle}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#0F5132] mt-1 tracking-tight">
                      {lang === 'en' ? t(`hero.vp${idx + 1}_title`, prop.title) : prop.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};
