import React, { useState, useEffect } from 'react';
import {
  CloudStorageConfig,
  getSavedCloudConfig,
  saveCloudConfig,
  testCloudinaryConnection,
  DEFAULT_CLOUDINARY_CONFIG,
  uploadToCloudinary,
} from '../../utils/cloudStorage';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  Key,
  Folder,
  Zap,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Upload,
  Info,
  ShieldCheck,
  Check,
  Image as ImageIcon,
} from 'lucide-react';

interface CloudinaryTabProps {
  onNotify?: (msg: string) => void;
}

export const CloudinaryTab: React.FC<CloudinaryTabProps> = ({ onNotify }) => {
  const [config, setConfig] = useState<CloudStorageConfig>(getSavedCloudConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    url?: string;
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Manual test image upload
  const [testUploadLoading, setTestUploadLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  useEffect(() => {
    setConfig(getSavedCloudConfig());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCloudConfig(config);
    setSavedSuccess(true);
    if (onNotify) {
      onNotify('✅ Pengaturan akun Cloudinary berhasil disimpan!');
    }
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testCloudinaryConnection(config);
      setTestResult(result);
      if (result.success) {
        saveCloudConfig(config);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Terjadi kesalahan saat menguji koneksi.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTestUploadLoading(true);
    setUploadedUrl(null);
    try {
      const result = await uploadToCloudinary(file, config);
      if (result.success && result.url) {
        setUploadedUrl(result.url);
        setTestResult({
          success: true,
          message: `Berhasil mengunggah gambar "${file.name}" ke Cloudinary CDN!`,
          url: result.url,
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Gagal mengunggah file ke Cloudinary.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Gagal mengunggah file ke Cloudinary.',
      });
    } finally {
      setTestUploadLoading(false);
      try {
        e.target.value = '';
      } catch (err) {}
    }
  };

  const handleResetDefault = () => {
    setConfig(DEFAULT_CLOUDINARY_CONFIG);
    saveCloudConfig(DEFAULT_CLOUDINARY_CONFIG);
    setSavedSuccess(true);
    setTestResult(null);
    setShowResetConfirm(false);
    if (onNotify) {
      onNotify('🔄 Pengaturan Cloudinary dikembalikan ke default!');
    }
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6" id="cloudinary-settings-tab">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-500" />
            <span>Penyimpanan Gambar Cloudinary (CDN Cloud Storage)</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Semua gambar produk katalog, foto layanan, logo, galeri, dan dokumen legalitas langsung diunggah &amp; disimpan ke akun Cloudinary secara otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl font-bold transition cursor-pointer"
          >
            Reset Default
          </button>
        </div>
      </div>

      {/* Custom Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <Cloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-base">
                  Kembalikan Konfigurasi Cloudinary?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Kembalikan konfigurasi cloud name, preset upload, dan folder ke setelan awal default Asasora.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ya, Reset Default</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3.5 bg-green-50 border border-green-300 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>Pengaturan Cloudinary berhasil disimpan dan langsung aktif untuk seluruh formulir upload!</span>
        </div>
      )}

      {/* Cloudinary Status Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50/40 to-emerald-50 p-4 rounded-2xl border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-sky-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="font-extrabold text-sm text-sky-950">
                Status Integrasi CDN Cloudinary
              </h5>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Aktif &amp; Terintegrasi
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Cloud Name Aktif:{' '}
              <span className="font-mono font-bold text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-200">
                {config.cloudName || '(Belum diatur)'}
              </span>{' '}
              | Preset:{' '}
              <span className="font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                {config.uploadPreset || '(Belum diatur)'}
              </span>
            </p>
          </div>
        </div>

        <a
          href="https://console.cloudinary.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-white hover:bg-sky-50 text-sky-700 hover:text-sky-900 border border-sky-300 text-xs font-bold px-3.5 py-2 rounded-xl transition shrink-0 shadow-2xs cursor-pointer"
        >
          <span>Buka Console Cloudinary</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h5 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-[#2E6F40]" />
            <span>Kredensial &amp; Konfigurasi Akun Cloudinary</span>
          </h5>
          <span className="text-[11px] text-gray-400">
            Menggunakan Direct Unsigned Upload (Aman &amp; Tanpa Rahasia API Secret)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Cloud Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={config.cloudName}
              onChange={(e) => setConfig({ ...config, cloudName: e.target.value.trim() })}
              placeholder="Contoh: dmx8i2p7y atau akun_anda"
              className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-mono font-bold text-[#2E6F40] focus:ring-2 focus:ring-[#2E6F40] outline-none"
            />
            <span className="text-[10px] text-gray-400 block mt-1">
              Ditemukan di Dashboard Cloudinary Anda
            </span>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Upload Preset (Unsigned) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={config.uploadPreset}
              onChange={(e) => setConfig({ ...config, uploadPreset: e.target.value.trim() })}
              placeholder="Contoh: asasora_unsigned atau ml_default"
              className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-mono font-bold text-[#2E6F40] focus:ring-2 focus:ring-[#2E6F40] outline-none"
            />
            <span className="text-[10px] text-gray-400 block mt-1">
              Settings &gt; Upload &gt; Upload presets &gt; Signing Mode: Unsigned
            </span>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Target Folder di Cloudinary
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.folder}
                onChange={(e) => setConfig({ ...config, folder: e.target.value.trim() })}
                placeholder="asasora_media"
                className="w-full p-2.5 pl-8 bg-white rounded-xl border border-gray-300 font-mono focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
              <Folder className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
            </div>
            <span className="text-[10px] text-gray-400 block mt-1">
              Folder tempat gambar dikelompokkan
            </span>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200 cursor-pointer transition">
            <input
              type="checkbox"
              checked={config.autoOptimize}
              onChange={(e) => setConfig({ ...config, autoOptimize: e.target.checked })}
              className="w-4 h-4 text-[#2E6F40] rounded focus:ring-green-500"
            />
            <div>
              <div className="font-bold text-gray-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Auto-Optimization &amp; WebP / AVIF CDN (Disarankan)</span>
              </div>
              <span className="text-[11px] text-gray-500">
                Otomatis mengompresi gambar dengan kualitas tinggi dan format modern agar website terbuka super cepat.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200 cursor-pointer transition">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="w-4 h-4 text-[#2E6F40] rounded focus:ring-green-500"
            />
            <div>
              <div className="font-bold text-gray-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Aktifkan Penyimpanan Cloud (Cloudinary Storage)</span>
              </div>
              <span className="text-[11px] text-gray-500">
                Bila dinonaktifkan, upload akan disimpan sebagai data lokal di browser.
              </span>
            </div>
          </label>
        </div>

        {/* Action Buttons & Testing */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isTesting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
              ) : (
                <Sparkles className="w-4 h-4 text-sky-600" />
              )}
              <span>{isTesting ? 'Menguji Koneksi...' : 'Tes Koneksi Cloudinary'}</span>
            </button>

            <label className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer active:scale-95">
              {testUploadLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              ) : (
                <Upload className="w-4 h-4 text-indigo-600" />
              )}
              <span>{testUploadLoading ? 'Mengunggah...' : 'Tes Upload Foto'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={testUploadLoading}
                onChange={handleManualTestUpload}
              />
            </label>
          </div>

          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleSave(e);
            }}
            className="px-6 py-2.5 bg-[#2E6F40] hover:bg-green-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 text-[#F3C623]" />
            <span>Simpan Pengaturan Cloudinary</span>
          </button>
        </div>
      </form>

      {/* Test Result Message Box */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
            testResult.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{testResult.success ? 'Koneksi Berhasil!' : 'Peringatan Koneksi'}</span>
          </div>
          <p className="leading-relaxed">{testResult.message}</p>
          {testResult.url && (
            <div className="pt-2 border-t border-emerald-200 flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono text-[11px] bg-white px-2 py-1 rounded border border-emerald-200 truncate max-w-md">
                {testResult.url}
              </span>
              <a
                href={testResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-900 font-bold underline inline-flex items-center gap-1"
              >
                <span>Lihat Gambar di CDN</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* How-To Guide */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 text-xs text-gray-600">
        <h6 className="font-black text-gray-800 flex items-center gap-2 text-xs uppercase tracking-wider">
          <Info className="w-4 h-4 text-[#2E6F40]" />
          <span>Panduan Singkat Menghubungkan Akun Cloudinary Anda:</span>
        </h6>
        <ol className="list-decimal list-inside space-y-2 leading-relaxed">
          <li>
            Buka website resmi <strong>cloudinary.com</strong> dan masuk ke akun Anda.
          </li>
          <li>
            Salin <strong>Cloud name</strong> yang tertera di halaman <em>Dashboard / Home Console</em>.
          </li>
          <li>
            Buka menu <strong>Settings</strong> (ikon gerigi) &gt; tab <strong>Upload</strong> &gt; gulir ke bagian <strong>Upload presets</strong>.
          </li>
          <li>
            Klik <strong>Add upload preset</strong>, atur <strong>Signing Mode</strong> menjadi <strong>Unsigned</strong>, lalu beri nama preset (misal: <code className="bg-white px-1.5 py-0.5 rounded border border-gray-300 font-bold text-gray-800">asasora_unsigned</code>).
          </li>
          <li>
            Masukkan <em>Cloud Name</em> dan <em>Upload Preset</em> ke kolom di atas, lalu klik <strong>Simpan Pengaturan Cloudinary</strong>.
          </li>
        </ol>
      </div>
    </div>
  );
};
