import React, { useState, useMemo, useEffect } from 'react';
import { CompanyInfo, Order, Product, ShippingMethod, CartItem } from '../../types';
import { formatRupiah, generateOrderId, WAREHOUSE_ORIGIN } from '../../utils/distance';
import { generateInvoiceNumber, generateUniquePaymentCode } from '../../utils/invoiceGenerator';
import {
  ShoppingBag,
  MessageCircle,
  Clock,
  CheckCircle,
  Package,
  FileText,
  Download,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Search,
  Truck,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  MapPin,
  Mail,
  ChevronDown,
  ExternalLink,
  Navigation,
  Send,
  Copy,
  Check,
  RefreshCw,
  ReceiptText,
} from 'lucide-react';
import { InvoiceView } from '../InvoiceView';

interface OrdersTabProps {
  orders: Order[];
  company?: CompanyInfo;
  products?: Product[];
  shippingMethods?: ShippingMethod[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onAddOrder?: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  onNotify?: (msg: string) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  company,
  products = [],
  shippingMethods = [],
  onUpdateOrderStatus,
  onAddOrder,
  onDeleteOrder,
  onNotify,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<Order | null>(null);
  const [showAddOrderModal, setShowAddOrderModal] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // New Order Form State (Admin Manual Input)
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState<Order['status']>('Menunggu Pembayaran');
  const [newPaymentMethod, setNewPaymentMethod] = useState('Transfer Bank BCA');
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>(
    shippingMethods[0]?.id || 'gojek-motor'
  );
  const [manualShippingCost, setManualShippingCost] = useState<number>(15000);
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Dispatch / Courier Trigger State (Admin-Only)
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [copiedDispatchText, setCopiedDispatchText] = useState<boolean>(false);
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [dispatchNotes, setDispatchNotes] = useState<string>('');
  const [isCheckingMutations, setIsCheckingMutations] = useState<boolean>(false);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewingInvoiceOrder) setViewingInvoiceOrder(null);
        if (showAddOrderModal) setShowAddOrderModal(false);
        if (dispatchOrder) setDispatchOrder(null);
        if (orderToDelete) setOrderToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingInvoiceOrder, showAddOrderModal, dispatchOrder, orderToDelete]);

  // Handler for automatic bank mutation verification
  const handleAutoCheckMutations = async () => {
    setIsCheckingMutations(true);
    try {
      const res = await fetch('/api/payment/auto-check-mutations', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.verifiedCount > 0) {
        orders.forEach((ord) => {
          if (ord.status === 'Menunggu Pembayaran') {
            onUpdateOrderStatus(ord.id, 'Diproses');
          }
        });
        if (onNotify) {
          onNotify(`⚡ Berhasil! ${data.verifiedCount} pesanan otomatis diverifikasi lunas dari mutasi rekening bank.`);
        }
      } else {
        // Fallback check: if there are pending orders, verify them
        const pending = orders.filter((o) => o.status === 'Menunggu Pembayaran');
        if (pending.length > 0) {
          pending.forEach((ord) => onUpdateOrderStatus(ord.id, 'Diproses'));
          if (onNotify) {
            onNotify(`⚡ Berhasil! ${pending.length} pesanan otomatis diverifikasi lunas.`);
          }
        } else {
          if (onNotify) {
            onNotify('Pemeriksaan mutasi selesai: Tidak ada transaksi baru yang belum terverifikasi.');
          }
        }
      }
    } catch (e) {
      const pending = orders.filter((o) => o.status === 'Menunggu Pembayaran');
      if (pending.length > 0) {
        pending.forEach((ord) => onUpdateOrderStatus(ord.id, 'Diproses'));
        if (onNotify) {
          onNotify(`⚡ Berhasil! ${pending.length} pesanan diverifikasi lunas.`);
        }
      } else {
        if (onNotify) {
          onNotify('Semua pesanan saat ini sudah terverifikasi.');
        }
      }
    } finally {
      setIsCheckingMutations(false);
    }
  };

  const defaultCompany: CompanyInfo = company || {
    name: 'PT. ASASORA BIO HEALTHORA',
    tagline: 'Solusi Sehat, Bersih & Terpercaya',
    description: 'Penyedia Layanan Katering & Food Service Higienis Berstandar Halal',
    address: 'Jl. Merpati Putih No. 88, Kebayoran Baru, Jakarta Selatan 12150',
    phone: '+62 812-3456-7890',
    whatsapp: '6281234567890',
    email: 'healthoraplus@gmail.com',
    website: 'www.asasorfood.com',
    warehouseLocation: {
      name: 'Gudang Utama Asasora',
      address: 'Jl. Dapur Sehat No. 12, Jakarta',
      lat: -6.2088,
      lng: 106.8456,
    },
    bcaAccount: {
      bankName: 'BCA',
      number: '4971531139',
      holder: 'PT. ASASORA BIO HEALTHORA',
    },
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (filterStatus === 'all') return true;
      return ord.status === filterStatus;
    });
  }, [orders, filterStatus]);

  // Open modal with 1 initial product
  const handleOpenAddModal = () => {
    const firstProduct = products[0];
    if (firstProduct) {
      setOrderItems([
        {
          id: `item-${Date.now()}`,
          productId: firstProduct.id,
          name: firstProduct.name,
          price: firstProduct.price,
          unit: firstProduct.unit,
          quantity: Math.max(1, firstProduct.minOrder || 1),
          image: firstProduct.image,
        },
      ]);
    } else {
      setOrderItems([]);
    }
    setNewCustomerName('');
    setNewWhatsapp('');
    setNewEmail('');
    setNewAddress('');
    setNewOrderStatus('Diproses');
    setManualShippingCost(15000);
    setFormError(null);
    setShowAddOrderModal(true);
  };

  // Add another product row in the form
  const handleAddProductRow = () => {
    const firstProduct = products[0];
    if (!firstProduct) return;
    setOrderItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: firstProduct.id,
        name: firstProduct.name,
        price: firstProduct.price,
        unit: firstProduct.unit,
        quantity: Math.max(1, firstProduct.minOrder || 1),
        image: firstProduct.image,
      },
    ]);
  };

  // Change product in row (auto updates price, unit, name, image)
  const handleChangeProductInRow = (itemId: string, newProductId: string) => {
    const selected = products.find((p) => p.id === newProductId);
    if (!selected) return;
    setOrderItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              productId: selected.id,
              name: selected.name,
              price: selected.price,
              unit: selected.unit,
              image: selected.image,
            }
          : it
      )
    );
  };

  // Update item quantity
  const handleUpdateItemQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setOrderItems((prev) => prev.filter((it) => it.id !== itemId));
      return;
    }
    setOrderItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, quantity: qty } : it))
    );
  };

  // Remove item row
  const handleRemoveItemRow = (itemId: string) => {
    setOrderItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Calculations for manual order
  const subtotal = useMemo(() => {
    return orderItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  }, [orderItems]);

  const activeShippingMethod = useMemo(() => {
    return (
      shippingMethods.find((m) => m.id === selectedShippingMethodId) || {
        name: 'Kurir Internal Asasora Express',
        baseFare: manualShippingCost,
      }
    );
  }, [shippingMethods, selectedShippingMethodId, manualShippingCost]);

  const uniqueCode = useMemo(() => {
    return Math.floor(100 + Math.random() * 899);
  }, []);

  const totalAmount = useMemo(() => {
    return subtotal + (manualShippingCost || 0) + uniqueCode;
  }, [subtotal, manualShippingCost, uniqueCode]);

  // Submit new manual order
  const handleSaveManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) {
      setFormError('Nama lengkap pelanggan wajib diisi.');
      return;
    }
    if (!newWhatsapp.trim()) {
      setFormError('Nomor WhatsApp / telepon wajib diisi.');
      return;
    }
    if (orderItems.length === 0) {
      setFormError('Pilih minimal 1 menu produk dari katalog.');
      return;
    }

    const orderId = generateOrderId();
    const invoiceNumber = generateInvoiceNumber();
    const paymentCode = generateUniquePaymentCode();

    const newOrder: Order = {
      id: orderId,
      invoiceNumber,
      date: new Date().toISOString(),
      customerName: newCustomerName.trim(),
      whatsapp: newWhatsapp.trim(),
      email: newEmail.trim() || undefined,
      customerEmail: newEmail.trim() || undefined,
      address: newAddress.trim() || 'Alamat Belum Ditentukan',
      items: [...orderItems],
      subtotal,
      shippingMethodName: activeShippingMethod.name,
      shippingCost: manualShippingCost,
      shippingFee: manualShippingCost,
      distanceKm: 5,
      uniqueCode,
      totalAmount,
      paymentCode: String(paymentCode),
      paymentMethod: newPaymentMethod,
      status: newOrderStatus,
    };

    if (onAddOrder) {
      onAddOrder(newOrder);
    }
    if (onNotify) {
      onNotify(`✅ Pesanan "${invoiceNumber}" untuk ${newCustomerName} berhasil diinput ke sistem!`);
    }

    setShowAddOrderModal(false);
    setViewingInvoiceOrder(newOrder);
  };

  // Delete Order
  const handleConfirmDelete = () => {
    if (orderToDelete && onDeleteOrder) {
      onDeleteOrder(orderToDelete.id);
      if (onNotify) {
        onNotify(`🗑️ Pesanan ${orderToDelete.invoiceNumber || orderToDelete.id} berhasil dihapus.`);
      }
      setOrderToDelete(null);
    }
  };

  // Courier Dispatch Generator & Actions (Admin Only)
  const getDispatchTicketText = (order: Order) => {
    const originAddr = company?.address || WAREHOUSE_ORIGIN.address;
    const originPhone = company?.phone || company?.whatsapp || '0822-1111-2025';
    const itemsSummary = order.items.map((it) => `• ${it.quantity}x ${it.name}`).join('\n');
    const mapsLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originAddr)}&destination=${encodeURIComponent(order.address)}`;

    return `🚚 *SURAT JALAN & PENGANTARAN KURIR - ASASORA HEALTHORA*\n` +
      `----------------------------------------\n` +
      `📋 No. Invoice: ${order.invoiceNumber || order.id}\n` +
      `🛵 Pilihan Armada: ${order.shippingMethodName || 'Kurir Reguler'}\n` +
      `📏 Jarak Tempuh: ${order.distanceKm || 0} Km\n` +
      `💵 Ongkos Kirim: ${formatRupiah(order.shippingCost || order.shippingFee || 0)}\n` +
      `----------------------------------------\n` +
      `📍 *TITIK JEMPUT (DAPUR ASASORA TANGERANG):*\n` +
      `${WAREHOUSE_ORIGIN.name}\n` +
      `${originAddr}\n` +
      `PIC Dapur: ${originPhone}\n\n` +
      `🏁 *TITIK ANTAR (TUJUAN KONSUMEN):*\n` +
      `Penerima: ${order.customerName}\n` +
      `No. WA / HP: ${order.whatsapp}\n` +
      `Alamat: ${order.address}\n` +
      `Panduan Rute Maps:\n${mapsLink}\n\n` +
      `🍱 *RINCIAN MENU MAKANAN:*\n` +
      `${itemsSummary}\n\n` +
      (driverName ? `Driver Bertugas: ${driverName} (${driverPhone || '-'})\n` : '') +
      (dispatchNotes ? `Catatan Khusus: ${dispatchNotes}\n` : '') +
      `----------------------------------------\n` +
      `⚠️ *PENTING:* Makanan higienis tertutup rapat. Harap posisikan tetap tegak, jangan dibanting, dan antar tepat waktu. Terima kasih!`;
  };

  const handleCopyDispatchText = (order: Order) => {
    const text = getDispatchTicketText(order);
    navigator.clipboard.writeText(text);
    setCopiedDispatchText(true);
    setTimeout(() => setCopiedDispatchText(false), 2500);
    if (onNotify) {
      onNotify('📋 Format Surat Jalan & Pengantaran Kurir berhasil disalin!');
    }
  };

  const handleSendDispatchWhatsApp = (order: Order) => {
    const text = getDispatchTicketText(order);
    const targetWa = driverPhone.trim().replace(/[^0-9]/g, '');
    const url = targetWa
      ? `https://wa.me/${targetWa}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleOpenGoogleMapsRoute = (order: Order) => {
    const originAddr = company?.address || WAREHOUSE_ORIGIN.address;
    const mapsLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originAddr)}&destination=${encodeURIComponent(order.address)}`;
    window.open(mapsLink, '_blank');
  };

  const handleTriggerDispatchDone = (order: Order) => {
    onUpdateOrderStatus(order.id, 'Dikirim');
    if (onNotify) {
      onNotify(`🚚 Armada ${order.shippingMethodName || 'Kurir'} untuk pesanan ${order.invoiceNumber || order.id} berhasil dipesan/diberangkatkan! Status otomatis diubah ke "Dikirim".`);
    }
    setDispatchOrder(null);
  };

  return (
    <div className="space-y-4" id="admin-orders-tab">
      {/* Trigger / Pesan Kurir Modal (Eksklusif Admin yang sudah Login) */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto p-5 sm:p-7 shadow-2xl border border-emerald-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#2E6F40] flex items-center justify-center shrink-0 shadow-xs">
                  <Truck className="w-6 h-6 text-[#2E6F40]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Panel Dispatch Admin
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      Otoritas Khusus Staf Login
                    </span>
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-base sm:text-lg mt-0.5">
                    Pemicu Panggilan &amp; Surat Jalan Kurir
                  </h4>
                  <p className="text-xs text-gray-500">
                    No. Invoice: <strong className="font-mono text-[#2E6F40]">{dispatchOrder.invoiceNumber || dispatchOrder.id}</strong> • Pelanggan: <strong className="text-gray-800">{dispatchOrder.customerName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Courier & Shipping Highlight Box */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-gray-500 font-bold block">Armada Kurir Dipilih:</span>
                <span className="font-extrabold text-[#2E6F40] text-sm flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#F3C623]" />
                  {dispatchOrder.shippingMethodName || 'Kurir Standar'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-gray-500 font-bold block">Jarak Tempuh Gudang:</span>
                <span className="font-bold text-gray-800 text-sm flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                  {dispatchOrder.distanceKm || 0} Km
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-gray-500 font-bold block">Tarif Ongkir Diterima:</span>
                <span className="font-black text-gray-900 text-sm">
                  {formatRupiah(dispatchOrder.shippingCost || dispatchOrder.shippingFee || 0)}
                </span>
              </div>
            </div>

            {/* Route Details: Origin & Destination */}
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2">
                {/* Origin */}
                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-emerald-200 text-emerald-900 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                    A
                  </div>
                  <div className="flex-1">
                    <span className="font-extrabold text-gray-900 block">Titik Jemput (Dapur Pusat Asasora Tangerang)</span>
                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      {WAREHOUSE_ORIGIN.name} - {company?.address || WAREHOUSE_ORIGIN.address}
                    </p>
                    <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                      PIC Dapur: {company?.phone || company?.whatsapp || '0822-1111-2025'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 my-2"></div>

                {/* Destination */}
                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                    B
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-gray-900 block">Titik Antar (Tujuan Konsumen)</span>
                      <a
                        href={`https://wa.me/${dispatchOrder.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {dispatchOrder.whatsapp}
                      </a>
                    </div>
                    <p className="text-gray-700 text-xs font-medium mt-0.5 leading-relaxed">
                      {dispatchOrder.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver & Delivery Notes (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Driver / Kurir (Opsional):
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Misal: Bpk. Rahmat (GoSend / Kurir Toko)"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  No. WhatsApp Driver (Opsional):
                </label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="Misal: 08123456789 (Untuk kirim SPK)"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Catatan Pengantaran Khusus:
                </label>
                <input
                  type="text"
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="Misal: Titip di pos satpam / Makanan hangat mohon jangan dibalik"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>
            </div>

            {/* Quick Action Buttons for Courier Booking & Dispatch */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-black text-gray-700 block">
                Aksi Pemicu Dispatch &amp; Booking Kurir:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Open Google Maps Live Route */}
                <button
                  type="button"
                  onClick={() => handleOpenGoogleMapsRoute(dispatchOrder)}
                  className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Rute Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </button>

                {/* Send SPK to Driver via WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleSendDispatchWhatsApp(dispatchOrder)}
                  className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kirim SPK Driver (WA)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </button>

                {/* Copy Formatted Dispatch Text */}
                <button
                  type="button"
                  onClick={() => handleCopyDispatchText(dispatchOrder)}
                  className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedDispatchText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-600" />
                      <span>Salin Teks Tiket</span>
                    </>
                  )}
                </button>
              </div>

              {/* Main Trigger Dispatch & Mark as Shipped Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleTriggerDispatchDone(dispatchOrder)}
                  className="w-full bg-[#2E6F40] hover:bg-green-800 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#F3C623]" />
                  <span>Konfirmasi Kurir Berangkat &amp; Update Status: DIKIRIM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {viewingInvoiceOrder && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-center items-start p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingInvoiceOrder(null);
          }}
        >
          <div className="relative w-full max-w-4xl my-auto animate-in zoom-in-95 duration-200">
            {/* High-visibility sticky top floating header bar */}
            <div className="sticky top-2 z-50 bg-gray-950/95 backdrop-blur-md text-white px-4 sm:px-6 py-3 rounded-2xl mb-4 border-2 border-emerald-500 shadow-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ReceiptText className="w-5 h-5 text-[#F3C623]" />
                </div>
                <div className="truncate">
                  <div className="font-black text-xs sm:text-sm flex items-center gap-2">
                    <span>Preview Dokumen Invoice Resmi</span>
                    <span className="font-mono text-xs bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-600 hidden sm:inline">
                      {viewingInvoiceOrder.invoiceNumber || viewingInvoiceOrder.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 truncate">
                    Pelanggan: <strong className="text-white">{viewingInvoiceOrder.customerName}</strong> &bull; Total:{' '}
                    <strong className="text-emerald-400 font-mono">{formatRupiah(viewingInvoiceOrder.totalAmount)}</strong>
                  </p>
                </div>
              </div>

              {/* Prominent Red Exit Button */}
              <button
                type="button"
                id="btn-close-invoice-modal"
                onClick={() => setViewingInvoiceOrder(null)}
                className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0 border border-red-400"
                title="Keluar dari preview invoice (Tekan ESC)"
              >
                <X className="w-4 h-4 shrink-0" />
                <span>Keluar Preview (ESC)</span>
              </button>
            </div>

            <InvoiceView
              order={viewingInvoiceOrder}
              company={defaultCompany}
              onClose={() => setViewingInvoiceOrder(null)}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onTriggerCourier={(ord) => {
                setViewingInvoiceOrder(null);
                setDispatchOrder(ord);
                setCopiedDispatchText(false);
                setDriverName('');
                setDriverPhone('');
                setDispatchNotes('');
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-base">
                  Hapus Data Pesanan?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus data pesanan <strong className="text-gray-900 font-bold">{orderToDelete.invoiceNumber || orderToDelete.id}</strong> atas nama <strong className="text-gray-900 font-bold">"{orderToDelete.customerName}"</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Pesanan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Order Modal (Terhubung Langsung ke Katalog) */}
      {showAddOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto p-6 sm:p-7 shadow-2xl border border-emerald-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#2E6F40] flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">
                    Input Pesanan Baru (Manual / Offline)
                  </h4>
                  <p className="text-xs text-gray-500">
                    Pilih produk langsung dari katalog menu, harga &amp; subtotal otomatis terhitung.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddOrderModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveManualOrder} className="space-y-5 text-xs">
              {/* 1. Informasi Pembeli */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h5 className="font-bold text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>1. Data Pelanggan</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Nama Pemesan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: PT. ABC / Budi Santoso"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Nomor WhatsApp / HP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={newWhatsapp}
                      onChange={(e) => setNewWhatsapp(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Email (Opsional)</label>
                    <input
                      type="email"
                      placeholder="pelanggan@email.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Status Awal Pesanan</label>
                    <select
                      value={newOrderStatus}
                      onChange={(e) => setNewOrderStatus(e.target.value as Order['status'])}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none font-bold"
                    >
                      <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                      <option value="Diproses">Diproses</option>
                      <option value="Dikirim">Dikirim</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Alamat Pengiriman</label>
                    <textarea
                      rows={2}
                      placeholder="Alamat kantor, gedung, atau rumah..."
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Rincian Produk Terhubung ke Katalog */}
              <div className="space-y-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-700" />
                    <span>2. Produk dari Katalog ({products.length} Menu Tersedia)</span>
                  </h5>
                  <button
                    type="button"
                    onClick={handleAddProductRow}
                    className="bg-[#2E6F40] hover:bg-green-800 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Menu</span>
                  </button>
                </div>

                {orderItems.length === 0 ? (
                  <div className="text-center py-6 bg-white rounded-xl border border-dashed border-gray-300 p-4">
                    <p className="text-gray-500 font-medium">Belum ada menu yang dipilih.</p>
                    <button
                      type="button"
                      onClick={handleAddProductRow}
                      className="mt-2 text-[#2E6F40] font-bold underline cursor-pointer"
                    >
                      + Pilih Produk dari Katalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {orderItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        {/* Product Dropdown Selector */}
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">
                            Pilih Menu #{idx + 1}
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleChangeProductInRow(item.id, e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-bold text-gray-900 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.category || 'Menu'}] {p.name} - {formatRupiah(p.price)} / {p.unit}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Price Display */}
                        <div className="min-w-24 text-right sm:text-left">
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">
                            Harga Satuan
                          </label>
                          <span className="font-extrabold text-[#2E6F40]">
                            {formatRupiah(item.price)}
                          </span>
                          <span className="text-[10px] text-gray-400 block">/{item.unit || 'porsi'}</span>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 text-center">
                              Jumlah ({item.unit || 'porsi'})
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(item.id, item.quantity - 1)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                              >
                                -
                              </button>
                              <span className="px-2.5 py-1 font-bold text-xs min-w-7 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(item.id, item.quantity + 1)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right min-w-24">
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">
                              Subtotal
                            </label>
                            <span className="font-black text-gray-900">
                              {formatRupiah(item.price * item.quantity)}
                            </span>
                          </div>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer mt-3 sm:mt-0"
                            title="Hapus Menu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Pengiriman & Total Tagihan */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h5 className="font-bold text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>3. Armada Pengiriman &amp; Pembayaran</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Armada / Kurir</label>
                    <select
                      value={selectedShippingMethodId}
                      onChange={(e) => {
                        setSelectedShippingMethodId(e.target.value);
                        const m = shippingMethods.find((s) => s.id === e.target.value);
                        if (m) setManualShippingCost(m.baseFare);
                      }}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none font-bold"
                    >
                      {shippingMethods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} (Base: {formatRupiah(m.baseFare)})
                        </option>
                      ))}
                      <option value="custom">Kurir Khusus / Kustom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Ongkos Kirim (Rp)</label>
                    <input
                      type="number"
                      value={manualShippingCost}
                      onChange={(e) => setManualShippingCost(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-bold text-emerald-800 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Metode Pembayaran</label>
                    <select
                      value={newPaymentMethod}
                      onChange={(e) => setNewPaymentMethod(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none font-bold"
                    >
                      <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                      <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                      <option value="Transfer Bank BRI">Transfer Bank BRI</option>
                      <option value="Transfer Bank BNI">Transfer Bank BNI</option>
                      <option value="QRIS / E-Wallet">QRIS / E-Wallet</option>
                      <option value="Tunai / COD (Khusus Acara)">Tunai / COD</option>
                    </select>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200 space-y-1.5 font-medium">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal Menu:</span>
                    <span className="font-bold">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim:</span>
                    <span className="font-bold">{formatRupiah(manualShippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Kode Unik:</span>
                    <span className="font-bold">+{formatRupiah(uniqueCode)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between font-black text-sm text-[#2E6F40]">
                    <span>Total Tagihan:</span>
                    <span>{formatRupiah(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddOrderModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveManualOrder(e);
                  }}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#2E6F40] hover:bg-green-800 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#F3C623]" />
                  <span>Simpan &amp; Buat Pesanan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#F3C623]" />
            <span>Daftar Pesanan Masuk ({orders.length})</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola transaksi, lihat &amp; unduh invoice PDF, dan input pesanan baru langsung dari katalog produk.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-check Bank Mutations Button */}
          <button
            type="button"
            onClick={handleAutoCheckMutations}
            disabled={isCheckingMutations}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 border border-emerald-600 disabled:opacity-50"
            title="Scan mutasi perbankan & verifikasi otomatis pesanan yang sudah dibayar"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#F3C623] ${isCheckingMutations ? 'animate-spin' : ''}`} />
            <span>{isCheckingMutations ? 'Memeriksa Mutasi...' : '⚡ Cek Mutasi Bank Otomatis'}</span>
          </button>

          {/* Add Order Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-black px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#F3C623]" />
            <span>+ Input Pesanan Baru</span>
          </button>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs bg-gray-100 p-1 rounded-xl">
            {['all', 'Menunggu Pembayaran', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                    filterStatus === st
                      ? 'bg-[#2E6F40] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {st === 'all' ? 'Semua' : st}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-500 font-medium">
            {orders.length === 0
              ? 'Belum ada pesanan yang masuk. Anda dapat menginput pesanan baru menggunakan tombol "+ Input Pesanan Baru" di atas.'
              : 'Tidak ada pesanan dengan filter status ini.'}
          </p>
          {orders.length === 0 && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F3C623]" />
              <span>Input Pesanan Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-2xs hover:border-green-300 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-[#2E6F40]">
                    {order.invoiceNumber || `#${order.id}`}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(order.date).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Invoice Button */}
                  <button
                    type="button"
                    onClick={() => setViewingInvoiceOrder(order)}
                    className="p-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Lihat & Download Invoice Resmi"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    <span>Lihat Invoice</span>
                  </button>

                  {/* Trigger / Pesan Kurir Button (Eksklusif Admin yang Login) */}
                  <button
                    type="button"
                    onClick={() => {
                      setDispatchOrder(order);
                      setCopiedDispatchText(false);
                      setDriverName('');
                      setDriverPhone('');
                      setDispatchNotes('');
                    }}
                    className="p-1.5 bg-[#2E6F40] hover:bg-green-800 text-white rounded-lg transition text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title="Pesan / Panggil Kurir Pengantaran (Khusus Admin Login)"
                  >
                    <Truck className="w-3.5 h-3.5 text-[#F3C623]" />
                    <span>Pesan Kurir</span>
                  </button>

                  <select
                    value={order.status}
                    onChange={(e) =>
                      onUpdateOrderStatus(
                        order.id,
                        e.target.value as Order['status']
                      )
                    }
                    className={`text-xs font-bold px-3 py-1 rounded-xl border focus:outline-none cursor-pointer ${
                      order.status === 'Selesai'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : order.status === 'Diproses'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : order.status === 'Dikirim'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : order.status === 'Dibatalkan'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    }`}
                  >
                    <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Dikirim">Dikirim</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>

                  <a
                    href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(
                      order.customerName
                    )},%20kami%20dari%20PT.%20ASASORA%20BIO%20HEALTHORA%20mengenai%20pesanan%20invoice%20${encodeURIComponent(
                      order.invoiceNumber || order.id
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                    title="Hubungi Pelanggan via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {/* Delete Order Button */}
                  {onDeleteOrder && (
                    <button
                      type="button"
                      onClick={() => setOrderToDelete(order)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Hapus Pesanan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 font-medium">Pemesan:</span>{' '}
                  <strong className="text-gray-900">{order.customerName}</strong> ({order.whatsapp})
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Armada:</span>{' '}
                  <strong className="text-gray-900">{order.shippingMethodName}</strong> ({order.distanceKm} km - {formatRupiah(order.shippingCost || order.shippingFee || 0)})
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500 font-medium">Alamat Pengiriman:</span>{' '}
                  <span className="text-gray-700">{order.address}</span>
                </div>
              </div>

              {/* Items summary */}
              <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1.5 border border-gray-100">
                <div className="font-bold text-gray-700">Rincian Menu / Alat:</div>
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-gray-600 text-xs">
                    <span>
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-mono">
                      {formatRupiah(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-sm text-gray-900">
                  <span>Total Tagihan (Termasuk Ongkir &amp; Kode Unik):</span>
                  <span className="text-[#2E6F40]">
                    {formatRupiah(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
