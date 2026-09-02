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
} from 'lucide-react';
import { Product, Order, CompanyInfo } from '../types';
import { formatRupiah } from '../utils/distance';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedProduct, translateText } from '../utils/translator';

interface ProductCatalogSectionProps {
  products: Product[];
  orders?: Order[];
  company?: CompanyInfo;
  onAddToCart: (product: Product, quantity?: number) => void;
  onInstantCheckout: (product: Product) => void;
  onOpenOrderModal?: () => void;
}

export const ProductCatalogSection: React.FC<ProductCatalogSectionProps> = ({
  products,
  orders = [],
  company,
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

  // Categories definition matching requested categories
  const categories = React.useMemo(() => {
    const defaultCategories = [
      { id: 'all', label: t('catalog.cat_all', 'Semua Produk') },
      { id: 'catering & event', label: lang === 'en' ? 'Catering & Events' : 'catering & event' },
      { id: 'Produk Siap Santap', label: lang === 'en' ? 'Ready-to-Eat Products' : 'Produk Siap Santap' },
      { id: 'Snak dan cemilan', label: lang === 'en' ? 'Snacks & Refreshments' : 'Snak dan cemilan' },
    ];

    // Add any extra custom categories that exist in products
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

  // Handle direct WhatsApp share
  const handleShareWhatsApp = (product: Product) => {
    const shareUrl = getProductShareUrl(product.id);
    const companyName = company?.name || 'PT. ASASORA';
    const text = `Halo! Saya merekomendasikan produk halal & higienis dari *${companyName}*:\n\n🍱 *${product.name}*\n💰 *Harga:* ${formatRupiah(product.price)} / ${product.unit}\n📋 *Deskripsi:* ${product.description}\n\n👉 *Buka & Pesan Langsung di Sini:*\n${shareUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Fallback copy implementation
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

  // Handle Copy Direct Link to Clipboard
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

  // Deep Link handling: automatically scroll & highlight shared product when page is opened via link
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
    <section id="katalog" className="py-16 sm:py-24 bg-green-50/40 relative">
      {/* Toast Floating Notification */}
      {toastNotification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#2E6F40] text-white px-5 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border-2 border-white animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-[#F3C623]" />
          <span>{toastNotification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="bg-[#F3C623]/25 text-yellow-900 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-[#F3C623]/40">
            {t('catalog.tag', 'Pilihan Produk')}
          </span>
          <h3 className="text-2xl sm:text-4xl font-black text-[#2E6F40] mt-3">
            {t('catalog.title', 'Pilihan Produk')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
            {t(
              'catalog.subtitle',
              'Setiap hidangan diolah dari bahan segar pilihan, dijamin 100% Halal BPJPH dan diproses dengan standar higienis jasaboga.'
            )}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-start">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition duration-200 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#2E6F40] text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full md:w-80">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('catalog.search_placeholder', 'Cari produk katering atau camilan...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6F40] shadow-2xs"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((rawProduct) => {
            const product = getLocalizedProduct(rawProduct, lang);
            const isAdded = addedProductId === product.id;
            const isCopied = copiedProductId === product.id;
            const isHighlighted = highlightedProductId === product.id;
            const soldCount = getProductSoldCount(product.id, rawProduct.name);

            return (
              <div
                key={product.id}
                id={`product-${product.id}`}
                className={`bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition duration-300 flex flex-col group relative ${
                  isHighlighted
                    ? 'border-[#2E6F40] ring-4 ring-emerald-300 shadow-xl'
                    : 'border-gray-200'
                }`}
              >
                {/* Product Image & Badges */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />

                  {/* Halal Badge */}
                  <span className="absolute top-2.5 left-2.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                    <span>✓</span> {t('catalog.badge_halal', 'Halal BPJPH')}
                  </span>

                  {/* Terjual Count Badge */}
                  {soldCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 bg-[#F3C623] text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-600 fill-red-600" />
                      <span>{soldCount} {t('catalog.sold', 'Terjual')}</span>
                    </span>
                  )}
                </div>

                {/* Product Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-sm sm:text-base line-clamp-1 group-hover:text-[#2E6F40] transition">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 font-semibold">{t('catalog.price_label', 'Harga Menu')}</div>
                    <div className="text-base sm:text-lg font-black text-[#2E6F40]">
                      {formatRupiah(product.price)}{' '}
                      <span className="text-[11px] font-normal text-gray-500">
                        / {product.unit}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: Tambah ke Keranjang & Order Cepat */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddWithFeedback(rawProduct)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#2E6F40] hover:bg-green-800 text-white shadow-xs'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('catalog.btn_added', 'Ditambahkan!')}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t('catalog.btn_add_cart', '+ Keranjang')}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onInstantCheckout(rawProduct)}
                      className="w-full bg-[#F3C623] hover:bg-[#D1A310] text-gray-900 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-xs transition cursor-pointer active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-green-900" />
                      <span>{t('catalog.btn_order_now', 'Pesan Sekarang')}</span>
                    </button>
                  </div>

                  {/* Secondary Share Action Bar: Share WhatsApp & Copy Link */}
                  <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                      <Share2 className="w-3 h-3 text-gray-400" />
                      <span>{t('catalog.share_label', 'Bagikan')}:</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(rawProduct)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 hover:border-emerald-300 transition cursor-pointer active:scale-95 shadow-2xs"
                        title="Bagikan produk ini via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyLink(rawProduct)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition cursor-pointer active:scale-95 shadow-2xs ${
                          isCopied
                            ? 'bg-[#2E6F40] text-white border-[#2E6F40]'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                        title="Salin link langsung ke produk ini"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#F3C623]" />
                            <span>{t('catalog.btn_copied', 'Tersalin!')}</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3.5 h-3.5 text-gray-500" />
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-green-100 p-8 max-w-md mx-auto">
            <div className="w-12 h-12 bg-green-100 text-[#2E6F40] rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              ?
            </div>
            <h4 className="font-bold text-gray-800 text-base">
              {t('catalog.not_found', 'Produk tidak ditemukan')}
            </h4>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              {t('catalog.not_found_sub', 'Coba cari dengan kata kunci lain atau pilih kategori "Semua Produk".')}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="bg-[#2E6F40] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              {t('catalog.reset_filter', 'Reset Filter')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
