import React, { useState, useEffect } from 'react';
import {
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Zap,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Save,
  AlertCircle,
  ShoppingBag,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { CompanyInfo, VisitorAnalytics } from '../../types';
import { initGoogleAnalytics, trackGAEvent, defaultAnalyticsData, fetchAnalyticsData } from '../../utils/analytics';

interface AnalyticsTabProps {
  company: CompanyInfo;
  onUpdateCompany: (company: CompanyInfo) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ company, onUpdateCompany }) => {
  const [gaId, setGaId] = useState<string>(company.googleAnalyticsId || '');
  const [gaEnabled, setGaEnabled] = useState<boolean>(company.googleAnalyticsEnabled !== false);
  const [analyticsData, setAnalyticsData] = useState<VisitorAnalytics>(defaultAnalyticsData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [testSent, setTestSent] = useState<boolean>(false);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAnalyticsData();
      if (data) {
        setAnalyticsData(data);
      }
    } catch (e) {
      console.warn('Failed to load analytics', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();

    const handleUpdate = (e: any) => {
      if (e && e.detail) {
        setAnalyticsData(e.detail);
      }
    };
    window.addEventListener('asasora_analytics_update', handleUpdate);

    const interval = setInterval(loadAnalytics, 15000);
    return () => {
      window.removeEventListener('asasora_analytics_update', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleSaveGaConfig = () => {
    const cleanId = gaId.trim().toUpperCase();
    const updatedCompany: CompanyInfo = {
      ...company,
      googleAnalyticsId: cleanId,
      googleAnalyticsEnabled: gaEnabled,
    };
    onUpdateCompany(updatedCompany);

    if (cleanId && gaEnabled) {
      initGoogleAnalytics(cleanId);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSendTestEvent = () => {
    trackGAEvent('admin_test_ping', {
      event_category: 'Analytics Test',
      event_label: 'Asasora Admin Test',
      value: 1,
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const maxVisits = Math.max(...(analyticsData.dailyHistory?.map((d) => d.visits) || [100]), 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-[#2E6F40] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>Akselerasi & Analisa Trafik Pengunjung</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Google Analytics 4 & Live Traffic Monitor</h2>
          <p className="text-xs sm:text-sm text-green-100 mt-1 max-w-2xl">
            Pantau statistik kunjungan calon pembeli, konversi pemesanan, dan sambungkan ID Google Analytics (GA4) dengan script yang telah terakselerasi berkecepatan tinggi.
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          disabled={isLoading}
          className="self-start md:self-auto bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-white/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* GA4 Setup Form */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-100 rounded-xl text-yellow-800">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                Konfigurasi Google Analytics 4 (GA4)
              </h3>
              <p className="text-xs text-gray-500">
                Masukkan Measurement ID akun Google Analytics Anda (Format: <code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">G-XXXXXXXXXX</code>)
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            Akselerasi DNS & Preconnect Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Google Analytics Measurement ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={gaId}
                onChange={(e) => setGaId(e.target.value)}
                placeholder="Contoh: G-3K8XXXXXXX"
                className="w-full bg-gray-50 border border-gray-300 focus:border-emerald-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-900 outline-none transition"
              />
              {gaId && gaId.startsWith('G-') && (
                <span className="absolute right-3 top-2.5 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500">
              Dapat diperoleh dari Google Analytics &gt; Admin &gt; Data Streams &gt; Web Stream Details.
            </p>
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={gaEnabled}
                onChange={(e) => setGaEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Aktifkan Tracking Google Analytics</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveGaConfig}
                className="flex-1 bg-[#2E6F40] hover:bg-emerald-800 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Simpan ID GA4</span>
              </button>

              {gaId && (
                <button
                  type="button"
                  onClick={handleSendTestEvent}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  title="Kirim Tes Event Ping ke GA4"
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Test Ping</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pengaturan Google Analytics berhasil disimpan dan diaktifkan secara instan!</span>
          </div>
        )}

        {testSent && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-bold flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Sinyal test event berhasil dikirim ke Google Analytics Realtime Dashboard!</span>
          </div>
        )}
      </div>

      {/* Key Real-Time Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Active Online */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Pengunjung Online
            </span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">
            {analyticsData.activeVisitors || 1}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            Aktif Sekarang (Realtime)
          </p>
        </div>

        {/* Today's Visits */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Kunjungan Hari Ini
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#2E6F40] font-mono">
            {analyticsData.todayVisits.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Total sesi browsing hari ini
          </p>
        </div>

        {/* Total Pageviews */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Pageviews
            </span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">
            {analyticsData.pageviews.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Dari {analyticsData.totalVisits.toLocaleString('id-ID')} total kunjungan
          </p>
        </div>

        {/* Total Conversions */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Interaksi Pemesanan
            </span>
            <ShoppingBag className="w-4 h-4 text-[#F3C623]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-yellow-700 font-mono">
            {(analyticsData.ordersCount + analyticsData.waInquiriesCount).toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {analyticsData.ordersCount} Order • {analyticsData.waInquiriesCount} Chat WA
          </p>
        </div>
      </div>

      {/* Traffic Trend Chart (7 Days) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm sm:text-base text-gray-900">
              Tren Kunjungan Harian (7 Hari Terakhir)
            </h3>
          </div>
          <span className="text-xs text-gray-500 font-semibold">Trafik Web &amp; Katalog</span>
        </div>

        <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-gray-100">
          {analyticsData.dailyHistory?.map((day, idx) => {
            const heightPercent = Math.max(15, Math.round((day.visits / maxVisits) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-emerald-50 px-1.5 py-0.5 rounded">
                  {day.visits} visit
                </div>
                <div
                  className="w-full max-w-[48px] bg-gradient-to-t from-emerald-700 to-emerald-400 rounded-t-lg transition-all duration-300 group-hover:from-emerald-800 group-hover:to-emerald-300 relative shadow-2xs"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-yellow-300 rounded-t-lg opacity-80" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-600 truncate max-w-full">
                  {day.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Device Breakdown & Top Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Device Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>Distribusi Perangkat Pengunjung</span>
            </h4>
            <span className="text-[11px] text-gray-500 font-mono">User Agents</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Mobile */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> Smartphone / Mobile
                </span>
                <span className="font-mono text-emerald-700">
                  {Math.round(analyticsData.deviceBreakdown.mobile)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#2E6F40] h-full rounded-full transition-all duration-500"
                  style={{ width: `${analyticsData.deviceBreakdown.mobile}%` }}
                />
              </div>
            </div>

            {/* Desktop */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Monitor className="w-3.5 h-3.5 text-blue-600" /> Komputer / Laptop
                </span>
                <span className="font-mono text-blue-700">
                  {Math.round(analyticsData.deviceBreakdown.desktop)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${analyticsData.deviceBreakdown.desktop}%` }}
                />
              </div>
            </div>

            {/* Tablet */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Tablet className="w-3.5 h-3.5 text-yellow-600" /> Tablet / iPad
                </span>
                <span className="font-mono text-yellow-700">
                  {Math.round(analyticsData.deviceBreakdown.tablet)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#F3C623] h-full rounded-full transition-all duration-500"
                  style={{ width: `${analyticsData.deviceBreakdown.tablet}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>Halaman &amp; Bagian Terpopuler</span>
            </h4>
            <span className="text-[11px] text-gray-500">Hits</span>
          </div>

          <div className="space-y-2 pt-1">
            {analyticsData.topPages?.slice(0, 5).map((page, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-emerald-50/50 rounded-xl border border-gray-100 text-xs transition"
              >
                <div className="truncate pr-2">
                  <div className="font-bold text-gray-800 truncate">{page.title}</div>
                  <div className="text-[10px] font-mono text-gray-500">{page.path}</div>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-gray-200 shrink-0">
                  {page.views.toLocaleString('id-ID')} views
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
