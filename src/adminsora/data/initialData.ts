import {
  Product,
  Ingredient,
  ProductionBatch,
  Purchase,
  HPPHistoryItem,
  Sale,
  Expense,
  Activity,
  AuditRecord,
  CompanyProfile,
  CashTransaction,
  CashSettings,
  UserCredentials,
} from '../types';

export const INITIAL_COMPANY_PROFILE: CompanyProfile = {
  name: 'PT. ASASORA BIO HEALTHORA',
  brand: 'Asasora Food & MinSora ERP',
  ptName: 'PT. ASASORA BIO HEALTHORA',
  nib: '2408220023412',
  npwp: '40.824.912.8-416.000',
  halalReg: 'ID36110081134110926',
  halalSupervisor: 'Dina Fatrian',
  address: 'Jl. Irigasi Sipon Tanah Tinggi Gg. Jambu 2 RT 004 RW 06 Kel. Buaran Indah, Kec. Tangerang, Kota Tangerang',
  phone: '0852-7100-0900',
  email: 'healthoraplus@gmail.com',
  logoUrl: '/logo-asasora.png',
};

export const INITIAL_USER_CREDENTIALS: UserCredentials = {
  username: 'admin',
  password: 'admin123@asasora',
  fullName: 'Administrator PT. Asasora',
  role: 'Penyelia Halal & Ops',
  email: 'healthoraplus@gmail.com',
};

export const INITIAL_CASH_SETTINGS: CashSettings = {
  initialBalanceAmount: 5000000,
  initialBalanceDate: '2026-09-01',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    no: 1,
    code: 'NKP-001',
    name: 'Nasi Kotak Premium',
    category: 'Catering & Event',
    price: 45000,
    stock: 120,
    unit: 'Box',
    halalStatus: 'Tersertifikasi BPJPH',
    description: 'Nasi putih, daging rendang, ayam bakar madu, sambal goreng kentang ati, capcay, kerupuk, air mineral',
    image: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_webp,q_auto:good/v1788334142/asasora/cnhxbbj4rdjqrnpmwuwr.webp',
  },
  {
    id: 2,
    no: 2,
    code: 'NKE-002',
    name: 'Nasi Kotak Ekonomis',
    category: 'Catering & Event',
    price: 25000,
    stock: 250,
    unit: 'Box',
    halalStatus: 'Tersertifikasi BPJPH',
    description: 'Nasi putih, olahan ayam laos, orek tempe, bihun goreng, sambal bajak, lalapan',
    image: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_webp,q_auto:good/v1788334401/asasora/x6fcjhjbv28ffrxdvqph.webp',
  },
  {
    id: 3,
    no: 3,
    code: 'NSM-003',
    name: 'Paket Nasi Daun Jeruk "NaSemangkuk"',
    category: 'Catering & Event',
    price: 20000,
    stock: 300,
    unit: 'Porsi',
    halalStatus: 'Tersertifikasi BPJPH',
    description: 'Nasi harum daun jeruk gurih, ayam suwir pedas kemangi, timun serut, sambal korek',
    image: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_webp,q_auto:good/v1788334529/asasora/fcsol8bqvn7if05nukga.webp',
  },
  {
    id: 4,
    no: 4,
    code: 'NBT-004',
    name: 'Nasi Bento "NaSemangkuk"',
    category: 'Catering & Event',
    price: 35000,
    stock: 80,
    unit: 'Bento',
    halalStatus: 'Tersertifikasi BPJPH',
    description: 'Nasi putih pulen, katsu ayam crispy, tamagoyaki telur gulung, salad sayur mayones, saus teriyaki',
    image: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_webp,q_auto:good/v1788334686/asasora/xzwssxab3gxt16stowaq.webp',
  },
  {
    id: 5,
    no: 5,
    code: 'PRU-005',
    name: 'Paru Sapi Balado "Asasora"',
    category: 'Produk Siap Santap',
    price: 40000,
    stock: 150,
    unit: 'Pcs',
    halalStatus: 'Tersertifikasi BPJPH',
    description: 'Paru sapi pilihan empuk berbumbu balado rica Nusantara, tahan 11 bulan steril vakum',
    image: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_webp,q_auto:good/v1788335914/asasora/bdkhax7wror6ws4nmjii.webp',
  },
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 1,
    name: 'Beras Premium Ramos',
    brand: 'Ramos Super',
    producer: 'PT. Pangan Nusantara',
    stock: 250,
    unit: 'Kg',
    cert: 'ID0011000012345',
    valid: '2027-12-31',
    status: 'Aman',
  },
  {
    id: 2,
    name: 'Daging Paru Sapi Segar',
    brand: 'RPH Dharma Jaya',
    producer: 'Perumda Dharma Jaya',
    stock: 65,
    unit: 'Kg',
    cert: 'ID3111000045890',
    valid: '2027-08-20',
    status: 'Aman',
  },
  {
    id: 3,
    name: 'Daging Ayam Karkas Broiler',
    brand: 'Charoen Pokphand',
    producer: 'PT. Charoen Pokphand Indonesia',
    stock: 120,
    unit: 'Kg',
    cert: 'ID0041000002134',
    valid: '2028-02-15',
    status: 'Aman',
  },
  {
    id: 4,
    name: 'Minyak Goreng Sawit',
    brand: 'Bimoli Spesial',
    producer: 'PT. Salim Ivomas Pratama',
    stock: 80,
    unit: 'Liter',
    cert: 'ID0041000034567',
    valid: '2027-10-10',
    status: 'Aman',
  },
  {
    id: 5,
    name: 'Bumbu Cabai Merah & Rempah Balado',
    brand: 'Bumbu Alami Asasora',
    producer: 'Dapur PT. Asasora',
    stock: 35,
    unit: 'Kg',
    cert: 'ID36110081134110926',
    valid: '2027-09-01',
    status: 'Aman',
  },
];

