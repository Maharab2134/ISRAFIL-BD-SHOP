import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Sliders, ArrowLeft, Save, PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export const StockAdjustment = () => {
  const [searchParams] = useSearchParams();
  const initialProductId = searchParams.get('product_id') || '';

  const { t } = useLanguage();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  const [adjustmentType, setAdjustmentType] = useState('in'); // 'in', 'out', 'adjustment'
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?per_page=150');
        setProducts(res.data.data || []);
      } catch (e) {
        error('পণ্য লোড করতে ব্যর্থ হয়েছে।');
      }
    };
    fetchProducts();
  }, []);

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      error('অনুগ্রহ করে একটি পণ্য নির্বাচন করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/inventory/adjust', {
        product_id: selectedProductId,
        type: adjustmentType,
        quantity: Number(quantity),
        reason,
      });

      success('স্টক সমন্বয় সফলভাবে সম্পন্ন হয়েছে!');
      navigate('/inventory');
    } catch (err) {
      error(err.response?.data?.message || 'স্টক সমন্বয় ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/inventory"
          className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('stockAdjustment')}
          </h1>
          <p className="text-xs text-slate-500">মজুদ পণ্যের হিসাব সরাসরি সমন্বয় করুন</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
        {/* Product Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            পণ্য নির্বাচন করুন *
          </label>
          <select
            required
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">পণ্য বেছে নিন</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.barcode}) — বর্তমান স্টক: {p.current_stock} {p.unit?.name_bn}
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-indigo-900 dark:text-indigo-200 block">{selectedProduct.name}</span>
              <span className="text-indigo-600 dark:text-indigo-400">বারকোড: {selectedProduct.barcode}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">বর্তমান স্টক</span>
              <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                {selectedProduct.current_stock} {selectedProduct.unit?.name_bn}
              </span>
            </div>
          </div>
        )}

        {/* Adjustment Type Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            সমন্বয়ের ধরন *
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setAdjustmentType('in')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                adjustmentType === 'in'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>স্টক ইন (যোগ)</span>
            </button>

            <button
              type="button"
              onClick={() => setAdjustmentType('out')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                adjustmentType === 'out'
                  ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <MinusCircle className="w-5 h-5 text-rose-600" />
              <span>স্টক আউট (বিয়োগ)</span>
            </button>

            <button
              type="button"
              onClick={() => setAdjustmentType('adjustment')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                adjustmentType === 'adjustment'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <RefreshCw className="w-5 h-5 text-indigo-600" />
              <span>নতুন স্টক সেট</span>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {adjustmentType === 'adjustment' ? 'সরাসরি নতুন স্টক পরিমাণ' : 'সমন্বয়ের পরিমাণ'} *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="w-full py-2.5 px-3.5 text-base font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Reason */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            সমন্বয়ের কারণ / বিবরণ *
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="যেমন: স্টক গণনা ভুল, মেয়াদোত্তীর্ণ বা ক্ষতিগ্রস্ত পণ্য বাদ"
            className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Link
            to="/inventory"
            className="py-2.5 px-5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 transition"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সমন্বয় সম্পন্ন করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
