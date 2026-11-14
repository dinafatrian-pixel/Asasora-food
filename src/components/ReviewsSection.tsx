import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle2, Send, Lock } from 'lucide-react';
import { Review } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { sanitizeString } from '../utils/security';

interface ReviewsSectionProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date' | 'verified'>) => void | Promise<any>;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onAddReview }) => {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-scroll immediately to review form when opened via QR Code scan / NFC tap
  useEffect(() => {
    const scrollToReview = () => {
      if (
        typeof window !== 'undefined' &&
        (window.location.hash.toLowerCase().includes('review') ||
          window.location.search.toLowerCase().includes('review'))
      ) {
        const el = document.getElementById('reviews');
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }
    };

    scrollToReview();
    const t1 = setTimeout(scrollToReview, 50);
    const t2 = setTimeout(scrollToReview, 250);
    const t3 = setTimeout(scrollToReview, 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeString(name);
    const cleanCompany = sanitizeString(company);
    const cleanComment = sanitizeString(comment);

    if (!cleanName || !cleanComment) return;

    setIsSubmitting(true);
    try {
      await onAddReview({
        name: cleanName,
        company: cleanCompany || (lang === 'en' ? 'General Customer' : 'Pelanggan Umum'),
        rating,
        comment: cleanComment,
      });

      setName('');
      setCompany('');
      setRating(5);
      setComment('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= count ? 'text-[#F3C623] fill-[#F3C623]' : 'text-stone-300'
            }`}
            strokeWidth={1.75}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-stone-200" id="reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#0F5132] font-bold text-xs tracking-[0.14em] uppercase">
            {t('reviews.tag', 'Testimoni & Penilaian')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 mt-2 tracking-tight">
            {t('reviews.title', 'Review Pelanggan')}
          </h2>
          <p className="text-stone-600 mt-3 text-sm sm:text-base leading-relaxed">
            {t(
              'reviews.subtitle',
              'Bagikan pengalaman Anda atau lihat ulasan otentik dari instansi, korporat, dan pelanggan setia kami.'
            )}
          </p>
        </div>

        {/* Reviews Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-5">
            <h3 className="font-bold text-stone-900 text-lg sm:text-xl flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0F5132]" strokeWidth={1.75} />
              <span>{t('reviews.section_heading', 'Ulasan Terbaru Pelanggan')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="reviews-grid">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="card-hover bg-[#FAFBF9] hover:bg-white rounded-xl p-6 border border-stone-200 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {renderStars(rev.rating)}
                      <span className="text-[11px] text-stone-400 font-medium">
                        {rev.date === 'Baru saja' && lang === 'en' ? 'Just now' : rev.date}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-stone-900">{rev.name}</div>
                      {rev.company && (
                        <div className="text-[11px] text-stone-500">{rev.company}</div>
                      )}
                    </div>
                    {rev.verified && (
                      <span className="inline-flex items-center text-[11px] text-[#0F5132] bg-white border border-stone-200 px-2.5 py-0.5 rounded-md font-semibold">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-[#0F5132]" strokeWidth={1.75} />
                        {t('reviews.verified', 'Terverifikasi')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Review Form */}
          <div className="bg-[#F7F8F6] p-6 sm:p-8 rounded-2xl border border-stone-200">
            <h3 className="font-extrabold text-stone-900 text-lg mb-1 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F3C623] fill-[#F3C623]" strokeWidth={1.75} />
              <span>{t('reviews.form_title', 'Tulis Review Anda')}</span>
            </h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              {t(
                'reviews.form_subtitle',
                'Ulasan Anda akan langsung tampil setelah dikirim untuk membantu pelanggan lain.'
              )}
            </p>

            {submitted && (
              <div className="mb-4 p-3 bg-white border border-[#0F5132]/40 text-[#0F5132] rounded-xl text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#0F5132] shrink-0" strokeWidth={1.75} />
                <span>
                  {t(
                    'reviews.form_success',
                    'Terima kasih! Ulasan Anda telah berhasil diterbitkan.'
                  )}
                </span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="review-author-name" className="block text-xs font-bold text-stone-700 mb-1.5">
                  {t('reviews.name_label', 'Nama Lengkap')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="review-author-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('reviews.name_placeholder', 'Contoh: Budi Santoso')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                />
              </div>

              <div>
                <label htmlFor="review-company" className="block text-xs font-bold text-stone-700 mb-1.5">
                  {t('reviews.company_label', 'Instansi / Perusahaan (Opsional)')}
                </label>
                <input
                  id="review-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t('reviews.company_placeholder', 'Contoh: PT. Sumber Makmur')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                />
              </div>

              <div>
                <label htmlFor="review-rating" className="block text-xs font-bold text-stone-700 mb-1.5">
                  {t('reviews.rating_label', 'Rating Bintang (1 - 5)')}
                </label>
                <select
                  id="review-rating"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none font-medium"
                >
                  <option value={5}>5 Bintang - {lang === 'en' ? 'Excellent' : 'Sangat Puas'}</option>
                  <option value={4}>4 Bintang - {lang === 'en' ? 'Good' : 'Puas'}</option>
                  <option value={3}>3 Bintang - {lang === 'en' ? 'Average' : 'Cukup'}</option>
                  <option value={2}>2 Bintang - {lang === 'en' ? 'Poor' : 'Kurang'}</option>
                  <option value={1}>1 Bintang - {lang === 'en' ? 'Very Poor' : 'Sangat Kurang'}</option>
                </select>
              </div>

              <div>
                <label htmlFor="review-comment" className="block text-xs font-bold text-stone-700 mb-1.5">
                  {t('reviews.comment_label', 'Tulis Pengalaman & Ulasan Anda')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="review-comment"
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t(
                    'reviews.comment_placeholder',
                    'Ceritakan kepuasan Anda mengenai rasa, ketepatan waktu pengiriman, kebersihan kemasan...'
                  )}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-micro group w-full bg-[#0F5132] hover:bg-[#0b3d26] disabled:opacity-60 text-white font-bold py-3 rounded-lg border border-[#0b3d26] text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
                <span>
                  {isSubmitting
                    ? lang === 'en'
                      ? 'Submitting Review...'
                      : 'Menyimpan Ulasan Real-Time...'
                    : t('reviews.btn_submit', 'Kirim Review Sekarang')}
                </span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1 text-center">
                <Lock className="w-3 h-3 text-[#0F5132] shrink-0" strokeWidth={1.75} />
                <span>Ulasan tersimpan permanen &amp; diverifikasi langsung oleh sistem PT. Asasora.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
