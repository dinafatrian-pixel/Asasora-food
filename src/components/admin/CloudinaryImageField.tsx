import React, { useState, useRef, useEffect } from 'react';
import {
  Cloud,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Loader2,
  Settings,
  X,
  Check,
  Zap,
} from 'lucide-react';
import {
  uploadToCloudinary,
  getSavedCloudConfig,
  saveCloudConfig,
  isCloudinaryUrl,
  isCloudinaryConfigured,
  testCloudinaryConnection,
  CloudStorageConfig,
} from '../../utils/cloudStorage';

interface CloudinaryImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  description?: string;
  placeholder?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  required?: boolean;
  onNotify?: (msg: string) => void;
  id?: string;
}

export const CloudinaryImageField: React.FC<CloudinaryImageFieldProps> = ({
  label,
  value,
  onChange,
  description,
  placeholder = 'https://res.cloudinary.com/... atau pilih file gambar',
  aspectRatio = 'auto',
  required = false,
  onNotify,
  id,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cloudinary Config State
  const [cloudConfig, setCloudConfig] = useState<CloudStorageConfig>(getSavedCloudConfig());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setCloudConfig(getSavedCloudConfig());
  }, []);

  const hasCloudinary = isCloudinaryConfigured(cloudConfig);
  const isCloud = isCloudinaryUrl(value);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/') && !file.name.endsWith('.pdf')) {
      setErrorMsg('Format file harus berupa gambar (JPG, PNG, WebP, SVG) atau PDF.');
      return;
    }

    // Size limit check (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal adalah 15MB.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadProgress(
      `Memproses "${file.name}"...`
    );

    try {
      const currentConfig = getSavedCloudConfig();
      const result = await uploadToCloudinary(file, currentConfig, true);

      if (result.success && result.url) {
        onChange(result.url);
        if (result.isLocalFallback) {
          setSuccessMsg(`Foto berhasil dimuat & siap disimpan (Mode Cadangan Data Gambar).`);
          if (onNotify) {
            onNotify(`📸 Foto "${file.name}" siap disimpan!`);
          }
        } else {
          setSuccessMsg(`Foto berhasil diunggah ke Cloudinary CDN (${cloudConfig.cloudName}).`);
          if (onNotify) {
            onNotify(`☁️ Foto "${file.name}" berhasil diunggah ke Cloudinary!`);
          }
        }
        setTimeout(() => setSuccessMsg(null), 4500);
      } else {
        const error = result.error || 'Gagal memproses foto.';
        setErrorMsg(error);
        if (onNotify) {
          onNotify(`⚠️ Peringatan foto: ${error}`);
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Terjadi kesalahan saat memproses gambar.';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClear = () => {
    onChange('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSaveQuickSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveCloudConfig(cloudConfig);
    if (onNotify) {
      onNotify('✅ Konfigurasi Cloudinary berhasil disimpan!');
    }
    setShowQuickSettings(false);
    setErrorMsg(null);
  };

  const handleTestQuickConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testCloudinaryConnection(cloudConfig);
      setTestResult(res);
      if (res.success) {
        saveCloudConfig(cloudConfig);
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Gagal terhubung.' });
    } finally {
      setTestingConnection(false);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'w-24 h-24 sm:w-28 sm:h-28';
      case 'video':
        return 'w-36 h-24 sm:w-44 sm:h-28';
      case 'wide':
        return 'w-48 h-20 sm:w-56 sm:h-24';
      default:
        return 'w-24 h-24 sm:w-28 sm:h-28';
    }
  };

  return (
    <div className="space-y-2.5" id={id}>
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="block text-xs font-extrabold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <div className="flex items-center gap-2">
          {isCloud ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-300">
              <Cloud className="w-3 h-3 text-sky-500" />
              <span>Tersimpan di Cloudinary ({cloudConfig.cloudName || 'CDN'})</span>
            </span>
          ) : value?.startsWith('data:') ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Foto Dimuat &amp; Siap Disimpan</span>
            </span>
          ) : value ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
              <ImageIcon className="w-3 h-3 text-amber-500" />
              <span>URL Gambar</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
              Penyimpanan: <strong>{cloudConfig.cloudName ? `Cloudinary (${cloudConfig.cloudName})` : 'Otomatis'}</strong>
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            className="text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 p-1 px-2 rounded-lg border border-sky-200 flex items-center gap-1 transition cursor-pointer"
            title="Atur Akun Cloudinary"
          >
            <Settings className="w-3 h-3 text-sky-600" />
            <span>Akun Cloudinary</span>
          </button>
        </div>
      </div>

      {description && <p className="text-[11px] text-gray-500">{description}</p>}

      {/* Quick Settings Drawer */}
      {showQuickSettings && (
        <form
          onSubmit={handleSaveQuickSettings}
          className="p-3.5 bg-sky-50/80 border-2 border-sky-300 rounded-2xl space-y-3 text-xs shadow-sm animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-sky-200 pb-1.5">
            <span className="font-extrabold text-sky-950 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-sky-600" />
              <span>Pengaturan Akun Cloudinary</span>
            </span>
            <button
              type="button"
              onClick={() => setShowQuickSettings(false)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-gray-700 mb-0.5">
                Cloud Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={cloudConfig.cloudName}
                onChange={(e) =>
                  setCloudConfig({ ...cloudConfig, cloudName: e.target.value.trim() })
                }
                placeholder="Contoh: dmx8i2p7y"
                className="w-full p-2 bg-white rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-0.5">
                Upload Preset (Unsigned) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={cloudConfig.uploadPreset}
                onChange={(e) =>
                  setCloudConfig({ ...cloudConfig, uploadPreset: e.target.value.trim() })
                }
                placeholder="Contoh: asasora_unsigned"
                className="w-full p-2 bg-white rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
            <button
              type="button"
              disabled={testingConnection}
              onClick={handleTestQuickConnection}
              className="px-3 py-1.5 bg-white hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {testingConnection ? (
                <RefreshCw className="w-3 h-3 animate-spin text-sky-600" />
              ) : (
                <Zap className="w-3 h-3 text-amber-500" />
              )}
              <span>{testingConnection ? 'Menguji...' : 'Tes Koneksi'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowQuickSettings(false)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#2E6F40] hover:bg-green-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Check className="w-3 h-3 text-[#F3C623]" />
                <span>Simpan Akun Cloudinary</span>
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-2.5 rounded-xl border text-[11px] font-bold ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              {testResult.message}
            </div>
          )}
        </form>
      )}

      {/* Upload Zone & Preview Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        {/* Left: Image Preview */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-2.5 bg-gray-50 rounded-2xl border border-gray-200 relative group overflow-hidden">
          {value ? (
            <div className="relative flex items-center justify-center w-full min-h-[100px] bg-white rounded-xl overflow-hidden border border-gray-100 p-1">
              <img
                src={value}
                alt={label}
                referrerPolicy="no-referrer"
                className={`${getAspectClass()} object-contain rounded-lg transition-transform duration-300 group-hover:scale-105`}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1 rounded-xl">
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/95 hover:bg-white text-gray-800 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition"
                  title="Buka Gambar Asli di CDN"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Lihat</span>
                </a>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                  title="Hapus Gambar"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <ImageIcon className="w-8 h-8 stroke-1 text-gray-300 mb-1" />
              <span className="text-[10px] font-semibold text-gray-400">Belum ada foto</span>
            </div>
          )}
        </div>

        {/* Right: Upload Actions & URL Input */}
        <div className="md:col-span-8 space-y-2">
          {/* Drag & Drop / File Selector Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-3 sm:p-4 text-center transition-all ${
              isDragOver
                ? 'border-sky-500 bg-sky-50/70 scale-99'
                : 'border-gray-300 bg-white hover:border-[#2E6F40] hover:bg-emerald-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={onInputChange}
              className="hidden"
              id={`file-input-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
            />

            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
                <div className="text-xs font-bold text-sky-800">
                  {uploadProgress || 'Mengunggah ke Cloudinary CDN...'}
                </div>
                <div className="w-36 h-1.5 bg-sky-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2.5 bg-sky-100 text-sky-700 rounded-xl shrink-0">
                    <Cloud className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      <span>Unggah Foto ke Akun Cloudinary</span>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Otomatis tersimpan permanen di CDN Cloudinary (JPG, PNG, WebP)
                    </p>
                  </div>
                </div>

                <label
                  htmlFor={`file-input-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                  className="bg-gradient-to-r from-[#2E6F40] to-emerald-700 hover:from-emerald-800 hover:to-[#2E6F40] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-[#F3C623]" />
                  <span>Pilih &amp; Upload Foto</span>
                </label>
              </div>
            )}
          </div>

          {/* Direct URL Input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full text-xs p-2.5 pl-8 bg-gray-50 hover:bg-white focus:bg-white rounded-xl border border-gray-300 font-mono text-gray-700 focus:ring-2 focus:ring-[#2E6F40] focus:border-[#2E6F40] outline-none transition"
              />
              <ImageIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2.5 text-gray-400 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-xl transition cursor-pointer"
                title="Hapus URL"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Success Message */}
          {successMsg && (
            <div className="flex items-center gap-1.5 p-2.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message with Quick Setup Link */}
          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-800 text-[11px] font-semibold rounded-xl border border-red-200 space-y-1.5 animate-in fade-in">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">{errorMsg}</div>
              </div>

              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowQuickSettings(true)}
                  className="text-xs text-red-700 underline font-bold hover:text-red-900 cursor-pointer"
                >
                  Buka Pengaturan Akun Cloudinary
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
