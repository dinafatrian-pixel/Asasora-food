import { ShippingMethod } from '../types';

export const WAREHOUSE_ORIGIN = {
  name: 'Gudang Pusat Asasora Tangerang',
  lat: -6.1783,
  lng: 106.6319,
  address:
    'Jl. Irigasi sipon Tanah Tinggi Gg. Jambu 2 RT 004 RW 06 Kel. Buaran Indah Kec. Tangerang, Kota Tangerang, Banten',
};

export interface CalculatedCourierOption extends ShippingMethod {
  calculatedFare: number;
  isAvailable: boolean;
  statusText?: string;
  badgeColor?: string;
}

export const QUICK_LOCATION_PRESETS = [
  { name: 'Tangerang Kota (Pasar Anyar)', lat: -6.1738, lng: 106.6305 },
  { name: 'Cipondoh / Poris', lat: -6.1852, lng: 106.6698 },
  { name: 'Karawaci / Lippo', lat: -6.2255, lng: 106.6082 },
  { name: 'BSD City / Serpong', lat: -6.3015, lng: 106.6534 },
  { name: 'Bintaro Jaya Sektor 9', lat: -6.2825, lng: 106.7118 },
  { name: 'Cengkareng / Kalideres', lat: -6.1558, lng: 106.7118 },
  { name: 'Kebon Jeruk / Slipi', lat: -6.1914, lng: 106.7761 },
  { name: 'Sudirman / Thamrin Jakpus', lat: -6.2088, lng: 106.8228 },
  { name: 'Kebayoran / Blok M Jaksel', lat: -6.2443, lng: 106.7992 },
  { name: 'Margonda / Depok', lat: -6.3728, lng: 106.8335 },
  { name: 'Harapan Indah Bekasi', lat: -6.185, lng: 106.98 },
  { name: 'Bogor Kota (Kebun Raya)', lat: -6.595, lng: 106.79 },
];

export interface LocationDirectoryItem {
  keywords: string[];
  name: string;
  lat: number;
  lng: number;
  region: string;
}

