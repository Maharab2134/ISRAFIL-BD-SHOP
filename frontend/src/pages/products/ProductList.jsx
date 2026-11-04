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

export const ProductList = () => {
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
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
  const [showImport, setShowImport] = useState(false);

  const sampleProducts = [
    {
      name: 'Wireless Bluetooth Earbuds',
      name_bn: 'ওয়্যারলেস ব্লুটুথ ইয়ারবাডস',
      barcode: '894110001001',
      sku: 'SKU-001001',
      category_name: 'Electronics & Gadgets',
      brand_name: 'Samsung',
      unit_name: 'Piece',
      purchase_price: 1200,
      selling_price: 1650,
      wholesale_price: 1450,
      current_stock: 40,
      alert_stock: 5,
      tax_percent: 0,
      discount_type: 'fixed',
      discount_value: 50,
      image_url: 'https://drive.google.com/file/d/1uTZCWKh6PftTikrXZOde-l4spvCPWBEM/view?usp=drive_link',
      description: 'High-fidelity audio with active noise cancellation'
    },
    {
      name: 'Dove Deep Moisture Shampoo 350ml',
      name_bn: 'ডোভ ডিপ ময়েশ্চার শ্যাম্পু ৩৫০মি.লি.',
      barcode: '894110001002',
      sku: 'SKU-001002',
      category_name: 'Cosmetics & Personal Care',
      brand_name: 'Unilever',
      unit_name: 'Piece',
      purchase_price: 360,
      selling_price: 450,
      current_stock: 60,
      alert_stock: 10,
      tax_percent: 0,
      discount_type: 'none',
      discount_value: 0,
      image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d',
      description: 'Nourishing daily hair care shampoo'
    }
  ];

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts(pagination.current_page);
  }, [search, selectedCat, selectedBrand, lowStockOnly, lang]);

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
      error(lang === 'bn' ? 'পণ্য তালিকা লোড করতে সমস্যা হয়েছে।' : 'Failed to load product list.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      success(lang === 'bn' ? 'পণ্যটি সফলভাবে মুছে ফেলা হয়েছে।' : 'Product deleted successfully.');
      setDeleteConfirmId(null);
      fetchProducts(pagination.current_page);
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ হয়েছে।' : 'Failed to delete.'));
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
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <span>{lang === 'bn' ? 'কম স্টক ফিল্টার' : 'Low Stock Filter'}</span>
        </button>
      </div>

      {/* Delete Confirmation Box (NO MODAL POLICY) */}
      {deleteConfirmId && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-rose-900 dark:text-rose-100 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>
              {lang === 'bn'
                ? 'আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান? এটি স্টকের হিসাবকে প্রভাবিত করতে পারে।'
                : 'Are you sure you want to delete this product? This may affect inventory records.'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              className="py-1.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm"
            >
              {lang === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="py-1.5 px-4 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              {t('cancel')}
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
                <th className="p-4">{lang === 'bn' ? 'পণ্য' : 'Product'}</th>
                <th className="p-4">{lang === 'bn' ? 'বারকোড / SKU' : 'Barcode / SKU'}</th>
                <th className="p-4">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
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
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    {t('loading')}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    {t('noData')}
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
                              <img
                                src={normalizeImageUrl(p.image_url)}
                                alt=""
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                                className="w-full h-full object-cover"
                              />
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
                        {lang === 'bn'
                          ? (p.category?.name_bn || p.category?.name || '—')
                          : (p.category?.name || '—')}
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
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold ${isLow
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                        >
                          {p.current_stock} {lang === 'bn' ? (p.unit?.name_bn || 'পিস') : (p.unit?.name || p.unit?.code || 'pcs')}
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
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
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
    </div>
  );
};
export default ProductList;
