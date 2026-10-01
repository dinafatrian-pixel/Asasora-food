import React, { useState, useEffect } from 'react';
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
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_INGREDIENTS,
  INITIAL_PRODUCTIONS,
  INITIAL_PURCHASES,
  INITIAL_HPP_HISTORY,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_ACTIVITIES,
  INITIAL_AUDITS,
  INITIAL_COMPANY_PROFILE,
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_CASH_SETTINGS,
  INITIAL_USER_CREDENTIALS,
} from './data/initialData';
import { downloadCSV, rupiah } from './utils/formatters';

import { LoginScreen } from './components/LoginScreen';
import { Sidebar, NavPage } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { ProductImportView } from './components/ProductImportView';
import { IngredientsView } from './components/IngredientsView';
import { IngredientImportView } from './components/IngredientImportView';
import { ProductionView } from './components/ProductionView';
import { PurchasesView } from './components/PurchasesView';
import { HPPView } from './components/HPPView';
import { SalesView } from './components/SalesView';
import { FinanceView } from './components/FinanceView';
import { TaxReportView } from './components/TaxReportView';
import { AuditView } from './components/AuditView';
import { AlertsView } from './components/AlertsView';
import { SettingsView } from './components/SettingsView';
import {
  subscribeCollection,
  subscribeDocument,
  saveEntityToCloud,
  deleteEntityFromCloud,
  deleteProductionFromCloud,
  saveDocumentToCloud,
  seedCollectionIfEmpty,
  clearCloudCollection,
  clearEntireCollection,
  replaceEntireCollection,
  testConnection,
  SyncStatus,
} from './firebase';

const STORAGE_PREFIX = 'minasasora_';

// One-time cleanup for transition to empty production data
if (typeof window !== 'undefined' && !localStorage.getItem('minsora_cleaned_v2')) {
  const keysToPurge = [
    'products',
    'ingredients',
    'productions',
    'purchases',
    'hppHistory',
    'sales',
    'expenses',
    'activities',
    'audits',
    'cashTransactions',
  ];
  keysToPurge.forEach((k) => localStorage.removeItem(STORAGE_PREFIX + k));
  localStorage.setItem('minsora_cleaned_v2', 'true');
}

// Remove any stale persisted login session so login screen is always active when app opens
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(STORAGE_PREFIX + 'isLoggedIn');
  } catch (e) {
    // ignore
  }
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Storage parse error for', key, err);
  }
  return fallback;
}

interface AdminSoraAppProps {
  onNavigateToPublic?: () => void;
  onOpenWebAdmin?: () => void;
}