export const INITIAL_PRODUCTIONS: ProductionBatch[] = [
  {
    id: 1,
    batch: 'ABH-20260928-001',
    productName: 'Nasi Kotak Premium',
    productCode: 'NKP-001',
    qty: 120,
    date: '2026-09-28',
    ed: '2026-09-28',
    buyer: 'PT. Medika Sejahtera (Seminar 120 Pax)',
  },
  {
    id: 2,
    batch: 'ABH-20260927-002',
    productName: 'Paru Sapi Balado "Asasora"',
    productCode: 'PRU-005',
    qty: 200,
    date: '2026-09-27',
    ed: '2027-08-27',
    buyer: 'Stok Retort Vakum Steril Gudang',
  },
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 1,
    date: '2026-09-26',
    ingredient: 'Beras Premium Ramos',
    supplier: 'Grosir Beras Berkah',
    qty: 100,
    unit: 'Kg',
    price: 14500,
    total: 1450000,
  },
  {
    id: 2,
    date: '2026-09-27',
    ingredient: 'Daging Paru Sapi Segar',
    supplier: 'Supplier RPH Halal',
    qty: 40,
    unit: 'Kg',
    price: 85000,
    total: 3400000,
  },
];

export const INITIAL_HPP_HISTORY: HPPHistoryItem[] = [
  {
    id: 1,
    date: '2026-09-25',
    productName: 'Nasi Kotak Premium',
    rawMaterialCost: 26000,
    laborCost: 4500,
    overheadCost: 2500,
    totalHPP: 33000,
    unit: 33000,
    selling: 45000,
    marginPercent: 26.6,
  },
  {
    id: 2,
    date: '2026-09-26',
    productName: 'Nasi Kotak Ekonomis',
    rawMaterialCost: 14000,
    laborCost: 2500,
    overheadCost: 1500,
    totalHPP: 18000,
    unit: 18000,
    selling: 25000,
    marginPercent: 28.0,
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 1,
    date: '2026-09-28',
    productName: 'Nasi Kotak Premium',
    qty: 120,
    price: 45000,
    buyer: 'PT. Medika Sejahtera',
    total: 5400000,
    paymentMethod: 'Transfer BCA Perusahaan',
    invoiceNo: 'INV/20260928/AS-014',
  },
  {
    id: 2,
    date: '2026-09-27',
    productName: 'Paket Nasi Daun Jeruk "NaSemangkuk"',
    qty: 80,
    price: 20000,
    buyer: 'Bank BNI Cabang Tangerang (Rapat Divisi)',
    total: 1600000,
    paymentMethod: 'Transfer BCA',
    invoiceNo: 'INV/20260927/AS-011',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 1,
    date: '2026-09-26',
    category: 'Operasional Armada',
    description: 'Bahan Bakar & Biaya Tol Pengantaran Katering Karawaci',
    amount: 150000,
  },
  {
    id: 2,
    date: '2026-09-27',
    category: 'Kemasan & Sanitasi',
    description: 'Box Ivory Food Grade + Sendok Higienis Seal',
    amount: 320000,
  },
];

export const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    id: 1,
    date: '2026-09-28',
    trxNo: 'KAS-IN-001',
    type: 'Masuk',
    category: 'Pelunasan Pesanan',
    description: 'Pelunasan Invoice PT. Medika Sejahtera (120 Box Premium)',
    amount: 5400000,
  },
  {
    id: 2,
    date: '2026-09-27',
    trxNo: 'KAS-OUT-002',
    type: 'Keluar',
    category: 'Belanja Bahan Baku',
    description: 'Pembelian Beras dan Paru Segar',
    amount: 4850000,
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 1,
    time: 'Hari ini, 09:15',
    action: 'Produksi Batch',
    detail: 'Mencetak batch ABH-20260928-001 untuk "Nasi Kotak Premium" sebanyak 120 unit',
  },
  {
    id: 2,
    time: 'Kemarin, 14:30',
    action: 'Audit Internal SJPH',
    detail: 'Evaluasi kesesuaian bahan baku daging segar bersertifikat Halal: Lolos Sempurna',
  },
];

export const INITIAL_AUDITS: AuditRecord[] = [
  {
    id: 1,
    date: '2026-09-20',
    auditor: 'Dina Fatrian (Penyelia Halal)',
    unit: 'Dapur Pengolahan Utama Tangerang',
    scope: 'Komitmen, Bahan, Proses, Produk & Pemantauan (60 Butir SJPH)',
    totalChecked: 60,
    passed: 60,
    failed: 0,
    conclusion: 'Sangat Memenuhi (A-Grade) Tanpa Temuan Kritis',
    notes: 'Seluruh bahan baku bersertifikat aktif, sanitasi alat stainless steel higienis.',
  },
];
