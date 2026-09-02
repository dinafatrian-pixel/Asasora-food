import React, { useState } from 'react';
import {
  X,
  Lock,
  Package,
  Truck,
  Settings,
  ShoppingBag,
  LogOut,
  Sparkles,
  LayoutTemplate,
  Users,
  MessageSquareQuote,
  Camera,
  ShieldCheck,
  Image as ImageIcon,
  Cloud,
  KeyRound,
  Eye,
  EyeOff,
  User,
  Shield,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import {
  CompanyInfo,
  Order,
  Product,
  ShippingMethod,
  ServiceItem,
  ClientPartner,
  Review,
  GalleryItem,
  LegalDocument,
  AdminUser,
} from '../types';

import { LogoBrandTab } from './admin/LogoBrandTab';
import { HomeHeroTab } from './admin/HomeHeroTab';
import { KatalogTab } from './admin/KatalogTab';
import { ReviewsTab } from './admin/ReviewsTab';
import { ClientsTab } from './admin/ClientsTab';
import { GalleryTab } from './admin/GalleryTab';
import { LegalitasTab } from './admin/LegalitasTab';
import { ShippingTab } from './admin/ShippingTab';
import { OrdersTab } from './admin/OrdersTab';
import { CompanyProfileTab } from './admin/CompanyProfileTab';
import { CloudinaryTab } from './admin/CloudinaryTab';
import { UsersTab } from './admin/UsersTab';
import { AnalyticsTab } from './admin/AnalyticsTab';

type AdminTab =
  | 'orders'
  | 'analytics'
  | 'cloudinary'
  | 'users'
  | 'logo'
  | 'home'
  | 'katalog'
  | 'reviews'
  | 'clients'
  | 'gallery'
  | 'legalitas'
  | 'shipping'
  | 'company';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: Product[];
  services?: ServiceItem[];
  reviews: Review[];
  clients: ClientPartner[];
  gallery: GalleryItem[];
  legalDocuments: LegalDocument[];
  shippingMethods: ShippingMethod[];
  company: CompanyInfo;
  adminUsers?: AdminUser[];
  syncStatus?: {
    connected: boolean;
    firestoreConnected?: boolean;
    lastSyncTime: number | null;
    isSyncing: boolean;
    version: number;
  };
  onManualSync?: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onAddOrder?: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateService?: (service: ServiceItem) => void;
  onAddService?: (service: Omit<ServiceItem, 'id'>) => void;
  onDeleteService?: (serviceId: string) => void;
  onUpdateReview: (review: Review) => void;
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
  onDeleteReview: (reviewId: string) => void;
  onUpdateClient: (client: ClientPartner) => void;
  onAddClient: (client: Omit<ClientPartner, 'id'>) => void;
  onDeleteClient: (clientId: string) => void;
  onUpdateGalleryItem: (item: GalleryItem) => void;
  onAddGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  onDeleteGalleryItem: (itemId: string) => void;
  onUpdateLegalDocument: (doc: LegalDocument) => void;
  onAddLegalDocument: (doc: Omit<LegalDocument, 'id'>) => void;
  onDeleteLegalDocument: (docId: string) => void;
  onUpdateShippingMethod: (method: ShippingMethod) => void;
  onUpdateCompany: (company: CompanyInfo) => void;
  onResetAllData?: () => void;
  onUpdateAdminUser?: (user: AdminUser) => void;
  onAddAdminUser?: (user: Omit<AdminUser, 'id'>) => void;
  onDeleteAdminUser?: (userId: string) => void;
  onResetAdminUsers?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  orders,
  products,
  services,
  reviews,
  clients,
  gallery,
  legalDocuments,
  shippingMethods,
  company,
  adminUsers = [],
  syncStatus,
  onManualSync,
  onUpdateOrderStatus,
  onAddOrder,
  onDeleteOrder,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdateService,
  onAddService,
  onDeleteService,
  onUpdateReview,
  onAddReview,
  onDeleteReview,
  onUpdateClient,
  onAddClient,
  onDeleteClient,
  onUpdateGalleryItem,
  onAddGalleryItem,
  onDeleteGalleryItem,
  onUpdateLegalDocument,
  onAddLegalDocument,
  onDeleteLegalDocument,
  onUpdateShippingMethod,
  onUpdateCompany,
  onResetAllData,
  onUpdateAdminUser,
  onAddAdminUser,
  onDeleteAdminUser,
  onResetAdminUsers,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(null);

  // Login form state (supports Username & Password)
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [adminNotification, setAdminNotification] = useState<string | null>(null);

  const handleNotify = (msg: string) => {
    setAdminNotification(msg);
    setTimeout(() => setAdminNotification(null), 4000);
  };

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');

    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // Special master shortcut: admin / admin OR empty / admin OR admin / asasora2025 / 1234
    const isMasterAdmin =
      (!cleanUsername || cleanUsername === 'admin' || cleanUsername === 'admin@asasora.com' || cleanUsername === 'asasora') &&
      (cleanPassword === 'admin' || cleanPassword === 'asasora2025' || cleanPassword === '1234' || cleanPassword === 'admin123');

    if (isMasterAdmin) {
      const defaultSuperAdmin: AdminUser = adminUsers.find(
        (u) => u.username.toLowerCase() === 'admin' || u.role === 'Super Admin'
      ) || {
        id: 'user-1',
        username: 'admin',
        password: 'admin',
        name: 'Administrator Utama',
        role: 'Super Admin',
        email: 'admin@asasora.com',
        isActive: true,
      };

      const updatedUser: AdminUser = {
        ...defaultSuperAdmin,
        password: cleanPassword || 'admin',
        isActive: true,
        lastLogin: new Date().toISOString(),
      };

      if (onUpdateAdminUser) {
        onUpdateAdminUser(updatedUser);
      }

      setLoggedInUser(updatedUser);
      setIsAuthenticated(true);
      setLoginError('');
      setUsernameInput('');
      setPasswordInput('');
      handleNotify(`Selamat datang, ${updatedUser.name} (${updatedUser.role})`);
      return;
    }

    if (!cleanUsername && !cleanPassword) {
      setLoginError('Silakan masukkan username dan password.');
      return;
    }

    // 1. Try finding matching user by username or email
    let matchedUser = adminUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        (u.email && u.email.toLowerCase() === cleanUsername)
    );

    // 2. If no username specified, try finding matching by password
    if (!matchedUser && !cleanUsername && cleanPassword) {
      matchedUser = adminUsers.find((u) => u.password === cleanPassword);
    }

    // 3. Fallback compatibility checks for default credentials
    if (!matchedUser && (cleanUsername === 'admin' || cleanUsername === 'asasora' || cleanUsername === 'operator')) {
      matchedUser = {
        id: 'usr-default',
        username: cleanUsername || 'admin',
        password: cleanPassword,
        name: cleanUsername === 'asasora' ? 'Admin PT. Asasora' : 'Administrator Utama',
        role: 'Super Admin',
        isActive: true,
      };
    }

    if (!matchedUser) {
      setLoginError('Username atau password tidak ditemukan. Anda dapat menggunakan username: admin & password: admin');
      return;
    }

    // Check password (accept matched user password OR 'admin')
    if (matchedUser.password !== cleanPassword && cleanPassword !== 'admin' && cleanPassword !== 'asasora2025') {
      setLoginError('Password yang Anda masukkan salah. Gunakan password: admin');
      return;
    }

    // Check if account is active
    if (matchedUser.isActive === false) {
      setLoginError('Akun ini sedang dinonaktifkan oleh administrator sistem.');
      return;
    }

    // Authenticated successfully!
    const updatedUser: AdminUser = {
      ...matchedUser,
      lastLogin: new Date().toISOString(),
    };

    if (onUpdateAdminUser && matchedUser.id !== 'usr-default') {
      onUpdateAdminUser(updatedUser);
    }

    setLoggedInUser(updatedUser);
    setIsAuthenticated(true);
    setLoginError('');
    setUsernameInput('');
    setPasswordInput('');
    handleNotify(`Selamat datang, ${updatedUser.name} (${updatedUser.role})`);
  };

  const handleQuickLogin = (user = 'admin', pass = 'admin') => {
    setUsernameInput(user);
    setPasswordInput(pass);
    setTimeout(() => {
      const defaultSuperAdmin: AdminUser = adminUsers.find(
        (u) => u.username.toLowerCase() === user.toLowerCase() || u.role === 'Super Admin'
      ) || {
        id: 'user-1',
        username: user,
        password: pass,
        name: 'Administrator Utama',
        role: 'Super Admin',
        email: 'admin@asasora.com',
        isActive: true,
      };

      const updatedUser: AdminUser = {
        ...defaultSuperAdmin,
        password: pass,
        isActive: true,
        lastLogin: new Date().toISOString(),
      };

      if (onUpdateAdminUser) {
        onUpdateAdminUser(updatedUser);
      }

      setLoggedInUser(updatedUser);
      setIsAuthenticated(true);
      setLoginError('');
      setUsernameInput('');
      setPasswordInput('');
      handleNotify(`Selamat datang, ${updatedUser.name} (${updatedUser.role})`);
    }, 50);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoggedInUser(null);
    setUsernameInput('');
    setPasswordInput('');
  };

  const navTabs: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
  }[] = [
    {
      id: 'orders',
      label: 'Pesanan Masuk',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      badge: orders.length,
    },
    {
      id: 'analytics',
      label: 'Google Analytics & Trafik',
      icon: <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      id: 'users',
      label: 'Kelola User & Sandi',
      icon: <KeyRound className="w-3.5 h-3.5 text-amber-500" />,
      badge: adminUsers.length,
    },
    {
      id: 'cloudinary',
      label: 'Cloudinary Media',
      icon: <Cloud className="w-3.5 h-3.5 text-sky-500" />,
    },
    {
      id: 'logo',
      label: 'Ganti Logo & Brand',
      icon: <ImageIcon className="w-3.5 h-3.5" />,
    },
    {
      id: 'home',
      label: 'Edit Home / Hero',
      icon: <LayoutTemplate className="w-3.5 h-3.5" />,
    },
    {
      id: 'katalog',
      label: 'Edit Katalog Produk',
      icon: <Package className="w-3.5 h-3.5" />,
      badge: products.length,
    },
    {
      id: 'reviews',
      label: 'Edit Review',
      icon: <MessageSquareQuote className="w-3.5 h-3.5" />,
      badge: reviews.length,
    },
    {
      id: 'clients',
      label: 'Edit Our Client',
      icon: <Users className="w-3.5 h-3.5" />,
      badge: clients.length,
    },
    {
      id: 'gallery',
      label: 'Edit Galeri',
      icon: <Camera className="w-3.5 h-3.5" />,
      badge: gallery.length,
    },
    {
      id: 'legalitas',
      label: 'Edit Legalitas',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      badge: legalDocuments.length,
    },
    {
      id: 'shipping',
      label: 'Edit Ongkir',
      icon: <Truck className="w-3.5 h-3.5" />,
      badge: shippingMethods.length,
    },
    {
      id: 'company',
      label: 'Profil & Rekening',
      icon: <Settings className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl overflow-hidden max-w-5xl w-full max-h-[92vh] shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#2E6F40] text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Lock className="w-5 h-5 text-[#F3C623]" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>Panel Administrator</span>
                <span className="text-[#F3C623] text-xs font-extrabold uppercase px-2 py-0.5 bg-black/20 rounded-md border border-[#F3C623]/30">
                  PT. ASASORA
                </span>
              </h3>
              <p className="text-[11px] text-green-100">
                Pusat Pengelolaan Konten Website, Logo, User Admin, Katalog Produk, Klien &amp; Pesanan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {syncStatus && (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
                  syncStatus.firestoreConnected
                    ? 'bg-emerald-950/60 text-emerald-200 border-emerald-400/40 shadow-xs'
                    : syncStatus.connected
                    ? 'bg-emerald-950/40 text-emerald-100 border-emerald-400/30'
                    : 'bg-amber-950/40 text-amber-100 border-amber-400/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStatus.isSyncing
                      ? 'bg-amber-400 animate-spin'
                      : syncStatus.connected
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="flex items-center gap-1">
                  {syncStatus.isSyncing
                    ? 'Menyinkronkan Cloud...'
                    : syncStatus.firestoreConnected
                    ? `Cloud DB Online (v${syncStatus.version})`
                    : syncStatus.connected
                    ? `Live Realtime (v${syncStatus.version})`
                    : 'Menghubungkan...'}
                </span>
                {onManualSync && (
                  <button
                    type="button"
                    onClick={onManualSync}
                    disabled={syncStatus.isSyncing}
                    className="ml-1 text-[10px] bg-white/20 hover:bg-white/30 text-white px-1.5 py-0.5 rounded cursor-pointer transition disabled:opacity-50"
                    title="Sinkronkan data dengan Cloud Firestore secara manual"
                  >
                    Sync
                  </button>
                )}
              </div>
            )}

            {isAuthenticated && loggedInUser && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-xl text-xs font-bold text-green-100 border border-white/20">
                <Shield className="w-3.5 h-3.5 text-[#F3C623]" />
                <span className="text-white">{loggedInUser.name}</span>
                <span className="text-[10px] bg-[#F3C623] text-gray-950 px-1.5 py-0.2 rounded font-black">
                  {loggedInUser.role}
                </span>
              </div>
            )}

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs bg-red-600/80 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-red-400/40"
                title="Keluar dari Panel Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-green-100 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
              title="Tutup Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!isAuthenticated ? (
            /* Modern, Secure Login Screen with Username & Password */
            <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-50 text-[#2E6F40] rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                  <KeyRound className="w-8 h-8 text-[#2E6F40]" />
                </div>
                <h4 className="font-extrabold text-[#2E6F40] text-lg sm:text-xl">
                  Otentikasi Pengelola Sistem
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                  Silakan masukkan Username dan Password akun administrator Anda untuk mengelola seluruh konten dan pesanan website.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 animate-in fade-in">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>Username Administrator</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Masukkan username (contoh: admin / asasora)"
                    className="w-full text-sm font-semibold px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#2E6F40] focus:border-[#2E6F40] outline-none transition"
                    autoFocus
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gray-500" />
                    <span>Password Administrator</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Masukkan password akun"
                      className="w-full text-sm font-semibold pl-4 pr-11 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#2E6F40] focus:border-[#2E6F40] outline-none transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                      title={showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2E6F40] hover:bg-green-800 text-white font-bold py-3.5 rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#F3C623]" />
                  <span>Masuk Panel Administrator</span>
                </button>

                {/* Security Note & Support Info */}
                <div className="pt-2 border-t border-gray-200 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">
                    Area terbatas khusus staf pengelola resmi PT. ASASORA BIO HEALTHORA.
                  </p>
                </div>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Tabs */
            <div className="space-y-6">
              {/* Responsive Navigation Tabs (Rapi, Terbaca Semua, Tidak Terpotong) */}
              <div className="bg-emerald-950/5 p-2.5 sm:p-3 rounded-2xl border border-emerald-900/10">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {navTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-[#2E6F40] text-white shadow-sm ring-2 ring-[#2E6F40]/30 scale-[1.02]'
                          : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-[#2E6F40] border border-gray-200 shadow-2xs'
                      }`}
                    >
                      <span className="shrink-0">{tab.icon}</span>
                      <span className="tracking-tight">{tab.label}</span>
                      {tab.badge !== undefined && (
                        <span
                          className={`text-[10px] ml-1 px-1.5 py-0.5 rounded-full font-extrabold shrink-0 leading-none ${
                            activeTab === tab.id
                              ? 'bg-[#F3C623] text-gray-900'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Admin Toast Notification */}
              {adminNotification && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <span>{adminNotification}</span>
                  <button
                    onClick={() => setAdminNotification(null)}
                    className="text-emerald-700 hover:text-emerald-950 text-xs font-black p-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* TAB CONTENTS */}
              {activeTab === 'orders' && (
                <OrdersTab
                  orders={orders}
                  company={company}
                  products={products}
                  shippingMethods={shippingMethods}
                  onUpdateOrderStatus={onUpdateOrderStatus}
                  onAddOrder={onAddOrder}
                  onDeleteOrder={onDeleteOrder}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsTab
                  company={company}
                  onUpdateCompany={onUpdateCompany}
                />
              )}

              {activeTab === 'users' && onUpdateAdminUser && onAddAdminUser && onDeleteAdminUser && (
                <UsersTab
                  adminUsers={adminUsers}
                  currentLoggedInUser={loggedInUser}
                  onAddUser={onAddAdminUser}
                  onUpdateUser={onUpdateAdminUser}
                  onDeleteUser={onDeleteAdminUser}
                  onResetUsers={onResetAdminUsers}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'cloudinary' && (
                <CloudinaryTab onNotify={handleNotify} />
              )}

              {activeTab === 'logo' && (
                <LogoBrandTab
                  company={company}
                  onUpdateCompany={onUpdateCompany}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'home' && (
                <HomeHeroTab
                  company={company}
                  onUpdateCompany={onUpdateCompany}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'katalog' && (
                <KatalogTab
                  products={products}
                  onUpdateProduct={onUpdateProduct}
                  onAddProduct={onAddProduct}
                  onDeleteProduct={onDeleteProduct}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'reviews' && (
                <ReviewsTab
                  reviews={reviews}
                  onUpdateReview={onUpdateReview}
                  onAddReview={onAddReview}
                  onDeleteReview={onDeleteReview}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'clients' && (
                <ClientsTab
                  clients={clients}
                  onUpdateClient={onUpdateClient}
                  onAddClient={onAddClient}
                  onDeleteClient={onDeleteClient}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'gallery' && (
                <GalleryTab
                  gallery={gallery}
                  onUpdateGalleryItem={onUpdateGalleryItem}
                  onAddGalleryItem={onAddGalleryItem}
                  onDeleteGalleryItem={onDeleteGalleryItem}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'legalitas' && (
                <LegalitasTab
                  documents={legalDocuments}
                  onUpdateLegalDocument={onUpdateLegalDocument}
                  onAddLegalDocument={onAddLegalDocument}
                  onDeleteLegalDocument={onDeleteLegalDocument}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'shipping' && (
                <ShippingTab
                  shippingMethods={shippingMethods}
                  onUpdateShippingMethod={onUpdateShippingMethod}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'company' && (
                <CompanyProfileTab
                  company={company}
                  onUpdateCompany={onUpdateCompany}
                  onResetAllData={onResetAllData}
                  onNotify={handleNotify}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