export const INDONESIA_LOCATION_DIRECTORY: LocationDirectoryItem[] = [
  // --- TANGERANG KOTA (AREA UTAMA GUDANG ASASORA) ---
  { keywords: ['tanah tinggi', 'irigasi sipon', 'buaran indah'], name: 'Tanah Tinggi / Buaran Indah Tangerang', lat: -6.1783, lng: 106.6319, region: 'Tangerang Kota' },
  { keywords: ['cikokol', 'tangcity', 'modernland', 'babakan'], name: 'Cikokol / Modernland Tangerang', lat: -6.1985, lng: 106.6385, region: 'Tangerang Kota' },
  { keywords: ['cipondoh', 'poris', 'poris plawad', 'poris gaga', 'poris jaya', 'ketapang'], name: 'Cipondoh / Poris Tangerang', lat: -6.1852, lng: 106.6698, region: 'Tangerang Kota' },
  { keywords: ['pasar anyar', 'alun-alun tangerang', 'alun alun tangerang', 'sukaasih', 'sukasari'], name: 'Tangerang Kota (Pasar Anyar)', lat: -6.1738, lng: 106.6305, region: 'Tangerang Kota' },
  { keywords: ['karawaci', 'lippo karawaci', 'panunggangan barat'], name: 'Karawaci / Lippo Karawaci', lat: -6.2255, lng: 106.6082, region: 'Tangerang Kota' },
  { keywords: ['pinang', 'kunciran', 'kunciran jaya'], name: 'Pinang / Kunciran Tangerang', lat: -6.2201, lng: 106.6802, region: 'Tangerang Kota' },
  { keywords: ['alam sutera', 'alsut'], name: 'Alam Sutera Tangerang', lat: -6.2225, lng: 106.6542, region: 'Tangerang Kota' },
  { keywords: ['banjar wijaya'], name: 'Banjar Wijaya Tangerang', lat: -6.198, lng: 106.658, region: 'Tangerang Kota' },
  { keywords: ['green lake city', 'glc', 'gondrong'], name: 'Green Lake City / Gondrong', lat: -6.178, lng: 106.698, region: 'Tangerang Kota' },
  { keywords: ['batuceper', 'batu ceper'], name: 'Batuceper Tangerang', lat: -6.16, lng: 106.66, region: 'Tangerang Kota' },
  { keywords: ['bandara', 'soekarno hatta', 'soetta', 'benda', 'jurumudi'], name: 'Bandara Soekarno-Hatta / Benda', lat: -6.1275, lng: 106.6537, region: 'Tangerang Kota' },
  { keywords: ['neglasari', 'selapajang'], name: 'Neglasari Tangerang', lat: -6.155, lng: 106.62, region: 'Tangerang Kota' },
  { keywords: ['cibodas', 'cibodasari', 'uwung jaya'], name: 'Cibodas Tangerang', lat: -6.2, lng: 106.6, region: 'Tangerang Kota' },
  { keywords: ['jatiuwung', 'manis jaya', 'gandasari'], name: 'Jatiuwung Tangerang', lat: -6.205, lng: 106.58, region: 'Tangerang Kota' },
  { keywords: ['periuk', 'gebang raya'], name: 'Periuk Tangerang', lat: -6.17, lng: 106.59, region: 'Tangerang Kota' },

  // --- TANGERANG SELATAN ---
  { keywords: ['bsd', 'bsd city', 'bumi serpong damai'], name: 'BSD City / Bumi Serpong Damai', lat: -6.3015, lng: 106.6534, region: 'Tangerang Selatan' },
  { keywords: ['serpong utara', 'jelupang', 'pakulonan', 'pondok jagung'], name: 'Serpong Utara Tangsel', lat: -6.26, lng: 106.66, region: 'Tangerang Selatan' },
  { keywords: ['serpong', 'ciater', 'rawa buntu'], name: 'Serpong Tangsel', lat: -6.315, lng: 106.668, region: 'Tangerang Selatan' },
  { keywords: ['bintaro', 'bintaro jaya', 'sektor 9', 'sektor 7', 'sektor 3', 'sektor 1', 'sektor 2', 'sektor 4', 'sektor 5', 'sektor 6', 'sektor 8'], name: 'Bintaro Jaya Tangsel', lat: -6.2825, lng: 106.7118, region: 'Tangerang Selatan' },
  { keywords: ['pondok aren', 'jurang mangu', 'jurangmangu', 'perigi'], name: 'Pondok Aren / Jurang Mangu', lat: -6.275, lng: 106.705, region: 'Tangerang Selatan' },
  { keywords: ['ciputat', 'ciputat timur', 'cireundeu', 'pisangan'], name: 'Ciputat Tangsel', lat: -6.3117, lng: 106.7497, region: 'Tangerang Selatan' },
  { keywords: ['pamulang', 'benda baru', 'pondok benda'], name: 'Pamulang Tangsel', lat: -6.345, lng: 106.732, region: 'Tangerang Selatan' },
  { keywords: ['rempoa', 'pondok ranji', 'bintaro timur'], name: 'Rempoa / Pondok Ranji Tangsel', lat: -6.29, lng: 106.755, region: 'Tangerang Selatan' },
  { keywords: ['graha raya'], name: 'Graha Raya Bintaro', lat: -6.24, lng: 106.69, region: 'Tangerang Selatan' },
  { keywords: ['setu tangsel', 'muncul', 'babakan setu'], name: 'Setu / Muncul Tangsel', lat: -6.35, lng: 106.67, region: 'Tangerang Selatan' },

  // --- KABUPATEN TANGERANG ---
  { keywords: ['gading serpong', 'kelapa dua', 'curug sangereng', 'bojong nangka'], name: 'Gading Serpong / Kelapa Dua', lat: -6.2418, lng: 106.6288, region: 'Kabupaten Tangerang' },
  { keywords: ['citra raya', 'cikupa', 'talaga sari'], name: 'Citra Raya / Cikupa', lat: -6.245, lng: 106.52, region: 'Kabupaten Tangerang' },
  { keywords: ['curug', 'kadu'], name: 'Curug Tangerang', lat: -6.255, lng: 106.54, region: 'Kabupaten Tangerang' },
  { keywords: ['balaraja', 'talagasari'], name: 'Balaraja Tangerang', lat: -6.195, lng: 106.45, region: 'Kabupaten Tangerang' },
  { keywords: ['pasar kemis', 'pasarkemis', 'kutabumi', 'kuta bumi', 'gelam jaya'], name: 'Pasar Kemis / Kutabumi', lat: -6.17, lng: 106.55, region: 'Kabupaten Tangerang' },
  { keywords: ['rajeg'], name: 'Rajeg Tangerang', lat: -6.11, lng: 106.51, region: 'Kabupaten Tangerang' },
  { keywords: ['sepatan', 'sepatan timur'], name: 'Sepatan Tangerang', lat: -6.12, lng: 106.57, region: 'Kabupaten Tangerang' },
  { keywords: ['teluknaga', 'kampung melayu barat'], name: 'Teluknaga Tangerang', lat: -6.085, lng: 106.635, region: 'Kabupaten Tangerang' },
  { keywords: ['kosambi', 'dadap', 'salembaran'], name: 'Kosambi / Dadap Tangerang', lat: -6.09, lng: 106.69, region: 'Kabupaten Tangerang' },
  { keywords: ['tigaraksa'], name: 'Tigaraksa (Puspemkot Tangerang)', lat: -6.26, lng: 106.48, region: 'Kabupaten Tangerang' },
  { keywords: ['legok', 'parung panjang'], name: 'Legok Tangerang', lat: -6.29, lng: 106.59, region: 'Kabupaten Tangerang' },

  // --- JAKARTA BARAT ---
  { keywords: ['kalideres', 'semanan', 'tegal alur', 'kamal'], name: 'Kalideres / Semanan Jakarta Barat', lat: -6.151, lng: 106.705, region: 'Jakarta Barat' },
  { keywords: ['cengkareng', 'daan mogot', 'rawabuaya', 'rawa buaya', 'kapuk cengkareng'], name: 'Cengkareng / Daan Mogot Jakarta Barat', lat: -6.1558, lng: 106.7118, region: 'Jakarta Barat' },
  { keywords: ['puri kembangan', 'puri indah', 'kembangan', 'kembangan selatan'], name: 'Puri Indah / Kembangan Jakarta Barat', lat: -6.1878, lng: 106.7356, region: 'Jakarta Barat' },
  { keywords: ['meruya', 'joglo', 'srengseng', 'meruya utara', 'meruya selatan'], name: 'Meruya / Joglo Jakarta Barat', lat: -6.21, lng: 106.74, region: 'Jakarta Barat' },
  { keywords: ['kebon jeruk', 'kedoya', 'duri kepa', 'sukabumi utara'], name: 'Kebon Jeruk / Kedoya Jakarta Barat', lat: -6.1914, lng: 106.7761, region: 'Jakarta Barat' },
  { keywords: ['palmerah', 'slipi', 'kemanggisan'], name: 'Palmerah / Slipi Jakarta Barat', lat: -6.2025, lng: 106.7975, region: 'Jakarta Barat' },
  { keywords: ['grogol', 'petamburan', 'tanjung duren', 'tomang', 'roxy', 'central park'], name: 'Grogol / Tanjung Duren Jakarta Barat', lat: -6.168, lng: 106.788, region: 'Jakarta Barat' },
  { keywords: ['taman sari', 'glodok', 'kota tua', 'mangga besar'], name: 'Glodok / Taman Sari Jakarta Barat', lat: -6.14, lng: 106.815, region: 'Jakarta Barat' },
  { keywords: ['tambora', 'jembatan lima', 'angke', 'krendang'], name: 'Tambora Jakarta Barat', lat: -6.148, lng: 106.8, region: 'Jakarta Barat' },

  // --- JAKARTA SELATAN ---
  { keywords: ['scbd', 'senopati', 'blok m', 'kebayoran baru', 'senayan', 'gunawarman'], name: 'SCBD / Senayan / Kebayoran Baru Jakarta Selatan', lat: -6.2443, lng: 106.7992, region: 'Jakarta Selatan' },
  { keywords: ['kebayoran lama', 'cipulir', 'tanah kusir', 'pondok pinang'], name: 'Kebayoran Lama Jakarta Selatan', lat: -6.238, lng: 106.775, region: 'Jakarta Selatan' },
  { keywords: ['pondok indah', 'lebak bulus', 'poins square'], name: 'Pondok Indah / Lebak Bulus Jakarta Selatan', lat: -6.275, lng: 106.782, region: 'Jakarta Selatan' },
  { keywords: ['cilandak', 'fatmawati', 'tb simatupang', 'simatupang'], name: 'Cilandak / TB Simatupang Jakarta Selatan', lat: -6.295, lng: 106.8, region: 'Jakarta Selatan' },
  { keywords: ['kemang', 'bangka', 'pela mampang'], name: 'Kemang / Bangka Jakarta Selatan', lat: -6.26, lng: 106.815, region: 'Jakarta Selatan' },
  { keywords: ['mampang', 'mampang prapatan', 'duren tiga'], name: 'Mampang Prapatan Jakarta Selatan', lat: -6.245, lng: 106.825, region: 'Jakarta Selatan' },
  { keywords: ['kuningan', 'rasuna said', 'setiabudi', 'karet kuningan', 'mega kuningan'], name: 'Kuningan / Setiabudi Jakarta Selatan', lat: -6.22, lng: 106.83, region: 'Jakarta Selatan' },
  { keywords: ['tebet', 'tebet barat', 'tebet timur', 'manggarai'], name: 'Tebet Jakarta Selatan', lat: -6.235, lng: 106.85, region: 'Jakarta Selatan' },
  { keywords: ['pancoran', 'kalibata', 'pengadegan'], name: 'Pancoran / Kalibata Jakarta Selatan', lat: -6.25, lng: 106.85, region: 'Jakarta Selatan' },
  { keywords: ['pasar minggu', 'pejaten', 'ragunan', 'kebagusan'], name: 'Pasar Minggu / Pejaten Jakarta Selatan', lat: -6.285, lng: 106.84, region: 'Jakarta Selatan' },
  { keywords: ['jagakarsa', 'lenteng agung', 'srengseng sawah', 'tanjung barat'], name: 'Jagakarsa / Lenteng Agung Jakarta Selatan', lat: -6.325, lng: 106.835, region: 'Jakarta Selatan' },

  // --- JAKARTA PUSAT ---
  { keywords: ['sudirman', 'thamrin', 'bundaran hi', 'mh thamrin', 'jenderal sudirman'], name: 'Sudirman / Thamrin Jakarta Pusat', lat: -6.2088, lng: 106.8228, region: 'Jakarta Pusat' },
  { keywords: ['tanah abang', 'benhil', 'bendungan hilir', 'petamburan'], name: 'Tanah Abang / Benhil Jakarta Pusat', lat: -6.195, lng: 106.815, region: 'Jakarta Pusat' },
  { keywords: ['gambir', 'monas', 'balai kota', 'kebon sirih'], name: 'Gambir / Monas Jakarta Pusat', lat: -6.175, lng: 106.828, region: 'Jakarta Pusat' },
  { keywords: ['menteng', 'cikini', 'gondangdia'], name: 'Menteng / Cikini Jakarta Pusat', lat: -6.195, lng: 106.838, region: 'Jakarta Pusat' },
  { keywords: ['senen', 'kramat', 'kwitang'], name: 'Senen / Kramat Jakarta Pusat', lat: -6.185, lng: 106.845, region: 'Jakarta Pusat' },
  { keywords: ['cempaka putih', 'rawasari'], name: 'Cempaka Putih Jakarta Pusat', lat: -6.18, lng: 106.87, region: 'Jakarta Pusat' },
  { keywords: ['kemayoran', 'gunung sahari'], name: 'Kemayoran Jakarta Pusat', lat: -6.16, lng: 106.85, region: 'Jakarta Pusat' },
  { keywords: ['sawah besar', 'pasar baru', 'kartini'], name: 'Sawah Besar / Pasar Baru Jakarta Pusat', lat: -6.16, lng: 106.83, region: 'Jakarta Pusat' },
  { keywords: ['johar baru', 'galur', 'kampung rawa'], name: 'Johar Baru Jakarta Pusat', lat: -6.185, lng: 106.86, region: 'Jakarta Pusat' },

  // --- JAKARTA UTARA ---
  { keywords: ['pantai indah kapuk', 'pik', 'pluit', 'muara karang', 'kamal muara'], name: 'Pantai Indah Kapuk (PIK) / Pluit Jakarta Utara', lat: -6.115, lng: 106.76, region: 'Jakarta Utara' },
  { keywords: ['penjaringan', 'pejagalan'], name: 'Penjaringan Jakarta Utara', lat: -6.128, lng: 106.78, region: 'Jakarta Utara' },
  { keywords: ['pademangan', 'ancol'], name: 'Ancol / Pademangan Jakarta Utara', lat: -6.13, lng: 106.835, region: 'Jakarta Utara' },
  { keywords: ['tanjung priok', 'sungai bambu', 'warakas'], name: 'Tanjung Priok Jakarta Utara', lat: -6.125, lng: 106.885, region: 'Jakarta Utara' },
  { keywords: ['kelapa gading', 'mall kelapa gading'], name: 'Kelapa Gading Jakarta Utara', lat: -6.158, lng: 106.905, region: 'Jakarta Utara' },
  { keywords: ['sunter', 'sunter agung', 'sunter jaya'], name: 'Sunter Jakarta Utara', lat: -6.145, lng: 106.87, region: 'Jakarta Utara' },
  { keywords: ['koja', 'cilincing', 'marunda', 'rorotan'], name: 'Cilincing / Koja Jakarta Utara', lat: -6.12, lng: 106.93, region: 'Jakarta Utara' },

  // --- JAKARTA TIMUR ---
  { keywords: ['matraman', 'utan kayu', 'pisangan baru'], name: 'Matraman Jakarta Timur', lat: -6.2, lng: 106.86, region: 'Jakarta Timur' },
  { keywords: ['rawamangun', 'pulogadung', 'kayu putih'], name: 'Rawamangun / Pulogadung Jakarta Timur', lat: -6.195, lng: 106.89, region: 'Jakarta Timur' },
  { keywords: ['jatinegara', 'kampung melayu', 'bidara cina', 'cipinang'], name: 'Jatinegara / Cipinang Jakarta Timur', lat: -6.22, lng: 106.87, region: 'Jakarta Timur' },
  { keywords: ['duren sawit', 'pondok kelapa', 'pondok bambu', 'klender'], name: 'Duren Sawit / Pondok Kelapa Jakarta Timur', lat: -6.23, lng: 106.92, region: 'Jakarta Timur' },
  { keywords: ['cawang', 'cililitan', 'kramat jati'], name: 'Cawang / Cililitan Jakarta Timur', lat: -6.265, lng: 106.87, region: 'Jakarta Timur' },
  { keywords: ['halim', 'makasar', 'pinang ranti'], name: 'Halim Perdanakusuma Jakarta Timur', lat: -6.26, lng: 106.89, region: 'Jakarta Timur' },
  { keywords: ['pasar rebo', 'ciracas', 'kelapa dua wetan'], name: 'Pasar Rebo / Ciracas Jakarta Timur', lat: -6.315, lng: 106.865, region: 'Jakarta Timur' },
  { keywords: ['cipayung', 'tmii', 'taman mini'], name: 'TMII / Cipayung Jakarta Timur', lat: -6.315, lng: 106.9, region: 'Jakarta Timur' },
  { keywords: ['cakung', 'pulo gebang', 'ujung menteng'], name: 'Cakung / Pulo Gebang Jakarta Timur', lat: -6.19, lng: 106.95, region: 'Jakarta Timur' },

  // --- DEPOK ---
  { keywords: ['margonda', 'beji', 'universitas indonesia', 'stasiun ui', 'pondok cina', 'kukusan'], name: 'Margonda / Beji Depok', lat: -6.3728, lng: 106.8335, region: 'Depok' },
  { keywords: ['pancoran mas', 'depok lama', 'mampang depok', 'ratujaya'], name: 'Pancoran Mas Depok', lat: -6.395, lng: 106.815, region: 'Depok' },
  { keywords: ['sukmajaya', 'depok timur', 'depok 2', 'baktijaya'], name: 'Sukmajaya / Depok Timur', lat: -6.39, lng: 106.845, region: 'Depok' },
  { keywords: ['cilodong', 'kalimulya', 'kalibaru'], name: 'Cilodong Depok', lat: -6.425, lng: 106.84, region: 'Depok' },
  { keywords: ['cimanggis', 'kelapa dua depok', 'harjamukti', 'mekarsari'], name: 'Cimanggis Depok', lat: -6.365, lng: 106.87, region: 'Depok' },
  { keywords: ['tapos', 'sukatani', 'leuwinanggung'], name: 'Tapos Depok', lat: -6.415, lng: 106.89, region: 'Depok' },
  { keywords: ['sawangan', 'bojongsari', 'pengasinan', 'bedahan'], name: 'Sawangan / Bojongsari Depok', lat: -6.4, lng: 106.76, region: 'Depok' },
  { keywords: ['cinere', 'gandul', 'limo', 'pangkalan jati'], name: 'Cinere / Limo Depok', lat: -6.325, lng: 106.785, region: 'Depok' },

  // --- BOGOR ---
  { keywords: ['bogor kota', 'bogor tengah', 'kebun raya bogor', 'stasiun bogor', 'paledang'], name: 'Bogor Kota (Kebun Raya)', lat: -6.595, lng: 106.79, region: 'Bogor' },
  { keywords: ['baranangsiang', 'bogor timur', 'tajur'], name: 'Baranangsiang / Bogor Timur', lat: -6.605, lng: 106.815, region: 'Bogor' },
  { keywords: ['bogor barat', 'taman yasmin', 'bubulak'], name: 'Bogor Barat / Taman Yasmin', lat: -6.58, lng: 106.755, region: 'Bogor' },
  { keywords: ['bogor selatan', 'batutulis', 'cipaku'], name: 'Bogor Selatan', lat: -6.63, lng: 106.81, region: 'Bogor' },
  { keywords: ['bogor utara', 'kedunghalang', 'bantarjati'], name: 'Bogor Utara', lat: -6.56, lng: 106.82, region: 'Bogor' },
  { keywords: ['tanah sareal', 'kebon pedes'], name: 'Tanah Sareal Bogor', lat: -6.565, lng: 106.79, region: 'Bogor' },
  { keywords: ['cibinong', 'pemda cibinong', 'pakansari', 'nanggewer'], name: 'Cibinong Bogor', lat: -6.485, lng: 106.85, region: 'Bogor' },
  { keywords: ['sentul', 'sentul city', 'babakan madang'], name: 'Sentul City Bogor', lat: -6.545, lng: 106.87, region: 'Bogor' },
  { keywords: ['bojonggede', 'bojong gede'], name: 'Bojonggede Bogor', lat: -6.495, lng: 106.8, region: 'Bogor' },
  { keywords: ['cileungsi', 'gunung putri', 'cibubur'], name: 'Cileungsi / Gunung Putri / Cibubur', lat: -6.38, lng: 106.95, region: 'Bogor' },
  { keywords: ['parung', 'kemang bogor', 'ciseeng'], name: 'Parung Bogor', lat: -6.425, lng: 106.725, region: 'Bogor' },

  // --- BEKASI ---
  { keywords: ['bekasi barat', 'grand metropolitan', 'kranji', 'bintara'], name: 'Bekasi Barat / Kranji', lat: -6.235, lng: 106.985, region: 'Bekasi' },
  { keywords: ['bekasi selatan', 'pekayon', 'grand galaxy', 'galaxy bekasi', 'jakasetia'], name: 'Bekasi Selatan / Grand Galaxy', lat: -6.26, lng: 106.985, region: 'Bekasi' },
  { keywords: ['bekasi timur', 'terminal bekasi', 'duren jaya', 'aren jaya'], name: 'Bekasi Timur', lat: -6.255, lng: 107.015, region: 'Bekasi' },
  { keywords: ['bekasi utara', 'perwira', 'harapan jaya'], name: 'Bekasi Utara', lat: -6.215, lng: 107.01, region: 'Bekasi' },
  { keywords: ['harapan indah', 'medan satria', 'pejuang'], name: 'Kota Harapan Indah Bekasi', lat: -6.185, lng: 106.98, region: 'Bekasi' },
  { keywords: ['summarecon bekasi', 'marga mulya'], name: 'Summarecon Bekasi', lat: -6.225, lng: 107.0, region: 'Bekasi' },
  { keywords: ['pondok gede', 'jatiwaringin', 'jatibening', 'jatimakmur'], name: 'Pondok Gede / Jatiwaringin Bekasi', lat: -6.28, lng: 106.915, region: 'Bekasi' },
  { keywords: ['jatiasih', 'komsen', 'jatirasa'], name: 'Jatiasih Bekasi', lat: -6.3, lng: 106.96, region: 'Bekasi' },
  { keywords: ['jatisampurna', 'kranggan'], name: 'Jatisampurna Bekasi', lat: -6.34, lng: 106.93, region: 'Bekasi' },
  { keywords: ['rawalumbu', 'narogong', 'bojong menteng'], name: 'Rawalumbu / Narogong Bekasi', lat: -6.275, lng: 107.005, region: 'Bekasi' },
  { keywords: ['tambun', 'tambun selatan', 'tambun utara'], name: 'Tambun Bekasi', lat: -6.265, lng: 107.065, region: 'Bekasi' },
  { keywords: ['cikarang', 'cikarang barat', 'cikarang utara'], name: 'Cikarang Barat / Utara', lat: -6.285, lng: 107.135, region: 'Bekasi' },
  { keywords: ['lippo cikarang', 'cikarang selatan'], name: 'Lippo Cikarang', lat: -6.325, lng: 107.135, region: 'Bekasi' },
  { keywords: ['cikarang pusat', 'deltamas', 'kota deltamas'], name: 'Kota Deltamas / Cikarang Pusat', lat: -6.355, lng: 107.17, region: 'Bekasi' },

  // --- KOTA BESAR REGIONAL & PROVINSI ---
  { keywords: ['serang', 'kota serang'], name: 'Kota Serang Banten', lat: -6.115, lng: 106.155, region: 'Banten' },
  { keywords: ['cilegon'], name: 'Kota Cilegon Banten', lat: -6.015, lng: 106.05, region: 'Banten' },
  { keywords: ['pandeglang'], name: 'Pandeglang Banten', lat: -6.3083, lng: 106.1067, region: 'Banten' },
  { keywords: ['lebak', 'rangkasbitung'], name: 'Rangkasbitung Lebak Banten', lat: -6.355, lng: 106.2483, region: 'Banten' },
  { keywords: ['karawang', 'karawang barat', 'karawang timur'], name: 'Karawang Jawa Barat', lat: -6.305, lng: 107.305, region: 'Jawa Barat' },
  { keywords: ['bandung', 'kota bandung', 'cimahi', 'dago', 'buah batu'], name: 'Bandung Jawa Barat', lat: -6.9175, lng: 107.6191, region: 'Jawa Barat' },
  { keywords: ['cirebon'], name: 'Cirebon Jawa Barat', lat: -6.732, lng: 108.5523, region: 'Jawa Barat' },
  { keywords: ['semarang'], name: 'Semarang Jawa Tengah', lat: -6.9667, lng: 110.4167, region: 'Jawa Tengah' },
  { keywords: ['yogyakarta', 'jogja', 'sleman', 'bantul'], name: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695, region: 'DI Yogyakarta' },
  { keywords: ['solo', 'surakarta'], name: 'Solo / Surakarta Jawa Tengah', lat: -7.5666, lng: 110.8166, region: 'Jawa Tengah' },
  { keywords: ['surabaya', 'gubeng', 'rungkut'], name: 'Surabaya Jawa Timur', lat: -7.2575, lng: 112.7521, region: 'Jawa Timur' },
  { keywords: ['malang', 'batu'], name: 'Malang Jawa Timur', lat: -7.9797, lng: 112.6304, region: 'Jawa Timur' },
  { keywords: ['denpasar', 'kuta', 'seminyak', 'bali'], name: 'Denpasar Bali', lat: -8.6705, lng: 115.2126, region: 'Bali' },
  { keywords: ['medan'], name: 'Medan Sumatera Utara', lat: 3.5952, lng: 98.6722, region: 'Sumatera Utara' },
  { keywords: ['palembang'], name: 'Palembang Sumatera Selatan', lat: -2.9761, lng: 104.7754, region: 'Sumatera Selatan' },
  { keywords: ['lampung', 'bandar lampung'], name: 'Bandar Lampung', lat: -5.4292, lng: 105.2625, region: 'Lampung' },
  { keywords: ['makassar'], name: 'Makassar Sulawesi Selatan', lat: -5.1477, lng: 119.4327, region: 'Sulawesi Selatan' },

  // --- GENERAL REGIONAL FALLBACKS ---
  { keywords: ['jakarta pusat', 'jakpus'], name: 'Jakarta Pusat', lat: -6.1865, lng: 106.8341, region: 'Jakarta' },
  { keywords: ['jakarta selatan', 'jaksel'], name: 'Jakarta Selatan', lat: -6.2615, lng: 106.8106, region: 'Jakarta' },
  { keywords: ['jakarta barat', 'jakbar'], name: 'Jakarta Barat', lat: -6.1683, lng: 106.7588, region: 'Jakarta' },
  { keywords: ['jakarta timur', 'jaktim'], name: 'Jakarta Timur', lat: -6.225, lng: 106.9004, region: 'Jakarta' },
  { keywords: ['jakarta utara', 'jakut'], name: 'Jakarta Utara', lat: -6.1384, lng: 106.864, region: 'Jakarta' },
  { keywords: ['jakarta', 'dki jakarta'], name: 'DKI Jakarta', lat: -6.2088, lng: 106.8456, region: 'Jakarta' },
  { keywords: ['tangerang selatan', 'tangsel'], name: 'Tangerang Selatan', lat: -6.2888, lng: 106.7179, region: 'Banten' },
  { keywords: ['tangerang', 'kota tangerang'], name: 'Kota Tangerang', lat: -6.1783, lng: 106.6319, region: 'Banten' },
  { keywords: ['depok'], name: 'Kota Depok', lat: -6.4025, lng: 106.7942, region: 'Jawa Barat' },
  { keywords: ['bogor'], name: 'Kota Bogor', lat: -6.5971, lng: 106.806, region: 'Jawa Barat' },
  { keywords: ['bekasi'], name: 'Kota Bekasi', lat: -6.2383, lng: 106.9756, region: 'Jawa Barat' },
];

