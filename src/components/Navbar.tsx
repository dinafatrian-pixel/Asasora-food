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
  onOpenChatbot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  company,
  cartCount,
  onOpenAdminModal,
  onOpenOrderModal,
  onScrollToSection,
  onOpenChatbot,
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
    <header role="banner" className="bg-white sticky top-0 z-50 border-b border-stone-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Left: Brand Identity & Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group select-none py-1 shrink-0 active:scale-[0.98] transition-transform duration-150"
            onClick={() => handleNavClick('home')}
          >
            <div className="relative shrink-0">
              <img
                src={company.logoUrl || '/logo-asasora.png'}
                alt={`Logo ${company.name || 'PT. ASASORA BIO HEALTHORA'}`}
                width={44}
                height={44}
                fetchPriority="high"
                decoding="async"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-xl border border-stone-200 bg-white p-0.5 transition-all duration-200 group-hover:border-[#0F5132]/50 group-hover:scale-[1.04]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo-asasora.svg';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#0F5132] block leading-tight transition-colors group-hover:text-[#0b3d26]">
                {brandName}
              </span>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.14em] leading-none mt-1">
                Bio Healthora
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-0.5 2xl:space-x-1 shrink-0">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="nav-link-micro px-2.5 2xl:px-3 py-1.5 rounded-lg text-xs 2xl:text-[13px] font-semibold text-stone-600 hover:text-[#0F5132] hover:bg-stone-100/80 cursor-pointer whitespace-nowrap"
              >
                {t(link.labelKey, link.defaultLabel)}
              </button>
            ))}
          </nav>

          {/* Right: Desktop Action Suite */}
          <div className="hidden xl:flex items-center space-x-2.5 shrink-0">
            {/* Language Switcher (ID | EN) */}
            <div className="flex items-center bg-stone-100 border border-stone-200 rounded-lg p-0.5 text-xs font-semibold text-stone-600">
              <button
                type="button"
                onClick={() => setLang('id')}
                className={`btn-micro px-2 py-1 rounded-md cursor-pointer text-[11px] ${
                  lang === 'id'
                    ? 'bg-[#0F5132] text-white font-bold'
                    : 'hover:text-stone-900 text-stone-600'
                }`}
                title="Bahasa Indonesia"
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`btn-micro px-2 py-1 rounded-md cursor-pointer text-[11px] ${
                  lang === 'en'
                    ? 'bg-[#0F5132] text-white font-bold'
                    : 'hover:text-stone-900 text-stone-600'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Single Official Order Online Button */}
            <button
              onClick={onOpenOrderModal}
              id="btn-nav-order-online"
              className="group/order btn-micro bg-[#0F5132] hover:bg-[#0b3d26] text-white font-bold px-3.5 py-2 2xl:px-4 2xl:py-2 rounded-lg text-xs 2xl:text-sm flex items-center gap-1.5 cursor-pointer border border-[#0b3d26] whitespace-nowrap"
              title={t('order.modal_title', 'Buka Formulir Order Online & Cek Ongkir')}
            >
              <ShoppingBag
                className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-[#F3C623] transition-transform duration-150 group-hover/order:-translate-y-0.5 group-hover/order:rotate-[-6deg]"
                strokeWidth={1.75}
              />
              <span>{t('nav.order_online', 'Order Online')}</span>
              {cartCount > 0 && (
                <span className="bg-[#F3C623] text-stone-900 text-[10px] 2xl:text-[11px] font-black px-1.5 py-0.5 rounded leading-none tabular-nums transition-transform duration-150 group-hover/order:scale-110">
                  {cartCount}
                </span>
              )}
            </button>

            {/* WhatsApp Chat MinSora */}
            {onOpenChatbot ? (
              <button
                type="button"
                onClick={onOpenChatbot}
                className="group/chat btn-micro bg-[#F3C623] hover:bg-[#D9AE14] text-stone-900 font-bold pl-1.5 pr-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-xs cursor-pointer border border-[#D9AE14] whitespace-nowrap"
              >
                <span className="transition-transform duration-150 group-hover/chat:scale-105">
                  <MinsoraAvatar size="xs" showWaBadge={false} />
                </span>
                <span className="text-xs font-bold">{t('nav.whatsapp_chat', 'Chat MinSora')}</span>
              </button>
            ) : (
              <a
                href={`https://wa.me/${company.whatsapp}?text=Halo%20MinSora%20PT.%20ASASORA%20BIO%20HEALTHORA,%20saya%20ingin%20berkonsultasi`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/chat btn-micro bg-[#F3C623] hover:bg-[#D9AE14] text-stone-900 font-bold pl-1.5 pr-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-xs cursor-pointer border border-[#D9AE14] whitespace-nowrap"
              >
                <span className="transition-transform duration-150 group-hover/chat:scale-105">
                  <MinsoraAvatar size="xs" showWaBadge={false} />
                </span>
                <span className="text-xs font-bold">{t('nav.whatsapp_chat', 'Chat MinSora')}</span>
              </a>
            )}

            {/* Admin Login Modal Trigger */}
            <button
              onClick={onOpenAdminModal}
              className="group/lock btn-micro text-stone-400 hover:text-[#0F5132] hover:bg-stone-100 p-2 rounded-lg border border-transparent hover:border-stone-200 cursor-pointer"
              title={t('general.admin_panel', 'Panel Admin')}
              aria-label={t('general.admin_panel', 'Panel Admin')}
            >
              <Lock className="w-4 h-4 transition-transform duration-150 group-hover/lock:rotate-[-8deg]" strokeWidth={1.75} />
            </button>
          </div>

          {/* Mobile & Tablet Combined Right Controls */}
          <div className="flex xl:hidden items-center space-x-2 shrink-0">
            {/* Single Order Button on Mobile/Tablet */}
            <button
              onClick={onOpenOrderModal}
              id="btn-nav-order-online-mobile"
              className="group/orderm btn-micro bg-[#0F5132] hover:bg-[#0b3d26] text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
              title={t('general.order_now', 'Order Online')}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#F3C623] transition-transform duration-150 group-hover/orderm:-translate-y-0.5" strokeWidth={1.75} />
              <span className="text-xs font-bold">{t('general.order', 'Order')}</span>
              {cartCount > 0 && (
                <span className="bg-[#F3C623] text-stone-900 text-[10px] font-black px-1.5 py-0.5 rounded tabular-nums transition-transform duration-150 group-hover/orderm:scale-110">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Language Switch Button */}
            <button
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              className="group/lang btn-micro bg-stone-100 hover:bg-stone-200 border border-stone-200 px-2.5 py-2 rounded-lg text-xs font-bold text-stone-700 flex items-center gap-1 cursor-pointer"
              title={t('general.switch_lang', 'Ganti Bahasa')}
            >
              <Globe className="w-3.5 h-3.5 text-[#0F5132] transition-transform duration-200 group-hover/lang:rotate-12" strokeWidth={1.75} />
              <span>{lang === 'id' ? 'ID' : 'EN'}</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-micro text-stone-700 hover:text-[#0F5132] p-2 rounded-lg focus:outline-none bg-stone-50 border border-stone-200 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Menu Dropdown */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-b border-stone-200 px-5 pt-3 pb-5 space-y-1 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="w-full text-left py-2.5 px-3.5 rounded-lg text-sm font-semibold text-stone-700 hover:text-[#0F5132] hover:bg-stone-50 hover:translate-x-1 active:scale-[0.99] transition-all duration-150 cursor-pointer"
            >
              {t(link.labelKey, link.defaultLabel)}
            </button>
          ))}

          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2.5">
            {onOpenChatbot ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenChatbot();
                }}
                className="btn-micro w-full bg-[#F3C623] hover:bg-[#D9AE14] text-stone-900 font-bold py-3 px-4 rounded-lg border border-[#D9AE14] flex items-center justify-center space-x-2 text-sm text-center cursor-pointer"
              >
                <MinsoraAvatar size="xs" showWaBadge={false} />
                <span>{t('nav.whatsapp_chat', 'Chat WhatsApp MinSora')}</span>
              </button>
            ) : (
              <a
                href={`https://wa.me/${company.whatsapp}?text=Halo%20MinSora%20PT.%20ASASORA%20BIO%20HEALTHORA,%20saya%20ingin%20berkonsultasi`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-micro w-full bg-[#F3C623] hover:bg-[#D9AE14] text-stone-900 font-bold py-3 px-4 rounded-lg border border-[#D9AE14] flex items-center justify-center space-x-2 text-sm text-center"
              >
                <MinsoraAvatar size="xs" showWaBadge={false} />
                <span>{t('nav.whatsapp_chat', 'Chat WhatsApp MinSora')}</span>
              </a>
            )}

            <button
              onClick={() => {
                setMobileOpen(false);
                onOpenAdminModal();
              }}
              className="btn-micro w-full text-center py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{t('general.admin_panel', 'Panel Admin')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
