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
  tagline: '"PRODUK TERSERTIFIKASI HALAL BPJPH"',
  description:
    'Produk berkualitas yang di hasil kan dari pangan yang aman serta halal.',
  badgeText: 'Food & Catering Partner',
  halalBadgeText: 'Sertifikat Halal Resmi BPJPH',
  halalNumber: 'ID3611000000000',
  halalAgency: 'BPJPH Kemenag RI',
  logoUrl: '/logo-asasora.png',
  halalLogoUrl:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Halal_Indonesia.svg/512px-Halal_Indonesia.svg.png',
  heroTitlePrefix: 'PT. ASASORA',
  heroTitleHighlight: '',
  heroSubtitle:
    'Penyedia resmi Food Service higienis bersertifikasi Halal BPJPH, aneka katering nasi kotak, prasmanan, dan makanan olahan siap saji terpercaya se-Jabodetabek.',
  heroValueProps: [
    { title: '100% Halal Resmi', subtitle: 'Bahan Baku Terjamin' },
    { title: 'Sertifikat Dinkes', subtitle: 'Sanitasi Jasaboga' },
    { title: 'Cek Ongkir Otomatis', subtitle: 'Armada Khusus Box' },
  ],
  address:
    'Jl. Irigasi sipon Tanah Tinggi Gg. Jambu 2 RT 004 RW 06 Kel. Buaran Indah Kec. Tangerang Kota Tangerang Banten',
  email: 'healthoraplus@gmail.com',
  phone: '+62 852-7100-0900',
  whatsapp: '6285271000900',
  website: 'www.asasorfood.com',
  operationalHours: 'Senin - Minggu (06.00 - 21.00 WIB)',
  operationalDays: 'Senin - Minggu (Setiap Hari)',
  operationalTime: '06.00 - 21.00 WIB',
  deliveryHours: '06.00 - 20.00 WIB',
  operationalNote: 'Menerima pesanan katering & nasi boks setiap hari. Khusus pengiriman subuh/pagi hari, disarankan konfirmasi H-1.',
  bankAccount: {
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '4971531139',
    accountHolder: 'Dina Fatrian',
    bank: 'BCA (Bank Central Asia)',
    number: '4971531139',
    holder: 'Dina Fatrian',
  },
  bcaAccount: {
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
    cloudName: 'dmx8i2p7y',
    uploadPreset: 'asasora_unsigned',
    folder: 'asasora_media',
    autoOptimize: true,
    enabled: true,
  },
};

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Nasi Kotak Sehat Premium (Menu Halal Seimbang)',
    category: 'catering & event',
    price: 35000,
    unit: 'porsi / box',
    description:
      'Nasi organik/merah, ayam bakar rempah madu, tumis brokoli wortel jamur, tahu sutra panggang, sambal bajak rendah minyak, dan buah segar potong.',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    badge: 'Best Seller Halal',
    isPopular: true,
    minOrder: 5,
    stock: 100,
  },
  {
    id: 'prod-2',
    name: 'Nasi Tumpeng Mini Nusantara Asasora',
    category: 'catering & event',
    price: 45000,
    unit: 'pax',
    description:
      'Tumpeng mini eksklusif dengan nasi kuning gurih alami kunyit, empal suwir balado, telur balado mini, perkedel kentang lembut, urap sayur segar, dan sambal goreng.',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    badge: 'Favorit Event',
    isPopular: true,
    minOrder: 10,
    stock: 50,
  },
  {
    id: 'prod-3',
    name: 'Paket Prasmanan Corporate & Gathering',
    category: 'catering & event',
    price: 65000,
    unit: 'porsi',
    description:
      'Layanan prasmanan lengkap dengan staf berseragam higienis, 5 pilihan menu utama, aneka sayuran organik, sop sehat, dessert puding buah, dan infused water.',
    image:
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    badge: 'Layanan Korporat',
    isPopular: false,
    minOrder: 30,
    stock: 200,
  },
  {
    id: 'prod-nmk-1',
    name: 'Nasemangkuk Ayam Bakar Madu (Rice Bowl Spesial)',
    category: 'Produk Siap Santap',
    price: 28000,
    unit: 'bowl',
    description:
      'Ricebowl higienis: Nasi pulen wangi, suwiran ayam bakar bumbu madu gurih, telur mata sapi setengah matang, buncis crispy, dan sambal bawang Asasora.',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    badge: 'Fresh Daily',
    isPopular: true,
    minOrder: 1,
    stock: 25,
  },
  {
    id: 'prod-nmk-2',
    name: 'Nasemangkuk Beef Teriyaki Sehat (Rice Bowl)',
    category: 'Produk Siap Santap',
    price: 34000,
    unit: 'bowl',
    description:
      'Ricebowl daging sapi iris tipis lembut dengan saus teriyaki racikan rendah sodium, tumis brokoli wortel segar, wijen sangrai, dan telur onsen.',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    badge: 'Best Rice Bowl',
    isPopular: true,
    minOrder: 1,
    stock: 20,
  },
  {
    id: 'prod-4',
    name: 'Healthy Nutrition & Diet Seimbang Box',
    category: 'Produk Siap Santap',
    price: 42000,
    unit: 'box',
    description:
      'Menu sehat rendah sodium, rendah minyak, kaya serat & protein seimbang yang dirancang untuk asupan gizi harian optimal dan kebugaran tubuh.',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
    badge: 'Nutrisi Sehat',
    isPopular: false,
    minOrder: 1,
    stock: 40,
  },
  {
    id: 'prod-5',
    name: 'Snack Box Sehat Tradisional & Modern',
    category: 'Snak dan cemilan',
    price: 22000,
    unit: 'box',
    description:
      'Isi 3 macam kue higienis (Lemper ayam bakar, fruit tartlet rendah gula, pastel isi sayur ayam) + air mineral botol 330ml.',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    badge: 'Snack Event',
    isPopular: false,
    minOrder: 15,
    stock: 60,
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
    description: 'Jarak * Rp 2.200 (Min. Rp 10.000). Tarif hemat pengantaran langsung titik.',
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

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    name: 'Hj. Siti Rahmawati',
    company: 'PT. Surya Perkasa Mandiri',
    role: 'PT. Surya Perkasa Mandiri',
    rating: 5,
    comment:
      'Pemesanan 150 nasi box untuk acara sertifikasi kantor kami sangat memuaskan. Makanan datang hangat, higienis, rasa lezat dan sertifikat halalnya membuat kami tenang!',
    date: '24 Agustus 2026',
    verified: true,
  },
  {
    id: 'rev-2',
    name: 'dr. Hendra Pratama, Sp.PD',
    company: 'Panitia Seminar Nasional Tangerang',
    role: 'Panitia Seminar Nasional',
    rating: 5,
    comment:
      'Paket prasmanan dan healthy nutrition box untuk seminar kami sangat berkesan. Menu rendah gula & garam tapi tetap gurih lezat. Pelayanan staf saji sangat profesional.',
    date: '20 Agustus 2026',
    verified: true,
  },
  {
    id: 'rev-3',
    name: 'Agus Setiawan',
    company: 'Yayasan Bina Umat Tangerang',
    role: 'Yayasan Bina Umat Tangerang',
    rating: 5,
    comment:
      'Tumpeng mini dan snack box untuk milad yayasan penataannya sangat cantik. Semua tamu memuji kelezatan ayam dan sambal gorengnya. Terima kasih Asasora!',
    date: '18 Agustus 2026',
    verified: true,
  },
  {
    id: 'rev-4',
    name: 'Dewi Lestari, S.Farm',
    company: 'PT. Kimia Farma Trading',
    role: 'PT. Kimia Farma Trading',
    rating: 5,
    comment:
      'Layanan catering harian karyawan sangat higienis dan variatif. Ongkos kirim terhitung otomatis dan tepat waktu setiap jam makan siang.',
    date: '15 Agustus 2026',
    verified: true,
  },
];

