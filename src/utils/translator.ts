import { Language } from '../context/LanguageContext';
import { Product, ClientPartner, GalleryItem, LegalDocument } from '../types';

export const translateText = (text: string | undefined, lang: Language): string => {
  if (!text) return '';
  if (lang === 'id') return text;

  const dictionary: Record<string, string> = {
    // Categories
    'catering & event': 'Catering & Events',
    'Produk Siap Santap': 'Ready-to-Eat Products',
    'Snak dan cemilan': 'Snacks & Refreshments',
    'Semua Produk': 'All Products',

    // Product Names
    'Nasi Kotak Sehat Premium (Menu Halal Seimbang)': 'Premium Healthy Meal Box (Halal Balanced Menu)',
    'Nasi Tumpeng Mini Nusantara Asasora': 'Asasora Indonesian Mini Tumpeng Platter',
    'Paket Prasmanan Corporate & Gathering': 'Corporate Gathering Buffet Catering Package',
    'Healthy Nutrition & Diet Seimbang Box': 'Healthy Nutrition & Balanced Diet Box',
    'Snack Box Sehat Tradisional & Modern': 'Healthy Traditional & Modern Snack Box',

    // Product Descriptions
    'Nasi organik/merah, ayam bakar rempah madu, tumis brokoli wortel jamur, tahu sutra panggang, sambal bajak rendah minyak, dan buah segar potong.':
      'Organic/brown rice, honey-spiced roasted chicken, sauteed broccoli carrot & mushroom, grilled silken tofu, low-oil chili sauce, and fresh cut fruits.',
    'Tumpeng mini eksklusif dengan nasi kuning gurih alami kunyit, empal suwir balado, telur balado mini, perkedel kentang lembut, urap sayur segar, dan sambal goreng.':
      'Exclusive mini tumpeng with aromatic turmeric yellow rice, shredded spiced beef empal, mini boiled eggs in balado sauce, soft potato fritters, fresh seasoned vegetable urap, and fried chili.',
    'Layanan prasmanan lengkap dengan staf berseragam higienis, 5 pilihan menu utama, aneka sayuran organik, sop sehat, dessert puding buah, dan infused water.':
      'Full buffet catering service with hygienic uniformed staff, 5 main course selections, organic vegetables, healthy soup, fresh fruit pudding dessert, and infused water.',
    'Menu sehat rendah sodium, rendah minyak, kaya serat & protein seimbang yang dirancang untuk asupan gizi harian optimal dan kebugaran tubuh.':
      'Low-sodium, low-oil, high-fiber, balanced protein healthy menu designed for optimal daily nutritional intake and bodily fitness.',
    'Isi 3 macam kue higienis (Lemper ayam bakar, fruit tartlet rendah gula, pastel isi sayur ayam) + air mineral botol 330ml.':
      'Contains 3 hygienic pastries (Grilled chicken lemper, low-sugar fruit tartlet, chicken veggie pastel pastry) + 330ml bottled mineral water.',

    // Units
    'porsi / box': 'portion / box',
    'pax': 'pax',
    'porsi': 'portion',
    'box': 'box',

    // Badges
    'Best Seller Halal': 'Halal Best Seller',
    'Favorit Event': 'Event Favorite',
    'Layanan Korporat': 'Corporate Service',
    'Nutrisi Sehat': 'Healthy Nutrition',
    'Snack Event': 'Event Snack',

    // Client Types
    'BUMN / BUMD': 'State-Owned Enterprise',
    'Institusi Pendidikan': 'Educational Institution',
    'Perusahaan Swasta Nasional': 'National Private Enterprise',
    'Instansi Pemerintah': 'Government Agency',
    'Fasilitas Layanan Publik': 'Public Service Facility',

    // Gallery Titles & Captions
    'Standar Kebersihan Dapur Utama Asasora': 'Asasora Central Kitchen Hygiene Standards',
    'Pemeriksaan sanitasi peralatan memasak stainless steel, area persiapan makanan higienis, dan kepatuhan APD staf dapur.':
      'Stainless steel cookware sanitization inspection, hygienic food preparation area, and kitchen staff PPE compliance.',
    'Penyajian Nasi Box Acara Korporat': 'Corporate Event Meal Box Presentation',
    'Penataan ratusan porsi nasi kotak sehat dengan segel higienis untuk pertemuan formal perusahaan nasional.':
      'Arrangement of hundreds of healthy meal box portions with hygienic seals for national corporate formal meetings.',
    'Penyiapan Makanan Olahan Higienis': 'Hygienic Processed Food Preparation',
    'Proses pengemasan vakum dan kontrol suhu untuk menjaga kesegaran gizi masakan sehat siap saji.':
      'Vacuum packaging and temperature control processes to maintain the fresh nutrition of ready-to-eat healthy meals.',
    'Layanan Prasmanan Gathering Karyawan': 'Employee Gathering Buffet Catering Service',
    'Pelayanan prasmanan langsung dengan pemanas makanan stainless steel, pelindung sneeze-guard, dan staf profesional.':
      'Live buffet service equipped with stainless steel food warmers, sneeze-guards, and professional staff.',

    // Legal Documents
    'Sertifikat Halal Resmi BPJPH RI': 'Official BPJPH RI Halal Certificate',
    'Ketetapan Halal dari Badan Penyelenggara Jaminan Produk Halal (BPJPH) Kementerian Agama Republik Indonesia untuk seluruh menu & dapur pengolahan.':
      'Official Halal Decree from the Halal Product Assurance Organizing Agency (BPJPH) of the Ministry of Religious Affairs Republic of Indonesia for all menus and central kitchen processing.',
    'Nomor Induk Berusaha (NIB) Berbasis Risiko OSS': 'OSS Risk-Based Business Identification Number (NIB)',
    'Perizinan berusaha terintegrasi secara elektronik (OSS RBA) Kementerian Investasi/BKPM RI untuk aktivitas penyediaan jasa boga dan katering makanan halal.':
      'Electronically integrated business licensing (OSS RBA) from the Ministry of Investment/BKPM RI for the operation of food catering services and halal food services.',
    'Sertifikat Laik Higiene Sanitasi Jasaboga': 'Food Service Sanitation & Hygiene Certificate',
    'Sertifikasi kelaikan higienis dan sanitasi dapur dari Dinas Kesehatan Republik Indonesia, menjamin kebersihan pengolahan dari kontaminasi pangan.':
      'Hygiene and sanitation compliance certification from the Health Ministry of the Republic of Indonesia, ensuring clean processing from food contamination.',
    'Resmi & Aktif': 'Official & Active',
    'Terdaftar & Sah': 'Registered & Valid',
    'Kemenag RI': 'Ministry of Religious Affairs RI',
    'Kementerian Investasi / BKPM RI': 'Ministry of Investment / BKPM RI',
    'Dinas Kesehatan Republik Indonesia': 'Health Ministry of the Republic of Indonesia',
    'Berlaku Seumur Hidup': 'Valid Lifetime',
    'Berlaku Selama Usaha Berjalan': 'Valid During Business Operations',
    'Aktif & Terverifikasi Resmi': 'Active & Officially Verified',
    'Terverifikasi': 'Verified',
    'Baru saja': 'Just now',
    'Pelanggan Umum': 'General Customer',
    'Pribadi': 'Individual',
    'Umum': 'General',
    'Selesai': 'Completed',
    'Diproses': 'Processing',
    'Dikirim': 'Shipped',
    'Menunggu Pembayaran': 'Awaiting Payment',
    'Dibatalkan': 'Cancelled',
    'Senin - Minggu (06.00 - 21.00 WIB)': 'Monday - Sunday (06:00 - 21:00 WIB)',
    'Setiap Hari: 07.00 - 20.00 WIB (Bisa request jam khusus acara)': 'Daily: 07:00 - 20:00 WIB (Special event times available on request)',
    'Senin - Minggu (06:00 - 21:00 WIB)': 'Monday - Sunday (06:00 - 21:00 WIB)',
  };

  return dictionary[text.trim()] || text;
};

export const getLocalizedProduct = (product: Product, lang: Language): Product => {
  if (lang === 'id') return product;
  return {
    ...product,
    name: translateText(product.name, lang),
    description: translateText(product.description, lang),
    category: translateText(product.category, lang),
    unit: translateText(product.unit, lang),
    badge: product.badge ? translateText(product.badge, lang) : undefined,
  };
};

export const getLocalizedClient = (client: ClientPartner, lang: Language): ClientPartner => {
  if (lang === 'id') return client;
  return {
    ...client,
    type: translateText(client.type, lang),
  };
};

export const getLocalizedGallery = (item: GalleryItem, lang: Language): GalleryItem => {
  if (lang === 'id') return item;
  return {
    ...item,
    title: translateText(item.title, lang),
    caption: translateText(item.caption, lang),
  };
};

export const getLocalizedLegalDoc = (doc: LegalDocument, lang: Language): LegalDocument => {
  if (lang === 'id') return doc;
  return {
    ...doc,
    title: translateText(doc.title, lang),
    description: translateText(doc.description, lang),
    status: translateText(doc.status, lang),
    issuer: translateText(doc.issuer, lang),
    validUntil: translateText(doc.validUntil, lang),
  };
};
