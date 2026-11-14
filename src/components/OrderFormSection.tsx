import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  UserCheck,
  ShoppingCart,
  MapPin,
  Plus,
  Trash2,
  Navigation,
  Calculator,
  AlertCircle,
  Truck,
  Building2,
  CheckCircle2,
  Bike,
  Car,
  Search,
  Loader2,
  ExternalLink,
  MessageSquare,
  ReceiptText,
  Clock,
  ShieldCheck,
  Compass,
  X,
  ShoppingBag,
  AlertTriangle,
  RefreshCw,
  Utensils,
  ChevronDown,
  ChevronUp,
  Layers,
  Tag,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { CartItem, CompanyInfo, Order, Product, ShippingMethod } from '../types';
import {
  calculateDistanceKm,
  calculateCourierTariff,
  formatRupiah,
  generateOrderId,
  STANDARD_COURIERS,
  WAREHOUSE_ORIGIN,
  QUICK_LOCATION_PRESETS,
  resolveAddressToCoordinates,
} from '../utils/distance';
import {
  buildRawInvoiceText,
  formatIndonesianDateTime,
  generateInvoiceNumber,
  generateUniquePaymentCode,
} from '../utils/invoiceGenerator';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeAddress,
  sanitizePhoneNumber,
  validatePhoneNumber,
} from '../utils/security';
import { InvoiceView } from './InvoiceView';
import { useLanguage } from '../context/LanguageContext';

interface OrderFormSectionProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyInfo;
  products: Product[];
  cartItems: CartItem[];
  shippingMethods?: ShippingMethod[];
  onAddToCart?: (product: Product, quantity?: number) => void;
  onUpdateCartItemQuantity: (id: string, quantity: number) => void;
  onRemoveCartItem: (id: string) => void;
  onAddCustomCartItem: () => void;
  onChangeCartItemProduct: (cartItemId: string, newProductId: string) => void;
  onOrderCreated: (order: Order) => void;
}

