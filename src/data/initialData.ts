import {
  CompanyInfo,
  Product,
  ServiceItem,
  Review,
  ClientPartner,
  GalleryItem,
  LegalDocument,
  ShippingMethod,
  Order,
  AdminUser,
} from '../types';

export const initialCompanyInfo: CompanyInfo = {
  name: 'PT. ASASORA BIO HEALTHORA',
  tagline: '"TRADISI RASA INOVASI SELERA"',
  description: 'Produk berkualitas yang di hasil kan dari pangan yang aman serta halal.',
  badgeText: 'Food & Catering Partner',
  halalBadgeText: 'Sertifikat Halal Resmi BPJPH',
  halalNumber: 'ID3611000000000',
  halalAgency: 'BPJPH Kemenag RI',
  logoUrl: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788329882/asasora/mnswxa7jmq7nzsr0h7fk.png',
  halalLogoUrl: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788329899/asasora/cz2l79okyiljtn321uzr.jpg',
  heroTitlePrefix: 'PT. ASASORA',
  heroTitleHighlight: 'BIOHEALTHORA',
  heroSubtitle:
    'Penyedia resmi Food Service higienis bersertifikasi Halal BPJPH, aneka katering nasi kotak, prasmanan, dan makanan olahan siap saji terpercaya se-Jabodetabek.',
  heroValueProps: [
    { title: '100% Halal Resmi', subtitle: 'Bahan Baku Terjamin' },
    { title: 'Cek Ongkir Otomatis', subtitle: 'Armada Khusus Box' },
  ],
  address:
    'Jl. Irigasi sipon Tanah Tinggi Gg. Jambu 2 RT 004 RW 06 Kel. Buaran Indah Kec. Tangerang Kota Tangerang Banten',
  email: 'customerservice@asasorafood.com',
  phone: '+62 852-7100-0900',
  whatsapp: '6285271000900',
  website: 'www.asasorfood.com',
  operationalHours: 'Senin -Sabtu  (09.00 - 18.00 WIB)',
  operationalDays: 'Senin - Sabt u (Setiap Hari Kerja)',
  operationalTime: '09.00 - 18.00 WIB',
  deliveryHours: '06.00 - 20.00 WIB',
  operationalNote:
    'Menerima pesanan katering & nasi boks setiap hari.Tersedia di E-Catalog Inaproc, disarankan konfirmasi H-1.',
  bankAccount: {
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '4971531139',
    accountHolder: 'Dina Fatrian',
    bank: 'BCA (Bank Central Asia)',
    number: '4971531139',
    holder: 'Dina Fatrian',
  },
  bcaAccount: {
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '4971531139',
    accountHolder: 'Dina Fatrian',
    bank: 'BCA (Bank Central Asia)',
    number: '4971531139',
    holder: 'Dina Fatrian',
  },
  warehouse: {
    name: 'Gudang Asasora Tangerang',
    lat: -6.1783,
    lng: 106.6319,
    address: 'Buaran Indah, Kota Tangerang, Banten',
  },
  warehouseLocation: {
    name: 'Gudang Asasora Tangerang',
    lat: -6.1783,
    lng: 106.6319,
    address: 'Buaran Indah, Kota Tangerang, Banten',
  },
  cloudStorage: {
    provider: 'cloudinary',
    cloudName: 'xhzjg0n0',
    uploadPreset: 'asasora_unsigned',
    folder: 'asasora',
    autoOptimize: true,
    enabled: true,
  },
  googleAnalyticsId: '',
  googleAnalyticsEnabled: true,
};

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Nasi Kotak Premium',
    category: 'catering & event',
    price: 45000,
    unit: 'porsi / box',
    description:
      'Nasi putih\nOlahan daging\nOlahan ayam\nOlahan kentang\nOlahan sayur\nSambal\nKerupuk\nAir Mineral',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788334142/asasora/cnhxbbj4rdjqrnpmwuwr.png',
    badge: 'Best Seller Halal',
    isPopular: true,
    minOrder: 10,
    stock: 100,
  },
  {
    id: 'prod-2',
    name: 'Nasi Kotak Ekonomis',
    category: 'catering & event',
    price: 25000,
    unit: 'pax',
    description: 'Nasi putih, olahan ayam, olahan kentang, olahan sayur, sambal, kerupuk',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788334401/asasora/x6fcjhjbv28ffrxdvqph.png',
    badge: 'Favorit Event',
    isPopular: true,
    minOrder: 20,
    stock: 50,
  },
  {
    id: 'prod-3',
    name: 'Paket Nasi Daun Jeruk " NaSemangkuk"',
    category: 'catering & event',
    price: 20000,
    unit: 'porsi',
    description: 'Nasi Daun Jeruk, Olahan Ayam, Sambal, Lalapan.',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788334529/asasora/fcsol8bqvn7if05nukga.png',
    badge: 'Layanan Korporat',
    isPopular: true,
    minOrder: 20,
    stock: 200,
  },
  {
    id: 'prod-nmk-1',
    name: 'Nasi Bento "NaSemangkuk"',
    category: 'catering & event',
    price: 35000,
    unit: 'Bento',
    description: 'Nasi putih, olahan ayam/ikan pilet, olahan telur, olahan sayur, sambal',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788334686/asasora/xzwssxab3gxt16stowaq.png',
    badge: 'Fresh Daily',
    isPopular: true,
    minOrder: 20,
    stock: 25,
  },
  {
    id: 'prod-nmk-2',
    name: 'Tumpeng "Nasemangkuk"',
    category: 'catering & event',
    price: 750000,
    unit: 'paket',
    description:
      'Nasi kuning, olahan ayam, olahan telur, olahan tahu/tempe. bihun/mie goreng,olahan kentang, olahan sayur,sambal',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788334937/asasora/ojlgbld8adn5ld1nvld6.png',
    badge: 'satu porsi @25',
    isPopular: false,
    minOrder: 1,
    stock: 20,
  },
  {
    id: 'prod-4',
    name: 'Nasi Liwet Tampah "NaSemankuk"',
    category: 'catering & event',
    price: 750000,
    unit: 'paket',
    description:
      'Nasi Liwet, olahan ayam, olahan telur, oncom, ikan asin, olahan jengkol, olahan tahu&tempe, sambal, lalapan , kerupuk',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788335167/asasora/ggtcek25egtmw2xwa3cf.png',
    badge: 'Paket @25 porsi',
    isPopular: true,
    minOrder: 1,
    stock: 40,
  },
  {
    id: 'prod-1788335918404',
    name: 'Paru Sapi Balado " Asasora"',
    category: 'Produk Siap Santap',
    price: 40000,
    unit: 'Pcs',
    description:
      'Nikmati paru sapi goreng balado yang gurih, renyah, dan kaya rasa pedas khas Nusantara. Hadir dalam kemasan siap saji, praktis dan ekonomis, cukup dipanaskan sebelum disajikan. Tahan hingga 11 bulan pada suhu ruang, cocok untuk stok lauk di rumah maupun dibawa bepergian.',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788335914/asasora/bdkhax7wror6ws4nmjii.jpg',
    badge: 'Makana Siap Santap',
    isPopular: true,
    minOrder: 1,
    stock: 100,
  },
];

