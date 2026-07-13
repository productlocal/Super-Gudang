import { Product, Transaction, Supplier, Category, LocationRack } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { name: 'Koper', icon: 'Luggage', color: 'blue', count: 214 },
  { name: 'Batik', icon: 'Shirt', color: 'orange', count: 328 },
  { name: 'Ihram', icon: 'Layers', color: 'green', count: 186 },
  { name: 'Syal', icon: 'Wind', color: 'blue', count: 142 },
  { name: 'Buku Doa', icon: 'BookOpen', color: 'orange', count: 410 },
  { name: 'Gamis', icon: 'Shirt', color: 'green', count: 297 },
  { name: 'Outter', icon: 'Shirt', color: 'red', count: 165 },
  { name: 'Lainnya', icon: 'MoreHorizontal', color: 'blue', count: 100 },
];

export const INITIAL_LOCATIONS: LocationRack[] = [
  { rak: 'Rak A', label: 'Koper & Tas', pct: 68, color: '#2b6cb0' },
  { rak: 'Rak B', label: 'Batik & Gamis', pct: 82, color: '#319795' },
  { rak: 'Rak C', label: 'Ihram', pct: 55, color: '#dd6b20' },
  { rak: 'Rak D', label: 'Syal & Outter', pct: 41, color: '#38a169' },
  { rak: 'Rak E', label: 'Buku Doa', pct: 73, color: '#d69e2e' },
  { rak: 'Rak F', label: 'Lainnya', pct: 29, color: '#e53e3e' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { name: 'Paket Koper Umrah 24 inch', sku: 'SKU-KP-1001', category: 'Koper', stock: 214, min: 50, unit: 'set', location: 'Rak A-01', price: 385000, supplier: 'CV Koper Amanah' },
  { name: 'Trolley Bag Kabin 20 inch', sku: 'SKU-KP-1002', category: 'Koper', stock: 8, min: 30, unit: 'pcs', location: 'Rak A-04', price: 245000, supplier: 'CV Koper Amanah' },
  { name: 'Batik Seragam Umrah', sku: 'SKU-BT-2001', category: 'Batik', stock: 328, min: 100, unit: 'pcs', location: 'Rak B-02', price: 120000, supplier: 'UD Batik Pekalongan' },
  { name: 'Kain Ihram Pria Katun', sku: 'SKU-IH-3001', category: 'Ihram', stock: 186, min: 80, unit: 'set', location: 'Rak C-01', price: 95000, supplier: 'CV Barokah Tekstil' },
  { name: 'Sabuk Ihram + Kantong HP', sku: 'SKU-IH-3002', category: 'Ihram', stock: 15, min: 50, unit: 'pcs', location: 'Rak C-03', price: 45000, supplier: 'CV Barokah Tekstil' },
  { name: 'Syal Bordir Custom', sku: 'SKU-SY-4001', category: 'Syal', stock: 142, min: 40, unit: 'pcs', location: 'Rak D-02', price: 35000, supplier: 'CV Barokah Tekstil' },
  { name: 'Buku Doa Manasik Umrah', sku: 'SKU-BD-5001', category: 'Buku Doa', stock: 410, min: 100, unit: 'pcs', location: 'Rak E-01', price: 25000, supplier: 'PT Media Dakwah' },
  { name: 'Gamis Wanita Premium', sku: 'SKU-GM-6001', category: 'Gamis', stock: 297, min: 80, unit: 'pcs', location: 'Rak B-05', price: 175000, supplier: 'PT Rabbani Asysa' },
  { name: 'Outter Coat Jamaah', sku: 'SKU-OT-7001', category: 'Outter', stock: 12, min: 40, unit: 'pcs', location: 'Rak D-05', price: 210000, supplier: 'CV Outter Nusantara' },
  { name: 'Tas Sandal Serbaguna', sku: 'SKU-LN-8001', category: 'Lainnya', stock: 88, min: 30, unit: 'pcs', location: 'Rak F-02', price: 18000, supplier: 'PT Rabbani Asysa' },
  { name: 'Bantal Leher Travel', sku: 'SKU-LN-8002', category: 'Lainnya', stock: 6, min: 25, unit: 'pcs', location: 'Rak F-04', price: 32000, supplier: 'PT Rabbani Asysa' },
  { name: 'Peci Haji Putih', sku: 'SKU-LN-8003', category: 'Lainnya', stock: 145, min: 50, unit: 'pcs', location: 'Rak F-01', price: 22000, supplier: 'PT Rabbani Asysa' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'TRX-2607001', date: '13 Jul 2026', type: 'in', item: 'Kain Ihram Pria Katun', qty: 200, unit: 'set', party: 'CV Barokah Tekstil', user: 'Budi S.', notes: 'Restock kain ihram' },
  { id: 'TRX-2607002', date: '13 Jul 2026', type: 'out', item: 'Paket Koper Umrah 24 inch', qty: 45, unit: 'set', party: 'Rombongan Al-Hijaz', user: 'Andi P.', notes: 'Penyiapan keberangkatan' },
  { id: 'TRX-2607003', date: '13 Jul 2026', type: 'in', item: 'Gamis Wanita Premium', qty: 150, unit: 'pcs', party: 'PT Rabbani Asysa', user: 'Budi S.', notes: 'Kirim baru premium' },
  { id: 'TRX-2606048', date: '12 Jul 2026', type: 'out', item: 'Buku Doa Manasik Umrah', qty: 90, unit: 'pcs', party: 'Travel Safar Mabrur', user: 'Sari W.' },
  { id: 'TRX-2606047', date: '12 Jul 2026', type: 'in', item: 'Batik Seragam Umrah', qty: 120, unit: 'pcs', party: 'UD Batik Pekalongan', user: 'Budi S.' },
  { id: 'TRX-2606046', date: '11 Jul 2026', type: 'out', item: 'Syal Bordir Custom', qty: 60, unit: 'pcs', party: 'Rombongan An-Nur', user: 'Andi P.' },
  { id: 'TRX-2606045', date: '11 Jul 2026', type: 'in', item: 'Buku Doa Manasik Umrah', qty: 300, unit: 'pcs', party: 'PT Media Dakwah', user: 'Sari W.' },
  { id: 'TRX-2606044', date: '10 Jul 2026', type: 'out', item: 'Gamis Wanita Premium', qty: 55, unit: 'pcs', party: 'Travel Baitullah', user: 'Andi P.' },
  { id: 'TRX-2606043', date: '10 Jul 2026', type: 'in', item: 'Paket Koper Umrah 24 inch', qty: 80, unit: 'set', party: 'CV Koper Amanah', user: 'Budi S.' },
  { id: 'TRX-2606042', date: '09 Jul 2026', type: 'out', item: 'Outter Coat Jamaah', qty: 40, unit: 'pcs', party: 'Rombongan Al-Hijaz', user: 'Sari W.' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { name: 'CV Barokah Tekstil', contact: 'H. Ahmad Fauzi', phone: '021-8790-2200', category: 'Ihram & Syal', transactions: 38, status: 'active' },
  { name: 'PT Rabbani Asysa', contact: 'Ibu Nurul Hidayah', phone: '022-6120-8800', category: 'Gamis & Batik', transactions: 45, status: 'active' },
  { name: 'CV Koper Amanah', contact: 'Rudi Hartono', phone: '021-5567-1200', category: 'Koper', transactions: 29, status: 'active' },
  { name: 'UD Batik Pekalongan', contact: 'H. Slamet Riyadi', phone: '0285-421-900', category: 'Batik', transactions: 22, status: 'active' },
  { name: 'PT Media Dakwah', contact: 'Ustadz Hamzah', phone: '021-7234-5600', category: 'Buku Doa', transactions: 18, status: 'active' },
  { name: 'CV Outter Nusantara', contact: 'Dewi Anggraini', phone: '024-3345-7100', category: 'Outter', transactions: 11, status: 'inactive' },
];
