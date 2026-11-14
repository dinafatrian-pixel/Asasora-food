import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  Share2,
  AlertCircle,
  Clock,
  CheckCircle2,
  Building2,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Truck,
  MapPin,
  Calendar,
  QrCode,
  X,
  RefreshCw,
  Zap,
  ArrowLeft,
  Smartphone,
} from 'lucide-react';
import { CompanyInfo, Order } from '../types';
import { downloadInvoicePdf, formatRupiahSpaced } from '../utils/invoiceGenerator';
import { formatRupiah, generateOrderWhatsAppMessage } from '../utils/distance';
import { MinsoraAvatar } from './MinsoraAvatar';

interface InvoiceViewProps {
  order: Order;
  company: CompanyInfo;
  onClose?: () => void;
  onTriggerCourier?: (order: Order) => void;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  order,
  company,
  onClose,
  onTriggerCourier,
  onUpdateOrderStatus,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedBca, setCopiedBca] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedInvNum, setCopiedInvNum] = useState(false);
  const [copiedVa, setCopiedVa] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'text'>('visual');
  const [logoSize, setLogoSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Automatic Payment & Status Synchronization
  const [currentStatus, setCurrentStatus] = useState<Order['status']>(order.status || 'Menunggu Pembayaran');
  const [paymentTab, setPaymentTab] = useState<'qris' | 'va' | 'manual'>('qris');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [paymentAlert, setPaymentAlert] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Sync status if parent order prop updates
  useEffect(() => {
    if (order.status) {
      setCurrentStatus(order.status);
    }
  }, [order.status]);

  // Real-time polling: automatically check payment status without buyer manual confirmation
  useEffect(() => {
    if (currentStatus !== 'Menunggu Pembayaran') return;
    let isMounted = true;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/check-status/${encodeURIComponent(order.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.isPaid && isMounted) {
            setCurrentStatus('Diproses');
            onUpdateOrderStatus?.(order.id, 'Diproses');
            setPaymentAlert({
              type: 'success',
              message: 'Pembayaran berhasil terdeteksi otomatis oleh sistem perbankan. Status pesanan kini: DIPROSES.',
            });
          }
        }
      } catch {
        // quiet error in background polling
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentStatus, order.id, onUpdateOrderStatus]);

  // Handler: Manual status check button
  const handleCheckPaymentStatus = async () => {
    setIsCheckingPayment(true);
    setPaymentAlert(null);
    try {
      const res = await fetch(`/api/payment/check-status/${encodeURIComponent(order.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.isPaid) {
          setCurrentStatus('Diproses');
          onUpdateOrderStatus?.(order.id, 'Diproses');
          setPaymentAlert({
            type: 'success',
            message: 'Pembayaran telah terverifikasi lunas secara otomatis. Pesanan kini sedang diproses.',
          });
        } else {
          setPaymentAlert({
            type: 'info',
            message: 'Sistem aktif mendeteksi: Belum ada mutasi masuk untuk nominal ini. Transaksi dicek otomatis setiap beberapa detik.',
          });
        }
      } else {
        setPaymentAlert({
          type: 'info',
          message: 'Sistem sedang memantau QRIS & mutasi rekening bank secara otomatis.',
        });
      }
    } catch {
      setPaymentAlert({
        type: 'info',
        message: 'Sistem sedang memantau QRIS & mutasi rekening bank secara otomatis.',
      });
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Handler: Simulate payment success (Sandbox / Test Automation)
  const handleSimulatePayment = async (channelName: string) => {
    setIsSimulatingPayment(true);
    setPaymentAlert(null);
    try {
      const res = await fetch('/api/payment/simulate-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod: channelName,
          referenceNo: `DEMO-${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentStatus('Diproses');
        onUpdateOrderStatus?.(order.id, 'Diproses');
        setPaymentAlert({
          type: 'success',
          message: `Pembayaran via ${channelName} BERHASIL DIVERIFIKASI OTOMATIS. Pembeli tidak perlu kirim bukti transfer. Pesanan langsung diproses dapur.`,
        });
      }
    } catch {
      setCurrentStatus('Diproses');
      onUpdateOrderStatus?.(order.id, 'Diproses');
      setPaymentAlert({
        type: 'success',
        message: `Pembayaran via ${channelName} BERHASIL DIVERIFIKASI OTOMATIS. Pesanan langsung diproses dapur.`,
      });
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  const invoiceNumber =
    order.invoiceNumber ||
    `#INV/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/ASASORA/0891`;
  const rawText = order.rawInvoiceText || '';
  const uniqueCode = order.uniqueCode || 123;
  const bcaAccountNum =
    company.bcaAccount?.number || company.bankAccount?.accountNumber || '4971531139';
  const bcaAccountHolder =
    company.bcaAccount?.holder ||
    company.bankAccount?.accountHolder ||
    'PT. ASASORA BIO HEALTHORA';

  const logoHeightMap = {
    sm: 58,
    md: 84,
    lg: 116,
  };
  const currentLogoHeight = logoHeightMap[logoSize];

  // Guaranteed pristine logo path
  const defaultLogoUrl = company.logoUrl || '/logo-asasora.png';

  const handleCopyInvoiceText = () => {
    navigator.clipboard.writeText(rawText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyBca = () => {
    navigator.clipboard.writeText(bcaAccountNum.replace(/\s|-/g, ''));
    setCopiedBca(true);
    setTimeout(() => setCopiedBca(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(String(order.totalAmount));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyInvNum = () => {
    navigator.clipboard.writeText(invoiceNumber);
    setCopiedInvNum(true);
    setTimeout(() => setCopiedInvNum(false), 2000);
  };

  const handleDownloadPdf = () => {
    downloadInvoicePdf(
      rawText,
      invoiceNumber,
      order.customerName,
      defaultLogoUrl,
      {
        date: order.date,
        items: order.items,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost || order.shippingFee || 0,
        shippingMethodName: order.shippingMethodName,
        distanceKm: order.distanceKm,
        uniqueCode: order.uniqueCode,
        totalAmount: order.totalAmount,
        whatsapp: order.whatsapp,
        address: order.address,
      },
      company
    );
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const itemsHtml = order.items
      .map(
        (it, idx) => `
        <tr style="background: ${idx % 2 === 0 ? '#fafafa' : '#ffffff'};">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${idx + 1}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #111827;">${it.name}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">${it.quantity} ${it.unit || 'porsi'}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #4b5563;">${formatRupiah(it.price)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 800; color: #111827;">${formatRupiah(it.price * it.quantity)}</td>
        </tr>`
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceNumber}</title>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 32px;
              color: #1e293b;
              background: #fff;
              max-width: 820px;
              margin: 0 auto;
              line-height: 1.5;
            }
            .header-wrap {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #2E6F40;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .brand-col {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .logo-img {
              height: ${currentLogoHeight}px;
              max-height: ${currentLogoHeight}px;
              object-fit: contain;
            }
            .company-name {
              font-size: 18px;
              font-weight: 900;
              color: #2E6F40;
              letter-spacing: 0.5px;
              margin: 0;
            }
            .company-tagline {
              font-size: 11px;
              font-weight: 700;
              color: #059669;
              margin: 2px 0;
            }
            .company-sub {
              font-size: 11px;
              color: #64748b;
            }
            .inv-meta-right {
              text-align: right;
            }
            .inv-title {
              font-size: 20px;
              font-weight: 900;
              color: #0f172a;
              margin: 0 0 4px 0;
            }
            .inv-number {
              font-family: monospace;
              font-size: 14px;
              font-weight: 800;
              color: #2E6F40;
            }
            .status-pill {
              display: inline-block;
              background: #fef3c7;
              color: #92400e;
              font-size: 10px;
              font-weight: 800;
              padding: 3px 8px;
              border-radius: 6px;
              margin-top: 6px;
              border: 1px solid #fde68a;
            }
            .bento-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 24px;
            }
            .bento-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 14px 16px;
              font-size: 12px;
            }
            .bento-card h4 {
              margin: 0 0 8px 0;
              font-size: 11px;
              font-weight: 800;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
              font-size: 12.5px;
            }
            .items-table th {
              background: #2E6F40;
              color: #ffffff;
              padding: 10px 12px;
              font-weight: 800;
              text-align: left;
            }
            .calc-section {
              display: grid;
              grid-template-columns: 1.2fr 1fr;
              gap: 16px;
              margin-bottom: 24px;
            }
            .bank-card {
              border: 1px solid #bfdbfe;
              background: #eff6ff;
              border-radius: 12px;
              padding: 16px;
              font-size: 12px;
            }
            .summary-card {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 12px;
              padding: 16px;
              font-size: 12.5px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              color: #475569;
            }
            .summary-total {
              border-top: 2px dashed #86efac;
              margin-top: 8px;
              padding-top: 8px;
              font-weight: 900;
              font-size: 16px;
              color: #2E6F40;
            }
            .footer-note {
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 14px;
            }
            @media print {
              body { padding: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="header-wrap">
            <div class="brand-col">
              <img src="${defaultLogoUrl}" alt="Logo Asasora" class="logo-img" />
              <div>
                <h1 class="company-name">${company.name || 'PT. ASASORA BIO HEALTHORA'}</h1>
                <div class="company-tagline">TERSERTIFIKASI HALAL BPJPH & DINKES P-IRT</div>
                <div class="company-sub">${company.address || 'Kec. Tangerang, Kota Tangerang, Banten'}</div>
                <div class="company-sub">Web: ${company.website || 'www.asasorfood.com'} &bull; CS: ${company.whatsapp || '+62 852-7100-0900'}</div>
              </div>
            </div>
            <div class="inv-meta-right">
              <div class="inv-title">INVOICE RESMI</div>
              <div class="inv-number">${invoiceNumber}</div>
              <div class="status-pill">MENUNGGU PEMBAYARAN</div>
            </div>
          </div>

          <div class="bento-grid">
            <div class="bento-card">
              <h4>Ditujukan Kepada (Pelanggan):</h4>
              <div><strong>Nama:</strong> ${order.customerName}</div>
              <div><strong>WhatsApp:</strong> ${order.whatsapp}</div>
              <div><strong>Alamat:</strong> ${order.address}</div>
            </div>
            <div class="bento-card">
              <h4>Informasi Pengiriman & Waktu:</h4>
              <div><strong>Tanggal Terbit:</strong> ${new Date(order.date).toLocaleString('id-ID')}</div>
              <div><strong>Jatuh Tempo:</strong> 24 Jam dari pemesanan</div>
              <div><strong>Armada Kurir:</strong> ${order.shippingMethodName || 'Kurir Reguler'} ${order.distanceKm ? `(${order.distanceKm} km)` : ''}</div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 6%; text-align: center;">NO</th>
                <th style="width: 44%;">DESKRIPSI MENU & PORSI</th>
                <th style="width: 14%; text-align: center;">JUMLAH</th>
                <th style="width: 18%; text-align: right;">HARGA SATUAN</th>
                <th style="width: 18%; text-align: right;">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="calc-section">
            <div class="bank-card">
              <strong style="color: #1e3a8a; font-size: 13px;">PEMBAYARAN: BANK CENTRAL ASIA (BCA)</strong>
              <div style="margin: 8px 0;">
                <span style="color: #64748b; font-size: 11px;">Nomor Rekening Resmi:</span><br />
                <span style="font-family: monospace; font-size: 16px; font-weight: 900; color: #1e40af;">${bcaAccountNum}</span>
              </div>
              <div><strong>Atas Nama:</strong> ${bcaAccountHolder}</div>
              <div style="margin-top: 8px; font-size: 11px; color: #2563eb;">
                * Harap transfer tepat <strong>${formatRupiah(order.totalAmount)}</strong> untuk verifikasi otomatis.
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-row">
                <span>Subtotal Produk:</span>
                <strong style="color: #0f172a;">${formatRupiah(order.subtotal)}</strong>
              </div>
              <div class="summary-row">
                <span>Ongkos Kirim (${order.shippingMethodName}):</span>
                <strong style="color: #0f172a;">${formatRupiah(order.shippingCost || order.shippingFee || 0)}</strong>
              </div>
              <div class="summary-row" style="color: #2E6F40; font-weight: 700;">
                <span>Kode Unik Verifikasi:</span>
                <span>+${formatRupiah(uniqueCode)}</span>
              </div>
              <div class="summary-row summary-total">
                <span>TOTAL TAGIHAN:</span>
                <span>${formatRupiah(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div class="footer-note">
            Invoice ini sah dan diterbitkan secara elektronik oleh sistem PT. ASASORA BIO HEALTHORA.<br />
            Simpan invoice ini sebagai bukti resmi pemesanan Anda.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  const handleSendWhatsApp = () => {
    const msg = generateOrderWhatsAppMessage({
      orderId: order.id,
      name: order.customerName,
      phone: order.whatsapp,
      address: order.address,
      items: order.items,
      shippingMethod: order.shippingMethodName,
      distanceKm: order.distanceKm,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost || order.shippingFee || 0,
      total: order.totalAmount,
      paymentCode: order.paymentCode || invoiceNumber,
    });
    window.open(`https://wa.me/${company.whatsapp}?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-white border border-stone-300 rounded-2xl p-4 sm:p-7 space-y-6 text-stone-800 animate-in fade-in duration-200">
      {/* Top Invoice Action Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0F5132] text-white flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5 text-[#F3C623]" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-[#0F5132] text-white font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                Invoice Resmi Asasora
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2.5 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-700" strokeWidth={1.75} />
                MENUNGGU PEMBAYARAN
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h4 className="text-xl sm:text-2xl font-black text-stone-900 font-mono tracking-tight tabular-nums">
                {invoiceNumber}
              </h4>
              <button
                type="button"
                onClick={handleCopyInvNum}
                className="text-stone-400 hover:text-[#0F5132] p-1 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                title="Salin Nomor Invoice"
              >
                {copiedInvNum ? (
                  <Check className="w-4 h-4 text-[#0F5132]" strokeWidth={2} />
                ) : (
                  <Copy className="w-4 h-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar: Logo Size and View Switch */}
        <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-auto">
          {/* Logo Size Control */}
          <div className="flex items-center gap-1 bg-[#FAFBF9] border border-stone-200 px-2.5 py-1 rounded-lg text-xs font-bold text-stone-800">
            <span className="text-stone-500 font-medium mr-1 hidden sm:inline">Ukuran Logo:</span>
            {(['sm', 'md', 'lg'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setLogoSize(sz)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer text-[11px] ${
                  logoSize === sz
                    ? 'bg-[#0F5132] text-white font-bold'
                    : 'hover:bg-stone-200 text-stone-700 font-semibold'
                }`}
              >
                {sz === 'sm' ? 'Kecil' : sz === 'md' ? 'Standar' : 'Besar'}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 border border-stone-200 p-1 rounded-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-white text-[#0F5132] border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tampilan Resmi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-white text-[#0F5132] border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Format Teks (ASCII)
            </button>
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#FAFBF9] border border-stone-200 p-3 rounded-xl">
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="bg-[#0F5132] hover:bg-[#0b3d26] text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-lg border border-[#0b3d26] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#F3C623]" strokeWidth={1.75} />
          <span>Download PDF</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-xs sm:text-sm py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#0F5132]" strokeWidth={1.75} />
          <span>Cetak Invoice</span>
        </button>

        <button
          type="button"
          onClick={handleCopyInvoiceText}
          className="bg-white hover:bg-stone-100 text-[#0F5132] border border-stone-300 font-bold text-xs sm:text-sm py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {copiedText ? (
            <>
              <Check className="w-4 h-4 text-[#0F5132]" strokeWidth={2} />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" strokeWidth={1.75} />
              <span>Salin Teks</span>
            </>
          )}
        </button>

        {/* Tombol Pemicu Pesan Kurir (Hanya tampil jika diakses dari Admin Panel) */}
        {onTriggerCourier && (
          <button
            type="button"
            onClick={() => onTriggerCourier(order)}
            className="sm:col-span-3 bg-[#0F5132] hover:bg-[#0b3d26] text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-[#F3C623]" strokeWidth={1.75} />
            <span>Pesan / Dispatch Kurir Pengantaran (Otoritas Admin)</span>
          </button>
        )}
      </div>

      {/* Main Content View */}
      {activeTab === 'text' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
            <span>Struktur Text-Block Standar Asasora (80 Kolom):</span>
            <span className="font-mono text-[11px] text-[#0F5132]">Format Siap Cetak</span>
          </div>
          <div className="relative">
            <pre className="font-mono text-[11px] sm:text-xs leading-relaxed bg-stone-950 text-emerald-300 p-4 sm:p-6 rounded-xl overflow-x-auto border border-stone-800 max-h-96 select-all scrollbar-thin">
              {rawText}
            </pre>
          </div>
          <p className="text-[11px] text-stone-500 italic text-center">
            * Format teks di atas dapat disalin untuk dikirim langsung via WhatsApp, SMS, ataupun dicetak menggunakan printer struk thermal/dot-matrix.
          </p>
        </div>
      ) : (
        /* Visual Professional Invoice Card */
        <div className="border border-stone-200 rounded-2xl p-5 sm:p-8 bg-white space-y-7">
          {/* Header Brand Section with Asasora Logo */}
          <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo and Brand Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div
                className="bg-[#FAFBF9] rounded-xl p-2 border border-stone-200 flex items-center justify-center transition-all duration-300 shrink-0"
                style={{
                  height: `${currentLogoHeight + 12}px`,
                  minWidth: `${currentLogoHeight + 12}px`,
                }}
              >
                <img
                  src={defaultLogoUrl}
                  alt={`Logo ${company.name || 'ASASORA BIO HEALTHORA'}`}
                  style={{
                    height: `${currentLogoHeight}px`,
                    maxHeight: `${currentLogoHeight}px`,
                  }}
                  className="w-auto object-contain transition-all duration-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo-asasora.svg';
                  }}
                />
              </div>

              <div>
                <h3 className="font-black text-lg sm:text-xl text-[#0F5132] tracking-wide uppercase">
                  {company.name || 'PT. ASASORA BIO HEALTHORA'}
                </h3>
                <div className="inline-flex items-center gap-1.5 text-[#0F5132] font-bold text-[11px] mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
                  <span>TERSERTIFIKASI HALAL BPJPH &amp; DINKES P-IRT</span>
                </div>
                <div className="text-xs text-stone-600 mt-1.5 space-y-0.5">
                  <p className="flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" strokeWidth={1.75} />
                    <span>{company.address || 'Buaran Indah, Kec. Tangerang, Kota Tangerang, Banten'}</span>
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Website: <span className="font-semibold text-[#0F5132]">{company.website || 'www.asasorfood.com'}</span> &bull; WhatsApp:{' '}
                    <span className="font-semibold text-[#0F5132] tabular-nums">{company.whatsapp || '+62 852-7100-0900'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Document Stamp / Status */}
            <div className="text-center md:text-right shrink-0 bg-[#FAFBF9] md:bg-transparent p-4 md:p-0 rounded-xl border border-stone-200 md:border-none w-full md:w-auto">
              <div className="text-xs font-bold text-stone-400 tracking-wider uppercase">
                DOKUMEN TRANSAKSI
              </div>
              <div className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                INVOICE RESMI
              </div>
              <div className="font-mono text-xs sm:text-sm font-black text-[#0F5132] mt-0.5 tabular-nums">
                {invoiceNumber}
              </div>
              <div className="inline-block bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider mt-2">
                Menunggu Pembayaran
              </div>
            </div>
          </div>

          {/* 2-Column Bento Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left: Customer Profile */}
            <div className="bg-[#FAFBF9] p-4 sm:p-5 rounded-xl border border-stone-200 space-y-2.5">
              <div className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-1.5 border-b border-stone-200">
                <FileText className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
                <span>Ditujukan Kepada (Pelanggan):</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex">
                  <span className="w-24 text-stone-500 font-medium">Nama:</span>
                  <strong className="text-stone-900 font-bold">{order.customerName}</strong>
                </div>
                <div className="flex">
                  <span className="w-24 text-stone-500 font-medium">WhatsApp:</span>
                  <span className="text-stone-800 font-mono font-bold tabular-nums">{order.whatsapp}</span>
                </div>
                {order.email && (
                  <div className="flex">
                    <span className="w-24 text-stone-500 font-medium">Email:</span>
                    <span className="text-stone-700">{order.email}</span>
                  </div>
                )}
                <div className="flex items-start">
                  <span className="w-24 text-stone-500 font-medium shrink-0">Alamat Kirim:</span>
                  <span className="text-stone-700 leading-relaxed font-medium">{order.address}</span>
                </div>
              </div>
            </div>

            {/* Right: Order Logistics & Schedule */}
            <div className="bg-[#FAFBF9] p-4 sm:p-5 rounded-xl border border-stone-200 space-y-2.5">
              <div className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-1.5 border-b border-stone-200">
                <Truck className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
                <span>Informasi Pengiriman &amp; Jadwal:</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex">
                  <span className="w-28 text-stone-500 font-medium">Tanggal Order:</span>
                  <strong className="text-stone-800">
                    {new Date(order.date).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </strong>
                </div>
                <div className="flex">
                  <span className="w-28 text-stone-500 font-medium">Jatuh Tempo:</span>
                  <span className="text-red-700 font-bold">
                    {order.dueDate || '24 Jam dari waktu transaksi'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 text-stone-500 font-medium">Armada Kurir:</span>
                  <strong className="text-[#0F5132]">
                    {order.shippingMethodName || 'Kurir Reguler'}
                    {order.distanceKm ? ` (${order.distanceKm} Km)` : ''}
                  </strong>
                </div>
                <div className="flex">
                  <span className="w-28 text-stone-500 font-medium">Dapur Asal:</span>
                  <span className="text-stone-600">Dapur Pusat Asasora Tangerang</span>
                </div>
              </div>
            </div>
          </div>

          {/* Structured Items Table */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
              <span>RINCIAN PESANAN KATERING:</span>
              <span className="text-[11px] text-stone-500 font-bold tabular-nums">
                {order.items.reduce((acc, it) => acc + it.quantity, 0)} Porsi Total
              </span>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0F5132] text-white font-bold">
                  <tr>
                    <th className="py-3 px-3.5 text-center w-10">NO</th>
                    <th className="py-3 px-3.5">DESKRIPSI MENU / PRODUK</th>
                    <th className="py-3 px-3.5 text-center w-28">JUMLAH (QTY)</th>
                    <th className="py-3 px-3.5 text-right w-36">HARGA SATUAN</th>
                    <th className="py-3 px-3.5 text-right w-36">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBF9]'}>
                      <td className="py-3 px-3.5 text-center text-stone-400 font-semibold tabular-nums">{idx + 1}</td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-stone-900 text-xs sm:text-sm">{item.name}</div>
                        {item.unit && (
                          <span className="inline-block text-[10px] text-[#0F5132] bg-[#F7F8F6] px-2 py-0.5 rounded font-semibold border border-stone-200 mt-0.5">
                            Porsi {item.unit}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center font-bold text-stone-800 tabular-nums">
                        {item.quantity} {item.unit || 'porsi'}
                      </td>
                      <td className="py-3 px-3.5 text-right text-stone-600 font-medium tabular-nums">
                        {formatRupiah(item.price)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-extrabold text-stone-900 tabular-nums">
                        {formatRupiah(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation Summary & BCA Payment Bento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* Left: BCA Official Payment Card */}
            <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-xs sm:text-sm uppercase tracking-wide">
                  <CreditCard className="w-4 h-4 text-blue-700" strokeWidth={1.75} />
                  <span>PEMBAYARAN: BANK CENTRAL ASIA (BCA)</span>
                </div>
                <span className="bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  BCA
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-stone-500 font-medium">Nomor Rekening BCA Resmi:</div>
                  <div className="font-mono font-black text-xl text-blue-900 tracking-wider mt-0.5 tabular-nums">
                    {bcaAccountNum}
                  </div>
                  <div className="text-xs font-bold text-stone-700 mt-0.5">
                    Atas Nama: {bcaAccountHolder}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBca}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedBca ? (
                    <>
                      <Check className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>Salin Rekening</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-blue-900 space-y-1.5 leading-relaxed bg-white p-3.5 rounded-xl border border-blue-100">
                <div className="font-bold text-[11px] text-blue-950">PETUNJUK TRANSFER:</div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-900">
                  <li>
                    Transfer tepat hingga 3 digit terakhir (<strong>{formatRupiah(order.totalAmount)}</strong>) untuk verifikasi otomatis instan.
                  </li>
                  <li>
                    Batas pembayaran 24 jam sebelum slot dapur pesanan dibatalkan otomatis oleh sistem.
                  </li>
                </ol>
              </div>
            </div>

            {/* Right: Financial Breakdown Card */}
            <div className="bg-[#FAFBF9] border border-stone-200 rounded-xl p-5 space-y-3">
              <div className="font-bold text-xs uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-200">
                RINCIAN TOTAL PEMBAYARAN:
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal Produk:</span>
                  <span className="font-bold text-stone-900 tabular-nums">{formatRupiah(order.subtotal)}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <div>
                    <span>Ongkos Kirim ({order.shippingMethodName || 'Kurir Toko'}):</span>
                    {order.distanceKm && (
                      <div className="text-[10px] text-stone-400">Jarak tempuh: {order.distanceKm} Km</div>
                    )}
                  </div>
                  <span className="font-bold text-stone-900 tabular-nums">
                    {formatRupiah(order.shippingCost || order.shippingFee || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#0F5132] font-semibold bg-white p-2.5 rounded-lg border border-stone-200">
                  <div>
                    <div className="font-bold text-xs">Kode Unik Verifikasi:</div>
                    <div className="text-[10px] text-stone-500 font-normal">
                      * Otomatis memvalidasi mutasi rekening
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#0F5132] tabular-nums">
                    +{formatRupiah(uniqueCode)}
                  </span>
                </div>

                <div className="border-t border-stone-300 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-extrabold text-stone-900 uppercase">TOTAL HARUS DITRANSFER:</div>
                    <div className="text-[10px] text-stone-500">Termasuk subtotal, ongkir &amp; kode unik</div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="font-mono text-xl sm:text-2xl font-black text-[#0F5132] tabular-nums">
                      {formatRupiah(order.totalAmount)}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAmount}
                      className="text-[#0F5132] hover:bg-stone-200 bg-stone-100 border border-stone-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Salin Nominal Total"
                    >
                      {copiedAmount ? <Check className="w-4 h-4 text-[#0F5132]" strokeWidth={2} /> : <Copy className="w-4 h-4" strokeWidth={1.75} />}
                    </button>
                  </div>
                </div>

                {/* Tombol WhatsApp CS: Konfirmasi Pembayaran */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="w-full bg-[#0F5132] hover:bg-[#0b3d26] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2.5 cursor-pointer border border-[#0b3d26]"
                  >
                    <MinsoraAvatar size="xs" showWaBadge={false} />
                    <span>Konfirmasi Pembayaran</span>
                  </button>
                  <p className="text-[10px] text-center text-stone-500 mt-1.5">
                    Kirim bukti transfer &amp; invoice resmi ke WhatsApp Customer Service Minsora
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Official Verification Watermark Footer */}
          <div className="text-center pt-3 border-t border-stone-200 text-[11px] text-stone-400 flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
              Invoice Resmi PT. Asasora Bio Healthora
            </span>
            <span>&bull;</span>
            <span>Diterbitkan Secara Elektronik</span>
            <span>&bull;</span>
            <span className="font-mono font-semibold tabular-nums">{invoiceNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
};

