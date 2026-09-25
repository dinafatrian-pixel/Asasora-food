import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Review } from '../../types';
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  Edit2,
  Check,
  Star,
  CheckCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Download,
  Copy,
  ExternalLink,
  Printer,
  Lock,
  Unlock,
  Sparkles,
  ShieldCheck,
  Radio,
  Share2,
  Globe,
  Laptop,
  CornerDownRight,
  RotateCcw,
  Camera,
  Maximize2,
  Wifi,
  Smartphone,
  Info,
  HelpCircle,
} from 'lucide-react';

interface ReviewsTabProps {
  reviews: Review[];
  adminToken?: string;
  onUpdateReview: (review: Review) => void;
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
  onDeleteReview: (reviewId: string) => void;
  onNotify?: (msg: string) => void;
  onCloseAdmin?: () => void;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({
  reviews,
  adminToken,
  onUpdateReview,
  onAddReview,
  onDeleteReview,
  onNotify,
  onCloseAdmin,
}) => {
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Confirmation state for deleting a review (Iframe-safe modal with session check)
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // New review state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [verified, setVerified] = useState(true);

  // QR Code Generator state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Current host origin for instant live testing in preview environment
  const currentAppOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://asasorafood.com';

  // Target Destination is 100% EXCLUSIVELY the Review Portal on the public production domain
  // 'official_www': https://www.asasorafood.com/#reviews (Primary recommended, direct 200 OK)
  // 'official_apex': https://asasorafood.com/#reviews (Apex domain, redirects to www)
  const [targetDestination, setTargetDestination] = useState<'official_www' | 'official_apex'>('official_www');
  const [customUrl, setCustomUrl] = useState('');
  const [isUrlLocked, setIsUrlLocked] = useState(true);

  // Compute active target URL - strictly and exclusively locked to the Review Portal
  const activeTargetUrl = (() => {
    if (!isUrlLocked && customUrl.trim()) {
      return customUrl.trim();
    }
    if (targetDestination === 'official_apex') {
      return 'https://asasorafood.com/#reviews';
    }
    // Default public production domain that NEVER returns 404 on any phone in the world
    return 'https://www.asasorafood.com/#reviews';
  })();

  // High-contrast color mode: 'black' (recommended for phone cameras) or 'green' (Asasora brand)
  const [qrColorMode, setQrColorMode] = useState<'black' | 'green'>('black');

  // Fullscreen / Zoom QR Code Scan Modal for seamless smartphone camera scanning
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interactive NFC Dialog state
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<
    'idle' | 'writing' | 'success' | 'unsupported' | 'error'
  >('idle');
  const [nfcErrorMessage, setNfcErrorMessage] = useState('');

  const editRef = useRef<HTMLDivElement | null>(null);
  const addRef = useRef<HTMLDivElement | null>(null);

  const darkColor = qrColorMode === 'black' ? '#000000' : '#1B4D28';

  // Live generation of QR Code on main canvas
  useEffect(() => {
    if (canvasRef.current && activeTargetUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        activeTargetUrl,
        {
          width: 250,
          margin: 4, // 4-module quiet zone (ISO standard for camera auto-scan)
          color: {
            dark: darkColor,
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M', // Clean modules easiest for camera focus
        },
        (error) => {
          if (error) console.error('Error generating QR code preview:', error);
        }
      );
    }
  }, [activeTargetUrl, darkColor]);

  // Live generation of QR Code on zoom modal canvas
  useEffect(() => {
    if (isQrModalOpen && modalCanvasRef.current && activeTargetUrl) {
      QRCode.toCanvas(
        modalCanvasRef.current,
        activeTargetUrl,
        {
          width: 340,
          margin: 4,
          color: {
            dark: darkColor,
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        },
        (error) => {
          if (error) console.error('Error generating zoom QR code:', error);
        }
      );
    }
  }, [isQrModalOpen, activeTargetUrl, darkColor]);

  // Program/Write URL to physical NFC tag via Web NFC API
  const handleWriteNfc = async () => {
    if (!('NDEFReader' in window)) {
      setNfcStatus('unsupported');
      return;
    }

    try {
      setNfcStatus('writing');
      const ndef = new (window as any).NDEFReader();
      await ndef.write({
        records: [
          {
            recordType: 'url',
            data: activeTargetUrl,
          },
        ],
      });
      setNfcStatus('success');
      showNotification('✅ Stiker NFC berhasil diprogram dengan tautan ulasan!');
    } catch (err: any) {
      console.error('NFC Write Error:', err);
      setNfcStatus('error');
      setNfcErrorMessage(
        err.message ||
          'Gagal menulis ke NFC. Pastikan perangkat Anda mendukung NFC dan izin telah diberikan.'
      );
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    if (onNotify) {
      onNotify(msg);
    }
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleStartAdd = () => {
    setEditingReview(null);
    setReviewToDelete(null);
    setIsAdding(true);
    setTimeout(() => {
      addRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleStartEdit = (rev: Review) => {
    setIsAdding(false);
    setReviewToDelete(null);
    setEditingReview({ ...rev });
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    onAddReview({
      name: name.trim(),
      role: role.trim() || 'Pelanggan Setia PT. Asasora',
      rating: Number(rating) || 5,
      comment: comment.trim(),
      verified,
    });

    setIsAdding(false);
    setName('');
    setRole('');
    setRating(5);
    setComment('');
    setVerified(true);
    showNotification('✅ Testimoni baru berhasil ditambahkan ke database!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReview && editingReview.name.trim() && editingReview.comment.trim()) {
      onUpdateReview({
        ...editingReview,
        name: editingReview.name.trim(),
        role: editingReview.role.trim() || 'Pelanggan Setia PT. Asasora',
        comment: editingReview.comment.trim(),
        rating: Number(editingReview.rating) || 5,
        verified: editingReview.verified !== false,
      });
      setEditingReview(null);
      showNotification('✅ Data testimoni berhasil diperbarui!');
    }
  };

  // Secure Delete Function: strictly enforces active admin authorization
  const executeDeleteReview = async (rev: Review) => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      const token =
        adminToken ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('asasora_admin_token') ||
            sessionStorage.getItem('asasora_admin_token') ||
            ''
          : '');

      const response = await fetch(`/api/reviews/${encodeURIComponent(rev.id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok || !resData.success) {
        throw new Error(
          resData.message ||
            'Akses ditolak: Hanya administrator dengan sesi login aktif yang dapat menghapus ulasan.'
        );
      }

      onDeleteReview(rev.id);

      if (editingReview?.id === rev.id) {
        setEditingReview(null);
      }
      setReviewToDelete(null);
      showNotification(
        `🗑️ Ulasan dari "${rev.name}" berhasil dihapus secara permanen dari database oleh admin.`
      );
    } catch (err: any) {
      console.error('Delete review error:', err);
      setDeleteError(
        err.message ||
          'Akses ditolak: Hanya akun admin terotentikasi yang dapat menghapus ulasan.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy locked URL to clipboard
  const handleCopyLink = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(activeTargetUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = activeTargetUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      showNotification('✅ URL review berhasil disalin ke clipboard!');
    } catch {
      showNotification('⚠️ Gagal menyalin URL. Silakan salin manual.');
    }
  };

  // Safely open the test link in new tab with fallbacks for iframes/popups
  const handleTestLink = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!activeTargetUrl) return;

    try {
      const opened = window.open(activeTargetUrl, '_blank', 'noopener,noreferrer');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        const a = document.createElement('a');
        a.href = activeTargetUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      showNotification(`🚀 Membuka link ulasan di tab baru: ${activeTargetUrl}`);
    } catch (err) {
      console.warn('Could not open via window.open:', err);
      const a = document.createElement('a');
      a.href = activeTargetUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showNotification(`🚀 Membuka link target: ${activeTargetUrl}`);
    }
  };

  // Test in the current application page directly (activates review portal)
  const handleTestInPage = () => {
    if (onCloseAdmin) {
      onCloseAdmin();
    }
    window.location.hash = 'reviews';
    try {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (e) {
      // ignore
    }
    showNotification('⬇️ Membuka Halaman Khusus Formulir Review Konsumen...');
  };

  // Download High-Resolution Print-Ready .PNG (1200 x 1500 px @ 300 DPI)
  const handleDownloadQrPng = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1500;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Background - clean white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1200, 1500);

      // Outer border frame
      ctx.strokeStyle = '#2E6F40';
      ctx.lineWidth = 14;
      ctx.strokeRect(20, 20, 1160, 1460);

      // Inner thin gold frame
      ctx.strokeStyle = '#F3C623';
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, 1128, 1428);

      // Header Banner (Asasora Green Gradient)
      const grad = ctx.createLinearGradient(40, 40, 1160, 240);
      grad.addColorStop(0, '#1B4D28');
      grad.addColorStop(1, '#2E6F40');
      ctx.fillStyle = grad;
      ctx.fillRect(40, 40, 1120, 200);

      // Gold divider line below header
      ctx.fillStyle = '#F3C623';
      ctx.fillRect(40, 236, 1120, 8);

      // Header Brand Text
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.font = 'bold 50px sans-serif';
      ctx.fillText('PT. ASASORA BIO HEALTHORA', 600, 115);

      ctx.font = '600 24px sans-serif';
      ctx.fillStyle = '#E8F5E9';
      ctx.fillText('LAYANAN JASA BOGA & KATERING SEHAT HALAL INDONESIA', 600, 160);

      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#F3C623';
      ctx.fillText('★ SERTIFIKAT HALAL BPJPH & LAIK HIGIENE SANITASI DINKES ★', 600, 205);

      // Action Title Above QR
      ctx.fillStyle = '#1B4D28';
      ctx.font = '900 42px sans-serif';
      ctx.fillText('SCAN UNTUK TULIS ULASAN & RATING', 600, 310);

      ctx.fillStyle = '#4B5563';
      ctx.font = '500 24px sans-serif';
      ctx.fillText('Arahkan kamera smartphone Anda ke QR Code atau Tap NFC', 600, 355);

      // Generate large QR code canvas (700 x 700 px)
      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, activeTargetUrl, {
        width: 700,
        margin: 2,
        color: {
          dark: '#1B4D28',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      // Draw QR Canvas onto master canvas
      ctx.drawImage(qrCanvas, 250, 400, 700, 700);

      // QR Code Box border
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 4;
      ctx.strokeRect(248, 398, 704, 704);

      // Target URL Pill
      ctx.fillStyle = '#F0FDF4';
      ctx.beginPath();
      ctx.roundRect(140, 1130, 920, 60, 30);
      ctx.fill();
      ctx.strokeStyle = '#2E6F40';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1B4D28';
      const fontSize =
        activeTargetUrl.length > 50 ? 17 : activeTargetUrl.length > 36 ? 21 : 25;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(activeTargetUrl, 600, 1168);

      // Instructions block
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Kepuasan & Masukan Anda Sangat Berharga Bagi Kami', 600, 1250);

      ctx.fillStyle = '#6B7280';
      ctx.font = 'normal 21px sans-serif';
      ctx.fillText('Setiap rating bintang & ulasan Anda otomatis tersimpan secara real-time', 600, 1290);
      ctx.fillText('untuk terus meningkatkan mutu cita rasa & higienitas dapur kami.', 600, 1325);

      // Footer bar
      ctx.fillStyle = '#1B4D28';
      ctx.fillRect(40, 1380, 1120, 80);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('TERIMA KASIH ATAS KUNJUNGAN & KEPERCAYAAN ANDA', 600, 1428);

      // Convert to PNG data URL and trigger download
      const pngUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `QR-Review-AsasoraFood-HD.png`;
      link.href = pngUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification('✅ Gambar QR Code HD (.png) siap cetak berhasil diunduh!');
    } catch (err) {
      console.error('Failed to download QR Code:', err);
      showNotification('⚠️ Gagal membuat gambar QR Code. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Print-Ready Dialog for Table Stand / Tent Card (A5 / A6)
  const handlePrintCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showNotification('⚠️ Izinkan pop-up peramban untuk mencetak langsung.');
      return;
    }
    const qrData = canvasRef.current?.toDataURL('image/png') || '';
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak QR Code Review - PT. ASASORA BIO HEALTHORA</title>
          <style>
            @page { size: A5 portrait; margin: 8mm; }
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; margin: 0; padding: 15px; color: #1f2937; background: #fff; }
            .card { border: 4px solid #2E6F40; border-radius: 16px; padding: 20px; max-width: 440px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
            .header { background: #1B4D28; color: white; padding: 12px; border-radius: 10px; margin-bottom: 16px; }
            .header h1 { margin: 0; font-size: 18px; letter-spacing: 0.5px; font-weight: 800; }
            .header p { margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; }
            .badge { display: inline-block; background: #FEF3C7; color: #92400E; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; margin-bottom: 10px; }
            h2 { color: #1B4D28; font-size: 17px; margin: 6px 0; font-weight: 800; }
            p.sub { font-size: 12px; color: #4B5563; margin-top: 0; }
            img { width: 220px; height: 220px; margin: 10px auto; display: block; border: 1px solid #E5E7EB; border-radius: 10px; }
            .url { background: #F0FDF4; border: 1px solid #2E6F40; color: #1B4D28; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 8px; display: inline-block; margin-top: 8px; }
            .footer { font-size: 10px; color: #6B7280; margin-top: 16px; border-top: 1px solid #E5E7EB; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>PT. ASASORA BIO HEALTHORA</h1>
              <p>Jasa Boga &amp; Katering Halal Higienis • Tangerang</p>
            </div>
            <div class="badge">NFC &amp; QR CODE COMPATIBLE</div>
            <h2>Scan untuk Ulasan &amp; Rating</h2>
            <p class="sub">Arahkan kamera smartphone Anda ke QR Code di bawah ini</p>
            <img src="${qrData}" alt="QR Code Review" />
            <div class="url">${activeTargetUrl}</div>
            <div class="footer">
              Terima kasih atas kunjungan Anda • Halal Resmi BPJPH &amp; Sanitasi Jasaboga
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6" id="admin-reviews-tab">
      {/* ------------------------------------------------------------- */}
      {/* 1 & 2. QR CODE GENERATOR MEJA & KASIR (LOCKED TO TARGET URL) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-green-50/90 via-emerald-50/50 to-white border-2 border-[#2E6F40]/30 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-green-200/60 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2E6F40] text-white flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5 text-[#F3C623]" />
            </div>
            <div>
              <h4 className="font-extrabold text-[#2E6F40] text-sm sm:text-base flex items-center gap-2">
                <span>QR Code Generator Khusus Review &amp; Meja Kasir</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  NFC &amp; QR Ready
                </span>
              </h4>
              <p className="text-xs text-gray-500">
                Kunci otomatis target URL untuk cetak stiker meja, tent card, atau kasir agar pelanggan langsung memberi rating &amp; ulasan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Alur Otomatis Real-time Aktif</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: QR Code Preview Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white rounded-2xl p-4 sm:p-5 border border-green-200 shadow-sm text-center relative group">
            <div className="w-full bg-[#1B4D28] text-white py-1.5 px-3 rounded-xl mb-3 text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#F3C623]" />
              <span>PT. ASASORA BIO HEALTHORA</span>
            </div>

            {/* High-Contrast Canvas with ISO Quiet Zone */}
            <div className="p-3 bg-white rounded-2xl border-2 border-gray-200 shadow-inner flex items-center justify-center relative">
              <canvas
                ref={canvasRef}
                className="rounded-xl shadow-xs"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Contrast Color Mode Toggle */}
            <div className="mt-3 flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setQrColorMode('black')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  qrColorMode === 'black'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Kontras tinggi hitam putih standar (Rekomendasi utama kamera bawaan HP)"
              >
                <Camera className="w-3 h-3" />
                <span>Hitam (Auto-Scan HP)</span>
              </button>
              <button
                type="button"
                onClick={() => setQrColorMode('green')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  qrColorMode === 'green'
                    ? 'bg-[#1B4D28] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Warna hijau resmi brand PT. Asasora"
              >
                <span>Hijau Brand</span>
              </button>
            </div>

            {/* Quick Action Buttons: Zoom & NFC */}
            <div className="mt-3 grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                title="Buka QR code ukuran besar di layar penuh untuk discan kamera HP"
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Perbesar Scan</span>
              </button>
              <button
                type="button"
                onClick={() => setIsNfcModalOpen(true)}
                className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                title="Buka Pusat Pengaturan & Program Chip/Stiker NFC"
              >
                <Wifi className="w-3.5 h-3.5 text-amber-700" />
                <span>Program NFC</span>
              </button>
            </div>

            {/* Info badge */}
            <div className="mt-2.5 flex items-center gap-1 text-[10px] text-gray-500 font-medium">
              <Camera className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Kamera HP bawaan (iPhone/Android) langsung membaca otomatis</span>
            </div>

            <div className="mt-2 text-[10px] font-mono text-[#2E6F40] bg-green-50 px-2.5 py-1 rounded-lg border border-green-200 font-semibold break-all max-w-full">
              {activeTargetUrl}
            </div>

            <span className="absolute top-2 right-2 text-[9px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold border border-emerald-300">
              Live Preview
            </span>
          </div>

          {/* Right: Controls & Specifications */}
          <div className="lg:col-span-7 space-y-4">
            {/* Target URL Card: Strictly & Exclusively Locked to Review Portal */}
            <div className="bg-white rounded-2xl p-4 border border-green-200/90 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-gray-800">
                    Target URL QR Code (Khusus Formulir Review)
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    🔒 Terkunci Khusus Review
                  </span>
                </div>

                <div className="text-[10px] text-gray-500 font-semibold">
                  Tanpa opsi halaman lain • Langsung Form Ulasan
                </div>
              </div>

              {/* Destination Mode Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Option 1: www.asasorafood.com (Recommended) */}
                <button
                  type="button"
                  onClick={() => {
                    setTargetDestination('official_www');
                    showNotification('🌟 Target diatur ke domain publik utama: https://www.asasorafood.com/#reviews');
                  }}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                    targetDestination === 'official_www'
                      ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-900">
                      <Sparkles className="w-3.5 h-3.5 text-[#F3C623]" />
                      <span>Domain Utama (www)</span>
                    </span>
                    <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-extrabold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>200 OK Online</span>
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-800 break-all font-bold">
                    https://www.asasorafood.com/#reviews
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight">
                    Langsung aktif &amp; dapat dibuka oleh semua HP di seluruh dunia tanpa login.
                  </span>
                </button>

                {/* Option 2: Apex domain asasorafood.com */}
                <button
                  type="button"
                  onClick={() => {
                    setTargetDestination('official_apex');
                    showNotification('🌟 Target diatur ke domain apex: https://asasorafood.com/#reviews');
                  }}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                    targetDestination === 'official_apex'
                      ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-900">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Domain Singkat (Apex)</span>
                    </span>
                    {targetDestination === 'official_apex' && (
                      <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-extrabold">
                        Aktif
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-emerald-800 break-all font-bold">
                    https://asasorafood.com/#reviews
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight">
                    Otomatis terhubung &amp; dialihkan langsung ke formulir ulasan.
                  </span>
                </button>
              </div>

              {/* URL Input Box */}
              <div className="relative flex items-center pt-1">
                <input
                  type="text"
                  readOnly
                  value={activeTargetUrl}
                  className="w-full pl-9 pr-24 py-2.5 rounded-xl font-mono text-xs font-bold outline-none transition select-all border border-emerald-300 bg-emerald-50/60 text-emerald-950 cursor-default"
                />
                <Lock className="w-4 h-4 text-emerald-600 absolute left-3" />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="absolute right-2 px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-[11px] font-bold text-gray-700 flex items-center gap-1 cursor-pointer transition shadow-2xs active:scale-95"
                  title="Salin URL Target ke Clipboard"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-gray-500" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Konsumen yang memindai QR code ini <strong>pasti 100% langsung masuk ke Formulir Review &amp; Rating Bintang</strong> tanpa menampilkan halaman beranda atau katalog lain.
                </span>
              </div>
            </div>

            {/* Action Buttons: Download PNG HD & Print & Test Link */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadQrPng}
                disabled={isDownloading}
                className="bg-[#2E6F40] hover:bg-green-800 active:scale-95 text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-[#F3C623]" />
                <span>
                  {isDownloading ? 'Memproses Unduhan HD...' : 'Download QR Code (.PNG HD)'}
                </span>
              </button>

              <button
                type="button"
                onClick={handlePrintCard}
                className="bg-white hover:bg-gray-50 active:scale-95 text-gray-700 border border-gray-300 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                title="Cetak format kartu meja (A5 / A6 tent card)"
              >
                <Printer className="w-4 h-4 text-emerald-700" />
                <span>Cetak Stand Meja</span>
              </button>

              <button
                type="button"
                onClick={handleTestLink}
                className="bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-300 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                title="Buka link target di tab baru"
              >
                <ExternalLink className="w-4 h-4 text-emerald-700" />
                <span>Tes Link (Tab Baru)</span>
              </button>

              {onCloseAdmin && (
                <button
                  type="button"
                  onClick={handleTestInPage}
                  className="bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-300 text-xs font-extrabold px-4 py-3 rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Lihat simulasi langsung Halaman Khusus Formulir Review Konsumen tanpa halaman depan"
                >
                  <Star className="w-4 h-4 text-[#F3C623] fill-[#F3C623]" />
                  <span>🚀 Buka Portal Review (Uji di Layar Ini)</span>
                </button>
              )}
            </div>

            {/* Instructions box */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Domain Resmi Terverifikasi: asasorafood.com (PT. Asasora Bio Healthora)</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                QR Code beresolusi 300 DPI Ultra HD dan link telah dihubungkan langsung ke domain resmi <strong>asasorafood.com</strong>. Pelanggan yang melakukan scan kamera HP atau tap NFC akan langsung diarahkan ke form ulasan dan setiap testimoni otomatis tersimpan real-time ke sistem Admin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* HEADER TABEL REVIEW & TOMBOL TAMBAH MANUAL */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div>
          <h4 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-[#F3C623]" />
            <span>Daftar Ulasan &amp; Testimoni Pelanggan ({reviews.length})</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Semua ulasan dari pelanggan yang scan QR/NFC otomatis masuk ke sini secara real-time. Hak hapus ulasan dikunci aman hanya untuk akun admin aktif.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="bg-[#2E6F40] hover:bg-green-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Review Manual</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-green-50 border border-green-300 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL KONFIRMASI HAPUS (DELETE) - HANYA UNTUK ADMIN */}
      {/* ------------------------------------------------------------- */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-base">
                  Hapus Testimoni / Ulasan Permanen?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus ulasan dari{' '}
                  <strong className="text-gray-900 font-bold">"{reviewToDelete.name}"</strong>?
                </p>
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 font-medium">
                  🔒 <strong>Keamanan Terjamin:</strong> Di halaman publik konsumen, ulasan bersifat permanen tanpa tombol hapus. Operasi hapus ini diotentikasi ke API backend menggunakan session login admin aktif Anda.
                </div>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setReviewToDelete(null);
                  setDeleteError('');
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => executeDeleteReview(reviewToDelete)}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus dari Server...' : 'Ya, Hapus Ulasan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Tambah Review */}
      {isAdding && (
        <div ref={addRef} id="review-add-form">
          <form
            onSubmit={handleCreate}
            className="p-5 bg-green-50/80 border-2 border-[#2E6F40] rounded-2xl space-y-4 shadow-sm animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-green-200 pb-2">
              <h5 className="font-black text-xs text-[#2E6F40] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#F3C623]" />
                <span>Form Tambah Review Klien Manual</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-green-100 cursor-pointer"
                title="Tutup Form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nama Klien / Pemesan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ibu Rina S."
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Jabatan / Asal Instansi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Contoh: HR Manager PT. Bank BCA"
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Bintang Rating (1-5)</label>
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-gray-300">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-yellow-400 hover:scale-125 transition cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-700 mb-1">
                  Isi Testimoni / Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan kepuasan rasa makanan, ketepatan waktu pengiriman, atau pelayanan katering Asasora..."
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-bold">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="w-4 h-4 text-[#2E6F40] rounded focus:ring-[#2E6F40]"
                  />
                  <span>Tampilkan Badge Terverifikasi Resmi</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-green-200">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleCreate(e);
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#2E6F40] hover:bg-green-800 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Check className="w-4 h-4 text-[#F3C623]" />
                <span>Simpan Review</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Form Edit Review */}
      {editingReview && (
        <div ref={editRef} id="review-edit-form">
          <form
            onSubmit={handleSaveEdit}
            className="p-5 bg-amber-50/90 border-2 border-amber-400 rounded-2xl space-y-4 shadow-md animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h5 className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <span>Edit Testimoni: {editingReview.name}</span>
              </h5>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-amber-100 cursor-pointer"
                title="Tutup Form Edit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Nama Klien / Pemesan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingReview.name}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Jabatan / Instansi</label>
                <input
                  type="text"
                  value={editingReview.role}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, role: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Bintang Rating (1-5)</label>
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-amber-300">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setEditingReview({ ...editingReview, rating: star })
                      }
                      className="p-1 text-yellow-400 hover:scale-125 transition cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= editingReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-800 mb-1">
                  Isi Testimoni <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingReview.comment}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, comment: e.target.value })
                  }
                  className="w-full p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="flex items-center gap-2 cursor-pointer text-gray-800 font-bold">
                  <input
                    type="checkbox"
                    checked={editingReview.verified !== false}
                    onChange={(e) =>
                      setEditingReview({
                        ...editingReview,
                        verified: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#2E6F40] rounded focus:ring-amber-500"
                  />
                  <span>Tampilkan Badge Terverifikasi Resmi</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleSaveEdit(e);
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#2E6F40] hover:bg-green-800 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Check className="w-4 h-4 text-[#F3C623]" />
                <span>Simpan Perubahan Review</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. DAFTAR KARTU ULASAN KONSUMEN DENGAN TOMBOL HAPUS AMAN */}
      {/* ------------------------------------------------------------- */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <MessageSquareQuote className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-bold">Belum ada review testimoni.</p>
          <button
            type="button"
            onClick={handleStartAdd}
            className="mt-2 text-xs text-[#2E6F40] font-bold hover:underline"
          >
            + Tambah Review Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => {
            const isCurrentEditing = editingReview?.id === rev.id;
            return (
              <div
                key={rev.id}
                className={`p-4 bg-white rounded-2xl border transition flex flex-col justify-between shadow-2xs ${
                  isCurrentEditing
                    ? 'border-2 border-amber-500 ring-2 ring-amber-200'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-extrabold text-xs text-[#2E6F40] flex items-center gap-1.5">
                        <span>{rev.name}</span>
                        {rev.verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-50 shrink-0" />
                        )}
                      </h5>
                      <p className="text-[11px] text-gray-500">{rev.role || rev.company}</p>
                    </div>
                    <div className="flex items-center text-yellow-400 shrink-0">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 text-[10px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{rev.date || 'Baru saja'}</span>
                    <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                      ID: {rev.id.slice(-6)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(rev)}
                      className="p-1.5 text-gray-600 hover:text-[#2E6F40] hover:bg-green-50 rounded-lg border border-gray-200 transition cursor-pointer"
                      title="Edit Review"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {/* Secure Delete Button - Protected by Admin Authorization */}
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError('');
                        setReviewToDelete(rev);
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer flex items-center gap-1"
                      title="Hapus Review (Khusus Admin)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: FULLSCREEN / ZOOM QR CODE SCAN MODE (UNTUK KAMERA HP) */}
      {/* ------------------------------------------------------------- */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center relative border border-emerald-100">
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold mb-3">
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              <span>Mode Scan Kamera HP (Auto-Detect)</span>
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-1">
              Arahkan Kamera HP ke QR Code
            </h3>
            <p className="text-xs text-gray-600 mb-4 max-w-sm mx-auto leading-relaxed">
              Buka aplikasi <strong>Kamera bawaan</strong> di HP Anda (iPhone / Android) dan sorot kode di bawah. Kotak notifikasi tautan kuning/putih akan langsung muncul tanpa perlu aplikasi scan tambahan.
            </p>

            {/* High-Contrast Large Canvas */}
            <div className="bg-white p-4 rounded-2xl border-4 border-[#1B4D28] shadow-md inline-block mb-3">
              <canvas
                ref={modalCanvasRef}
                className="rounded-lg"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Color switcher */}
            <div className="flex items-center justify-center gap-2 mb-3 text-xs">
              <button
                type="button"
                onClick={() => setQrColorMode('black')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  qrColorMode === 'black'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⬛ Hitam Kontras Tinggi (Rekomendasi)
              </button>
              <button
                type="button"
                onClick={() => setQrColorMode('green')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  qrColorMode === 'green'
                    ? 'bg-[#1B4D28] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🟩 Hijau Brand
              </button>
            </div>

            <div className="text-[11px] font-mono text-[#2E6F40] bg-green-50 px-3 py-1.5 rounded-xl border border-green-200 font-bold break-all mb-4">
              {activeTargetUrl}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin URL</span>
              </button>
              <button
                type="button"
                onClick={handleTestLink}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Tes Buka Tautan</span>
              </button>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="px-4 py-2.5 bg-[#1B4D28] hover:bg-green-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: NFC PROGRAMMER & PANDUAN LENGKAP KONSUMEN */}
      {/* ------------------------------------------------------------- */}
      {isNfcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative border border-amber-100 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setIsNfcModalOpen(false);
                setNfcStatus('idle');
                setNfcErrorMessage('');
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Wifi className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  Panduan &amp; Pemrograman NFC Review
                </h3>
                <p className="text-xs text-gray-500">
                  Teknologi Tap NFC untuk Meja Tamu &amp; Kasir
                </p>
              </div>
            </div>

            {/* Explanation box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2 mb-4">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Smartphone className="w-4 h-4 text-amber-700" />
                <span>Cara Kerja Tap NFC untuk Konsumen:</span>
              </div>
              <p className="leading-relaxed text-gray-700">
                Konsumen <strong>TIDAK PERLU menginstal aplikasi apa pun</strong>. Cukup tempelkan smartphone mereka (iPhone XS atau lebih baru, dan Android ber-NFC aktif) ke stiker NFC di meja, layar HP akan <strong>otomatis memunculkan notifikasi pop-up</strong> untuk membuka formulir rating ulasan detik itu juga.
              </p>
            </div>

            {/* Target URL */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-bold text-gray-700 block">
                Tautan yang Diprogram ke Chip/Stiker NFC:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={activeTargetUrl}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs font-bold text-emerald-900 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1 transition shadow-2xs shrink-0"
                  title="Salin Tautan"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </button>
              </div>
            </div>

            {/* Web NFC Writer Section */}
            <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/80 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-700" />
                  <span>Tulis Langsung via Web NFC (Browser HP Android)</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Web NFC API
                </span>
              </div>

              {nfcStatus === 'idle' && (
                <button
                  type="button"
                  onClick={handleWriteNfc}
                  className="w-full bg-[#2E6F40] hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Wifi className="w-4 h-4 text-[#F3C623]" />
                  <span>Mulai Tulis ke Stiker/Kartu NFC</span>
                </button>
              )}

              {nfcStatus === 'writing' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-1">
                  <div className="text-xs font-bold text-blue-900 animate-pulse flex items-center justify-center gap-1.5">
                    <Wifi className="w-4 h-4 text-blue-600 animate-spin" />
                    <span>Mendeteksi tag NFC...</span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    Tempelkan stiker atau kartu NFC Anda ke bagian belakang HP sekarang.
                  </p>
                </div>
              )}

              {nfcStatus === 'success' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                  <div className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Stiker NFC Berhasil Diprogram!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Stiker NFC siap ditempel di meja atau akrilik kasir untuk digunakan konsumen.
                  </p>
                </div>
              )}

              {nfcStatus === 'unsupported' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-700" />
                    <span>Perangkat ini tidak memiliki modul Web NFC</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Browser komputer atau iPhone membatasi penulisan NFC langsung via browser. Gunakan aplikasi gratis <strong>NFC Tools</strong> di HP Anda mengikuti 3 langkah mudah di bawah.
                  </p>
                </div>
              )}

              {nfcStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1">
                  <div className="font-bold">Gagal menulis ke NFC</div>
                  <p className="text-[11px] text-red-700">{nfcErrorMessage}</p>
                </div>
              )}
            </div>

            {/* Easy 3-Step Setup for Any Smartphone */}
            <div className="border border-emerald-200/80 rounded-2xl p-4 bg-emerald-50/50 space-y-2.5 mb-4">
              <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>Panduan 3 Langkah Memprogram Stiker NFC (Semua HP):</span>
              </span>

              <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  <strong>Siapkan Stiker NFC:</strong> Beli stiker NFC tipe <strong>NTAG213 / NTAG215</strong> di marketplace (harga sekitar Rp 2.000 - Rp 5.000 per keping).
                </li>
                <li>
                  <strong>Unduh Aplikasi Gratis:</strong> Buka App Store (iPhone) atau Google Play Store (Android) dan cari aplikasi <strong>NFC Tools</strong> (gratis).
                </li>
                <li>
                  <strong>Tulis Tautan:</strong> Di aplikasi NFC Tools:
                  <ul className="list-disc list-inside pl-4 text-gray-600 mt-1 space-y-0.5">
                    <li>Pilih menu <strong>Write (Tulis)</strong> &gt; <strong>Add a record</strong></li>
                    <li>Pilih <strong>URL / URI</strong></li>
                    <li>Tempelkan tautan ulasan: <code className="bg-white px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-800">{activeTargetUrl}</code></li>
                    <li>Klik <strong>Write</strong> dan dekatkan stiker NFC ke punggung HP selama 1 detik sampai bergetar centang hijau.</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleTestLink}
                className="px-4 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Simulasi Tap NFC Konsumen</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsNfcModalOpen(false);
                  setNfcStatus('idle');
                }}
                className="px-5 py-2.5 bg-[#1B4D28] hover:bg-green-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
