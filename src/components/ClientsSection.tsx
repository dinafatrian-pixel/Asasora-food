import React from 'react';
import { ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';
import { ClientPartner } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedClient } from '../utils/translator';

interface ClientsSectionProps {
  clients: ClientPartner[];
}

export const ClientsSection: React.FC<ClientsSectionProps> = ({ clients }) => {
  const { t, lang } = useLanguage();

  return (
    <section className="py-16 sm:py-24 bg-[#F9FDF9] border-t border-green-100" id="clients">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#4A9E60] font-bold text-xs sm:text-sm tracking-widest uppercase">
            {t('clients.tag', 'Mitra & Rekanan')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2E6F40] mt-2">
            {t('clients.title', 'Our Client')}
          </h2>
          <div className="w-24 h-1.5 bg-[#F3C623] mx-auto mt-4 rounded-full" />
          <p className="text-gray-600 mt-4 text-sm sm:text-base leading-relaxed">
            {t(
              'clients.subtitle',
              'Berbagai instansi pemerintah, perusahaan korporat, fasilitas kesehatan, dan institusi pendidikan yang telah mempercayakan kebutuhan katering & penyediaan konsumsi higienis kepada PT. Asasora Bio Healthora.'
            )}
          </p>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" id="client-grid">
          {clients.map((rawClient) => {
            const client = getLocalizedClient(rawClient, lang);
            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-green-100 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center justify-between group hover:border-green-300"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-green-50/70 border border-green-100 flex items-center justify-center overflow-hidden mb-4 group-hover:scale-110 transition p-1">
                  {client.logo.startsWith('http') || client.logo.startsWith('data:image') ? (
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl">{client.logo}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">
                    {client.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {client.type}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 w-full flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{t('clients.verified', 'Mitra Terverifikasi')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

