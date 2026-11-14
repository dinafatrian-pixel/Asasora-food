import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  CheckCheck,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Bell,
  Lock,
} from 'lucide-react';
import { MinsoraAvatar } from './MinsoraAvatar';
import { CompanyInfo } from '../types';
import { playNotificationRingtone, vibratePhone } from '../utils/chatNotifier';
import { ChatTypingSkeleton } from './SkeletonShimmer';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

interface WhatsAppChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyInfo;
}

const QUICK_PROMPTS = [
  'Katering Pabrik & Kantor (B2B)',
  'Kapan Sebaiknya Pesan Nasi Box?',
  'Custom Menu & Budget Fleksibel',
  'Fasilitas Free Test Food B2B',
  'Katering Rumahan / Syukuran (B2C)',
  'Bantuan & Komplain Pesanan',
];

const INITIAL_MINSORA_GREETING =
  'Halo Kak! MinSora di sini, teman kuliner & asisten virtual resmi Asasora Food (asasorafood.com).\n\nSenang dapat menyapa Kakak! Sedang membutuhkan katering harian kantor/pabrik (B2B) dengan fasilitas Free Test Food, atau katering lezat untuk acara keluarga & syukuran (B2C)? MinSora siap bantu carikan opsi menu yang paling pas dan fleksibel sesuai anggaran Kakak.';

