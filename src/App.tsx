import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCatalogSection } from './components/ProductCatalogSection';
import { ClientsSection } from './components/ClientsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { GallerySection } from './components/GallerySection';
import { LegalitasSection } from './components/LegalitasSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

// Code Splitting & Dynamic Imports to drastically minimize initial JS payload (reduces FCP & eliminates Long Main-Thread Tasks)
const OrderFormSection = lazy(() =>
  import('./components/OrderFormSection').then((m) => ({ default: m.OrderFormSection }))
);
const AdminModal = lazy(() =>
  import('./components/AdminModal').then((m) => ({ default: m.AdminModal }))
);
import { syncManager } from './utils/syncManager';
import {
  initialCompanyInfo,
  initialProducts,
  initialShippingMethods,
  initialClients,
  initialReviews,
  initialGallery,
  initialLegalDocuments,
  initialOrders,
  initialAdminUsers,
} from './data/initialData';
import {
  CartItem,
  CompanyInfo,
  Order,
  Product,
  Review,
  ShippingMethod,
  ServiceItem,
  ClientPartner,
  GalleryItem,
  LegalDocument,
  AdminUser,
  VisitorAnalytics,
} from './types';
import { MessageSquareQuote, ShoppingBag } from 'lucide-react';
import { MinsoraAvatar } from './components/MinsoraAvatar';
import { useLanguage } from './context/LanguageContext';
import { initGoogleAnalytics, trackVisitorPing, trackGAEvent, defaultAnalyticsData } from './utils/analytics';

