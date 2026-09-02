/**
 * PT. ASASORA BIO HEALTHORA - Security & Input Sanitization Utilities
 * Code Hardening for XSS Prevention, Phone Number Normalization, & Data Cleansing
 */

/**
 * Strips HTML tags, event handlers, javascript: pseudo-protocols, and dangerous characters to prevent XSS.
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input) return '';
  
  return input
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip HTML tags like <script>, <img onerror=>, <iframe>, etc.
    .replace(/<[^>]*>?/gm, '')
    // Strip javascript: or data: pseudo-protocols
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    // Strip dangerous inline event handlers like onerror=, onload=, onclick=
    .replace(/on\w+\s*=/gi, '')
    // Normalize excessive consecutive spaces
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Escapes characters for safe HTML display if rendered inside raw templates
 */
export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates and normalizes phone number:
 * - Must only accept numerical digits
 * - Minimum 9 digits, Maximum 15 digits
 * - Handles Indonesian country code prefixes (+62, 62, 08)
 */
export function sanitizePhoneNumber(input: string | undefined | null): string {
  if (!input) return '';
  // Remove all non-digit characters except optional leading '+'
  let cleaned = input.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  // Remove any non-digits remaining
  return cleaned.replace(/\D/g, '');
}

export interface PhoneValidationResult {
  isValid: boolean;
  cleanNumber: string;
  formattedForWa: string;
  errorMessage?: string;
}

export function validatePhoneNumber(phone: string, lang: 'id' | 'en' = 'id'): PhoneValidationResult {
  const cleanDigits = sanitizePhoneNumber(phone);

  if (!cleanDigits) {
    return {
      isValid: false,
      cleanNumber: '',
      formattedForWa: '',
      errorMessage:
        lang === 'en'
          ? 'Phone number is required.'
          : 'Nomor telepon/WhatsApp wajib diisi.',
    };
  }

  // Check minimum 9 digits and maximum 15 digits
  if (cleanDigits.length < 9) {
    return {
      isValid: false,
      cleanNumber: cleanDigits,
      formattedForWa: '',
      errorMessage:
        lang === 'en'
          ? `Phone number must be at least 9 digits (current: ${cleanDigits.length} digits).`
          : `Nomor telepon minimal harus 9 digit angka (saat ini: ${cleanDigits.length} digit).`,
    };
  }

  if (cleanDigits.length > 15) {
    return {
      isValid: false,
      cleanNumber: cleanDigits,
      formattedForWa: '',
      errorMessage:
        lang === 'en'
          ? `Phone number cannot exceed 15 digits (current: ${cleanDigits.length} digits).`
          : `Nomor telepon maksimal 15 digit angka (saat ini: ${cleanDigits.length} digit).`,
    };
  }

  // Format cleanly for WhatsApp (628...)
  let waNumber = cleanDigits;
  if (waNumber.startsWith('0')) {
    waNumber = '62' + waNumber.substring(1);
  } else if (!waNumber.startsWith('62')) {
    waNumber = '62' + waNumber;
  }

  return {
    isValid: true,
    cleanNumber: cleanDigits,
    formattedForWa: waNumber,
  };
}

/**
 * Validates and sanitizes email address
 */
export function sanitizeEmail(email: string | undefined | null): { email: string; isValid: boolean } {
  if (!email) return { email: '', isValid: true }; // optional
  const sanitized = sanitizeString(email).toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(sanitized);
  return { email: sanitized, isValid };
}

/**
 * Sanitizes multi-line delivery address safely
 */
export function sanitizeAddress(address: string | undefined | null): string {
  if (!address) return '';
  return address
    .replace(/<[^>]*>?/gm, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}