export const initialClients: ClientPartner[] = [
  { id: 'c-1', name: 'Dinas Koperasi & UMKM Kota Tangerang', type: 'Instansi Pemerintah', logo: '🏛️' },
  { id: 'c-2', name: 'PT. Indofood Sukses Makmur Tbk', type: 'Korporat Mitra', logo: '🏢' },
  { id: 'c-3', name: 'PT. Telekomunikasi Indonesia (Telkom)', type: 'BUMN Mitra', logo: '📶' },
  { id: 'c-4', name: 'PT. Angkasa Pura Solusi', type: 'BUMN / Layanan Publik', logo: '✈️' },
  { id: 'c-5', name: 'Universitas Muhammadiyah Tangerang', type: 'Institusi Pendidikan', logo: '🎓' },
  { id: 'c-6', name: 'PT. Bank Central Asia Tbk (BCA)', type: 'Perbankan & Finansial', logo: '🏦' },
  { id: 'c-7', name: 'Yayasan Dompet Dhuafa', type: 'Lembaga Sosial & Kemanusiaan', logo: '🤝' },
  { id: 'c-8', name: 'PT. Mayora Indah Tbk Group', type: 'Industri Makanan', logo: '🏭' },
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
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    caption:
      'Porsi seimbang dengan bahan pangan lokal organik yang diawasi ketat sebelum proses packing.',
  },
  {
    id: 'gal-3',
    title: 'Pengemasan Higienis Makanan Olahan Frozen',
    category: 'olahan',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    caption:
      'Pengemasan vakum steril kedap udara untuk produk frozen food dan lauk siap saji tahan lama.',
  },
  {
    id: 'gal-4',
    title: 'Penyajian Prasmanan Corporate Gathering',
    category: 'event',
    image:
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    imageUrl:
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    caption:
      'Pelayanan katering profesional untuk acara instansi BUMN dan perusahaan multinasional.',
  },
  {
    id: 'gal-5',
    title: 'Penyajian Aneka Minuman Segar & Jus Alami',
    category: 'olahan',
    image:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    imageUrl:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    caption:
      'Pembuatan aneka minuman higienis berbahan buah segar dan rempah alami pilihan.',
  },
  {
    id: 'gal-6',
    title: 'Audit & Sertifikasi Halal BPJPH',
    category: 'sertifikasi',
    image:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    imageUrl:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    caption:
      'Verifikasi kepatuhan sistem jaminan produk halal secara menyeluruh dari hulu ke hilir.',
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
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
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
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    previewUrl:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'leg-3',
    title: 'Sertifikat Laik Higiene Sanitasi Jasaboga',
    docNumber: '440/1182/Dinkes-SK/2024',
    issuer: 'Dinas Kesehatan Pemerintah Kota Tangerang',
    description:
      'Standar kelayakan kebersihan sarana dapur, pengolahan air bersih, peralatan, dan penjamah makanan tersertifikasi higienis.',
    validUntil: 'Aktif Berkelanjutan',
    status: 'LULUS UJI LABORATORIUM',
    image:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80',
    previewUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'leg-4',
    title: 'Sertifikat Standar Pengolahan Pangan Industri Rumah Tangga (SPP-PIRT)',
    docNumber: 'P-IRT 2063671010892-28',
    issuer: 'Dinas Kesehatan & PTSP Pemerintah Kota Tangerang',
    description:
      'Izin edar jaminan keamanan mutu untuk produk makanan olahan kemasan, lauk siap saji, dan aneka minuman botol.',
    validUntil: 'Aktif & Terdaftar',
    status: 'TERDAFTAR RESMI P-IRT',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    previewUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  },
];

export const initialOrders: Order[] = [];

export const initialAdminUsers: AdminUser[] = [
  {
    id: 'user-1',
    username: 'admin',
    password: 'admin',
    name: 'Administrator Utama',
    role: 'Super Admin',
    email: 'admin@asasora.com',
    isActive: true,
    createdAt: '2025-01-01T08:00:00.000Z',
    lastLogin: '2025-01-01T08:30:00.000Z',
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


