export type ProductCategory =
  | 'catering & event'
  | 'Produk Siap Santap'
  | 'Snak dan cemilan'
  | string;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  description: string;
  image: string;
  badge?: string;
  isPopular?: boolean;
  minOrder?: number;
  stock?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image?: string;
  notes?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  type?: 'instan' | 'toko';
  vehicleType?: 'motor' | 'mobil';
  courierGroup?: 'motor' | 'mobil' | 'toko';
  courierProvider?: 'gojek' | 'grab' | 'lalamove' | 'toko';
  baseFare: number;
  perKmRate?: number;
  perKm: number;
  minKm: number;
  minFare?: number;
  ratePerKm?: number;
  estimatedTime?: string;
  estTime?: string;
  description: string;
  isAvailable?: boolean;
  statusText?: string;
  calculatedPrice?: number;
}

export interface Order {
  id: string;
  invoiceNumber?: string;
  date: string;
  dueDate?: string;
  customerName: string;
  whatsapp: string;
  email?: string;
  customerEmail?: string;
  address: string;
  customerLat?: number;
  customerLng?: number;
  items: CartItem[];
  subtotal: number;
  shippingMethodName: string;
  shippingFee?: number;
  shippingCost?: number;
  distanceKm: number;
  uniqueCode?: number;
  totalAmount: number;
  rawInvoiceText?: string;
  paymentCode?: string;
  paymentMethod?: string;
  paymentProof?: string;
  status:
    | 'Menunggu Pembayaran'
    | 'Terkonfirmasi'
    | 'Diproses'
    | 'Dikirim'
    | 'Sedang Dikirim'
    | 'Selesai'
    | 'Dibatalkan';
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  image: string;
  icon?: string;
  iconName?: string;
}

export interface Review {
  id: string;
  name: string;
  company?: string;
  role?: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
  verified: boolean;
}

export interface ClientPartner {
  id: string;
  name: string;
  type: string;
  logo: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'dapur' | 'event' | 'olahan' | 'sertifikasi' | 'medis';
  image?: string;
  imageUrl?: string;
  caption: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  docNumber: string;
  issuer: string;
  description: string;
  validUntil: string;
  status: string;
  image?: string;
  previewUrl?: string;
}

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  // Aliases for compatibility
  bank?: string;
  number?: string;
  holder?: string;
}

export interface WarehouseLocationInfo {
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface CloudStorageConfig {
  provider: 'cloudinary' | 'custom';
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
  folder: string;
  autoOptimize: boolean;
  enabled: boolean;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  badgeText: string;
  halalBadgeText: string;
  halalLogoUrl?: string;
  halalNumber?: string;
  halalAgency?: string;
  logoUrl?: string;
  heroTitlePrefix?: string;
  heroTitleHighlight?: string;
  heroSubtitle?: string;
  heroValueProps?: { title: string; subtitle: string }[];
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  website?: string;
  operationalHours?: string;
  operationalDays?: string;
  operationalTime?: string;
  deliveryHours?: string;
  operationalNote?: string;
  bankAccount: BankAccountInfo;
  bcaAccount?: BankAccountInfo;
  warehouse: WarehouseLocationInfo;
  warehouseLocation?: {
    name: string;
    lat: number;
    lng: number;
    address: string;
  };
  cloudStorage?: CloudStorageConfig;
  googleAnalyticsId?: string;
  googleAnalyticsEnabled?: boolean;
}

export interface VisitorAnalytics {
  totalVisits: number;
  todayVisits: number;
  activeVisitors: number;
  uniqueVisitors: number;
  pageviews: number;
  ordersCount: number;
  waInquiriesCount: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  dailyHistory: {
    date: string;
    visits: number;
    pageviews: number;
  }[];
  topPages: {
    path: string;
    title: string;
    views: number;
  }[];
  lastUpdated: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'Super Admin' | 'Admin' | 'Staff' | 'Operator';
  email?: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
}
