import { ShippingMethod } from '../types';

export const WAREHOUSE_ORIGIN = {
  name: 'Gudang Pusat Asasora Tangerang',
  lat: -6.1783,
  lng: 106.6319,
  address:
    'Jl. Irigasi sipon Tanah Tinggi Gg. Jambu 2 RT 004 RW 06 Kel. Buaran Indah Kec. Tangerang, Kota Tangerang, Banten',
};

export interface CalculatedCourierOption extends ShippingMethod {
  calculatedFare: number;
  isAvailable: boolean;
  statusText?: string;
  badgeColor?: string;
}

export const QUICK_LOCATION_PRESETS = [
  { name: 'Tangerang Kota (Pasar Anyar)', lat: -6.1738, lng: 106.6305 },
  { name: 'Cipondoh / Poris', lat: -6.1852, lng: 106.6698 },
  { name: 'Karawaci / Lippo', lat: -6.2255, lng: 106.6082 },
  { name: 'BSD City / Serpong', lat: -6.3015, lng: 106.6534 },
  { name: 'Cengkareng / Kalideres', lat: -6.1558, lng: 106.7118 },
  { name: 'Kebon Jeruk / Slipi', lat: -6.1914, lng: 106.7761 },
  { name: 'Sudirman / Thamrin Jakpus', lat: -6.2088, lng: 106.8228 },
  { name: 'Kebayoran / Blok M Jaksel', lat: -6.2443, lng: 106.7992 },
];

/**
 * Calculates distance in kilometers between two coordinates using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place precision
}

/**
 * Format currency to Indonesian Rupiah (e.g., Rp 35.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('IDR', 'Rp');
}

/**
 * Calculates accurate courier rate according to the specific prompt guidelines:
 * 
 * A. MOTOR/RODA DUA:
 * - Gojek Instan: Jarak * Rp 2.500 (Minimal Rp 12.000)
 * - Grab Instan: Jarak * Rp 2.600 (Minimal Rp 13.000)
 * - Lalamove Motor: Jarak * Rp 2.200 (Minimal Rp 10.000)
 * 
 * B. MOBIL/RODA EMPAT:
 * - GoCar: Jarak * Rp 4.500 (Minimal Rp 20.000)
 * - GrabCar: Jarak * Rp 4.700 (Minimal Rp 22.000)
 * - Lalamove Mobil: Jarak * Rp 5.000 (Minimal Rp 35.000)
 * 
 * C. KURIR TOKO (KHUSUS):
 * - Jarak < 5 Km = Rp 20.000
 * - Jarak 5 - 12 Km = Rp 35.000
 * - Jarak > 12 Km = "Di luar area Kurir Toko"
 */
