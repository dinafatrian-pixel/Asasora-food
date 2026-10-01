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
  '🍱 Katering Harian Kantor Tangerang',
  '📦 Nasi Kotak Seminar & Meeting',
  '💰 Simulasi Harga & Paket Menu',
  '📜 Sertifikasi Halal BPJPH & Higienis',
  '🍲 Paru Balado Khas Asasora',
];

export const WhatsAppChatbotModal: React.FC<WhatsAppChatbotModalProps> = ({
  isOpen,
  onClose,
  company,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Halo! Saya MinSora, asisten katering resmi dari PT. Asasora Bio Healthora 😊.\n\nAda yang bisa saya bantu rencanakan untuk katering harian karyawan, nasi kotak seminar, atau event kantor Anda di Tangerang & Jabodetabek?',
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
        text: data.reply || 'Mohon maaf, MinSora sedang memproses jawaban. Silakan hubungi tim kami via WhatsApp resmi ya Kak.',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      // Offline fallback
      let fallbackText =
        'Terima kasih atas pertanyaannya Kak! Untuk respons lebih cepat dan konsultasi menu khusus katering kantor, Kakak bisa langsung terhubung dengan tim customer service kami melalui WhatsApp.';
      const lower = query.toLowerCase();
      if (lower.includes('harga') || lower.includes('paket') || lower.includes('bujet')) {
        fallbackText =
          'Paket katering Asasora sangat terjangkau:\n• Paket NaSemangkuk Daun Jeruk: mulai Rp20.000\n• Nasi Kotak Ekonomis: mulai Rp25.000\n• Nasi Bento NaSemangkuk: mulai Rp35.000\n• Nasi Kotak Premium: mulai Rp45.000\n\nBisa disesuaikan dengan alokasi anggaran kantor Kakak!';
      } else if (lower.includes('harian') || lower.includes('karyawan') || lower.includes('kantor')) {
        fallbackText =
          'Untuk katering harian karyawan Tangerang, kami menyediakan variasi menu rotasi 30 hari, pengantaran tepat waktu dengan armada boks termal higienis, serta dukungan invoice resmi dan TOP untuk instansi/perusahaan.';
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
        text: 'Halo! Saya MinSora, asisten katering resmi dari PT. Asasora Bio Healthora 😊.\n\nAda yang bisa saya bantu rencanakan untuk katering harian karyawan, nasi kotak seminar, atau event kantor Anda di Tangerang & Jabodetabek?',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
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
                  <p>{msg.text}</p>
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