/**
 * Searches the built-in database for exact or substring matches against customer address text.
 * Prioritizes longer/more specific keyword matches (e.g., "bintaro sektor 9" before "tangerang").
 */
export function findLocationFromKnowledgeBase(addressText: string): LocationDirectoryItem | null {
  if (!addressText) return null;
  const normalized = addressText.toLowerCase();

  // Sort candidates by keyword length descending to match most specific sub-district first
  let bestMatch: { item: LocationDirectoryItem; keywordLength: number } | null = null;

  for (const item of INDONESIA_LOCATION_DIRECTORY) {
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        if (!bestMatch || kw.length > bestMatch.keywordLength) {
          bestMatch = { item, keywordLength: kw.length };
        }
      }
    }
  }

  return bestMatch ? bestMatch.item : null;
}

/**
 * Sanitizes Indonesian delivery addresses to improve geocoding accuracy by stripping
 * non-navigable noise such as house numbers, RT/RW, blocks, cluster names, and postal codes.
 */
export function sanitizeAddressForGeocoding(rawAddress: string): string {
  if (!rawAddress) return '';
  return rawAddress
    .replace(/\brt\s*\.?\s*\d+\s*(\/|dan)?\s*rw\s*\.?\s*\d+\b/gi, ' ')
    .replace(/\brt\s*\.?\s*\d+\b/gi, ' ')
    .replace(/\brw\s*\.?\s*\d+\b/gi, ' ')
    .replace(/\bno(mor|\.)?\s*\d+[\w/-]*/gi, ' ')
    .replace(/\bblok\s*[a-z0-9/-]+/gi, ' ')
    .replace(/\bkav(ling|\.)?\s*[a-z0-9/-]+/gi, ' ')
    .replace(/\bgang\s*[\w\s]+/gi, ' ')
    .replace(/\bgg\.\s*[\w\s]+/gi, ' ')
    .replace(/\bpatokan\s*:?.*$/gi, ' ')
    .replace(/\bkode\s*pos\s*:?\s*\d{5}\b/gi, ' ')
    .replace(/\b\d{5}\b/g, ' ')
    .replace(/[^\w\s,.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ResolvedAddressResult {
  lat: number;
  lng: number;
  locationName: string;
  source: 'database' | 'osm' | 'fallback';
}

/**
 * High-resilience address geocoder:
 * 1. Checks extensive offline knowledge base (instant & 100% reliable)
 * 2. Attempts OpenStreetMap Nominatim with cleaned address (timeout 3000ms)
 * 3. Falls back to best matching region coordinates so calculations NEVER freeze or fail!
 */
export async function resolveAddressToCoordinates(
  rawAddress: string,
  fallbackLat = -6.1738,
  fallbackLng = 106.6305
): Promise<ResolvedAddressResult> {
  const query = (rawAddress || '').trim();
  if (!query || query.length < 2) {
    return {
      lat: fallbackLat,
      lng: fallbackLng,
      locationName: 'Tangerang Kota (Default)',
      source: 'fallback',
    };
  }

  // 1. Instant check against comprehensive Indonesian location directory
  const dbMatch = findLocationFromKnowledgeBase(query);

  // 2. Try online OpenStreetMap Nominatim with sanitized query (3.5s timeout)
  const cleaned = sanitizeAddressForGeocoding(query);
  const searchTerms = [cleaned, query].filter(Boolean);

  for (const term of searchTerms) {
    if (term.length < 3) continue;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        term + ', Indonesia'
      )}&limit=1&addressdetails=1`;

      const resp = await fetch(url, {
        headers: { 'Accept-Language': 'id,en' },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (resp.ok) {
        const results = await resp.json();
        if (Array.isArray(results) && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          // Verify coordinates are within Indonesia approximate bounding box
          if (lat >= -11 && lat <= 6 && lon >= 95 && lon <= 141) {
            const shortName = results[0].display_name.split(',').slice(0, 3).join(',').trim();
            return {
              lat,
              lng: lon,
              locationName: shortName,
              source: 'osm',
            };
          }
        }
      }
    } catch {
      // Abort or network failure - seamlessly fallback to knowledge base
    }
  }

  // 3. If online search didn't return, return database match
  if (dbMatch) {
    return {
      lat: dbMatch.lat,
      lng: dbMatch.lng,
      locationName: `${dbMatch.name} (${dbMatch.region})`,
      source: 'database',
    };
  }

  // 4. Default fallback
  return {
    lat: fallbackLat,
    lng: fallbackLng,
    locationName: 'Tangerang Kota (Sekitar Gudang)',
    source: 'fallback',
  };
}

/**
 * Calculates distance in kilometers between two coordinates using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place precision
}

/**
 * Format currency to Indonesian Rupiah (e.g., Rp 35.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('IDR', 'Rp');
}

/**
 * Calculates accurate courier rate according to the specific prompt guidelines:
 * 
 * A. MOTOR/RODA DUA:
 * - Gojek Instan: Jarak * Rp 2.500 (Minimal Rp 12.000)
 * - Grab Instan: Jarak * Rp 2.600 (Minimal Rp 13.000)
 * - Lalamove Motor: Jarak * Rp 2.200 (Minimal Rp 10.000)
 * 
 * B. MOBIL/RODA EMPAT:
 * - GoCar: Jarak * Rp 4.500 (Minimal Rp 20.000)
 * - GrabCar: Jarak * Rp 4.700 (Minimal Rp 22.000)
 * - Lalamove Mobil: Jarak * Rp 5.000 (Minimal Rp 35.000)
 * 
 * C. KURIR TOKO (KHUSUS):
 * - Jarak < 5 Km = Rp 20.000
 * - Jarak 5 - 12 Km = Rp 35.000
 * - Jarak > 12 Km = "Di luar area Kurir Toko"
 */
export function calculateCourierTariff(
  methodId: string,
  distanceKm: number
): { fare: number; isAvailable: boolean; statusText?: string } {
  const dist = Math.max(0, distanceKm);

  switch (methodId) {
    // A. MOTOR / RODA DUA
    case 'gojek-motor':
    case 'gojek-instant':
      return {
        fare: Math.max(12000, Math.round(dist * 2500)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    case 'grab-motor':
    case 'grab-instant':
      return {
        fare: Math.max(13000, Math.round(dist * 2600)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    case 'lalamove-motor':
      return {
        fare: Math.max(10000, Math.round(dist * 2200)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    // B. MOBIL / RODA EMPAT
    case 'gocar-delivery':
    case 'gocar-instant':
      return {
        fare: Math.max(20000, Math.round(dist * 4500)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    case 'grab-car':
    case 'grabcar-instant':
      return {
        fare: Math.max(22000, Math.round(dist * 4700)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    case 'lalamove-car':
    case 'lalamove-van':
      return {
        fare: Math.max(35000, Math.round(dist * 5000)),
        isAvailable: dist <= 40,
        statusText: dist > 40 ? 'Melebihi batas maksimal 40 km' : undefined,
      };

    // C. KURIR TOKO (KHUSUS ASASORA)
    case 'toko-reguler':
    case 'kurir-toko':
      if (dist <= 0) {
        return { fare: 20000, isAvailable: true };
      }
      if (dist < 5) {
        return { fare: 20000, isAvailable: true, statusText: 'Tarif Flat Dekat (<5 Km)' };
      }
      if (dist <= 12) {
        return { fare: 35000, isAvailable: true, statusText: 'Tarif Reguler (5 - 12 Km)' };
      }
      return {
        fare: 35000,
        isAvailable: false,
        statusText: 'Di luar area Kurir Toko (Maks. 12 Km)',
      };

    default:
      // Generic fallback
      return {
        fare: Math.max(15000, Math.round(dist * 2500)),
        isAvailable: dist <= 40,
      };
  }
}

/**
 * Standard courier definitions
 */
export const STANDARD_COURIERS: ShippingMethod[] = [
  // A. KELOMPOK MOTOR / RODA DUA
  {
    id: 'gojek-motor',
    name: 'Gojek Instan (GoSend)',
    type: 'instan',
    vehicleType: 'motor',
    courierGroup: 'motor',
    courierProvider: 'gojek',
    baseFare: 12000,
    perKm: 2500,
    ratePerKm: 2500,
    minFare: 12000,
    minKm: 1,
    estimatedTime: '20 - 45 Menit',
    estTime: '20 - 45 Menit',
    description: '',
  },
  {
    id: 'grab-motor',
    name: 'Grab Instan (GrabExpress)',
    type: 'instan',
    vehicleType: 'motor',
    courierGroup: 'motor',
    courierProvider: 'grab',
    baseFare: 13000,
    perKm: 2600,
    ratePerKm: 2600,
    minFare: 13000,
    minKm: 1,
    estimatedTime: '20 - 45 Menit',
    estTime: '20 - 45 Menit',
    description: '',
  },
  {
    id: 'lalamove-motor',
    name: 'Lalamove Motor',
    type: 'instan',
    vehicleType: 'motor',
    courierGroup: 'motor',
    courierProvider: 'lalamove',
    baseFare: 10000,
    perKm: 2200,
    ratePerKm: 2200,
    minFare: 10000,
    minKm: 1,
    estimatedTime: '25 - 50 Menit',
    estTime: '25 - 50 Menit',
    description: '',
  },

  // B. KELOMPOK MOBIL / RODA EMPAT
  {
    id: 'gocar-delivery',
    name: 'GoCar Instant Delivery',
    type: 'instan',
    vehicleType: 'mobil',
    courierGroup: 'mobil',
    courierProvider: 'gojek',
    baseFare: 20000,
    perKm: 4500,
    ratePerKm: 4500,
    minFare: 20000,
    minKm: 1,
    estimatedTime: '35 - 60 Menit',
    estTime: '35 - 60 Menit',
    description: '',
  },
  {
    id: 'grab-car',
    name: 'GrabCar Delivery',
    type: 'instan',
    vehicleType: 'mobil',
    courierGroup: 'mobil',
    courierProvider: 'grab',
    baseFare: 22000,
    perKm: 4700,
    ratePerKm: 4700,
    minFare: 22000,
    minKm: 1,
    estimatedTime: '35 - 60 Menit',
    estTime: '35 - 60 Menit',
    description: '',
  },
  {
    id: 'lalamove-car',
    name: 'Lalamove Mobil (Van / MPV)',
    type: 'instan',
    vehicleType: 'mobil',
    courierGroup: 'mobil',
    courierProvider: 'lalamove',
    baseFare: 35000,
    perKm: 5000,
    ratePerKm: 5000,
    minFare: 35000,
    minKm: 1,
    estimatedTime: '45 - 90 Menit',
    estTime: '45 - 90 Menit',
    description: '',
  },

  // C. KURIR TOKO (KHUSUS)
  {
    id: 'toko-reguler',
    name: 'Kurir Toko Armada Asasora (Khusus)',
    type: 'toko',
    vehicleType: 'mobil',
    courierGroup: 'toko',
    courierProvider: 'toko',
    baseFare: 20000,
    perKm: 3500,
    ratePerKm: 3500,
    minFare: 20000,
    minKm: 1,
    estimatedTime: 'Terjadwal Dapur Asasora',
    estTime: 'Terjadwal Sesuai Acara',
    description: '',
  },
];

/**
 * Calculates shipping cost for a given method
 */
export function calculateShippingCost(
  method: ShippingMethod,
  distanceKm: number
): number {
  const result = calculateCourierTariff(method.id, distanceKm);
  return result.fare;
}

/**
 * Generates an Order ID with date and random suffix (e.g., ASR-20260829-8921)
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ASR-${year}${month}${day}-${rand}`;
}

/**
 * Generates formatted WhatsApp text for order confirmation & proof of payment
 */
export function generateOrderWhatsAppMessage(order: {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  items: Array<{ name: string; quantity: number; price: number; unit: string }>;
  shippingMethod: string;
  distanceKm: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentCode: string;
}): string {
  const itemListText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}*\n   ${item.quantity} ${item.unit} x ${formatRupiah(item.price)} = *${formatRupiah(item.quantity * item.price)}*`
    )
    .join('\n');

  const text = `*FORMULIR PESANAN RESMI PT. ASASORA BIO HEALTHORA*
==============================
📋 *Nomor Order:* \`${order.orderId}\`
🏷️ *Kode Pembayaran:* \`${order.paymentCode}\`
👤 *Nama Pemesan:* ${order.name}
📱 *No. WhatsApp:* ${order.phone}
📍 *Alamat Kirim:* ${order.address}
🚚 *Metode Pengiriman:* ${order.shippingMethod} (${order.distanceKm} km)

📦 *DAFTAR PESANAN:*
${itemListText}

💰 *RINCIAN PEMBAYARAN:*
• Subtotal Produk: ${formatRupiah(order.subtotal)}
• Ongkos Kirim: ${formatRupiah(order.shippingCost)}
*TOTAL KESELURUHAN: ${formatRupiah(order.total)}*

🏦 *REKENING PEMBAYARAN:*
Bank BCA: *4971531139*
A.N: *Dina Fatrian*

Halo MinSora, saya telah membuat pesanan dan melampirkan bukti transfer pembayaran berikut. Mohon diproses dan diverifikasi. Terima kasih! 🙏✨`;

  return encodeURIComponent(text);
}
