import React, { useState } from 'react';
import { Menu, X, Lock, ShoppingBag, Globe } from 'lucide-react';
import { CompanyInfo } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MinsoraAvatar } from './MinsoraAvatar';

interface NavbarProps {
  company: CompanyInfo;
  cartCount: number;
  onOpenAdminModal: () => void;
  onOpenOrderModal: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  company,
  cartCount,
  onOpenAdminModal,
  onOpenOrderModal,
  onScrollToSection,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const navLinks: { labelKey: string; defaultLabel: string; href: string }[] = [
    { labelKey: 'nav.home', defaultLabel: 'Beranda', href: 'home' },
    { labelKey: 'nav.catalog', defaultLabel: 'Katalog', href: 'katalog' },
    { labelKey: 'nav.clients', defaultLabel: 'Klien', href: 'clients' },
    { labelKey: 'nav.reviews', defaultLabel: 'Ulasan', href: 'reviews' },
    { labelKey: 'nav.gallery', defaultLabel: 'Galeri', href: 'galery' },
    { labelKey: 'nav.articles', defaultLabel: 'Artikel & Berita', href: 'articles' },
    { labelKey: 'nav.legality', defaultLabel: 'Legalitas', href: 'legalitas' },
    { labelKey: 'nav.contact', defaultLabel: 'Kontak', href: 'contact' },
  ];

  const handleNavClick = (sectionId: string) => {
    onScrollToSection(sectionId);
    setMobileOpen(false);
  };

  const brandName = company.heroTitlePrefix
    ? company.heroTitlePrefix.replace('PT. ', '').trim() || 'ASASORA'
    : 'ASASORA';

