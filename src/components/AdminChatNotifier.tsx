import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  ExternalLink,
  MessageCircle,
  X,
  Smartphone,
  CheckCheck,
  Radio,
  Clock,
} from 'lucide-react';
import {
  playNotificationRingtone,
  vibratePhone,
  requestNotificationPermission,
  showSystemNotification,
  flashTabTitle,
  getNotificationSettings,
  saveNotificationSettings,
  NotificationSettings,
} from '../utils/chatNotifier';

export interface ChatLogItem {
  id: string;
  sessionId: string;
  sender: 'user';
  message: string;
  reply: string;
  timestamp: string;
  read: boolean;
  userAgent?: string;
}

interface AdminChatNotifierProps {
  adminWhatsApp?: string;
  onOpenLiveChatModal?: () => void;
  // If true, always show the floating monitor badge
  alwaysShowMonitor?: boolean;
}

export const AdminChatNotifier: React.FC<AdminChatNotifierProps> = ({
  adminWhatsApp = '6285271000900',
  onOpenLiveChatModal,
  alwaysShowMonitor = true,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [activeBannerChat, setActiveBannerChat] = useState<ChatLogItem | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentChats, setRecentChats] = useState<ChatLogItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'denied';
  });

  // Track known IDs so we only alert for genuine new incoming chats
  const seenChatIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Load initial chat logs & mark already existing chats as seen so we don't ring on page refresh
  const fetchChatLogs = useCallback(async (isPolling = false) => {
    try {
      const res = await fetch('/api/chat/logs');
      if (!res.ok) return;
      const data = await res.json();
      const chats: ChatLogItem[] = data.chats || [];
      setRecentChats(chats);
      setUnreadCount(data.unreadCount || 0);

      if (isInitialLoadRef.current) {
        // Populate seenChatIds on first mount so we don't ring for old messages
        chats.forEach((c) => seenChatIdsRef.current.add(c.id));
        isInitialLoadRef.current = false;
        return;
      }

      // Check if there are newly arrived chats
      for (const chat of chats) {
        if (!seenChatIdsRef.current.has(chat.id)) {
          seenChatIdsRef.current.add(chat.id);

          // Only trigger alert if message is recent (less than 5 minutes old)
          const msgAgeMs = Date.now() - new Date(chat.timestamp).getTime();
          if (msgAgeMs < 5 * 60 * 1000) {
            triggerNewChatAlert(chat);
            break; // Show banner for the newest one
          }
        }
      }
    } catch (e) {
      // Ignore network errors in background polling
    }
  }, []);

  const triggerNewChatAlert = (chat: ChatLogItem) => {
    setActiveBannerChat(chat);

    // 1. Play phone chime/ringtone
    if (settings.soundEnabled) {
      playNotificationRingtone(settings.volume);
    }

    // 2. Vibrate phone
    if (settings.vibrationEnabled) {
      vibratePhone();
    }

    // 3. Tab title flasher
    flashTabTitle(`🔔 (Chat Baru) ${chat.message.substring(0, 20)}...`);

    // 4. Native OS notification
    if (settings.browserNotificationEnabled && Notification.permission === 'granted') {
      showSystemNotification(
        '🔔 Chat Baru Masuk - MinSora Asasora Food',
        `Pengunjung: "${chat.message}"`,
        () => {
          setIsDrawerOpen(true);
        }
      );
    }
  };

  // Setup SSE and polling listener
  useEffect(() => {
    // 1. Initial fetch
    fetchChatLogs();

    // 2. Background polling fallback every 4 seconds
    const pollTimer = setInterval(() => {
      fetchChatLogs(true);
    }, 4000);

    // 3. SSE Connection for real-time instant alerts
    let sse: EventSource | null = null;
    try {
      sse = new EventSource('/api/chat/stream');
      sse.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.id && parsed.message) {
            const chat: ChatLogItem = parsed;
            if (!seenChatIdsRef.current.has(chat.id)) {
              seenChatIdsRef.current.add(chat.id);
              setRecentChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)]);
              setUnreadCount((prev) => prev + 1);
              triggerNewChatAlert(chat);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      clearInterval(pollTimer);
      if (sse) sse.close();
    };
  }, [fetchChatLogs, settings]);

  const handleTestSound = () => {
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

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      showSystemNotification(
        '✅ Notifikasi Layar Berhasil Diaktifkan!',
        'Anda akan menerima dering & notifikasi setiap ada pesan chat baru masuk dari pengunjung.'
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
      setRecentChats((prev) => prev.map((c) => ({ ...c, read: true })));
    } catch (e) {}
  };

  const handleDismissBanner = () => {
    setActiveBannerChat(null);
  };

  return (
    <>
      {/* 1. FLOATING ALERT TOAST: Shown when a visitor sends a new message */}
      {activeBannerChat && (
        <div className="fixed top-4 right-4 z-50 max-w-sm sm:max-w-md w-full bg-white/95 backdrop-blur-md border-2 border-emerald-500 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                <Bell className="w-4 h-4 text-emerald-600 animate-bounce" />
                <span>CHAT BARU MASUK DARI PENGUNJUNG!</span>
              </div>
            </div>
            <button
              onClick={handleDismissBanner}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2.5 bg-emerald-50/80 rounded-xl p-3 border border-emerald-100 text-xs text-gray-800">
            <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold mb-1">
              <span>👤 Pengunjung Website:</span>
              <span>{new Date(activeBannerChat.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="font-extrabold text-gray-950 text-sm leading-snug line-clamp-2">
              &ldquo;{activeBannerChat.message}&rdquo;
            </p>

            <div className="mt-2 pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-900 leading-snug">
              <span className="font-bold">MinSora AI: </span>
              <span className="italic line-clamp-2">{activeBannerChat.reply}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                setActiveBannerChat(null);
                setIsDrawerOpen(true);
              }}
              className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black py-2 px-3 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Lihat Percakapan</span>
            </button>

            <a
              href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(`Halo, saya Admin Asasora Food. Terkait pertanyaan Kakak di web: "${activeBannerChat.message}"`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black py-2 px-3 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 no-underline"
              title="Balas Langsung via WhatsApp"
            >
              <span>Balas WA</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* 2. FLOATING ADMIN MONITOR CHIP (Top-Right or Bottom Status) */}
      {alwaysShowMonitor && (
        <div className="fixed bottom-24 right-5 z-40 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border border-emerald-200/90 rounded-full shadow-lg px-2.5 py-1.5 flex items-center gap-2 text-xs">
            {/* Live radar indicator */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 text-gray-800 hover:text-emerald-800 font-bold transition group"
              title="Buka Pantauan Live Chat Pengunjung"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="text-[11px] font-black text-emerald-950">
                Pantau Chat
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <span className="w-px h-3.5 bg-gray-200" />

            {/* Sound Toggle Button */}
            <button
              onClick={handleToggleSound}
              className={`p-1 rounded-full transition ${
                settings.soundEnabled
                  ? 'text-emerald-700 hover:bg-emerald-50'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title={settings.soundEnabled ? 'Dering Suara Aktif (Klik untuk Mute)' : 'Dering Suara Mute (Klik untuk Aktifkan)'}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Test Ringtone Button */}
            <button
              onClick={handleTestSound}
              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full transition border border-emerald-200"
              title="Klik untuk Menguji Bunyi Dering Bel"
            >
              Tes Dering
            </button>
          </div>
        </div>
      )}

      {/* 3. LIVE CHAT DRAWER / MONITOR MODAL */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-white w-full max-w-2xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-[#032e1a] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-black flex items-center gap-2">
                    <span>Pantau Live Chat MinSora</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {unreadCount} Baru
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-emerald-200">
                    Notifikasi dering suara HP &amp; browser otomatis berbunyi saat ada pesan masuk
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-emerald-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Settings Banner inside Drawer */}
            <div className="bg-emerald-50/80 border-b border-emerald-100 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleSound}
                  className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl border transition ${
                    settings.soundEnabled
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>Dering Suara: {settings.soundEnabled ? 'Aktif' : 'Mute'}</span>
                </button>

                <button
                  onClick={handleTestSound}
                  className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold px-3 py-1.5 rounded-xl transition"
                >
                  🔔 Tes Bunyi Dering
                </button>
              </div>

              {notifPermission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-3 py-1.5 rounded-xl transition shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Aktifkan Notifikasi Layar HP</span>
                </button>
              )}

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-emerald-800 hover:text-emerald-950 font-bold text-xs underline"
                >
                  Tandai Semua Terbaca
                </button>
              )}
            </div>

            {/* Chat List Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar bg-gray-50">
              {recentChats.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2 opacity-60" />
                  <p className="text-sm font-bold text-gray-500">Belum ada obrolan baru dari pengunjung</p>
                  <p className="text-xs mt-1 text-gray-400">
                    Sistem sedang aktif memantau. Jika ada yang chat, HP atau browser Anda akan berdering otomatis.
                  </p>
                </div>
              ) : (
                recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`rounded-2xl p-4 transition border ${
                      !chat.read
                        ? 'bg-emerald-50/60 border-emerald-300 shadow-sm'
                        : 'bg-white border-gray-200/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-emerald-900">
                          Pengunjung Website
                        </span>
                        {!chat.read && (
                          <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                            BARU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(chat.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </div>

                    {/* Visitor Question */}
                    <div className="bg-white rounded-xl p-3 border border-emerald-100 mb-2 shadow-2xs">
                      <span className="text-[10px] text-gray-400 font-bold block mb-0.5">Pertanyaan Pengunjung:</span>
                      <p className="text-sm font-black text-gray-900 leading-relaxed">
                        {chat.message}
                      </p>
                    </div>

                    {/* Bot Answer */}
                    <div className="bg-emerald-900/5 rounded-xl p-3 border border-emerald-900/10 text-xs text-emerald-950 leading-relaxed">
                      <span className="text-[10px] text-emerald-700 font-bold block mb-0.5">Jawaban MinSora:</span>
                      <p className="italic text-gray-700">
                        {chat.reply}
                      </p>
                    </div>

                    {/* Quick WhatsApp Action Button */}
                    <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <a
                        href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(`Halo, saya Admin Asasora Food. Terkait pertanyaan Kakak di web tadi: "${chat.message}"`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-extrabold py-1.5 px-3 rounded-lg shadow-2xs transition flex items-center gap-1.5 no-underline"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Follow Up Pengunjung di WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Status Pemantau: <strong>Aktif Real-time (SSE &amp; Polling)</strong></span>
              </span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-1.5 rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