export const initialServices: ServiceItem[] = [
  {
    id: 'serv-food',
    title: 'Food Service & Katering Halal',
    category: 'Penyedia Makanan & Jasaboga',
    icon: 'utensils',
    iconName: 'Utensils',
    description:
      'Menyediakan hidangan katering sehat, higienis, dan tersertifikasi Halal BPJPH untuk kebutuhan instansi, perkantoran, acara keluarga, hingga paket konsumsi rutin korporat.',
    features: [
      '100% Bahan Baku Halal & Higienis Terverifikasi',
      'Standar Laik Higiene Sanitasi Dinas Kesehatan',
      'Pilihan Menu Nasi Box, Tumpeng, Snack, & Prasmanan',
      'Pengantaran Tepat Waktu dengan Armada Termal',
    ],
    image:
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'serv-prasmanan',
    title: 'Paket Prasmanan & Acara Spesial',
    category: 'Event & Corporate Gathering',
    icon: 'award',
    iconName: 'Award',
    description:
      'Layanan prasmanan profesional lengkap dengan peralatan saji mewah, dekorasi meja estetik, dan staf pelayan berstandar protokol higienis tinggi.',
    features: [
      'Menu Prasmanan Nusantara & Western Custom',
      'Peralatan Chafing Dish & Table Set Premium',
      'Pramusaji Terlatih & Berseragam Bersih',
      'Cocok untuk Wedding, Gathering, & Seminar',
    ],
    image:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  },
];

