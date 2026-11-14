import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Check,
  Plus,
  Search,
  Share2,
  Link2,
  Flame,
  MessageCircle,
  CheckCircle2,
  Heart,
  X,
} from 'lucide-react';
import { Product, Order, CompanyInfo } from '../types';
import { formatRupiah } from '../utils/distance';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedProduct, translateText } from '../utils/translator';
import { syncManager } from '../utils/syncManager';
import { ProductCatalogSkeletonGrid } from './SkeletonShimmer';

/**
 * Konversi URL gambar ke format .webp terkompresi optimal
 */
export const getOptimizedWebpUrl = (url: string, width?: number): string => {
  if (!url) return '';
  if (url.includes('cloudinary.com')) {
    const transform = width ? `w_${width},c_limit,f_webp,q_auto:good` : 'f_webp,q_auto:good';
    return url
      .replace(/\/upload\/(?:[^\/]+\/)?/, `/upload/${transform}/`)
      .replace(/\.(png|jpe?g)$/i, '.webp');
  }
  return url.replace(/\.(png|jpe?g)$/i, '.webp');
};

interface ProductCatalogSectionProps {
  products: Product[];
  orders?: Order[];
  company?: CompanyInfo;
  isLoading?: boolean;
  onAddToCart: (product: Product, quantity?: number) => void;
  onInstantCheckout: (product: Product) => void;
  onOpenOrderModal?: () => void;
}

