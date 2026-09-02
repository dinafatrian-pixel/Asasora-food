import { jsPDF } from 'jspdf';
import { CartItem, CompanyInfo, Order } from '../types';

export interface InvoiceData {
  invoiceNumber: string;
  transactionDateStr: string;
  dueDateStr: string;
  uniqueCode: number;
  subtotal: number;
  shippingCost: number;
  totalWithCode: number;
  customerEmail?: string;
  shippingMethodDetail: string;
}

/**
 * Formats a Date object into Indonesian format (e.g., 30 Agustus 2026, 08:11 WIB)
 */
export function formatIndonesianDateTime(date: Date): string {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
}

/**
 * Generates random 4 digit string
 */
export function generateRandom4Digits(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Generates unique invoice number: #INV/[YYYYMMDD]/ASASORA/[4_DIGIT_ANGKA]
 */
export function generateInvoiceNumber(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const rand4 = generateRandom4Digits();
  return `#INV/${year}${month}${day}/ASASORA/${rand4}`;
}

/**
 * Generates random 3-digit unique code between 100 and 999
 */
export function generateUniquePaymentCode(): number {
  return Math.floor(100 + Math.random() * 900);
}

/**
 * Formats rupiah number without IDR prefix, e.g. "Rp   450.000"
 */
export function formatRupiahSpaced(amount: number, width: number = 10): string {
  const formatted = new Intl.NumberFormat('id-ID').format(amount);
  const numStr = `${formatted}`;
  const spaceNeeded = Math.max(1, width - numStr.length);
  return `Rp ${' '.repeat(spaceNeeded)}${numStr}`;
}

/**
 * Helper to pad or truncate strings
 */
function padRight(str: string, length: number): string {
  if (str.length > length) {
    return str.substring(0, length - 2) + '..';
  }
  return str + ' '.repeat(length - str.length);
}

function padLeft(str: string, length: number): string {
  if (str.length > length) {
    return str.substring(0, length);
  }
  return ' '.repeat(length - str.length) + str;
}

/**
 * Generates strict text-block invoice matching the requested ASCII template
 */
export function buildRawInvoiceText(
  order: {
    id: string;
    customerName: string;
    whatsapp: string;
    email?: string;
    address: string;
    items: CartItem[];
    subtotal: number;
    shippingCost?: number;
    shippingFee?: number;
    shippingMethodName: string;
    distanceKm?: number;
  },
  company: CompanyInfo,
  invoiceData: InvoiceData
): string {
  const bcaNumber =
    company.bcaAccount?.number || company.bankAccount?.accountNumber || '497-153-1139';
  const bcaHolder =
    company.bcaAccount?.holder ||
    company.bankAccount?.accountHolder ||
    'PT ASASORA BIO HEALTHORA';

  const companyAddress = company.address || 'Buaran Indah, Kec. Tangerang, Kota Tangerang, Banten';
  const companyUrl = company.website || 'www.asasorfood.com';
  const email = invoiceData.customerEmail || `${order.customerName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'customer'}@email.com`;

  // Split address into multi lines for neat 2-column layout
  const rawAddr = order.address.replace(/\n/g, ', ');
  const addrWords = rawAddr.split(' ');
  const addrLines: string[] = [];
  let currLine = '';
  for (const word of addrWords) {
    if ((currLine + ' ' + word).trim().length <= 38) {
      currLine = (currLine + ' ' + word).trim();
    } else {
      addrLines.push(currLine);
      currLine = word;
    }
  }
  if (currLine) addrLines.push(currLine);

  const phoneStr = order.whatsapp.startsWith('0')
    ? `+62 ${order.whatsapp.slice(1)}`
    : order.whatsapp.startsWith('+')
    ? order.whatsapp
    : `+62 ${order.whatsapp}`;

  // Build product rows
  const productRows = order.items.map((item, idx) => {
    const no = padRight(String(idx + 1), 3);
    const name = padRight(item.name, 25);
    const variant = padRight(item.unit ? `Porsi-${item.unit}` : 'Reguler', 9);
    const qty = padLeft(String(item.quantity), 4);
    const priceStr = padLeft(formatRupiahSpaced(item.price, 9), 14);
    const totalStr = padLeft(formatRupiahSpaced(item.price * item.quantity, 9), 14);
    return ` ${no}| ${name} | ${variant}|${qty} | ${priceStr} | ${totalStr}`;
  });

  const subtotalStr = padLeft(formatRupiahSpaced(invoiceData.subtotal, 10), 15);
  const shippingStr = padLeft(formatRupiahSpaced(invoiceData.shippingCost, 10), 15);
  const uniqueCodeStr = padLeft(formatRupiahSpaced(invoiceData.uniqueCode, 10), 15);
  const totalBillStr = padLeft(formatRupiahSpaced(invoiceData.totalWithCode, 10), 15);

  const shippingDesc = `(${order.shippingMethodName}${order.distanceKm ? ` - ${order.distanceKm} km` : ''})`;

  const text = `================================================================================
                                 [ LOGO ASASORA ]
                             ${companyUrl}
                      ${companyAddress}
================================================================================

                                			INVOICE RESMI
                                			      -------------

 NO. INVOICE  	: ${invoiceData.invoiceNumber}
 TANGGAL      	: ${invoiceData.transactionDateStr}
 STATUS       	: MENUNGGU PEMBAYARAN
 JATUH TEMPO  	: ${invoiceData.dueDateStr}

--------------------------------------------------------------------------------
 KEPADA YTH (PELANGGAN):                      ALAMAT PENGIRIMAN:
--------------------------------------------------------------------------------
 Nama  	: ${padRight(order.customerName, 28)} ${order.customerName} (${phoneStr})
 Email 	: ${padRight(email, 28)} ${addrLines[0] || '-'}
 Telp  	: ${padRight(order.whatsapp, 28)} ${addrLines[1] || ''}
                                              		${addrLines[2] || ''}
--------------------------------------------------------------------------------

DETAIL PESANAN:
--------------------------------------------------------------------------------
 NO | NAMA PRODUK               | VARIAN  | QTY | HARGA SATUAN | TOTAL HARGA
----+---------------------------+---------+-----+--------------+----------------
${productRows.join('\n')}
--------------------------------------------------------------------------------
                                     		         SUBTOTAL PRODUK  : ${subtotalStr}
                                           	         ONGKOS KIRIM     : ${shippingStr}
                                              	         ${shippingDesc}
                                              	         KODE UNIK        : ${uniqueCodeStr}
                                              	         ----------------------------------
                                              	         TOTAL TAGIHAN    : ${totalBillStr}
--------------------------------------------------------------------------------

METODE PEMBAYARAN:
--------------------------------------------------------------------------------
 Bank Transfer (Verifikasi Otomatis)
 Bank Central Asia (BCA)
 No. Rekening : ${bcaNumber}
 Atas Nama    : ${bcaHolder}

PETUNJUK PEMBAYARAN:
 1. Mohon transfer tepat sampai 3 digit terakhir (${formatRupiahSpaced(invoiceData.totalWithCode, 8).trim()}) agar sistem 
    bisa mendeteksi pembayaran Anda secara otomatis tanpa perlu konfirmasi.
 2. Pesanan akan otomatis dibatalkan oleh sistem jika pembayaran tidak diterima
    sebelum batas waktu jatuh tempo.
 3. Invoice ini sah dan diterbitkan secara elektronik oleh sistem Asasora.

================================================================================
           Terima kasih telah berbelanja di Asasora! Kepuasan Anda Utama.
================================================================================`;

  return text;
}

/**
 * Downloads the invoice as a formatted professional PDF file
 */
export async function downloadInvoicePdf(
  invoiceText: string,
  invoiceNumber: string,
  customerName: string,
  logoUrl?: string,
  orderData?: {
    date?: string;
    items?: CartItem[];
    subtotal?: number;
    shippingCost?: number;
    shippingMethodName?: string;
    distanceKm?: number;
    uniqueCode?: number;
    totalAmount?: number;
    whatsapp?: string;
    address?: string;
  },
  companyData?: CompanyInfo
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const cleanNum = invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Invoice_Asasora_${cleanNum}.pdf`;

  // If structured order data is available, generate a high-end corporate invoice
  if (orderData && orderData.items && orderData.items.length > 0) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 14;

    // Top Header Background Accent
    doc.setFillColor(46, 111, 64); // #2E6F40
    doc.rect(0, 0, pageWidth, 6, 'F');

    // Try embedding logo image if possible
    try {
      if (logoUrl) {
        doc.addImage(logoUrl, 'PNG', margin, y, 22, 22);
      }
    } catch {
      // fallback without image
    }

    // Company Header Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(46, 111, 64);
    doc.text(companyData?.name || 'PT. ASASORA BIO HEALTHORA', margin + (logoUrl ? 26 : 0), y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      companyData?.tagline || 'Spesialis Katering Sehat, Diet & Medis (Halal BPJPH)',
      margin + (logoUrl ? 26 : 0),
      y + 11
    );
    doc.text(
      `Web: ${companyData?.website || 'www.asasorfood.com'} | CS WA: ${companyData?.whatsapp || '+62 852-7100-0900'}`,
      margin + (logoUrl ? 26 : 0),
      y + 16
    );

    // Invoice Title & Status Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('INVOICE RESMI', pageWidth - margin, y + 6, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 111, 64);
    doc.text(invoiceNumber, pageWidth - margin, y + 11, { align: 'right' });

    // Status Pill
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(pageWidth - margin - 45, y + 14, 45, 6, 2, 2, 'F');
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(7.5);
    doc.text('MENUNGGU PEMBAYARAN', pageWidth - margin - 22.5, y + 18, { align: 'center' });

    y += 28;

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // 2-Column Meta Info (Billed To & Invoice Details)
    const colWidth = (pageWidth - margin * 2 - 8) / 2;
    const col1X = margin;
    const col2X = margin + colWidth + 8;

    // Left Box: Customer Info
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(col1X, y, colWidth, 26, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(col1X, y, colWidth, 26, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('DITUJUKAN KEPADA:', col1X + 4, y + 5);

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(customerName, col1X + 4, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`WhatsApp: ${orderData.whatsapp || '-'}`, col1X + 4, y + 15);
    const shortAddr = (orderData.address || '-').substring(0, 48) + (orderData.address && orderData.address.length > 48 ? '...' : '');
    doc.text(`Alamat: ${shortAddr}`, col1X + 4, y + 20);

    // Right Box: Logistics & Date
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(col2X, y, colWidth, 26, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(col2X, y, colWidth, 26, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('INFORMASI PENGIRIMAN & WAKTU:', col2X + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Tanggal: ${orderData.date ? new Date(orderData.date).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}`, col2X + 4, y + 10);
    doc.text(`Jatuh Tempo: 24 Jam dari pemesanan`, col2X + 4, y + 15);
    doc.text(`Kurir: ${orderData.shippingMethodName || 'Kurir Reguler'}${orderData.distanceKm ? ` (${orderData.distanceKm} km)` : ''}`, col2X + 4, y + 20);

    y += 32;

    // Items Table Header
    doc.setFillColor(46, 111, 64);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('NO', margin + 3, y + 4.8);
    doc.text('RINCIAN MENU / PRODUK', margin + 14, y + 4.8);
    doc.text('QTY', margin + 105, y + 4.8, { align: 'center' });
    doc.text('HARGA SATUAN', margin + 140, y + 4.8, { align: 'right' });
    doc.text('SUBTOTAL', pageWidth - margin - 4, y + 4.8, { align: 'right' });
    y += 8;

    // Items Table Rows
    doc.setFont('helvetica', 'normal');
    orderData.items.forEach((item, idx) => {
      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 1, pageWidth - margin * 2, 7, 'F');
      }

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(String(idx + 1), margin + 3, y + 4);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const itemName = item.name.length > 40 ? item.name.substring(0, 38) + '..' : item.name;
      doc.text(itemName, margin + 14, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`${item.quantity} ${item.unit || 'porsi'}`, margin + 105, y + 4, { align: 'center' });
      doc.text(`Rp ${item.price.toLocaleString('id-ID')}`, margin + 140, y + 4, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`, pageWidth - margin - 4, y + 4, { align: 'right' });

      // Row separator
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 6, pageWidth - margin, y + 6);
      y += 7;
    });

    y += 4;

    // Calculation Summary Box (Right Aligned)
    const sumBoxWidth = 85;
    const sumBoxX = pageWidth - margin - sumBoxWidth;

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(sumBoxX, y, sumBoxWidth, 34, 2, 2, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(sumBoxX, y, sumBoxWidth, 34, 2, 2, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Subtotal Produk:', sumBoxX + 4, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Rp ${(orderData.subtotal || 0).toLocaleString('id-ID')}`, pageWidth - margin - 4, y + 6, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Ongkos Kirim:', sumBoxX + 4, y + 12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Rp ${(orderData.shippingCost || 0).toLocaleString('id-ID')}`, pageWidth - margin - 4, y + 12, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(46, 111, 64);
    doc.text('Kode Unik Verifikasi:', sumBoxX + 4, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.text(`+Rp ${(orderData.uniqueCode || 0).toLocaleString('id-ID')}`, pageWidth - margin - 4, y + 18, { align: 'right' });

    doc.setDrawColor(134, 239, 172);
    doc.line(sumBoxX + 4, y + 21, pageWidth - margin - 4, y + 21);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 111, 64);
    doc.text('TOTAL TAGIHAN:', sumBoxX + 4, y + 28);
    doc.text(`Rp ${(orderData.totalAmount || 0).toLocaleString('id-ID')}`, pageWidth - margin - 4, y + 28, { align: 'right' });

    // Left: Bank Transfer Credentials Box
    const bankBoxWidth = pageWidth - margin * 2 - sumBoxWidth - 6;
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, y, bankBoxWidth, 34, 2, 2, 'F');
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(margin, y, bankBoxWidth, 34, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 58, 138);
    doc.text('PEMBAYARAN: BANK CENTRAL ASIA (BCA)', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('No. Rekening:', margin + 4, y + 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 64, 175);
    doc.text(companyData?.bcaAccount?.number || '4971531139', margin + 4, y + 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Atas Nama: ${companyData?.bcaAccount?.holder || 'PT. ASASORA BIO HEALTHORA'}`, margin + 4, y + 22);

    doc.setFontSize(7);
    doc.setTextColor(37, 99, 235);
    doc.text('* Mohon transfer tepat sesuai nominal Total Tagihan di atas.', margin + 4, y + 28);

    y += 40;

    // Footer note
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Invoice resmi ini diterbitkan secara elektronik oleh sistem PT. ASASORA BIO HEALTHORA. Terima kasih!',
      pageWidth / 2,
      284,
      { align: 'center' }
    );

    doc.save(fileName);
    return;
  }

  // Fallback to text-block PDF
  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);

  const lines = invoiceText.split('\n');
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 12;
  let cursorY = 16;
  const lineHeight = 4.2;

  lines.forEach((line) => {
    if (cursorY + lineHeight > pageHeight - 12) {
      doc.addPage();
      cursorY = 16;
    }

    if (
      line.includes('INVOICE RESMI') ||
      line.includes('NO. INVOICE') ||
      line.includes('TOTAL TAGIHAN') ||
      line.includes('[ LOGO ASASORA ]')
    ) {
      doc.setFont('courier', 'bold');
    } else {
      doc.setFont('courier', 'normal');
    }

    doc.text(line, marginX, cursorY);
    cursorY += lineHeight;
  });

  doc.save(fileName);
}

