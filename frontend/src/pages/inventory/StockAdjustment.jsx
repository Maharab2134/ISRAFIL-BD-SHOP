import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Sliders, ArrowLeft, Save, PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { BackButton } from '../../components/common/BackButton';

export const StockAdjustment = () => {
  const [searchParams] = useSearchParams();
  const initialProductId = searchParams.get('product_id') || '';

  const { t, lang } = useLanguage();
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
        const res = await api.get('/products?per_page=1000');
        setProducts(res.data.data || []);
      } catch (e) {
        error(lang === 'bn' ? 'পণ্য লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load products.');
      }
    };
    fetchProducts();
  }, [lang]);

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      error(lang === 'bn' ? 'অনুগ্রহ করে একটি পণ্য নির্বাচন করুন।' : 'Please select a product.');
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

      success(lang === 'bn' ? 'স্টক সমন্বয় সফলভাবে সম্পন্ন হয়েছে!' : 'Stock adjustment completed successfully!');
      navigate('/inventory');
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'স্টক সমন্বয় ব্যর্থ হয়েছে।' : 'Failed to adjust stock.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <BackButton fallback="/inventory" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('stockAdjustment')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'মজুদ পণ্যের হিসাব সরাসরি সমন্বয় করুন' : 'Manually increment, decrement, or calibrate product stock'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
        {/* Product Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {lang === 'bn' ? 'পণ্য নির্বাচন করুন *' : 'Select Product *'}
          </label>
          <select
            required
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">{lang === 'bn' ? 'পণ্য বেছে নিন' : 'Choose a product'}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {lang === 'bn' ? (p.name_bn || p.name) : p.name} ({p.barcode}) — {lang === 'bn' ? 'বর্তমান স্টক:' : 'Stock:'} {p.current_stock}
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">{lang === 'bn' ? 'বর্তমান স্টক:' : 'Current In-Stock:'}</span>
              <span className="ml-2 font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                {selectedProduct.current_stock} {lang === 'bn' ? (selectedProduct.unit?.name_bn || 'পিস') : (selectedProduct.unit?.name || 'pcs')}
              </span>
            </div>
            <div>
              <span className="text-slate-500">{lang === 'bn' ? 'সতর্কতা লেভেল:' : 'Alert Level:'}</span>
              <span className="ml-2 font-bold text-slate-700 dark:text-slate-300">
                {selectedProduct.alert_stock}
              </span>
            </div>
          </div>
        )}

        {/* Adjustment Type Radios */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            {lang === 'bn' ? 'সমন্বয়ের ধরন (Type) *' : 'Adjustment Type *'}
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setAdjustmentType('in')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                adjustmentType === 'in'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              <span>{lang === 'bn' ? 'স্টক বৃদ্ধি (In)' : 'Add Stock (In)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAdjustmentType('out')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                adjustmentType === 'out'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <MinusCircle className="w-5 h-5 text-rose-500" />
              <span>{lang === 'bn' ? 'স্টক হ্রাস / ক্ষতি (Out)' : 'Remove Stock (Out)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAdjustmentType('adjustment')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                adjustmentType === 'adjustment'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <RefreshCw className="w-5 h-5 text-indigo-500" />
              <span>{lang === 'bn' ? 'সরাসরি সেট করুন' : 'Calibrate Set'}</span>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {adjustmentType === 'adjustment'
              ? (lang === 'bn' ? 'সরাসরি মোট স্টক সংখ্যা *' : 'Exact Target Stock *')
              : (lang === 'bn' ? 'পরিবর্তনকৃত পরিমাণ (Quantity) *' : 'Quantity to Add/Remove *')}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
            className="w-full py-2.5 px-3.5 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Reason / Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {lang === 'bn' ? 'সমন্বয়ের কারণ (বাধ্যতামূলক) *' : 'Reason / Note *'}
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={lang === 'bn' ? 'উদা: নষ্ট পণ্য বাদ, শারীরিক অডিট গণনা, ইত্যাদি' : 'e.g. Physical inventory count, damaged item, etc.'}
            className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Link
            to="/inventory"
            className="py-2.5 px-5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'সমন্বয় নিশ্চিত করুন' : 'Confirm Adjustment')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockAdjustment;
