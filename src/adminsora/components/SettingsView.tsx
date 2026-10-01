import React, { useState } from 'react';
import {
  Settings,
  Building2,
  ShieldCheck,
  KeyRound,
  Database,
  CloudUpload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Download,
  Upload,
} from 'lucide-react';
import { CompanyProfile, UserCredentials } from '../types';
import { SyncStatus } from '../firebase';

interface SettingsViewProps {
  profile: CompanyProfile;
  onUpdateProfile: (prof: CompanyProfile) => void;
  onExportFullBackup: () => void;
  onImportFullBackup: (jsonString: string) => void;
  onResetFactory: () => void;
  onClearAllDummyData: () => void;
  syncStatus: SyncStatus;
  onSyncAllToCloud: () => Promise<void>;
  credentials: UserCredentials;
  onUpdateCredentials: (creds: UserCredentials) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onExportFullBackup,
  onImportFullBackup,
  onResetFactory,
  onClearAllDummyData,
  syncStatus,
  onSyncAllToCloud,
  credentials,
  onUpdateCredentials,
  onLogout,
}) => {
  const [name, setName] = useState(profile.name || 'PT. ASASORA BIO HEALTHORA');
  const [halalSupervisor, setHalalSupervisor] = useState(profile.halalSupervisor || 'Dina Fatrian');
  const [halalReg, setHalalReg] = useState(profile.halalReg || 'ID36110081134110926');
  const [phone, setPhone] = useState(profile.phone || '0852-7100-0900');
  const [email, setEmail] = useState(profile.email || 'healthoraplus@gmail.com');
  const [address, setAddress] = useState(profile.address || '');

  // Password state
  const [username, setUsername] = useState(credentials.username || 'admin');
  const [password, setPassword] = useState(credentials.password || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      halalSupervisor,
      halalReg,
      phone,
      email,
      address,
    });
    setStatusMsg('Profil perusahaan & legalitas Halal berhasil disimpan!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCredentials({
      ...credentials,
      username,
      password,
    });
    setStatusMsg('Akun login administrator berhasil diperbarui!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncAllToCloud();
      setStatusMsg('Seluruh data berhasil disinkronkan ke Cloud Firestore!');
    } catch {
      setStatusMsg('Gagal menyinkronkan data.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onImportFullBackup(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#087443]" />
          <span>Pengaturan Sistem & Database MinSora ERP</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi identitas PT. Asasora Bio Healthora, akun login admin, pencadangan data, dan sinkronisasi cloud.
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company & Halal Info Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Profil Perusahaan & Sertifikasi Halal</span>
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Perusahaan PT</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Penyelia Halal Resmi</label>
                <input
                  type="text"
                  value={halalSupervisor}
                  onChange={(e) => setHalalSupervisor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">No. Registrasi Halal</label>
                <input
                  type="text"
                  value={halalReg}
                  onChange={(e) => setHalalReg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Alamat Dapur & Operasional</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#087443] hover:bg-[#065e36] text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-950/20 cursor-pointer"
              >
                Simpan Profil Perusahaan
              </button>
            </div>
          </form>
        </div>

        {/* Security & Credentials Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Kredensial Login Administrator</span>
          </h2>

          <form onSubmit={handleSaveCredentials} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Username Admin</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Perbarui Kata Sandi
              </button>
            </div>
          </form>

          {/* Cloud Synchronization Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
              <CloudUpload className="w-4 h-4 text-emerald-600" />
              <span>Sinkronisasi Cloud Firestore</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Status koneksi saat ini: <strong className="text-emerald-700">{syncStatus}</strong>. Tekan tombol untuk mendorong seluruh data lokal ke cloud.
            </p>
            <button
              onClick={handleCloudSync}
              disabled={isSyncing}
              className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition cursor-pointer"
            >
              {isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Semua Data ke Cloud'}
            </button>
          </div>
        </div>
      </div>

      {/* Backup, Restore & Danger Zone */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Cadangan (Backup), Pemulihan (Restore) & Pengosongan Data</span>
        </h2>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onExportFullBackup}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Unduh Backup Lengkap (JSON)</span>
          </button>

          <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Pulihkan dari File Backup (JSON)</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          <button
            onClick={onResetFactory}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset ke Data Awal Pabrik</span>
          </button>

          <button
            onClick={onClearAllDummyData}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Kosongkan Seluruh Data Dummy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