export function calculateCourierTariff(
  methodId: string,
  distanceKm: number
): { fare: number; isAvailable: boolean; statusText?: string } {
  const dist = Math.max(0, distanceKm);

  switch (methodId) {
    // A. MOTOR / RODA DUA
    case 'gojek-motor':
    case 'gojek-instant':
      return {
        fare: Math.max(12000, Math.round(dist * 2500)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    case 'grab-motor':
    case 'grab-instant':
      return {
        fare: Math.max(13000, Math.round(dist * 2600)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    case 'lalamove-motor':
      return {
        fare: Math.max(10000, Math.round(dist * 2200)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    // B. MOBIL / RODA EMPAT
    case 'gocar-delivery':
    case 'gocar-instant':
      return {
        fare: Math.max(20000, Math.round(dist * 4500)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    case 'grab-car':
    case 'grabcar-instant':
      return {
        fare: Math.max(22000, Math.round(dist * 4700)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    case 'lalamove-car':
    case 'lalamove-van':
      return {
        fare: Math.max(35000, Math.round(dist * 5000)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    // C. KURIR TOKO (KHUSUS ASASORA)
    case 'toko-reguler':
    case 'kurir-toko':
      if (dist <= 0) {
        return { fare: 20000, isAvailable: true };
      }
      if (dist < 5) {
        return { fare: 20000, isAvailable: true, statusText: 'Tarif Flat Dekat (<5 Km)' };
      }
      if (dist <= 12) {
        return { fare: 35000, isAvailable: true, statusText: 'Tarif Reguler (5 - 12 Km)' };
      }
      return {
        fare: 35000,
        isAvailable: false,
        statusText: 'Di luar area Kurir Toko (Maks. 12 Km)',
      };

    default:
      // Generic fallback
      return {
        fare: Math.max(15000, Math.round(dist * 2500)),
        isAvailable: dist <= 40,
      };
  }
}

/**
 * Standard courier definitions
 */
export const STANDARD_COURIERS: ShippingMethod[] = [
  // A. KELOMPOK MOTOR / RODA DUA
  {
    id: 'gojek-motor',
    name: 'Gojek Instan (GoSend)',
    type: 'instan',
    vehicleType: 'motor',
    courierGroup: 'motor',
    courierProvider: 'gojek',
    baseFare: 12000,
    perKm: 2500,
    ratePerKm: 2500,
    minFare: 12000,
    minKm: 1,
    estimatedTime: '20 - 45 Menit',
    estTime: '20 - 45 Menit',
    description: 'Jarak * Rp 2.500 (Min. Rp 12.000). Cepat, praktis untuk nasi box & snack.',
  },
  {
    id: 'grab-motor',
    name: 'Grab Instan (GrabExpress)',
    type: 'instan',
    vehicleType: 'motor',
    courierGroup: 'motor',
    courierProvider: 'grab',
    baseFare: 13000,
    perKm: 2600,
    ratePerKm: 2600,
    minFare: 13000,
    minKm: 1,
    estimatedTime: '20 - 45 Menit',
    estTime: '20 - 45 Menit',
    description: 'Jarak * Rp 2.600 (Min. Rp 13.000). Pengantaran higienis dengan thermal bag.',
  },
  {
    id: 'lalamove-motor',
    name: 'Lalamove Motor',
    type: 'instan',
    vehicleType: 'motor',
    courierGroup: 'motor',
    courierProvider: 'lalamove',
    baseFare: 10000,
    perKm: 2200,
    ratePerKm: 2200,
    minFare: 10000,
    minKm: 1,
    estimatedTime: '25 - 50 Menit',
    estTime: '25 - 50 Menit',
    description: 'Jarak * Rp 2.200 (Min. Rp 10.000). Tarif ekonomis pengantaran langsung titik.',
  },

  // B. KELOMPOK MOBIL / RODA EMPAT
  {
    id: 'gocar-delivery',
    name: 'GoCar Instant Delivery',
    type: 'instan',
    vehicleType: 'mobil',
    courierGroup: 'mobil',
    courierProvider: 'gojek',
    baseFare: 20000,
    perKm: 4500,
    ratePerKm: 4500,
    minFare: 20000,
    minKm: 1,
    estimatedTime: '35 - 60 Menit',
    estTime: '35 - 60 Menit',
    description: 'Jarak * Rp 4.500 (Min. Rp 20.000). Mobil roda 4 aman guncangan & hujan untuk porsi sedang.',
  },
  {
    id: 'grab-car',
    name: 'GrabCar Delivery',
    type: 'instan',
    vehicleType: 'mobil',
    courierGroup: 'mobil',
    courierProvider: 'grab',
    baseFare: 22000,
    perKm: 4700,
    ratePerKm: 4700,
    minFare: 22000,
    minKm: 1,
    estimatedTime: '35 - 60 Menit',
    estTime: '35 - 60 Menit',
    description: 'Jarak * Rp 4.700 (Min. Rp 22.000). Nyaman & aman untuk tumpeng mini & prasmanan mini.',
  },
  {
    id: 'lalamove-car',
    name: 'Lalamove Mobil (Van / MPV)',
    type: 'instan',
    vehicleType: 'mobil',
    courierGroup: 'mobil',
    courierProvider: 'lalamove',
    baseFare: 35000,
    perKm: 5000,
    ratePerKm: 5000,
    minFare: 35000,
    minKm: 1,
    estimatedTime: '45 - 90 Menit',
    estTime: '45 - 90 Menit',
    description: 'Jarak * Rp 5.000 (Min. Rp 35.000). Kapasitas besar luas untuk prasmanan partai besar.',
  },

  // C. KURIR TOKO (KHUSUS)
  {
    id: 'toko-reguler',
    name: 'Kurir Toko Armada Asasora (Khusus)',
    type: 'toko',
    vehicleType: 'mobil',
    courierGroup: 'toko',
    courierProvider: 'toko',
    baseFare: 20000,
    perKm: 3500,
    ratePerKm: 3500,
    minFare: 20000,
    minKm: 1,
    estimatedTime: 'Terjadwal Dapur Asasora',
    estTime: 'Terjadwal Sesuai Acara',
    description: '<5 Km: Rp 20.000 | 5-12 Km: Rp 35.000 | >12 Km: Di luar area Kurir Toko.',
  },
];

/**
 * Calculates shipping cost for a given method
 */
export function calculateShippingCost(
  method: ShippingMethod,
  distanceKm: number
): number {
  const result = calculateCourierTariff(method.id, distanceKm);
  return result.fare;
}

/**
 * Generates an Order ID with date and random suffix (e.g., ASR-20260829-8921)
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ASR-${year}${month}${day}-${rand}`;
}

/**
 * Generates formatted WhatsApp text for order confirmation & proof of payment
 */
export function generateOrderWhatsAppMessage(order: {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  items: Array<{ name: string; quantity: number; price: number; unit: string }>;
  shippingMethod: string;
  distanceKm: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentCode: string;
}): string {
  const itemListText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}*\n   ${item.quantity} ${item.unit} x ${formatRupiah(item.price)} = *${formatRupiah(item.quantity * item.price)}*`
    )
    .join('\n');

  const text = `*FORMULIR PESANAN RESMI PT. ASASORA BIO HEALTHORA*
==============================
📋 *Nomor Order:* \`${order.orderId}\`
🏷️ *Kode Pembayaran:* \`${order.paymentCode}\`
👤 *Nama Pemesan:* ${order.name}
📱 *No. WhatsApp:* ${order.phone}
📍 *Alamat Kirim:* ${order.address}
🚚 *Metode Pengiriman:* ${order.shippingMethod} (${order.distanceKm} km)

📦 *DAFTAR PESANAN:*
${itemListText}

💰 *RINCIAN PEMBAYARAN:*
• Subtotal Produk: ${formatRupiah(order.subtotal)}
• Ongkos Kirim: ${formatRupiah(order.shippingCost)}
*TOTAL KESELURUHAN: ${formatRupiah(order.total)}*

🏦 *REKENING PEMBAYARAN:*
Bank BCA: *4971531139*
A.N: *Dina Fatrian*

Halo MinSora, saya telah membuat pesanan dan melampirkan bukti transfer pembayaran berikut. Mohon diproses dan diverifikasi. Terima kasih! 🙏✨`;

  return encodeURIComponent(text);
}
