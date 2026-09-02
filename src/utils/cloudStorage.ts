export interface CloudStorageConfig {
  provider: 'cloudinary' | 'custom';
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
  folder: string;
  autoOptimize: boolean;
  enabled: boolean;
}

export const DEFAULT_CLOUDINARY_CONFIG: CloudStorageConfig = {
  provider: 'cloudinary',
  cloudName: 'dmx8i2p7y',
  uploadPreset: 'asasora_unsigned',
  folder: 'asasora_media',
  autoOptimize: true,
  enabled: true,
};

const STORAGE_KEY = 'asasora_cloudinary_config';

/**
 * Retrieves saved Cloudinary configuration from localStorage
 */
export function getSavedCloudConfig(): CloudStorageConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CLOUDINARY_CONFIG, ...parsed };
    }
  } catch (e) {
    // Ignore parse error
  }
  return DEFAULT_CLOUDINARY_CONFIG;
}

/**
 * Saves Cloudinary configuration to localStorage
 */
export function saveCloudConfig(config: CloudStorageConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save cloud config', e);
  }
}

/**
 * Checks if a given URL is hosted on Cloudinary CDN
 */
export function isCloudinaryUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes('cloudinary.com') ||
    url.includes('res.cloudinary.com') ||
    url.startsWith('http://res.cloudinary.com') ||
    url.startsWith('https://res.cloudinary.com')
  );
}

/**
 * Checks if Cloudinary configuration has minimum required fields
 */
export function isCloudinaryConfigured(config?: CloudStorageConfig): boolean {
  const cfg = config || getSavedCloudConfig();
  return Boolean(
    cfg.enabled &&
      cfg.cloudName &&
      cfg.cloudName.trim().length > 0 &&
      cfg.uploadPreset &&
      cfg.uploadPreset.trim().length > 0
  );
}

export interface UploadResult {
  success: boolean;
  url: string;
  publicId?: string;
  error?: string;
  isLocalFallback?: boolean;
}

/**
 * Directly uploads a File, Blob, or Base64 Data URI to Cloudinary via REST API (Unsigned Upload)
 */
export async function uploadToCloudinary(
  fileOrBase64: File | Blob | string,
  customConfig?: Partial<CloudStorageConfig>
): Promise<UploadResult> {
  const config = { ...getSavedCloudConfig(), ...(customConfig || {}) };

  // If already a remote Cloudinary URL, return as-is
  if (typeof fileOrBase64 === 'string' && isCloudinaryUrl(fileOrBase64)) {
    return {
      success: true,
      url: fileOrBase64,
      isLocalFallback: false,
    };
  }

  // Validate Cloudinary configuration
  const cleanCloudName = (config.cloudName || '').trim();
  const cleanUploadPreset = (config.uploadPreset || '').trim();

  if (!config.enabled) {
    return {
      success: false,
      url: '',
      error: 'Penyimpanan Cloudinary sedang dinonaktifkan di pengaturan.',
      isLocalFallback: false,
    };
  }

  if (!cleanCloudName) {
    return {
      success: false,
      url: '',
      error: 'Cloud Name akun Cloudinary belum diisi. Silakan atur di Tab Cloudinary Media.',
      isLocalFallback: false,
    };
  }

  if (!cleanUploadPreset) {
    return {
      success: false,
      url: '',
      error: 'Upload Preset (Unsigned) belum diisi. Silakan atur Upload Preset di Tab Cloudinary Media.',
      isLocalFallback: false,
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', fileOrBase64);
    formData.append('upload_preset', cleanUploadPreset);

    if (config.folder && config.folder.trim()) {
      formData.append('folder', config.folder.trim());
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
      cleanCloudName
    )}/image/upload`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      let rawError = data.error?.message || `HTTP ${response.status}: Gagal mengunggah ke Cloudinary`;
      let userError = rawError;

      // Provide clear actionable Indonesian explanation for common Cloudinary errors
      if (rawError.toLowerCase().includes('upload preset must be specified') || rawError.toLowerCase().includes('preset not found')) {
        userError = `Upload Preset "${cleanUploadPreset}" tidak ditemukan di Cloudinary (${cleanCloudName}). Pastikan Anda sudah membuat Upload Preset bertipe "Unsigned" di Settings Cloudinary > Upload.`;
      } else if (rawError.toLowerCase().includes('invalid cloud_name') || rawError.toLowerCase().includes('cloud name')) {
        userError = `Cloud Name "${cleanCloudName}" tidak valid di Cloudinary. Silakan cek Cloud Name di Dashboard Cloudinary Anda.`;
      } else if (rawError.toLowerCase().includes('unsigned upload not enabled') || rawError.toLowerCase().includes('mode is signed')) {
        userError = `Preset "${cleanUploadPreset}" bertipe Signed. Ubah Signing Mode menjadi "Unsigned" di Settings Cloudinary Anda.`;
      }

      console.warn('Cloudinary upload error:', userError);

      return {
        success: false,
        url: '',
        error: userError,
        isLocalFallback: false,
      };
    }

    let finalUrl = data.secure_url;

    // Apply automatic responsive/format optimization if enabled
    if (config.autoOptimize && finalUrl.includes('/image/upload/')) {
      finalUrl = finalUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
    }

    return {
      success: true,
      url: finalUrl,
      publicId: data.public_id,
      isLocalFallback: false,
    };
  } catch (err: any) {
    const errorMsg =
      err.message || 'Koneksi jaringan ke Cloudinary terputus. Pastikan koneksi internet stabil.';
    console.error('Cloudinary network exception:', err);

    return {
      success: false,
      url: '',
      error: `Gagal mengunggah ke Cloudinary: ${errorMsg}`,
      isLocalFallback: false,
    };
  }
}

/**
 * Helper to convert File to Base64 Data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Tests connection with Cloudinary using a 1x1 transparent PNG pixel
 */
export async function testCloudinaryConnection(
  config: CloudStorageConfig
): Promise<{ success: boolean; url?: string; message: string }> {
  if (!config.cloudName || !config.cloudName.trim()) {
    return { success: false, message: 'Cloud Name tidak boleh kosong. Periksa di Dashboard Cloudinary.' };
  }
  if (!config.uploadPreset || !config.uploadPreset.trim()) {
    return { success: false, message: 'Upload Preset tidak boleh kosong. Buat Preset bertipe "Unsigned" di Settings > Upload.' };
  }

  // 1x1 transparent PNG data URI
  const testPixel =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const result = await uploadToCloudinary(testPixel, {
    ...config,
    folder: config.folder || 'asasora_test',
  });

  if (result.success && result.url && isCloudinaryUrl(result.url)) {
    return {
      success: true,
      url: result.url,
      message: `Koneksi akun Cloudinary (${config.cloudName}) berhasil! Gambar uji coba sukses diunggah ke CDN.`,
    };
  }

  return {
    success: false,
    message: result.error || 'Gagal terhubung ke Cloudinary. Periksa Cloud Name dan pastikan Upload Preset bertipe "Unsigned".',
  };
}
