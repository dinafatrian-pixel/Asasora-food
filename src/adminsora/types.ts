export interface Product {
  id: number;
  no?: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  halalStatus?: string;
  description?: string;
  image?: string;
}

export interface Ingredient {
  id: number;
  name: string;
  brand: string;
  producer: string;
  stock: number;
  unit: string;
  cert: string;
  valid: string;
  status: 'Aman' | 'Kritis' | 'Kedaluwarsa';
}

export interface ProductionBatch {
  id: number | string;
  batch: string;
  productName: string;
  productCode: string;
  qty: number;
  date: string;
  ed: string;
  buyer?: string;
  _docId?: string;
}

export interface Purchase {
  id: number;
  date: string;
  ingredient: string;
  supplier: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

export interface HPPHistoryItem {
  id: number;
  date: string;
  productName: string;
  rawMaterialCost: number;
  laborCost: number;
  overheadCost: number;
  totalHPP: number;
  unit: number; // HPP per porsi/unit
  selling: number; // Harga jual
  marginPercent: number;
}

export interface Sale {
  id: number;
  date: string;
  productName: string;
  qty: number;
  price: number;
  buyer: string;
  total: number;
  paymentMethod?: string;
  invoiceNo?: string;
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface Activity {
  id: number;
  time: string;
  action: string;
  detail: string;
}

export interface AuditRecord {
  id: number;
  date: string;
  auditor: string;
  unit: string;
  scope: string;
  totalChecked: number;
  passed: number;
  failed: number;
  conclusion: string;
  notes?: string;
}

export interface CompanyProfile {
  name: string;
  brand: string;
  ptName: string;
  nib: string;
  npwp: string;
  halalReg: string;
  halalSupervisor: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
}

export interface CashTransaction {
  id: string | number;
  date: string;
  trxNo?: string;
  type: 'Masuk' | 'Keluar';
  category: string;
  description: string;
  amount: number;
}

export interface CashSettings {
  initialBalanceAmount: number;
  initialBalanceDate: string;
}

export interface UserCredentials {
  username: string;
  password?: string;
  fullName?: string;
  role?: string;
  email?: string;
}
