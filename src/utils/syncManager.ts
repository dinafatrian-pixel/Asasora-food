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
  version?: number;
  updatedAt?: string;
}

export type SyncListener = (data: AppSyncData, source: 'sse' | 'poll' | 'broadcast' | 'local') => void;
export type StatusListener = (status: {
  connected: boolean;
  lastSyncTime: number | null;
  isSyncing: boolean;
  version: number;
}) => void;

class RealtimeSyncManager {
  private listeners: Set<SyncListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private pollTimer: any = null;
  private isConnected: boolean = false;
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
            if (event.data && event.data.type === 'DATA_UPDATE') {
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

    // Start SSE stream
    this.connectSSE();

    // Initial immediate fetch
    this.fetchLatestData();

    // Start periodic background sync fallback (every 20 seconds, only as backup)
    this.startPolling(20000);

    // Sync on window focus or online event
    window.addEventListener('focus', () => {
      this.fetchLatestData(false);
    });
    window.addEventListener('online', () => {
      this.connectSSE();
      this.fetchLatestData(false);
    });
  }

  private notifyStatus() {
    const status = {
      connected: this.isConnected,
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
          if (parsed && parsed.type === 'DATA_UPDATE' && parsed.payload) {
            this.handleIncomingData(parsed.payload, 'sse');
          }
        } catch (err) {
          console.warn('Error parsing SSE message:', err);
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.notifyStatus();

        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        // Try reconnecting after 4 seconds
        if (!this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connectSSE();
          }, 4000);
        }
      };
    } catch (e) {
      console.warn('SSE connection failed to initialize', e);
      this.isConnected = false;
      this.notifyStatus();
    }
  }

  private startPolling(intervalMs: number) {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => {
      // Only poll if SSE is disconnected or as an occasional check
      if (!this.isConnected) {
        this.fetchLatestData(true);
      }
    }, intervalMs);
  }

  private handleIncomingData(data: AppSyncData, source: 'sse' | 'poll' | 'broadcast' | 'local') {
    if (!data) return;

    const incomingVer = Number(data.version) || 0;

    // If polling or background check, only emit if incoming data has a strictly newer version
    if (source === 'poll' && incomingVer > 0 && incomingVer <= this.currentVersion) {
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
      this.isConnected = false;
    } finally {
      this.isSyncing = false;
      this.notifyStatus();
    }
    return null;
  }

  public async saveData(partial: Partial<AppSyncData>): Promise<boolean> {
    this.isSyncing = true;
    this.notifyStatus();

    // Broadcast immediately locally via BroadcastChannel for 0ms cross-tab latency
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'DATA_UPDATE',
          payload: { ...partial, version: this.currentVersion + 1, updatedAt: new Date().toISOString() },
        });
      } catch (e) {}
    }

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partial),
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.success && result.data) {
          this.isConnected = true;
          this.currentVersion = result.data.version || this.currentVersion + 1;
          this.lastSyncTime = Date.now();
          this.handleIncomingData(result.data, 'local');
          return true;
        }
      }
    } catch (err) {
      console.error('Failed to save data to server:', err);
      this.isConnected = false;
    } finally {
      this.isSyncing = false;
      this.notifyStatus();
    }
    return false;
  }

  public async createOrder(order: Order): Promise<boolean> {
    this.isSyncing = true;
    this.notifyStatus();

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
      console.error('Failed to send order to server:', err);
    } finally {
      this.isSyncing = false;
      this.notifyStatus();
    }
    return false;
  }

  public async resetAllData(): Promise<boolean> {
    this.isSyncing = true;
    this.notifyStatus();

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
      console.error('Failed to reset data on server:', err);
    } finally {
      this.isSyncing = false;
      this.notifyStatus();
    }
    return false;
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
      connected: this.isConnected,
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
