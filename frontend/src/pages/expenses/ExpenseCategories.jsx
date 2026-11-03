import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { FolderTree, Plus, Save, Layers, Search, Trash2 } from 'lucide-react';
import api from '../../services/api';

export const ExpenseCategories = () => {
  const { t, lang, formatNumber } = useLanguage();
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [lang]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/expense-categories');
      setCategories(res.data || []);
    } catch (e) {
      error(lang === 'bn' ? 'খরচের খাত লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load expense categories.');
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

      success(lang === 'bn' ? 'নতুন খরচের খাত সফলভাবে তৈরি হয়েছে!' : 'New expense category created!');
      setName('');
      setNameBn('');
      setDescription('');
      fetchCategories();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expense-categories/${id}`);
      success(lang === 'bn' ? 'খাতটি মুছে ফেলা হয়েছে।' : 'Category deleted successfully.');
      setDeleteConfirmId(null);
      fetchCategories();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ হয়েছে।' : 'Failed to delete.'));
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.name_bn?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Layers className="w-7 h-7 text-indigo-600" />
          {t('expenseCategories')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {lang === 'bn' ? 'দোকানের নিয়মিত খরচের খাতসমূহ (যেমন: দোকান ভাড়া, বিদ্যুৎ বিল, পরিবহন)' : 'Manage store expense categories (Rent, Utilities, Supplies)'}
        </p>
      </div>

      {deleteConfirmId && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 flex items-center justify-between">
          <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
            {lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই খরচের খাতটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this category?'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              className="py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition"
            >
              {lang === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="py-1 px-3 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Create Form (NO MODAL) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            {lang === 'bn' ? 'নতুন খরচের খাত যোগ করুন' : 'Add New Category'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'খাতের নাম (English) *' : 'Category Name (English) *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shop Rent"
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'খাতের নাম (বাংলা)' : 'Category Name (Bangla)'}
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: দোকান ভাড়া"
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'বিবরণ' : 'Description'}
              </label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={lang === 'bn' ? 'খাত সংক্রান্ত সংক্ষিপ্ত বিবরণ...' : 'Short description...'}
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center justify-center gap-1.5 transition disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                  : (lang === 'bn' ? 'খাত তৈরি করুন' : 'Create Category')}
              </span>
            </button>
          </form>
        </div>

        {/* Right: Table */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? `মোট ${formatNumber(categories.length)} টি খরচের খাত` : `Total ${formatNumber(categories.length)} Expense Categories`}
            </span>
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'খাত খুঁজুন...' : 'Search categories...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5">{lang === 'bn' ? 'খাতের নাম' : 'Category Name'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'বিবরণ' : 'Description'}</th>
                  <th className="p-3.5 text-center">{lang === 'bn' ? 'মোট খরচের সংখ্যা' : 'Expenses'}</th>
                  <th className="p-3.5 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan="4" className="p-6 text-center text-slate-400">{t('loading')}</td></tr>
                ) : filteredCategories.length === 0 ? (
                  <tr><td colSpan="4" className="p-6 text-center text-slate-400">{t('noData')}</td></tr>
                ) : (
                  filteredCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div>{c.name}</div>
                        {c.name_bn && <div className="text-[11px] text-slate-400 font-normal">{c.name_bn}</div>}
                      </td>
                      <td className="p-3.5 text-slate-500">{c.description || '—'}</td>
                      <td className="p-3.5 text-center font-bold text-indigo-600">{c.expenses_count || 0}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setDeleteConfirmId(c.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                          title={t('delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ExpenseCategories;
