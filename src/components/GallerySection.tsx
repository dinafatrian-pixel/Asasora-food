import React, { useState } from 'react';
import { Camera, X, Eye, Utensils, Building2, Package, ShieldCheck } from 'lucide-react';
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
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const filterTabs = [
    { id: 'all', label: t('gallery.tab_all', 'Semua Dokumentasi'), icon: Camera },
    { id: 'dapur', label: t('gallery.tab_kitchen', 'Dapur & Sanitasi'), icon: Utensils },
    { id: 'event', label: t('gallery.tab_event', 'Event Perusahaan'), icon: Building2 },
    { id: 'olahan', label: t('gallery.tab_frozen', 'Olahan & Frozen'), icon: Package },
    { id: 'sertifikasi', label: 'Sertifikasi & Mutu', icon: ShieldCheck },
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
    <section className="py-16 sm:py-24 bg-[#F7F8F6] border-b border-stone-200" id="galery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-[#0F5132] font-bold text-xs tracking-[0.14em] uppercase">
            {t('gallery.tag', 'Dokumentasi & Aktivitas')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 mt-2 tracking-tight">
            {t('gallery.title', 'Galeri Perusahaan')}
          </h2>
          <p className="text-stone-600 mt-3 text-sm sm:text-base leading-relaxed">
            {t(
              'gallery.subtitle',
              'Potret kegiatan Asasora Catering, standar kebersihan dapur halal, penyiapan makanan olahan higienis, dan dokumentasi event korporat.'
            )}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`btn-micro px-4 py-2 rounded-lg text-xs sm:text-sm font-bold cursor-pointer inline-flex items-center gap-2 border ${
                  activeFilter === tab.id
                    ? 'bg-[#0F5132] text-white border-[#0F5132]'
                    : 'bg-white text-stone-700 hover:bg-stone-50 hover:border-[#0F5132]/40 border-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="gallery-grid">
          {filteredGallery.map((rawItem) => {
            const item = getLocalizedGallery(rawItem, lang);
            const isImgLoaded = !!loadedImages[item.id];
            return (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="card-hover group relative rounded-xl overflow-hidden cursor-pointer bg-stone-100 border border-stone-200"
              >
                <div className={`aspect-[4/3] w-full overflow-hidden ${!isImgLoaded ? 'skeleton-shimmer' : 'bg-stone-100'}`}>
                  <img
                    src={item.image || item.imageUrl}
                    alt={item.title}
                    width={400}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoadedImages((prev) => ({ ...prev, [item.id]: true }))}
                    onError={() => setLoadedImages((prev) => ({ ...prev, [item.id]: true }))}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-[transform,opacity] duration-500 ${
                      isImgLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                {/* Hover overlay with caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/35 to-transparent opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-end text-white">
                  <div className="flex items-center gap-1.5 text-xs text-[#F3C623] font-bold mb-1">
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>{t('gallery.view_detail', 'Lihat Detail Foto')}</span>
                  </div>
                  <h3 className="font-bold text-base leading-snug">{item.title}</h3>
                  <p className="text-xs text-stone-200 mt-1 line-clamp-2">{item.caption}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-stone-950/75 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full relative border border-stone-300 animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="btn-icon-only btn-micro absolute top-4 right-4 z-10 bg-stone-900/80 hover:bg-stone-900 text-white w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border border-white/20"
                aria-label="Tutup foto"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>

              <div className="max-h-[65vh] bg-stone-950 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhoto.image || selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="max-h-[65vh] w-full object-contain"
                />
              </div>

              <div className="p-6 space-y-2 border-t border-stone-200">
                <h3 className="font-extrabold text-[#0F5132] text-lg sm:text-xl">
                  {selectedPhoto.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
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