  return (
    <header role="banner" className="bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-2xs border-b border-emerald-900/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Left: Brand Identity & Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group select-none py-1"
            onClick={() => handleNavClick('home')}
          >
            <div className="relative shrink-0">
              <img
                src={company.logoUrl || '/logo-asasora.png'}
                alt={`Logo ${company.name || 'PT. ASASORA BIO HEALTHORA'}`}
                width={48}
                height={48}
                fetchPriority="high"
                decoding="async"
                className="h-11 w-11 sm:h-12 sm:w-12 object-contain rounded-2xl shadow-2xs border border-emerald-100 bg-white p-0.5 group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo-asasora.svg';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#2E6F40] block leading-tight group-hover:text-emerald-800 transition-colors">
                {brandName}
              </span>
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest leading-none mt-0.5">
                Bio Healthora
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation Links (Cleanly spaced for xl+ screens, no overlap) */}
          <nav className="hidden xl:flex items-center space-x-0.5 2xl:space-x-1 shrink-0">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-2 2xl:px-2.5 py-1.5 rounded-xl text-xs 2xl:text-sm font-bold text-gray-700 hover:text-[#2E6F40] hover:bg-emerald-50/80 transition-all duration-150 cursor-pointer whitespace-nowrap"
              >
                {t(link.labelKey, link.defaultLabel)}
              </button>
            ))}
          </nav>

          {/* Right: Desktop Action Suite */}
          <div className="hidden xl:flex items-center space-x-2.5 shrink-0">
            {/* Language Switcher Pill (ID | EN) */}
            <div className="flex items-center bg-gray-100/90 border border-gray-200/80 rounded-full p-0.5 text-xs font-bold text-gray-600 shadow-2xs">
              <button
                type="button"
                onClick={() => setLang('id')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-0.5 text-[11px] ${
                  lang === 'id'
                    ? 'bg-[#2E6F40] text-white shadow-xs font-black'
                    : 'hover:text-gray-900 text-gray-600'
                }`}
                title="Bahasa Indonesia"
              >
                <span>ID</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-0.5 text-[11px] ${
                  lang === 'en'
                    ? 'bg-[#2E6F40] text-white shadow-xs font-black'
                    : 'hover:text-gray-900 text-gray-600'
                }`}
                title="English"
              >
                <span>EN</span>
              </button>
            </div>

            {/* Single Official Order Online Button */}
            <button
              onClick={onOpenOrderModal}
              id="btn-nav-order-online"
              className="bg-[#2E6F40] hover:bg-emerald-800 text-white font-extrabold px-3 py-2 2xl:px-4 2xl:py-2.5 rounded-xl text-xs 2xl:text-sm flex items-center gap-1.5 shadow-sm transition-all duration-150 cursor-pointer active:scale-95 border border-emerald-600 whitespace-nowrap"
              title={t('order.modal_title', 'Buka Formulir Order Online & Cek Ongkir')}
            >
              <ShoppingBag className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-[#F3C623]" />
              <span>{t('nav.order_online', 'Order Online')}</span>
              {cartCount > 0 && (
                <span className="bg-[#F3C623] text-gray-900 text-[10px] 2xl:text-[11px] font-black px-1.5 py-0.5 rounded-full leading-none animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* WhatsApp Chat MinSora */}
            <a
              href={`https://wa.me/${company.whatsapp}?text=Halo%20MinSora%20PT.%20ASASORA%20BIO%20HEALTHORA,%20saya%20ingin%20berkonsultasi`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#F3C623] hover:bg-[#D1A310] text-gray-900 font-extrabold pl-1.5 pr-3 py-1.5 rounded-full shadow-2xs transition flex items-center space-x-1.5 text-xs cursor-pointer active:scale-95 border border-[#e5b719] whitespace-nowrap"
            >
              <MinsoraAvatar size="xs" showWaBadge={false} />
              <span className="text-xs font-bold">{t('nav.whatsapp_chat', 'Chat MinSora')}</span>
            </a>

            {/* Admin Login Modal Trigger */}
            <button
              onClick={onOpenAdminModal}
              className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-xl transition-colors cursor-pointer"
              title={t('general.admin_panel', 'Panel Admin')}
              aria-label={t('general.admin_panel', 'Panel Admin')}
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile & Tablet Combined Right Controls */}
          <div className="flex xl:hidden items-center space-x-2 shrink-0">
            {/* Single Order Button on Mobile/Tablet */}
            <button
              onClick={onOpenOrderModal}
              id="btn-nav-order-online-mobile"
              className="bg-[#2E6F40] text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs active:scale-95"
              title={t('general.order_now', 'Order Online')}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#F3C623]" />
              <span className="text-xs font-extrabold">{t('general.order', 'Order')}</span>
              {cartCount > 0 && (
                <span className="bg-[#F3C623] text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Language Switch Button */}
            <button
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              className="bg-gray-100 hover:bg-gray-200 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1 transition"
              title={t('general.switch_lang', 'Ganti Bahasa')}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'id' ? 'ID' : 'EN'}</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-700 hover:text-[#2E6F40] p-2 rounded-xl focus:outline-none bg-gray-50 border border-gray-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Menu Dropdown */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-b border-gray-100 px-5 pt-3 pb-5 space-y-1 shadow-lg animate-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-[#2E6F40] hover:bg-emerald-50/70 transition"
            >
              {t(link.labelKey, link.defaultLabel)}
            </button>
          ))}

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
            <a
              href={`https://wa.me/${company.whatsapp}?text=Halo%20MinSora%20PT.%20ASASORA%20BIO%20HEALTHORA,%20saya%20ingin%20berkonsultasi`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#F3C623] hover:bg-[#D1A310] text-gray-900 font-extrabold py-3 px-4 rounded-xl shadow-2xs transition flex items-center justify-center space-x-2 text-sm text-center"
            >
              <MinsoraAvatar size="xs" showWaBadge={false} />
              <span>{t('nav.whatsapp_chat', 'Chat WhatsApp MinSora')}</span>
            </a>

            <button
              onClick={() => {
                setMobileOpen(false);
                onOpenAdminModal();
              }}
              className="w-full text-center py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('general.admin_panel', 'Panel Admin')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
