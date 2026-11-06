import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Barcode,
  Layers,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileJson,
} from 'lucide-react';
import api from '../../services/api';
import { normalizeImageUrl } from '../../utils/imageHelper';
import { InlineJsonImport } from '../../components/common/InlineJsonImport';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { ProductCardMedia } from '../../components/common/ProductCardMedia';

export const ProductList = () => {
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const formatStockCount = (stock, unit) => {
    const qty = Number(stock) % 1 === 0 ? Math.round(stock) : Number(stock);
    const code = unit?.code?.toLowerCase();
    let unitLabel = lang === 'bn' ? 'পিস' : 'Pcs';
    if (code === 'pkt') unitLabel = lang === 'bn' ? 'প্যাকেট' : 'Pkt';
    else if (code === 'box') unitLabel = lang === 'bn' ? 'বক্স' : 'Box';
    else if (code === 'bags') unitLabel = lang === 'bn' ? 'ব্যাগ' : 'Bags';
    return `${formatNumber(qty)} ${unitLabel}`;
  };

  const [products, setProducts] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_products_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [categories, setCategories] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_categories_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [brands, setBrands] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_brands_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [perPage, setPerPage] = useState(() => {
    try {
      return sessionStorage.getItem('israfil_products_per_page') || '50';
    } catch (e) {
      return '50';
    }
  });
  const [pagination, setPagination] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_products_pagination');
      return cached ? JSON.parse(cached) : { current_page: 1, last_page: 1, total: 0 };
    } catch (e) {
      return { current_page: 1, last_page: 1, total: 0 };
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_products_cache');
      return !cached || JSON.parse(cached).length === 0;
    } catch (e) {
      return true;
    }
  });

  // Delete & Multi-selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, isBulk: false });
  const [deleting, setDeleting] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const sampleProducts = [
    {
      name: 'Miniket Rice 5kg',
      name_bn: 'মিনিকেট চাল ৫ কেজি',
      barcode: '2000000000005',
      sku: 'RICE-MINI-5KG',
      category_name: 'Rice & Grains',
      brand_name: 'Fresh',
      unit_name: 'Packet',
      purchase_price: 360,
      selling_price: 410,
      wholesale_price: 395,
      current_stock: 50,
      alert_stock: 10,
      tax_percent: 0,
      discount_type: 'none',
      discount_value: 0,
      description: 'Premium quality polished miniket rice'
    },
    {
      name: 'Soybean Oil 1 Litre',
      name_bn: 'সয়াবিন তেল ১ লিটার',
      barcode: '2000000000101',
      sku: 'OIL-SOY-1L',
      category_name: 'Cooking Oil',
      brand_name: 'Teer',
      unit_name: 'Liter',
      purchase_price: 165,
      selling_price: 185,
      current_stock: 100,
      alert_stock: 15,
      tax_percent: 0,
      discount_type: 'none',
      discount_value: 0,
      description: 'Refined pure soybean cooking oil'
    }
  ];

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts(pagination.current_page);
  }, [search, selectedCat, selectedBrand, lowStockOnly, perPage, lang]);

  const fetchMetadata = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
      ]);
      const loadedCats = catsRes.data || [];
      const loadedBrands = brandsRes.data || [];
      setCategories(loadedCats);
      setBrands(loadedBrands);
      try {
        sessionStorage.setItem('israfil_categories_cache', JSON.stringify(loadedCats));
        sessionStorage.setItem('israfil_brands_cache', JSON.stringify(loadedBrands));
      } catch (e) {}
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async (page = pagination.current_page) => {
    // Only set full loading indicator if we don't have any cached products rendered yet
    if (products.length === 0) {
      setLoading(true);
    }
    try {
      const params = {
        page,
        per_page: perPage,
        search,
        category_id: selectedCat || undefined,
        brand_id: selectedBrand || undefined,
        low_stock: lowStockOnly ? 1 : undefined,
      };
      const res = await api.get('/products', { params });
      const loadedProducts = res.data.data || [];
      const loadedPagination = {
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      };
      setProducts(loadedProducts);
      setPagination(loadedPagination);

      // Persist state so returning back from ProductDetails restores view instantly
      try {
        // Only cache page data if safe; avoid sticky search/filter pollution
        const prodJson = JSON.stringify(loadedProducts);
        if (prodJson.length < 500000) {
          sessionStorage.setItem('israfil_products_cache', prodJson);
          sessionStorage.setItem('israfil_products_pagination', JSON.stringify(loadedPagination));
        }
      } catch (e) {}
    } catch (e) {
      error(lang === 'bn' ? 'পণ্য তালিকা লোড করতে সমস্যা হয়েছে।' : 'Failed to load product list.');
    } finally {
      setLoading(false);
    }
  };

  const allIdsOnPage = products.map((p) => p.id);
  const isAllSelected = allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(selectedIds.filter((id) => !allIdsOnPage.includes(id)));
    } else {
      setSelectedIds([...new Set([...selectedIds, ...allIdsOnPage])]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      if (deleteModal.isBulk) {
        const res = await api.post('/products/bulk-delete', { ids: selectedIds });
        success(res.data.message || (lang === 'bn' ? 'নির্বাচিত পণ্যগুলো মুছে ফেলা হয়েছে।' : 'Products deleted.'));
        setSelectedIds([]);
      } else if (deleteModal.item) {
        await api.delete(`/products/${deleteModal.item.id}`);
        success(lang === 'bn' ? `"${deleteModal.item.name}" সফলভাবে মুছে ফেলা হয়েছে।` : 'Product deleted successfully.');
        setSelectedIds((prev) => prev.filter((id) => id !== deleteModal.item.id));
      }
      setDeleteModal({ isOpen: false, item: null, isBulk: false });
      fetchProducts(pagination.current_page);
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ হয়েছে।' : 'Failed to delete.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('productList')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {lang === 'bn'
              ? `মোট ${formatNumber(pagination.total)} টি নিবন্ধিত পণ্য`
              : `Total ${formatNumber(pagination.total)} registered products`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImport(!showImport)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition border ${showImport
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 shadow-sm'
              }`}
          >
            <FileJson className="w-4 h-4" />
            <span>{lang === 'bn' ? 'products.json ইমপোর্ট' : 'Import products.json'}</span>
          </button>

          <Link
            to="/products/new"
            className="px-4 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addProduct')}</span>
          </Link>
        </div>
      </div>

      {showImport && (
        <InlineJsonImport
          title={lang === 'bn' ? 'পণ্য বাল্ক ইমপোর্ট (products.json)' : 'Product Bulk Import (products.json)'}
          endpoint="/products/import-json"
          sampleFilename="products.json"
          sampleData={sampleProducts}
          onSuccess={() => {
            fetchProducts(pagination.current_page);
          }}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'নাম, বারকোড বা SKU দিয়ে খুঁজুন...' : 'Search by name, barcode, or SKU...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">{lang === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {lang === 'bn' ? c.name_bn || c.name : c.name}
            </option>
          ))}
        </select>

        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">{lang === 'bn' ? 'সব ব্র্যান্ড' : 'All Brands'}</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {lang === 'bn' ? b.name_bn || b.name : b.name}
            </option>
          ))}
        </select>

        {/* Per-Page Selector */}
        <select
          value={perPage}
          onChange={(e) => setPerPage(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
        >
          <option value="25">{lang === 'bn' ? 'প্রতি পৃষ্ঠায় ২৫ টি' : 'Show 25 / page'}</option>
          <option value="50">{lang === 'bn' ? 'প্রতি পৃষ্ঠায় ৫০ টি' : 'Show 50 / page'}</option>
          <option value="100">{lang === 'bn' ? 'প্রতি পৃষ্ঠায় ১০০ টি' : 'Show 100 / page'}</option>
          <option value="250">{lang === 'bn' ? 'প্রতি পৃষ্ঠায় ২৫০ টি' : 'Show 250 / page'}</option>
          <option value="500">{lang === 'bn' ? 'প্রতি পৃষ্ঠায় ৫০০ টি' : 'Show 500 / page'}</option>
          <option value="all">{lang === 'bn' ? 'সকল পণ্য একসাথে (All)' : 'Show All Products'}</option>
        </select>

        {/* Low Stock Toggle */}
        <button
          type="button"
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${lowStockOnly
              ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'কম স্টক ফিল্টার' : 'Low Stock'}</span>
        </button>
      </div>

      {/* Bulk Action Bar when items are selected */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              {lang === 'bn' ? `মোট ${formatNumber(selectedIds.length)} টি পণ্য নির্বাচিত হয়েছে` : `${selectedIds.length} products selected`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {lang === 'bn' ? 'বাছাই বাতিল' : 'Deselect'}
            </button>
            <button
              type="button"
              onClick={() => setDeleteModal({ isOpen: true, item: null, isBulk: true })}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition flex items-center gap-1.5 shadow-sm shadow-rose-600/30 cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নির্বাচিতগুলো মুছুন' : 'Delete Selected'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    title={lang === 'bn' ? 'সবগুলো নির্বাচন করুন' : 'Select All'}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">{lang === 'bn' ? 'পণ্য' : 'Product'}</th>
                <th className="p-4">{lang === 'bn' ? 'বারকোড / SKU' : 'Barcode / SKU'}</th>
                <th className="p-4">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="p-4">{lang === 'bn' ? 'পরিমাপ (Qnty)' : 'Measurement (Qnty)'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'ক্রয় মূল্য' : 'Cost Price'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'বিক্রয় মূল্য' : 'Selling Price'}</th>
                <th className="p-4 text-center">{lang === 'bn' ? 'বর্তমান স্টক' : 'Stock'}</th>
                <th className="p-4 text-center">{t('status')}</th>
                <th className="p-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">
                    {t('loading')}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = Number(p.current_stock) <= Number(p.alert_stock);
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(p.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <ProductCardMedia
                            product={p}
                            isCompact={true}
                            className="w-10 h-10 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</div>
                            {p.name_bn && <div className="text-[11px] text-slate-400 mt-0.5">{p.name_bn}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        <div>{p.barcode}</div>
                        <div className="text-[10px] text-slate-400">SKU: {p.sku}</div>
                      </td>

                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {lang === 'bn'
                          ? (p.category?.name_bn || p.category?.name || '—')
                          : (p.category?.name || '—')}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {p.measurement_value || p.unit ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                            {p.measurement_value ? `${p.measurement_value} ` : ''}
                            {lang === 'bn' ? (p.unit?.name_bn || p.unit?.name || '') : (p.unit?.name || p.unit?.code || '')}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="p-4 text-right text-slate-600 dark:text-slate-400 font-medium">
                        {formatCurrency(p.purchase_price)}
                      </td>

                      <td className="p-4 text-right">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          {p.discount_type && Number(p.discount_value) > 0
                            ? formatCurrency(
                              p.discount_type === 'percentage'
                                ? Math.max(0, p.selling_price - (p.selling_price * p.discount_value) / 100)
                                : Math.max(0, p.selling_price - p.discount_value)
                            )
                            : formatCurrency(p.selling_price)}
                        </div>
                        {p.discount_type && Number(p.discount_value) > 0 && (
                          <div className="flex items-center justify-end gap-1 text-[10px] mt-0.5">
                            <span className="line-through text-slate-400">{formatCurrency(p.selling_price)}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-black">
                              {p.discount_type === 'percentage' ? `-${p.discount_value}%` : `-৳${p.discount_value}`}
                            </span>
                          </div>
                        )}
                        {Number(p.tax_percent) > 0 && (
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                            +VAT {Number(p.tax_percent)}%
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold ${isLow
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                        >
                          {formatStockCount(p.current_stock, p.unit)}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                        />
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/products/${p.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title={t('view')}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/products/${p.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title={t('edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ isOpen: true, item: p, isBulk: false })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            {lang === 'bn'
              ? `পৃষ্ঠা ${formatNumber(pagination.current_page)} / ${formatNumber(pagination.last_page)}`
              : `Page ${formatNumber(pagination.current_page)} of ${formatNumber(pagination.last_page)}`}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchProducts(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchProducts(pagination.current_page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog Box */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, isBulk: false })}
        onConfirm={handleConfirmDelete}
        itemName={deleteModal.item?.name}
        count={deleteModal.isBulk ? selectedIds.length : 1}
        loading={deleting}
      />
    </div>
  );
};
export default ProductList;
