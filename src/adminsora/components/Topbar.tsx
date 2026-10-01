import React from 'react';
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { SyncStatus } from '../firebase';
import { NavPage } from './Sidebar';
import { Product, Ingredient, ProductionBatch } from '../types';

interface TopbarProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  userName: string;
  onNavigateAlerts: () => void;
  alertCount: number;
  onNavigateSettings: () => void;
  onLogout: () => void;
  logoUrl?: string;
  products?: Product[];
  ingredients?: Ingredient[];
  productions?: ProductionBatch[];
  onNavigate: (page: NavPage) => void;
  syncStatus: SyncStatus;
  onGoToPublic?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  userName,
  onNavigateAlerts,
  alertCount,
  onNavigateSettings,
  onLogout,
  onNavigate,
  syncStatus,
  onGoToPublic,
}) => {
  const getSyncBadge = () => {
    switch (syncStatus) {
      case 'connected':
        return (
          <span
            title="Database Cloud Firestore: Terkoneksi Realtime"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">Cloud Realtime Sync</span>
          </span>
        );
      case 'syncing':
        return (
          <span
            title="Sedang Menyinkronkan Data..."
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
          >
            <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
            <span className="hidden sm:inline">Sinkronisasi...</span>
          </span>
        );
      case 'offline':
      case 'error':
      default:
        return (
          <span
            title="Mode Offline LocalStorage Aktif"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
          >
            <WifiOff className="w-3 h-3 text-amber-600" />
            <span className="hidden sm:inline">Mode Lokal Aktif</span>
          </span>
        );
    }
  };

  const handleReturnToPublic = () => {
    if (onGoToPublic) {
      onGoToPublic();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left items: Menu button & Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search Input */}
        <div className="relative w-full max-w-md hidden sm:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari produk, bahan baku halal, atau batch..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sync Status Badge */}
        {getSyncBadge()}

        {/* Direct Link to Public Web */}
        <button
          onClick={handleReturnToPublic}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition border border-emerald-200/60 cursor-pointer shadow-2xs"
          title="Buka Website Pelanggan asasorafood.com"
        >
          <Globe className="w-3.5 h-3.5 text-[#087443]" />
          <span>Lihat Web Utama</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onNavigateAlerts}
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          title="Pusat Peringatan & Notifikasi"
        >
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
              {alertCount}
            </span>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onNavigateSettings}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          title="Pengaturan Sistem & Profil Perusahaan"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Badge Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#087443] to-[#0ba861] text-white font-black text-xs flex items-center justify-center shadow-xs">
            {userName ? userName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{userName}</p>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600 inline" /> Penyelia Halal
            </span>
          </div>
        </div>

        {/* Logout Quick Action */}
        <button
          onClick={onLogout}
          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
          title="Keluar / Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
