import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Share2,
  Check,
  X,
  Search,
  MessageCircle,
  Tag,
  Send,
} from 'lucide-react';
import { Article, CompanyInfo } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ArticlesSectionProps {
  articles: Article[];
  company: CompanyInfo;
  onOpenOrderModal?: () => void;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({
  articles,
  company,
  onOpenOrderModal,
}) => {
  const { lang, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const getArticleShareUrl = (art: Article) => {
    const identifier = art.slug || art.id;
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return `${baseUrl}?article=${encodeURIComponent(identifier)}#article-${encodeURIComponent(identifier)}`;
  };

  const handleOpenArticle = (art: Article) => {
    setActiveArticle(art);
    try {
      const identifier = art.slug || art.id;
      const url = new URL(window.location.href);
      url.searchParams.set('article', identifier);
      url.hash = `article-${identifier}`;
      window.history.pushState({ articleId: art.id }, '', url.toString());
    } catch {
      // Sandbox fallback
    }
  };

  const handleCloseArticle = () => {
    setActiveArticle(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('article');
      url.hash = 'articles';
      window.history.replaceState(null, '', url.toString());
    } catch {
      // Sandbox fallback
    }
  };

  useEffect(() => {
    const detectArticleFromUrl = () => {
      try {
        if (!articles || articles.length === 0) return;

        const urlParams = new URLSearchParams(window.location.search);
        const articleParam = urlParams.get('article');
        const rawHash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';

        let targetKey: string | null = null;
        if (articleParam) {
          targetKey = decodeURIComponent(articleParam).trim().toLowerCase();
        } else if (rawHash.startsWith('article-')) {
          targetKey = decodeURIComponent(rawHash.replace(/^article-/, '')).trim().toLowerCase();
        } else if (rawHash.startsWith('art-')) {
          targetKey = decodeURIComponent(rawHash).trim().toLowerCase();
        }

        if (targetKey) {
          const match = articles.find((a) => {
            const s = (a.slug || '').toLowerCase();
            const id = (a.id || '').toLowerCase();
            return (
              s === targetKey ||
              id === targetKey ||
              s.includes(targetKey) ||
              id.includes(targetKey)
            );
          });

          if (match) {
            setActiveArticle(match);
            setTimeout(() => {
              const el =
                document.getElementById(`article-${match.slug || match.id}`) ||
                document.getElementById('articles');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 300);
          }
        }
      } catch (err) {
        console.warn('Error detecting article from URL:', err);
      }
    };

    detectArticleFromUrl();
    window.addEventListener('popstate', detectArticleFromUrl);
    window.addEventListener('hashchange', detectArticleFromUrl);

    return () => {
      window.removeEventListener('popstate', detectArticleFromUrl);
      window.removeEventListener('hashchange', detectArticleFromUrl);
    };
  }, [articles]);

  const categories = [
    { id: 'all', label: lang === 'id' ? 'Semua Artikel' : 'All Articles' },
    { id: 'Event', label: 'Event' },
    { id: 'Tips & resep', label: lang === 'id' ? 'Tips & Resep' : 'Tips & Recipes' },
    { id: 'Kuliner nusantara', label: lang === 'id' ? 'Kuliner Nusantara' : 'Indonesian Cuisine' },
    { id: 'Info & pengumuman', label: lang === 'id' ? 'Info & Pengumuman' : 'Info & News' },
  ];

  const filteredArticles = articles.filter((art) => {
    const artCat = (art.category || '').toLowerCase();
    const selCat = selectedCategory.toLowerCase();
    const matchesCategory =
      selectedCategory === 'all' ||
      artCat === selCat ||
      (selectedCategory === 'Event' && artCat.includes('event')) ||
      (selectedCategory === 'Tips & resep' && (artCat.includes('tips') || artCat.includes('katering kantor'))) ||
      (selectedCategory === 'Kuliner nusantara' && artCat.includes('nusantara')) ||
      (selectedCategory === 'Info & pengumuman' && (artCat.includes('info') || artCat.includes('higien')));
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      art.title.toLowerCase().includes(query) ||
      art.excerpt.toLowerCase().includes(query) ||
      (art.tags && art.tags.some((t) => t.toLowerCase().includes(query)));
    return matchesCategory && matchesQuery;
  });

  const handleCopyLink = async (art: Article, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getArticleShareUrl(art);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(art.id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShareToWhatsApp = (art: Article, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getArticleShareUrl(art);
    const text = `*${art.title}*\n\n${art.excerpt}\n\nBaca artikel selengkapnya di Asasora Food:\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleConsultWhatsApp = (art: Article, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getArticleShareUrl(art);
    const message = `Halo MinSora, saya membaca artikel "${art.title}" di website Asasora Food: ${url}. Saya ingin konsultasi katering kantor kami.`;
    window.open(`https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section
      id="articles"
      aria-label="Artikel & Berita Katering Asasora"
      className="py-16 sm:py-24 bg-white border-b border-stone-200 relative scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#0F5132] text-xs font-bold uppercase tracking-[0.14em]">
            {t('articles.badge', 'Edukasi & Wawasan Katering')}
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 mt-2 tracking-tight">
            {t('articles.title', 'Artikel & Berita Seputar Katering')}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            {t(
              'articles.subtitle',
              'Panduan praktis katering makan siang kantor, standar dapur higienis halal BPJPH, serta tips memilih nasi kotak seminar & event di Tangerang.'
            )}
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn-micro px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-[#0F5132] text-white border-[#0F5132]'
                    : 'bg-[#FAFBF9] text-stone-700 hover:bg-stone-100 hover:border-[#0F5132]/40 border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72 shrink-0 group">
            <Search className="w-4 h-4 text-stone-400 group-focus-within:text-[#0F5132] group-focus-within:scale-110 transition-all duration-200 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'id' ? 'Cari artikel atau topik...' : 'Search articles...'}
              className="w-full pl-9.5 pr-8 py-2 bg-[#FAFBF9] border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn-icon-only absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer transition-transform active:scale-90"
                aria-label="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-[#FAFBF9] rounded-2xl border border-stone-200 p-8">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" strokeWidth={1.75} />
            <h3 className="text-base font-bold text-stone-900">
              {lang === 'id' ? 'Artikel tidak ditemukan' : 'No articles found'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
              {lang === 'id'
                ? 'Tidak ada artikel yang cocok dengan kata kunci atau kategori yang Anda pilih.'
                : 'No articles match your search query or selected category.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#0F5132] text-white text-xs font-bold rounded-lg hover:bg-[#0b3d26] transition-colors cursor-pointer"
            >
              {lang === 'id' ? 'Tampilkan Semua Artikel' : 'Show All Articles'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArticles.map((article) => {
              const isImgLoaded = !!loadedImages[article.id];
              return (
              <article
                key={article.id}
                id={`article-${article.slug || article.id}`}
                onClick={() => handleOpenArticle(article)}
                className="card-hover bg-white rounded-xl border border-stone-200 flex flex-col overflow-hidden group cursor-pointer scroll-mt-24"
              >
                {/* Image Cover */}
                <div className={`relative aspect-[16/10] overflow-hidden border-b border-stone-100 ${!isImgLoaded ? 'skeleton-shimmer' : 'bg-stone-100'}`}>
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoadedImages((prev) => ({ ...prev, [article.id]: true }))}
                    onError={() => setLoadedImages((prev) => ({ ...prev, [article.id]: true }))}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-[transform,opacity] duration-300 ${
                      isImgLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="bg-[#0F5132] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {article.category}
                    </span>
                    {article.isFeatured && (
                      <span className="bg-[#F3C623] text-stone-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-[#D9AE14]">
                        Pilihan
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Quiet Typographic Meta Info */}
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium mb-2.5">
                      <span>{article.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.readTime}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-[#0F5132] transition-colors line-clamp-2 leading-snug mb-2">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Footer & Action */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F5132] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>{lang === 'id' ? 'Baca Selengkapnya' : 'Read More'}</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(article, e)}
                      title="Salin Link Spesifik Artikel"
                      className="btn-icon-only btn-micro px-2 py-1 text-xs font-semibold text-stone-500 hover:text-[#0F5132] hover:bg-stone-50 rounded-md flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === article.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={2} />
                          <span className="text-[11px] text-[#0F5132] font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          <span className="text-[11px]">Bagikan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-article-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 animate-in fade-in duration-150 overflow-y-auto"
          onClick={handleCloseArticle}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-2xl border border-stone-300 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="sticky top-0 bg-white px-5 sm:px-8 py-4 border-b border-stone-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                <span className="text-[#0F5132] font-bold uppercase tracking-wider">
                  {activeArticle.category}
                </span>
                <span className="text-stone-300" aria-hidden="true">·</span>
                <span>{activeArticle.readTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(activeArticle)}
                  className="px-3 py-1.5 bg-[#F7F8F6] text-[#0F5132] hover:bg-stone-100 rounded-lg transition-colors text-xs font-bold flex items-center gap-1.5 border border-stone-200 cursor-pointer"
                  title="Salin Link Spesifik Artikel"
                >
                  {copiedId === activeArticle.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={2} />
                      <span>Link Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleShareToWhatsApp(activeArticle)}
                  className="p-2 text-[#0F5132] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                  title="Bagikan Artikel ke WhatsApp"
                >
                  <Send className="w-4 h-4" strokeWidth={1.75} />
                </button>

                <button
                  type="button"
                  onClick={handleCloseArticle}
                  className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto px-5 sm:px-8 py-6 space-y-6">
              <div>
                <h2
                  id="modal-article-title"
                  className="text-xl sm:text-2xl sm:leading-tight font-black text-stone-900 tracking-tight"
                >
                  {activeArticle.title}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-500 border-b border-stone-200 pb-4">
                  <div className="flex items-center gap-1.5 font-semibold text-stone-700">
                    <User className="w-4 h-4 text-[#0F5132]" strokeWidth={1.75} />
                    <span>{activeArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-stone-500" strokeWidth={1.75} />
                    <span>{activeArticle.date}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden aspect-[16/9] bg-stone-100 border border-stone-200">
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Lead Paragraph (clean bordered summary block instead of border-l-4 cliché) */}
              <div className="p-5 bg-[#F7F8F6] rounded-xl border border-stone-200 text-sm sm:text-base font-medium text-stone-800 leading-relaxed">
                {activeArticle.excerpt}
              </div>

              {/* Formatted Article Content */}
              <div className="space-y-4 text-sm sm:text-base text-stone-700 leading-relaxed whitespace-pre-line font-sans">
                {activeArticle.content}
              </div>

              {/* Tags */}
              {activeArticle.tags && activeArticle.tags.length > 0 && (
                <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.75} />
                  <span className="text-xs font-bold text-stone-500">Kata Kunci:</span>
                  {activeArticle.tags.map((tg, i) => (
                    <span
                      key={i}
                      className="bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium px-2.5 py-1 rounded-md"
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA Box inside Article */}
              <div className="bg-[#0F5132] text-white rounded-xl p-6 border border-[#0b3d26] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-base sm:text-lg font-bold text-[#F3C623]">
                    Konsultasi Konsumsi Kantor dengan MinSora
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-200 max-w-md">
                    Dapatkan simulasi paket katering harian, nasi kotak seminar, atau menu prasmanan sesuai anggaran kantor Anda.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={(e) => handleShareToWhatsApp(activeArticle, e)}
                    className="btn-micro flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border border-white/25"
                    title="Bagikan artikel ini ke WhatsApp rekan atau grup"
                  >
                    <Share2 className="w-4 h-4" strokeWidth={1.75} />
                    <span>Bagikan Artikel</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleConsultWhatsApp(activeArticle, e)}
                    className="btn-micro flex-1 sm:flex-none bg-[#F3C623] hover:bg-[#D9AE14] text-stone-900 font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border border-[#D9AE14]"
                  >
                    <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                    <span>Tanya MinSora</span>
                  </button>

                  {onOpenOrderModal && (
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseArticle();
                        onOpenOrderModal();
                      }}
                      className="btn-micro flex-1 sm:flex-none bg-white hover:bg-stone-100 text-[#0F5132] font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm cursor-pointer"
                    >
                      Pesan Menu
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
