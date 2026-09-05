import React, { useState, useRef } from 'react';
import { Article } from '../../types';
import { CloudinaryImageField } from './CloudinaryImageField';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Calendar,
  Clock,
  User,
  Tag,
  Search,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FileText,
} from 'lucide-react';

interface ArticlesTabProps {
  articles: Article[];
  onUpdateArticle: (article: Article) => void;
  onAddArticle: (article: Omit<Article, 'id'>) => void;
  onDeleteArticle: (articleId: string) => void;
  onNotify?: (msg: string) => void;
}

const CATEGORY_PRESETS = [
  'Katering Kantor',
  'Higienitas & Halal',
  'Event & Seminar',
  'Kuliner Nusantara',
  'Info & Pengumuman',
];

const SAMPLE_IMAGE_PRESETS = [
  {
    label: 'Makan Siang Kantor',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Dapur Higienis',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Seminar & Meeting',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Paru Balado / Nusantara',
    url: 'https://res.cloudinary.com/xhzjg0n0/image/upload/f_auto,q_auto/v1788335914/asasora/bdkhax7wror6ws4nmjii.jpg',
  },
];

export const ArticlesTab: React.FC<ArticlesTabProps> = ({
  articles,
  onUpdateArticle,
  onAddArticle,
  onDeleteArticle,
  onNotify,
}) => {
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  // Form states for new article
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Katering Kantor');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [author, setAuthor] = useState('Tim Nutrisi & HRD Solution Asasora');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${today.getDate().toString().padStart(2, '0')} ${months[today.getMonth()]} ${today.getFullYear()}`;
  });
  const [readTime, setReadTime] = useState('4 menit baca');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tagsInput, setTagsInput] = useState('katering harian karyawan Tangerang, catering makan siang kantor');

  const addRef = useRef<HTMLDivElement | null>(null);
  const editRef = useRef<HTMLDivElement | null>(null);

  const showNotification = (msg: string) => {
    if (onNotify) {
      onNotify(msg);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleStartAdd = () => {
    setEditingArticle(null);
    setArticleToDelete(null);
    setIsAdding(true);
    setTimeout(() => {
      addRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleStartEdit = (art: Article) => {
    setIsAdding(false);
    setArticleToDelete(null);
    setEditingArticle({ ...art });
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalSlug = generateSlug(title) || `artikel-${Date.now()}`;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onAddArticle({
      slug: finalSlug,
      title: title.trim(),
      category: category.trim() || 'Katering Kantor',
      excerpt: excerpt.trim() || title.trim(),
      content: content.trim() || excerpt.trim() || title.trim(),
      image:
        image.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
      author: author.trim() || 'Tim Asasora Food',
      date: date.trim() || '05 September 2026',
      readTime: readTime.trim() || '3 menit baca',
      isFeatured: !!isFeatured,
      tags: tags.length > 0 ? tags : ['katering kantor', 'Asasora Food'],
    });

    setIsAdding(false);
    setTitle('');
    setExcerpt('');
    setContent('');
    setImage('');
    setIsFeatured(false);
    showNotification('✅ Artikel baru berhasil dipublikasikan!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title.trim()) return;

    onUpdateArticle({
      ...editingArticle,
      slug: editingArticle.slug || generateSlug(editingArticle.title),
    });

    setEditingArticle(null);
    showNotification('✅ Perubahan artikel berhasil disimpan!');
  };

  const handleConfirmDelete = () => {
    if (!articleToDelete) return;
    onDeleteArticle(articleToDelete.id);
    showNotification(`🗑️ Artikel "${articleToDelete.title}" telah dihapus.`);
    setArticleToDelete(null);
  };

  const filteredArticles = articles.filter((art) => {
    const matchesCategory =
      categoryFilter === 'all' || art.category === categoryFilter;
    const query = searchFilter.toLowerCase().trim();
    const matchesQuery =
      !query ||
      art.title.toLowerCase().includes(query) ||
      art.excerpt.toLowerCase().includes(query) ||
      art.content.toLowerCase().includes(query) ||
      (art.tags && art.tags.some((t) => t.toLowerCase().includes(query)));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#2E6F40] text-white rounded-xl shadow-xs">
              <BookOpen className="w-5 h-5 text-[#F3C623]" />
            </span>
            <h4 className="font-extrabold text-gray-900 text-base sm:text-lg">
              Manajemen Artikel & Berita Katering
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Tulis, edit, dan kelola artikel edukatif seputar katering kantor, higienitas halal, dan tips konsumsi event di Tangerang. Terintegrasi langsung dengan database & sinkronisasi otomatis.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="bg-[#2E6F40] hover:bg-emerald-800 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#F3C623]" />
          <span>Tulis Artikel Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-gray-500 shrink-0">Kategori:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-gray-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#2E6F40] outline-none"
          >
            <option value="all">Semua Kategori ({articles.length})</option>
            {CATEGORY_PRESETS.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({articles.filter((a) => a.category === cat).length})
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cari judul atau topik..."
            className="w-full text-xs font-medium pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2E6F40] outline-none"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ADD NEW ARTICLE FORM */}
      {isAdding && (
        <div
          ref={addRef}
          className="bg-emerald-50/40 border-2 border-emerald-400 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <h5 className="font-extrabold text-[#2E6F40] text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Tulis Artikel Edukasi / Berita Baru</span>
            </h5>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Title */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  Judul Artikel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: 5 Tips Memilih Katering Makan Siang Kantor di Tangerang"
                  className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#2E6F40] outline-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  Kategori
                </label>
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#2E6F40] outline-none"
                  >
                    {CATEGORY_PRESETS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Ringkasan / Excerpt (Muncul pada kartu artikel)
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Tuliskan 1-2 kalimat ringkas yang memikat calon klien (HRD/GA/EO)..."
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#2E6F40] outline-none"
              />
            </div>

            {/* Full Content */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700">
                  Isi Lengkap Artikel <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-500">
                  Gunakan paragraf dan poin penomoran (1, 2, 3) secara teratur.
                </span>
              </div>
              <textarea
                rows={8}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan ulasan, penjelasan menu, tips higienitas, atau panduan pemesanan katering secara lengkap di sini..."
                className="w-full text-xs sm:text-sm font-sans p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#2E6F40] outline-none leading-relaxed"
              />
            </div>

            {/* Image URL & Presets */}
            <div className="space-y-2">
              <CloudinaryImageField
                label="URL Gambar Sampul (Cover Image)"
                value={image}
                onChange={(val) => setImage(val)}
                placeholder="https://... atau unggah foto dari Cloudinary"
              />
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600">
                <span className="font-bold">Preset Cepat:</span>
                {SAMPLE_IMAGE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(p.url)}
                    className="px-2 py-0.5 bg-white hover:bg-emerald-50 border border-gray-200 rounded-lg text-emerald-800 font-semibold transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Meta Row (Author, Date, ReadTime, Featured, Tags) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-gray-200">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Penulis / Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Tanggal Publikasi
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Estimasi Baca
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="Contoh: 4 menit baca"
                  className="w-full text-xs p-2 rounded-lg border border-gray-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="isFeaturedNew"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#2E6F40] rounded focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="isFeaturedNew"
                  className="text-xs font-bold text-gray-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Jadikan Artikel Pilihan</span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <span>Kata Kunci / Tags (pisahkan dengan koma)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="katering harian karyawan Tangerang, catering makan siang kantor, Halal BPJPH"
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-300 bg-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-[#2E6F40] hover:bg-emerald-800 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#F3C623]" />
                <span>Simpan & Terbitkan Artikel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT ARTICLE FORM */}
      {editingArticle && (
        <div
          ref={editRef}
          className="bg-amber-50/40 border-2 border-amber-400 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <h5 className="font-extrabold text-amber-900 text-base flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-600" />
              <span>Edit Artikel: "{editingArticle.title}"</span>
            </h5>
            <button
              type="button"
              onClick={() => setEditingArticle(null)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  Judul Artikel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingArticle.title}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, title: e.target.value })
                  }
                  className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  Kategori
                </label>
                <select
                  value={editingArticle.category}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, category: e.target.value })
                  }
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {CATEGORY_PRESETS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Ringkasan / Excerpt
              </label>
              <textarea
                rows={2}
                value={editingArticle.excerpt}
                onChange={(e) =>
                  setEditingArticle({ ...editingArticle, excerpt: e.target.value })
                }
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-300 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Isi Lengkap Artikel <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={8}
                required
                value={editingArticle.content}
                onChange={(e) =>
                  setEditingArticle({ ...editingArticle, content: e.target.value })
                }
                className="w-full text-xs sm:text-sm font-sans p-3 rounded-xl border border-gray-300 bg-white leading-relaxed"
              />
            </div>

            <CloudinaryImageField
              label="URL Gambar Sampul (Cover Image)"
              value={editingArticle.image}
              onChange={(val) =>
                setEditingArticle({ ...editingArticle, image: val })
              }
              placeholder="https://... atau unggah foto dari Cloudinary"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-gray-200">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Penulis / Author
                </label>
                <input
                  type="text"
                  value={editingArticle.author}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, author: e.target.value })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Tanggal Publikasi
                </label>
                <input
                  type="text"
                  value={editingArticle.date}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, date: e.target.value })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Estimasi Baca
                </label>
                <input
                  type="text"
                  value={editingArticle.readTime}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, readTime: e.target.value })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-gray-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="isFeaturedEdit"
                  checked={!!editingArticle.isFeatured}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      isFeatured: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-amber-600 rounded focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="isFeaturedEdit"
                  className="text-xs font-bold text-gray-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Jadikan Artikel Pilihan</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <span>Kata Kunci / Tags (pisahkan dengan koma)</span>
              </label>
              <input
                type="text"
                value={(editingArticle.tags || []).join(', ')}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean);
                  setEditingArticle({ ...editingArticle, tags });
                }}
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-300 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ARTICLES LIST CARDS */}
      <div className="space-y-3">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Tidak ada artikel yang cocok dengan filter.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Coba ganti filter kategori atau kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          filteredArticles.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-gray-100 bg-stone-100"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="bg-emerald-50 text-[#2E6F40] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {art.category}
                    </span>
                    {art.isFeatured && (
                      <span className="bg-[#F3C623] text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Pilihan</span>
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400">•</span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-700" />
                      {art.date}
                    </span>
                    <span className="text-[11px] text-gray-400">•</span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {art.readTime}
                    </span>
                  </div>

                  <h5 className="font-extrabold text-sm sm:text-base text-gray-900 line-clamp-1">
                    {art.title}
                  </h5>

                  <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                    {art.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      {art.author}
                    </span>
                    {art.tags && art.tags.slice(0, 3).map((tg, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-md"
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setPreviewArticle(art)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:text-[#2E6F40] hover:bg-emerald-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Pratinjau Artikel"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartEdit(art)}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Edit Artikel"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setArticleToDelete(art)}
                  className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Hapus Artikel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL (Safe for iframe) */}
      {articleToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-red-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="font-black text-gray-900 text-base">
                Konfirmasi Hapus Artikel
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus artikel berikut secara permanen?
              </p>
              <p className="text-xs font-extrabold text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 line-clamp-2">
                "{articleToDelete.title}"
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK PREVIEW MODAL */}
      {previewArticle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewArticle(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="bg-emerald-50 text-[#2E6F40] text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                {previewArticle.category}
              </span>
              <button
                onClick={() => setPreviewArticle(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-black text-gray-900 leading-snug">
              {previewArticle.title}
            </h3>

            <div className="rounded-xl overflow-hidden aspect-video bg-stone-100 border border-gray-200">
              <img
                src={previewArticle.image}
                alt={previewArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl text-xs font-semibold text-emerald-950 leading-relaxed border-l-4 border-[#2E6F40]">
              {previewArticle.excerpt}
            </div>

            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {previewArticle.content}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
