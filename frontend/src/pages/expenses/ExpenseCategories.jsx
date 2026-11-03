import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { FolderTree, Plus, Save } from 'lucide-react';
import api from '../../services/api';

export const ExpenseCategories = () => {
  const { t } = useLanguage();
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/expense-categories');
      setCategories(res.data || []);
    } catch (e) {
      error('খরচের খাত লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/expense-categories', {
        name,
        name_bn: nameBn,
        description,
      });

      success('নতুন খরচের খাত সফলভাবে তৈরি হয়েছে!');
      setName('');
      setNameBn('');
      setDescription('');
      fetchCategories();
    } catch (err) {
      error(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('expenseCategories')}
        </h1>
        <p className="text-sm text-slate-500">দোকানের নিয়মিত খরচের খাতসমূহ (যেমন: ভাড়া, বিদ্যুৎ, বেতন)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Create Form (NO MODAL) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            নতুন খরচের খাত যোগ করুন
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">খাতের নাম (English) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shop Rent"
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">খাতের নাম (বাংলা)</label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: দোকান ভাড়া"
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">বিবরণ</label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="খাত সংক্রান্ত সংক্ষিপ্ত বিবরণ..."
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center justify-center gap-1.5 transition disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'খাত তৈরি করুন'}</span>
            </button>
          </form>
        </div>

        {/* Right: Table */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              মোট {categories.length} টি খরচের খাত
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="p-3.5">খাতের নাম</th>
                <th className="p-3.5">বিবরণ</th>
                <th className="p-3.5 text-center">মোট খরচের সংখ্যা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="3" className="p-6 text-center text-slate-400">লোড হচ্ছে...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="3" className="p-6 text-center text-slate-400">কোনো খরচের খাত নেই।</td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{c.name}</div>
                      {c.name_bn && <div className="text-[11px] text-slate-400 font-normal">{c.name_bn}</div>}
                    </td>
                    <td className="p-3.5 text-slate-500">{c.description || '—'}</td>
                    <td className="p-3.5 text-center font-bold text-indigo-600">{c.expenses_count || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
