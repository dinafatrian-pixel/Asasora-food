import {
  CompanyInfo,
  Product,
  ShippingMethod,
  Review,
  ClientPartner,
  GalleryItem,
  LegalDocument,
  Order,
  AdminUser,
} from '../types';
import { db, doc, setDoc, getDoc, onSnapshot } from '../firebase';
import {
  initialCompanyInfo,
  initialProducts,
  initialShippingMethods,
  initialClients,
  initialReviews,
  initialGallery,
  initialLegalDocuments,
  initialOrders,
  initialAdminUsers,
} from '../data/initialData';

export interface AppSyncData {
  company?: CompanyInfo;
  products?: Product[];
  shippingMethods?: ShippingMethod[];
  reviews?: Review[];
  clients?: ClientPartner[];
  gallery?: GalleryItem[];
  legalDocuments?: LegalDocument[];
  orders?: Order[];
  adminUsers?: AdminUser[];
  analytics?: any;
  version?: number;
  updatedAt?: string;
}

export type SyncListener = (data: AppSyncData, source: 'firestore' | 'sse' | 'poll' | 'broadcast' | 'local') => void;
export type StatusListener = (status: {
  connected: boolean;
  firestoreConnected: boolean;
  lastSyncTime: number | null;
  isSyncing: boolean;
  version: number;
}) => void;

// Helper to remove undefined properties before saving to Firestore
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