export const initialShippingMethods: ShippingMethod[] = [
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
    description: '',
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
    description: '',
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
    description: '',
  },
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
    description: '',
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
    description: '',
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
    description: '',
  },
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
    description: '',
  },
];

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    name: 'Hani Hanifah',
    company: 'PT. Surya Perkasa Mandiri',
    role: 'Manajer Klinik KSB',
    rating: 5,
    comment: 'Nasi daun jeruknya endul banged jadi mau lagi',
    date: '24 Agustus 2026',
    verified: true,
  },
];

export const initialClients: ClientPartner[] = [
  {
    id: 'c-1',
    name: 'PT. PRATAMA ABADI INDUSTRI',
    type: 'Mitra catering Event',
    logo: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788330493/asasora/qhyj0jwod200zqzxfgtj.webp',
  },
  {
    id: 'c-2',
    name: 'PT. Mamafuji Grup',
    type: 'Korporat Mitra Catering',
    logo: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788330532/asasora/pi8akvqvqxhdlikbnnef.jpg',
  },
  {
    id: 'c-3',
    name: 'Adda Rasa KJD Resto',
    type: 'Mitra Kerjasama Resto',
    logo: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788330582/asasora/lwcl4cnv5rgq3zopdpah.jpg',
  },
  {
    id: 'c-4',
    name: 'RS. Bethsaida',
    type: 'Mitra Catering Event',
    logo: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788330639/asasora/nqpv48camqoxl27yht01.jpg',
  },
  {
    id: 'c-5',
    name: 'Klinik KSB',
    type: 'Mitra Catering Event',
    logo: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788330679/asasora/hbtau1q5mmriqjymhmot.png',
  },
  {
    id: 'c-6',
    name: 'PT. Cipta Teknik Berjaya',
    type: 'Mitra Catering Event',
    logo: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788330948/asasora/jpwjck5oyidkhiv0vkft.jpg',
  },
  {
    id: 'c-7',
    name: 'Kandank Jurang Doank',
    type: 'Mitra kerja sama Outlet',
    logo: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788330997/asasora/koqkhcvv2kvfk9odqsru.jpg',
  },
  {
    id: 'c-8',
    name: 'BKHI',
    type: 'Mitra Catering Event',
    logo: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788331035/asasora/cxpwiblsvruyl8s90bkd.jpg',
  },
  {
    id: 'c-1788331089595',
    name: 'Kementrian UMKM RI',
    type: 'Mitra Catering Evetn',
    logo: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788331066/asasora/uurkw8knpcpc71exlps6.png',
  },
  {
    id: 'c-1788331124541',
    name: 'RS. Bunda Margonda',
    type: 'Mitra Catering Event',
    logo: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788331101/asasora/qusoiptioyxdvyxwtkta.jpg',
  },
];

export const initialGallery: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Dapur Higienis Berstandar Sanitasi',
    category: 'dapur',
    image:
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    imageUrl:
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    caption:
      'Proses pengolahan makanan dengan APD lengkap, sarung tangan steril, dan standar higienis jasaboga.',
  },
  {
    id: 'gal-2',
    title: 'Penyiapan Nasi Box Sehat Halal',
    category: 'event',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788330336/asasora/rv9u7lc7wlpennvjnt0g.png',
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    caption: 'Porsi seimbang dengan bahan pangan lokal  yang diawasi ketat sebelum proses packing.',
  },
  {
    id: 'gal-4',
    title: 'Penyajian Prasmanan Corporate Gathering',
    category: 'event',
    image:
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    imageUrl:
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    caption: 'Pelayanan katering profesional untuk acara instansi BUMN dan perusahaan multinasional.',
  },
  {
    id: 'gal-6',
    title: 'Audit & Sertifikasi Halal BPJPH',
    category: 'sertifikasi',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788330222/asasora/brppw3knihlripyrbfnk.png',
    imageUrl:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    caption: 'Verifikasi kepatuhan sistem jaminan produk halal secara menyeluruh dari hulu ke hilir.',
  },
];

