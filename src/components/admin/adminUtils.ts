import React from 'react';
import {
  uploadToCloudinary,
  getSavedCloudConfig,
  CloudStorageConfig,
  isCloudinaryUrl,
} from '../../utils/cloudStorage';

export interface FileUploadOptions {
  onLoading?: (isLoading: boolean) => void;
  onError?: (errorMessage: string) => void;
  onSuccess?: (info: { url: string; isCloud: boolean }) => void;
  cloudConfig?: Partial<CloudStorageConfig>;
}

/**
 * Handles image file upload from <input type="file"> directly to Cloudinary CDN
 */
export async function handleFileUpload(
  e: React.ChangeEvent<HTMLInputElement>,
  callback: (url: string) => void,
  options?: FileUploadOptions
) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (options?.onLoading) options.onLoading(true);

  try {
    const config = options?.cloudConfig || getSavedCloudConfig();
    const result = await uploadToCloudinary(file, config);

    if (result.success && result.url) {
      callback(result.url);
      if (options?.onSuccess) {
        options.onSuccess({
          url: result.url,
          isCloud: isCloudinaryUrl(result.url),
        });
      }
    } else {
      if (options?.onError) {
        options.onError(result.error || 'Gagal mengunggah foto ke Cloudinary.');
      }
    }
  } catch (err: any) {
    console.error('Upload handler error:', err);
    if (options?.onError) {
      options.onError(err.message || 'Terjadi kesalahan saat mengunggah foto ke Cloudinary.');
    }
  } finally {
    if (options?.onLoading) options.onLoading(false);
    // Reset file input value so user can re-upload same file if needed
    try {
      e.target.value = '';
    } catch (err) {
      // Ignore
    }
  }
}
