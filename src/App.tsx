import React, { useState, useMemo } from 'react';
import {
  Warehouse,
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Truck,
  Layers,
  MapPin,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Bell,
  Download,
  Plus,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Move,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  CheckCircle,
  Menu,
  ChevronRight,
  Tag,
  LogOut,
  Calendar,
  Layers2
} from 'lucide-react';

import { Product, Transaction, Supplier, Category, LocationRack } from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_LOCATIONS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_SUPPLIERS
} from './data';

export default function App() {
  // Page routing
  const [activePage, setActivePage] = useState<string>('dashboard');
  
  // Mobile UI controls
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Core App states
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [locations, setLocations] = useState<LocationRack[]>(INITIAL_LOCATIONS);

  // Settings states
  const [warehouseSettings, setWarehouseSettings] = useState({
    name: 'Gudang Perlengkapan Umrah - Jakarta',
    maxCapacity: 5000,
    unit: 'dus',
    address: 'Jl. Raya Condet No. 12, Kramat Jati, Jakarta Timur 13530',
    warningEnabled: true,
    emailNotifEnabled: true
  });

  // Filter states
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
  const [reportPeriod, setReportPeriod] = useState<string>('2026-07');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState<boolean>(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  
  // Form fields states
  const [txType, setTxType] = useState<'in' | 'out'>('in');
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    customCategory: '',
    stock: 0,
    min: 10,
    unit: 'pcs',
    location: 'Rak A-01',
    price: 0,
    supplier: ''
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    phone: '',
    category: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [newTransaction, setNewTransaction] = useState({
    productSku: '',
    qty: 0,
    party: '',
    notes: '',
    date: '2026-07-13'
  });

  // Toast feedback state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'info' | 'error'
  });

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Helper formats
  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const filterByCategory = (catName: string) => {
    setInventoryCategoryFilter(catName);
    setActivePage('inventory');
  };

  // Stock health status checker
  const getStockStatus = (stock: number, min: number) => {
    if (stock === 0) return { cls: 'bg-red-100 text-red-800 border-red-200', text: 'Habis', dot: 'bg-red-600' };
    if (stock <= min * 0.3) return { cls: 'bg-red-100 text-red-800 border-red-200', text: 'Kritis', dot: 'bg-red-500' };
    if (stock <= min) return { cls: 'bg-amber-100 text-amber-800 border-amber-200', text: 'Rendah', dot: 'bg-amber-500' };
    return { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'Normal', dot: 'bg-emerald-500' };
  };

  // Dynamic dashboard stats calculations
  const dashboardStats = useMemo(() => {
    const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStockCount = products.filter(p => p.stock <= p.min).length;
    
    // Simulate current month counts
    const incomingMonthCount = transactions
      .filter(t => t.type === 'in' && t.date.includes('2026-07'))
      .reduce((acc, t) => acc + t.qty, 0);
      
    const outgoingMonthCount = transactions
      .filter(t => t.type === 'out' && t.date.includes('2026-07'))
      .reduce((acc, t) => acc + t.qty, 0);

    return {
      totalStockCount,
      incomingMonthCount,
      outgoingMonthCount,
      lowStockCount
    };
  }, [products, transactions]);

  // Handle transaction creation (which alters products stock)
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const { productSku, qty, party, date, notes } = newTransaction;
    
    if (!productSku || qty <= 0 || !party) {
      triggerToast('Mohon lengkapi semua isian transaksi dengan benar.', 'error');
      return;
    }

    const matchedProductIndex = products.findIndex(p => p.sku === productSku);
    if (matchedProductIndex === -1) {
      triggerToast('Barang tidak ditemukan.', 'error');
      return;
    }

    const currentProduct = products[matchedProductIndex];
    if (txType === 'out' && currentProduct.stock < qty) {
      triggerToast(`Stok tidak mencukupi! Sisa stok saat ini: ${currentProduct.stock} ${currentProduct.unit}`, 'error');
      return;
    }

    // Modify product stock
    const updatedProducts = [...products];
    if (txType === 'in') {
      updatedProducts[matchedProductIndex].stock += qty;
    } else {
      updatedProducts[matchedProductIndex].stock -= qty;
    }
    setProducts(updatedProducts);

    // Create a new transaction log
    const txId = `TRX-${Date.now().toString().slice(-7)}`;
    const freshTx: Transaction = {
      id: txId,
      date: date ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '13 Jul 2026',
      type: txType,
      item: currentProduct.name,
      qty,
      unit: currentProduct.unit,
      party,
      user: 'Super Admin',
      notes: notes || undefined
    };

    setTransactions([freshTx, ...transactions]);

    // Update supplier count if incoming
    if (txType === 'in') {
      setSuppliers(prev => prev.map(s => {
        if (s.name === party) {
          return { ...s, transactions: s.transactions + 1 };
        }
        return s;
      }));
    }

    // Reset fields
    setNewTransaction({
      productSku: '',
      qty: 0,
      party: '',
      notes: '',
      date: '2026-07-13'
    });
    setIsTransactionModalOpen(false);
    triggerToast(`Transaksi ${txType === 'in' ? 'Barang Masuk' : 'Barang Keluar'} berhasil dicatat!`);
  };

  // Handle product creation
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryName = newProduct.category === 'Lainnya' ? newProduct.customCategory : newProduct.category;
    
    if (!newProduct.name || !newProduct.sku || !categoryName || newProduct.stock < 0 || newProduct.price <= 0) {
      triggerToast('Mohon lengkapi semua isian formulir barang.', 'error');
      return;
    }

    // Double SKU checker
    if (products.some(p => p.sku.toLowerCase() === newProduct.sku.toLowerCase())) {
      triggerToast('SKU sudah digunakan oleh produk lain.', 'error');
      return;
    }

    const freshProduct: Product = {
      name: newProduct.name,
      sku: newProduct.sku,
      category: categoryName,
      stock: Number(newProduct.stock),
      min: Number(newProduct.min),
      unit: newProduct.unit,
      location: newProduct.location,
      price: Number(newProduct.price),
      supplier: newProduct.supplier || 'Tanpa Supplier'
    };

    setProducts([...products, freshProduct]);

    // Add category dynamically if not exist
    if (!categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
      setCategories([...categories, {
        name: categoryName,
        icon: 'Tag',
        color: 'blue',
        count: Number(newProduct.stock)
      }]);
    } else {
      // update category count
      setCategories(categories.map(c => {
        if (c.name.toLowerCase() === categoryName.toLowerCase()) {
          return { ...c, count: c.count + Number(newProduct.stock) };
        }
        return c;
      }));
    }

    // Reset Form
    setNewProduct({
      name: '',
      sku: '',
      category: '',
      customCategory: '',
      stock: 0,
      min: 10,
      unit: 'pcs',
      location: 'Rak A-01',
      price: 0,
      supplier: ''
    });
    setIsProductModalOpen(false);
    triggerToast('Barang baru berhasil terdaftar di sistem!');
  };

  // Handle supplier creation
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.phone) {
      triggerToast('Mohon isi semua data kontak supplier.', 'error');
      return;
    }

    const freshSupplier: Supplier = {
      name: newSupplier.name,
      contact: newSupplier.contact,
      phone: newSupplier.phone,
      category: newSupplier.category || 'Umum',
      transactions: 0,
      status: newSupplier.status
    };

    setSuppliers([...suppliers, freshSupplier]);
    setNewSupplier({
      name: '',
      contact: '',
      phone: '',
      category: '',
      status: 'active'
    });
    setIsSupplierModalOpen(false);
    triggerToast(`Supplier "${freshSupplier.name}" berhasil ditambahkan.`);
  };

  // Handle new category creation
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      triggerToast('Nama kategori tidak boleh kosong.', 'error');
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      triggerToast('Kategori ini sudah ada.', 'error');
      return;
    }

    const colors = ['blue', 'orange', 'green', 'red', 'purple', 'amber'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const freshCat: Category = {
      name: newCategoryName.trim(),
      icon: 'Tag',
      color: randomColor,
      count: 0
    };

    setCategories([...categories, freshCat]);
    setNewCategoryName('');
    setIsCategoryModalOpen(false);
    triggerToast(`Kategori "${freshCat.name}" berhasil dibuat!`);
  };

  // Filtered Products list based on search and selected category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
                          p.sku.toLowerCase().includes(globalSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(globalSearch.toLowerCase()) ||
                          p.location.toLowerCase().includes(globalSearch.toLowerCase());
      
      const matchCategory = inventoryCategoryFilter === 'all' || p.category === inventoryCategoryFilter;
      
      return matchSearch && matchCategory;
    });
  }, [products, globalSearch, inventoryCategoryFilter]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.item.toLowerCase().includes(globalSearch.toLowerCase()) || 
                          t.party.toLowerCase().includes(globalSearch.toLowerCase()) ||
                          t.id.toLowerCase().includes(globalSearch.toLowerCase());
      const matchType = transactionTypeFilter === 'all' || t.type === transactionTypeFilter;
      return matchSearch && matchType;
    });
  }, [transactions, globalSearch, transactionTypeFilter]);

  // Open modal pre-filled for transaction (useful for the "Pesan" restock buttons)
  const openRestockTransaction = (productSku: string) => {
    setTxType('in');
    setNewTransaction(prev => ({
      ...prev,
      productSku,
      qty: 100 // recommended prefill
    }));
    setIsTransactionModalOpen(true);
  };

  // Monthly Report Calculations
  const reportSummary = useMemo(() => {
    // Generate reports of starting, additions, subtractions and ending values
    const currentPeriodReport = reportPeriod; // '2026-07' etc
    
    // We construct the list dynamically using current products list as base template
    const simulatedReportRows = products.map(p => {
      // Find transactions of this product during selected period
      // Let's parse transaction date format e.g. "13 Jul 2026" and map to "2026-07"
      const txsInPeriod = transactions.filter(t => {
        const isThisProduct = t.item.toLowerCase() === p.name.toLowerCase();
        if (!isThisProduct) return false;
        
        // Month checking mapping
        let mCode = '2026-07';
        if (t.date.includes('Jul')) mCode = '2026-07';
        else if (t.date.includes('Jun')) mCode = '2026-06';
        else if (t.date.includes('Mei')) mCode = '2026-05';
        else if (t.date.includes('Apr')) mCode = '2026-04';
        
        return mCode === currentPeriodReport;
      });

      const totalIn = txsInPeriod.filter(t => t.type === 'in').reduce((sum, t) => sum + t.qty, 0);
      const totalOut = txsInPeriod.filter(t => t.type === 'out').reduce((sum, t) => sum + t.qty, 0);
      
      // Let's assume current stock is accurate for now, and trace backwards to calculate starting stock
      // startingStock = currentStock - in + out
      const calculatedStartStock = Math.max(0, p.stock - totalIn + totalOut);
      const endStock = p.stock;
      const totalVal = endStock * p.price;

      return {
        ...p,
        startStock: calculatedStartStock,
        incoming: totalIn,
        outgoing: totalOut,
        endingStock: endStock,
        totalValue: totalVal
      };
    });

    const sumItems = simulatedReportRows.length;
    const sumIn = simulatedReportRows.reduce((acc, r) => acc + r.incoming, 0);
    const sumOut = simulatedReportRows.reduce((acc, r) => acc + r.outgoing, 0);
    const sumTotalVal = simulatedReportRows.reduce((acc, r) => acc + r.totalValue, 0);

    // Grouping by categories for charts
    const categoryGroups: { [key: string]: number } = {};
    simulatedReportRows.forEach(r => {
      categoryGroups[r.category] = (categoryGroups[r.category] || 0) + r.endingStock;
    });

    const lowStockAlerts = simulatedReportRows.filter(r => r.endingStock <= r.min);

    return {
      rows: simulatedReportRows,
      sumItems,
      sumIn,
      sumOut,
      sumTotalVal,
      categoryGroups,
      lowStockAlerts
    };
  }, [products, transactions, reportPeriod]);

  // Exports handlers
  const exportToCSV = () => {
    const headers = ['Nama Barang', 'SKU', 'Kategori', 'Stok Awal', 'Barang Masuk', 'Barang Keluar', 'Stok Akhir', 'Harga Satuan', 'Total Nilai (Rp)', 'Minimum Stok', 'Lokasi Rak'];
    const rows = reportSummary.rows.map(r => [
      r.name,
      r.sku,
      r.category,
      r.startStock,
      r.incoming,
      r.outgoing,
      r.endingStock,
      r.price,
      r.totalValue,
      r.min,
      r.location
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_GudangKu_${reportPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Laporan CSV berhasil diunduh!');
  };

  const exportToExcel = () => {
    // Basic Excel simulation via HTML table inside an XLS mime blob
    let tableHtml = '<table border="1"><tr>';
    const headers = ['Nama Barang', 'SKU', 'Kategori', 'Stok Awal', 'Barang Masuk', 'Barang Keluar', 'Stok Akhir', 'Harga Satuan', 'Total Nilai (Rp)', 'Minimum Stok', 'Lokasi Rak'];
    headers.forEach(h => { tableHtml += `<th style="background:#2b6cb0;color:#fff">${h}</th>`; });
    tableHtml += '</tr>';

    reportSummary.rows.forEach(r => {
      tableHtml += `<tr>
        <td>${r.name}</td>
        <td>${r.sku}</td>
        <td>${r.category}</td>
        <td>${r.startStock}</td>
        <td>${r.incoming}</td>
        <td>${r.outgoing}</td>
        <td>${r.endingStock}</td>
        <td>${r.price}</td>
        <td>${r.totalValue}</td>
        <td>${r.min}</td>
        <td>${r.location}</td>
      </tr>`;
    });
    tableHtml += '</table>';

    const excelBlob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" lang="id"><head><meta charset="utf-8"></head><body>${tableHtml}</body></html>`], {
      type: 'application/vnd.ms-excel'
    });
    
    const url = URL.createObjectURL(excelBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_GudangKu_${reportPeriod}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Laporan Excel berhasil diunduh!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Toast Notification */}
      <div 
        id="toast"
        className={`fixed bottom-6 right-6 px-5 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 border transition-all duration-300 transform ${
          toast.show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        } ${
          toast.type === 'error' ? 'bg-red-900 border-red-700 text-red-50' : 
          toast.type === 'info' ? 'bg-blue-900 border-blue-700 text-blue-50' : 
          'bg-slate-900 border-slate-700 text-slate-50'
        }`}
      >
        <CheckCircle className={`w-5 h-5 ${toast.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`} />
        <span className="font-medium text-sm" id="toastMsg">{toast.message}</span>
      </div>

      {/* Sidebar navigation */}
      <aside 
        id="sidebar"
        className={`w-64 bg-slate-900 text-slate-100 flex flex-col fixed top-0 bottom-0 left-0 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } no-print`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight tracking-tight">GudangKu</h2>
              <span className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">Perlengkapan Umrah</span>
            </div>
          </div>
          {/* Mobile close sidebar button */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-7">
          <div>
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Menu Utama</span>
            <div className="space-y-1">
              <button 
                onClick={() => { setActivePage('dashboard'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  activePage === 'dashboard' 
                    ? 'bg-indigo-600/25 text-indigo-400 font-semibold border-l-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              
              <button 
                onClick={() => { setActivePage('inventory'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  activePage === 'inventory' 
                    ? 'bg-indigo-600/25 text-indigo-400 font-semibold border-l-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Inventaris</span>
              </button>

              <button 
                onClick={() => { setActivePage('transactions'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  activePage === 'transactions' 
                    ? 'bg-indigo-600/25 text-indigo-400 font-semibold border-l-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Transaksi</span>
                </div>
                <span className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {dashboardStats.lowStockCount}
                </span>
              </button>

              <button 
                onClick={() => { setActivePage('suppliers'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  activePage === 'suppliers' 
                    ? 'bg-indigo-600/25 text-indigo-400 font-semibold border-l-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Supplier</span>
              </button>
            </div>
          </div>

          <div>
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Manajemen</span>
            <div className="space-y-1">
              <button 
                onClick={() => { setActivePage('categories'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  activePage === 'categories' 
                    ? 'bg-indigo-600/25 text-indigo-400 font-semibold border-l-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Kategori</span>
              </button>

              <button 
                onClick={() => { setActivePage('locations'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  activePage === 'locations' 
                    ? 'bg-indigo-600/25 text-indigo-400 font-semibold border-l-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Lokasi Rak</span>
              </button>

              <button 
                onClick={() => { setActivePage('reports'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  activePage === 'reports' 
                    ? 'bg-indigo-600/25 text-indigo-400 font-semibold border-l-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Laporan Bulanan</span>
              </button>
            </div>
          </div>

          <div>
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Sistem</span>
            <div className="space-y-1">
              <button 
                onClick={() => { setActivePage('settings'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  activePage === 'settings' 
                    ? 'bg-indigo-600/25 text-indigo-400 font-semibold border-l-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Pengaturan</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center gap-3 bg-slate-950/40">
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-emerald-50 font-bold flex items-center justify-center text-sm">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-200 truncate">Super Admin</h4>
            <span className="text-[10px] text-slate-500 block truncate">Administrator</span>
          </div>
          <button 
            title="Keluar" 
            onClick={() => triggerToast('Keluar sistem disimulasikan.', 'info')}
            className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Topbar Header */}
        <header className="sticky top-0 bg-white border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between gap-4 z-30 no-print">
          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari barang, SKU, supplier, lokasi..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
            />
            {globalSearch && (
              <button 
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              title="Notifikasi" 
              onClick={() => triggerToast('Tidak ada notifikasi baru hari ini.', 'info')}
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {dashboardStats.lowStockCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            <button 
              onClick={() => { setActivePage('reports'); }}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Laporan Cepat"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Laporan</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Views Wrapper */}
        <main className="flex-1 overflow-y-auto">
          
          {/* DASHBOARD VIEW */}
          {activePage === 'dashboard' && (
            <div className="p-4 md:p-8 space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                  <p className="text-slate-500 text-sm mt-1">Ringkasan aktivitas gudang terbaru hari ini</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 self-start">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Senin, 13 Juli 2026</span>
                </div>
              </div>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">+9%</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                      {dashboardStats.totalStockCount}
                    </span>
                    <p className="text-slate-400 text-xs font-medium mt-1">Total Unit Stok</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <ArrowDownCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">+14%</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                      {dashboardStats.incomingMonthCount}
                    </span>
                    <p className="text-slate-400 text-xs font-medium mt-1">Masuk (Bulan Ini)</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                      <ArrowUpCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full">+22%</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                      {dashboardStats.outgoingMonthCount}
                    </span>
                    <p className="text-slate-400 text-xs font-medium mt-1">Keluar (Bulan Ini)</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    {dashboardStats.lowStockCount > 0 ? (
                      <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">Kritis</span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Aman</span>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                      {dashboardStats.lowStockCount}
                    </span>
                    <p className="text-slate-400 text-xs font-medium mt-1">Stok Perlu Restock</p>
                  </div>
                </div>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Panel: Recent Products Table */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Aliran Stok Utama</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Lima barang teratas di inventaris gudang Anda</p>
                    </div>
                    <button 
                      onClick={() => setActivePage('inventory')}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Lihat Semua</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="py-3 px-6">Produk</th>
                          <th className="py-3 px-6">Kategori</th>
                          <th className="py-3 px-6">Stok Saat Ini</th>
                          <th className="py-3 px-6">Rak</th>
                          <th className="py-3 px-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {products.slice(0, 5).map((item, idx) => {
                          const status = getStockStatus(item.stock, item.min);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-100 text-slate-500 font-semibold flex items-center justify-center text-xs">
                                    {item.category.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-800 block leading-tight">{item.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono tracking-wider">{item.sku}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-6 text-slate-500">{item.category}</td>
                              <td className="py-3.5 px-6">
                                <span className="font-bold text-slate-800 tabular-nums">{item.stock}</span>
                                <span className="text-slate-400 text-xs ml-1">{item.unit}</span>
                              </td>
                              <td className="py-3.5 px-6 text-slate-600 font-medium">{item.location}</td>
                              <td className="py-3.5 px-6">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.cls}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                  {status.text}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side panel: Activities & Low alerts */}
                <div className="space-y-6">
                  {/* Activity List */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 text-base mb-4">Aktivitas Terkini</h3>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ArrowDown className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-700 leading-tight">
                            <strong>200 pcs</strong> Kain Ihram Katun diterima dari <span className="text-slate-500">CV Barokah Tekstil</span>
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1 font-medium">20 menit lalu</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ArrowUp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-700 leading-tight">
                            <strong>45 set</strong> Koper Umrah dikeluarkan untuk <span className="text-slate-500">Rombongan Al-Hijaz</span>
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1 font-medium">1 jam lalu</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Move className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-700 leading-tight">
                            Penataan ulang letak barang <strong>Syal Bordir</strong> dipindahkan ke <span className="text-slate-500">Rak D-02</span>
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1 font-medium">5 jam lalu</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Alerts list */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center justify-between">
                      <span>Peringatan Stok</span>
                      <span className="bg-rose-500 text-white font-bold text-xs px-2 py-0.5 rounded-full">
                        {products.filter(p => p.stock <= p.min).length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {products.filter(p => p.stock <= p.min).slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-xs text-slate-800 block truncate max-w-[140px]">{item.name}</span>
                              <span className="text-[10px] text-rose-600 font-bold block">Sisa {item.stock} {item.unit} (Min. {item.min})</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => openRestockTransaction(item.sku)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            Pesan
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}


          {/* INVENTORY VIEW */}
          {activePage === 'inventory' && (
            <div className="p-4 md:p-8 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventaris Barang</h1>
                  <p className="text-slate-500 text-sm mt-1">Kelola, sunting, dan daftarkan perlengkapan umrah</p>
                </div>
                <button 
                  onClick={() => setIsProductModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 self-start transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Daftarkan Barang</span>
                </button>
              </div>

              {/* Filtering bar chips */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-2">Filter Kategori:</span>
                <button 
                  onClick={() => setInventoryCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    inventoryCategoryFilter === 'all' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Semua
                </button>
                {categories.map((cat, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setInventoryCategoryFilter(cat.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      inventoryCategoryFilter === cat.name 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Inventory Stock table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-3.5 px-6">Nama Barang</th>
                        <th className="py-3.5 px-6">SKU</th>
                        <th className="py-3.5 px-6">Kategori</th>
                        <th className="py-3.5 px-6">Stok Aktif</th>
                        <th className="py-3.5 px-6">Batas Min</th>
                        <th className="py-3.5 px-6">Harga Satuan</th>
                        <th className="py-3.5 px-6">Lokasi Rak</th>
                        <th className="py-3.5 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-10 text-slate-400 text-sm font-medium">
                            Tidak ada barang ditemukan yang sesuai dengan pencarian Anda.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((item, idx) => {
                          const status = getStockStatus(item.stock, item.min);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-6 font-semibold text-slate-900">{item.name}</td>
                              <td className="py-4 px-6 font-mono text-xs text-slate-400 tracking-wider uppercase">{item.sku}</td>
                              <td className="py-4 px-6 text-slate-500 font-medium">{item.category}</td>
                              <td className="py-4 px-6">
                                <span className="font-bold text-slate-800 tabular-nums">{item.stock}</span>
                                <span className="text-slate-400 text-xs ml-1">{item.unit}</span>
                              </td>
                              <td className="py-4 px-6 text-slate-500 font-medium tabular-nums">{item.min} {item.unit}</td>
                              <td className="py-4 px-6 font-bold text-slate-700 tabular-nums">{formatRupiah(item.price)}</td>
                              <td className="py-4 px-6 font-medium text-indigo-600">{item.location}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.cls}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                  {status.text}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 font-medium">
                    Menampilkan <strong>{filteredProducts.length}</strong> barang aktif di gudang
                  </span>
                  <div className="flex gap-1.5 self-end">
                    <button className="px-3 py-1.5 rounded border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>Sebelumnya</button>
                    <button className="px-3 py-1.5 rounded border border-slate-200 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all">1</button>
                    <button className="px-3 py-1.5 rounded border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>Selanjutnya</button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* TRANSACTIONS VIEW */}
          {activePage === 'transactions' && (
            <div className="p-4 md:p-8 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transaksi Aliran Barang</h1>
                  <p className="text-slate-500 text-sm mt-1">Catat dan tinjau mutasi masuk & keluar barang logistik</p>
                </div>
                <div className="flex gap-2 self-start">
                  <button 
                    onClick={() => { setTxType('in'); setIsTransactionModalOpen(true); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 flex items-center gap-1.5 transition-all"
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    <span>Barang Masuk</span>
                  </button>
                  <button 
                    onClick={() => { setTxType('out'); setIsTransactionModalOpen(true); }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-rose-600/10 flex items-center gap-1.5 transition-all"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>Barang Keluar</span>
                  </button>
                </div>
              </div>

              {/* Transactions Tab Filter */}
              <div className="flex gap-1 border-b border-slate-200/80 pb-px">
                <button 
                  onClick={() => setTransactionTypeFilter('all')}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all ${
                    transactionTypeFilter === 'all' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Semua Mutasi
                </button>
                <button 
                  onClick={() => setTransactionTypeFilter('in')}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all ${
                    transactionTypeFilter === 'in' 
                      ? 'border-emerald-500 text-emerald-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Barang Masuk (In)
                </button>
                <button 
                  onClick={() => setTransactionTypeFilter('out')}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all ${
                    transactionTypeFilter === 'out' 
                      ? 'border-rose-500 text-rose-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Barang Keluar (Out)
                </button>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-3.5 px-6">ID TRX</th>
                        <th className="py-3.5 px-6">Tanggal</th>
                        <th className="py-3.5 px-6">Jenis Aliran</th>
                        <th className="py-3.5 px-6">Nama Barang</th>
                        <th className="py-3.5 px-6 text-right">Jumlah</th>
                        <th className="py-3.5 px-6">Pihak Kedua (Supplier/Tujuan)</th>
                        <th className="py-3.5 px-6">Petugas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-slate-400 text-sm font-medium">
                            Belum ada riwayat transaksi mutasi saat ini.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500">{tx.id}</td>
                            <td className="py-4 px-6 text-slate-600 font-medium">{tx.date}</td>
                            <td className="py-4 px-6">
                              {tx.type === 'in' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                  <ArrowDown className="w-3.5 h-3.5" />
                                  <span>Masuk</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-xs bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                                  <ArrowUp className="w-3.5 h-3.5" />
                                  <span>Keluar</span>
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 font-semibold text-slate-800">{tx.item}</td>
                            <td className="py-4 px-6 text-right font-extrabold text-slate-900 tabular-nums">
                              {tx.qty} <span className="text-slate-400 text-xs font-normal ml-0.5">{tx.unit}</span>
                            </td>
                            <td className="py-4 px-6 text-slate-600 font-medium">{tx.party}</td>
                            <td className="py-4 px-6 text-slate-500 font-medium">{tx.user}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* SUPPLIERS VIEW */}
          {activePage === 'suppliers' && (
            <div className="p-4 md:p-8 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Supplier Pemasok</h1>
                  <p className="text-slate-500 text-sm mt-1">Daftar mitra dagang penyuplai perlengkapan umrah</p>
                </div>
                <button 
                  onClick={() => setIsSupplierModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 self-start transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Daftarkan Supplier</span>
                </button>
              </div>

              {/* Suppliers list table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-3.5 px-6">Nama Perusahaan</th>
                        <th className="py-3.5 px-6">PIC Kontak</th>
                        <th className="py-3.5 px-6">Nomor Telepon</th>
                        <th className="py-3.5 px-6">Spesialisasi Kategori</th>
                        <th className="py-3.5 px-6 text-center">Total Kirim TRX</th>
                        <th className="py-3.5 px-6">Status Kerjasama</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {suppliers.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900">{s.name}</td>
                          <td className="py-4 px-6 font-semibold text-slate-700">{s.contact}</td>
                          <td className="py-4 px-6 font-mono text-xs text-slate-600 tracking-wide">{s.phone}</td>
                          <td className="py-4 px-6"><span className="text-indigo-600 font-medium">{s.category}</span></td>
                          <td className="py-4 px-6 text-center font-bold text-slate-800 tabular-nums">{s.transactions} kali</td>
                          <td className="py-4 px-6">
                            {s.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                Nonaktif
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* CATEGORIES VIEW */}
          {activePage === 'categories' && (
            <div className="p-4 md:p-8 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kategori Barang</h1>
                  <p className="text-slate-500 text-sm mt-1">Pengelompokan jenis barang logistik umrah</p>
                </div>
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 self-start transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kategori Baru</span>
                </button>
              </div>

              {/* Grid cards of Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((c, idx) => {
                  // Count actual items inside this category
                  const actualCount = products.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).reduce((acc, p) => acc + p.stock, 0);
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => filterByCategory(c.name)}
                      className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Tag className="w-5 h-5" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="mt-6">
                        <h4 className="text-base font-bold text-slate-900">{c.name}</h4>
                        <span className="text-slate-400 text-xs mt-1 block font-medium">
                          <strong>{actualCount}</strong> unit terdaftar
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {/* LOCATIONS VIEW */}
          {activePage === 'locations' && (
            <div className="p-4 md:p-8 space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lokasi Penyimpanan Rak</h1>
                <p className="text-slate-500 text-sm mt-1">Denah kapasitas pengisian ruang simpan barang</p>
              </div>

              {/* Racks list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((loc, idx) => {
                  // dynamically calculate fill percent based on total products in this rack prefix
                  const itemsInRack = products.filter(p => p.location.startsWith(loc.rak));
                  const stockSum = itemsInRack.reduce((acc, i) => acc + i.stock, 0);
                  // mock capacity
                  const capacity = 500;
                  const calculatedPct = Math.min(100, Math.round((stockSum / capacity) * 100)) || loc.pct;

                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-indigo-600">{loc.rak}</span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">Kapasitas 500</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">{loc.label}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Menampung {itemsInRack.length} variasi barang unik
                        </p>
                      </div>

                      <div className="mt-6 space-y-3">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${calculatedPct}%`, 
                              backgroundColor: calculatedPct > 85 ? '#e53e3e' : calculatedPct > 65 ? '#dd6b20' : '#319795' 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                          <span>{calculatedPct}% Terisi</span>
                          <span className="font-mono">{stockSum} / 500 unit</span>
                        </div>
                      </div>

                      {/* Mini list of items in rack */}
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Isi Rak:</span>
                        {itemsInRack.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">Rak kosong</span>
                        ) : (
                          itemsInRack.slice(0, 3).map((it, iIdx) => (
                            <div key={iIdx} className="flex justify-between text-xs text-slate-600">
                              <span className="truncate max-w-[150px]">{it.name}</span>
                              <span className="font-semibold tabular-nums">{it.stock} {it.unit}</span>
                            </div>
                          ))
                        )}
                        {itemsInRack.length > 3 && (
                          <span className="text-[10px] text-indigo-500 font-semibold block">+{itemsInRack.length - 3} barang lainnya...</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {/* REPORTS VIEW */}
          {activePage === 'reports' && (
            <div className="p-4 md:p-8 space-y-6 animate-fade-in print-full-width">
              
              {/* Report Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Stok Bulanan</h1>
                  <p className="text-slate-500 text-sm mt-1">Audit pergerakan barang, nilai barang, dan ekspor laporan resmi</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select 
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="2026-07">Periode: Juli 2026</option>
                    <option value="2026-06">Periode: Juni 2026</option>
                    <option value="2026-05">Periode: Mei 2026</option>
                    <option value="2026-04">Periode: April 2026</option>
                  </select>

                  <button 
                    onClick={exportToCSV}
                    className="bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CSV</span>
                  </button>

                  <button 
                    onClick={exportToExcel}
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>

                  <button 
                    onClick={() => window.print()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/15"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak PDF</span>
                  </button>
                </div>
              </div>

              {/* PDF Sheet Layout */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print-full-width">
                {/* PDF Header brand bar */}
                <div className="px-8 py-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <Warehouse className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-lg tracking-tight">GudangKu Umrah</h2>
                      <p className="text-slate-400 text-xs">Sistem Informasi Manajemen Logistik Gudang</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest block">Laporan Bulanan Resmi</span>
                    <span className="font-extrabold text-base block mt-0.5">Periode: {reportPeriod === '2026-07' ? 'Juli 2026' : reportPeriod === '2026-06' ? 'Juni 2026' : reportPeriod === '2026-05' ? 'Mei 2026' : 'April 2026'}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Dibuat otomatis pada 13 Juli 2026</span>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Summary grid in report */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Item Terdaftar</span>
                      <span className="text-xl font-extrabold text-slate-800 mt-2 block tabular-nums">{reportSummary.sumItems} barang</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Barang Masuk (In)</span>
                      <span className="text-xl font-extrabold text-emerald-600 mt-2 block tabular-nums">+{reportSummary.sumIn} unit</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Barang Keluar (Out)</span>
                      <span className="text-xl font-extrabold text-rose-600 mt-2 block tabular-nums">-{reportSummary.sumOut} unit</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Estimasi Nilai Barang</span>
                      <span className="text-xl font-extrabold text-slate-800 mt-2 block tabular-nums">{formatRupiah(reportSummary.sumTotalVal)}</span>
                    </div>
                  </div>

                  {/* Stock Breakdown list */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-4">Rincian Perputaran Unit & Estimasi Nilai</h3>
                    <div className="overflow-x-auto border border-slate-150 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500">
                            <th className="py-2.5 px-4">Nama Barang</th>
                            <th className="py-2.5 px-4">Kategori</th>
                            <th className="py-2.5 px-4 text-right">Stok Awal</th>
                            <th className="py-2.5 px-4 text-right">Masuk (+)</th>
                            <th className="py-2.5 px-4 text-right">Keluar (-)</th>
                            <th className="py-2.5 px-4 text-right">Stok Akhir</th>
                            <th className="py-2.5 px-4 text-right">Total Nilai (Rp)</th>
                            <th className="py-2.5 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reportSummary.rows.map((row, idx) => {
                            const status = getStockStatus(row.endingStock, row.min);
                            return (
                              <tr key={idx} className="hover:bg-slate-50/30">
                                <td className="py-3 px-4">
                                  <span className="font-semibold text-slate-800 block">{row.name}</span>
                                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">{row.sku}</span>
                                </td>
                                <td className="py-3 px-4 text-slate-500 font-medium">{row.category}</td>
                                <td className="py-3 px-4 text-right font-medium text-slate-600 tabular-nums">{row.startStock}</td>
                                <td className="py-3 px-4 text-right font-bold text-emerald-600 tabular-nums">+{row.incoming}</td>
                                <td className="py-3 px-4 text-right font-bold text-rose-500 tabular-nums">-{row.outgoing}</td>
                                <td className="py-3 px-4 text-right font-extrabold text-slate-900 tabular-nums">{row.endingStock}</td>
                                <td className="py-3 px-4 text-right font-bold text-slate-700 tabular-nums">{formatRupiah(row.totalValue)}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.cls}`}>
                                    {status.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-800">
                            <td colSpan={2} className="py-3 px-4 uppercase tracking-wider">Total Keseluruhan</td>
                            <td className="py-3 px-4 text-right tabular-nums">{reportSummary.rows.reduce((a, b) => a + b.startStock, 0)}</td>
                            <td className="py-3 px-4 text-right text-emerald-600 tabular-nums">+{reportSummary.sumIn}</td>
                            <td className="py-3 px-4 text-right text-rose-500 tabular-nums">-{reportSummary.sumOut}</td>
                            <td className="py-3 px-4 text-right tabular-nums">{reportSummary.rows.reduce((a, b) => a + b.endingStock, 0)}</td>
                            <td className="py-3 px-4 text-right text-slate-900 tabular-nums">{formatRupiah(reportSummary.sumTotalVal)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Distribution Categories graph bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm mb-4">Proporsi Alokasi Kategori Terbanyak</h3>
                      <div className="space-y-3.5">
                        {(Object.entries(reportSummary.categoryGroups) as [string, number][])
                          .sort((a, b) => b[1] - a[1])
                          .map(([catName, qty], idx) => {
                            const maxVal = Math.max(...(Object.values(reportSummary.categoryGroups) as number[]));
                            const pct = Math.round((qty / maxVal) * 100);
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-semibold text-slate-700">{catName}</span>
                                  <span className="font-bold text-slate-900 tabular-nums">{qty} unit</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Restock Recommendations in Report */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm mb-4">Saran Pembelian / Restock</h3>
                      <div className="space-y-2">
                        {reportSummary.lowStockAlerts.length === 0 ? (
                          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-100 font-semibold">
                            Tidak ada saran restock mendesak untuk periode ini. Semua aman!
                          </div>
                        ) : (
                          reportSummary.lowStockAlerts.map((row, idx) => {
                            const recQuantity = Math.max(row.min * 2 - row.endingStock, row.min);
                            return (
                              <div key={idx} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-slate-800 block">{row.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono tracking-wider">{row.sku} &middot; Lokasi: {row.location}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold block mb-1">Kritis (Sisa {row.endingStock})</span>
                                  <span className="text-[11px] font-bold text-indigo-600">Saran order: +{recQuantity} {row.unit}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Print Sign Footer */}
                <div className="bg-slate-50 px-8 py-10 border-t border-slate-150 flex justify-between items-end text-xs text-slate-500">
                  <div>
                    <h5 className="font-bold text-slate-700">Kantor Hub GudangKu Jakarta</h5>
                    <p className="mt-1">Jl. Raya Condet No. 12, Kramat Jati, Jakarta Timur 13530</p>
                    <p className="text-[10px] mt-2 text-slate-400">Dicetak resmi menggunakan sistem logistik pergudangan otomatis.</p>
                  </div>
                  <div className="text-center w-48">
                    <span className="block text-slate-400 mb-14">Menyetujui,</span>
                    <div className="border-t border-slate-300 pt-1.5 font-bold text-slate-700">
                      Kepala Gudang Utama
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}


          {/* SETTINGS VIEW */}
          {activePage === 'settings' && (
            <div className="p-4 md:p-8 space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Sistem Gudang</h1>
                <p className="text-slate-500 text-sm mt-1">Konfigurasi profile, kapasitas ambang batas stok, dan notifikasi sistem</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-2xl overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Depo / Gudang</label>
                      <input 
                        type="text" 
                        value={warehouseSettings.name}
                        onChange={(e) => setWarehouseSettings({ ...warehouseSettings, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kapasitas Maksimum Volume</label>
                        <input 
                          type="number" 
                          value={warehouseSettings.maxCapacity}
                          onChange={(e) => setWarehouseSettings({ ...warehouseSettings, maxCapacity: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Satuan Volume Utama</label>
                        <input 
                          type="text" 
                          value={warehouseSettings.unit}
                          onChange={(e) => setWarehouseSettings({ ...warehouseSettings, unit: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Alamat Domisili Depo</label>
                      <input 
                        type="text" 
                        value={warehouseSettings.address}
                        onChange={(e) => setWarehouseSettings({ ...warehouseSettings, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-semibold text-sm text-slate-700 block">Peringatan Stok Minimum</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">Berikan tanda kritis merah di dashboard bila stok menipis</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={warehouseSettings.warningEnabled}
                          onChange={(e) => setWarehouseSettings({ ...warehouseSettings, warningEnabled: e.target.checked })}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-semibold text-sm text-slate-700 block">Notifikasi Email Otomatis</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">Kirim rekap mingguan status stok ke administrator</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={warehouseSettings.emailNotifEnabled}
                          onChange={(e) => setWarehouseSettings({ ...warehouseSettings, emailNotifEnabled: e.target.checked })}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => triggerToast('Konfigurasi pengaturan gudang berhasil disimpan!')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ======================================================== */}
      {/* MODALS OVERLAYS SECTION */}
      {/* ======================================================== */}

      {/* 1. PRODUCT REGISTER MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-in">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Daftarkan Barang Baru</h3>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Barang *</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Paket Koper Premium, Kain Ihram..."
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">SKU Unik *</label>
                    <input 
                      type="text" 
                      placeholder="SKU-KP-1003"
                      required
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kategori Barang *</label>
                    <select 
                      required
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((c, i) => (
                        <option key={i} value={c.name}>{c.name}</option>
                      ))}
                      <option value="Lainnya">Lainnya (Teks Manual)</option>
                    </select>
                  </div>
                </div>

                {newProduct.category === 'Lainnya' && (
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Nama Kategori Baru *</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan nama kategori manual..."
                      required
                      value={newProduct.customCategory}
                      onChange={(e) => setNewProduct({ ...newProduct, customCategory: e.target.value })}
                      className="w-full bg-white border border-indigo-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Jumlah Stok Awal *</label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      placeholder="0"
                      value={newProduct.stock || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Satuan Ukuran *</label>
                    <select 
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    >
                      <option value="pcs">pcs</option>
                      <option value="set">set</option>
                      <option value="unit">unit</option>
                      <option value="lusin">lusin</option>
                      <option value="dus">dus</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Batas Minimum Stok *</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      placeholder="10"
                      value={newProduct.min || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, min: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lokasi Rak Gudang *</label>
                    <select 
                      value={newProduct.location}
                      onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    >
                      <option value="Rak A-01">Rak A-01 (Koper)</option>
                      <option value="Rak A-04">Rak A-04 (Koper)</option>
                      <option value="Rak B-02">Rak B-02 (Batik)</option>
                      <option value="Rak B-05">Rak B-05 (Gamis)</option>
                      <option value="Rak C-01">Rak C-01 (Ihram)</option>
                      <option value="Rak D-02">Rak D-02 (Syal)</option>
                      <option value="Rak E-01">Rak E-01 (Buku Doa)</option>
                      <option value="Rak F-01">Rak F-01 (Lainnya)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Harga per Unit (Rp) *</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      placeholder="120000"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Supplier Pemasok</label>
                    <select 
                      value={newProduct.supplier}
                      onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    >
                      <option value="">Pilih Supplier</option>
                      {suppliers.map((s, idx) => (
                        <option key={idx} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-3xl">
                <button 
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/15 transition-all"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. TRANSACTION LOG RECORD MODAL */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl w-full max-w-lg animate-modal-in">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">
                Catat {txType === 'in' ? 'Barang Masuk (In)' : 'Barang Keluar (Out)'}
              </h3>
              <button 
                onClick={() => setIsTransactionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pilih Barang *</label>
                  <select 
                    required
                    value={newTransaction.productSku}
                    onChange={(e) => setNewTransaction({ ...newTransaction, productSku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                  >
                    <option value="">Pilih barang dari gudang</option>
                    {products.map((p, idx) => (
                      <option key={idx} value={p.sku}>
                        {p.name} ({p.sku}) - Sisa Stok: {p.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Jumlah (Qty) *</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      placeholder="0"
                      value={newTransaction.qty || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, qty: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tanggal Mutasi *</label>
                    <input 
                      type="date" 
                      required
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {txType === 'in' ? 'Supplier Pengirim *' : 'Tujuan / Jamaah Rombongan *'}
                  </label>
                  {txType === 'in' ? (
                    <select 
                      required
                      value={newTransaction.party}
                      onChange={(e) => setNewTransaction({ ...newTransaction, party: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    >
                      <option value="">Pilih Supplier</option>
                      {suppliers.map((s, idx) => (
                        <option key={idx} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Contoh: Rombongan Al-Hijaz Kloter 3"
                      required
                      value={newTransaction.party}
                      onChange={(e) => setNewTransaction({ ...newTransaction, party: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Catatan Tambahan (Keterangan)</label>
                  <input 
                    type="text" 
                    placeholder="Bisa dikosongkan..."
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-3xl">
                <button 
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className={`font-semibold text-xs px-5 py-2 rounded-xl shadow-lg text-white transition-all ${
                    txType === 'in' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10' 
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
                  }`}
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SUPPLIER MODAL */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl w-full max-w-md animate-modal-in">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Daftarkan Supplier Baru</h3>
              <button 
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSupplier}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Perusahaan / Supplier *</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: PT Rabbani Asysa, CV Barokah..."
                    required
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama PIC Kontak Person *</label>
                  <input 
                    type="text" 
                    placeholder="Nama lengkap penghubung..."
                    required
                    value={newSupplier.contact}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nomor Telepon Kontak *</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: 021-XXXX / 08XXXXXXXX"
                    required
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kategori Spesialisasi</label>
                    <input 
                      type="text" 
                      placeholder="Koper, Ihram, Batik dll..."
                      value={newSupplier.category}
                      onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status Kerjasama</label>
                    <select 
                      value={newSupplier.status}
                      onChange={(e) => setNewSupplier({ ...newSupplier, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-3xl">
                <button 
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/15 transition-all"
                >
                  Daftarkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. NEW CATEGORY CREATE MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl w-full max-w-sm animate-modal-in">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Buat Kategori Baru</h3>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCategory}>
              <div className="p-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Kategori *</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Sajadah, Peci, Tas Paspor..."
                  required
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-3xl">
                <button 
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/15 transition-all"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
