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
  Sparkles,
  ExternalLink,
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

  // Helper to generate specific article direct URL
  const getArticleShareUrl = (art: Article) => {
    const identifier = art.slug || art.id;
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return `${baseUrl}?article=${encodeURIComponent(identifier)}#article-${encodeURIComponent(identifier)}`;
  };

  // Open specific article and update browser address bar so URL can be copied directly
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

  // Close article and clean URL parameter
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

  // Auto-detect and open specific article if URL contains ?article=... or #article-...
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

  // Derive unique categories
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
      className="py-16 sm:py-20 bg-gradient-to-b from-stone-50 via-white to-stone-50/70 border-t border-stone-200/70 relative scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#2E6F40] text-xs sm:text-sm font-extrabold mb-3 shadow-2xs">
            <BookOpen className="w-4 h-4 text-[#2E6F40]" />
            <span>{t('articles.badge', 'Edukasi & Wawasan Katering')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
            {t('articles.title', 'Artikel & Berita Seputar Katering')}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
            {t(
              'articles.subtitle',
              'Panduan praktis katering makan siang kantor, standar dapur higienis halal BPJPH, serta tips memilih nasi kotak seminar & event di Tangerang.'
            )}
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#2E6F40] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'id' ? 'Cari artikel atau topik...' : 'Search articles...'}
              className="w-full pl-9.5 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E6F40]/30 focus:border-[#2E6F40] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-2xs">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">
              {lang === 'id' ? 'Artikel tidak ditemukan' : 'No articles found'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
              {lang === 'id'
                ? 'Tidak ada artikel yang cocok dengan kata kunci atau kategori yang Anda pilih.'
                : 'No articles match your search query or selected category.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-emerald-50 text-[#2E6F40] text-xs font-bold rounded-xl hover:bg-emerald-100 transition"
            >
              {lang === 'id' ? 'Tampilkan Semua Artikel' : 'Show All Articles'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                id={`article-${article.slug || article.id}`}
                onClick={() => handleOpenArticle(article)}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 flex flex-col overflow-hidden group cursor-pointer scroll-mt-24"
              >
                {/* Image Cover */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="bg-[#2E6F40]/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                      {article.category}
                    </span>
                    {article.isFeatured && (
                      <span className="bg-[#F3C623] text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Pilihan</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium mb-2.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-700" />
                        {article.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {article.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[#2E6F40] transition-colors line-clamp-2 leading-snug mb-2">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Footer & Action */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2E6F40] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>{lang === 'id' ? 'Baca Selengkapnya' : 'Read More'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(article, e)}
                      title="Salin Link Spesifik Artikel"
                      className="px-2 py-1.5 text-xs font-bold text-gray-500 hover:text-[#2E6F40] hover:bg-emerald-50 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === article.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] text-emerald-700 font-extrabold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="text-[11px] text-gray-500 hover:text-emerald-700">Bagikan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-article-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={handleCloseArticle}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 sm:px-8 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-[#2E6F40] text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200/80">
                  {activeArticle.category}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-semibold text-gray-500">{activeArticle.readTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(activeArticle)}
                  className="px-3 py-1.5 bg-emerald-50 text-[#2E6F40] hover:bg-emerald-100 rounded-xl transition text-xs font-extrabold flex items-center gap-1.5 border border-emerald-200/80 cursor-pointer shadow-2xs"
                  title="Salin Link Spesifik Artikel"
                >
                  {copiedId === activeArticle.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Link Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleShareToWhatsApp(activeArticle)}
                  className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                  title="Bagikan Artikel ke WhatsApp"
                >
                  <Send className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleCloseArticle}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto px-5 sm:px-8 py-6 space-y-6">
              {/* Article Headline */}
              <div>
                <h1
                  id="modal-article-title"
                  className="text-xl sm:text-2xl sm:leading-tight font-black text-gray-900 tracking-tight"
                >
                  {activeArticle.title}
                </h1>

                {/* Author & Date metadata */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>{activeArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>{activeArticle.date}</span>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-stone-100 border border-gray-200">
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Lead Paragraph */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border-l-4 border-[#2E6F40] text-sm sm:text-base font-medium text-emerald-950 leading-relaxed">
                {activeArticle.excerpt}
              </div>

              {/* Formatted Article Content */}
              <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line font-sans">
                {activeArticle.content}
              </div>

              {/* Tags */}
              {activeArticle.tags && activeArticle.tags.length > 0 && (
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-bold text-gray-500">Kata Kunci:</span>
                  {activeArticle.tags.map((tg, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg"
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA Box inside Article */}
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-base sm:text-lg font-bold text-[#F3C623]">
                    Konsultasi Konsumsi Kantor dengan MinSora
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-100/90 max-w-md">
                    Dapatkan simulasi paket katering harian, nasi kotak seminar, atau menu prasmanan sesuai anggaran kantor Anda.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={(e) => handleShareToWhatsApp(activeArticle, e)}
                    className="flex-1 sm:flex-none bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer border border-emerald-500/40"
                    title="Bagikan artikel ini ke WhatsApp rekan atau grup"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan Artikel</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleConsultWhatsApp(activeArticle, e)}
                    className="flex-1 sm:flex-none bg-[#F3C623] hover:bg-[#D1A310] text-gray-900 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Tanya MinSora</span>
                  </button>

                  {onOpenOrderModal && (
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseArticle();
                        onOpenOrderModal();
                      }}
                      className="flex-1 sm:flex-none bg-white/15 hover:bg-white/25 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition border border-white/20 active:scale-95 cursor-pointer"
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
