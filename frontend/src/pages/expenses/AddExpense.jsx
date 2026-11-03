import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { WalletCards, ArrowLeft, Save } from 'lucide-react';
import api from '../../services/api';

export const AddExpense = () => {
  const { t } = useLanguage();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/expense-categories');
        setCategories(res.data || []);
        if (res.data?.length > 0) {
          setCategoryId(res.data[0].id);
        }
      } catch (e) {
        error('খরচের খাত লোড করতে ব্যর্থ হয়েছে।');
      }
    };
    fetchCats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      error('অনুগ্রহ করে খরচের খাত নির্বাচন করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/expenses', {
        expense_category_id: categoryId,
        expense_date: expenseDate,
        title,
        amount: Number(amount),
        payment_method: paymentMethod,
        reference,
        note,
      });

      success('নতুন খরচ সফলভাবে রেকর্ড করা হয়েছে!');
      navigate('/expenses');
    } catch (err) {
      error(err.response?.data?.message || 'খরচ সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/expenses"
          className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('addExpense')}
          </h1>
          <p className="text-xs text-slate-500">দোকানের নতুন পরিচালনা ব্যয় ও খরচের ভাউচার এন্ট্রি</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">খরচের খাত *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">খাত নির্বাচন করুন</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">খরচের তারিখ *</label>
            <input
              type="date"
              required
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">খরচের শিরোনাম / বিবরণ *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="যেমন: মাসিক দোকান ভাড়া পরিশোধ অথবা বিদ্যুৎ বিল"
            className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">খরচের পরিমাণ (৳) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full py-2.5 px-3.5 text-base font-bold text-rose-600 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">পরিশোধের মাধ্যম *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white capitalize"
            >
              <option value="cash">ক্যাশ (Cash Counter)</option>
              <option value="bank">ব্যাংক (Bank Transfer)</option>
              <option value="bkash">বিকাশ (bKash)</option>
              <option value="nagad">নগদ (Nagad)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ভাউচার / রেফারেন্স নম্বর</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="বিল নম্বর বা মানি রসিদ নম্বর..."
            className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">মন্তব্য / নোট</label>
          <textarea
            rows="2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="অতিরিক্ত কোনো তথ্য..."
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Link
            to="/expenses"
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
            <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : t('save')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