class RealtimeSyncManager {
  private listeners: Set<SyncListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private firestoreUnsubscribe: (() => void) | null = null;
  private pollTimer: any = null;
  private isConnected: boolean = false;
  private isFirestoreConnected: boolean = false;
  private isSyncing: boolean = false;
  private lastSyncTime: number | null = null;
  private currentVersion: number = 0;
  private reconnectTimeout: any = null;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.broadcastChannel = new BroadcastChannel('asasora_realtime_channel');
          this.broadcastChannel.onmessage = (event) => {
            if (event.data && event.data.type === 'DATA_UPDATE' && event.data.payload) {
              this.handleIncomingData(event.data.payload, 'broadcast');
            }
          };
        }
      } catch (e) {
        console.warn('BroadcastChannel not supported or failed to initialize', e);
      }
    }
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Connect to Firebase Firestore Real-Time Stream (Primary Cloud DB)
    this.connectFirestore();

    // 2. Connect to Server-Sent Events (SSE fallback for container environments)
    this.connectSSE();

    // 3. Initial immediate fetch from API if available
    this.fetchLatestData();

    // 4. Start periodic background sync fallback
    this.startPolling(30000);

    // 5. Sync on window focus or online event
    window.addEventListener('focus', () => {
      this.fetchLatestData(false);
    });
    window.addEventListener('online', () => {
      this.connectFirestore();
      this.connectSSE();
      this.fetchLatestData(false);
    });
  }

  private notifyStatus() {
    const status = {
      connected: this.isConnected || this.isFirestoreConnected,
      firestoreConnected: this.isFirestoreConnected,
      lastSyncTime: this.lastSyncTime,
      isSyncing: this.isSyncing,
      version: this.currentVersion,
    };
    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (e) {
        console.error('Error in status listener', e);
      }
    });
  }

  // Connect to Firebase Firestore Real-Time Listener
  private connectFirestore() {
    if (typeof window === 'undefined' || !db) return;

    if (this.firestoreUnsubscribe) {
      try {
        this.firestoreUnsubscribe();
      } catch (e) {}
      this.firestoreUnsubscribe = null;
    }

    try {
      const storeDocRef = doc(db, 'store', 'current');
      this.firestoreUnsubscribe = onSnapshot(
        storeDocRef,
        (docSnap) => {
          this.isFirestoreConnected = true;
          this.isConnected = true;
          if (docSnap.exists()) {
            const cloudData = docSnap.data() as AppSyncData;
            console.log(`[Firestore Realtime] Received update (v${cloudData.version || 1})`);
            this.handleIncomingData(cloudData, 'firestore');
          } else {
            console.log('[Firestore] Document store/current does not exist yet. Seeding initial data to Cloud...');
            this.seedInitialFirestoreData();
          }
          this.notifyStatus();
        },
        (error) => {
          console.warn('[Firestore] Realtime listener error (will use server fallback):', error.message);
          this.isFirestoreConnected = false;
          this.notifyStatus();
        }
      );
    } catch (err) {
      console.warn('[Firestore] Failed to attach realtime listener:', err);
      this.isFirestoreConnected = false;
      this.notifyStatus();
    }
  }

  // Seed initial defaults to Firebase Firestore if document is empty
  private async seedInitialFirestoreData() {
    if (!db) return;
    try {
      // Try to get data from local server API first if available, else initialData
      let masterData: any = null;
      try {
        const resp = await fetch(`/api/data?t=${Date.now()}`);
        if (resp.ok) {
          const json = await resp.json();
          if (json && json.data && json.data.products && json.data.products.length > 0) {
            masterData = json.data;
          }
        }
      } catch (e) {}

      const storeDocRef = doc(db, 'store', 'current');
      const seedData = masterData || {
        company: initialCompanyInfo,
        products: initialProducts,
        shippingMethods: initialShippingMethods,
        reviews: initialReviews,
        clients: initialClients,
        gallery: initialGallery,
        legalDocuments: initialLegalDocuments,
        orders: initialOrders,
        adminUsers: initialAdminUsers,
        analytics: {
          totalVisits: 14286,
          todayVisits: 390,
          activeVisitors: 1,
          uniqueVisitors: 8940,
          pageviews: 36526,
          ordersCount: 528,
          waInquiriesCount: 1142,
          deviceBreakdown: { mobile: 68, desktop: 28, tablet: 4 },
          dailyHistory: [
            { date: '26 Ags', visits: 310, pageviews: 890 },
            { date: '27 Ags', visits: 345, pageviews: 940 },
            { date: '28 Ags', visits: 412, pageviews: 1120 },
            { date: '29 Ags', visits: 390, pageviews: 980 },
            { date: '30 Ags', visits: 450, pageviews: 1250 },
            { date: '31 Ags', visits: 520, pageviews: 1480 },
            { date: '01 Sep', visits: 480, pageviews: 1390 },
            { date: '02 Sep', visits: 384, pageviews: 1120 },
          ],
          topPages: [
            { path: '/', title: 'Beranda (Home) - PT. ASASORA', views: 18456 },
            { path: '/#katalog', title: 'Katalog Produk & Catering Halal', views: 9820 },
            { path: '/#pemesanan-baru', title: 'Formulir Order Online & Ongkir', views: 4210 },
            { path: '/#legalitas', title: 'Dokumen Legalitas & Sertifikat BPJPH', views: 2430 },
            { path: '/#galery', title: 'Galeri Higiene & Dapur Jasaboga', views: 1610 },
          ],
          lastUpdated: new Date().toISOString(),
        },
        version: 112,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(storeDocRef, sanitizeForFirestore(seedData), { merge: true });
      this.isFirestoreConnected = true;
      this.isConnected = true;
      this.currentVersion = seedData.version || 112;
      this.lastSyncTime = Date.now();
      this.notifyStatus();
      console.log('[Firestore] Successfully seeded master data to Firebase Firestore!');
    } catch (err) {
      console.warn('[Firestore] Seeding failed:', err);
    }
  }

  private connectSSE() {
    if (typeof window === 'undefined') return;

    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {}
      this.eventSource = null;
    }

    try {
      this.eventSource = new EventSource('/api/realtime-stream');

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.notifyStatus();
      };

      this.eventSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(':')) return; // keepalive ping
          const parsed = JSON.parse(event.data);
          if (parsed && (parsed.type === 'DATA_UPDATE' || parsed.type === 'ANALYTICS_UPDATE') && parsed.payload) {
            this.handleIncomingData(parsed.payload, 'sse');
          }
        } catch (err) {
          console.warn('Error parsing SSE message:', err);
        }
      };

      this.eventSource.onerror = () => {
        // SSE might fail on static hosts like Vercel - Firestore will handle it smoothly!
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        // Try reconnecting after 6 seconds
        if (!this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connectSSE();
          }, 6000);
        }
      };
    } catch (e) {
      // Ignore SSE error on serverless hosts
    }
  }

  private startPolling(intervalMs: number) {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => {
      if (!this.isFirestoreConnected && !this.isConnected) {
        this.fetchLatestData(true);
      }
    }, intervalMs);
  }

  private handleIncomingData(data: AppSyncData, source: 'firestore' | 'sse' | 'poll' | 'broadcast' | 'local') {
    if (!data) return;

    if (data.analytics && typeof window !== 'undefined') {
      try {
        localStorage.setItem('asasora_local_analytics', JSON.stringify(data.analytics));
        window.dispatchEvent(new CustomEvent('asasora_analytics_update', { detail: data.analytics }));
      } catch (e) {}
    }

    const incomingVer = Number(data.version) || 0;

    // If polling or background check, only emit if incoming data has a strictly newer version
    if (source === 'poll' && incomingVer > 0 && incomingVer <= this.currentVersion && !data.analytics) {
      return;
    }

    if (incomingVer > this.currentVersion) {
      this.currentVersion = incomingVer;
    }
    this.lastSyncTime = Date.now();
    this.notifyStatus();

    this.listeners.forEach((listener) => {
      try {
        listener(data, source);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  public async fetchLatestData(isBackground: boolean = false): Promise<AppSyncData | null> {
    if (!isBackground) {
      this.isSyncing = true;
      this.notifyStatus();
    }

    // 1. First attempt to fetch fresh from Firestore
    if (db) {
      try {
        const storeDocRef = doc(db, 'store', 'current');
        const docSnap = await getDoc(storeDocRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data() as AppSyncData;
          this.isFirestoreConnected = true;
          this.isConnected = true;
          this.handleIncomingData(cloudData, 'firestore');
          this.isSyncing = false;
          this.notifyStatus();
          return cloudData;
        }
      } catch (err) {
        console.warn('[Firestore] Direct fetch error:', err);
      }
    }

    // 2. Fallback to server API endpoint
    try {
      const response = await fetch(`/api/data?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.success && result.data) {
          this.isConnected = true;
          this.handleIncomingData(result.data, isBackground ? 'poll' : 'local');
          return result.data;
        }
      }
    } catch (e) {
      // Offline or network error
    } finally {
      this.isSyncing = false;
      this.notifyStatus();
    }
    return null;
  }

  public async saveData(partial: Partial<AppSyncData>): Promise<boolean> {
    this.isSyncing = true;
    this.notifyStatus();

    const newVersion = this.currentVersion + 1;
    const nowIso = new Date().toISOString();
    const payloadToSave: Partial<AppSyncData> = {
      ...partial,
      version: newVersion,
      updatedAt: nowIso,
    };

    // 1. Broadcast immediately locally via BroadcastChannel for 0ms cross-tab latency
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'DATA_UPDATE',
          payload: payloadToSave,
        });
      } catch (e) {}
    }

    let firestoreSuccess = false;

    // 2. Write to Firebase Firestore Cloud Database (Guaranteed Global Realtime)
    if (db) {
      try {
        const storeDocRef = doc(db, 'store', 'current');
        const cleanData = sanitizeForFirestore(payloadToSave);
        await setDoc(storeDocRef, cleanData, { merge: true });
        this.isFirestoreConnected = true;
        this.isConnected = true;
        this.currentVersion = newVersion;
        this.lastSyncTime = Date.now();
        firestoreSuccess = true;
        console.log(`[Firestore] Successfully synced update to Cloud DB (v${newVersion})`);
      } catch (err) {
        console.warn('[Firestore] Failed to save directly to Firestore:', err);
      }
    }

    // 3. Also post to Express Backend Server (if available) for redundancy
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadToSave),
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.success && result.data) {
          this.isConnected = true;
          this.currentVersion = result.data.version || newVersion;
          this.lastSyncTime = Date.now();
          this.handleIncomingData(result.data, 'local');
          return true;
        }
      }
    } catch (err) {
      // On static hosts like Vercel, Express endpoint won't be available, but Firestore saved it!
    } finally {
      this.isSyncing = false;
      this.notifyStatus();
    }

    return firestoreSuccess;
  }

  public async createOrder(order: Order): Promise<boolean> {
    this.isSyncing = true;
    this.notifyStatus();

    // 1. Save order to Firebase Firestore directly
    if (db) {
      try {
        // Save to dedicated orders collection in Firestore
        const orderDocRef = doc(db, 'orders', order.id);
        await setDoc(orderDocRef, sanitizeForFirestore(order), { merge: true });

        // Also fetch current store to update orders array and decrement product stock in cloud store
        const storeDocRef = doc(db, 'store', 'current');
        const storeSnap = await getDoc(storeDocRef);
        if (storeSnap.exists()) {
          const storeData = storeSnap.data() as AppSyncData;
          const currentOrders = Array.isArray(storeData.orders) ? storeData.orders : [];
          const existingIdx = currentOrders.findIndex((o) => o.id === order.id);
          const updatedOrders = existingIdx >= 0
            ? currentOrders.map((o) => (o.id === order.id ? order : o))
            : [order, ...currentOrders];

          let updatedProducts = storeData.products;
          if (Array.isArray(updatedProducts) && Array.isArray(order.items)) {
            updatedProducts = updatedProducts.map((p) => {
              const orderedItem = order.items.find((it) => it.productId === p.id);
              if (orderedItem && typeof p.stock === 'number') {
                return { ...p, stock: Math.max(0, p.stock - (orderedItem.quantity || 1)) };
              }
              return p;
            });
          }

          const newVersion = (storeData.version || this.currentVersion) + 1;
          await setDoc(
            storeDocRef,
            sanitizeForFirestore({
              orders: updatedOrders,
              products: updatedProducts,
              version: newVersion,
              updatedAt: new Date().toISOString(),
            }),
            { merge: true }
          );
        }
      } catch (err) {
        console.warn('[Firestore] Error saving order to Cloud DB:', err);
      }
    }

    // 2. Also send to Express backend server
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.success && result.data) {
          this.isConnected = true;
          this.handleIncomingData(result.data, 'local');
          return true;
        }
      }
    } catch (err) {
      // Server error or Vercel static environment
    } finally {
      this.isSyncing = false;
      this.notifyStatus();
    }
    return true;
  }

  public async toggleProductLike(productId: string, increment: boolean): Promise<number | null> {
    const delta = increment ? 1 : -1;
    let newLikes: number | null = null;

    // 1. Update in Firebase Firestore Cloud Database with optimistic update
    if (db) {
      try {
        const storeDocRef = doc(db, 'store', 'current');
        const storeSnap = await getDoc(storeDocRef);
        if (storeSnap.exists()) {
          const storeData = storeSnap.data() as AppSyncData;
          const currentProducts = Array.isArray(storeData.products) ? storeData.products : [];
          const targetProduct = currentProducts.find((p) => p.id === productId);
          if (targetProduct) {
            const currentLikes = typeof targetProduct.likes === 'number' ? targetProduct.likes : 50;
            const updatedLikes = Math.max(0, currentLikes + delta);
            newLikes = updatedLikes;
            const updatedProducts = currentProducts.map((p) =>
              p.id === productId ? { ...p, likes: updatedLikes } : p
            );
            const newVersion = (storeData.version || this.currentVersion) + 1;
            await setDoc(
              storeDocRef,
              sanitizeForFirestore({
                products: updatedProducts,
                version: newVersion,
                updatedAt: new Date().toISOString(),
              }),
              { merge: true }
            );
            this.handleIncomingData({ ...storeData, products: updatedProducts, version: newVersion }, 'firestore');
          }
        }
      } catch (err) {
        console.warn('[Firestore] Error updating product likes:', err);
      }
    }

    // 2. Also sync to Express backend
    try {
      const response = await fetch('/api/product-like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, increment }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.success && typeof result.likes === 'number') {
          newLikes = result.likes;
          if (result.data) {
            this.handleIncomingData(result.data, 'local');
          }
        }
      }
    } catch (e) {
      // Offline or static server
    }

    return newLikes;
  }

  public async resetAllData(): Promise<boolean> {
    this.isSyncing = true;
    this.notifyStatus();

    const resetPayload: AppSyncData = {
      company: initialCompanyInfo,
      products: initialProducts,
      shippingMethods: initialShippingMethods,
      reviews: initialReviews,
      clients: initialClients,
      gallery: initialGallery,
      legalDocuments: initialLegalDocuments,
      orders: initialOrders,
      adminUsers: initialAdminUsers,
      version: this.currentVersion + 1,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        const storeDocRef = doc(db, 'store', 'current');
        await setDoc(storeDocRef, sanitizeForFirestore(resetPayload), { merge: true });
        console.log('[Firestore] Cloud database reset to defaults.');
      } catch (err) {
        console.warn('[Firestore] Error resetting Firestore:', err);
      }
    }

    try {
      const response = await fetch('/api/reset-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.success && result.data) {
          this.handleIncomingData(result.data, 'local');
          return true;
        }
      }
    } catch (err) {
      // Express server reset
    } finally {
      this.isSyncing = false;
      this.notifyStatus();
    }
    return true;
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.init();
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener({
      connected: this.isConnected || this.isFirestoreConnected,
      firestoreConnected: this.isFirestoreConnected,
      lastSyncTime: this.lastSyncTime,
      isSyncing: this.isSyncing,
      version: this.currentVersion,
    });
    return () => {
      this.statusListeners.delete(listener);
    };
  }
}

export const syncManager = new RealtimeSyncManager();
