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
} from 'lucide-react';
import api from '../../services/api';

export const ProductList = () => {
  const { t, formatCurrency, formatNumber } = useLanguage();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Inline delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts(pagination.current_page);
  }, [search, selectedCat, selectedBrand, lowStockOnly]);

  const fetchMetadata = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
      ]);
      setCategories(catsRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        search,
        category_id: selectedCat || undefined,
        brand_id: selectedBrand || undefined,
        low_stock: lowStockOnly ? 1 : undefined,
      };
      const res = await api.get('/products', { params });
      setProducts(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (e) {
      error('পণ্য তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      success('পণ্যটি সফলভাবে মুছে ফেলা হয়েছে।');
      setDeleteConfirmId(null);
      fetchProducts(pagination.current_page);
    } catch (err) {
      error(err.response?.data?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে।');
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
            মোট {formatNumber(pagination.total)} টি নিবন্ধিত পণ্য
          </p>
        </div>

        <Link
          to="/products/new"
          className="px-4 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 self-start transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addProduct')}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="নাম, বারকোড বা SKU দিয়ে খুঁজুন..."
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
          <option value="">সব ক্যাটাগরি</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>
          ))}
        </select>

        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">সব ব্র্যান্ড</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name_bn || b.name}</option>
          ))}
        </select>

        {/* Low Stock Toggle */}
        <button
          type="button"
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
            lowStockOnly
              ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>কম স্টক ফিল্টার</span>
        </button>
      </div>

      {/* Delete Confirmation Box (NO MODAL POLICY) */}
      {deleteConfirmId && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-rose-900 dark:text-rose-100 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান? এটি স্টকের হিসাবকে প্রভাবিত করতে পারে।</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              className="py-1.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm"
            >
              হ্যাঁ, মুছে ফেলুন
            </button>
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="py-1.5 px-4 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              বাতিল
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
                <th className="p-4">পণ্য</th>
                <th className="p-4">বারকোড / SKU</th>
                <th className="p-4">ক্যাটাগরি</th>
                <th className="p-4 text-right">ক্রয় মূল্য</th>
                <th className="p-4 text-right">বিক্রয় মূল্য</th>
                <th className="p-4 text-center">বর্তমান স্টক</th>
                <th className="p-4 text-center">অবস্থা</th>
                <th className="p-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    কোনো পণ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = Number(p.current_stock) <= Number(p.alert_stock);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center font-bold text-slate-400 border border-slate-200 dark:border-slate-700">
                            {p.image_url ? (
                              <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              p.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</div>
                            {p.name_bn && <div className="text-[11px] text-slate-400">{p.name_bn}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        <div>{p.barcode}</div>
                        <div className="text-[10px] text-slate-400">SKU: {p.sku}</div>
                      </td>

                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {p.category?.name_bn || p.category?.name || '—'}
                      </td>

                      <td className="p-4 text-right text-slate-600 dark:text-slate-400 font-medium">
                        {formatCurrency(p.purchase_price)}
                      </td>

                      <td className="p-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(p.selling_price)}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold ${
                            isLow
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {p.current_stock} {p.unit?.name_bn || 'পিস'}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            p.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/products/${p.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="বিস্তারিত"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/products/${p.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="সম্পাদন"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="মুছুন"
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
            পৃষ্ঠা {formatNumber(pagination.current_page)} / {formatNumber(pagination.last_page)}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchProducts(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchProducts(pagination.current_page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

