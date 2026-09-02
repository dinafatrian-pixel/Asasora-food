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
  Sparkles,
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

    if (dist > 40) {
      setLocationStatus(
        lang === 'en'
          ? `📍 Pinpoint active (${dist} km). Distance exceeds 40 km max instant courier limit.`
          : `📍 Titik koordinat aktif (${dist} km). Jarak melebihi batas 40 km kurir instan reguler.`
      );
    } else {
      setLocationStatus(
        lang === 'en'
          ? `📍 Accurate pinpoint verified: ${dist} km from Asasora Tangerang Hub.`
          : `📍 Titik koordinat valid: ${dist} km dari Gudang Asasora Tangerang.`
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

  // GPS Location Handler
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
        setLocationStatus(
          lang === 'en'
            ? `✅ GPS locked! Calculated distance: ${calculateDistanceKm(
                originWarehouse.lat,
                originWarehouse.lng,
                lat,
                lng
              )} km from Tangerang Hub.`
            : `✅ GPS berhasil terkunci! Jarak terhitung: ${calculateDistanceKm(
                originWarehouse.lat,
                originWarehouse.lng,
                lat,
                lng
              )} km dari Gudang Asasora.`
        );
      },
      (error) => {
        console.warn('GPS error:', error.message);
        setLocationStatus(
          lang === 'en'
            ? 'GPS access unavailable or permission denied. Using manual coordinates.'
            : 'Izin GPS ditolak atau tidak tersedia. Silakan masukkan koordinat / pilih preset.'
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
      statusText: tariffInfo.statusText || method.description,
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
      // If user typed an address query and hasn't chosen a result, try geocoding first
      if (searchQuery.trim().length >= 3) {
        try {
          const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery + ', Indonesia'
          )}&limit=1&addressdetails=1`;
          const resp = await fetch(searchUrl, { headers: { 'Accept-Language': 'id,en' } });
          if (resp.ok) {
            const data: GeocodingSearchResult[] = await resp.json();
            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              const shortName = data[0].display_name.split(',').slice(0, 3).join(',');
              setDestLat(lat);
              setDestLng(lng);
              setDestLocationName(shortName);
              if (!address) setAddress(data[0].display_name);
            }
          }
        } catch (err) {
          console.warn('Auto-geocoding fallback:', err);
        }
      }

      // Calculate distance from Tangerang Origin Warehouse
      const dist = calculateDistanceKm(originWarehouse.lat, originWarehouse.lng, destLat, destLng);
      setDistanceKm(dist);

      // Check couriers
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
            ? `📍 Distance (${dist} km) exceeds 40 km standard instant limit. Out-of-town catering handled via WhatsApp.`
            : `📍 Jarak ${dist} Km melebihi batas 40 km kurir instan. Pengiriman luar kota dilayani via WhatsApp admin.`
        );
      } else {
        setLocationStatus(
          lang === 'en'
            ? `✅ Shipping calculated: ${dist} km • Rp ${matched?.calculatedFare.toLocaleString('id-ID')} (${matched?.name})`
            : `✅ Ongkir berhasil dihitung: ${dist} Km • Rp ${matched?.calculatedFare.toLocaleString('id-ID')} (${matched?.name})`
        );
      }
    } finally {
      setTimeout(() => {
        setIsCalculatingOngkir(false);
      }, 350);
    }
  };

  // Handle Order Creation with Rigorous Code Hardening
  const handleCreateOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    // 1. Sanitize & validate customer name (XSS prevention)
    const sanitizedName = sanitizeString(customerName);
    if (!sanitizedName || sanitizedName.length < 2) {
      setFormError(
        lang === 'en'
          ? 'Please enter a valid Full Name (min. 2 characters).'
          : 'Mohon masukkan Nama Lengkap yang valid (minimal 2 karakter).'
      );
      return;
    }

    // 2. Validate phone number (digits only, 9-15 digits)
    const phoneCheck = validatePhoneNumber(whatsapp, lang);
    if (!phoneCheck.isValid) {
      setFormError(
        phoneCheck.errorMessage ||
          (lang === 'en'
            ? 'Phone number must only contain digits and be at least 9 digits.'
            : 'Nomor telepon hanya boleh angka dan minimal 9 digit.')
      );
      return;
    }

    // 3. Sanitize & validate email (if provided)
    const emailResult = sanitizeEmail(customerEmail);
    if (customerEmail.trim() && !emailResult.isValid) {
      setFormError(
        lang === 'en'
          ? 'Invalid email format. Please check your email address.'
          : 'Format email tidak valid. Mohon periksa kembali penulisan email Anda.'
      );
      return;
    }

    // 4. Sanitize & validate address (XSS prevention)
    const sanitizedAddress = sanitizeAddress(address);
    if (!sanitizedAddress || sanitizedAddress.length < 5) {
      setFormError(
        lang === 'en'
          ? 'Please enter a complete delivery address (min. 5 characters).'
          : 'Mohon masukkan Alamat Kirim Lengkap yang valid (minimal 5 karakter).'
      );
      return;
    }

    // 5. Validate Cart Items
    if (cartItems.length === 0) {
      setFormError(
        lang === 'en'
          ? 'Your cart is empty. Please select products first.'
          : 'Keranjang belanja masih kosong. Silakan tambahkan produk terlebih dahulu.'
      );
      return;
    }

    // 6. Real-time Stock Validation for all items (specifically Nasemangkuk Ricebowl & Ready-to-eat)
    for (const item of cartStockAnalysis) {
      if (item.isOutOfStock) {
        setFormError(
          lang === 'en'
            ? `Menu "${item.name}" is currently OUT OF STOCK. Please remove it from your cart.`
            : `Menu "${item.name}" saat ini SEDANG HABIS. Mohon hapus dari keranjang Anda.`
        );
        return;
      }
      if (item.isExceeded) {
        setFormError(
          lang === 'en'
            ? `Stock for "${item.name}" is insufficient. Available stock: ${item.availableStock} portions (in cart: ${item.quantity}). Please adjust quantity.`
            : `Stok menu "${item.name}" tidak mencukupi. Tersedia: ${item.availableStock} porsi (dalam keranjang: ${item.quantity}). Silakan sesuaikan jumlah.`
        );
        return;
      }
    }

    // 7. Validate Courier
    if (!activeCourier || (!activeCourier.isAvailable && !isOver40Km)) {
      setFormError(
        lang === 'en'
          ? 'Selected courier is not available for this delivery distance. Please choose another option.'
          : 'Kurir yang dipilih tidak tersedia untuk jarak pengiriman ini. Silakan pilih kurir yang tersedia.'
      );
      return;
    }

    const now = new Date();
    const invoiceNumber = generateInvoiceNumber(now);
    const uniqueCode = generateUniquePaymentCode();
    const orderId = generateOrderId();
    const paymentCode = `ASR-${uniqueCode}`;

    const dueDateObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const transactionDateStr = formatIndonesianDateTime(now);
    const dueDateStr = `${formatIndonesianDateTime(dueDateObj)} (24 Jam)`;

    const totalTagihanAkumulatif = subtotal + shippingCost + uniqueCode;
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
        shippingCost,
        shippingMethodName: `${activeCourier.name} (${distanceKm} km)`,
        distanceKm,
      },
      company,
      {
        invoiceNumber,
        transactionDateStr,
        dueDateStr,
        uniqueCode,
        subtotal,
        shippingCost,
        totalWithCode: totalTagihanAkumulatif,
        customerEmail: finalEmail,
        shippingMethodDetail: `${activeCourier.name} - ${distanceKm} km (Est: ${
          activeCourier.estTime || activeCourier.estimatedTime
        })`,
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
      shippingMethodName: activeCourier.name,
      shippingCost,
      shippingFee: shippingCost,
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

    setTimeout(() => {
      const invoiceEl = document.getElementById('checkout-invoice-panel');
      if (invoiceEl) {
        invoiceEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // WhatsApp Link for Out of Town Delivery (> 40 km)
  const generateOutOfTownWhatsAppUrl = () => {
    const text = `Halo Admin PT. ASASORA BIO HEALTHORA, saya ingin konsultasi pemesanan Katering Luar Kota / Jarak Jauh:
- Nama: ${customerName || '-'}
- Alamat Kirim: ${address || '-'}
- Jarak Titik: ${distanceKm} Km (Koordinat: ${destLat}, ${destLng})
- Rincian Pesanan: ${cartItems.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ') || 'Belum dipilih'}

Mohon informasi tarif kargo pendingin / armada khusus antar kota. Terima kasih! 🙏`;
    return `https://wa.me/${company.whatsapp || '6285271000900'}?text=${encodeURIComponent(text)}`;
  };

  if (!isOpen) return null;

  return (
    <div
      id="pemesanan-baru"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 sm:py-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-600 max-w-4xl w-full my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Title & Close/Exit Button */}
        <div className="px-5 py-4 sm:px-7 sm:py-4.5 bg-gradient-to-r from-emerald-950 via-[#2E6F40] to-emerald-800 text-white flex items-center justify-between shrink-0 shadow-sm border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
              <ShoppingBag className="w-5 h-5 text-[#F3C623]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-xl leading-tight text-white">
                  {t('order.header_title', 'Formulir Order Online & Keranjang')}
                </h3>
                {cartItems.length > 0 && (
                  <span className="bg-[#F3C623] text-gray-900 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                    {cartItems.reduce((acc, it) => acc + it.quantity, 0)} {lang === 'en' ? 'Items' : 'Porsi'}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200 font-medium line-clamp-1">
                {company.name || 'PT. ASASORA BIO HEALTHORA'} &bull; {lang === 'en' ? 'Courier Automation & Official Invoice' : 'Otomatisasi Kurir & Invoice Resmi'}
              </p>
            </div>
          </div>

          {/* Close Button in Header */}
          <button
            type="button"
            onClick={onClose}
            className="bg-white/20 hover:bg-red-500 hover:text-white text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 border border-white/30"
            title={lang === 'en' ? 'Close (Esc)' : 'Tutup / Keluar (Esc)'}
            aria-label={lang === 'en' ? 'Close order form' : 'Tutup formulir pesanan'}
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Close' : 'Tutup'}</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
          {/* Header Subtitle Banner */}
          <div className="text-center pb-2 border-b border-gray-100">
            <span className="bg-[#F3C623]/25 text-yellow-900 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-[#F3C623]/40 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-800" />
              {t('order.tag', 'Formulir Pesanan Resmi')}
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-[#2E6F40] mt-2">
              {t('order.title', 'Keranjang Belanja & Otomatisasi Kurir')}
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl mx-auto leading-relaxed">
              {t(
                'order.subtitle',
                'Pilih menu katering, tentukan titik lokasi koordinat, pilih armada kurir (Gojek / Grab / Lalamove / Toko), lalu buat order untuk mendapatkan Invoice Resmi otomatis.'
              )}
            </p>
          </div>

          {formError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleCreateOrder(); }}>
            {/* 1. INFORMASI PELANGGAN */}
            <div className="space-y-4 border-b border-gray-100 pb-8">
              <h4 className="font-extrabold text-[#2E6F40] text-lg sm:text-xl flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-[#4A9E60]" />
                <span>{t('order.step1', '1. Informasi Pelanggan')}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>
                      {t('order.name', 'Nama Lengkap')} <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">XSS Sanitized</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t('order.name_placeholder', 'Contoh: Budi Santoso')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E6F40] focus:outline-none text-sm bg-white shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>
                      {t('order.phone', 'Nomor WhatsApp / Telepon')} <span className="text-red-500">*</span>
                    </span>
                    {phoneValidation && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          phoneValidation.isValid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {phoneValidation.isValid
                          ? `✓ Valid (${phoneValidation.cleanNumber.length} digit)`
                          : `Min. 9 digit (${whatsapp.replace(/\D/g, '').length}/9)`}
                      </span>
                    )}
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => handlePhoneInputChange(e.target.value)}
                    placeholder={t('order.phone_placeholder', 'Contoh: 081234567890 (Hanya Angka)')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none text-sm bg-white shadow-2xs font-mono ${
                      whatsapp && phoneValidation && !phoneValidation.isValid
                        ? 'border-amber-400 focus:ring-amber-500'
                        : 'border-gray-200 focus:ring-[#2E6F40]'
                    }`}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    {lang === 'en'
                      ? 'Only numbers accepted (min. 9 digits). Used for instant delivery WhatsApp notification.'
                      : 'Hanya angka yang diterima (min. 9 digit). Digunakan untuk konfirmasi pesanan & kurir via WhatsApp.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>{t('order.email', 'Email (Untuk Lampiran Invoice)')}</span>
                  <span className="text-[10px] text-gray-400 font-semibold">Format RFC 5322 Validated</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t('order.email_placeholder', 'Contoh: budi.santoso@email.com (opsional)')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E6F40] focus:outline-none text-sm bg-white shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>
                    {t('order.address', 'Alamat Kirim Lengkap')} <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">Sanitized Address</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t(
                    'order.address_placeholder',
                    'Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos'
                  )}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E6F40] focus:outline-none text-sm bg-white shadow-2xs"
                />
              </div>
            </div>

            {/* 2. DAFTAR PRODUK PILIHAN (KERANJANG & KATALOG MENU) */}
            <div className="space-y-4 border-b border-gray-100 pb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="font-extrabold text-[#2E6F40] text-lg sm:text-xl flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2 text-[#4A9E60]" />
                    <span>{t('order.step2', '2. Daftar Produk Pilihan & Menu Katalog')}</span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lang === 'en'
                      ? 'Select dishes directly from catalog or adjust items in your basket.'
                      : 'Pilih menu langsung dari katalog resmi atau sesuaikan porsi pada daftar keranjang.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowCatalogMenuPicker(!showCatalogMenuPicker)}
                    className={`flex-1 sm:flex-none text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-2xs border cursor-pointer ${
                      showCatalogMenuPicker
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-white hover:bg-emerald-50 text-[#2E6F40] border-emerald-300'
                    }`}
                  >
                    <Utensils className="w-4 h-4 text-[#2E6F40]" />
                    <span>{showCatalogMenuPicker ? (lang === 'en' ? 'Tutup Menu' : 'Tutup Menu Katalog') : (lang === 'en' ? 'Buka Katalog Menu' : 'Pilih Menu dari Katalog')}</span>
                    {showCatalogMenuPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={onAddCustomCartItem}
                    className="flex-1 sm:flex-none bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('order.add_more', 'Tambah Baris')}</span>
                  </button>
                </div>
              </div>

              {/* Interactive Catalog Menu Browser Panel */}
              {(showCatalogMenuPicker || cartItems.length === 0) && (
                <div className="bg-emerald-900/5 border-2 border-emerald-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#2E6F40] text-white flex items-center justify-center font-bold text-xs">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-sm text-[#2E6F40]">
                          {lang === 'en' ? 'Live Product Menu Catalog' : 'Katalog Menu Siap Pesan'}
                        </h5>
                        <p className="text-[11px] text-gray-600">
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
                        className="w-full bg-white border border-emerald-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2E6F40]"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                    {catalogCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCatalogCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer text-xs ${
                          catalogCategoryFilter === cat.id
                            ? 'bg-[#2E6F40] text-white shadow-2xs'
                            : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Product Cards Grid */}
                  {filteredCatalogProducts.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500 font-semibold">
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
                            className="bg-white rounded-xl p-3 border border-gray-200 hover:border-emerald-400 hover:shadow-xs transition flex flex-col justify-between group"
                          >
                            <div className="flex gap-3">
                              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                <img
                                  src={prod.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                                  alt={prod.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 mb-0.5">
                                  <span className="bg-emerald-50 text-[#2E6F40] text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-100 line-clamp-1">
                                    {prod.category || 'Menu Katering'}
                                  </span>
                                </div>
                                <h6 className="font-extrabold text-xs text-gray-900 line-clamp-1 leading-tight">
                                  {prod.name}
                                </h6>
                                <p className="text-[11px] font-bold text-[#2E6F40] mt-0.5">
                                  {formatRupiah(prod.price)} <span className="text-[10px] text-gray-500 font-normal">/ {prod.unit || 'porsi'}</span>
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {lang === 'en' ? `Stock: ${prod.stock ?? 100}` : `Sisa Stok: ${prod.stock ?? 100} ${prod.unit || 'porsi'}`}
                                </p>
                              </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                              {inCart ? (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    ✓ {inCart.quantity} {prod.unit || 'porsi'} di keranjang
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddProduct(prod)}
                                    className="bg-[#2E6F40] hover:bg-green-800 text-white text-[11px] font-black px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer active:scale-95"
                                  >
                                    + Tambah Lagi
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleQuickAddProduct(prod)}
                                  className="w-full bg-emerald-600 hover:bg-[#2E6F40] text-white text-xs font-bold py-1.5 rounded-lg transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{lang === 'en' ? 'Add to Order' : '+ Tambah ke Pesanan'}</span>
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
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-black text-amber-900 text-xs sm:text-sm">
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
                    className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Auto-Adjust to Available Stock' : 'Sesuaikan Otomatis'}</span>
                  </button>
                </div>
              )}

              {/* Cart Item Rows */}
              <div className="space-y-3" id="cart-items-container">
                {cartStockAnalysis.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6">
                    <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600">
                      {t('order.cart_empty', 'Keranjang Anda masih kosong.')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === 'en'
                        ? 'Select products from the catalog above to start your order.'
                        : 'Pilih hidangan dari menu katalog di atas atau klik "Tambah Baris".'}
                    </p>
                    {!showCatalogMenuPicker && (
                      <button
                        type="button"
                        onClick={() => setShowCatalogMenuPicker(true)}
                        className="mt-3 inline-flex items-center gap-1.5 bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                      >
                        <Utensils className="w-4 h-4" />
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
                        className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-2xs transition space-y-3 ${
                          item.isOutOfStock
                            ? 'border-red-400 bg-red-50/20'
                            : item.isExceeded
                            ? 'border-amber-400 bg-amber-50/20'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Product Selection with Photo & Details */}
                          <div className="flex items-start gap-3 flex-1">
                            {/* Product Thumbnail */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 shadow-2xs">
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
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[11px] font-bold text-gray-500">
                                    {lang === 'en' ? `Item #${index + 1}` : `Menu #${index + 1}`}
                                  </span>
                                  {matched?.category && (
                                    <span className="bg-emerald-50 text-[#2E6F40] text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                                      {matched.category}
                                    </span>
                                  )}
                                </div>

                                {/* Stock status badge */}
                                {item.isOutOfStock ? (
                                  <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-red-300">
                                    {lang === 'en' ? 'Out of Stock' : 'Stok Habis'}
                                  </span>
                                ) : (
                                  <span
                                    className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                      item.isNasemangkuk
                                        ? 'bg-emerald-50 text-[#2E6F40] border-emerald-300'
                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}
                                  >
                                    {item.isNasemangkuk && '🍚 Nasemangkuk • '}
                                    {lang === 'en' ? `Stock: ${item.availableStock}` : `Sisa Stok: ${item.availableStock} ${item.unit || 'porsi'}`}
                                  </span>
                                )}
                              </div>

                              {/* Dropdown Selector */}
                              <select
                                value={item.productId}
                                onChange={(e) => onChangeCartItemProduct(item.id, e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2E6F40]"
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
                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                            {/* Quantity Controls */}
                            <div>
                              <div className="text-[11px] font-bold text-gray-500 mb-1">
                                {t('order.quantity', 'Jumlah')}
                              </div>
                              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                                <button
                                  type="button"
                                  onClick={() => onUpdateCartItemQuantity(item.id, item.quantity - 1)}
                                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
                                >
                                  -
                                </button>
                                <span
                                  className={`px-3 py-1 text-xs font-bold min-w-8 text-center ${
                                    item.isExceeded || item.isOutOfStock
                                      ? 'text-red-600 bg-red-50'
                                      : 'text-gray-900'
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
                                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right min-w-28">
                              <div className="text-[11px] font-bold text-gray-500 mb-1">
                                {t('order.subtotal', 'Subtotal')}
                              </div>
                              <div className="text-sm sm:text-base font-extrabold text-[#2E6F40]">
                                {formatRupiah(itemSubtotal)}
                              </div>
                            </div>

                            {/* Remove Item */}
                            <button
                              type="button"
                              onClick={() => onRemoveCartItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition mt-4 cursor-pointer"
                              title="Hapus item ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Exceeded / Out of stock warning note */}
                        {item.isOutOfStock && (
                          <div className="text-[11px] font-bold text-red-600 flex items-center justify-between pt-1 border-t border-red-200">
                            <span>⚠️ Menu ini sedang habis dipesan untuk hari ini.</span>
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
                            <span>⚠️ Pesanan ({item.quantity}) melebihi sisa stok ({item.availableStock}).</span>
                            <button
                              type="button"
                              onClick={() => onUpdateCartItemQuantity(item.id, item.availableStock)}
                              className="text-amber-800 underline hover:text-amber-950 font-black cursor-pointer"
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
            <div className="space-y-4 border-b border-gray-100 pb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h4 className="font-extrabold text-[#2E6F40] text-lg sm:text-xl flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-[#4A9E60]" />
                  <span>{t('order.step3', '3. Sistem Otomatisasi Kurir & Cek Ongkir Geokoding')}</span>
                </h4>
                <span className="text-[11px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                  {lang === 'en' ? 'Haversine Real-Time Engine' : 'Formula Geokoding Real-Time'}
                </span>
              </div>

              {/* Static Warehouse Origin Card (Gudang Asasora di Tangerang) */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                    {t('order.warehouse_origin', 'Gudang Dapur Asal (Statis)')}
                  </span>
                  <span className="text-[10px] bg-white text-[#2E6F40] font-extrabold px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {t('order.warehouse_tag', 'Dapur Pusat Asasora Tangerang')}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1.5 gap-2">
                  <div>
                    <p className="font-black text-[#2E6F40] text-base">
                      {originWarehouse.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      {originWarehouse.address}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-800 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto shrink-0">
                    Lat: {originWarehouse.lat}, Lng: {originWarehouse.lng}
                  </div>
                </div>
              </div>

              {/* Geocoding Search & Coordinate Input Section */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4 shadow-2xs">
                {/* Integrated Geocoding Search Bar */}
                <div className="relative" ref={searchContainerRef}>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                    <span>{t('order.search_address', 'Cari Alamat / Titik Lokasi Rumah (Geokoding Terintegrasi)')}</span>
                    <span className="text-[11px] text-gray-400 font-normal">
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
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2E6F40] focus:outline-none text-xs sm:text-sm bg-gray-50/50"
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      {isSearchingGeocode && (
                        <Loader2 className="w-4 h-4 text-[#2E6F40] animate-spin absolute right-3.5 top-3.5" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleCalculateOngkir}
                      disabled={isCalculatingOngkir}
                      className="shrink-0 bg-[#2E6F40] hover:bg-green-800 disabled:opacity-75 text-white font-extrabold text-xs px-4 py-3 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      {isCalculatingOngkir ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Calculator className="w-4 h-4" />
                      )}
                      <span>{isCalculatingOngkir ? 'Menghitung...' : 'Hitung Ongkir'}</span>
                    </button>
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                      {searchResults.map((res, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectSearchResult(res)}
                          className="px-4 py-2.5 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-0 transition flex items-start gap-2.5"
                        >
                          <MapPin className="w-4 h-4 text-[#2E6F40] shrink-0 mt-0.5" />
                          <div className="text-xs text-gray-800 line-clamp-2 leading-snug">
                            {res.display_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                    {t('order.or_select_preset', 'Atau Pilih Preset Titik Cepat Jabodetabek:')}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_LOCATION_PRESETS.map((preset) => {
                      const isMatch = Math.abs(destLat - preset.lat) < 0.001 && Math.abs(destLng - preset.lng) < 0.001;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setSearchQuery(preset.name);
                            updateCoordinatesAndDistance(preset.lat, preset.lng, preset.name);
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                            isMatch
                              ? 'bg-[#2E6F40] text-white border-[#2E6F40] shadow-2xs'
                              : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Manual Lat & Lng Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
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
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
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
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono bg-white"
                    />
                  </div>
                </div>

                {/* Action Buttons: GPS & Calculate Ongkir */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="flex-1 bg-[#2E6F40] hover:bg-green-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{t('order.btn_gps', 'Gunakan GPS Lokasi Saya')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCalculateOngkir}
                    disabled={isCalculatingOngkir}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 text-white font-black py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    {isCalculatingOngkir ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Calculator className="w-3.5 h-3.5" />
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
                  <div className="bg-emerald-100/90 border-2 border-emerald-400 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950 shadow-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-[#2E6F40] shrink-0" />
                      <div>
                        <div className="font-black text-xs text-[#2E6F40]">
                          {lang === 'en' ? 'Shipping Rate Calculated!' : 'Tarif Ongkir Berhasil Dihitung!'}
                        </div>
                        <div className="text-[11px] text-emerald-800 mt-0.5">
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
                      <span className="text-xs bg-white text-[#2E6F40] font-black px-3 py-1 rounded-xl border border-emerald-300 shadow-2xs">
                        {formatRupiah(ongkirFeedback.fare)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Distance Badge & Status */}
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#2E6F40] shrink-0" />
                    <div className="text-xs text-emerald-950 font-medium">
                      <span className="font-bold">{t('order.dist_result', 'Jarak Terhitung')}:</span>{' '}
                      <span className="text-base font-black text-[#2E6F40] font-mono">{distanceKm} Km</span>{' '}
                      <span className="text-gray-500">({t('order.from_store', 'dari Gudang Asasora Tangerang')})</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-semibold bg-white/90 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                    {locationStatus}
                  </div>
                </div>
              </div>

              {/* COURIER SELECTION & REAL-TIME TARIFFS (Shopee / Gojek E-Commerce Style) */}
              <div className="space-y-4">
                {/* Category / Vehicle Filter Tabs */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-gray-800">
                      {lang === 'en' ? 'Choose Shipping Method:' : 'Pilih Metode & Tarif Kurir:'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCalculateOngkir}
                      disabled={isCalculatingOngkir}
                      className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-[#2E6F40] font-bold px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isCalculatingOngkir ? 'animate-spin' : ''}`} />
                      <span>{lang === 'en' ? 'Recalculate' : 'Hitung Ulang'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveCourierTab('all')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        activeCourierTab === 'all'
                          ? 'bg-[#2E6F40] text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('order.filter_all', 'Semua Kurir (7 Opsi)')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCourierTab('motor')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                        activeCourierTab === 'motor'
                          ? 'bg-[#2E6F40] text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>{t('order.filter_motor', 'Motor (3)')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCourierTab('mobil')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                        activeCourierTab === 'mobil'
                          ? 'bg-[#2E6F40] text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>{t('order.filter_mobil', 'Mobil (3)')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCourierTab('toko')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                        activeCourierTab === 'toko'
                          ? 'bg-[#2E6F40] text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{t('order.filter_toko', 'Toko')}</span>
                    </button>
                  </div>
                </div>

                {/* Over 40 Km Banner & WhatsApp Button */}
                {isOver40Km ? (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 text-center space-y-3 shadow-sm">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                      <Truck className="w-6 h-6" />
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
                      className="inline-flex items-center gap-2 bg-[#2E6F40] hover:bg-green-800 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{t('order.btn_wa_out_of_town', 'Hubungi Admin via WhatsApp untuk Pengiriman Luar Kota')}</span>
                    </a>
                  </div>
                ) : (
                  /* Courier Cards Grid - Shopee / Gojek E-Commerce UI */
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
                          <div className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider pl-1">
                            {groupTitle}
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            {groupCouriers.map((courier) => {
                              const isSelected = selectedCourierId === courier.id;
                              const isAvailable = courier.isAvailable;

                              let brandBadge = null;
                              if (courier.courierProvider === 'gojek') {
                                brandBadge = (
                                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                                    GOJEK
                                  </span>
                                );
                              } else if (courier.courierProvider === 'grab') {
                                brandBadge = (
                                  <span className="bg-green-100 text-green-900 border border-green-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                                    GRAB
                                  </span>
                                );
                              } else if (courier.courierProvider === 'lalamove') {
                                brandBadge = (
                                  <span className="bg-orange-100 text-orange-900 border border-orange-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                                    LALAMOVE
                                  </span>
                                );
                              } else {
                                brandBadge = (
                                  <span className="bg-teal-100 text-teal-950 border border-teal-300 text-[10px] font-black px-2 py-0.5 rounded-md">
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
                                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                    !isAvailable
                                      ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-emerald-50/90 border-[#2E6F40] ring-2 ring-[#2E6F40]/30 shadow-xs cursor-pointer'
                                      : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer'
                                  }`}
                                >
                                  {/* Left details */}
                                  <div className="flex items-start space-x-3">
                                    <div
                                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                                        !isAvailable
                                          ? 'border-gray-300 bg-gray-200'
                                          : isSelected
                                          ? 'border-[#2E6F40] bg-[#2E6F40]'
                                          : 'border-gray-300 bg-white'
                                      }`}
                                    >
                                      {isSelected && isAvailable && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                      )}
                                    </div>

                                    <div>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                                          {courier.name}
                                        </span>
                                        {brandBadge}
                                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-gray-200">
                                          {courier.vehicleType === 'mobil' ? (
                                            <Car className="w-3 h-3 text-blue-600" />
                                          ) : (
                                            <Bike className="w-3 h-3 text-emerald-600" />
                                          )}
                                          <span>{courier.vehicleType === 'mobil' ? (lang === 'en' ? 'Car' : 'Mobil') : (lang === 'en' ? 'Motorcycle' : 'Motor')}</span>
                                        </span>
                                      </div>

                                      <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                                        <span>{courier.description}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="flex items-center gap-1 text-gray-700 font-semibold">
                                          <Clock className="w-3 h-3 text-emerald-700" />
                                          <span>{courier.estTime || courier.estimatedTime}</span>
                                        </span>
                                      </div>

                                      {!isAvailable && (
                                        <div className="mt-1 inline-block text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md border border-red-200">
                                          {courier.statusText || t('order.out_of_store_coverage', 'Di luar area Kurir Toko')}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right fare price */}
                                  <div className="text-right sm:pl-4 self-end sm:self-auto shrink-0">
                                    {isAvailable ? (
                                      <>
                                        <div className="font-black text-[#2E6F40] text-sm sm:text-base font-mono">
                                          {formatRupiah(courier.calculatedFare)}
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                          ({distanceKm} Km)
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-xs font-bold text-gray-400 italic">
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
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 space-y-3 shadow-inner">
              <h4 className="font-black text-[#2E6F40] text-base sm:text-lg mb-2 flex items-center justify-between">
                <span>{t('order.step4', '4. Rincian Total Pembayaran')}</span>
                <span className="text-xs text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-full border border-emerald-200">
                  {cartItems.length} {lang === 'en' ? 'Menu Items' : 'Macam Menu'}
                </span>
              </h4>

              <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                <span>
                  {t('order.total_products', 'Subtotal Produk')} ({cartItems.reduce((acc, it) => acc + it.quantity, 0)} {lang === 'en' ? 'portions' : 'porsi'}):
                </span>
                <span className="font-bold text-gray-800" id="totalProdukText">
                  {formatRupiah(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                <span>
                  {t('order.shipping_fee', 'Ongkos Kirim')} ({activeCourier?.name || 'Pilih Kurir Di Atas'}):
                </span>
                <span className="font-bold text-gray-800" id="totalOngkirText">
                  {formatRupiah(shippingCost)}
                </span>
              </div>

              <hr className="border-green-200 my-2" />

              <div className="flex justify-between text-base sm:text-xl font-black text-[#2E6F40]">
                <span>{t('order.subtotal_accumulated', 'TOTAL SEMENTARA')}:</span>
                <span id="totalKeseluruhanText">
                  {formatRupiah(subtotal + shippingCost)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 italic">
                {t(
                  'order.unique_code_note',
                  '* Kode unik verifikasi otomatis (3 digit) akan ditambahkan saat invoice resmi diterbitkan.'
                )}
              </p>
            </div>

            {/* Action Button: Buat Order & Terbitkan Invoice */}
            {!createdOrder && (
              <div className="space-y-3">
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

                <button
                  type="button"
                  id="btn-buat-order"
                  onClick={() => handleCreateOrder()}
                  disabled={hasStockIssues}
                  className={`w-full font-extrabold py-4 px-6 rounded-2xl shadow-xl transition duration-200 flex items-center justify-center space-x-2 text-base ${
                    hasStockIssues
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#F3C623] hover:bg-[#D1A310] text-gray-900 cursor-pointer transform hover:-translate-y-0.5 active:scale-98'
                  }`}
                >
                  <ReceiptText className="w-5 h-5 text-green-950" />
                  <span>{t('order.btn_create_invoice', 'Buat Order & Terbitkan Invoice Resmi')}</span>
                </button>
              </div>
            )}

            {/* 5. INVOICE RESMI & INSTRUKSI PEMBAYARAN */}
            {createdOrder && (
              <div className="space-y-6 pt-4" id="checkout-invoice-panel">
                <div className="text-center">
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-300">
                    {t('order.step5', 'Langkah Terakhir: Pembayaran')}
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-black text-[#2E6F40] mt-2">
                    {t('order.invoice_issued', 'Invoice Pesanan Telah Terbit')}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-lg mx-auto">
                    {t(
                      'order.invoice_sub',
                      'Data pesanan Anda telah dikonversi menjadi Invoice Resmi berformat siap cetak & unduh.'
                    )}
                  </p>
                </div>

                <InvoiceView order={createdOrder} company={company} />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
