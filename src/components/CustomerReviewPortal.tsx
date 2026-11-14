import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  Send,
  Lock,
  ShieldCheck,
  Building2,
  User,
  MessageSquareQuote,
  ArrowRight,
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
    <div className="min-h-screen bg-[#F7F8F6] text-stone-800 flex flex-col font-sans antialiased selection:bg-[#0F5132] selection:text-white">
      {/* Brand Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-asasora.png"
              alt="Logo PT. Asasora Bio Healthora"
              className="w-10 h-10 object-contain rounded-lg border border-stone-200 bg-white p-0.5"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-[#0F5132] tracking-tight leading-tight">
                PT. ASASORA BIO HEALTHORA
              </div>
              <p className="text-[11px] text-stone-500 font-semibold flex items-center gap-1.5">
                <span>Catering Halal &amp; Higienis</span>
                <span className="text-stone-300" aria-hidden="true">·</span>
                <span className="text-[#0F5132] font-bold">Tangerang</span>
              </p>
            </div>
          </div>

          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="text-xs font-bold text-stone-700 hover:text-[#0F5132] bg-[#FAFBF9] hover:bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              title="Kunjungi Beranda Website Utama"
            >
              <span>Beranda Web</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </header>

      {/* Main Review Form Body */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-10 space-y-6">
        {/* Quiet Verification Metadata */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-[#0F5132]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
            <span>Sertifikat Halal Resmi BPJPH</span>
          </span>
          <span className="text-stone-300" aria-hidden="true">·</span>
          <span>Laik Higiene Sanitasi Jasaboga</span>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
            Portal Ulasan &amp; Rating Konsumen
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Bagikan Pengalaman Kuliner Anda
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            Terima kasih telah menikmati sajian PT. Asasora Bio Healthora. Penilaian bintang dan ulasan Anda akan langsung masuk secara <strong>real-time</strong> ke database dan panel manajemen dapur kami.
          </p>
        </div>

        {/* Submission Success Box */}
        {submitted && (
          <div className="p-6 bg-white border border-[#0F5132] rounded-2xl text-center space-y-2 animate-in zoom-in-95 duration-300">
            <div className="w-11 h-11 bg-[#0F5132] text-white rounded-xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-[#F3C623]" strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-extrabold text-stone-900">
              Terima Kasih! Ulasan Anda Berhasil Terkirim
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
              Rating bintang dan testimoni Anda telah tersimpan detik ini juga di sistem kami. Dukungan Anda sangat berarti bagi seluruh tim katering PT. Asasora.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-[#0F5132] hover:underline cursor-pointer"
              >
                Tulis ulasan tambahan lainnya
              </button>
            </div>
          </div>
        )}

        {/* Interactive Review Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Large 5-Star Touch Selector */}
            <div className="space-y-2 text-center bg-[#FAFBF9] p-5 rounded-xl border border-stone-200">
              <label className="block text-xs sm:text-sm font-bold text-stone-800">
                Pilih Rating Bintang Anda <span className="text-red-500">*</span>
              </label>

              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 sm:p-1.5 transition-transform active:scale-95 cursor-pointer focus:outline-none"
                    aria-label={`Beri bintang ${star}`}
                  >
                    <Star
                      className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                        star <= activeRatingDisplay
                          ? 'text-[#F3C623] fill-[#F3C623]'
                          : 'text-stone-200 fill-stone-100 hover:text-amber-200'
                      }`}
                      strokeWidth={1.75}
                    />
                  </button>
                ))}
              </div>

              <div className="min-h-10 flex flex-col items-center justify-center">
                <span className="text-xs sm:text-sm font-extrabold text-[#0F5132] inline-flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#F3C623] fill-[#F3C623]" strokeWidth={1.75} />
                  <span>{rating} dari 5 Bintang — {ratingDescriptions[rating]?.label}</span>
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {ratingDescriptions[rating]?.desc}
                </span>
              </div>
            </div>

            {/* 2. Customer Name */}
            <div>
              <label
                htmlFor="portal-name"
                className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
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
                className="w-full px-4 py-3 rounded-lg border border-stone-300 text-xs sm:text-sm bg-[#FAFBF9] focus:bg-white focus:border-[#0F5132] focus:ring-2 focus:ring-[#0F5132]/25 outline-none transition-colors font-medium"
              />
            </div>

            {/* 3. Company / Office */}
            <div>
              <label
                htmlFor="portal-company"
                className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
                  <span>Instansi / Kantor / Perusahaan</span>
                </span>
                <span className="text-[11px] text-stone-400 font-normal">Opsional</span>
              </label>
              <input
                id="portal-company"
                type="text"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                placeholder="Contoh: PT. Sumber Makmur / Bagian GA / Pribadi"
                className="w-full px-4 py-3 rounded-lg border border-stone-300 text-xs sm:text-sm bg-[#FAFBF9] focus:bg-white focus:border-[#0F5132] focus:ring-2 focus:ring-[#0F5132]/25 outline-none transition-colors font-medium"
              />
            </div>

            {/* 4. Review Comment */}
            <div>
              <label
                htmlFor="portal-comment"
                className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5"
              >
                <MessageSquareQuote className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
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
                className="w-full px-4 py-3 rounded-lg border border-stone-300 text-xs sm:text-sm bg-[#FAFBF9] focus:bg-white focus:border-[#0F5132] focus:ring-2 focus:ring-[#0F5132]/25 outline-none transition-colors font-medium leading-relaxed"
              />
            </div>

            {/* 5. Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0F5132] hover:bg-[#0b3d26] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#F3C623]" strokeWidth={1.75} />
              <span>
                {isSubmitting ? 'Menyimpan Ulasan Real-Time...' : 'Kirim Ulasan & Rating Sekarang'}
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 text-center pt-1">
              <Lock className="w-3.5 h-3.5 text-[#0F5132] shrink-0" strokeWidth={1.75} />
              <span>
                Ulasan otomatis tersimpan permanen dan langsung tayang di sistem PT. Asasora.
              </span>
            </div>
          </form>
        </div>

        {/* Previous Verified Reviews List */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-[#0F5132]" strokeWidth={1.75} />
              <span>Ulasan Pelanggan Lainnya ({reviews.length})</span>
            </h3>
            <span className="text-[11px] text-[#0F5132] font-bold bg-white px-2.5 py-1 rounded-md border border-stone-200">
              100% Terverifikasi
            </span>
          </div>

          <div className="space-y-3">
            {reviews.slice(0, 6).map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-xl p-5 border border-stone-200 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'text-[#F3C623] fill-[#F3C623]'
                            : 'text-stone-200 fill-stone-100'
                        }`}
                        strokeWidth={1.75}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {rev.date || 'Terverifikasi'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-stone-900">{rev.name}</span>
                    {rev.company && (
                      <span className="text-[11px] text-stone-500 block">{rev.company}</span>
                    )}
                  </div>
                  {rev.verified && (
                    <span className="inline-flex items-center text-[10px] text-[#0F5132] bg-[#FAFBF9] px-2 py-0.5 rounded-md font-semibold border border-stone-200">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-[#0F5132]" strokeWidth={1.75} />
                      <span>Terverifikasi</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation & Corporate Contact */}
        <div className="text-center pt-6 pb-8 border-t border-stone-200 space-y-3">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0F5132] bg-white hover:bg-stone-50 px-5 py-2.5 rounded-lg border border-stone-300 transition-colors cursor-pointer"
            >
              <span>Jelajahi Menu &amp; Katalog Katering Asasora</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0F5132]" strokeWidth={1.75} />
            </button>
          )}

          <p className="text-xs text-stone-500 leading-relaxed">
            {company.name} · {company.address}
            <br />
            WhatsApp Hotline: {company.phone} · {company.email}
          </p>
        </div>
      </main>
    </div>
  );
};
