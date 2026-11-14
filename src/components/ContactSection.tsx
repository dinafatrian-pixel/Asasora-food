import React, { useState } from 'react';
import { MapPin, Mail, Phone, MessageSquare, Clock, Navigation, ExternalLink } from 'lucide-react';
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
    <section className="py-16 sm:py-24 bg-white border-b border-stone-200" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Company Info */}
          <div className="space-y-6">
            <div>
              <span className="text-[#0F5132] font-bold text-xs tracking-[0.14em] uppercase">
                {t('contact.tag', 'Hubungi Kami')}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 mt-2 leading-tight tracking-tight">
                {t('contact.title', 'Siap Berkolaborasi dengan PT. ASASORA BIO HEALTHORA?')}
              </h2>
            </div>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {t(
                'contact.subtitle',
                'Diskusikan kebutuhan katering korporat, nasi kotak/boks harian pabrik & kantor, paket prasmanan event, aneka makanan olahan/frozen siap saji, maupun aneka minuman segar bersama tim profesional Asasora.'
              )}
            </p>

            <div className="space-y-4 pt-2">
              {/* Alamat */}
              <div className="flex items-start space-x-4 text-stone-700 bg-[#FAFBF9] p-5 rounded-xl border border-stone-200">
                <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center text-[#0F5132] shrink-0 border border-stone-200">
                  <MapPin className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                    {t('contact.address_label', 'Alamat Kantor & Dapur')}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1" id="disp-address">
                    {company.address}
                  </p>
                  <a
                    href={company.googleMapsUrl || 'https://maps.app.goo.gl/oKYoeRJDKYtfqWqQ9'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-2 bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>{lang === 'en' ? 'Directions on Google Maps' : 'Petunjuk Rute di Google Maps'}</span>
                    <ExternalLink className="w-3 h-3 opacity-80" strokeWidth={1.75} />
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4 text-stone-700 bg-[#FAFBF9] p-5 rounded-xl border border-stone-200">
                <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center text-[#0F5132] shrink-0 border border-stone-200">
                  <Mail className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                    {t('contact.email_label', 'Email Resmi')}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5" id="disp-email">
                    {company.email}
                  </p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center space-x-4 text-stone-700 bg-[#FAFBF9] p-5 rounded-xl border border-stone-200">
                <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center text-[#0F5132] shrink-0 border border-stone-200">
                  <Phone className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                    {t('contact.wa_label', 'WhatsApp Customer Care (MinSora)')}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-700 font-mono font-bold tabular-nums mt-0.5" id="disp-wa">
                    {company.phone}
                  </p>
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="flex items-start space-x-4 text-stone-700 bg-[#FAFBF9] p-5 rounded-xl border border-stone-200">
                <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center text-[#0F5132] shrink-0 border border-stone-200 mt-0.5">
                  <Clock className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                    {t('contact.hours_label', 'Jam Operasional & Pengiriman')}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-800 font-semibold" id="disp-operational-hours">
                    {company.operationalHours ||
                      (lang === 'en'
                        ? 'Monday - Sunday (06:00 - 21:00 WIB)'
                        : 'Senin - Minggu (06.00 - 21.00 WIB)')}
                  </p>
                  {company.deliveryHours && (
                    <p className="text-xs text-stone-500">
                      {lang === 'en' ? 'Delivery schedule: ' : 'Jadwal Pengiriman: '}
                      <span className="font-semibold text-[#0F5132]">{company.deliveryHours}</span>
                    </p>
                  )}
                  {company.operationalNote && (
                    <p className="text-xs text-stone-500 italic mt-1">
                      * {company.operationalNote}
                    </p>
                  )}
                </div>
              </div>

              {/* Google Maps Asasora Interactive Map Card */}
              <div className="bg-[#FAFBF9] p-4 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0F5132]" strokeWidth={1.75} />
                    <span className="font-bold text-xs sm:text-sm text-stone-900">
                      {lang === 'en' ? 'Google Maps Location' : 'Peta Lokasi Google Maps Asasora Food'}
                    </span>
                  </div>
                  <a
                    href={company.googleMapsUrl || 'https://maps.app.goo.gl/oKYoeRJDKYtfqWqQ9'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#0F5132] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{lang === 'en' ? 'View Large Map' : 'Perbesar Peta'}</span>
                    <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                  </a>
                </div>
                <div className="w-full h-44 sm:h-52 rounded-lg overflow-hidden border border-stone-200">
                  <iframe
                    title="Google Maps Lokasi ASASORA CATERING TANGERANG"
                    src="https://maps.google.com/maps?q=ASASORA+CATERING+TANGERANG@-6.1804031,106.6565954&hl=id&z=17&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Consultation Form */}
          <div className="bg-[#F7F8F6] p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-extrabold text-stone-900 flex items-center gap-2 tracking-tight">
                <MessageSquare className="w-5 h-5 text-[#0F5132]" strokeWidth={1.75} />
                <span>{t('contact.form_title', 'Kirim Pertanyaan / Penawaran')}</span>
              </h3>
              <MinsoraAvatar size="sm" showOnlineBadge={true} showWaBadge={true} />
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t(
                'contact.form_subtitle',
                'Isi formulir singkat di bawah untuk terhubung langsung dengan MinSora Customer Care via WhatsApp.'
              )}
            </p>

            <form className="space-y-4 pt-1" onSubmit={handleSendInquiry}>
              <div>
                <label htmlFor="contact-form-name" className="block text-xs font-bold text-stone-700 mb-1.5">
                  {t('contact.form_name_label', 'Nama Anda / Nama Perusahaan')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-form-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('contact.form_name_placeholder', 'Contoh: Ibu Rina / PT. Cipta Karya Gemilang')}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                />
              </div>

              <div>
                <label htmlFor="contact-form-topic" className="block text-xs font-bold text-stone-700 mb-1.5">
                  {t('contact.form_topic_label', 'Pilihan Topik Kebutuhan Produk / Divisi')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="contact-form-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none font-medium text-stone-800"
                >
                  <option value="catering_box">
                    {lang === 'en' ? 'Catering Division - Meal Box / Bento' : 'Divisi Catering (Asasora Catering) - Nasi Kotak / Nasi Boks'}
                  </option>
                  <option value="catering_buffet">
                    {lang === 'en' ? 'Catering Division - Buffet Package & Special Event' : 'Divisi Catering (Asasora Catering) - Paket Prasmanan & Acara Spesial'}
                  </option>
                  <option value="catering_snack">
                    {lang === 'en' ? 'Catering Division - Mini Tumpeng & Event Snack Box' : 'Divisi Catering (Asasora Catering) - Tumpeng Mini & Snack Box Event'}
                  </option>
                  <option value="frozen_food">
                    {lang === 'en' ? 'Processed & Frozen Food - Ready Meals (Frozen/Packed)' : 'Divisi Makanan Olahan & Frozen Food (Asasora Food) - Lauk Siap Saji (Frozen/Packed)'}
                  </option>
                  <option value="ready_to_eat">
                    {lang === 'en' ? 'Ready-to-Eat Food Division / Rice Bowl' : 'Divisi Makanan Siap Saji (Ready-to-Eat / Rice Bowl)'}
                  </option>
                  <option value="beverages">
                    {lang === 'en' ? 'Beverages Division' : 'Divisi Minuman (Beverages)'}
                  </option>
                  <option value="corporate_partnership">
                    {lang === 'en' ? 'Corporate Catering & Procurement Partnership (Offices/Factories)' : 'Kemitraan & Kerjasama Pengadaan Katering Rutin (Kantor/Pabrik/Instansi)'}
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-form-message" className="block text-xs font-bold text-stone-700 mb-1.5">
                  {t('contact.form_msg_label', 'Pesan / Rincian Kebutuhan & Penawaran')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-form-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t(
                    'contact.form_msg_placeholder',
                    'Tuliskan tanggal pengiriman/acara, perkiraan jumlah porsi/pack, menu yang diminati, atau kebutuhan khusus lainnya...'
                  )}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#F3C623] hover:bg-[#D9AE14] text-stone-900 font-bold py-3.5 px-4 rounded-lg border border-[#D9AE14] transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
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
