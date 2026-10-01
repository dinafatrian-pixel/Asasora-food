import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Trash2,
  TrendingUp,
  Receipt,
  Search,
} from 'lucide-react';
import {
  Sale,
  Purchase,
  ProductionBatch,
  HPPHistoryItem,
  Expense,
  CashTransaction,
  CashSettings,
  CompanyProfile,
} from '../types';
import { rupiah } from '../utils/formatters';
import { NavPage } from './Sidebar';

interface FinanceViewProps {
  sales: Sale[];
  purchases: Purchase[];
  productions: ProductionBatch[];
  hppHistory: HPPHistoryItem[];
  expenses: Expense[];
  cashTransactions: CashTransaction[];
  cashSettings: CashSettings;
  companyProfile: CompanyProfile;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: number) => void;
  onAddCashTransaction: (tx: Omit<CashTransaction, 'id'>) => void;
  onUpdateCashTransaction: (tx: CashTransaction) => void;
  onDeleteCashTransaction: (id: string | number) => void;
  onUpdateCashSettings: (settings: CashSettings) => void;
  onNavigate: (page: NavPage) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  sales,
  purchases,
  expenses,
  cashTransactions,
  cashSettings,
  onAddExpense,
  onDeleteExpense,
  onAddCashTransaction,
  onDeleteCashTransaction,
  onUpdateCashSettings,
}) => {
  const [tab, setTab] = useState<'cash' | 'expenses'>('cash');
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Cash Form
  const [cashDate, setCashDate] = useState(new Date().toISOString().slice(0, 10));
  const [cashType, setCashType] = useState<'Masuk' | 'Keluar'>('Masuk');
  const [cashCategory, setCashCategory] = useState('Pelunasan Katering');
  const [cashDesc, setCashDesc] = useState('');
  const [cashAmount, setCashAmount] = useState<number>(500000);

  // Expense Form
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expCategory, setExpCategory] = useState('Operasional Armada');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState<number>(100000);

  // Calculations
  const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const estimatedNet = totalSales - totalPurchases - totalExpenses;

  const totalCashIn = cashTransactions
    .filter((c) => c.type === 'Masuk')
    .reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalCashOut = cashTransactions
    .filter((c) => c.type === 'Keluar')
    .reduce((sum, c) => sum + (c.amount || 0), 0);
  const currentCashBalance =
    (cashSettings.initialBalanceAmount || 0) + totalCashIn - totalCashOut;

  const handleCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCashTransaction({
      date: cashDate,
      trxNo: `KAS-${cashType === 'Masuk' ? 'IN' : 'OUT'}-${Date.now().toString().slice(-4)}`,
      type: cashType,
      category: cashCategory,
      description: cashDesc,
      amount: cashAmount,
    });
    setIsCashModalOpen(false);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      date: expDate,
      category: expCategory,
      description: expDesc,
      amount: expAmount,
    });
    setIsExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#087443]" />
            <span>Keuangan, Arus Kas & Beban Operasional</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Buku kas harian katering, ringkasan mutasi dana, belanja armada, dan perkiraan laba operasional.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsCashModalOpen(true)}
            className="px-4 py-2 bg-[#087443] hover:bg-[#065e36] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Mutasi Kas</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Catat Beban / Biaya</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saldo Kas Riil</span>
          <p className="text-2xl font-black text-emerald-800 mt-2">{rupiah(currentCashBalance)}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Saldo Awal: {rupiah(cashSettings.initialBalanceAmount)}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Omzet Penjualan</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{rupiah(totalSales)}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Semua pesanan lunas & invoice</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Belanja Bahan & Biaya</span>
          <p className="text-2xl font-black text-rose-700 mt-2">{rupiah(totalPurchases + totalExpenses)}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Bahan: {rupiah(totalPurchases)} | Ops: {rupiah(totalExpenses)}</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimasi Laba Bersih</span>
          <p className="text-2xl font-black text-[#087443] mt-2">{rupiah(estimatedNet)}</p>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Setelah biaya bahan & operasional</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setTab('cash')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === 'cash' ? 'bg-[#087443] text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Buku Mutasi Kas ({cashTransactions.length})
        </button>
        <button
          onClick={() => setTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === 'expenses' ? 'bg-[#087443] text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daftar Beban Operasional ({expenses.length})
        </button>
      </div>

      {/* Table Content */}
      {tab === 'cash' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Tanggal & No. Trx</th>
                  <th className="py-3.5 px-4">Jenis</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4">Nominal</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada mutasi kas tercatat.
                    </td>
                  </tr>
                ) : (
                  cashTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <p className="font-mono font-bold text-slate-800">{tx.trxNo || `ID-${tx.id}`}</p>
                        <span className="text-[10px] text-slate-400">{tx.date}</span>
                      </td>
                      <td className="py-3 px-4">
                        {tx.type === 'Masuk' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            <span>Kas Masuk</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                            <span>Kas Keluar</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{tx.category}</td>
                      <td className="py-3 px-4 text-slate-600">{tx.description}</td>
                      <td className="py-3 px-4 font-black">
                        <span className={tx.type === 'Masuk' ? 'text-emerald-700' : 'text-rose-700'}>
                          {tx.type === 'Masuk' ? '+' : '-'} {rupiah(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Hapus transaksi mutasi kas ini?')) {
                              onDeleteCashTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Kategori Beban</th>
                  <th className="py-3.5 px-4">Rincian Beban</th>
                  <th className="py-3.5 px-4">Nominal</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada beban operasional tercatat.
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-slate-500 font-medium">{e.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{e.category}</td>
                      <td className="py-3 px-4 text-slate-600">{e.description}</td>
                      <td className="py-3 px-4 font-black text-rose-700">{rupiah(e.amount)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Hapus pos beban operasional ini?')) {
                              onDeleteExpense(e.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash Modal */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-black text-slate-900 mb-4">Catat Mutasi Kas</h2>
            <form onSubmit={handleCashSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={cashDate}
                    onChange={(e) => setCashDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Arah Kas</label>
                  <select
                    value={cashType}
                    onChange={(e) => setCashType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Masuk">Kas Masuk (+)</option>
                    <option value="Keluar">Kas Keluar (-)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori</label>
                <input
                  type="text"
                  required
                  value={cashCategory}
                  onChange={(e) => setCashCategory(e.target.value)}
                  placeholder="Contoh: Pelunasan Katering / Belanja Pasar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Keterangan Transaksi</label>
                <input
                  type="text"
                  required
                  value={cashDesc}
                  onChange={(e) => setCashDesc(e.target.value)}
                  placeholder="Keterangan singkat..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCashModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#087443] hover:bg-[#065e36] text-white"
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-black text-slate-900 mb-4">Catat Beban Operasional</h2>
            <form onSubmit={handleExpenseSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori Beban</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Operasional Armada">Operasional Armada (BBM/Tol)</option>
                    <option value="Kemasan & Sanitasi">Kemasan & Sanitasi</option>
                    <option value="Listrik, Gas & Air">Listrik, Gas & Air</option>
                    <option value="Gaji & Uang Lembur">Gaji & Uang Lembur</option>
                    <option value="Lain-lain">Beban Lain-lain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rincian Pengeluaran</label>
                <input
                  type="text"
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="Contoh: Isi bensin armada katering pengantaran Cikokol"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nominal Biaya (Rp)</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#087443] hover:bg-[#065e36] text-white"
                >
                  Simpan Beban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
