import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  ArrowLeft,
  Edit,
  Barcode,
  Boxes,
  TrendingUp,
  History,
  Calendar,
  Layers,
  Tag,
} from 'lucide-react';
import api from '../../services/api';

export const ProductDetails = () => {
  const { id } = useParams();
  const { formatCurrency, formatNumber } = useLanguage();
  const { error } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (e) {
        error('পণ্যের বিস্তারিত লোড করতে ব্যর্থ হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">লোড হচ্ছে...</div>;
  }

  if (!product) {
    return <div className="p-12 text-center text-rose-500">পণ্যটি খুঁজে পাওয়া যায়নি।</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {product.name}
            </h1>
            <p className="text-xs text-slate-500">
              {product.name_bn || 'বারকোড: ' + product.barcode} • SKU: {product.sku}
            </p>
          </div>
        </div>

        <Link
          to={`/products/${product.id}/edit`}
          className="py-2 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center gap-1.5 transition"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>সম্পাদন করুন</span>
        </Link>
      </div>

      {/* Main Specs Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Product Image & Barcode Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col items-center text-center space-y-4">
          <div className="w-48 h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
            {product.image_url ? (
              <img src={product.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Package className="w-16 h-16 text-slate-400 stroke-1" />
            )}
          </div>

          <div className="space-y-1 w-full">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">বারকোড কোড</div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">
              {product.barcode}
            </div>
          </div>
        </div>

        {/* Right (2 cols): Details and Financials */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">বর্তমান স্টক</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {product.current_stock} {product.unit?.name_bn}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">ক্রয় মূল্য (কেনা দর)</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(product.purchase_price)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">বিক্রয় মূল্য</span>
              <span className="text-lg font-bold text-emerald-600">
                {formatCurrency(product.selling_price)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">প্রত্যাশিত মুনাফা/পিস</span>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(product.selling_price - product.purchase_price)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">ক্যাটাগরি</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {product.category?.name_bn || product.category?.name}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">ব্র্যান্ড</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {product.brand?.name_bn || product.brand?.name || '—'}
              </span>
            </div>
          </div>

          {product.description && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">বিবরণ</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stock Movement Ledger Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            স্টক চলাচলের ইতিহাস (Stock Ledger)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">তারিখ</th>
                <th className="p-3">লেনদেনের ধরন</th>
                <th className="p-3 text-right">আগের স্টক</th>
                <th className="p-3 text-center">পরিমাণ</th>
                <th className="p-3 text-right">পরবর্তী স্টক</th>
                <th className="p-3">কারণ / রেফারেন্স</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {product.stock_movements?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    এখনও কোনো স্টক রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                product.stock_movements?.map((m) => {
                  const isPositive = Number(m.quantity) >= 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 text-slate-500 font-mono">
                        {new Date(m.created_at).toLocaleString('bn-BD')}
                      </td>
                      <td className="p-3 font-semibold capitalize text-slate-700 dark:text-slate-300">
                        {m.movement_type}
                      </td>
                      <td className="p-3 text-right">{m.stock_before}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-lg ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                          }`}
                        >
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        {m.stock_after}
                      </td>
                      <td className="p-3 text-slate-500">{m.reason || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

