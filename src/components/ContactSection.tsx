import React, { useState } from 'react';
import { MapPin, Mail, Phone, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import { CompanyInfo } from '../types';
import { MinsoraAvatar } from './MinsoraAvatar';
import { useLanguage } from '../context/LanguageContext';
import { sanitizeString } from '../utils/security';

interface ContactSectionProps {
  company: CompanyInfo;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ company }) => {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('catering_box');
  const [message, setMessage] = useState('');

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeString(name);
    const cleanMessage = sanitizeString(message);
    if (!cleanName || !cleanMessage) return;

    const topicLabels: Record<string, { id: string; en: string }> = {
      catering_box: {
        id: 'Divisi Catering (Asasora Catering) - Nasi Kotak / Nasi Boks',
        en: 'Catering Division (Asasora Catering) - Meal Box / Bento',
      },
      catering_buffet: {
        id: 'Divisi Catering (Asasora Catering) - Paket Prasmanan & Acara Spesial',
        en: 'Catering Division (Asasora Catering) - Buffet & Special Events',
      },
      catering_snack: {
        id: 'Divisi Catering (Asasora Catering) - Tumpeng Mini & Snack Box Event',
        en: 'Catering Division (Asasora Catering) - Mini Tumpeng & Snack Box',
      },
      frozen_food: {
        id: 'Divisi Makanan Olahan & Frozen Food (Asasora Food) - Lauk Siap Saji (Frozen/Packed)',
        en: 'Processed & Frozen Food Division - Ready-to-Eat / Frozen Packed Dishes',
      },
      ready_to_eat: {
        id: 'Divisi Makanan Siap Saji (Ready-to-Eat / Rice Bowl)',
        en: 'Ready-to-Eat Food Division / Rice Bowl',
      },
      beverages: {
        id: 'Divisi Minuman (Beverages)',
        en: 'Beverages Division',
      },
      corporate_partnership: {
        id: 'Kemitraan & Kerjasama Pengadaan Katering Rutin (Kantor/Pabrik/Instansi)',
        en: 'Corporate Partnership & Routine Catering Procurement (Offices/Factories/Institutions)',
      },
    };

    const resolvedTopic = topicLabels[topic] ? topicLabels[topic][lang] : topic;

    const text = lang === 'en'
      ? `Hello MinSora / Admin of PT. ASASORA BIO HEALTHORA,
Name / Organization: *${cleanName}*
Need / Subject: *${resolvedTopic}*
Message / Inquiry Details:
${cleanMessage}

Please send quotation and availability info. Thank you!`
      : `Halo MinSora / Admin PT. ASASORA BIO HEALTHORA,
Nama / Instansi: *${cleanName}*
Topik Kebutuhan: *${resolvedTopic}*
Rincian Pesan / Penawaran:
${cleanMessage}

Mohon info penawaran harga & ketersediaannya. Terima kasih!`;

    const waUrl = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F9FDF9] border-t border-green-100" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Company Info */}
          <div className="space-y-6">
            <div>
              <span className="text-[#4A9E60] font-bold text-xs sm:text-sm tracking-widest uppercase">
                {t('contact.tag', 'Hubungi Kami')}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2E6F40] mt-2 leading-tight">
                {t('contact.title', 'Siap Berkolaborasi dengan PT. ASASORA BIO HEALTHORA?')}
              </h2>
            </div>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {t(
                'contact.subtitle',
                'Diskusikan kebutuhan katering korporat, nasi kotak/boks harian pabrik & kantor, paket prasmanan event, aneka makanan olahan/frozen siap saji, maupun aneka minuman segar bersama tim profesional Asasora.'
              )}
            </p>

            <div className="space-y-5 pt-2">
              {/* Alamat */}
              <div className="flex items-start space-x-4 text-gray-700 bg-white p-4 rounded-2xl border border-green-100 shadow-2xs">
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-[#2E6F40] shrink-0 border border-green-200">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-[#2E6F40] text-sm sm:text-base">
                    {t('contact.address_label', 'Alamat Kantor')}
                  </h5>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-0.5" id="disp-address">
                    {company.address}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4 text-gray-700 bg-white p-4 rounded-2xl border border-green-100 shadow-2xs">
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-[#2E6F40] shrink-0 border border-green-200">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-[#2E6F40] text-sm sm:text-base">
                    {t('contact.email_label', 'Email Resmi')}
                  </h5>
                  <p className="text-xs sm:text-sm text-gray-600" id="disp-email">
                    {company.email}
                  </p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center space-x-4 text-gray-700 bg-white p-4 rounded-2xl border border-green-100 shadow-2xs">
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-[#2E6F40] shrink-0 border border-green-200">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-[#2E6F40] text-sm sm:text-base">
                    {t('contact.wa_label', 'WhatsApp Customer Care (MinSora)')}
                  </h5>
                  <p className="text-xs sm:text-sm text-gray-600 font-mono font-bold" id="disp-wa">
                    {company.phone}
                  </p>
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="flex items-start space-x-4 text-gray-700 bg-white p-4 rounded-2xl border border-green-100 shadow-2xs">
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-[#2E6F40] shrink-0 border border-green-200 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="font-extrabold text-[#2E6F40] text-sm sm:text-base">
                    {t('contact.hours_label', 'Jam Operasional & Pengiriman')}
                  </h5>
                  <p className="text-xs sm:text-sm text-gray-800 font-semibold" id="disp-operational-hours">
                    {company.operationalHours ||
                      (lang === 'en'
                        ? 'Monday - Sunday (06:00 - 21:00 WIB)'
                        : 'Senin - Minggu (06.00 - 21.00 WIB)')}
                  </p>
                  {company.deliveryHours && (
                    <p className="text-[11px] sm:text-xs text-gray-500">
                      {lang === 'en' ? 'Delivery schedule: ' : 'Jadwal Pengiriman: '}
                      <span className="font-medium text-emerald-800">{company.deliveryHours}</span>
                    </p>
                  )}
                  {company.operationalNote && (
                    <p className="text-[11px] text-gray-500 italic mt-1">
                      * {company.operationalNote}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Consultation Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#2E6F40] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#4A9E60]" />
                <span>{t('contact.form_title', 'Kirim Pertanyaan / Penawaran')}</span>
              </h3>
              <MinsoraAvatar size="sm" showOnlineBadge={true} showWaBadge={true} />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t(
                'contact.form_subtitle',
                'Isi formulir singkat di bawah untuk terhubung langsung dengan MinSora Customer Care via WhatsApp.'
              )}
            </p>

            <form className="space-y-4 pt-2" onSubmit={handleSendInquiry}>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('contact.form_name_label', 'Nama Anda / Nama Perusahaan')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('contact.form_name_placeholder', 'Contoh: Ibu Rina / PT. Cipta Karya Gemilang')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('contact.form_topic_label', 'Pilihan Topik Kebutuhan Produk / Divisi')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#2E6F40] outline-none font-medium text-gray-800"
                >
                  <option value="catering_box">
                    🍱 {lang === 'en' ? 'Catering Division - Meal Box / Bento' : 'Divisi Catering (Asasora Catering) - Nasi Kotak / Nasi Boks'}
                  </option>
                  <option value="catering_buffet">
                    ✨ {lang === 'en' ? 'Catering Division - Buffet Package & Special Event' : 'Divisi Catering (Asasora Catering) - Paket Prasmanan & Acara Spesial'}
                  </option>
                  <option value="catering_snack">
                    🍛 {lang === 'en' ? 'Catering Division - Mini Tumpeng & Event Snack Box' : 'Divisi Catering (Asasora Catering) - Tumpeng Mini & Snack Box Event'}
                  </option>
                  <option value="frozen_food">
                    🍲 {lang === 'en' ? 'Processed & Frozen Food - Ready Meals (Frozen/Packed)' : 'Divisi Makanan Olahan & Frozen Food (Asasora Food) - Lauk Siap Saji (Frozen/Packed)'}
                  </option>
                  <option value="ready_to_eat">
                    🍚 {lang === 'en' ? 'Ready-to-Eat Food Division / Rice Bowl' : 'Divisi Makanan Siap Saji (Ready-to-Eat / Rice Bowl)'}
                  </option>
                  <option value="beverages">
                    🥤 {lang === 'en' ? 'Beverages Division' : 'Divisi Minuman (Beverages)'}
                  </option>
                  <option value="corporate_partnership">
                    🤝 {lang === 'en' ? 'Corporate Catering & Procurement Partnership (Offices/Factories)' : 'Kemitraan & Kerjasama Pengadaan Katering Rutin (Kantor/Pabrik/Instansi)'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('contact.form_msg_label', 'Pesan / Rincian Kebutuhan & Penawaran')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t(
                    'contact.form_msg_placeholder',
                    'Tuliskan tanggal pengiriman/acara, perkiraan jumlah porsi/pack, menu yang diminati, atau kebutuhan khusus lainnya...'
                  )}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#F3C623] hover:bg-[#D1A310] text-gray-900 font-extrabold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-95 border border-[#e5b719]"
              >
                <MinsoraAvatar size="xs" showWaBadge={false} />
                <span>{t('contact.form_btn_send', 'Kirim Pertanyaan / Penawaran ke WhatsApp MinSora')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

