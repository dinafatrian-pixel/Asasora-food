import React, { useState } from 'react';
import { Upload, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Ingredient } from '../types';
import { NavPage } from './Sidebar';

interface IngredientImportViewProps {
  ingredients: Ingredient[];
  onImportIngredients: (imported: Ingredient[], mode?: 'replace' | 'append') => void;
  onNavigate: (page: NavPage) => void;
}

export const IngredientImportView: React.FC<IngredientImportViewProps> = ({
  onImportIngredients,
  onNavigate,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [mode, setMode] = useState<'replace' | 'append'>('append');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleImport = () => {
    setMessage(null);
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Data harus berupa format JSON Array bahan.');
      }
      onImportIngredients(parsed, mode);
      setMessage({ text: `Berhasil mengimpor ${parsed.length} bahan baku!`, type: 'success' });
      setTimeout(() => onNavigate('ingredients'), 1200);
    } catch (err: any) {
      setMessage({ text: err.message || 'Gagal memproses JSON.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('ingredients')}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">Import Bahan Baku Halal</h1>
          <p className="text-xs text-slate-500">Impor master bahan baku dan sertifikat halal secara massal.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Mode Import</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="append"
                checked={mode === 'append'}
                onChange={() => setMode('append')}
                className="text-[#087443] focus:ring-[#087443]"
              />
              <span>Gabungkan (Append / Update yang ada)</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={mode === 'replace'}
                onChange={() => setMode('replace')}
                className="text-[#087443] focus:ring-[#087443]"
              />
              <span>Ganti Total (Replace All)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Tempel Data JSON Bahan Baku</label>
          <textarea
            rows={10}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={`[\n  {\n    "id": 1,\n    "name": "Beras Premium",\n    "brand": "Ramos Super",\n    "producer": "PT. Pangan Nusantara",\n    "stock": 100,\n    "unit": "Kg",\n    "cert": "ID0011000012345",\n    "valid": "2027-12-31",\n    "status": "Aman"\n  }\n]`}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087443]"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => onNavigate('ingredients')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Kembali
          </button>
          <button
            onClick={handleImport}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#087443] hover:bg-[#065e36] text-white transition flex items-center gap-2 shadow-md shadow-emerald-950/20"
          >
            <Upload className="w-4 h-4" />
            <span>Proses Import Bahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
