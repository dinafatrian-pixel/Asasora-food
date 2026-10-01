import React, { useState } from 'react';
import {
  FileCheck2,
  Download,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Activity, AuditRecord } from '../types';

interface AuditViewProps {
  activities: Activity[];
  audits: AuditRecord[];
  onSaveAudit: (record: Omit<AuditRecord, 'id'>) => void;
  onExportCSV: (type: string) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({
  activities,
  audits,
  onSaveAudit,
  onExportCSV,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [auditor, setAuditor] = useState('Dina Fatrian (Penyelia Halal)');
  const [unit, setUnit] = useState('Dapur Utama Tangerang');
  const [scope, setScope] = useState('Komitmen, Bahan, Proses, Produk & Pemantauan (60 Butir SJPH)');
  const [totalChecked, setTotalChecked] = useState<number>(60);
  const [passed, setPassed] = useState<number>(60);
  const [conclusion, setConclusion] = useState('Sangat Memenuhi (A-Grade)');
  const [notes, setNotes] = useState('Seluruh kriteria pemantauan bahan baku dan sanitasi dapur terpenuhi.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAudit({
      date: new Date().toISOString().slice(0, 10),
      auditor,
      unit,
      scope,
      totalChecked,
      passed,
      failed: Math.max(0, totalChecked - passed),
      conclusion,
      notes,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#087443]" />
            <span>Audit Internal SJPH BPJPH & Ekspor Laporan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluasi berkala 60 butir checklist Sistem Jaminan Produk Halal dan pengunduhan laporan operasional.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#087443] hover:bg-[#065e36] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Hasil Audit Internal</span>
          </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-6">
        <h2 className="text-sm font-black text-emerald-950 mb-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Unduh Laporan Operasional Katering (CSV / Excel)</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onExportCSV('productions')}
            className="px-4 py-2.5 bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl transition border border-emerald-200 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Unduh Laporan Batch Produksi</span>
          </button>
          <button
            onClick={() => onExportCSV('sales')}
            className="px-4 py-2.5 bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl transition border border-emerald-200 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Unduh Laporan Penjualan</span>
          </button>
          <button
            onClick={() => onExportCSV('ingredients')}
            className="px-4 py-2.5 bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl transition border border-emerald-200 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Unduh Master Bahan Baku Halal</span>
          </button>
        </div>
      </div>

      {/* Audit History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">Riwayat Audit Internal Halal SJPH</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Penyelia / Auditor</th>
                <th className="py-3 px-4">Unit Operasional</th>
                <th className="py-3 px-4">Butir Sesuai</th>
                <th className="py-3 px-4">Kesimpulan Hasil</th>
                <th className="py-3 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Belum ada riwayat audit internal.
                  </td>
                </tr>
              ) : (
                audits.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-800">{a.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{a.auditor}</td>
                    <td className="py-3 px-4 text-slate-600">{a.unit}</td>
                    <td className="py-3 px-4 font-black text-emerald-700">
                      {a.passed} / {a.totalChecked} Butir
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{a.conclusion}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{a.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Audit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-slate-900 mb-4">Catat Hasil Evaluasi Audit Internal SJPH</h2>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Auditor / Penyelia Halal</label>
                <input
                  type="text"
                  required
                  value={auditor}
                  onChange={(e) => setAuditor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit Pengolahan / Dapur</label>
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Butir Evaluasi</label>
                  <input
                    type="number"
                    required
                    value={totalChecked}
                    onChange={(e) => setTotalChecked(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Jumlah Butir Lolos</label>
                  <input
                    type="number"
                    required
                    value={passed}
                    onChange={(e) => setPassed(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kesimpulan Hasil</label>
                <input
                  type="text"
                  required
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Catatan Tindak Lanjut</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#087443] hover:bg-[#065e36] text-white shadow-md shadow-emerald-900/20"
                >
                  Simpan Catatan Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
