import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowUp,
  TrendingUp,
  Eye,
  Users,
  BarChart3,
  MapPin,
  Navigation,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { CompanyInfo, VisitorAnalytics } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { fetchAnalyticsData, defaultAnalyticsData } from '../utils/analytics';

interface FooterProps {
  company: CompanyInfo;
  analytics?: VisitorAnalytics;
  onScrollToSection: (sectionId: string) => void;
  onOpenOrderModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  company,
  analytics: propAnalytics,
  onScrollToSection,
  onOpenOrderModal,
}) => {
  const { t, lang } = useLanguage();
  const [analytics, setAnalytics] = useState<VisitorAnalytics>(() => propAnalytics || defaultAnalyticsData);

  // Sync with prop updates from App.tsx
  useEffect(() => {
    if (propAnalytics) {
      setAnalytics(propAnalytics);
    }
  }, [propAnalytics]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e && e.detail) {
        setAnalytics(e.detail);
      }
    };
    window.addEventListener('asasora_analytics_update', handleUpdate);

    fetchAnalyticsData().then((data) => {
      if (data) setAnalytics(data);
    });

    const timer = setInterval(() => {
      fetchAnalyticsData().then((data) => {
        if (data) setAnalytics(data);
      });
    }, 15000);

    return () => {
      window.removeEventListener('asasora_analytics_update', handleUpdate);
      clearInterval(timer);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderClick = () => {
    if (onOpenOrderModal) {
      onOpenOrderModal();
    } else {
      onScrollToSection('pemesanan-baru');
    }
  };

  return (
    <footer role="contentinfo" className="bg-[#141915] text-stone-100 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Col & Alamat Google Maps Asasora */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={company.logoUrl || '/logo-asasora.png'}
                alt={`Logo ${company.name || 'PT. ASASORA BIO HEALTHORA'}`}
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                className="h-10 w-10 object-contain rounded-lg bg-white p-0.5 border border-stone-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo-asasora.svg';
                }}
              />
              <div>
                <span className="text-base font-extrabold text-white block leading-none tracking-tight">
                  PT. ASASORA
                </span>
                <span className="text-[10px] font-bold text-[#F3C623] uppercase tracking-[0.14em] mt-1 block">
                  BIO HEALTHORA
                </span>
              </div>
            </div>

            {/* Alamat Google Maps Asasora */}
            <div className="bg-[#1B221D] p-4 rounded-xl border border-stone-800 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-[#F3C623] font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.75} />
                <span>{lang === 'en' ? 'Kitchen & Office Location' : 'Alamat Google Maps Asasora'}</span>
              </div>

              <p className="text-stone-300 text-xs leading-relaxed">
                {company.address ||
                  'Jl. Irigasi sipon Tanah Tinggi Gg. Jambu 2 RT 004 RW 06 Kel. Buaran Indah Kec. Tangerang Kota Tangerang Banten 15119'}
              </p>

              <a
                href={company.googleMapsUrl || 'https://maps.app.goo.gl/oKYoeRJDKYtfqWqQ9'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-[#0F5132] hover:bg-[#196f46] text-white font-bold text-xs transition-colors border border-emerald-800 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{lang === 'en' ? 'Open in Google Maps' : 'Buka di Google Maps'}</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" strokeWidth={1.75} />
              </a>
            </div>

            {/* Halal Badge */}
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-[#1B221D] p-3 rounded-xl border border-stone-800">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" strokeWidth={1.75} />
              <span>
                {lang === 'en'
                  ? 'Official SH - BPJPH Halal Certified'
                  : 'Sertifikat Halal Resmi SH - BPJPH'}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#F3C623] uppercase tracking-[0.14em]">
              {t('footer.nav_title', 'Navigasi Cepat')}
            </p>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <button
                  onClick={() => onScrollToSection('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('footer.nav_home', 'Beranda (Home)')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('katalog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('footer.nav_catalog', 'Katalog Produk & Pemesanan')}
                </button>
              </li>
              <li>
                <button
                  onClick={handleOrderClick}
                  className="hover:text-white transition-colors cursor-pointer text-emerald-400 font-bold"
                >
                  {t('footer.nav_order', 'Formulir Pesanan & Ongkir (Order Online)')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('clients')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('footer.nav_clients', 'Klien Kami (Our Client)')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('articles')}
                  className="hover:text-white transition-colors cursor-pointer text-emerald-400 font-semibold"
                >
                  {t('nav.articles', 'Artikel & Berita Seputar Katering')}
                </button>
              </li>
            </ul>
          </div>

          {/* Dokumen & Informasi */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#F3C623] uppercase tracking-[0.14em]">
              {t('footer.legality_title', 'Legalitas & Dokumen')}
            </p>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <button
                  onClick={() => onScrollToSection('legalitas')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('footer.halal_cert', 'Sertifikat Halal BPJPH')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('legalitas')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('footer.nib_cert', 'NIB Berbasis Risiko OSS')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('legalitas')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('footer.hygiene_cert', 'Laik Higiene Sanitasi Jasaboga')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('galery')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('footer.gallery_link', 'Galeri Dokumentasi Higiene')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('reviews')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('footer.reviews_link', 'Ulasan & Testimoni')}
                </button>
              </li>
            </ul>
          </div>

          {/* Rekening & Kontak */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#F3C623] uppercase tracking-[0.14em]">
              {t('footer.payment_info', 'Informasi Pembayaran')}
            </p>
            <div className="bg-[#1B221D] p-4 rounded-xl border border-stone-800 space-y-1.5 text-xs">
              <div className="font-bold text-stone-200">
                {t('footer.bank_account', 'Rekening Bank BCA Resmi:')}
              </div>
              <div className="text-emerald-400 font-mono font-bold text-sm tracking-wider tabular-nums">
                {company.bcaAccount.number}
              </div>
              <div className="text-stone-400 text-[11px]">
                {t('footer.bank_holder', 'A.N')} {company.bcaAccount.holder}
              </div>
            </div>

            <div className="pt-2 text-xs text-stone-400 space-y-1.5">
              <div>
                WhatsApp: <span className="text-white font-mono tabular-nums">{company.phone}</span>
              </div>
              {company.operationalHours && (
                <div className="text-[11px] text-stone-400">
                  <span className="text-[#F3C623] font-semibold">{lang === 'en' ? 'Hours: ' : 'Buka: '}</span>
                  <span>{company.operationalHours}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visitor Traffic & Google Analytics Bar */}
        <div className="mb-8 p-5 bg-[#1B221D] border border-stone-800 rounded-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#141915] text-emerald-400 border border-stone-800 rounded-lg shrink-0">
                <BarChart3 className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  {lang === 'en' ? 'Live Visitor Traffic & GA4 Analytics' : 'Statistik Trafik Pengunjung & Google Analytics'}
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {lang === 'en'
                    ? 'Real-time visitor data and Google Analytics 4 tracking.'
                    : 'Pemantauan trafik pengunjung web dan integrasi analitik Google Analytics 4.'}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#141915] px-3.5 py-2.5 rounded-lg border border-stone-800 flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.75} />
                <div>
                  <div className="text-sm font-black text-emerald-400 font-mono leading-none tabular-nums">
                    {analytics.activeVisitors || 1}
                  </div>
                  <div className="text-[10px] text-stone-400 font-semibold mt-1 whitespace-nowrap">
                    {lang === 'en' ? 'Online Now' : 'Pengunjung Aktif'}
                  </div>
                </div>
              </div>

              <div className="bg-[#141915] px-3.5 py-2.5 rounded-lg border border-stone-800 flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-[#F3C623] shrink-0" strokeWidth={1.75} />
                <div>
                  <div className="text-sm font-black text-white font-mono leading-none tabular-nums">
                    {analytics.todayVisits.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID')}
                  </div>
                  <div className="text-[10px] text-stone-400 font-semibold mt-1 whitespace-nowrap">
                    {lang === 'en' ? 'Today Visits' : 'Hari Ini'}
                  </div>
                </div>
              </div>

              <div className="bg-[#141915] px-3.5 py-2.5 rounded-lg border border-stone-800 flex items-center gap-2.5">
                <Users className="w-4 h-4 text-sky-400 shrink-0" strokeWidth={1.75} />
                <div>
                  <div className="text-sm font-black text-white font-mono leading-none tabular-nums">
                    {analytics.totalVisits.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID')}
                  </div>
                  <div className="text-[10px] text-stone-400 font-semibold mt-1 whitespace-nowrap">
                    {lang === 'en' ? 'Total Visits' : 'Total Kunjungan'}
                  </div>
                </div>
              </div>

              <div className="bg-[#141915] px-3.5 py-2.5 rounded-lg border border-stone-800 flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-emerald-300 shrink-0" strokeWidth={1.75} />
                <div>
                  <div className="text-sm font-black text-white font-mono leading-none tabular-nums">
                    {analytics.pageviews.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID')}
                  </div>
                  <div className="text-[10px] text-stone-400 font-semibold mt-1 whitespace-nowrap">
                    {lang === 'en' ? 'Page Views' : 'Tayangan Halaman'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center space-x-1">
            <span>&copy; {new Date().getFullYear()} PT. ASASORA BIO HEALTHORA. {t('footer.rights_reserved', 'All rights reserved.')}</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer bg-[#1B221D] hover:bg-stone-800 border border-stone-700 px-3.5 py-2 rounded-lg text-xs font-semibold"
          >
            <span>{t('footer.back_to_top', 'Kembali ke Atas')}</span>
            <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </footer>
  );
};
