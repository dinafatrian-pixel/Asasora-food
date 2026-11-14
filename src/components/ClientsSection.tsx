import React from 'react';
import { Building2, CheckCircle2 } from 'lucide-react';
import { ClientPartner } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedClient } from '../utils/translator';

interface ClientsSectionProps {
  clients: ClientPartner[];
}

export const ClientsSection: React.FC<ClientsSectionProps> = ({ clients }) => {
  const { t, lang } = useLanguage();

  return (
    <section className="py-16 sm:py-24 bg-[#F7F8F6] border-b border-stone-200" id="clients">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#0F5132] font-bold text-xs tracking-[0.14em] uppercase">
            {t('clients.tag', 'Mitra & Rekanan')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 mt-2 tracking-tight">
            {t('clients.title', 'Our Client')}
          </h2>
          <p className="text-stone-600 mt-4 text-sm sm:text-base leading-relaxed">
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
            const hasImageLogo =
              client.logo.startsWith('http') ||
              client.logo.startsWith('data:image') ||
              client.logo.startsWith('/');

            return (
              <div
                key={client.id}
                className="group card-hover bg-white rounded-xl p-6 border border-stone-200 hover:border-[#0F5132]/50 flex flex-col items-center text-center justify-between"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#F7F8F6] border border-stone-200 group-hover:border-[#0F5132]/40 flex items-center justify-center overflow-hidden mb-4 p-1.5 transition-colors">
                  {hasImageLogo ? (
                    <img
                      src={client.logo}
                      alt={client.name}
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-[#0F5132] transition-transform duration-200 group-hover:scale-105" strokeWidth={1.75} />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-stone-900 group-hover:text-[#0F5132] transition-colors text-xs sm:text-sm leading-snug">
                    {client.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {client.type}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 w-full flex items-center justify-center gap-1.5 text-[11px] text-[#0F5132] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
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