export const WhatsAppChatbotModal: React.FC<WhatsAppChatbotModalProps> = ({
  isOpen,
  onClose,
  company,
}) => {
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let s = sessionStorage.getItem('minsora_session_id');
      if (!s) {
        s = `guest_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        sessionStorage.setItem('minsora_session_id', s);
      }
      return s;
    }
    return `guest_${Date.now()}`;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'bot',
      text: INITIAL_MINSORA_GREETING,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isTyping, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: nowTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    playNotificationRingtone(0.9);
    vibratePhone();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-4),
          sessionId,
        }),
      });

      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Halo Kak, ada yang bisa MinSora bantu terkait katering kantor atau acara keluarga Kakak?',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);

      window.dispatchEvent(
        new CustomEvent('asasora_new_incoming_chat', {
          detail: {
            id: data.logId || `chat_${Date.now()}`,
            message: query,
            reply: botMsg.text,
            timestamp: new Date().toISOString(),
          },
        })
      );
    } catch {
      const lower = query.toLowerCase();
      let fallbackText =
        'Halo Kak! MinSora di sini. Kami siap melayani katering kantor & pabrik (B2B) dengan Free Test Food, hingga acara syukuran & makan harian keluarga (B2C). Ada yang bisa MinSora bantu rencanakan?';

      if (lower.includes('komplain') || lower.includes('keluhan') || lower.includes('terlambat') || lower.includes('basi') || lower.includes('salah kirim') || lower.includes('kurang') || lower.includes('kecewa')) {
        fallbackText =
          'MinSora memohon maaf sebesar-besarnya atas ketidaknyamanan yang Kakak alami.\n\nMohon informasikan nomor pesanan atau nama pemesan Kakak agar kendala ini segera ditangani. Silakan klik tautan prioritas Customer Service berikut:\n\n[Hubungi CS Penanganan Prioritas Komplain](https://wa.me/6285271000900?text=Halo%20CS%20Asasora,%20saya%20ingin%20melaporkan%20kendala%20pesanan%20saya)\n\nTim Customer Service kami akan segera menangani kendala Kakak sebagai prioritas utama.';
      } else if (lower.includes('h-berapa') || lower.includes('h berapa') || lower.includes('h-2') || lower.includes('kapan sebaiknya') || lower.includes('kapan pesan') || lower.includes('kapan order') || (lower.includes('nasi box') && (lower.includes('kapan') || lower.includes('h-') || lower.includes('berapa')))) {
        fallbackText =
          'Untuk pemesanan nasi box bisa H-2 ya Kak, atau Kakak bisa order langsung di website www.asasorafood.com dengan menambahkan keterangan jadwal pengiriman di form order.\n\nDengan reservasi H-2, tim dapur Asasora Food dapat menyiapkan bahan-bahan segar berkualitas prima dan memastikan pesanan tiba tepat waktu. Mau MinSora bantu rekomendasikan menu nasi box favoritnya sekarang?';
      } else if (lower.includes('pabrik') || lower.includes('shift') || lower.includes('kantor') || lower.includes('b2b') || lower.includes('test food') || lower.includes('invoice') || lower.includes('kontrak')) {
        fallbackText =
          'Untuk layanan B2B (Katering Kantor, Pabrik & Shift Karyawan), Asasora Food siap melayani volume porsi besar dengan:\n\n- Pengiriman tepat waktu sesuai jadwal shift kerja\n- Legalitas lengkap: Invoice resmi PT, Kwitansi & Faktur Pajak ber-NPWP\n- Fasilitas sesi Test Food GRATIS sebelum kontrak kerja sama dimulai\n- Rotasi menu bergizi 30 hari tanpa bosan\n\nUntuk pesanan skala besar disarankan reservasi minimal H-2 ya Kak. Silakan konsultasi langsung dengan Tim Marketing kami:\n\n• [Hubungi Tim Marketing - Katering Pabrik & Shift](https://wa.me/6285271000900?text=Halo%20Tim%20Marketing%20Asasora,%20saya%20ingin%20konsultasi%20katering%20pabrik/karyawan%20shift)\n• [Hubungi Tim Marketing - Event Kantor & Rapat](https://wa.me/6285271000900?text=Halo%20Tim%20Marketing%20Asasora,%20saya%20ingin%20konsultasi%20katering%20event%20kantor/rapat)';
      } else if (lower.includes('harga') || lower.includes('bujet') || lower.includes('budget') || lower.includes('paket') || lower.includes('murah') || lower.includes('biaya')) {
        fallbackText =
          'Di Asasora Food, kami sangat fleksibel soal menu dan anggaran. Pilihan lauk dan porsi bisa disesuaikan dengan alokasi anggaran kantor Kakak (mulai dari Rp20.000-an/porsi hingga paket premium).\n\nDiskusikan budget yang Kakak miliki bareng MinSora atau langsung chat ke Customer Service kami untuk simulasi menu terbaik:\n\n[Chat CS Asasora (B2C & Harian)](https://wa.me/6285271000900?text=Halo%20CS%20Asasora%20Food,%20saya%20ingin%20konsultasi%20paket%20menu%20dan%20budget%20katering)';
      } else if (lower.includes('ready') || lower.includes('stok') || lower.includes('ketersediaan') || lower.includes('hari ini')) {
        fallbackText =
          'Demi menjaga kesegaran maksimal dan kualitas bahan makanan terbaik, tidak semua produk selalu ready stock setiap hari di dapur kami.\n\nBoleh tahu Kakak sedang berminat dengan menu apa? Nanti MinSora bantu cek langsung ketersediaannya di dapur hari ini, atau silakan cek kilat ke CS kami:\n\n[Chat CS Asasora (B2C & Harian)](https://wa.me/6285271000900?text=Halo%20CS%20Asasora,%20saya%20mau%20tanya%20ketersediaan%20menu%20hari%20ini)';
      } else if (lower.includes('keluarga') || lower.includes('syukuran') || lower.includes('hajatan') || lower.includes('rumah') || lower.includes('b2c')) {
        fallbackText =
          'Untuk acara syukuran, hajatan, ulang tahun, atau kumpul keluarga, Asasora Food menyediakan pilihan menu Nusantara hangat yang fleksibel dan lezat. Tersedia Nasi Tumpeng Mini, Nasi Kotak Daun Jeruk, hingga lauk spesial Paru Balado khas Asasora.\n\nSilakan konsultasi langsung dengan Customer Service kami:\n\n[Chat CS Asasora (B2C & Harian)](https://wa.me/6285271000900?text=Halo%20CS%20Asasora%20Food,%20saya%20ingin%20konsultasi%20pesanan%20katering%20harian/acara%20keluarga)';
      } else if (lower.includes('kirim') || lower.includes('ongkir') || lower.includes('lokasi')) {
        fallbackText =
          'Untuk pengiriman area lokal Tangerang & Jabodetabek, kami menggunakan layanan kurir instan (GrabExpress/Gojek Instant maupun Sameday) agar makanan sampai hangat dan higienis. Khusus produk kering atau frozen food, kami juga dapat kirim ke luar kota lewat ekspedisi kilat.';
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: fallbackText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);

      window.dispatchEvent(
        new CustomEvent('asasora_new_incoming_chat', {
          detail: {
            id: `chat_${Date.now()}`,
            message: query,
            reply: fallbackText,
            timestamp: new Date().toISOString(),
          },
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'init-1',
        sender: 'bot',
        text: INITIAL_MINSORA_GREETING,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const renderFormattedMessage = (rawText: string) => {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(rawText)) !== null) {
      const [fullMatch, linkText, url] = match;
      const startIndex = match.index;

      if (startIndex > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{rawText.substring(lastIndex, startIndex)}</span>
        );
      }

      elements.push(
        <a
          key={`link-${startIndex}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 my-1.5 px-3 py-1.5 bg-[#0F5132] hover:bg-[#0b3d26] text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer no-underline border border-[#0b3d26]"
        >
          <span>{linkText}</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
        </a>
      );

      lastIndex = startIndex + fullMatch.length;
    }

    if (lastIndex < rawText.length) {
      elements.push(<span key={`text-${lastIndex}`}>{rawText.substring(lastIndex)}</span>);
    }

    return elements;
  };

  const getWhatsAppForwardUrl = () => {
    const waNumber = company.whatsapp || '6285271000900';
    const lastUserQuery = [...messages].reverse().find((m) => m.sender === 'user')?.text || '';
    const text = encodeURIComponent(
      `Halo CS Asasora Food (PT. ASASORA BIO HEALTHORA),\nsaya tadi berdiskusi dengan MinSora di website asasorafood.com mengenai:\n"${lastUserQuery || 'Konsultasi Katering Kantor / Event'}"\n\nBisa dibantu untuk rincian penawaran & ketersediaan tanggalnya? Terima kasih!`
    );
    return `https://wa.me/${waNumber}?text=${text}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-end justify-center sm:justify-end sm:p-5 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="MinSora WhatsApp AI Assistant"
    >
      {/* Background backdrop on mobile */}
      <div
        className="fixed inset-0 bg-stone-950/60 sm:hidden pointer-events-auto"
        onClick={onClose}
      />

      {/* Floating Chat Container */}
      <div className="w-full sm:w-[390px] h-[85vh] sm:h-[580px] max-h-[92vh] bg-[#F4F3EE] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden border border-stone-300 pointer-events-auto animate-in slide-in-from-bottom-5 duration-200 z-10">
        {/* Header */}
        <div className="bg-[#0F5132] text-white px-4 py-3 flex items-center justify-between border-b border-[#0b3d26] shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <MinsoraAvatar size="sm" showOnlineBadge={true} showWaBadge={true} />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">MinSora AI</span>
                <span className="bg-[#F3C623] text-stone-900 font-extrabold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-stone-900" strokeWidth={2} />
                  <span>Resmi</span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Online · PT. Asasora Food</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                playNotificationRingtone(0.9);
                vibratePhone();
              }}
              title="Uji Coba Dering Pengingat (Bel Chat)"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#F3C623] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Bell className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={handleResetChat}
              title="Mulai Ulang Percakapan"
              className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={onClose}
              title="Tutup Chat"
              className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Direct WhatsApp Admin Banner */}
        <div className="bg-white border-b border-stone-200 px-3.5 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-800 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#0F5132]" />
            <span>Mau langsung ke WhatsApp Admin?</span>
          </div>
          <a
            href={`https://wa.me/${company.whatsapp || '6285271000900'}?text=${encodeURIComponent('Halo Admin Asasora Food (0852-7100-0900), saya ingin berkonsultasi pesanan katering.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-white bg-[#0F5132] hover:bg-[#0b3d26] px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
          >
            <span>WA Admin 0852-7100-0900</span>
            <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
          </a>
        </div>

        {/* Security Notice Banner */}
        <div className="bg-[#FAFBF9] border-b border-stone-200 px-3 py-1.5 text-center shrink-0">
          <p className="text-[10px] text-stone-600 font-semibold flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-[#0F5132]" strokeWidth={1.75} />
            <span>Didukung AI Cerdas &amp; Sertifikasi Halal BPJPH (ID36110081134110926)</span>
          </p>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar bg-[#F4F3EE]">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs relative leading-relaxed whitespace-pre-line border ${
                    isBot
                      ? 'bg-white text-stone-900 border-stone-200'
                      : 'bg-[#E3F2E8] text-stone-900 border-[#0F5132]/20'
                  }`}
                >
                  <div className="leading-relaxed break-words">{renderFormattedMessage(msg.text)}</div>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-stone-500 font-medium tabular-nums">
                    <span>{msg.time}</span>
                    {!isBot && <CheckCheck className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Skeleton Shimmer */}
          {isTyping && <ChatTypingSkeleton />}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-white px-3 py-2 border-t border-stone-200 overflow-x-auto custom-scrollbar flex gap-1.5 shrink-0">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isTyping}
              className="btn-micro text-[11px] font-semibold bg-[#F7F8F6] hover:bg-stone-100 text-stone-700 hover:text-[#0F5132] border border-stone-200 rounded-lg px-2.5 py-1 whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Transfer to Official WhatsApp Direct CTA */}
        <div className="bg-[#FAFBF9] border-t border-stone-200 px-3 py-1.5 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-stone-700 font-semibold truncate">
            Butuh penawaran / invoice resmi PT?
          </span>
          <a
            href={getWhatsAppForwardUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-white bg-[#0F5132] hover:bg-[#0b3d26] px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <span>Chat CS Langsung</span>
            <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
          </a>
        </div>

        {/* Input Bar */}
        <div className="bg-white px-3 py-2.5 flex items-center gap-2 shrink-0 border-t border-stone-200">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Tulis pesan ke MinSora..."
            disabled={isTyping}
            className="flex-1 bg-[#FAFBF9] border border-stone-300 rounded-lg px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] transition-colors"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="w-9 h-9 rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] disabled:bg-stone-300 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
            title="Kirim Pesan"
          >
            <Send className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
};
