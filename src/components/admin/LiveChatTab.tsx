import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Volume2,
  VolumeX,
  Smartphone,
  ExternalLink,
  Clock,
  Search,
  CheckCheck,
  RefreshCw,
  Trash2,
  Sliders,
} from 'lucide-react';
import {
  playNotificationRingtone,
  vibratePhone,
  requestNotificationPermission,
  showSystemNotification,
  getNotificationSettings,
  saveNotificationSettings,
  NotificationSettings,
} from '../../utils/chatNotifier';
import { ChatLogItem } from '../AdminChatNotifier';

interface LiveChatTabProps {
  adminWhatsApp?: string;
}

export const LiveChatTab: React.FC<LiveChatTabProps> = ({
  adminWhatsApp = '6285271000900',
}) => {
  const [chats, setChats] = useState<ChatLogItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [permission, setPermission] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'denied';
  });

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat/logs');
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Failed to load chat logs', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTestRingtone = () => {
    playNotificationRingtone(settings.volume);
    vibratePhone();
  };

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(updated);
    saveNotificationSettings(updated);
    if (updated.soundEnabled) {
      playNotificationRingtone(updated.volume);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    const updated = { ...settings, volume: vol };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleRequestPermission = async () => {
    const p = await requestNotificationPermission();
    setPermission(p);
    if (p === 'granted') {
      showSystemNotification(
        '✅ Notifikasi Browser Aktif!',
        'Anda akan menerima notifikasi setiap ada pesan chat baru masuk dari calon pelanggan.'
      );
      playNotificationRingtone(settings.volume);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/chat/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setUnreadCount(0);
      setChats((prev) => prev.map((c) => ({ ...c, read: true })));
    } catch (e) {}
  };

  const filteredChats = chats.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.message.toLowerCase().includes(q) ||
      c.reply.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-emerald-600" />
            <span>Pantauan Live Chat Pengunjung Website</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full animate-pulse">
                {unreadCount} Baru
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Setiap kali calon pelanggan bertanya ke MinSora di website, sistem akan membunyikan dering suara &amp; mengirim notifikasi ke layar HP / laptop Anda secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchChats}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
            title="Muat Ulang Pesan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-black transition"
            >
              Tandai Semua Terbaca
            </button>
          )}
        </div>
      </div>

      {/* Ringtone & Notification Control Card */}
      <div className="bg-linear-to-r from-emerald-900 to-[#032e1a] text-white p-5 rounded-2xl shadow-md">
        <h3 className="text-sm font-black flex items-center gap-2 text-emerald-300">
          <Sliders className="w-4 h-4" />
          <span>Pengaturan Dering Suara &amp; Notifikasi HP</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
          {/* Sound Toggle */}
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold flex items-center gap-1.5">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                <span>Dering Bel Suara</span>
              </span>
              <button
                onClick={handleToggleSound}
                className={`text-[11px] font-black px-2.5 py-1 rounded-lg transition ${
                  settings.soundEnabled
                    ? 'bg-emerald-500 text-gray-950'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {settings.soundEnabled ? 'AKTIF' : 'MUTE'}
              </button>
            </div>
            <p className="text-[11px] text-emerald-200 mb-2">
              Bunyi bel telepon (*ting-ting-ting!*) otomatis saat pengunjung chat.
            </p>
            <button
              onClick={handleTestRingtone}
              className="mt-auto bg-white/20 hover:bg-white/30 text-white font-extrabold py-1.5 px-3 rounded-lg transition text-[11px] flex items-center justify-center gap-1.5"
            >
              <span>🔔 Uji Coba Bunyi Dering</span>
            </button>
          </div>

          {/* Volume Control */}
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <span className="font-bold block mb-1">Volume Dering</span>
              <p className="text-[11px] text-emerald-200 mb-3">
                Atur kenyaringan suara dering agar terdengar jelas saat HP diletakkan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.volume}
                onChange={handleVolumeChange}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <span className="text-[11px] font-mono font-bold w-10 text-right">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
          </div>

          {/* Browser / Phone Lockscreen Notification */}
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Notifikasi Layar HP</span>
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-sm ${
                  permission === 'granted' ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-400 text-amber-950'
                }`}>
                  {permission === 'granted' ? 'DIIZINKAN' : 'BELUM AKTIF'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mb-2">
                Pop-up pesan di bar notifikasi HP / lockscreen meski sedang buka aplikasi lain.
              </p>
            </div>
            {permission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-black py-1.5 px-3 rounded-lg transition text-[11px]"
              >
                Aktifkan Izin Notifikasi
              </button>
            ) : (
              <div className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Siap menerima notifikasi pop-up</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari percakapan pengunjung (contoh: katering pabrik, nasi box, harga)..."
          className="w-full text-xs text-gray-800 bg-transparent outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            Reset
          </button>
        )}
      </div>

      {/* Chat Messages Feed */}
      <div className="space-y-3">
        {filteredChats.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-gray-700">
              {searchQuery ? 'Tidak ada pesan yang cocok dengan pencarian' : 'Belum Ada Obrolan Masuk'}
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Saat ada pengunjung website yang menyapa MinSora, percakapan akan otomatis tampil di sini dan memicu dering bel suara.
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 rounded-2xl border transition ${
                !chat.read
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                  : 'bg-white border-gray-200 shadow-2xs hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-950">
                    Pengunjung Website
                  </span>
                  {!chat.read && (
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                      BELUM DIBACA
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(chat.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>

              {/* Visitor's Inquiry */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 mb-2 shadow-2xs">
                <span className="text-[10px] text-gray-400 font-bold block mb-1">
                  💬 Pertanyaan Pengunjung:
                </span>
                <p className="text-sm font-black text-gray-900 leading-relaxed">
                  {chat.message}
                </p>
              </div>

              {/* MinSora AI Response */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs leading-relaxed text-gray-800">
                <span className="text-[10px] text-emerald-800 font-bold block mb-1">
                  🤖 Jawaban MinSora:
                </span>
                <p className="italic text-gray-700 whitespace-pre-line">
                  {chat.reply}
                </p>
              </div>

              {/* Action: WhatsApp Follow-Up */}
              <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-400">
                  ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">{chat.id}</code>
                </span>

                <a
                  href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(`Halo, saya Admin Asasora Food. Terkait pertanyaan Kakak di web: "${chat.message}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black py-2 px-3.5 rounded-xl shadow-xs transition no-underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Follow-Up ke WhatsApp Pengunjung</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