export const ProductCatalogSection: React.FC<ProductCatalogSectionProps> = ({
  products,
  orders = [],
  company,
  isLoading = false,
  onAddToCart,
  onInstantCheckout,
  onOpenOrderModal,
}) => {
  const { t, lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Likes state stored in localStorage for user persistence
  const [likedProductIds, setLikedProductIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('asasora_liked_products');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Base like counts synced with product objects or defaults
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {
      'prod-1': 148,
      'prod-2': 94,
      'prod-3': 72,
      'prod-nmk-1': 86,
      'prod-nmk-2': 65,
      'prod-4': 112,
      'prod-1788335918404': 230,
    };
    return initial;
  });

  // Dynamic SEO meta description for Product Catalog section
  useEffect(() => {
    const catalogDescription =
      'Katalog lengkap Asasora Catering: Nasi box daun jeruk, nasi kotak premium & ekonomis Tangerang mulai Rp20.000. 100% Halal Resmi BPJPH. Pesan sekarang!';

    const updateMetaTags = () => {
      const isCatalogActive =
        typeof window !== 'undefined' &&
        (window.location.hash.toLowerCase().includes('katalog') ||
          window.location.hash.toLowerCase().includes('catalog') ||
          window.location.pathname.toLowerCase().includes('katalog') ||
          window.location.pathname.toLowerCase().includes('catalog'));

      if (isCatalogActive) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', catalogDescription);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', catalogDescription);
        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.setAttribute('content', catalogDescription);
      }
    };

    updateMetaTags();
    window.addEventListener('hashchange', updateMetaTags);
    window.addEventListener('popstate', updateMetaTags);
    return () => {
      window.removeEventListener('hashchange', updateMetaTags);
      window.removeEventListener('popstate', updateMetaTags);
    };
  }, []);

  // Keep like counts in sync whenever products prop updates from cloud/server
  useEffect(() => {
    if (Array.isArray(products)) {
      setLikeCounts((prev) => {
        const next = { ...prev };
        products.forEach((p) => {
          if (typeof p.likes === 'number') {
            next[p.id] = p.likes;
          }
        });
        return next;
      });
    }
  }, [products]);

  // Toggle Like with immediate feedback, toast, and ONLINE CLOUD SYNC
  const handleToggleLike = async (e: React.MouseEvent, productId: string, productName: string) => {
    e.stopPropagation();
    e.preventDefault();

    const isCurrentlyLiked = !likedProductIds[productId];
    const newStatus = isCurrentlyLiked;

    const newLiked = {
      ...likedProductIds,
      [productId]: newStatus,
    };
    setLikedProductIds(newLiked);
    try {
      localStorage.setItem('asasora_liked_products', JSON.stringify(newLiked));
    } catch (err) {
      console.error('Failed to save liked state', err);
    }

    const currentCount = likeCounts[productId] ?? 50;
    const optimisticCount = newStatus ? currentCount + 1 : Math.max(0, currentCount - 1);
    setLikeCounts((prev) => ({
      ...prev,
      [productId]: optimisticCount,
    }));

    setToastNotification(
      newStatus
        ? lang === 'en'
          ? `Added "${productName}" to favorites`
          : `Anda menyukai "${productName}"`
        : lang === 'en'
          ? `Removed "${productName}" from favorites`
          : `Batal menyukai "${productName}"`
    );
    setTimeout(() => {
      setToastNotification(null);
    }, 2000);

    try {
      const serverLikes = await syncManager.toggleProductLike(productId, newStatus);
      if (typeof serverLikes === 'number') {
        setLikeCounts((prev) => ({
          ...prev,
          [productId]: serverLikes,
        }));
      }
    } catch (err) {
      console.warn('Could not sync like to cloud:', err);
    }
  };

  // Categories definition matching requested categories
  const categories = React.useMemo(() => {
    const defaultCategories = [
      { id: 'all', label: t('catalog.cat_all', 'Semua Produk') },
      { id: 'catering & event', label: lang === 'en' ? 'Catering & Events' : 'Catering & Event' },
      { id: 'Produk Siap Santap', label: lang === 'en' ? 'Ready-to-Eat Products' : 'Produk Siap Santap' },
      { id: 'Snak dan cemilan', label: lang === 'en' ? 'Snacks & Refreshments' : 'Snack & Cemilan' },
    ];

    const extraCategories: { id: string; label: string }[] = [];
    products.forEach((p) => {
      const cat = p.category?.trim();
      if (
        cat &&
        !defaultCategories.some(
          (d) => d.id.toLowerCase() === cat.toLowerCase()
        ) &&
        !extraCategories.some(
          (e) => e.id.toLowerCase() === cat.toLowerCase()
        )
      ) {
        extraCategories.push({
          id: cat,
          label: translateText(cat, lang),
        });
      }
    });

    return [...defaultCategories, ...extraCategories];
  }, [products, t, lang]);

  // Calculate sold count for each product from orders
  const getProductSoldCount = (productId: string, productName: string) => {
    if (!orders || orders.length === 0) return 0;
    return orders.reduce((sum, ord) => {
      if (ord.status === 'Dibatalkan') return sum;
      const matched =
        ord.items?.filter(
          (it) =>
            it.productId === productId ||
            it.name.trim().toLowerCase() === productName.trim().toLowerCase()
        ) || [];
      const qty = matched.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
      return sum + qty;
    }, 0);
  };

  // Generate direct link pointing specifically to this product
  const getProductShareUrl = (productId: string) => {
    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    return `${baseUrl}?product=${encodeURIComponent(productId)}#product-${encodeURIComponent(productId)}`;
  };

  // Scroll smoothly to target product card
  const scrollToTargetProduct = (targetId: string) => {
    setSelectedCategory('all');
    setSearchQuery('');
    setHighlightedProductId(targetId);

    const attemptScroll = () => {
      const cardEl =
        document.getElementById(`product-${targetId}`) ||
        document.getElementById(`card-${targetId}`) ||
        document.getElementById(targetId);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
      return false;
    };

    setTimeout(() => {
      if (!attemptScroll()) {
        setTimeout(attemptScroll, 300);
      }
    }, 120);
  };

  const getProductAltText = (prod: Product): string => {
    if (prod.altText && prod.altText.trim().length > 0) {
      return prod.altText;
    }
    const id = prod.id.toLowerCase();
    const name = prod.name.toLowerCase();
    if (id === 'prod-1' || name.includes('kotak premium')) {
      return 'Paket Nasi Kotak Premium Tangerang - Asasora Catering Sajian Prasmanan Hajatan Berlisensi Halal';
    }
    if (id === 'prod-2' || name.includes('kotak ekonomis')) {
      return 'Nasi Kotak Ekonomis Tangerang - Catering Nasi Box Murah untuk Acara Kantor dan Syukuran';
    }
    if (id === 'prod-3' || name.includes('daun jeruk')) {
      return 'Paket Nasi Box Daun Jeruk NaSemangkuk Tangerang - Menu Rice Bowl Unik Asasora Food';
    }
    if (id === 'prod-nmk-1' || name.includes('bento')) {
      return 'Nasi Bento NaSemangkuk Tangerang - Catering Nasi Kotak Modern dengan Olahan Ayam Higienis';
    }
    return `${prod.name} Tangerang - Katering Halal BPJPH Asasora Food`;
  };

  // Handle direct WhatsApp share
  const handleShareWhatsApp = (product: Product) => {
    const shareUrl = getProductShareUrl(product.id);
    const companyName = company?.name || 'PT. ASASORA';
    const text = `Halo! Saya merekomendasikan produk halal & higienis dari *${companyName}*:\n\n*${product.name}*\nHarga: ${formatRupiah(product.price)} / ${product.unit}\nDeskripsi: ${product.description}\n\nBuka & Pesan Langsung di Sini:\n${shareUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const fallbackCopyText = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.error('Fallback copy failed', e);
    }
    document.body.removeChild(el);
  };

  const handleCopyLink = (product: Product) => {
    const shareUrl = getProductShareUrl(product.id);
    const triggerSuccess = () => {
      setCopiedProductId(product.id);
      setToastNotification(
        lang === 'en'
          ? `Product link "${product.name}" copied to clipboard!`
          : `Link produk "${product.name}" berhasil disalin!`
      );
      scrollToTargetProduct(product.id);
      setTimeout(() => setCopiedProductId(null), 2500);
      setTimeout(() => setToastNotification(null), 3500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(triggerSuccess)
        .catch(() => {
          fallbackCopyText(shareUrl);
          triggerSuccess();
        });
    } else {
      fallbackCopyText(shareUrl);
      triggerSuccess();
    }
  };

  useEffect(() => {
    const checkUrlForProduct = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        let targetId = urlParams.get('product');

        if (!targetId && window.location.hash) {
          const hashClean = window.location.hash.replace(/^#/, '');
          if (hashClean.startsWith('product-')) {
            targetId = hashClean.replace('product-', '');
          } else if (hashClean.startsWith('card-')) {
            targetId = hashClean.replace('card-', '');
          } else if (products.some((p) => p.id === hashClean)) {
            targetId = hashClean;
          }
        }

        if (targetId) {
          const productExists = products.some((p) => p.id === targetId);
          if (productExists) {
            setTimeout(() => {
              scrollToTargetProduct(targetId as string);
            }, 300);
          }
        }
      } catch (err) {
        console.error('Error parsing product url parameter', err);
      }
    };

    checkUrlForProduct();
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const prodCat = (product.category || '').toLowerCase();
    const selCat = selectedCategory.toLowerCase();

    let matchesCategory = selectedCategory === 'all';
    if (!matchesCategory) {
      if (prodCat === selCat) {
        matchesCategory = true;
      } else if (
        selCat === 'catering & event' &&
        (prodCat === 'catering' || prodCat === 'paket')
      ) {
        matchesCategory = true;
      } else if (
        selCat === 'produk siap santap' &&
        (prodCat === 'olahan' || prodCat === 'siap-santap')
      ) {
        matchesCategory = true;
      } else if (
        selCat === 'snak dan cemilan' &&
        (prodCat === 'snack' || prodCat === 'minuman' || prodCat === 'snack & cemilan')
      ) {
        matchesCategory = true;
      }
    }

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddWithFeedback = (product: Product) => {
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  return (
    <section id="katalog" className="py-16 sm:py-24 bg-white border-b border-stone-200 relative">
      {/* Toast Floating Notification */}
      {toastNotification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#0F5132] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-[#0b3d26] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#F3C623]" strokeWidth={1.75} />
          <span>{toastNotification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#0F5132] text-xs font-bold uppercase tracking-[0.14em]">
            {t('catalog.tag', 'Katalog Resmi')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 mt-2 tracking-tight">
            {t('catalog.title', 'Pilihan Produk')}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            {t(
              'catalog.subtitle',
              'Setiap hidangan diolah dari bahan segar pilihan, dijamin 100% Halal BPJPH dan diproses dengan standar higienis jasaboga.'
            )}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-start">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn-micro px-4 py-2 rounded-lg text-xs sm:text-sm font-bold cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-[#0F5132] text-white border-[#0F5132]'
                    : 'bg-[#FAFBF9] text-stone-700 hover:bg-stone-100 hover:border-stone-300 border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input with Explicit Accessible Label */}
          <div className="w-full md:w-80">
            <div className="relative w-full group/search">
              <label htmlFor="catalog-search" className="sr-only">
                {t('catalog.search_placeholder', 'Cari produk katering atau camilan...')}
              </label>
              <input
                id="catalog-search"
                type="text"
                placeholder={t('catalog.search_placeholder', 'Cari produk katering atau camilan...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-[#FAFBF9] border border-stone-200 rounded-lg text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5132]/30 focus:border-[#0F5132] transition-all duration-150"
              />
              <Search
                className="w-4 h-4 text-stone-400 group-focus-within/search:text-[#0F5132] group-focus-within/search:scale-110 transition-all duration-150 absolute left-3.5 top-3"
                strokeWidth={1.75}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="btn-micro btn-icon-only absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid Wrapped with Minimum Height & Contain Intrinsic Size */}
        <div
          className="product-catalog-grid-wrap min-h-[520px] w-full"
          style={{ minHeight: '520px', containIntrinsicSize: 'auto 520px' }}
        >
          {isLoading ? (
            <ProductCatalogSkeletonGrid count={8} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((rawProduct) => {
                const product = getLocalizedProduct(rawProduct, lang);
                const isAdded = addedProductId === product.id;
                const isCopied = copiedProductId === product.id;
                const isHighlighted = highlightedProductId === product.id;
                const soldCount = getProductSoldCount(product.id, rawProduct.name);
                const isLiked = !!likedProductIds[product.id];
                const productLikes = likeCounts[product.id] ?? 50;
                const isImageLoaded = !!loadedImages[product.id];

                return (
                  <div
                    key={product.id}
                    id={`product-${product.id}`}
                    className={`card-hover bg-white rounded-xl overflow-hidden border flex flex-col group relative ${
                      isHighlighted
                        ? 'border-[#0F5132] ring-2 ring-[#0F5132]/30'
                        : 'border-stone-200 hover:border-[#0F5132]/50'
                    }`}
                  >
                    {/* Product Image & Badges (Rasio 1:1) with Skeleton Shimmer */}
                    <div
                      className="catalog-product-img-box relative aspect-square w-full overflow-hidden border-b border-stone-100 skeleton-shimmer"
                      style={{ aspectRatio: '1 / 1', minHeight: '260px' }}
                    >
                      <picture className="w-full h-full block">
                        <source
                          media="(max-width: 768px)"
                          srcSet={getOptimizedWebpUrl(product.image, 360)}
                          type="image/webp"
                        />
                        <source
                          media="(min-width: 769px)"
                          srcSet={getOptimizedWebpUrl(product.image, 600)}
                          type="image/webp"
                        />
                        <img
                          src={getOptimizedWebpUrl(product.image, 400)}
                          alt={getProductAltText(product)}
                          width={400}
                          height={400}
                          loading="lazy"
                          decoding="async"
                          onLoad={() =>
                            setLoadedImages((prev) =>
                              prev[product.id] ? prev : { ...prev, [product.id]: true }
                            )
                          }
                          onError={() =>
                            setLoadedImages((prev) =>
                              prev[product.id] ? prev : { ...prev, [product.id]: true }
                            )
                          }
                          style={{ aspectRatio: '1 / 1' }}
                          className={`w-full h-full object-cover group-hover:scale-[1.04] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            isImageLoaded ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </picture>

                      {/* Halal Badge */}
                      <span className="absolute top-2.5 left-2.5 bg-[#0F5132] text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 border border-[#0b3d26] z-10">
                        <Check className="w-3 h-3 text-[#F3C623]" strokeWidth={2.5} />
                        <span>{t('catalog.badge_halal', 'Halal BPJPH')}</span>
                      </span>

                      {/* Top Right Badges: Terjual Count & Tombol Like Hati */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                        {soldCount > 0 && (
                          <span className="bg-[#F3C623] text-stone-900 text-[10px] font-extrabold px-2 py-1 rounded-md flex items-center gap-1 border border-[#D9AE14] tabular-nums">
                            <Flame className="w-3 h-3 text-stone-900" strokeWidth={2} />
                            <span>{soldCount} {t('catalog.sold', 'Terjual')}</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleToggleLike(e, product.id, product.name)}
                          aria-label={isLiked ? t('catalog.liked', 'Disukai') : t('catalog.like', 'Suka')}
                          title={isLiked ? `${t('catalog.liked', 'Disukai')} (${productLikes})` : `${t('catalog.like', 'Suka')} (${productLikes})`}
                          className={`group/like btn-micro flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer select-none border tabular-nums ${
                            isLiked
                              ? 'bg-rose-600 text-white border-rose-700'
                              : 'bg-white hover:bg-stone-50 text-stone-700 hover:text-rose-600 border-stone-200'
                          }`}
                        >
                          <Heart
                            className={`w-3 h-3 transition-transform duration-150 group-hover/like:scale-125 group-active/like:scale-90 ${
                              isLiked
                                ? 'text-white fill-white'
                                : 'text-rose-500'
                            }`}
                            strokeWidth={1.75}
                          />
                          <span>{productLikes}</span>
                        </button>
                      </div>
                    </div>

                    {/* Product Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-bold text-stone-900 text-sm sm:text-base group-hover:text-[#0F5132] transition-colors duration-200 leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed whitespace-pre-line">
                          {product.description}
                        </p>
                      </div>

                      <div>
                        <div className="text-[11px] text-stone-500 font-medium">{t('catalog.price_label', 'Harga Menu')}</div>
                        <div className="text-base sm:text-lg font-extrabold text-[#0F5132] tabular-nums">
                          {formatRupiah(product.price)}{' '}
                          <span className="text-xs font-normal text-stone-500">
                            / {product.unit}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Tambah ke Keranjang & Order Cepat */}
                      <div className="pt-1 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddWithFeedback(rawProduct)}
                          className={`group/add btn-micro w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer border ${
                            isAdded
                              ? 'bg-emerald-700 text-white border-emerald-800'
                              : 'bg-[#0F5132] hover:bg-[#0b3d26] text-white border-[#0b3d26]'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 transition-transform duration-150 scale-110" strokeWidth={2} />
                              <span>{t('catalog.btn_added', 'Ditambahkan!')}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 transition-transform duration-200 group-hover/add:rotate-90" strokeWidth={2} />
                              <span>{t('catalog.btn_add_cart', 'Keranjang')}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onInstantCheckout(rawProduct)}
                          className="group/buy btn-micro w-full bg-[#F3C623] hover:bg-[#D9AE14] text-stone-900 font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 border border-[#D9AE14] cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-stone-900 transition-transform duration-150 group-hover/buy:translate-x-0.5" strokeWidth={1.75} />
                          <span>{t('catalog.btn_order_now', 'Pesan Sekarang')}</span>
                        </button>
                      </div>

                      {/* Secondary Share Action Bar: Share WhatsApp & Copy Link */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                          <Share2 className="w-3 h-3 text-stone-400" strokeWidth={1.75} />
                          <span>{t('catalog.share_label', 'Bagikan')}:</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleShareWhatsApp(rawProduct)}
                            className="group/wa btn-micro inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#F7F8F6] hover:bg-stone-100 text-[#0F5132] text-[11px] font-semibold rounded-md border border-stone-200 cursor-pointer"
                            title="Bagikan produk ini via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#0F5132] transition-transform duration-150 group-hover/wa:scale-110" strokeWidth={1.75} />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyLink(rawProduct)}
                            className={`group/copy btn-micro inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-md border cursor-pointer ${
                              isCopied
                                ? 'bg-[#0F5132] text-white border-[#0F5132]'
                                : 'bg-[#F7F8F6] hover:bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                            title="Salin link langsung ke produk ini"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#F3C623]" strokeWidth={2} />
                                <span>{t('catalog.btn_copied', 'Tersalin!')}</span>
                              </>
                            ) : (
                              <>
                                <Link2 className="w-3.5 h-3.5 text-stone-500 transition-transform duration-150 group-hover/copy:rotate-[-10deg]" strokeWidth={1.75} />
                                <span>{t('catalog.btn_copy_link', 'Salin Link')}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-[#FAFBF9] rounded-2xl border border-stone-200 p-8 max-w-md mx-auto mt-6">
            <div className="w-12 h-12 bg-white border border-stone-200 text-[#0F5132] rounded-xl flex items-center justify-center mx-auto mb-3 text-lg font-bold">
              <Search className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h4 className="font-bold text-stone-900 text-base">
              {t('catalog.not_found', 'Produk tidak ditemukan')}
            </h4>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              {t('catalog.not_found_sub', 'Coba cari dengan kata kunci lain atau pilih kategori "Semua Produk".')}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="btn-micro bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
            >
              {t('catalog.reset_filter', 'Reset Filter')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
