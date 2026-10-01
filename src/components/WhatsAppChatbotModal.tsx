import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Phone,
  MoreVertical,
  CheckCheck,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Smile,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { MinsoraAvatar } from './MinsoraAvatar';
import { CompanyInfo } from '../types';

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
  '🍱 Katering Pabrik & Kantor (B2B)',
  '👨‍👩‍👧 Katering Rumahan / Syukuran (B2C)',
  '💰 Custom Menu & Budget Fleksibel',
  '🎁 Fasilitas Free Test Food B2B',
  '📦 Cek Ketersediaan Menu Hari Ini',
  '⚠️ Bantuan & Komplain Pesanan',
];

const INITIAL_MINSORA_GREETING =
  'Halo Kak! MinSora di sini, teman kuliner & asisten virtual resmi Asasora Food (asasorafood.com) 😊.\n\nSenang banget bisa menyapa Kakak! Lagi butuh katering harian kantor/pabrik (B2B) dengan fasilitas Free Test Food, atau katering lezat untuk acara keluarga & syukuran (B2C) nih Kak? MinSora siap bantu carikan opsi menu yang paling pas dan fleksibel sesuai budget Kakak!';

export const WhatsAppChatbotModal: React.FC<WhatsAppChatbotModalProps> = ({
  isOpen,
  onClose,
  company,
}) => {
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

  // Auto scroll to latest message
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

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-4),
        }),
      });

      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Halo Kak, ada yang bisa MinSora bantu terkait katering kantor atau acara keluarga Kakak? 😊',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      // Offline fallback matching MinSora persona
      const lower = query.toLowerCase();
      let fallbackText =
        'Halo Kak! MinSora di sini 😊. Kami siap melayani katering kantor & pabrik (B2B) dengan Free Test Food, hingga acara syukuran & makan harian keluarga (B2C). Ada yang bisa MinSora bantu rencanakan?';

      if (lower.includes('komplain') || lower.includes('keluhan') || lower.includes('terlambat') || lower.includes('basi') || lower.includes('salah kirim') || lower.includes('kurang') || lower.includes('kecewa')) {
        fallbackText =
          'Aduh, MinSora memohon maaf yang sebesar-besarnya atas ketidaknyamanan yang Kakak alami 🙏.\n\nBoleh tolong informasikan nomor pesanan atau nama pemesan Kakak? Agar masalah ini bisa langsung ditangani detik ini juga, silakan klik tautan prioritas Customer Service berikut ya Kak:\n\n[Hubungi CS Penanganan Prioritas Komplain](https://wa.me/6285271000900?text=Halo%20CS%20Asasora,%20saya%20ingin%20melaporkan%20kendala%20pesanan%20saya)\n\nTim Customer Service kami akan segera menangani kendala Kakak sebagai prioritas utama.';
      } else if (lower.includes('pabrik') || lower.includes('shift') || lower.includes('kantor') || lower.includes('b2b') || lower.includes('test food') || lower.includes('invoice') || lower.includes('kontrak')) {
        fallbackText =
          'Wah pas banget Kak! Untuk layanan B2B (Katering Kantor, Pabrik & Shift Karyawan), Asasora Food siap melayani volume porsi besar dengan:\n\n✅ Pengiriman tepat waktu sesuai jadwal shift kerja\n✅ Legalitas lengkap: Invoice resmi PT, Kwitansi & Faktur Pajak ber-NPWP\n✅ Fasilitas sesi "Test Food" GRATIS sebelum kontrak kerja sama dimulai\n✅ Rotasi menu bergizi 30 hari tanpa bosan\n\nUntuk pesanan skala besar disarankan reservasi minimal H-2 ya Kak. Yuk konsultasi langsung dengan Tim Marketing kami:\n\n• [Hubungi Tim Marketing - Katering Pabrik & Shift](https://wa.me/6285271000900?text=Halo%20Tim%20Marketing%20Asasora,%20saya%20ingin%20konsultasi%20katering%20pabrik/karyawan%20shift)\n• [Hubungi Tim Marketing - Event Kantor & Rapat](https://wa.me/6285271000900?text=Halo%20Tim%20Marketing%20Asasora,%20saya%20ingin%20konsultasi%20katering%20event%20kantor/rapat)';
      } else if (lower.includes('harga') || lower.includes('bujet') || lower.includes('budget') || lower.includes('paket') || lower.includes('murah') || lower.includes('biaya')) {
        fallbackText =
          'Di Asasora Food, kami SANGAT FLEKSIBEL soal menu dan budget, Kak! Pilihan lauk dan porsi bisa disesuaikan dengan isi kantong atau pagu anggaran kantor Kakak (mulai dari Rp20.000-an/porsi hingga paket premium).\n\nYuk diskusikan budget yang Kakak miliki bareng MinSora atau langsung chat ke Customer Service kami agar kami buatkan simulasi menu terbaik:\n\n[Chat CS Asasora (B2C & Harian)](https://wa.me/6285271000900?text=Halo%20CS%20Asasora%20Food,%20saya%20ingin%20konsultasi%20paket%20menu%20dan%20budget%20katering)';
      } else if (lower.includes('ready') || lower.includes('stok') || lower.includes('ketersediaan') || lower.includes('hari ini')) {
        fallbackText =
          'Jujur nih Kak, demi menjaga kesegaran maksimal dan kualitas bahan makanan terbaik, tidak semua produk selalu ready stock setiap hari di dapur kami 😊.\n\nBoleh tahu Kakak sedang berminat dengan menu apa? Nanti MinSora bantu cek langsung ketersediaannya di dapur hari ini, atau Kakak bisa langsung cek kilat ke CS kami:\n\n[Chat CS Asasora (B2C & Harian)](https://wa.me/6285271000900?text=Halo%20CS%20Asasora,%20saya%20mau%20tanya%20ketersediaan%20menu%20hari%20ini)';
      } else if (lower.includes('keluarga') || lower.includes('syukuran') || lower.includes('hajatan') || lower.includes('rumah') || lower.includes('b2c')) {
        fallbackText =
          'Asyik banget Kak! Untuk acara syukuran, hajatan, ulang tahun, atau kumpul keluarga, Asasora Food menyediakan pilihan menu Nusantara hangat yang fleksibel dan lezat. Tersedia Nasi Tumpeng Mini, Nasi Kotak Daun Jeruk, hingga lauk spesial Paru Balado khas Asasora!\n\nYuk konsultasi langsung dengan Customer Service kami:\n\n[Chat CS Asasora (B2C & Harian)](https://wa.me/6285271000900?text=Halo%20CS%20Asasora%20Food,%20saya%20ingin%20konsultasi%20pesanan%20katering%20harian/acara%20keluarga)';
      } else if (lower.includes('kirim') || lower.includes('ongkir') || lower.includes('lokasi')) {
        fallbackText =
          'Untuk pengiriman area lokal Tangerang & Jabodetabek, kami menggunakan layanan ojek online (GrabExpress/Gojek Instant maupun Sameday) agar makanan sampai hangat dan higienis. Khusus produk kering atau frozen food, kami juga bisa kirim ke luar kota lewat ekspedisi kilat (JNE YES/Sicepat) lho Kak!';
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: fallbackText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
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

  // Helper to parse markdown links [label](url) into interactive buttons
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
          className="inline-flex items-center gap-1.5 my-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-[11px] rounded-xl shadow-xs transition transform hover:scale-[1.02] active:scale-95 cursor-pointer no-underline border border-emerald-600/30"
        >
          <span>{linkText}</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      );

      lastIndex = startIndex + fullMatch.length;
    }

    if (lastIndex < rawText.length) {
      elements.push(<span key={`text-${lastIndex}`}>{rawText.substring(lastIndex)}</span>);
    }

    return elements;
  };

  // Build direct WhatsApp Link with consultation transcript
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
        className="fixed inset-0 bg-black/40 backdrop-blur-xs sm:hidden pointer-events-auto"
        onClick={onClose}
      />

      {/* Floating Chat Container */}
      <div className="w-full sm:w-[390px] h-[85vh] sm:h-[580px] max-h-[92vh] bg-[#EFEAE2] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-emerald-900/10 pointer-events-auto animate-in slide-in-from-bottom-5 duration-200 z-10">
        {/* WhatsApp Header */}
        <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <MinsoraAvatar size="sm" showOnlineBadge={true} showWaBadge={true} />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wide text-white">MinSora AI</span>
                <span className="bg-[#25D366] text-gray-950 font-black text-[9px] px-1 py-0.2 rounded-full flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-gray-950" />
                  <span>Resmi</span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                <span>Online • PT. Asasora Food</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              title="Mulai Ulang Percakapan"
              className="p-1.5 rounded-full hover:bg-white/10 text-emerald-100 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Tutup Chat"
              className="p-1.5 rounded-full hover:bg-white/10 text-emerald-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Direct WhatsApp Admin Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200/80 px-3.5 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-950 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Mau langsung ke WhatsApp Admin?</span>
          </div>
          <a
            href={`https://wa.me/${company.whatsapp || '6285271000900'}?text=${encodeURIComponent('Halo Admin Asasora Food (0852-7100-0900), saya ingin berkonsultasi pesanan katering.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-black text-white bg-[#25D366] hover:bg-[#1fa951] px-2.5 py-1 rounded-lg flex items-center gap-1 transition shadow-xs"
          >
            <span>WA Admin 0852-7100-0900</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* WhatsApp Security Notice Banner */}
        <div className="bg-[#FCF5EB] border-b border-amber-200/60 px-3 py-1.5 text-center shrink-0">
          <p className="text-[10px] text-amber-900 font-semibold flex items-center justify-center gap-1">
            <span>🔒</span>
            <span>Didukung AI Cerdas & Sertifikasi Halal BPJPH (ID36110081134110926)</span>
          </p>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar bg-[#EFEAE2]">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs relative leading-relaxed whitespace-pre-line ${
                    isBot
                      ? 'bg-white text-gray-900 rounded-tl-xs border border-gray-100'
                      : 'bg-[#D9FDD3] text-gray-900 rounded-tr-xs border border-emerald-200/60'
                  }`}
                >
                  <div className="leading-relaxed break-words">{renderFormattedMessage(msg.text)}</div>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-400 font-medium">
                    <span>{msg.time}</span>
                    {!isBot && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start">
              <div className="bg-white rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs shadow-xs border border-gray-100 flex items-center gap-1.5 text-gray-500">
                <span className="font-semibold text-[11px]">MinSora sedang mengetik</span>
                <span className="flex items-center gap-1 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-[#F0F2F5] px-3 py-2 border-t border-gray-200 overflow-x-auto custom-scrollbar flex gap-1.5 shrink-0">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isTyping}
              className="text-[11px] font-bold bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 rounded-full px-2.5 py-1 whitespace-nowrap shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Transfer to Official WhatsApp Direct CTA */}
        <div className="bg-emerald-50/90 border-t border-emerald-200/80 px-3 py-1.5 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-emerald-900 font-semibold truncate">
            Butuh penawaran / invoice resmi PT?
          </span>
          <a
            href={getWhatsAppForwardUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-extrabold text-white bg-[#25D366] hover:bg-[#20ba59] px-2.5 py-1 rounded-lg flex items-center gap-1 transition shadow-xs whitespace-nowrap"
          >
            <span>Chat CS Langsung</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Input Bar */}
        <div className="bg-[#F0F2F5] px-3 py-2 flex items-center gap-2 shrink-0 border-t border-gray-200">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Tulis pesan ke MinSora..."
            disabled={isTyping}
            className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075E54] transition shadow-2xs"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="w-9 h-9 rounded-full bg-[#075E54] hover:bg-[#064e46] disabled:bg-gray-300 text-white flex items-center justify-center transition shadow-md cursor-pointer active:scale-95 disabled:cursor-not-allowed shrink-0"
            title="Kirim Pesan"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
