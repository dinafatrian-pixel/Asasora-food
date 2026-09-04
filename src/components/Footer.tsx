import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Heart,
  ArrowUp,
  Activity,
  TrendingUp,
  Eye,
  Users,
  Globe,
  Zap,
  BarChart3,
  Sparkles,
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
    <footer role="contentinfo" className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={company.logoUrl || '/logo-asasora.png'}
                alt={`Logo ${company.name || 'PT. ASASORA BIO HEALTHORA'}`}
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                className="h-10 w-10 object-contain rounded-xl bg-white p-0.5"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo-asasora.svg';
                }}
              />
              <div>
                <span className="text-base font-black text-white block leading-none">
                  {company.heroTitlePrefix || 'PT. ASASORA'}
                </span>
                <span className="text-[10px] font-bold text-[#F3C623] uppercase tracking-wider">
                  {company.heroTitleHighlight || 'Bio Healthora'}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {lang === 'en'
                ? t('hero.description', 'High-quality products produced from safe, hygienic, and authentic halal ingredients.')
                : company.description}
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{lang === 'en' ? t('hero.halal_badge', 'Official BPJPH Halal Certified') : company.halalBadgeText}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#F3C623] uppercase tracking-wider">
              {t('footer.nav_title', 'Navigasi Cepat')}
            </p>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button
                  onClick={() => onScrollToSection('home')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('footer.nav_home', 'Beranda (Home)')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('katalog')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('footer.nav_catalog', 'Katalog Produk & Pemesanan')}
                </button>
              </li>
              <li>
                <button
                  onClick={handleOrderClick}
                  className="hover:text-white transition cursor-pointer text-emerald-400 font-bold"
                >
                  {t('footer.nav_order', 'Formulir Pesanan & Ongkir (Order Online)')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('clients')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('footer.nav_clients', 'Klien Kami (Our Client)')}
                </button>
              </li>
            </ul>
          </div>

          {/* Dokumen & Informasi */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#F3C623] uppercase tracking-wider">
              {t('footer.legality_title', 'Legalitas & Dokumen')}
            </p>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button
                  onClick={() => onScrollToSection('legalitas')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('footer.halal_cert', 'Sertifikat Halal BPJPH')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('legalitas')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('footer.nib_cert', 'NIB Berbasis Risiko OSS')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('legalitas')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('footer.hygiene_cert', 'Laik Higiene Sanitasi Jasaboga')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('galery')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('footer.gallery_link', 'Galeri Dokumentasi Higiene')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('reviews')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('footer.reviews_link', 'Ulasan & Testimoni')}
                </button>
              </li>
            </ul>
          </div>

          {/* Rekening & Kontak */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#F3C623] uppercase tracking-wider">
              {t('footer.payment_info', 'Informasi Pembayaran')}
            </p>
            <div className="bg-gray-800/80 p-3.5 rounded-xl border border-gray-700 space-y-1.5 text-xs">
              <div className="font-bold text-gray-200">
                {t('footer.bank_account', 'Rekening Bank BCA Resmi:')}
              </div>
              <div className="text-emerald-400 font-mono font-bold text-sm tracking-wider">
                {company.bcaAccount.number}
              </div>
              <div className="text-gray-400 text-[11px]">{t('footer.bank_holder', 'A.N')} {company.bcaAccount.holder}</div>
            </div>

            <div className="pt-2 text-xs text-gray-400 space-y-1">
              <div>
                WhatsApp: <span className="text-white font-mono">{company.phone}</span>
              </div>
              {company.operationalHours && (
                <div className="text-[11px] text-gray-400">
                  <span className="text-[#F3C623] font-semibold">{lang === 'en' ? 'Hours: ' : 'Buka: '}</span>
                  <span>{company.operationalHours}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visitor Traffic & Google Analytics Acceleration Bar */}
        <div className="mb-8 p-4 sm:p-5 bg-gray-800/90 border border-gray-700/80 rounded-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title & GA4 Status */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 rounded-xl shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    {lang === 'en' ? 'Live Visitor Traffic & GA4 Analytics' : 'Statistik Trafik Pengunjung & Google Analytics'}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-900/60 border border-emerald-700/60 px-2 py-0.5 rounded-full">
                    <Zap className="w-3 h-3 text-[#F3C623]" />
                    {lang === 'en' ? 'GA4 Accelerated' : 'GA4 Terakselerasi'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {lang === 'en'
                    ? 'Real-time visitor data and speed-accelerated Google Analytics 4 tracking.'
                    : 'Pemantauan trafik pengunjung web dan integrasi analitik terakselerasi berkecepatan tinggi.'}
                </p>
              </div>
            </div>

            {/* Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Online Now */}
              <div className="bg-gray-900/90 px-3 py-2 rounded-xl border border-gray-700/70 flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div>
                  <div className="text-sm font-black text-emerald-400 font-mono leading-none">
                    {analytics.activeVisitors || 1}
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold mt-0.5 whitespace-nowrap">
                    {lang === 'en' ? 'Online Now' : 'Pengunjung Aktif'}
                  </div>
                </div>
              </div>

              {/* Today Visits */}
              <div className="bg-gray-900/90 px-3 py-2 rounded-xl border border-gray-700/70 flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-[#F3C623] shrink-0" />
                <div>
                  <div className="text-sm font-black text-white font-mono leading-none">
                    {analytics.todayVisits.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID')}
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold mt-0.5 whitespace-nowrap">
                    {lang === 'en' ? 'Today Visits' : 'Hari Ini'}
                  </div>
                </div>
              </div>

              {/* Total Visits */}
              <div className="bg-gray-900/90 px-3 py-2 rounded-xl border border-gray-700/70 flex items-center gap-2.5">
                <Users className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="text-sm font-black text-white font-mono leading-none">
                    {analytics.totalVisits.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID')}
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold mt-0.5 whitespace-nowrap">
                    {lang === 'en' ? 'Total Visits' : 'Total Kunjungan'}
                  </div>
                </div>
              </div>

              {/* Total Pageviews */}
              <div className="bg-gray-900/90 px-3 py-2 rounded-xl border border-gray-700/70 flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="text-sm font-black text-white font-mono leading-none">
                    {analytics.pageviews.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID')}
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold mt-0.5 whitespace-nowrap">
                    {lang === 'en' ? 'Page Views' : 'Tayangan Halaman'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <span>&copy; {new Date().getFullYear()} PT. ASASORA BIO HEALTHORA. {t('footer.rights_reserved', 'All rights reserved.')}</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1.5 text-gray-400 hover:text-white transition cursor-pointer bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs"
          >
            <span>{t('footer.back_to_top', 'Kembali ke Atas')}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