export const initialLegalDocuments: LegalDocument[] = [
  {
    id: 'leg-1',
    title: 'Sertifikat Halal Resmi BPJPH Republik Indonesia',
    docNumber: 'ID36110001892830823',
    issuer: 'Badan Penyelenggara Jaminan Produk Halal (BPJPH) Kemenag RI',
    description:
      'Menyatakan bahwa produk olahan pangan dan jasa boga PT. ASASORA BIO HEALTHORA telah memenuhi Ketetapan Halal MUI & Standar BPJPH.',
    validUntil: 'Berlaku Selamanya (Sesuai Regulasi)',
    status: 'TERVERIFIKASI RESMI',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788331221/asasora/ifon5tr26xvzkolq8ckc.jpg',
    previewUrl:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'leg-2',
    title: 'Nomor Induk Berusaha (NIB) Berbasis Risiko',
    docNumber: '1289000492817',
    issuer: 'Pemerintah Republik Indonesia (OSS BKPM)',
    description:
      'Legalitas izin operasional berusaha untuk aktivitas penyediaan makanan (Jasaboga/Katering) dan Industri Produk Makanan Olahan.',
    validUntil: 'Aktif & Sah',
    status: 'TERDAFTAR RESMI',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788331259/asasora/psmdvi78sigk5lf0af04.png',
    previewUrl:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'leg-3',
    title: 'Sertifikat Pelatihan Penyelia Halal',
    docNumber: '001/LPPJPH-UAG/IHT/Batch-27/VIII/2026',
    issuer: 'Dinas Perindustrian & Perdagangan Kota Tangerang',
    description: 'Penyelia Halal',
    validUntil: 'Aktif Berkelanjutan',
    status: 'LULUS',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788333485/asasora/wp0hrqqmvtniftykq4f2.png',
    previewUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'leg-4',
    title: 'Sertifikat Penyuluhan Keamanan Pangan (SPP-PIRT)',
    docNumber: '3671/0011/IV/2026/DINKES',
    issuer: 'Dinas Kesehatan & PTSP Pemerintah Kota Tangerang',
    description: 'Sertifat Penyuluhan  keamanan pangan .',
    validUntil: 'Aktif & Terdaftar',
    status: 'TERDAFTAR RESMI',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788333421/asasora/wmq3ywpfmpwkl3gnillw.png',
    previewUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'leg-1788332238354',
    title: 'izin Edar Produk Pangan Olahan Industri Rumah Tangaga',
    docNumber: '2305260084676000004',
    issuer: 'Pemerintah Republik Indonesia',
    description: 'PM-UMKU',
    validUntil: 'Berlaku Selamanya',
    status: 'TERVERIFIKASI RESMI',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788332236/asasora/lrarsjakjn4lunifgrz6.png',
  },
  {
    id: 'leg-1788332404645',
    title: 'SK Menkumham',
    docNumber: 'AHU-A007025.AH.01.031.Tahun 2026',
    issuer: 'KemenKum Ham AHU Online',
    description: 'SK Menkumham PT. Asasora Bio Healthora',
    validUntil: 'Berlaku Selamanya',
    status: 'TERVERIFIKASI RESMI',
    image:
      'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788332403/asasora/ab4jgepohebl7k4w5ihq.png',
  },
];

export const initialOrders: Order[] = [];

export const initialAdminUsers: AdminUser[] = [
  {
    id: 'user-1',
    username: 'admin',
    password: 'asasora2025',
    name: 'Administrator Utama',
    role: 'Super Admin',
    email: 'admin@asasora.com',
    isActive: true,
    createdAt: '2025-01-01T08:00:00.000Z',
    lastLogin: '2026-09-02T10:09:59.011Z',
  },
  {
    id: 'user-2',
    username: 'asasora',
    password: 'admin',
    name: 'Admin PT. Asasora',
    role: 'Admin',
    email: 'healthoraplus@gmail.com',
    isActive: true,
    createdAt: '2025-01-10T10:00:00.000Z',
    lastLogin: '2025-01-10T10:15:00.000Z',
  },
  {
    id: 'user-3',
    username: 'operator',
    password: 'admin',
    name: 'Operator Pesanan & Dapur',
    role: 'Staff',
    email: 'operator@asasora.com',
    isActive: true,
    createdAt: '2025-01-15T09:00:00.000Z',
    lastLogin: '2025-01-15T09:30:00.000Z',
  },
];
