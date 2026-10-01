import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  Factory,
  ShoppingCart,
  Calculator,
  TrendingUp,
  Wallet,
  Receipt,
  FileCheck2,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe,
  X,
  ShoppingBag,
} from 'lucide-react';

export type NavPage =
  | 'dashboard'
  | 'products'
  | 'productImport'
  | 'ingredients'
  | 'ingredientImport'
  | 'production'
  | 'purchases'
  | 'hpp'
  | 'sales'
  | 'finance'
  | 'tax'
  | 'reports'
  | 'alerts'
  | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  ingredientIssuesCount?: number;
  alertsCount?: number;
  logoUrl?: string;
  onNavigatePublic?: () => void;
  onOpenWebAdmin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onLogout,
  ingredientIssuesCount = 0,
  alertsCount = 0,
  logoUrl = '/logo-asasora.png',
  onNavigatePublic,
  onOpenWebAdmin,
}) => {
  const navItems: { id: NavPage; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Master Produk', icon: <UtensilsCrossed className="w-4 h-4" /> },
    {
      id: 'ingredients',
      label: 'Bahan Baku Halal',
      icon: <Layers className="w-4 h-4" />,
      badge: ingredientIssuesCount > 0 ? ingredientIssuesCount : undefined,
    },
    { id: 'production', label: 'Batch Produksi', icon: <Factory className="w-4 h-4" /> },
    { id: 'purchases', label: 'Pembelian Bahan', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'hpp', label: 'Kalkulasi HPP', icon: <Calculator className="w-4 h-4" /> },
    { id: 'sales', label: 'Penjualan Katering', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'finance', label: 'Buku Kas & Biaya', icon: <Wallet className="w-4 h-4" /> },
    { id: 'tax', label: 'Laporan Pajak NPWP', icon: <Receipt className="w-4 h-4" /> },
    { id: 'reports', label: 'Audit Halal SJPH', icon: <FileCheck2 className="w-4 h-4" /> },
    {
      id: 'alerts',
      label: 'Pusat Notifikasi',
      icon: <Bell className="w-4 h-4" />,
      badge: alertsCount > 0 ? alertsCount : undefined,
    },
    { id: 'settings', label: 'Pengaturan Sistem', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleGoToPublic = () => {
    if (onNavigatePublic) {
      onNavigatePublic();
    } else {
      window.location.href = '/';
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#032e1a] text-emerald-100 select-none border-r border-emerald-900/40">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-emerald-900/60 bg-[#022213]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center shadow-md">
            <img src={logoUrl || '/logo-asasora.png'} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h2 className="text-sm font-black text-white tracking-wide truncate">AdminSora ERP</h2>
              <p className="text-[10px] text-emerald-400 font-semibold truncate">PT. Asasora Bio Healthora</p>
            </div>
          )}
        </div>
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                isActive
                  ? 'bg-linear-to-r from-[#087443] to-[#0b9657] text-white shadow-md shadow-emerald-950/40'
                  : 'text-emerald-200/80 hover:bg-emerald-900/50 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Section */}
      <div className="p-3 border-t border-emerald-900/60 bg-[#022213] space-y-1.5">
        {/* Link to web order manager */}
        {onOpenWebAdmin && (
          <button
            onClick={onOpenWebAdmin}
            title="Buka Panel Kelola Web (Pesanan Masuk & Konten)"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            {!isCollapsed && <span className="truncate text-left">Kelola Pesanan Web</span>}
          </button>
        )}

        {/* Link back to public web */}
        <button
          onClick={handleGoToPublic}
          title="Ke Website Publik asasorafood.com"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <Globe className="w-4 h-4 text-[#F3C623]" />
          {!isCollapsed && <span className="truncate text-left">Lihat Web Utama</span>}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Keluar / Logout"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 transition cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="truncate text-left">Keluar (Logout)</span>}
        </button>

        {/* Collapse toggle button for Desktop */}
        <div className="hidden lg:block pt-1">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-900/60 transition cursor-pointer"
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ${
          isCollapsed ? 'w-[76px]' : 'w-[264px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