export default function App() {
  const { t } = useLanguage();
  // Local storage synced states
  const [company, setCompany] = useState<CompanyInfo>(() => {
    const saved = localStorage.getItem('asasora_company');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialCompanyInfo, ...parsed };
      } catch (e) {
        return initialCompanyInfo;
      }
    }
    return initialCompanyInfo;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('asasora_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(() => {
    const saved = localStorage.getItem('asasora_shipping');
    if (saved) {
      try {
        const parsed: ShippingMethod[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m) => ({
            ...m,
            description:
              m.description && (m.description.includes('Jarak *') || m.description.includes('Min. Rp'))
                ? ''
                : m.description,
          }));
        }
      } catch (e) {
        return initialShippingMethods;
      }
    }
    return initialShippingMethods;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('asasora_cart');
    if (saved) {
      try {
        const parsed: CartItem[] = JSON.parse(saved);
        return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('asasora_reviews');
    if (saved) {
      try {
        const parsed: Review[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        return initialReviews;
      }
    }
    return initialReviews;
  });

  const [clients, setClients] = useState<ClientPartner[]>(() => {
    const saved = localStorage.getItem('asasora_clients');
    if (saved) {
      try {
        const parsed: ClientPartner[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        return initialClients;
      }
    }
    return initialClients;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('asasora_gallery');
    if (saved) {
      try {
        const parsed: GalleryItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        return initialGallery;
      }
    }
    return initialGallery;
  });

  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>(() => {
    const saved = localStorage.getItem('asasora_legal');
    if (saved) {
      try {
        const parsed: LegalDocument[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        return initialLegalDocuments;
      }
    }
    return initialLegalDocuments;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('asasora_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return initialOrders;
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('asasora_admin_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return initialAdminUsers;
  });

  const [analytics, setAnalytics] = useState<VisitorAnalytics>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asasora_local_analytics');
      if (saved) {
        try {
          return { ...defaultAnalyticsData, ...JSON.parse(saved) };
        } catch (e) {}
      }
    }
    return defaultAnalyticsData;
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Real-time synchronization state
  const [syncStatus, setSyncStatus] = useState({
    connected: false,
    firestoreConnected: false,
    lastSyncTime: null as number | null,
    isSyncing: false,
    version: 1,
  });

  // Track if we are currently applying a remote update to avoid echoing back redundant saves
  const isApplyingRemoteRef = useRef(false);

  // Listen to live local analytics broadcast events
  useEffect(() => {
    const handleAnalyticsUpdate = (e: any) => {
      if (e && e.detail) {
        setAnalytics((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('asasora_analytics_update', handleAnalyticsUpdate);
    return () => {
      window.removeEventListener('asasora_analytics_update', handleAnalyticsUpdate);
    };
  }, []);

  // Subscribe to real-time events from server (Server-Sent Events + Polling fallback + BroadcastChannel)
  useEffect(() => {
    const unsubscribeData = syncManager.subscribe((incomingData) => {
      isApplyingRemoteRef.current = true;

      if (incomingData.company) {
        setCompany((prev) => ({ ...prev, ...incomingData.company }));
      }
      if (Array.isArray(incomingData.products) && incomingData.products.length > 0) {
        setProducts(incomingData.products);
      }
      if (Array.isArray(incomingData.shippingMethods) && incomingData.shippingMethods.length > 0) {
        setShippingMethods(incomingData.shippingMethods);
      }
      if (Array.isArray(incomingData.reviews) && incomingData.reviews.length > 0) {
        setReviews(incomingData.reviews);
      }
      if (Array.isArray(incomingData.clients) && incomingData.clients.length > 0) {
        setClients(incomingData.clients);
      }
      if (Array.isArray(incomingData.gallery) && incomingData.gallery.length > 0) {
        setGallery(incomingData.gallery);
      }
      if (Array.isArray(incomingData.legalDocuments) && incomingData.legalDocuments.length > 0) {
        setLegalDocuments(incomingData.legalDocuments);
      }
      if (Array.isArray(incomingData.orders)) {
        setOrders(incomingData.orders);
      }
      if (Array.isArray(incomingData.adminUsers) && incomingData.adminUsers.length > 0) {
        setAdminUsers(incomingData.adminUsers);
      }
      if (incomingData.analytics) {
        setAnalytics((prev) => ({ ...prev, ...incomingData.analytics }));
      }

      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 100);
    });

    const unsubscribeStatus = syncManager.subscribeStatus((status) => {
      setSyncStatus(status);
    });

    // Schedule non-critical startup tasks on browser idle to avoid blocking FCP & LCP main thread
    const runOnIdle = (callback: () => void, delayMs = 800) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(callback, { timeout: delayMs + 1000 });
      } else {
        setTimeout(callback, delayMs);
      }
    };

    // Fetch latest fresh data safely and track visitor immediately
    runOnIdle(() => {
      syncManager.fetchLatestData();
      trackVisitorPing(window.location.hash || '/').then((res) => {
        if (res) setAnalytics(res);
      });
    }, 800);

    // Prefetch order form in background when browser is idle
    runOnIdle(() => {
      import('./components/OrderFormSection');
    }, 2500);

    const handleHashChange = () => {
      trackVisitorPing(window.location.hash || '/').then((res) => {
        if (res) setAnalytics(res);
      });
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      unsubscribeData();
      unsubscribeStatus();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Initialize Google Analytics with speed acceleration after critical paint
  useEffect(() => {
    if (company.googleAnalyticsEnabled !== false) {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          initGoogleAnalytics(company.googleAnalyticsId);
        }, { timeout: 3000 });
      } else {
        setTimeout(() => {
          initGoogleAnalytics(company.googleAnalyticsId);
        }, 1500);
      }
    }
  }, [company.googleAnalyticsId, company.googleAnalyticsEnabled]);

  // Sync to local storage for instant offline access
  useEffect(() => {
    localStorage.setItem('asasora_company', JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    localStorage.setItem('asasora_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('asasora_shipping', JSON.stringify(shippingMethods));
  }, [shippingMethods]);

  useEffect(() => {
    localStorage.setItem('asasora_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('asasora_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('asasora_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('asasora_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('asasora_legal', JSON.stringify(legalDocuments));
  }, [legalDocuments]);

  useEffect(() => {
    localStorage.setItem('asasora_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('asasora_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          quantity: Math.max(qty, product.minOrder || 1),
          image: product.image,
        };
        return [...prev, newItem];
      }
    });
  };

  const handleInstantCheckout = (product: Product) => {
    handleAddToCart(product, product.minOrder || 1);
    setIsOrderModalOpen(true);
  };

  const handleUpdateCartItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCustomCartItem = () => {
    const fallbackProd = products[0] || initialProducts[0];
    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: fallbackProd.id,
      name: fallbackProd.name,
      price: fallbackProd.price,
      unit: fallbackProd.unit,
      quantity: 1,
      image: fallbackProd.image,
    };
    setCartItems((prev) => [...prev, newItem]);
  };

  const handleChangeCartItemProduct = (cartItemId: string, newProductId: string) => {
    const foundProd = products.find((p) => p.id === newProductId);
    if (!foundProd) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              productId: foundProd.id,
              name: foundProd.name,
              price: foundProd.price,
              unit: foundProd.unit,
              image: foundProd.image,
            }
          : item
      )
    );
  };

  // Review submission
  const handleAddReview = (newReview: Omit<Review, 'id' | 'date' | 'verified'>) => {
    const review: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      date: 'Baru saja',
      verified: true,
    };
    setReviews((prev) => {
      const next = [review, ...prev];
      syncManager.saveData({ reviews: next });
      return next;
    });
  };

  // Order created
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    syncManager.createOrder(newOrder);

    // Track conversion in Google Analytics & internal analytics
    trackGAEvent('purchase', {
      transaction_id: newOrder.invoiceNumber || newOrder.id,
      value: newOrder.totalAmount,
      currency: 'IDR',
      items_count: newOrder.items.length,
    });

    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'order' }),
      }).catch(() => {});
    } catch {}
  };

  // Admin handlers
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) => {
      const next = prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
      syncManager.saveData({ orders: next });
      return next;
    });
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      syncManager.saveData({ products: next });
      return next;
    });
  };

  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const prod: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => {
      const next = [...prev, prod];
      syncManager.saveData({ products: next });
      return next;
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      syncManager.saveData({ products: next });
      return next;
    });
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleUpdateShippingMethod = (updated: ShippingMethod) => {
    setShippingMethods((prev) => {
      const next = prev.map((m) => (m.id === updated.id ? updated : m));
      syncManager.saveData({ shippingMethods: next });
      return next;
    });
  };

  const handleUpdateCompany = (updated: CompanyInfo) => {
    setCompany(updated);
    syncManager.saveData({ company: updated });
  };

  // Client handlers
  const handleUpdateClient = (updated: ClientPartner) => {
    setClients((prev) => {
      const next = prev.map((c) => (c.id === updated.id ? updated : c));
      syncManager.saveData({ clients: next });
      return next;
    });
  };

  const handleAddClient = (newCli: Omit<ClientPartner, 'id'>) => {
    const cli: ClientPartner = {
      ...newCli,
      id: `c-${Date.now()}`,
    };
    setClients((prev) => {
      const next = [...prev, cli];
      syncManager.saveData({ clients: next });
      return next;
    });
  };

  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => {
      const next = prev.filter((c) => c.id !== clientId);
      syncManager.saveData({ clients: next });
      return next;
    });
  };

  // Review handlers
  const handleUpdateReview = (updated: Review) => {
    setReviews((prev) => {
      const next = prev.map((r) => (r.id === updated.id ? updated : r));
      syncManager.saveData({ reviews: next });
      return next;
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => {
      const next = prev.filter((r) => r.id !== reviewId);
      syncManager.saveData({ reviews: next });
      return next;
    });
  };

  // Gallery handlers
  const handleUpdateGalleryItem = (updated: GalleryItem) => {
    setGallery((prev) => {
      const next = prev.map((g) => (g.id === updated.id ? updated : g));
      syncManager.saveData({ gallery: next });
      return next;
    });
  };

  const handleAddGalleryItem = (newItem: Omit<GalleryItem, 'id'>) => {
    const item: GalleryItem = {
      ...newItem,
      id: `gal-${Date.now()}`,
    };
    setGallery((prev) => {
      const next = [...prev, item];
      syncManager.saveData({ gallery: next });
      return next;
    });
  };

  const handleDeleteGalleryItem = (itemId: string) => {
    setGallery((prev) => {
      const next = prev.filter((g) => g.id !== itemId);
      syncManager.saveData({ gallery: next });
      return next;
    });
  };

  // Legal document handlers
  const handleUpdateLegalDocument = (updated: LegalDocument) => {
    setLegalDocuments((prev) => {
      const next = prev.map((d) => (d.id === updated.id ? updated : d));
      syncManager.saveData({ legalDocuments: next });
      return next;
    });
  };

  const handleAddLegalDocument = (newDoc: Omit<LegalDocument, 'id'>) => {
    const doc: LegalDocument = {
      ...newDoc,
      id: `leg-${Date.now()}`,
    };
    setLegalDocuments((prev) => {
      const next = [...prev, doc];
      syncManager.saveData({ legalDocuments: next });
      return next;
    });
  };

  const handleDeleteLegalDocument = (docId: string) => {
    setLegalDocuments((prev) => {
      const next = prev.filter((d) => d.id !== docId);
      syncManager.saveData({ legalDocuments: next });
      return next;
    });
  };

  // Admin User handlers
  const handleUpdateAdminUser = (updatedUser: AdminUser) => {
    setAdminUsers((prev) => {
      const next = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      syncManager.saveData({ adminUsers: next });
      return next;
    });
  };

  const handleAddAdminUser = (newUser: Omit<AdminUser, 'id'>) => {
    const user: AdminUser = {
      ...newUser,
      id: `usr-${Date.now()}`,
    };
    setAdminUsers((prev) => {
      const next = [...prev, user];
      syncManager.saveData({ adminUsers: next });
      return next;
    });
  };

  const handleDeleteAdminUser = (userId: string) => {
    setAdminUsers((prev) => {
      const next = prev.filter((u) => u.id !== userId);
      syncManager.saveData({ adminUsers: next });
      return next;
    });
  };

  const handleResetAdminUsers = () => {
    setAdminUsers(initialAdminUsers);
    syncManager.saveData({ adminUsers: initialAdminUsers });
  };

  const handleResetAllData = () => {
    setCompany(initialCompanyInfo);
    setProducts(initialProducts);
    setReviews(initialReviews);
    setClients(initialClients);
    setGallery(initialGallery);
    setLegalDocuments(initialLegalDocuments);
    setShippingMethods(initialShippingMethods);
    setOrders(initialOrders);
    setAdminUsers(initialAdminUsers);
    syncManager.resetAllData();
  };

  const totalCartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col selection:bg-[#2E6F40] selection:text-white font-sans">
      {/* Global Navigation */}
      <Navbar
        company={company}
        cartCount={totalCartCount}
        onOpenAdminModal={() => setIsAdminOpen(true)}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
        onScrollToSection={scrollToSection}
      />

      {/* Main Landmark for Accessibility & SEO */}
      <main id="main-content" role="main" className="flex-1">
        {/* Hero Section */}
        <HeroSection
          company={company}
          onOrderClick={() => setIsOrderModalOpen(true)}
        />

        {/* Katalog Produk & Tambah ke Keranjang */}
        <ProductCatalogSection
          products={products}
          orders={orders}
          company={company}
          onAddToCart={handleAddToCart}
          onInstantCheckout={handleInstantCheckout}
          onOpenOrderModal={() => setIsOrderModalOpen(true)}
        />

        {/* Mitra & Rekanan / Our Client */}
        <ClientsSection clients={clients} />

        {/* Review & Testimoni Pelanggan */}
        <ReviewsSection reviews={reviews} onAddReview={handleAddReview} />

        {/* Galeri Perusahaan */}
        <GallerySection gallery={gallery} />

        {/* Legalitas Perusahaan */}
        <LegalitasSection documents={legalDocuments} />

        {/* Kontak & Konsultasi */}
        <ContactSection company={company} />
      </main>

      {/* Formulir Pesanan Resmi Modal (Loaded asynchronously on demand) */}
      {isOrderModalOpen && (
        <Suspense fallback={null}>
          <OrderFormSection
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
            company={company}
            products={products}
            cartItems={cartItems}
            shippingMethods={shippingMethods}
            onAddToCart={handleAddToCart}
            onUpdateCartItemQuantity={handleUpdateCartItemQuantity}
            onRemoveCartItem={handleRemoveCartItem}
            onAddCustomCartItem={handleAddCustomCartItem}
            onChangeCartItemProduct={handleChangeCartItemProduct}
            onOrderCreated={handleOrderCreated}
          />
        </Suspense>
      )}

      {/* Footer */}
      <Footer
        company={company}
        analytics={analytics}
        onScrollToSection={scrollToSection}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
      />

      {/* Admin Panel Modal (Loaded asynchronously on demand) */}
      {isAdminOpen && (
        <Suspense fallback={null}>
          <AdminModal
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            orders={orders}
            products={products}
            reviews={reviews}
            clients={clients}
            gallery={gallery}
            legalDocuments={legalDocuments}
            shippingMethods={shippingMethods}
            company={company}
            syncStatus={syncStatus}
            onManualSync={() => syncManager.fetchLatestData()}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddOrder={handleOrderCreated}
            onDeleteOrder={(orderId: string) => {
              setOrders((prev) => {
                const next = prev.filter((o) => o.id !== orderId);
                syncManager.saveData({ orders: next });
                return next;
              });
            }}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateReview={handleUpdateReview}
            onAddReview={handleAddReview}
            onDeleteReview={handleDeleteReview}
            onUpdateClient={handleUpdateClient}
            onAddClient={handleAddClient}
            onDeleteClient={handleDeleteClient}
            onUpdateGalleryItem={handleUpdateGalleryItem}
            onAddGalleryItem={handleAddGalleryItem}
            onDeleteGalleryItem={handleDeleteGalleryItem}
            onUpdateLegalDocument={handleUpdateLegalDocument}
            onAddLegalDocument={handleAddLegalDocument}
            onDeleteLegalDocument={handleDeleteLegalDocument}
            onUpdateShippingMethod={handleUpdateShippingMethod}
            onUpdateCompany={handleUpdateCompany}
            onResetAllData={handleResetAllData}
            adminUsers={adminUsers}
            onUpdateAdminUser={handleUpdateAdminUser}
            onAddAdminUser={handleAddAdminUser}
            onDeleteAdminUser={handleDeleteAdminUser}
            onResetAdminUsers={handleResetAdminUsers}
          />
        </Suspense>
      )}

      {/* Floating Action Button: WhatsApp MinSora Chat Mascot */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-auto">
        <a
          href={`https://wa.me/${company.whatsapp}?text=Halo%20MinSora%20PT.%20ASASORA%20BIO%20HEALTHORA,%20saya%20ingin%20berkonsultasi`}
          target="_blank"
          rel="noopener noreferrer"
          id="btn-floating-whatsapp"
          className="group relative flex items-center gap-2.5 bg-white hover:bg-emerald-50 text-gray-900 pl-1.5 pr-4 py-1.5 rounded-full shadow-2xl transition-all duration-300 border-2 border-[#25D366] hover:border-emerald-600 transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Chat WhatsApp MinSora (Online)"
        >
          <MinsoraAvatar size="md" showOnlineBadge={true} showWaBadge={true} />
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-gray-900 group-hover:text-emerald-800 transition-colors flex items-center gap-1 leading-tight">
              <span>{t('float.chat_title', 'Chat MinSora')}</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
              <span>{t('float.chat_status', 'Online • Bantuan Cepat')}</span>
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
