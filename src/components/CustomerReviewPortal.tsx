import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  Send,
  Lock,
  Sparkles,
  ShieldCheck,
  Building2,
  User,
  MessageSquareQuote,
  ArrowRight,
  ExternalLink,
  ThumbsUp,
} from 'lucide-react';
import { Review, CompanyInfo } from '../types';
import { sanitizeString } from '../utils/security';

interface CustomerReviewPortalProps {
  company: CompanyInfo;
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date' | 'verified'>) => void | Promise<any>;
  onBackToHome?: () => void;
}

export const CustomerReviewPortal: React.FC<CustomerReviewPortalProps> = ({
  company,
  reviews,
  onAddReview,
  onBackToHome,
}) => {
  const [name, setName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingDescriptions: Record<number, { label: string; desc: string }> = {
    5: { label: 'Luar Biasa / Sangat Puas', desc: 'Rasa autentik, porsi mantap, higienis & tepat waktu!' },
    4: { label: 'Sangat Baik / Puas', desc: 'Kualitas makanan dan pelayanan memuaskan.' },
    3: { label: 'Cukup Baik', desc: 'Cita rasa standar dan pengiriman cukup rapi.' },
    2: { label: 'Kurang Memuaskan', desc: 'Perlu peningkatan pada cita rasa atau pengiriman.' },
    1: { label: 'Sangat Kurang', desc: 'Pengalaman tidak sesuai dengan ekspektasi.' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeString(name);
    const cleanComp = sanitizeString(customerCompany);
    const cleanComment = sanitizeString(comment);

    if (!cleanName || !cleanComment) return;

    setIsSubmitting(true);
    try {
      await onAddReview({
        name: cleanName,
        company: cleanComp || 'Pelanggan Setia PT. Asasora',
        rating,
        comment: cleanComment,
      });

      setName('');
      setCustomerCompany('');
      setRating(5);
      setComment('');
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRatingDisplay = hoverRating || rating;

  return (
    <div className="min-h-screen bg-[#F9FDF9] text-gray-800 flex flex-col font-sans antialiased selection:bg-[#2E6F40] selection:text-white">
      {/* Brand Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-green-200/80 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-asasora.png"
              alt="Logo PT. Asasora Bio Healthora"
              className="w-10 h-10 object-contain rounded-xl border border-green-200 bg-white p-0.5 shadow-2xs"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-xs sm:text-sm font-black text-[#1B4D28] tracking-tight leading-tight">
                PT. ASASORA BIO HEALTHORA
              </h1>
              <p className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                <span>Catering Halal &amp; Higienis</span>
                <span className="text-gray-300">•</span>
                <span className="text-emerald-700 font-bold">Tangerang</span>
              </p>
            </div>
          </div>

          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="text-[11px] font-bold text-gray-600 hover:text-[#1B4D28] bg-gray-50 hover:bg-green-50 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-green-300 transition cursor-pointer flex items-center gap-1 shrink-0"
              title="Kunjungi Beranda Website Utama"
            >
              <span>Beranda Web</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          )}
        </div>
      </header>

      {/* Main Review Form Body */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Verification Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold">
          <span className="bg-[#1B4D28] text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#F3C623]" />
            <span>Sertifikat Halal Resmi BPJPH</span>
          </span>
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            <span>Laik Higiene Sanitasi Jasaboga</span>
          </span>
        </div>

        {/* Heading Card */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-black border border-amber-300">
            <Star className="w-3.5 h-3.5 fill-[#F3C623] text-[#F3C623]" />
            <span>PORTAL ULASAN &amp; RATING KONSUMEN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B4D28] tracking-tight">
            Bagikan Pengalaman Kuliner Anda
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
            Terima kasih telah menikmati sajian PT. Asasora Bio Healthora. Penilaian bintang dan ulasan Anda akan langsung masuk secara <strong>real-time</strong> ke database dan panel manajemen dapur kami.
          </p>
        </div>

        {/* Submission Success Box */}
        {submitted && (
          <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-3xl text-center space-y-2 animate-in zoom-in-95 duration-300 shadow-md">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-emerald-950">
              Terima Kasih! Ulasan Anda Berhasil Terkirim
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
              Rating bintang dan testimoni Anda telah tersimpan detik ini juga di sistem kami. Dukungan Anda sangat berarti bagi seluruh tim katering PT. Asasora.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
              >
                Tulis ulasan tambahan lainnya
              </button>
            </div>
          </div>
        )}

        {/* Interactive Review Form Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-green-200/90 shadow-md space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Large 5-Star Touch Selector */}
            <div className="space-y-2 text-center bg-green-50/60 p-4 rounded-2xl border border-green-200/70">
              <label className="block text-xs sm:text-sm font-extrabold text-gray-800">
                Pilih Rating Bintang Anda <span className="text-red-500">*</span>
              </label>

              {/* Star buttons */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 sm:p-2 transition-transform active:scale-90 hover:scale-110 cursor-pointer focus:outline-none"
                    aria-label={`Beri bintang ${star}`}
                  >
                    <Star
                      className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors drop-shadow-xs ${
                        star <= activeRatingDisplay
                          ? 'text-[#F3C623] fill-[#F3C623]'
                          : 'text-gray-200 fill-gray-100 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Dynamic description of current star */}
              <div className="min-h-10 flex flex-col items-center justify-center">
                <span className="text-xs sm:text-sm font-black text-[#1B4D28]">
                  ⭐ {rating} dari 5 Bintang — {ratingDescriptions[rating]?.label}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">
                  {ratingDescriptions[rating]?.desc}
                </span>
              </div>
            </div>

            {/* 2. Customer Name */}
            <div>
              <label
                htmlFor="portal-name"
                className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Nama Lengkap Anda</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                id="portal-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ibu Rina / Bpk. Hendra"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm bg-gray-50/50 focus:bg-white focus:border-[#2E6F40] focus:ring-2 focus:ring-green-200 outline-none transition font-medium"
              />
            </div>

            {/* 3. Company / Office */}
            <div>
              <label
                htmlFor="portal-company"
                className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Instansi / Kantor / Perusahaan</span>
                </span>
                <span className="text-[10px] text-gray-400 font-normal">Opsional</span>
              </label>
              <input
                id="portal-company"
                type="text"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                placeholder="Contoh: PT. Sumber Makmur / Bagian GA / Pribadi"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm bg-gray-50/50 focus:bg-white focus:border-[#2E6F40] focus:ring-2 focus:ring-green-200 outline-none transition font-medium"
              />
            </div>

            {/* 4. Review Comment */}
            <div>
              <label
                htmlFor="portal-comment"
                className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"
              >
                <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ulasan &amp; Kesan Anda</span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="portal-comment"
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ceritakan pengalaman Anda mengenai cita rasa masakan (misal Paru Balado khas Asasora), higienitas boks, ketepatan waktu pengiriman, atau pelayanan kami..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm bg-gray-50/50 focus:bg-white focus:border-[#2E6F40] focus:ring-2 focus:ring-green-200 outline-none transition font-medium leading-relaxed"
              />
            </div>

            {/* 5. Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1B4D28] hover:bg-green-900 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl shadow-md transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4 text-[#F3C623]" />
              <span>
                {isSubmitting ? 'Menyimpan Ulasan Real-Time...' : 'Kirim Ulasan & Rating Sekarang'}
              </span>
            </button>

            {/* Privacy & Admin Lock Note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 text-center pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                Ulasan otomatis tersimpan permanen dan langsung tayang di sistem PT. Asasora.
              </span>
            </div>
          </form>
        </div>

        {/* Previous Verified Reviews List */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#1B4D28] text-sm sm:text-base flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <span>Ulasan Pelanggan Lainnya ({reviews.length})</span>
            </h3>
            <span className="text-[10px] text-gray-500 font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
              100% Ulasan Terverifikasi
            </span>
          </div>

          <div className="space-y-3">
            {reviews.slice(0, 6).map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-4 border border-green-100 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'text-[#F3C623] fill-[#F3C623]'
                            : 'text-gray-200 fill-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {rev.date || 'Terverifikasi'}
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#1B4D28]">{rev.name}</span>
                    {rev.company && (
                      <span className="text-[10px] text-gray-500 block">{rev.company}</span>
                    )}
                  </div>
                  {rev.verified && (
                    <span className="inline-flex items-center text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                      <span>Terverifikasi</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation & Corporate Contact */}
        <div className="text-center pt-6 pb-8 border-t border-green-200 space-y-3">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4D28] bg-white hover:bg-green-50 px-5 py-2.5 rounded-xl border border-green-300 shadow-2xs transition cursor-pointer"
            >
              <span>Jelajahi Menu &amp; Katalog Katering Asasora</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          )}

          <p className="text-[11px] text-gray-500">
            {company.name} • {company.address}
            <br />
            WhatsApp Hotline: {company.phone} • {company.email}
          </p>
        </div>
      </main>
    </div>
  );
};
