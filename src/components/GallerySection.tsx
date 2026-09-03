import React, { useState } from 'react';
import { Camera, X, ZoomIn, Eye, Sparkles } from 'lucide-react';
import { GalleryItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedGallery } from '../utils/translator';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery }) => {
  const { t, lang } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const filterTabs = [
    { id: 'all', label: t('gallery.tab_all', 'Semua Dokumentasi') },
    { id: 'dapur', label: t('gallery.tab_kitchen', '🍳 Dapur & Sanitasi') },
    { id: 'event', label: t('gallery.tab_event', '🏢 Even Perusahaan') },
    { id: 'olahan', label: t('gallery.tab_frozen', '🍲 Olahan & Frozen') },
    { id: 'sertifikasi', label: '📜 Sertifikasi & Mutu' },
  ];

  const filteredGallery = gallery.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'event') {
      return (
        item.category === 'event' ||
        item.category === 'even perusahaan' ||
        item.category === 'event-perusahaan'
      );
    }
    return item.category === activeFilter;
  });

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-green-100" id="galery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-[#4A9E60] font-bold text-xs sm:text-sm tracking-widest uppercase">
            {t('gallery.tag', 'Dokumentasi & Aktivitas')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2E6F40] mt-2">
            {t('gallery.title', 'Galeri Perusahaan')}
          </h2>
          <div className="w-24 h-1.5 bg-[#F3C623] mx-auto mt-4 rounded-full" />
          <p className="text-gray-600 mt-4 text-sm sm:text-base">
            {t(
              'gallery.subtitle',
              'Potret kegiatan Asasora Catering, standar kebersihan dapur halal, penyiapan makanan olahan higienis, dan dokumentasi event korporat.'
            )}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#2E6F40] text-white shadow-md'
                  : 'bg-[#F9FDF9] text-gray-700 hover:bg-green-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="gallery-grid">
          {filteredGallery.map((rawItem) => {
            const item = getLocalizedGallery(rawItem, lang);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer bg-gray-100 border border-green-100"
              >
                <div className="h-64 sm:h-72 w-full overflow-hidden">
                  <img
                    src={item.image || item.imageUrl}
                    alt={item.title}
                    width={400}
                    height={288}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>

                {/* Hover overlay with caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-end text-white">
                  <div className="flex items-center gap-1.5 text-xs text-[#F3C623] font-bold mb-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('gallery.view_detail', 'Lihat Detail Foto')}</span>
                  </div>
                  <h3 className="font-bold text-base leading-snug">{item.title}</h3>
                  <p className="text-xs text-gray-200 mt-1 line-clamp-2">{item.caption}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhoto.image || selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="max-h-[65vh] w-full object-contain"
                />
              </div>

              <div className="p-6 space-y-2">
                <h3 className="font-extrabold text-[#2E6F40] text-lg sm:text-xl">
                  {selectedPhoto.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {selectedPhoto.caption}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