export const AdminSoraApp: React.FC<AdminSoraAppProps> = ({
  onNavigateToPublic,
  onOpenWebAdmin,
}) => {
  // Authentication: Selalu tampilkan menu login saat aplikasi pertama kali dibuka
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'isLoggedIn');
    } catch (e) {
      console.warn('Logout storage error:', e);
    }
  };

  // User credentials & authentication profile
  const [userCredentials, setUserCredentials] = useState<UserCredentials>(() =>
    getStored('userCredentials', INITIAL_USER_CREDENTIALS)
  );

  // Navigation
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Domain Entities with LocalStorage Persistence
  const [products, setProducts] = useState<Product[]>(() =>
    getStored('products', INITIAL_PRODUCTS)
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>(() =>
    getStored('ingredients', INITIAL_INGREDIENTS)
  );
  const [productions, setProductions] = useState<ProductionBatch[]>(() =>
    getStored('productions', INITIAL_PRODUCTIONS)
  );
  const [purchases, setPurchases] = useState<Purchase[]>(() =>
    getStored('purchases', INITIAL_PURCHASES)
  );
  const [hppHistory, setHppHistory] = useState<HPPHistoryItem[]>(() =>
    getStored('hppHistory', INITIAL_HPP_HISTORY)
  );
  const [sales, setSales] = useState<Sale[]>(() =>
    getStored('sales', INITIAL_SALES)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    getStored('expenses', INITIAL_EXPENSES)
  );
  const [activities, setActivities] = useState<Activity[]>(() =>
    getStored('activities', INITIAL_ACTIVITIES)
  );
  const [audits, setAudits] = useState<AuditRecord[]>(() =>
    getStored('audits', INITIAL_AUDITS)
  );
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() =>
    getStored('companyProfile', INITIAL_COMPANY_PROFILE)
  );
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() =>
    getStored('cashTransactions', INITIAL_CASH_TRANSACTIONS)
  );
  const [cashSettings, setCashSettings] = useState<CashSettings>(() =>
    getStored('cashSettings', INITIAL_CASH_SETTINGS)
  );

  // Firebase Realtime Sync Status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connected');

  // Realtime synchronization with Firebase Firestore
  useEffect(() => {
    let active = true;

    // Test direct backend connection
    testConnection().then((ok) => {
      if (active && ok) {
        setSyncStatus('connected');
      }
    });

    const onDataReceived = () => {
      if (active) setSyncStatus('connected');
    };

    const onErrorReceived = () => {
      if (active) setSyncStatus('offline');
    };

    // 1. Products Listener
    const unsubProducts = subscribeCollection<Product>(
      'products',
      (items) => {
        if (!active) return;
        onDataReceived();
        if (items && items.length > 0) {
          setProducts(items.sort((a, b) => (a.no || 0) - (b.no || 0)));
        }
      },
      onErrorReceived
    );

    // 2. Ingredients Listener
    const unsubIngredients = subscribeCollection<Ingredient>(
      'ingredients',
      (items) => {
        if (!active) return;
        onDataReceived();
        if (items && items.length > 0) {
          setIngredients(items.sort((a, b) => a.id - b.id));
        }
      },
      onErrorReceived
    );

    // 3. Productions Listener
    const unsubProductions = subscribeCollection<ProductionBatch>(
      'productions',
      (items) => {
        if (!active) return;
        onDataReceived();
        if (items && items.length > 0) {
          setProductions(
            items.sort((a, b) => {
              if (a.date && b.date && a.date !== b.date) {
                return b.date.localeCompare(a.date);
              }
              return String(b.id || '').localeCompare(String(a.id || ''));
            })
          );
        }
      },
      onErrorReceived
    );

    // 4. Purchases Listener
    const unsubPurchases = subscribeCollection<Purchase>(
      'purchases',
      (items) => {
        if (!active) return;
        onDataReceived();
        if (items && items.length > 0) {
          setPurchases(items.sort((a, b) => b.id - a.id));
        }
      },
      onErrorReceived
    );

    // 5. HPP History Listener
    const unsubHPP = subscribeCollection<HPPHistoryItem>(
      'hppHistory',
      (items) => {
        if (!active) return;
        onDataReceived();
        if (items && items.length > 0) {
          setHppHistory(items.sort((a, b) => b.id - a.id));
        }
      },
      onErrorReceived
    );

    // 6. Sales Listener
    const unsubSales = subscribeCollection<Sale>(
      'sales',
      (items) => {
        if (!active) return;
        onDataReceived();
        if (items && items.length > 0) {
          setSales(items.sort((a, b) => b.id - a.id));
        }
      },
      onErrorReceived
    );

    // 7. Expenses Listener
    const unsubExpenses = subscribeCollection<Expense>(
      'expenses',
      (items) => {
        if (!active) return;
        onDataReceived();
        if (items && items.length > 0) {
          setExpenses(items.sort((a, b) => b.id - a.id));
        }
      },
      onErrorReceived
    );

    // 8. Audits Listener
    const unsubAudits = subscribeCollection<AuditRecord>(
      'audits',
      (items) => {
        if (!active) return;
        onDataReceived();
        if (items && items.length > 0) {
          setAudits(items.sort((a, b) => b.id - a.id));
        }
      },
      onErrorReceived
    );

    // 9. Company Profile Document Listener
    const unsubProfile = subscribeDocument<CompanyProfile>(
      'settings',
      'companyProfile',
      (data) => {
        if (!active) return;
        onDataReceived();
        if (data && data.name) {
          setCompanyProfile(data);
        } else {
          saveDocumentToCloud('settings', 'companyProfile', INITIAL_COMPANY_PROFILE);
        }
      },
      onErrorReceived
    );

    // 10. Cash Transactions Listener
    const unsubCash = subscribeCollection<CashTransaction>(
      'cash_transactions',
      (items) => {
        if (!active) return;
        onDataReceived();
        if (items && items.length > 0) {
          setCashTransactions(
            items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          );
        }
      },
      onErrorReceived
    );

    // 11. Cash Settings Listener
    const unsubCashSettings = subscribeDocument<CashSettings>(
      'settings',
      'cashSettings',
      (data) => {
        if (!active) return;
        onDataReceived();
        if (data && data.initialBalanceDate) {
          setCashSettings(data);
        } else {
          saveDocumentToCloud('settings', 'cashSettings', INITIAL_CASH_SETTINGS);
        }
      },
      onErrorReceived
    );

    // 12. User Credentials Listener
    const unsubCreds = subscribeDocument<UserCredentials>(
      'settings',
      'userCredentials',
      (data) => {
        if (!active) return;
        onDataReceived();
        if (data && data.username) {
          setUserCredentials(data);
        } else {
          saveDocumentToCloud('settings', 'userCredentials', INITIAL_USER_CREDENTIALS);
        }
      },
      onErrorReceived
    );

    return () => {
      active = false;
      unsubProducts();
      unsubIngredients();
      unsubProductions();
      unsubPurchases();
      unsubHPP();
      unsubSales();
      unsubExpenses();
      unsubAudits();
      unsubProfile();
      unsubCash();
      unsubCashSettings();
      unsubCreds();
    };
  }, []);

  // Save changes to localStorage as offline safety layer
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'products', JSON.stringify(products));
      localStorage.setItem(STORAGE_PREFIX + 'ingredients', JSON.stringify(ingredients));
      localStorage.setItem(STORAGE_PREFIX + 'productions', JSON.stringify(productions));
      localStorage.setItem(STORAGE_PREFIX + 'purchases', JSON.stringify(purchases));
      localStorage.setItem(STORAGE_PREFIX + 'hppHistory', JSON.stringify(hppHistory));
      localStorage.setItem(STORAGE_PREFIX + 'sales', JSON.stringify(sales));
      localStorage.setItem(STORAGE_PREFIX + 'expenses', JSON.stringify(expenses));
      localStorage.setItem(STORAGE_PREFIX + 'cashTransactions', JSON.stringify(cashTransactions));
      localStorage.setItem(STORAGE_PREFIX + 'cashSettings', JSON.stringify(cashSettings));
      localStorage.setItem(STORAGE_PREFIX + 'activities', JSON.stringify(activities));
      localStorage.setItem(STORAGE_PREFIX + 'audits', JSON.stringify(audits));
      localStorage.setItem(STORAGE_PREFIX + 'companyProfile', JSON.stringify(companyProfile));
      localStorage.setItem(STORAGE_PREFIX + 'userCredentials', JSON.stringify(userCredentials));
      localStorage.setItem(STORAGE_PREFIX + 'isLoggedIn', JSON.stringify(isLoggedIn));
    } catch (e) {
      console.error('Failed to sync to localStorage', e);
    }
  }, [
    products,
    ingredients,
    productions,
    purchases,
    hppHistory,
    sales,
    expenses,
    cashTransactions,
    cashSettings,
    activities,
    audits,
    companyProfile,
    userCredentials,
    isLoggedIn,
  ]);

  // Log activity helper
  const logActivity = (action: string, detail: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newAct: Activity = {
      id: Date.now(),
      time: `Hari ini, ${timeStr}`,
      action,
      detail,
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // 1. Products Handlers
  const handleAddProduct = (prod: Omit<Product, 'id'>) => {
    const newId = Date.now();
    const newProd: Product = { ...prod, id: newId };
    setProducts((prev) => [newProd, ...prev]);
    saveEntityToCloud('products', newProd).catch((e) => console.warn('Cloud sync error:', e));
    logActivity('Tambah Produk', `Menambahkan produk baru "${prod.name}" (${prod.code})`);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    saveEntityToCloud('products', updated).catch((e) => console.warn('Cloud sync error:', e));
    logActivity('Update Produk', `Memperbarui data produk "${updated.name}"`);
  };

  const handleDeleteProduct = (id: number) => {
    const found = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteEntityFromCloud('products', id).catch((e) => console.warn('Cloud sync error:', e));
    if (found) {
      logActivity('Hapus Produk', `Menghapus produk "${found.name}" dari master produk`);
    }
  };

  const handleImportProducts = (imported: Product[], mode: 'replace' | 'append' = 'replace') => {
    let finalItems = imported;
    if (mode === 'append') {
      const merged = [...products];
      imported.forEach((newItem) => {
        const existingIdx = merged.findIndex(
          (m) => m.name.trim().toLowerCase() === newItem.name.trim().toLowerCase()
        );
        if (existingIdx >= 0) {
          merged[existingIdx] = newItem;
        } else {
          merged.push(newItem);
        }
      });
      finalItems = merged;
    }

    setProducts(finalItems);
    localStorage.setItem(STORAGE_PREFIX + 'products', JSON.stringify(finalItems));

    if (mode === 'replace') {
      replaceEntireCollection('products', finalItems).catch((e) => console.warn('Cloud sync error:', e));
    } else {
      seedCollectionIfEmpty('products', finalItems, true).catch((e) => console.warn('Cloud sync error:', e));
    }

    logActivity(
      'Import Produk',
      `Mengimpor ${imported.length} master produk (${mode === 'replace' ? 'Mode Ganti Total: total ' + finalItems.length : 'Mode Gabung: total ' + finalItems.length} produk)`
    );
  };

  const handleResetProducts = () => {
    setProducts(INITIAL_PRODUCTS);
    seedCollectionIfEmpty('products', INITIAL_PRODUCTS, true).catch((e) => console.warn('Cloud sync error:', e));
    logActivity('Reset Master Produk', 'Mengatur ulang seluruh data produk ke master standar Asasora');
  };

  // 2. Ingredients Handlers
  const handleAddIngredient = (ing: Omit<Ingredient, 'id'>) => {
    const newId = Date.now();
    const newIng: Ingredient = { ...ing, id: newId };
    setIngredients((prev) => [newIng, ...prev]);
    saveEntityToCloud('ingredients', newIng).catch((e) => console.warn('Cloud sync error:', e));
    logActivity('Tambah Bahan Baku', `Menambahkan bahan "${ing.name}" dengan sertifikat ${ing.cert}`);
  };

  const handleUpdateIngredient = (updated: Ingredient) => {
    setIngredients((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    saveEntityToCloud('ingredients', updated).catch((e) => console.warn('Cloud sync error:', e));
    logActivity('Update Bahan Baku', `Memperbarui informasi dan status sertifikat "${updated.name}"`);
  };

  const handleDeleteIngredient = (id: number) => {
    const found = ingredients.find((i) => i.id === id);
    setIngredients((prev) => prev.filter((i) => i.id !== id));
    deleteEntityFromCloud('ingredients', id).catch((e) => console.warn('Cloud sync error:', e));
    if (found) {
      logActivity('Hapus Bahan Baku', `Menghapus bahan "${found.name}" dari daftar master bahan`);
    }
  };

  const handleImportIngredients = (imported: Ingredient[], mode: 'replace' | 'append' = 'replace') => {
    let finalItems = imported;
    if (mode === 'append') {
      const merged = [...ingredients];
      imported.forEach((newItem) => {
        const existingIdx = merged.findIndex(
          (m) =>
            m.name.trim().toLowerCase() === newItem.name.trim().toLowerCase() &&
            m.brand.trim().toLowerCase() === newItem.brand.trim().toLowerCase()
        );
        if (existingIdx >= 0) {
          merged[existingIdx] = newItem;
        } else {
          merged.push(newItem);
        }
      });
      finalItems = merged;
    }

    setIngredients(finalItems);
    localStorage.setItem(STORAGE_PREFIX + 'ingredients', JSON.stringify(finalItems));

    if (mode === 'replace') {
      replaceEntireCollection('ingredients', finalItems).catch((e) => console.warn('Cloud sync error:', e));
    } else {
      seedCollectionIfEmpty('ingredients', finalItems, true).catch((e) => console.warn('Cloud sync error:', e));
    }

    logActivity(
      'Import Bahan Baku',
      `Mengimpor ${imported.length} bahan baku (${mode === 'replace' ? 'Mode Ganti Total: total ' + finalItems.length : 'Mode Gabung: total ' + finalItems.length} bahan)`
    );
  };

  const handleResetIngredients = () => {
    setIngredients(INITIAL_INGREDIENTS);
    localStorage.setItem(STORAGE_PREFIX + 'ingredients', JSON.stringify(INITIAL_INGREDIENTS));
    seedCollectionIfEmpty('ingredients', INITIAL_INGREDIENTS, true).catch((e) => console.warn('Cloud sync error:', e));
    logActivity('Reset Master Bahan', 'Mereset data bahan baku ke standar halal Asasora');
  };

  // 3. Production Handlers
  const handleSaveProduction = (batch: Omit<ProductionBatch, 'id'>) => {
    const newId = Date.now();
    const newBatch: ProductionBatch = { ...batch, id: newId };
    setProductions((prev) => [newBatch, ...prev]);
    saveEntityToCloud('productions', newBatch).catch((e) => console.warn('Cloud sync error:', e));
    logActivity(
      'Produksi Batch',
      `Mencetak batch ${batch.batch} untuk "${batch.productName}" sebanyak ${batch.qty} unit`
    );
  };

  const handleDeleteProduction = async (target: ProductionBatch | number | string) => {
    const targetId = typeof target === 'object' ? target.id : target;
    const targetBatch =
      typeof target === 'object'
        ? target.batch
        : typeof target === 'string' && target.startsWith('ABH-')
        ? target
        : undefined;
    const targetDocId = typeof target === 'object' ? target._docId : undefined;

    const found = productions.find(
      (p) =>
        (targetDocId && p._docId === targetDocId) ||
        (targetBatch && p.batch === targetBatch) ||
        (targetId !== undefined && String(p.id) === String(targetId))
    );

    const updated = productions.filter(
      (p) =>
        !(
          (targetDocId && p._docId === targetDocId) ||
          (targetBatch && p.batch === targetBatch) ||
          (targetId !== undefined && String(p.id) === String(targetId))
        )
    );
    setProductions(updated);
    try {
      localStorage.setItem(STORAGE_PREFIX + 'productions', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }

    try {
      await deleteProductionFromCloud({
        id: targetId,
        batch: targetBatch || found?.batch,
        docId: targetDocId || found?._docId,
      });
    } catch (e) {
      console.warn('Cloud sync error:', e);
    }

    if (found || targetBatch) {
      const label = targetBatch || found?.batch || `ID #${targetId}`;
      const prodName = found?.productName ? ` (${found.productName})` : '';
      logActivity('Hapus Batch Produksi', `Menghapus catatan batch ${label}${prodName}`);
    }
  };

  const handleClearAllProductions = async () => {
    setProductions([]);
    try {
      localStorage.setItem(STORAGE_PREFIX + 'productions', JSON.stringify([]));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
    await clearEntireCollection('productions').catch((e) => console.warn('Cloud clear error:', e));
    logActivity('Kosongkan Produksi', 'Menghapus seluruh riwayat data batch produksi');
  };

  // 4. Purchase Handlers
  const handleSavePurchase = (purchase: Omit<Purchase, 'id'>) => {
    const newId = Date.now();
    const newPurchase: Purchase = { ...purchase, id: newId };
    setPurchases((prev) => [newPurchase, ...prev]);
    saveEntityToCloud('purchases', newPurchase).catch((e) => console.warn('Cloud sync error:', e));

    // Automatically increase ingredient stock
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.name.toLowerCase() === purchase.ingredient.toLowerCase()) {
          const updatedIng = {
            ...ing,
            stock: ing.stock + purchase.qty,
          };
          saveEntityToCloud('ingredients', updatedIng).catch((e) => console.warn('Cloud sync error:', e));
          return updatedIng;
        }
        return ing;
      })
    );

    logActivity(
      'Pembelian Bahan',
      `Membeli ${purchase.qty} ${purchase.unit} "${purchase.ingredient}" dari ${purchase.supplier}`
    );
  };

  const handleDeletePurchase = (id: number) => {
    const found = purchases.find((p) => p.id === id);
    setPurchases((prev) => prev.filter((p) => p.id !== id));
    deleteEntityFromCloud('purchases', id).catch((e) => console.warn('Cloud sync error:', e));
    if (found) {
      logActivity('Hapus Pembelian', `Menghapus catatan pembelian ${found.ingredient} (${found.supplier})`);
    }
  };

  const handleClearAllPurchases = async () => {
    const ids = purchases.map((p) => p.id);
    setPurchases([]);
    localStorage.removeItem(STORAGE_PREFIX + 'purchases');
    if (ids.length > 0) {
      await clearCloudCollection('purchases', ids).catch((e) => console.warn('Cloud clear error:', e));
    }
    logActivity('Kosongkan Pembelian', 'Menghapus seluruh riwayat transaksi pembelian bahan');
  };

  // 5. HPP Handlers
  const handleSaveHPP = (item: Omit<HPPHistoryItem, 'id'>) => {
    const newId = Date.now();
    const newItem: HPPHistoryItem = { ...item, id: newId };
    setHppHistory((prev) => [newItem, ...prev]);
    saveEntityToCloud('hppHistory', newItem).catch((e) => console.warn('Cloud sync error:', e));
    logActivity(
      'Kalkulasi HPP',
      `Menghitung HPP "${item.productName}" (HPP: Rp ${item.unit.toLocaleString()}, Jual: Rp ${item.selling.toLocaleString()})`
    );
  };

  const handleClearHPPHistory = () => {
    setHppHistory([]);
    logActivity('Bersihkan HPP', 'Menghapus riwayat perhitungan HPP');
  };

  // 6. Sales Handlers
  const handleSaveSale = (sale: Omit<Sale, 'id'>) => {
    const newId = Date.now();
    const newSale: Sale = { ...sale, id: newId };
    setSales((prev) => [newSale, ...prev]);
    saveEntityToCloud('sales', newSale).catch((e) => console.warn('Cloud sync error:', e));
    logActivity(
      'Pencatatan Penjualan',
      `Menjual ${sale.qty} unit "${sale.productName}" kepada ${sale.buyer} (Rp ${sale.total.toLocaleString()})`
    );
  };

  const handleDeleteSale = (id: number) => {
    const found = sales.find((s) => s.id === id);
    setSales((prev) => prev.filter((s) => s.id !== id));
    deleteEntityFromCloud('sales', id).catch((e) => console.warn('Cloud sync error:', e));
    if (found) {
      logActivity('Hapus Penjualan', `Menghapus transaksi penjualan ${found.productName} (${found.buyer})`);
    }
  };

  const handleClearAllSales = async () => {
    const ids = sales.map((s) => s.id);
    setSales([]);
    localStorage.removeItem(STORAGE_PREFIX + 'sales');
    if (ids.length > 0) {
      await clearCloudCollection('sales', ids).catch((e) => console.warn('Cloud clear error:', e));
    }
    logActivity('Kosongkan Penjualan', 'Menghapus seluruh riwayat transaksi penjualan');
  };

  // 7. Finance Handlers
  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newId = Date.now();
    const newExpense: Expense = { ...expense, id: newId };
    setExpenses((prev) => [newExpense, ...prev]);
    saveEntityToCloud('expenses', newExpense).catch((e) => console.warn('Cloud sync error:', e));
    logActivity('Catat Beban', `Mencatat beban ${expense.category}: "${expense.description}"`);
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    deleteEntityFromCloud('expenses', id).catch((e) => console.warn('Cloud sync error:', e));
    logActivity('Hapus Beban', 'Menghapus pos beban operasional');
  };

  // 8. Cash Flow Handlers
  const handleAddCashTransaction = (tx: Omit<CashTransaction, 'id'>) => {
    const newId = Date.now();
    const newTx: CashTransaction = { ...tx, id: newId };
    setCashTransactions((prev) => [newTx, ...prev]);
    saveEntityToCloud('cash_transactions', newTx).catch((e) => console.warn('Cloud sync error:', e));
    logActivity(`Kas ${tx.type}`, `${tx.category}: ${tx.description} (${rupiah(tx.amount)})`);
  };

  const handleUpdateCashTransaction = (tx: CashTransaction) => {
    setCashTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)));
    saveEntityToCloud('cash_transactions', tx).catch((e) => console.warn('Cloud sync error:', e));
    logActivity('Ubah Mutasi Kas', `${tx.trxNo || tx.id}: ${tx.description}`);
  };

  const handleDeleteCashTransaction = (id: string | number) => {
    setCashTransactions((prev) => prev.filter((item) => item.id !== id));
    deleteEntityFromCloud('cash_transactions', id).catch((e) => console.warn('Cloud sync error:', e));
    logActivity('Hapus Mutasi Kas', `Menghapus transaksi kas #${id}`);
  };

  const handleUpdateCashSettings = (settings: CashSettings) => {
    setCashSettings(settings);
    saveDocumentToCloud('settings', 'cashSettings', settings).catch((e) => console.warn('Cloud sync error:', e));
    logActivity('Saldo Awal Kas', `Saldo awal kas diatur menjadi ${rupiah(settings.initialBalanceAmount)}`);
  };

  // 9. Audit Handlers
  const handleSaveAudit = (record: Omit<AuditRecord, 'id'>) => {
    const newId = Date.now();
    const newAudit: AuditRecord = { ...record, id: newId };
    setAudits((prev) => [newAudit, ...prev]);
    saveEntityToCloud('audits', newAudit).catch((e) => console.warn('Cloud sync error:', e));
    logActivity(
      'Audit Internal SJPH',
      `Menyelesaikan evaluasi 60 butir audit untuk ${record.unit}: Hasil "${record.conclusion}"`
    );
  };

  // Synchronize all local state directly to Cloud Firebase Firestore
  const handleSyncAllToCloud = async () => {
    setSyncStatus('syncing');
    try {
      await Promise.all([
        seedCollectionIfEmpty('products', products, true),
        seedCollectionIfEmpty('ingredients', ingredients, true),
        seedCollectionIfEmpty('productions', productions, true),
        seedCollectionIfEmpty('purchases', purchases, true),
        seedCollectionIfEmpty('hppHistory', hppHistory, true),
        seedCollectionIfEmpty('sales', sales, true),
        seedCollectionIfEmpty('expenses', expenses, true),
        seedCollectionIfEmpty('cash_transactions', cashTransactions, true),
        seedCollectionIfEmpty('audits', audits, true),
        saveDocumentToCloud('settings', 'companyProfile', companyProfile),
        saveDocumentToCloud('settings', 'cashSettings', cashSettings),
        saveDocumentToCloud('settings', 'userCredentials', userCredentials),
      ]);
      setSyncStatus('connected');
    } catch (err) {
      console.error('Error syncing all to cloud:', err);
      setSyncStatus('error');
      throw err;
    }
  };

  // User credentials updater
  const handleUpdateCredentials = (newCreds: UserCredentials) => {
    setUserCredentials(newCreds);
    saveDocumentToCloud('settings', 'userCredentials', newCreds).catch((e) =>
      console.warn('Cloud sync error for credentials:', e)
    );
    logActivity('Update Kredensial', `Memperbarui username login "${newCreds.username}"`);
  };

  // Export Reports CSV
  const handleExportCSV = (type: string) => {
    if (type === 'productions') {
      const headers = ['Tanggal', 'Nama Produk', 'Kode Produk', 'Jumlah', 'Kode Batch', 'Kedaluwarsa (ED)', 'Pembeli'];
      const rows = productions.map((p) => [p.date, p.productName, p.productCode, p.qty, p.batch, p.ed, p.buyer || '-']);
      downloadCSV('Laporan_Produksi_Asasora', headers, rows);
    } else if (type === 'sales') {
      const headers = ['Tanggal', 'Produk', 'Qty', 'Harga Satuan', 'Pembeli', 'Total Omzet'];
      const rows = sales.map((s) => [s.date, s.productName, s.qty, s.price, s.buyer, s.total]);
      downloadCSV('Laporan_Penjualan_Asasora', headers, rows);
    } else if (type === 'ingredients') {
      const headers = ['Bahan', 'Merek', 'Produsen', 'Stok', 'Satuan', 'Sertifikat Halal', 'Valid s/d', 'Status'];
      const rows = ingredients.map((i) => [i.name, i.brand, i.producer, i.stock, i.unit, i.cert, i.valid, i.status]);
      downloadCSV('Master_Bahan_Baku_Asasora', headers, rows);
    }
  };

  // Backup & Restore
  const handleExportFullBackup = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      companyProfile,
      userCredentials,
      products,
      ingredients,
      productions,
      purchases,
      hppHistory,
      sales,
      expenses,
      activities,
      audits,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_MinSora_Asasora_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity('Backup Database', 'Mengunduh salinan cadangan lengkap database sistem');
  };

  const handleImportFullBackup = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) setProducts(data.products);
      if (data.ingredients) setIngredients(data.ingredients);
      if (data.productions) setProductions(data.productions);
      if (data.purchases) setPurchases(data.purchases);
      if (data.hppHistory) setHppHistory(data.hppHistory);
      if (data.sales) setSales(data.sales);
      if (data.expenses) setExpenses(data.expenses);
      if (data.activities) setActivities(data.activities);
      if (data.audits) setAudits(data.audits);
      if (data.companyProfile) setCompanyProfile(data.companyProfile);
      if (data.userCredentials) setUserCredentials(data.userCredentials);
      logActivity('Restore Database', 'Memulihkan data sistem dari file JSON cadangan');
      alert('Data sistem berhasil dipulihkan!');
    } catch {
      alert('Gagal memproses file backup. Pastikan format JSON valid.');
    }
  };

  const handleResetFactory = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang semua data ke kondisi awal pabrik?')) {
      setProducts(INITIAL_PRODUCTS);
      setIngredients(INITIAL_INGREDIENTS);
      setProductions(INITIAL_PRODUCTIONS);
      setPurchases(INITIAL_PURCHASES);
      setHppHistory(INITIAL_HPP_HISTORY);
      setSales(INITIAL_SALES);
      setExpenses(INITIAL_EXPENSES);
      setActivities(INITIAL_ACTIVITIES);
      setAudits(INITIAL_AUDITS);
      setCompanyProfile(INITIAL_COMPANY_PROFILE);
      setUserCredentials(INITIAL_USER_CREDENTIALS);
      setCashTransactions(INITIAL_CASH_TRANSACTIONS);
      setCashSettings(INITIAL_CASH_SETTINGS);
      logActivity('Reset Sistem', 'Mengembalikan seluruh data master dan transaksi ke default');
    }
  };

  const handleClearAllData = async () => {
    if (
      !window.confirm(
        'PERINGATAN: Apakah Anda yakin ingin MENGOSONGKAN SEMUA DATA DUMMY?\n\n' +
          'Tindakan ini akan menghapus semua sampel produk, bahan baku, batch produksi, pembelian, penjualan, HPP, arus kas, beban operasional, dan riwayat audit di penyimpanan browser maupun di Cloud Firestore.\n\n' +
          'Sistem akan 100% bersih dan siap untuk penginputan data operasional riil.'
      )
    ) {
      return;
    }

    setSyncStatus('syncing');
    try {
      await Promise.allSettled([
        clearEntireCollection('products'),
        clearEntireCollection('ingredients'),
        clearEntireCollection('productions'),
        clearEntireCollection('purchases'),
        clearEntireCollection('hppHistory'),
        clearEntireCollection('sales'),
        clearEntireCollection('expenses'),
        clearEntireCollection('audits'),
        clearEntireCollection('cash_transactions'),
        saveDocumentToCloud('settings', 'cashSettings', INITIAL_CASH_SETTINGS),
      ]);

      setProducts([]);
      setIngredients([]);
      setProductions([]);
      setPurchases([]);
      setHppHistory([]);
      setSales([]);
      setExpenses([]);
      setAudits([]);
      setCashTransactions([]);
      setActivities([]);
      setCashSettings(INITIAL_CASH_SETTINGS);

      const keysToPurge = [
        'products',
        'ingredients',
        'productions',
        'purchases',
        'hppHistory',
        'sales',
        'expenses',
        'activities',
        'audits',
        'cashTransactions',
        'cashSettings',
      ];
      keysToPurge.forEach((k) => localStorage.removeItem(STORAGE_PREFIX + k));
      localStorage.setItem('minsora_cleaned_v2', 'true');

      setSyncStatus('connected');
      logActivity(
        'Kosongkan Data',
        'Seluruh data dummy berhasil dihapus. Sistem bersih dan siap digunakan untuk operasional nyata.'
      );
      alert(
        'Alhamdulillah! Seluruh data dummy berhasil dikosongkan. Sistem MinSora ERP sekarang bersih dan siap digunakan untuk data operasional riil.'
      );
    } catch (err) {
      console.error('Gagal mengosongkan data:', err);
      setSyncStatus('connected');
      alert('Data lokal berhasil dikosongkan.');
    }
  };

  // Critical alerts count for badge
  const criticalCount = ingredients.filter(
    (i) => i.status !== 'Aman' || i.stock <= 3
  ).length;

  const ingredientIssuesCount = ingredients.filter(
    (i) => i.status !== 'Aman' || i.stock <= 5
  ).length;

  // Not logged in -> Show Login Screen
  if (!isLoggedIn) {
    return (
      <LoginScreen
        credentials={userCredentials}
        logoUrl={companyProfile.logoUrl}
        onLogin={(username) => {
          setIsLoggedIn(true);
          logActivity('Login Sistem', `Pengguna "${username}" berhasil login ke dashboard MinSora`);
        }}
        onBackToPublic={onNavigateToPublic}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-800 flex font-sans antialiased selection:bg-[#087443] selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setIsMobileMenuOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        mobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
        ingredientIssuesCount={ingredientIssuesCount}
        alertsCount={criticalCount}
        logoUrl={companyProfile.logoUrl}
        onNavigatePublic={onNavigateToPublic}
        onOpenWebAdmin={onOpenWebAdmin}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'
        }`}
      >
        {/* Topbar */}
        <Topbar
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setIsMobileMenuOpen((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          userName={userCredentials.fullName || companyProfile.halalSupervisor || 'Admin Asasora'}
          onNavigateAlerts={() => setCurrentPage('alerts')}
          alertCount={criticalCount}
          onNavigateSettings={() => setCurrentPage('settings')}
          onLogout={handleLogout}
          logoUrl={companyProfile.logoUrl}
          products={products}
          ingredients={ingredients}
          productions={productions}
          onNavigate={setCurrentPage}
          syncStatus={syncStatus}
          onGoToPublic={onNavigateToPublic}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardView
              products={products}
              ingredients={ingredients}
              productions={productions}
              sales={sales}
              activities={activities}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'products' && (
            <ProductsView
              products={products}
              companyProfile={companyProfile}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onResetProducts={handleResetProducts}
              onNavigate={setCurrentPage}
            />
          )}

          {(currentPage === 'productImport' || (currentPage as string) === 'product-import') && (
            <ProductImportView
              products={products}
              onImportProducts={handleImportProducts}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'ingredients' && (
            <IngredientsView
              ingredients={ingredients}
              companyProfile={companyProfile}
              onAddIngredient={handleAddIngredient}
              onUpdateIngredient={handleUpdateIngredient}
              onDeleteIngredient={handleDeleteIngredient}
              onResetIngredients={handleResetIngredients}
              onNavigate={setCurrentPage}
            />
          )}

          {(currentPage === 'ingredientImport' || (currentPage as string) === 'ingredient-import') && (
            <IngredientImportView
              ingredients={ingredients}
              onImportIngredients={handleImportIngredients}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'production' && (
            <ProductionView
              products={products}
              productions={productions}
              companyProfile={companyProfile}
              onSaveProduction={handleSaveProduction}
              onDeleteProduction={handleDeleteProduction}
              onClearAllProductions={handleClearAllProductions}
            />
          )}

          {currentPage === 'purchases' && (
            <PurchasesView
              purchases={purchases}
              ingredients={ingredients}
              companyProfile={companyProfile}
              onSavePurchase={handleSavePurchase}
              onDeletePurchase={handleDeletePurchase}
              onClearAllPurchases={handleClearAllPurchases}
            />
          )}

          {currentPage === 'hpp' && (
            <HPPView
              products={products}
              ingredients={ingredients}
              hppHistory={hppHistory}
              companyProfile={companyProfile}
              onSaveHPP={handleSaveHPP}
              onClearHPPHistory={handleClearHPPHistory}
            />
          )}

          {currentPage === 'sales' && (
            <SalesView
              sales={sales}
              products={products}
              companyProfile={companyProfile}
              onSaveSale={handleSaveSale}
              onDeleteSale={handleDeleteSale}
              onClearAllSales={handleClearAllSales}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'finance' && (
            <FinanceView
              sales={sales}
              purchases={purchases}
              productions={productions}
              hppHistory={hppHistory}
              expenses={expenses}
              cashTransactions={cashTransactions}
              cashSettings={cashSettings}
              companyProfile={companyProfile}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onAddCashTransaction={handleAddCashTransaction}
              onUpdateCashTransaction={handleUpdateCashTransaction}
              onDeleteCashTransaction={handleDeleteCashTransaction}
              onUpdateCashSettings={handleUpdateCashSettings}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'tax' && (
            <TaxReportView
              sales={sales}
              companyProfile={companyProfile}
              onNavigate={setCurrentPage}
              onUpdateProfile={(prof) => {
                setCompanyProfile(prof);
                logActivity('Update Profil Pajak', 'Memperbarui data NPWP & entitas perpajakan');
              }}
            />
          )}

          {currentPage === 'reports' && (
            <AuditView
              activities={activities}
              audits={audits}
              onSaveAudit={handleSaveAudit}
              onExportCSV={handleExportCSV}
            />
          )}

          {currentPage === 'alerts' && (
            <AlertsView
              ingredients={ingredients}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              profile={companyProfile}
              onUpdateProfile={(prof) => {
                setCompanyProfile(prof);
                saveDocumentToCloud('settings', 'companyProfile', prof).catch((e) =>
                  console.warn('Cloud sync error for company profile:', e)
                );
                logActivity('Update Profil Perusahaan', 'Memperbarui legalitas & kebijakan halal');
              }}
              onExportFullBackup={handleExportFullBackup}
              onImportFullBackup={handleImportFullBackup}
              onResetFactory={handleResetFactory}
              onClearAllDummyData={handleClearAllData}
              syncStatus={syncStatus}
              onSyncAllToCloud={handleSyncAllToCloud}
              credentials={userCredentials}
              onUpdateCredentials={handleUpdateCredentials}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminSoraApp;