interface GeocodingSearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export const OrderFormSection: React.FC<OrderFormSectionProps> = ({
  isOpen,
  onClose,
  company,
  products,
  cartItems,
  onAddToCart,
  onUpdateCartItemQuantity,
  onRemoveCartItem,
  onAddCustomCartItem,
  onChangeCartItemProduct,
  onOrderCreated,
}) => {
  const { t, lang } = useLanguage();

  // Close modal with Escape key & prevent background scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Static Warehouse Origin (Gudang Asasora di Tangerang)
  const originWarehouse = {
    name: company.warehouseLocation?.name || company.warehouse?.name || WAREHOUSE_ORIGIN.name,
    lat: company.warehouseLocation?.lat || company.warehouse?.lat || WAREHOUSE_ORIGIN.lat,
    lng: company.warehouseLocation?.lng || company.warehouse?.lng || WAREHOUSE_ORIGIN.lng,
    address: company.warehouseLocation?.address || company.warehouse?.address || WAREHOUSE_ORIGIN.address,
  };

  // Customer info state
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');

  // Geocoding & Coordinate Location State (Default: Tangerang Kota area / ~4.8 km)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingSearchResult[]>([]);
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [destLat, setDestLat] = useState<number>(-6.1738);
  const [destLng, setDestLng] = useState<number>(106.6305);
  const [destLocationName, setDestLocationName] = useState<string>('Tangerang Kota (Pasar Anyar)');
  const [distanceKm, setDistanceKm] = useState<number>(() => {
    return calculateDistanceKm(originWarehouse.lat, originWarehouse.lng, -6.1738, 106.6305);
  });
  const [locationStatus, setLocationStatus] = useState<string>(
    'Titik lokasi aktif: Tangerang Kota. Jarak terhitung otomatis ke Gudang Asasora.'
  );

  // Courier Filter Tab: 'all' | 'motor' | 'mobil' | 'toko'
  const [activeCourierTab, setActiveCourierTab] = useState<'all' | 'motor' | 'mobil' | 'toko'>('all');
  const [selectedCourierId, setSelectedCourierId] = useState<string>('gojek-motor');
  const [formError, setFormError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Smooth scroll and focus helper for form validation
  const scrollToElement = (elementId: string) => {
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          el.focus();
        }
      }
    }, 60);
  };

  // Hitung Ongkir Calculation State
  const [isCalculatingOngkir, setIsCalculatingOngkir] = useState<boolean>(false);
  const [ongkirFeedback, setOngkirFeedback] = useState<{
    distance: number;
    fare: number;
    courierName: string;
    timestamp: string;
  } | null>(null);

  // Interactive Catalog Menu Picker State inside Order Form
  const [showCatalogMenuPicker, setShowCatalogMenuPicker] = useState<boolean>(false);
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('all');
  const [catalogSearchTerm, setCatalogSearchTerm] = useState<string>('');

  // Categories list for quick picker
  const catalogCategories = useMemo(() => {
    const defaultCats = [
      { id: 'all', label: lang === 'en' ? 'All Menus' : 'Semua Menu' },
      { id: 'catering & event', label: lang === 'en' ? 'Catering & Events' : 'Catering & Event' },
      { id: 'Produk Siap Santap', label: lang === 'en' ? 'Ready-to-Eat' : 'Produk Siap Santap' },
      { id: 'Snak dan cemilan', label: lang === 'en' ? 'Snacks' : 'Snak dan cemilan' },
    ];
    const extras: { id: string; label: string }[] = [];
    products.forEach((p) => {
      const c = p.category?.trim();
      if (
        c &&
        !defaultCats.some((d) => d.id.toLowerCase() === c.toLowerCase()) &&
        !extras.some((e) => e.id.toLowerCase() === c.toLowerCase())
      ) {
        extras.push({ id: c, label: c });
      }
    });
    return [...defaultCats, ...extras];
  }, [products, lang]);

  // Filtered products for quick picker
  const filteredCatalogProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        catalogCategoryFilter === 'all' ||
        (p.category && p.category.trim().toLowerCase() === catalogCategoryFilter.trim().toLowerCase());
      const matchesSearch =
        !catalogSearchTerm.trim() ||
        p.name.toLowerCase().includes(catalogSearchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(catalogSearchTerm.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [products, catalogCategoryFilter, catalogSearchTerm]);

  // Handle Quick Add Product from Catalog
  const handleQuickAddProduct = (prod: Product) => {
    if (onAddToCart) {
      onAddToCart(prod, 1);
    } else {
      const existing = cartItems.find((it) => it.productId === prod.id);
      if (existing) {
        onUpdateCartItemQuantity(existing.id, existing.quantity + 1);
      } else {
        onAddCustomCartItem();
      }
    }
  };

  // Real-Time Stock Validation for all cart items (including Nasemangkuk Rice Bowl & Ready-to-eat)
  const cartStockAnalysis = useMemo(() => {
    return cartItems.map((item) => {
      const matched = products.find(
        (p) => p.id === item.productId || p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
      );
      const availableStock = matched?.stock !== undefined ? matched.stock : 100;
      const isNasemangkuk =
        item.name.toLowerCase().includes('nasemangkuk') ||
        item.name.toLowerCase().includes('rice bowl') ||
        (matched?.name.toLowerCase().includes('nasemangkuk') ?? false);
      const isExceeded = item.quantity > availableStock;
      const isOutOfStock = availableStock <= 0;

      return {
        ...item,
        name: matched?.name || item.name,
        price: matched?.price !== undefined ? matched.price : item.price,
        unit: matched?.unit || item.unit,
        image: matched?.image || item.image,
        availableStock,
        isNasemangkuk,
        isExceeded,
        isOutOfStock,
        matchedProduct: matched,
      };
    });
  }, [cartItems, products]);

  const stockIssues = cartStockAnalysis.filter((s) => s.isExceeded || s.isOutOfStock);
  const hasStockIssues = stockIssues.length > 0;

  // Auto-adjust all cart quantities to available stock
  const handleAutoAdjustStock = () => {
    cartStockAnalysis.forEach((analysis) => {
      if (analysis.isOutOfStock) {
        onRemoveCartItem(analysis.id);
      } else if (analysis.isExceeded) {
        onUpdateCartItemQuantity(analysis.id, analysis.availableStock);
      }
    });
    setFormError(null);
  };

  // Real-time Phone Validation State
  const phoneValidation = useMemo(() => {
    if (!whatsapp) return null;
    return validatePhoneNumber(whatsapp, lang);
  }, [whatsapp, lang]);

  // Clean phone input in real-time (accept digits only)
  const handlePhoneInputChange = (val: string) => {
    const cleanDigits = val.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
    setWhatsapp(cleanDigits);
  };

  // Close geocoding search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update distance whenever coordinates change
  const updateCoordinatesAndDistance = (lat: number, lng: number, locName?: string) => {
    setDestLat(lat);
    setDestLng(lng);
    if (locName) setDestLocationName(locName);

    const dist = calculateDistanceKm(originWarehouse.lat, originWarehouse.lng, lat, lng);
    setDistanceKm(dist);

    // Live update couriers with new distance
    const rates = STANDARD_COURIERS.map((method) => {
      const tariff = calculateCourierTariff(method.id, dist);
      return {
        ...method,
        calculatedFare: tariff.fare,
        isAvailable: tariff.isAvailable,
      };
    });

    const matched =
      rates.find((c) => c.id === selectedCourierId && c.isAvailable) ||
      rates.find((c) => c.isAvailable) ||
      rates[0];
    if (matched && matched.id !== selectedCourierId) {
      setSelectedCourierId(matched.id);
    }

    setOngkirFeedback({
      distance: dist,
      fare: matched ? matched.calculatedFare : 0,
      courierName: matched ? matched.name : 'Kurir Reguler',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    });

    if (dist > 40) {
      setLocationStatus(
        lang === 'en'
          ? `Pinpoint active (${dist} km). Distance exceeds 40 km max instant courier limit.`
          : `Titik koordinat aktif (${dist} km). Jarak melebihi batas 40 km kurir instan reguler.`
      );
    } else {
      setLocationStatus(
        lang === 'en'
          ? `Accurate pinpoint verified: ${dist} km from Asasora Tangerang Hub.`
          : `Titik koordinat valid: ${dist} km dari Gudang Asasora Tangerang.`
      );
    }

    return dist;
  };

  // Perform OpenStreetMap Geocoding Search
  const handleSearchGeocode = async (query: string) => {
    if (!query.trim() || query.length < 3) return;
    setIsSearchingGeocode(true);
    setShowSearchResults(true);

    try {
      // Append Jabodetabek / Indonesia contextual bias
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ', Indonesia'
      )}&limit=5&addressdetails=1`;

      const response = await fetch(searchUrl, {
        headers: { 'Accept-Language': 'id,en' },
      });
      if (response.ok) {
        const data: GeocodingSearchResult[] = await response.json();
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.warn('Geocoding service fetch error:', err);
      setSearchResults([]);
    } finally {
      setIsSearchingGeocode(false);
    }
  };

  // Select Geocoding Search Result
  const handleSelectSearchResult = (result: GeocodingSearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const shortName = result.display_name.split(',').slice(0, 3).join(',');

    setSearchQuery(shortName);
    if (!address) {
      setAddress(result.display_name);
    }
    setShowSearchResults(false);
    updateCoordinatesAndDistance(lat, lng, shortName);
  };

  // GPS Location Handler: locks GPS and automatically calculates live shipping
  const handleUseMyLocation = () => {
    setLocationStatus(
      lang === 'en' ? 'Detecting device GPS coordinates...' : 'Mendeteksi koordinat GPS perangkat Anda...'
    );

    if (!navigator.geolocation) {
      setLocationStatus(
        lang === 'en'
          ? 'GPS not supported by this browser. Using current pinpoint.'
          : 'GPS tidak didukung oleh browser Anda. Menggunakan titik saat ini.'
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateCoordinatesAndDistance(lat, lng, 'Lokasi GPS Perangkat');
        const dist = calculateDistanceKm(originWarehouse.lat, originWarehouse.lng, lat, lng);
        setDistanceKm(dist);

        // Auto-recalculate couriers with the new GPS distance
        const rates = STANDARD_COURIERS.map((method) => {
          const tariff = calculateCourierTariff(method.id, dist);
          return {
            ...method,
            calculatedFare: tariff.fare,
            isAvailable: tariff.isAvailable,
          };
        });

        const matched =
          rates.find((c) => c.id === selectedCourierId && c.isAvailable) ||
          rates.find((c) => c.isAvailable) ||
          rates[0];
        if (matched && matched.id !== selectedCourierId) {
          setSelectedCourierId(matched.id);
        }

        setOngkirFeedback({
          distance: dist,
          fare: matched ? matched.calculatedFare : 0,
          courierName: matched ? matched.name : 'Kurir Reguler',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        });

        setLocationStatus(
          lang === 'en'
            ? `GPS locked! Calculated distance: ${dist} km (${matched?.name || 'Kurir'})`
            : `GPS terkunci! Jarak terhitung: ${dist} Km • Rp ${(matched ? matched.calculatedFare : 0).toLocaleString('id-ID')} (${matched?.name || 'Kurir'})`
        );
      },
      (error) => {
        console.warn('GPS error:', error.message);
        setLocationStatus(
          lang === 'en'
            ? 'GPS access unavailable or permission denied. Please enter your address above.'
            : 'Izin GPS ditolak atau tidak tersedia. Silakan ketik alamat pengiriman di atas untuk cek ongkir.'
        );
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Compute live courier tariffs for all 7 standard methods
  const couriersWithRates = STANDARD_COURIERS.map((method) => {
    const tariffInfo = calculateCourierTariff(method.id, distanceKm);
    return {
      ...method,
      calculatedFare: tariffInfo.fare,
      isAvailable: tariffInfo.isAvailable,
      statusText: tariffInfo.statusText,
    };
  });

  // Check if current selected courier is available; if not, switch to first available
  const activeCourier =
    couriersWithRates.find((c) => c.id === selectedCourierId) ||
    couriersWithRates.find((c) => c.isAvailable) ||
    couriersWithRates[0];

  const shippingCost = activeCourier ? activeCourier.calculatedFare : 0;
  const isOver40Km = distanceKm > 40;

  // Cart subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Filtered couriers for tabs
  const filteredCouriers = couriersWithRates.filter((c) => {
    if (activeCourierTab === 'all') return true;
    return c.courierGroup === activeCourierTab;
  });

  // Handle Explicit Hitung Ongkir Action
  const handleCalculateOngkir = async () => {
    setIsCalculatingOngkir(true);
    setFormError(null);

    try {
      // Prioritize the address entered by consumer or the search box query
      const queryToSearch = (searchQuery.trim() || address.trim());

      if (!queryToSearch || queryToSearch.length < 2) {
        setLocationStatus(
          lang === 'en'
            ? 'Please enter your delivery destination address in Step 1 or search box.'
            : 'Mohon masukkan alamat tujuan pengiriman di Langkah 1 atau kolom pencarian.'
        );
        return;
      }

      // Geocode using robust knowledge base + resilient online OSM geocoding
      const resolved = await resolveAddressToCoordinates(queryToSearch, destLat, destLng);
      const currentLat = resolved.lat;
      const currentLng = resolved.lng;

      setDestLat(currentLat);
      setDestLng(currentLng);
      setDestLocationName(resolved.locationName);
      if (!searchQuery) setSearchQuery(resolved.locationName);
      if (!address) setAddress(resolved.locationName);

      // Calculate distance from Tangerang Origin Warehouse
      const dist = calculateDistanceKm(originWarehouse.lat, originWarehouse.lng, currentLat, currentLng);
      setDistanceKm(dist);

      // Recalculate courier rates for all 7 courier methods
      const rates = STANDARD_COURIERS.map((method) => {
        const tariff = calculateCourierTariff(method.id, dist);
        return {
          ...method,
          calculatedFare: tariff.fare,
          isAvailable: tariff.isAvailable,
        };
      });

      const matched =
        rates.find((c) => c.id === selectedCourierId && c.isAvailable) ||
        rates.find((c) => c.isAvailable) ||
        rates[0];
      if (matched && matched.id !== selectedCourierId) {
        setSelectedCourierId(matched.id);
      }

      // Feedback display
      setOngkirFeedback({
        distance: dist,
        fare: matched ? matched.calculatedFare : 0,
        courierName: matched ? matched.name : 'Kurir Reguler',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });

      if (dist > 40) {
        setLocationStatus(
          lang === 'en'
            ? `Jarak ${dist} Km melebihi batas 40 km kurir instan. Pengiriman katering luar kota dilayani via WhatsApp admin.`
            : `Jarak ${dist} Km ke ${resolved.locationName} melebihi batas 40 km kurir instan. Pengiriman katering luar kota dilayani via WhatsApp admin.`
        );
      } else {
        setLocationStatus(
          lang === 'en'
            ? `Ongkir berhasil dihitung: ${dist} Km ke ${resolved.locationName} • Rp ${matched?.calculatedFare.toLocaleString('id-ID')} (${matched?.name})`
            : `Ongkir berhasil dihitung: ${dist} Km ke ${resolved.locationName} • Rp ${matched?.calculatedFare.toLocaleString('id-ID')} (${matched?.name})`
        );
      }
    } catch (err) {
      console.error('Error calculating shipping rate:', err);
    } finally {
      setTimeout(() => {
        setIsCalculatingOngkir(false);
      }, 300);
    }
  };

  // Handle Order Creation with Rigorous Code Hardening & Instant Feedback
  const handleCreateOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    // 1. Sanitize & validate customer name (XSS prevention)
    const sanitizedName = sanitizeString(customerName);
    if (!sanitizedName || sanitizedName.length < 2) {
      const msg = lang === 'en'
        ? 'Please enter a valid Full Name (min. 2 characters).'
        : 'Mohon masukkan Nama Lengkap yang valid (minimal 2 karakter).';
      setFormError(msg);
      scrollToElement('input-customer-name');
      return;
    }

    // 2. Validate phone number (digits only, 9-15 digits)
    const phoneCheck = validatePhoneNumber(whatsapp, lang);
    if (!phoneCheck.isValid) {
      const msg = phoneCheck.errorMessage ||
        (lang === 'en'
          ? 'Phone number must only contain digits and be at least 9 digits.'
          : 'Nomor WhatsApp / telepon wajib diisi minimal 9 digit angka.');
      setFormError(msg);
      scrollToElement('input-whatsapp');
      return;
    }

    // 3. Sanitize & validate email (if provided)
    const emailResult = sanitizeEmail(customerEmail);
    if (customerEmail.trim() && !emailResult.isValid) {
      const msg = lang === 'en'
        ? 'Invalid email format. Please check your email address.'
        : 'Format email tidak valid. Mohon periksa kembali penulisan email Anda.';
      setFormError(msg);
      scrollToElement('input-email');
      return;
    }

    // 4. Sanitize & validate address (XSS prevention)
    const sanitizedAddress = sanitizeAddress(address);
    if (!sanitizedAddress || sanitizedAddress.length < 5) {
      const msg = lang === 'en'
        ? 'Please enter a complete delivery address (min. 5 characters).'
        : 'Mohon masukkan Alamat Kirim Lengkap yang valid (minimal 5 karakter).';
      setFormError(msg);
      scrollToElement('input-address');
      return;
    }

    // 5. Validate Cart Items
    if (cartItems.length === 0) {
      const msg = lang === 'en'
        ? 'Your cart is empty. Please select dishes in Step 2 first.'
        : 'Keranjang belanja masih kosong! Silakan pilih minimal 1 menu katering pada Langkah 2.';
      setFormError(msg);
      setShowCatalogMenuPicker(true);
      scrollToElement('section-keranjang');
      return;
    }

    // 6. Real-time Stock Validation for all items
    for (const item of cartStockAnalysis) {
      if (item.isOutOfStock) {
        const msg = lang === 'en'
          ? `Menu "${item.name}" is currently OUT OF STOCK. Please remove it from your cart.`
          : `Menu "${item.name}" saat ini SEDANG HABIS. Mohon hapus dari keranjang Anda.`;
        setFormError(msg);
        scrollToElement('section-keranjang');
        return;
      }
      if (item.isExceeded) {
        const msg = lang === 'en'
          ? `Stock for "${item.name}" is insufficient. Available stock: ${item.availableStock} portions (in cart: ${item.quantity}).`
          : `Stok menu "${item.name}" tidak mencukupi. Tersedia: ${item.availableStock} porsi (dalam keranjang: ${item.quantity}). Silakan sesuaikan jumlah.`;
        setFormError(msg);
        scrollToElement('section-keranjang');
        return;
      }
    }

    // 7. Validate Courier & Auto-Fallback to best available courier
    let effectiveCourier = activeCourier;
    if (!effectiveCourier || (!effectiveCourier.isAvailable && !isOver40Km)) {
      const fallback = couriersWithRates.find((c) => c.isAvailable) || couriersWithRates[0];
      if (fallback) {
        effectiveCourier = fallback;
        setSelectedCourierId(fallback.id);
      } else if (!isOver40Km) {
        setFormError(
          lang === 'en'
            ? 'Selected courier is not available for this distance. Please choose another courier in Step 4.'
            : 'Kurir yang dipilih tidak tersedia untuk jarak pengiriman ini. Silakan pilih kurir yang tersedia pada Langkah 4.'
        );
        scrollToElement('section-kurir');
        return;
      }
    }

    setIsSubmittingOrder(true);

    try {
      const now = new Date();
      const invoiceNumber = generateInvoiceNumber(now);
      const uniqueCode = generateUniquePaymentCode();
      const orderId = generateOrderId();
      const paymentCode = `ASR-${uniqueCode}`;

      const dueDateObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const transactionDateStr = formatIndonesianDateTime(now);
      const dueDateStr = `${formatIndonesianDateTime(dueDateObj)} (24 Jam)`;

      const chosenFare = effectiveCourier ? effectiveCourier.calculatedFare : (shippingCost || 0);
      const chosenCourierName = effectiveCourier ? effectiveCourier.name : 'Kurir Toko / Asasora Express';
      const chosenEst = effectiveCourier?.estTime || effectiveCourier?.estimatedTime || '30 - 60 Menit';

      const totalTagihanAkumulatif = subtotal + chosenFare + uniqueCode;
      const finalEmail =
        emailResult.email ||
        `${sanitizedName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'customer'}@email.com`;

      const rawInvoiceText = buildRawInvoiceText(
        {
          id: orderId,
          customerName: sanitizedName,
          whatsapp: phoneCheck.cleanNumber,
          email: finalEmail,
          address: sanitizedAddress,
          items: [...cartItems],
          subtotal,
          shippingCost: chosenFare,
          shippingMethodName: `${chosenCourierName} (${distanceKm} km)`,
          distanceKm,
        },
        company,
        {
          invoiceNumber,
          transactionDateStr,
          dueDateStr,
          uniqueCode,
          subtotal,
          shippingCost: chosenFare,
          totalWithCode: totalTagihanAkumulatif,
          customerEmail: finalEmail,
          shippingMethodDetail: `${chosenCourierName} - ${distanceKm} km (Est: ${chosenEst})`,
        }
      );

      const newOrder: Order = {
        id: orderId,
        invoiceNumber,
        date: now.toISOString(),
        dueDate: dueDateStr,
        customerName: sanitizedName,
        whatsapp: phoneCheck.cleanNumber,
        email: finalEmail,
        address: sanitizedAddress,
        customerLat: destLat,
        customerLng: destLng,
        items: [...cartItems],
        subtotal,
        shippingMethodName: chosenCourierName,
        shippingCost: chosenFare,
        shippingFee: chosenFare,
        distanceKm,
        uniqueCode,
        totalAmount: totalTagihanAkumulatif,
        rawInvoiceText,
        paymentCode,
        paymentMethod: 'Transfer Bank BCA',
        status: 'Menunggu Pembayaran',
      };

      setCreatedOrder(newOrder);
      onOrderCreated(newOrder);
      setFormError(null);

      // Scroll modal body smoothly to top so customer views the official invoice immediately
      setTimeout(() => {
        const modalBody = document.getElementById('order-form-modal-body');
        if (modalBody) {
          modalBody.scrollTo({ top: 0, behavior: 'smooth' });
        }
        const invoiceEl = document.getElementById('checkout-invoice-panel');
        if (invoiceEl) {
          invoiceEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    } catch (err) {
      console.error('Failed to create order / generate invoice:', err);
      setFormError('Terjadi kendala saat menerbitkan invoice resmi. Silakan coba kembali.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // WhatsApp Link for Out of Town Delivery (> 40 km)
  const generateOutOfTownWhatsAppUrl = () => {
    const text = `Halo Admin PT. ASASORA BIO HEALTHORA, saya ingin konsultasi pemesanan Katering Luar Kota / Jarak Jauh:
- Nama: ${customerName || '-'}
- Alamat Kirim: ${address || '-'}
- Jarak Titik: ${distanceKm} Km (Koordinat: ${destLat}, ${destLng})
- Rincian Pesanan: ${cartItems.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ') || 'Belum dipilih'}

Mohon informasi tarif kargo pendingin / armada khusus antar kota. Terima kasih!`;
    return `https://wa.me/${company.whatsapp || '6285271000900'}?text=${encodeURIComponent(text)}`;
  };

  if (!isOpen) return null;

  return (
    <div
      id="pemesanan-baru"
      className="fixed inset-0 z-50 bg-stone-950/75 flex items-center justify-center p-2 sm:p-4 sm:py-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-stone-300 max-w-4xl w-full my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Title & Close/Exit Button */}
        <div className="px-5 py-4 sm:px-7 sm:py-4.5 bg-[#0F5132] text-white flex items-center justify-between shrink-0 border-b border-[#0b3d26]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/25">
              <ShoppingBag className="w-5 h-5 text-[#F3C623]" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-xl leading-tight text-white tracking-tight">
                  {t('order.header_title', 'Formulir Order Online & Keranjang')}
                </h3>
                {cartItems.length > 0 && (
                  <span className="bg-[#F3C623] text-stone-900 text-[11px] font-black px-2 py-0.5 rounded tabular-nums">
                    {cartItems.reduce((acc, it) => acc + it.quantity, 0)} {lang === 'en' ? 'Items' : 'Porsi'}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-200 font-medium line-clamp-1">
                {company.name || 'PT. ASASORA BIO HEALTHORA'} · {lang === 'en' ? 'Courier Automation & Official Invoice' : 'Otomatisasi Kurir & Invoice Resmi'}
              </p>
            </div>
          </div>

          {/* Close Button in Header */}
          <button
            type="button"
            onClick={onClose}
            className="bg-white/15 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/25"
            title={lang === 'en' ? 'Close (Esc)' : 'Tutup / Keluar (Esc)'}
            aria-label={lang === 'en' ? 'Close order form' : 'Tutup formulir pesanan'}
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">{lang === 'en' ? 'Close' : 'Tutup'}</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div id="order-form-modal-body" className="p-5 sm:p-8 overflow-y-auto space-y-6 bg-[#FAFBF9]">
          {createdOrder ? (
            /* DEDICATED INVOICE RESMI SCREEN */
            <div className="space-y-6 animate-in fade-in duration-300" id="checkout-invoice-panel">
              {/* Congratulatory Top Card */}
              <div className="bg-[#0F5132] text-white p-5 sm:p-6 rounded-2xl border border-[#0b3d26] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-[#F3C623]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#F3C623] text-stone-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                        Invoice Resmi Berhasil Diterbitkan
                      </span>
                      <span className="text-xs text-stone-200 font-mono font-bold tabular-nums">
                        {createdOrder.invoiceNumber || createdOrder.id}
                      </span>
                    </div>
                    <h4 className="text-lg sm:text-xl font-extrabold text-white mt-1 tracking-tight">
                      Pesanan Anda Siap &amp; Menunggu Pembayaran
                    </h4>
                    <p className="text-xs text-stone-200 leading-relaxed">
                      Lakukan transfer sesuai total nominal ke Rekening BCA di bawah ini atau unduh berkas PDF resmi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedOrder(null);
                      setFormError(null);
                    }}
                    className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2.5 rounded-lg border border-white/25 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                    <span>Buat Pesanan Baru / Ubah Formulir</span>
                  </button>
                </div>
              </div>

              {/* The Official Printable & Downloadable Invoice Component */}
              <InvoiceView
                order={createdOrder}
                company={company}
                onClose={onClose}
              />
            </div>
          ) : (
            <>
              {/* Header Subtitle Banner */}
              <div className="text-center pb-4 border-b border-stone-200">
                <span className="text-[#0F5132] text-xs font-bold uppercase tracking-[0.14em]">
                  {t('order.tag', 'Formulir Pesanan Resmi')}
                </span>
                <h4 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1.5 tracking-tight">
                  {t('order.title', 'Keranjang Belanja & Otomatisasi Kurir')}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-xl mx-auto leading-relaxed">
                  {t(
                    'order.subtitle',
                    'Pilih menu katering, tentukan titik lokasi koordinat, pilih armada kurir (Gojek / Grab / Lalamove / Toko), lalu buat order untuk mendapatkan Invoice Resmi otomatis.'
                  )}
                </p>
              </div>

              {formError && (
                <div className="mb-6 bg-red-50 border border-red-300 text-red-800 px-4 py-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" strokeWidth={1.75} />
                  <div className="flex-1 font-semibold">{formError}</div>
                </div>
              )}

              <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleCreateOrder(); }}>
                {/* 1. INFORMASI PELANGGAN */}
                <div className="space-y-4 border-b border-stone-200 pb-8">
                  <h4 className="font-extrabold text-[#0F5132] text-lg sm:text-xl flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-[#0F5132]" strokeWidth={1.75} />
                    <span>{t('order.step1', '1. Informasi Pelanggan')}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                        <span>
                          {t('order.name', 'Nama Lengkap')} <span className="text-red-500">*</span>
                        </span>
                        <span className="text-[10px] text-stone-400 font-semibold">XSS Sanitized</span>
                      </label>
                      <input
                        id="input-customer-name"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder={t('order.name_placeholder', 'Contoh: Budi Santoso')}
                        className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0F5132] focus:outline-none text-sm bg-white text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                        <span>
                          {t('order.phone', 'Nomor WhatsApp / Telepon')} <span className="text-red-500">*</span>
                        </span>
                        {phoneValidation && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              phoneValidation.isValid
                                ? 'bg-emerald-50 text-[#0F5132] border-emerald-200'
                                : 'bg-amber-50 text-amber-900 border-amber-200'
                            }`}
                          >
                            {phoneValidation.isValid
                              ? `Valid (${phoneValidation.cleanNumber.length} digit)`
                              : `Min. 9 digit (${whatsapp.replace(/\D/g, '').length}/9)`}
                          </span>
                        )}
                      </label>
                      <input
                        id="input-whatsapp"
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={(e) => handlePhoneInputChange(e.target.value)}
                        placeholder={t('order.phone_placeholder', 'Contoh: 081234567890 (Hanya Angka)')}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none text-sm bg-white text-stone-900 font-mono tabular-nums ${
                          whatsapp && phoneValidation && !phoneValidation.isValid
                            ? 'border-amber-400 focus:ring-amber-500'
                            : 'border-stone-300 focus:ring-[#0F5132]'
                        }`}
                      />
                      <p className="text-[10px] text-stone-500 mt-1">
                        {lang === 'en'
                          ? 'Only numbers accepted (min. 9 digits). Used for instant delivery WhatsApp notification.'
                          : 'Hanya angka yang diterima (min. 9 digit). Digunakan untuk konfirmasi pesanan & kurir via WhatsApp.'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                      <span>{t('order.email', 'Email (Untuk Lampiran Invoice)')}</span>
                      <span className="text-[10px] text-stone-400 font-semibold">Format RFC 5322 Validated</span>
                    </label>
                    <input
                      id="input-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder={t('order.email_placeholder', 'Contoh: budi.santoso@email.com (opsional)')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0F5132] focus:outline-none text-sm bg-white text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                      <span>
                        {t('order.address', 'Alamat Kirim Lengkap')} <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-semibold">Sanitized Address</span>
                    </label>
                    <textarea
                      id="input-address"
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => {
                        const newAddr = e.target.value;
                        setAddress(newAddr);
                        if (formError) setFormError(null);
                        if (!searchQuery || searchQuery === address) {
                          setSearchQuery(newAddr);
                        }
                      }}
                      placeholder={t(
                        'order.address_placeholder',
                        'Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos'
                      )}
                      className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0F5132] focus:outline-none text-sm bg-white text-stone-900"
                    />
                  </div>
                </div>

                {/* 2. DAFTAR PRODUK PILIHAN (KERANJANG & KATALOG MENU) */}
                <div id="section-keranjang" className="space-y-4 border-b border-stone-200 pb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="font-extrabold text-[#0F5132] text-lg sm:text-xl flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2 text-[#0F5132]" strokeWidth={1.75} />
                    <span>{t('order.step2', '2. Daftar Produk Pilihan & Menu Katalog')}</span>
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {lang === 'en'
                      ? 'Select dishes directly from catalog or adjust items in your basket.'
                      : 'Pilih menu langsung dari katalog resmi atau sesuaikan porsi pada daftar keranjang.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowCatalogMenuPicker(!showCatalogMenuPicker)}
                    className={`flex-1 sm:flex-none text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5 border cursor-pointer ${
                      showCatalogMenuPicker
                        ? 'bg-[#0F5132]/10 text-[#0F5132] border-[#0F5132]/30'
                        : 'bg-white hover:bg-[#FAFBF9] text-[#0F5132] border-stone-300'
                    }`}
                  >
                    <Utensils className="w-4 h-4 text-[#0F5132]" strokeWidth={1.75} />
                    <span>{showCatalogMenuPicker ? (lang === 'en' ? 'Tutup Menu' : 'Tutup Menu Katalog') : (lang === 'en' ? 'Buka Katalog Menu' : 'Pilih Menu dari Katalog')}</span>
                    {showCatalogMenuPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={onAddCustomCartItem}
                    className="flex-1 sm:flex-none bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.75} />
                    <span>{t('order.add_more', 'Tambah Baris')}</span>
                  </button>
                </div>
              </div>

              {/* Interactive Catalog Menu Browser Panel */}
              {(showCatalogMenuPicker || cartItems.length === 0) && (
                <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0F5132] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        <Utensils className="w-4 h-4" strokeWidth={1.75} />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-sm text-[#0F5132]">
                          {lang === 'en' ? 'Live Product Menu Catalog' : 'Katalog Menu Siap Pesan'}
                        </h5>
                        <p className="text-[11px] text-stone-600">
                          {lang === 'en'
                            ? 'Click any item below to add it directly to your order.'
                            : 'Klik tombol "+ Tambah" pada menu di bawah untuk langsung memasukkannya ke pesanan.'}
                        </p>
                      </div>
                    </div>

                    {/* Search inside catalog */}
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        value={catalogSearchTerm}
                        onChange={(e) => setCatalogSearchTerm(e.target.value)}
                        placeholder={lang === 'en' ? 'Search menu / dishes...' : 'Cari nama menu / porsi...'}
                        className="w-full bg-white border border-stone-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" strokeWidth={1.75} />
                    </div>
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                    {catalogCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCatalogCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer text-xs border ${
                          catalogCategoryFilter === cat.id
                            ? 'bg-[#0F5132] text-white border-[#0F5132]'
                            : 'bg-white text-stone-600 hover:bg-[#FAFBF9] border-stone-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Product Cards Grid */}
                  {filteredCatalogProducts.length === 0 ? (
                    <div className="text-center py-6 bg-[#FAFBF9] rounded-xl border border-stone-200 p-4">
                      <p className="text-xs text-stone-500 font-semibold">
                        {lang === 'en' ? 'No menu items match your search.' : 'Tidak ada menu yang sesuai pencarian.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                      {filteredCatalogProducts.map((prod) => {
                        const inCart = cartItems.find((c) => c.productId === prod.id);
                        return (
                          <div
                            key={prod.id}
                            className="bg-white rounded-xl p-3 border border-stone-200 hover:border-[#0F5132]/50 transition-colors flex flex-col justify-between group"
                          >
                            <div className="flex gap-3">
                              <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                                <img
                                  src={prod.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-[#0F5132] uppercase tracking-wider line-clamp-1 mb-0.5">
                                  {prod.category || 'Menu Katering'}
                                </div>
                                <h6 className="font-extrabold text-xs text-stone-900 line-clamp-1 leading-tight">
                                  {prod.name}
                                </h6>
                                <p className="text-[11px] font-bold text-[#0F5132] mt-0.5 tabular-nums">
                                  {formatRupiah(prod.price)} <span className="text-[10px] text-stone-500 font-normal">/ {prod.unit || 'porsi'}</span>
                                </p>
                                <p className="text-[10px] text-stone-400 mt-0.5 tabular-nums">
                                  {lang === 'en' ? `Stock: ${prod.stock ?? 100}` : `Sisa Stok: ${prod.stock ?? 100} ${prod.unit || 'porsi'}`}
                                </p>
                              </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                              {inCart ? (
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span className="text-[11px] font-bold text-[#0F5132] bg-[#F7F8F6] px-2 py-0.5 rounded border border-stone-200 tabular-nums">
                                    {inCart.quantity} {prod.unit || 'porsi'} di keranjang
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddProduct(prod)}
                                    className="bg-[#0F5132] hover:bg-[#0b3d26] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                  >
                                    + Tambah Lagi
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleQuickAddProduct(prod)}
                                  className="w-full bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                                  <span>{lang === 'en' ? 'Add to Order' : 'Tambah ke Pesanan'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Real-time Stock Alert Banner */}
              {hasStockIssues && (
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <h5 className="font-bold text-amber-900 text-xs sm:text-sm">
                        {lang === 'en'
                          ? 'Real-Time Stock Limit Alert'
                          : 'Peringatan Validasi Stok Menu Real-Time (Nasemangkuk & Katering)'}
                      </h5>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {lang === 'en'
                          ? 'Some selected items exceed available daily kitchen batch stock. Please adjust quantities below.'
                          : 'Terdapat item yang melebihi batas stok dapur hari ini. Silakan sesuaikan jumlah atau gunakan penyesuaian otomatis.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoAdjustStock}
                    className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>{lang === 'en' ? 'Auto-Adjust to Available Stock' : 'Sesuaikan Otomatis'}</span>
                  </button>
                </div>
              )}

              {/* Cart Item Rows */}
              <div className="space-y-3" id="cart-items-container">
                {cartStockAnalysis.length === 0 ? (
                  <div className="text-center py-8 bg-white border border-dashed border-stone-300 rounded-xl p-6">
                    <ShoppingCart className="w-8 h-8 text-stone-300 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-sm font-semibold text-stone-700">
                      {t('order.cart_empty', 'Keranjang Anda masih kosong.')}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      {lang === 'en'
                        ? 'Select products from the catalog above to start your order.'
                        : 'Pilih hidangan dari menu katalog di atas atau klik "Tambah Baris".'}
                    </p>
                    {!showCatalogMenuPicker && (
                      <button
                        type="button"
                        onClick={() => setShowCatalogMenuPicker(true)}
                        className="mt-3 inline-flex items-center gap-1.5 bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <Utensils className="w-4 h-4" strokeWidth={1.75} />
                        <span>{lang === 'en' ? 'Open Menu Catalog' : 'Buka Katalog Menu'}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  cartStockAnalysis.map((item, index) => {
                    const itemSubtotal = item.price * item.quantity;
                    const matched = item.matchedProduct;
                    return (
                      <div
                        key={item.id}
                        className={`bg-white border rounded-xl p-4 sm:p-5 transition-colors space-y-3 ${
                          item.isOutOfStock
                            ? 'border-red-400 bg-red-50/20'
                            : item.isExceeded
                            ? 'border-amber-400 bg-amber-50/20'
                            : 'border-stone-200 hover:border-[#0F5132]/40'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Product Selection with Photo & Details */}
                          <div className="flex items-start gap-3 flex-1">
                            {/* Product Thumbnail */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                              <img
                                src={item.image || matched?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
                                }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                                  <span className="font-bold text-stone-500">
                                    {lang === 'en' ? `Item #${index + 1}` : `Menu #${index + 1}`}
                                  </span>
                                  {matched?.category && (
                                    <>
                                      <span className="text-stone-300" aria-hidden="true">·</span>
                                      <span className="font-semibold text-[#0F5132]">
                                        {matched.category}
                                      </span>
                                    </>
                                  )}
                                </div>

                                {/* Stock status label */}
                                {item.isOutOfStock ? (
                                  <span className="bg-red-50 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                                    {lang === 'en' ? 'Out of Stock' : 'Stok Habis'}
                                  </span>
                                ) : (
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded border tabular-nums ${
                                      item.isNasemangkuk
                                        ? 'bg-emerald-50 text-[#0F5132] border-emerald-200'
                                        : 'bg-[#FAFBF9] text-stone-700 border-stone-200'
                                    }`}
                                  >
                                    {item.isNasemangkuk && 'Nasemangkuk · '}
                                    {lang === 'en' ? `Stock: ${item.availableStock}` : `Sisa Stok: ${item.availableStock} ${item.unit || 'porsi'}`}
                                  </span>
                                )}
                              </div>

                              {/* Dropdown Selector */}
                              <select
                                value={item.productId}
                                onChange={(e) => onChangeCartItemProduct(item.id, e.target.value)}
                                className="w-full bg-[#FAFBF9] border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    [{p.category || 'Menu'}] {p.name} — {formatRupiah(p.price)} / {p.unit || 'porsi'} (Stok: {p.stock ?? 100})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Quantity & Subtotal Controls */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                            {/* Quantity Controls */}
                            <div>
                              <div className="text-[11px] font-bold text-stone-500 mb-1">
                                {t('order.quantity', 'Jumlah')}
                              </div>
                              <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-[#FAFBF9]">
                                <button
                                  type="button"
                                  onClick={() => onUpdateCartItemQuantity(item.id, item.quantity - 1)}
                                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs cursor-pointer"
                                >
                                  -
                                </button>
                                <span
                                  className={`px-3 py-1 text-xs font-bold min-w-8 text-center tabular-nums ${
                                    item.isExceeded || item.isOutOfStock
                                      ? 'text-red-600 bg-red-50'
                                      : 'text-stone-900'
                                  }`}
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.quantity < item.availableStock) {
                                      onUpdateCartItemQuantity(item.id, item.quantity + 1);
                                    }
                                  }}
                                  disabled={item.quantity >= item.availableStock}
                                  className={`px-3 py-1.5 font-bold text-xs ${
                                    item.quantity >= item.availableStock
                                      ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer'
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right min-w-28">
                              <div className="text-[11px] font-bold text-stone-500 mb-1">
                                {t('order.subtotal', 'Subtotal')}
                              </div>
                              <div className="text-sm sm:text-base font-extrabold text-[#0F5132] tabular-nums">
                                {formatRupiah(itemSubtotal)}
                              </div>
                            </div>

                            {/* Remove Item */}
                            <button
                              type="button"
                              onClick={() => onRemoveCartItem(item.id)}
                              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4 cursor-pointer"
                              title="Hapus item ini"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                            </button>
                          </div>
                        </div>

                        {/* Exceeded / Out of stock warning note */}
                        {item.isOutOfStock && (
                          <div className="text-[11px] font-bold text-red-600 flex items-center justify-between pt-1 border-t border-red-200">
                            <span className="inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                              <span>Menu ini sedang habis dipesan untuk hari ini.</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemoveCartItem(item.id)}
                              className="text-red-700 underline hover:text-red-900 cursor-pointer"
                            >
                              Hapus dari Keranjang
                            </button>
                          </div>
                        )}
                        {item.isExceeded && !item.isOutOfStock && (
                          <div className="text-[11px] font-bold text-amber-700 flex items-center justify-between pt-1 border-t border-amber-200">
                            <span className="inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                              <span>Pesanan ({item.quantity}) melebihi sisa stok ({item.availableStock}).</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateCartItemQuantity(item.id, item.availableStock)}
                              className="text-amber-800 underline hover:text-amber-950 font-bold cursor-pointer"
                            >
                              Ubah ke {item.availableStock} {item.unit || 'porsi'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. SISTEM OTOMATISASI KURIR & GEOKODING BERBASIS KOORDINAT */}
            <div className="space-y-4 border-b border-stone-200 pb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h4 className="font-extrabold text-[#0F5132] text-lg sm:text-xl flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-[#0F5132]" strokeWidth={1.75} />
                  <span>{t('order.step3', '3. Sistem Otomatisasi Kurir & Cek Ongkir Geokoding')}</span>
                </h4>
                <span className="text-[11px] text-[#0F5132] font-bold">
                  {lang === 'en' ? 'Haversine Real-Time Engine' : 'Formula Geokoding Real-Time'}
                </span>
              </div>

              {/* Static Warehouse Origin Card (Gudang Asasora di Tangerang) */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#0F5132] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
                    {t('order.warehouse_origin', 'Gudang Dapur Asal (Statis)')}
                  </span>
                  <span className="text-[10px] bg-[#FAFBF9] text-[#0F5132] font-bold px-2.5 py-0.5 rounded border border-stone-200">
                    {t('order.warehouse_tag', 'Dapur Pusat Asasora Tangerang')}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1.5 gap-2">
                  <div>
                    <p className="font-extrabold text-stone-900 text-base">
                      {originWarehouse.name}
                    </p>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      {originWarehouse.address}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-[#0F5132] bg-[#FAFBF9] px-2.5 py-1 rounded-lg border border-stone-200 self-start sm:self-auto shrink-0 tabular-nums">
                    Lat: {originWarehouse.lat}, Lng: {originWarehouse.lng}
                  </div>
                </div>
              </div>

              {/* Geocoding Search & Coordinate Input Section */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 space-y-4">
                {/* Integrated Geocoding Search Bar */}
                <div className="relative" ref={searchContainerRef}>
                  <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5 flex items-center justify-between">
                    <span>{t('order.search_address', 'Cari Alamat / Titik Lokasi Rumah (Geokoding Terintegrasi)')}</span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      {lang === 'en' ? 'OpenStreetMap Nominatim' : 'Peta OpenStreetMap'}
                    </span>
                  </label>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleSearchGeocode(e.target.value);
                        }}
                        placeholder={t(
                          'order.search_placeholder',
                          'Ketik nama jalan / kelurahan / area (contoh: Cipondoh, BSD, Karawaci, Sudirman)...'
                        )}
                        className="w-full pl-10 pr-10 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0F5132] focus:outline-none text-xs sm:text-sm bg-[#FAFBF9] text-stone-900"
                      />
                      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" strokeWidth={1.75} />
                      {isSearchingGeocode && (
                        <Loader2 className="w-4 h-4 text-[#0F5132] animate-spin absolute right-3.5 top-3.5" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleCalculateOngkir}
                      disabled={isCalculatingOngkir}
                      className="btn-micro shrink-0 bg-[#0F5132] hover:bg-[#0b3d26] disabled:opacity-75 text-white font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      {isCalculatingOngkir ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Calculator className="w-4 h-4" strokeWidth={1.75} />
                      )}
                      <span>{isCalculatingOngkir ? 'Menghitung...' : 'Hitung Ongkir'}</span>
                    </button>
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-stone-300 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                      {searchResults.map((res, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectSearchResult(res)}
                          className="px-4 py-2.5 hover:bg-[#FAFBF9] cursor-pointer border-b border-stone-100 last:border-0 transition-colors flex items-start gap-2.5"
                        >
                          <MapPin className="w-4 h-4 text-[#0F5132] shrink-0 mt-0.5" strokeWidth={1.75} />
                          <div className="text-xs text-stone-800 line-clamp-2 leading-snug">
                            {res.display_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Address from Step 1 synchronization card */}
                  {address && address.trim().length > 0 && (
                    <div className="mt-2.5 p-3 bg-[#FAFBF9] border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-start sm:items-center gap-2 overflow-hidden">
                        <MapPin className="w-4 h-4 text-[#0F5132] shrink-0 mt-0.5 sm:mt-0" strokeWidth={1.75} />
                        <div className="text-stone-800">
                          <span className="font-bold text-[#0F5132]">Alamat Tujuan (Langkah 1):</span>{' '}
                          <span className="text-stone-700 font-medium line-clamp-1">{address}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery(address);
                          handleCalculateOngkir();
                        }}
                        disabled={isCalculatingOngkir}
                        className="shrink-0 bg-[#0F5132] hover:bg-[#0b3d26] disabled:opacity-75 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg border border-[#0b3d26] transition-colors cursor-pointer self-end sm:self-auto flex items-center gap-1"
                      >
                        <Calculator className="w-3 h-3" strokeWidth={1.75} />
                        <span>{isCalculatingOngkir ? 'Menghitung...' : 'Hitung Ongkir Alamat Ini'}</span>
                      </button>
                    </div>
                  )}

                  {/* Quick Preset Locations */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <span className="text-[11px] font-bold text-stone-500 mr-1 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
                      {lang === 'en' ? 'Quick Preset:' : 'Preset Cepat Area:'}
                    </span>
                    {QUICK_LOCATION_PRESETS.map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchQuery(loc.name);
                          if (!address) setAddress(loc.name);
                          updateCoordinatesAndDistance(loc.lat, loc.lng, loc.name);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors font-medium cursor-pointer ${
                          Math.abs(destLat - loc.lat) < 0.005 && Math.abs(destLng - loc.lng) < 0.005
                            ? 'bg-[#0F5132]/10 text-[#0F5132] border-[#0F5132]/40 font-bold'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Lat & Lng Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('order.lat_label', 'Latitude Rumah')}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={destLat}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateCoordinatesAndDistance(val, destLng);
                      }}
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-xs sm:text-sm font-mono tabular-nums bg-white text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('order.lng_label', 'Longitude Rumah')}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={destLng}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateCoordinatesAndDistance(destLat, val);
                      }}
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-xs sm:text-sm font-mono tabular-nums bg-white text-stone-900"
                    />
                  </div>
                </div>

                {/* Action Buttons: GPS & Calculate Ongkir */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="btn-micro flex-1 bg-white hover:bg-stone-100 text-[#0F5132] border border-[#0F5132] font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>{t('order.btn_gps', 'Gunakan GPS Lokasi Saya')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCalculateOngkir}
                    disabled={isCalculatingOngkir}
                    className="btn-micro flex-1 bg-[#0F5132] hover:bg-[#0b3d26] disabled:opacity-75 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isCalculatingOngkir ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Calculator className="w-3.5 h-3.5" strokeWidth={1.75} />
                    )}
                    <span>
                      {isCalculatingOngkir
                        ? lang === 'en'
                          ? 'Calculating...'
                          : 'Sedang Menghitung...'
                        : lang === 'en'
                        ? 'Calculate Shipping Fee'
                        : 'Hitung Ongkir (Cek Tarif)'}
                    </span>
                  </button>
                </div>

                {/* Real-Time Ongkir Feedback Banner */}
                {ongkirFeedback && (
                  <div className="bg-emerald-50 border border-[#0F5132]/40 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-900 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-[#0F5132] shrink-0" strokeWidth={1.75} />
                      <div>
                        <div className="font-bold text-xs text-[#0F5132]">
                          {lang === 'en' ? 'Shipping Rate Calculated!' : 'Tarif Ongkir Berhasil Dihitung!'}
                        </div>
                        <div className="text-[11px] text-stone-700 mt-0.5 tabular-nums">
                          {lang === 'en'
                            ? `Distance: ${ongkirFeedback.distance} km • Best Rate: ${formatRupiah(
                                ongkirFeedback.fare
                              )} (${ongkirFeedback.courierName})`
                            : `Jarak: ${ongkirFeedback.distance} Km • Tarif: ${formatRupiah(
                                ongkirFeedback.fare
                              )} via ${ongkirFeedback.courierName}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs bg-white text-[#0F5132] font-extrabold px-3 py-1 rounded-lg border border-stone-200 tabular-nums">
                        {formatRupiah(ongkirFeedback.fare)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Distance Badge & Status */}
                <div className="bg-[#FAFBF9] border border-stone-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0F5132] shrink-0" strokeWidth={1.75} />
                    <div className="text-xs text-stone-800 font-medium">
                      <span className="font-bold">{t('order.dist_result', 'Jarak Terhitung')}:</span>{' '}
                      <span className="text-base font-extrabold text-[#0F5132] font-mono tabular-nums">{distanceKm} Km</span>{' '}
                      <span className="text-stone-500">({t('order.from_store', 'dari Gudang Asasora Tangerang')})</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#0F5132] font-semibold bg-white px-2.5 py-1 rounded-lg border border-stone-200 self-start sm:self-auto">
                    {locationStatus}
                  </div>
                </div>
              </div>

              {/* COURIER SELECTION & REAL-TIME TARIFFS */}
              <div className="space-y-4">
                {/* Category / Vehicle Filter Tabs */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-stone-800">
                      {lang === 'en' ? 'Choose Shipping Method:' : 'Pilih Metode & Tarif Kurir:'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCalculateOngkir}
                      disabled={isCalculatingOngkir}
                      className="text-[11px] bg-white hover:bg-stone-100 text-[#0F5132] font-bold px-2 py-0.5 rounded-md border border-stone-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isCalculatingOngkir ? 'animate-spin' : ''}`} strokeWidth={1.75} />
                      <span>{lang === 'en' ? 'Recalculate' : 'Hitung Ulang'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveCourierTab('all')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                        activeCourierTab === 'all'
                          ? 'bg-[#0F5132] text-white'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {t('order.filter_all', 'Semua Kurir (7 Opsi)')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCourierTab('motor')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        activeCourierTab === 'motor'
                          ? 'bg-[#0F5132] text-white'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>{t('order.filter_motor', 'Motor (3)')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCourierTab('mobil')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        activeCourierTab === 'mobil'
                          ? 'bg-[#0F5132] text-white'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>{t('order.filter_mobil', 'Mobil (3)')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCourierTab('toko')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        activeCourierTab === 'toko'
                          ? 'bg-[#0F5132] text-white'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>{t('order.filter_toko', 'Toko')}</span>
                    </button>
                  </div>
                </div>

                {isCalculatingOngkir ? (
                  <div className="space-y-3" aria-busy="true" aria-label="Menghitung tarif kurir">
                    {[0, 1, 2].map((row) => (
                      <div
                        key={row}
                        className="p-4 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-5 h-5 rounded-full skeleton-shimmer shrink-0" />
                          <div className="space-y-2 flex-1 max-w-xs">
                            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                          </div>
                        </div>
                        <div className="space-y-1.5 text-right">
                          <div className="h-4 w-20 rounded skeleton-shimmer ml-auto" />
                          <div className="h-3 w-12 rounded skeleton-shimmer ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isOver40Km ? (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 text-center space-y-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-800 border border-amber-200">
                      <Truck className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-amber-900 text-base">
                        {lang === 'en'
                          ? 'Delivery Distance Exceeds Regular Instant Limit (> 40 Km)'
                          : 'Jarak Pengiriman Melebihi Batas Kurir Instan Reguler (> 40 Km)'}
                      </h5>
                      <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto leading-relaxed">
                        {t(
                          'order.out_of_instant_coverage',
                          'Jarak pengiriman saat ini adalah ' +
                            distanceKm +
                            ' Km. Untuk pengiriman katering jarak jauh / luar kota, kami menyediakan layanan khusus dengan armada berpendingin & jadwal khusus.'
                        )}
                      </p>
                    </div>
                    <a
                      href={generateOutOfTownWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#0F5132] hover:bg-[#0b3d26] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
                      <span>{t('order.btn_wa_out_of_town', 'Hubungi Admin via WhatsApp untuk Pengiriman Luar Kota')}</span>
                    </a>
                  </div>
                ) : (
                  /* Courier Cards Grid */
                  <div className="space-y-4">
                    {/* Render Groups if in 'all' tab or single group if filtered */}
                    {(['motor', 'mobil', 'toko'] as const).map((groupKey) => {
                      if (activeCourierTab !== 'all' && activeCourierTab !== groupKey) return null;

                      const groupCouriers = couriersWithRates.filter((c) => c.courierGroup === groupKey);
                      if (groupCouriers.length === 0) return null;

                      const groupTitle =
                        groupKey === 'motor'
                          ? t('order.courier_group_motor', 'A. KELOMPOK MOTOR / RODA DUA')
                          : groupKey === 'mobil'
                          ? t('order.courier_group_car', 'B. KELOMPOK MOBIL / RODA EMPAT')
                          : t('order.courier_group_store', 'C. KURIR TOKO (KHUSUS ASASORA)');

                      return (
                        <div key={groupKey} className="space-y-2">
                          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider pl-1">
                            {groupTitle}
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            {groupCouriers.map((courier) => {
                              const isSelected = selectedCourierId === courier.id;
                              const isAvailable = courier.isAvailable;

                              let brandBadge = null;
                              if (courier.courierProvider === 'gojek') {
                                brandBadge = (
                                  <span className="bg-emerald-50 text-[#0F5132] border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                    GOJEK
                                  </span>
                                );
                              } else if (courier.courierProvider === 'grab') {
                                brandBadge = (
                                  <span className="bg-green-50 text-green-900 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                    GRAB
                                  </span>
                                );
                              } else if (courier.courierProvider === 'lalamove') {
                                brandBadge = (
                                  <span className="bg-orange-50 text-orange-900 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                    LALAMOVE
                                  </span>
                                );
                              } else {
                                brandBadge = (
                                  <span className="bg-stone-100 text-stone-800 border border-stone-300 text-[10px] font-bold px-2 py-0.5 rounded">
                                    ASASORA TOKO
                                  </span>
                                );
                              }

                              return (
                                <div
                                  key={courier.id}
                                  onClick={() => {
                                    if (isAvailable) {
                                      setSelectedCourierId(courier.id);
                                    }
                                  }}
                                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                    !isAvailable
                                      ? 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed'
                                      : isSelected
                                      ? 'card-hover bg-[#FAFBF9] border-[#0F5132] ring-1 ring-[#0F5132] cursor-pointer'
                                      : 'card-hover bg-white border-stone-200 cursor-pointer'
                                  }`}
                                >
                                  {/* Left details */}
                                  <div className="flex items-start space-x-3">
                                    <div
                                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                                        !isAvailable
                                          ? 'border-stone-300 bg-stone-200'
                                          : isSelected
                                          ? 'border-[#0F5132] bg-[#0F5132]'
                                          : 'border-stone-300 bg-white'
                                      }`}
                                    >
                                      {isSelected && isAvailable && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                      )}
                                    </div>

                                    <div>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-extrabold text-xs sm:text-sm text-stone-900">
                                          {courier.name}
                                        </span>
                                        {brandBadge}
                                        <span className="bg-[#FAFBF9] text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 border border-stone-200">
                                          {courier.vehicleType === 'mobil' ? (
                                            <Car className="w-3 h-3 text-stone-600" strokeWidth={1.75} />
                                          ) : (
                                            <Bike className="w-3 h-3 text-[#0F5132]" strokeWidth={1.75} />
                                          )}
                                          <span>{courier.vehicleType === 'mobil' ? (lang === 'en' ? 'Car' : 'Mobil') : (lang === 'en' ? 'Motorcycle' : 'Motor')}</span>
                                        </span>
                                      </div>

                                      {!isAvailable && (
                                        <div className="mt-1 inline-block text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                          {courier.statusText || t('order.out_of_store_coverage', 'Di luar area Kurir Toko')}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right fare price */}
                                  <div className="text-right sm:pl-4 self-end sm:self-auto shrink-0">
                                    {isAvailable ? (
                                      <>
                                        <div className="font-black text-[#0F5132] text-sm sm:text-base font-mono tabular-nums">
                                          {formatRupiah(courier.calculatedFare)}
                                        </div>
                                        <div className="text-[10px] text-stone-400 tabular-nums">
                                          ({distanceKm} Km)
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-xs font-bold text-stone-400 italic">
                                        {lang === 'en' ? 'Not Available' : 'Tidak Tersedia'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 4. RINCIAN TOTAL PEMBAYARAN */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-3">
              <h4 className="font-extrabold text-[#0F5132] text-base sm:text-lg mb-2 flex items-center justify-between">
                <span>{t('order.step4', '4. Rincian Total Pembayaran')}</span>
                <span className="text-xs text-[#0F5132] font-bold bg-[#F7F8F6] px-2.5 py-1 rounded-md border border-stone-200 tabular-nums">
                  {cartItems.length} {lang === 'en' ? 'Menu Items' : 'Macam Menu'}
                </span>
              </h4>

              <div className="flex justify-between text-xs sm:text-sm text-stone-600">
                <span>
                  {t('order.total_products', 'Subtotal Produk')} ({cartItems.reduce((acc, it) => acc + it.quantity, 0)} {lang === 'en' ? 'portions' : 'porsi'}):
                </span>
                <span className="font-bold text-stone-900 tabular-nums" id="totalProdukText">
                  {formatRupiah(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm text-stone-600">
                <span>
                  {t('order.shipping_fee', 'Ongkos Kirim')} ({activeCourier?.name || 'Pilih Kurir Di Atas'}):
                </span>
                <span className="font-bold text-stone-900 tabular-nums" id="totalOngkirText">
                  {formatRupiah(shippingCost)}
                </span>
              </div>

              <hr className="border-stone-200 my-2" />

              <div className="flex justify-between text-base sm:text-xl font-black text-[#0F5132]">
                <span>{t('order.subtotal_accumulated', 'TOTAL SEMENTARA')}:</span>
                <span id="totalKeseluruhanText" className="tabular-nums">
                  {formatRupiah(subtotal + shippingCost)}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 italic">
                {t(
                  'order.unique_code_note',
                  '* Kode unik verifikasi otomatis (3 digit) akan ditambahkan saat invoice resmi diterbitkan.'
                )}
              </p>
            </div>

            {/* Action Button & Instant Feedback Banner: Buat Order & Terbitkan Invoice */}
            <div className="space-y-4 pt-2">
              {hasStockIssues && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-bold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      {lang === 'en'
                        ? 'Resolve stock quantity issues above before proceeding to invoice.'
                        : 'Selesaikan penyesuaian jumlah stok di atas sebelum menerbitkan invoice resmi.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoAdjustStock}
                    className="underline text-amber-800 hover:text-amber-950 font-black cursor-pointer shrink-0"
                  >
                    {lang === 'en' ? 'Auto-Fix Now' : 'Perbaiki Otomatis'}
                  </button>
                </div>
              )}

              {formError && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-800 text-xs sm:text-sm animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <strong className="block font-bold text-red-950 text-xs sm:text-sm">
                        Periksa Kembali Data Pemesanan:
                      </strong>
                      <span className="leading-relaxed font-medium">{formError}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!customerName.trim() || customerName.length < 2) scrollToElement('input-customer-name');
                      else if (!whatsapp.trim() || (phoneValidation && !phoneValidation.isValid)) scrollToElement('input-whatsapp');
                      else if (!address.trim() || address.length < 5) scrollToElement('input-address');
                      else if (cartItems.length === 0) {
                        setShowCatalogMenuPicker(true);
                        scrollToElement('section-keranjang');
                      } else scrollToElement('section-kurir');
                    }}
                    className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Perbaiki Field Sekarang</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                id="btn-buat-order"
                onClick={() => handleCreateOrder()}
                disabled={hasStockIssues || isSubmittingOrder}
                className={`btn-micro w-full font-bold py-4 px-6 rounded-xl border flex items-center justify-center space-x-2 text-base ${
                  hasStockIssues || isSubmittingOrder
                    ? 'bg-stone-300 text-stone-500 border-stone-300 cursor-not-allowed'
                    : 'bg-[#F3C623] hover:bg-[#D9AE14] text-stone-900 border-[#D9AE14] cursor-pointer'
                }`}
              >
                {isSubmittingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-stone-900" />
                    <span>Memproses Order &amp; Menerbitkan Invoice...</span>
                  </>
                ) : (
                  <>
                    <ReceiptText className="w-5 h-5 text-stone-900" strokeWidth={1.75} />
                    <span>{t('order.btn_create_invoice', 'Buat Order & Terbitkan Invoice Resmi')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  </div>
</div>
);
};
