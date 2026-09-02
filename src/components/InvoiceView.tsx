import React, { useState } from 'react';
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
  Sparkles,
  QrCode,
} from 'lucide-react';
import { CompanyInfo, Order } from '../types';
import { downloadInvoicePdf, formatRupiahSpaced } from '../utils/invoiceGenerator';
import { formatRupiah, generateOrderWhatsAppMessage } from '../utils/distance';
import { MinsoraAvatar } from './MinsoraAvatar';

interface InvoiceViewProps {
  order: Order;
  company: CompanyInfo;
  onClose?: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  order,
  company,
  onClose,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedBca, setCopiedBca] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedInvNum, setCopiedInvNum] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'text'>('visual');
  const [logoSize, setLogoSize] = useState<'sm' | 'md' | 'lg'>('md');

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
    <div className="bg-white border-2 border-emerald-600 rounded-3xl p-4 sm:p-7 shadow-2xl space-y-6 text-gray-800 animate-in fade-in duration-200">
      {/* Top Invoice Action Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-700/20 shrink-0">
            <FileText className="w-6 h-6 text-[#F3C623]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-emerald-800 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Invoice Resmi Asasora
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-950 font-black px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-700" />
                MENUNGGU PEMBAYARAN
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h4 className="text-xl sm:text-2xl font-black text-gray-900 font-mono tracking-tight">
                {invoiceNumber}
              </h4>
              <button
                type="button"
                onClick={handleCopyInvNum}
                className="text-gray-400 hover:text-emerald-700 p-1 rounded-md hover:bg-gray-100 transition cursor-pointer"
                title="Salin Nomor Invoice"
              >
                {copiedInvNum ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar: Logo Size and View Switch */}
        <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-auto">
          {/* Logo Size Control */}
          <div className="flex items-center gap-1 bg-emerald-50/90 border border-emerald-200 px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-950">
            <span className="text-emerald-800/80 font-medium mr-1 hidden sm:inline">Ukuran Logo:</span>
            {(['sm', 'md', 'lg'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setLogoSize(sz)}
                className={`px-2 py-0.5 rounded-lg transition cursor-pointer text-[11px] ${
                  logoSize === sz
                    ? 'bg-[#2E6F40] text-white shadow-2xs font-extrabold'
                    : 'hover:bg-emerald-100 text-emerald-900 font-semibold'
                }`}
              >
                {sz === 'sm' ? 'Kecil' : sz === 'md' ? 'Standar' : 'Besar'}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tampilan Resmi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Format Teks (ASCII)
            </button>
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border border-emerald-200 p-3 rounded-2xl">
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="bg-[#2E6F40] hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4 text-[#F3C623]" />
          <span>Download PDF</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="bg-white hover:bg-emerald-100 text-gray-800 border border-gray-300 font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Printer className="w-4 h-4 text-emerald-700" />
          <span>Cetak Invoice</span>
        </button>

        <button
          type="button"
          onClick={handleCopyInvoiceText}
          className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          {copiedText ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Salin Teks</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSendWhatsApp}
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm py-2 px-3 rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-emerald-500"
        >
          <MinsoraAvatar size="xs" showWaBadge={false} />
          <span>WhatsApp CS</span>
        </button>
      </div>

      {/* Main Content View */}
      {activeTab === 'text' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
            <span>Struktur Text-Block Standar Asasora (80 Kolom):</span>
            <span className="font-mono text-[11px] text-emerald-700">Format Siap Cetak</span>
          </div>
          <div className="relative">
            <pre className="font-mono text-[11px] sm:text-xs leading-relaxed bg-gray-950 text-emerald-300 p-4 sm:p-6 rounded-2xl overflow-x-auto border border-gray-800 shadow-inner max-h-96 select-all scrollbar-thin">
              {rawText}
            </pre>
          </div>
          <p className="text-[11px] text-gray-400 italic text-center">
            * Format teks di atas dapat disalin untuk dikirim langsung via WhatsApp, SMS, ataupun dicetak menggunakan printer struk thermal/dot-matrix.
          </p>
        </div>
      ) : (
        /* Visual Professional Invoice Card */
        <div className="border border-emerald-100 rounded-3xl p-5 sm:p-8 bg-linear-to-b from-white via-white to-gray-50/70 space-y-7 shadow-xs">
          {/* Header Brand Section with Asasora Logo */}
          <div className="border-b-2 border-dashed border-emerald-200 pb-6 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo and Brand Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div
                className="bg-white rounded-2xl p-2 border border-emerald-100 shadow-sm flex items-center justify-center transition-all duration-300 shrink-0"
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
                  className="w-auto object-contain transition-all duration-300 drop-shadow-2xs"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo-asasora.svg';
                  }}
                />
              </div>

              <div>
                <h3 className="font-black text-lg sm:text-xl text-[#2E6F40] tracking-wide uppercase">
                  {company.name || 'PT. ASASORA BIO HEALTHORA'}
                </h3>
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>TERSERTIFIKASI HALAL BPJPH & DINKES P-IRT</span>
                </div>
                <div className="text-xs text-gray-600 mt-1.5 space-y-0.5">
                  <p className="flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{company.address || 'Buaran Indah, Kec. Tangerang, Kota Tangerang, Banten'}</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Website: <span className="font-semibold text-emerald-800">{company.website || 'www.asasorfood.com'}</span> &bull; WhatsApp:{' '}
                    <span className="font-semibold text-emerald-800">{company.whatsapp || '+62 852-7100-0900'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Document Stamp / Status */}
            <div className="text-center md:text-right shrink-0 bg-emerald-50/80 md:bg-transparent p-4 md:p-0 rounded-2xl border border-emerald-200 md:border-none w-full md:w-auto">
              <div className="text-xs font-black text-gray-400 tracking-wider uppercase">
                DOKUMEN TRANSAKSI
              </div>
              <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                INVOICE RESMI
              </div>
              <div className="font-mono text-xs sm:text-sm font-black text-[#2E6F40] mt-0.5">
                {invoiceNumber}
              </div>
              <div className="inline-block bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-2">
                Menunggu Pembayaran
              </div>
            </div>
          </div>

          {/* 2-Column Bento Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left: Customer Profile */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2.5">
              <div className="font-black text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-gray-100">
                <FileText className="w-3.5 h-3.5 text-[#2E6F40]" />
                <span>Ditujukan Kepada (Pelanggan):</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex">
                  <span className="w-24 text-gray-400 font-medium">Nama:</span>
                  <strong className="text-gray-900 font-bold">{order.customerName}</strong>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-400 font-medium">WhatsApp:</span>
                  <span className="text-gray-800 font-mono font-bold">{order.whatsapp}</span>
                </div>
                {order.email && (
                  <div className="flex">
                    <span className="w-24 text-gray-400 font-medium">Email:</span>
                    <span className="text-gray-700">{order.email}</span>
                  </div>
                )}
                <div className="flex items-start">
                  <span className="w-24 text-gray-400 font-medium shrink-0">Alamat Kirim:</span>
                  <span className="text-gray-700 leading-relaxed font-medium">{order.address}</span>
                </div>
              </div>
            </div>

            {/* Right: Order Logistics & Schedule */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2.5">
              <div className="font-black text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-gray-100">
                <Truck className="w-3.5 h-3.5 text-[#2E6F40]" />
                <span>Informasi Pengiriman & Jadwal:</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex">
                  <span className="w-28 text-gray-400 font-medium">Tanggal Order:</span>
                  <strong className="text-gray-800">
                    {new Date(order.date).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </strong>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-400 font-medium">Jatuh Tempo:</span>
                  <span className="text-red-700 font-bold">
                    {order.dueDate || '24 Jam dari waktu transaksi'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-400 font-medium">Armada Kurir:</span>
                  <strong className="text-emerald-900">
                    {order.shippingMethodName || 'Kurir Reguler'}
                    {order.distanceKm ? ` (${order.distanceKm} Km)` : ''}
                  </strong>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-400 font-medium">Dapur Asal:</span>
                  <span className="text-gray-600">Dapur Pusat Asasora Tangerang</span>
                </div>
              </div>
            </div>
          </div>

          {/* Structured Items Table */}
          <div className="space-y-2.5">
            <div className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center justify-between">
              <span>RINCIAN PESANAN KATERING:</span>
              <span className="text-[11px] text-gray-500 font-bold">
                {order.items.reduce((acc, it) => acc + it.quantity, 0)} Porsi Total
              </span>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-gradient-to-r from-[#2E6F40] to-emerald-800 text-white font-bold">
                  <tr>
                    <th className="py-3 px-3.5 text-center w-10">NO</th>
                    <th className="py-3 px-3.5">DESKRIPSI MENU / PRODUK</th>
                    <th className="py-3 px-3.5 text-center w-28">JUMLAH (QTY)</th>
                    <th className="py-3 px-3.5 text-right w-36">HARGA SATUAN</th>
                    <th className="py-3 px-3.5 text-right w-36">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                      <td className="py-3 px-3.5 text-center text-gray-400 font-semibold">{idx + 1}</td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm">{item.name}</div>
                        {item.unit && (
                          <span className="inline-block text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200 mt-0.5">
                            Porsi {item.unit}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center font-bold text-gray-800">
                        {item.quantity} {item.unit || 'porsi'}
                      </td>
                      <td className="py-3 px-3.5 text-right text-gray-600 font-medium">
                        {formatRupiah(item.price)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-black text-gray-900">
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
            <div className="border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-2xl p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-950 font-black text-xs sm:text-sm uppercase tracking-wide">
                  <CreditCard className="w-4 h-4 text-blue-700" />
                  <span>PEMBAYARAN: BANK CENTRAL ASIA (BCA)</span>
                </div>
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                  BCA
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-blue-100 flex items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="text-[11px] text-gray-500 font-medium">Nomor Rekening BCA Resmi:</div>
                  <div className="font-mono font-black text-xl text-blue-900 tracking-wider mt-0.5">
                    {bcaAccountNum}
                  </div>
                  <div className="text-xs font-bold text-gray-700 mt-0.5">
                    Atas Nama: {bcaAccountHolder}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBca}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  {copiedBca ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Rekening</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-blue-900 space-y-1.5 leading-relaxed bg-white/70 p-3 rounded-xl border border-blue-100/80">
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
            <div className="bg-gradient-to-br from-emerald-50/90 via-green-50/70 to-emerald-50/90 border border-emerald-200 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="font-black text-xs uppercase tracking-wider text-emerald-950 pb-1 border-b border-emerald-200">
                RINCIAN TOTAL PEMBAYARAN:
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal Produk:</span>
                  <span className="font-bold text-gray-900">{formatRupiah(order.subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <div>
                    <span>Ongkos Kirim ({order.shippingMethodName || 'Kurir Toko'}):</span>
                    {order.distanceKm && (
                      <div className="text-[10px] text-gray-400">Jarak tempuh: {order.distanceKm} Km</div>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatRupiah(order.shippingCost || order.shippingFee || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-emerald-900 font-semibold bg-emerald-100/80 p-2.5 rounded-xl border border-emerald-200">
                  <div>
                    <div className="font-bold text-xs">Kode Unik Verifikasi:</div>
                    <div className="text-[10px] text-emerald-700 font-normal">
                      * Otomatis memvalidasi mutasi rekening
                    </div>
                  </div>
                  <span className="font-mono font-black text-sm text-[#2E6F40]">
                    +{formatRupiah(uniqueCode)}
                  </span>
                </div>

                <div className="border-t-2 border-emerald-300 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-gray-800 uppercase">TOTAL HARUS DITRANSFER:</div>
                    <div className="text-[10px] text-gray-500">Termasuk subtotal, ongkir &amp; kode unik</div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="font-mono text-xl sm:text-2xl font-black text-[#2E6F40]">
                      {formatRupiah(order.totalAmount)}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAmount}
                      className="text-emerald-700 hover:text-emerald-900 bg-emerald-100/80 p-1.5 rounded-lg transition cursor-pointer"
                      title="Salin Nominal Total"
                    >
                      {copiedAmount ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Official Verification Watermark Footer */}
          <div className="text-center pt-2 border-t border-gray-100 text-[11px] text-gray-400 flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Invoice Resmi PT. Asasora Bio Healthora
            </span>
            <span>&bull;</span>
            <span>Diterbitkan Secara Elektronik</span>
            <span>&bull;</span>
            <span className="font-mono font-semibold">{invoiceNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
};

