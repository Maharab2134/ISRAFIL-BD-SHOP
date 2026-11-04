import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Layers, Plus, Edit, Trash2, Save, X, Search, CheckCircle2, FileJson } from 'lucide-react';
import api from '../../services/api';
import InlineJsonImport from '../../components/common/InlineJsonImport';

export const Categories = () => {
  const { t, lang, formatNumber } = useLanguage();
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('active');
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const sampleCategories = [
    {
      name: 'Cosmetics & Personal Care',
      name_bn: 'কসমেটিকস ও রূপচর্চা',
      code: 'CAT-COSM',
      status: 'active'
    },
    {
      name: 'Electronics & Gadgets',
      name_bn: 'ইলেকট্রনিক্স ও গ্যাজেটস',
      code: 'CAT-ELEC',
      status: 'active'
    },
    {
      name: 'Food & Groceries',
      name_bn: 'খাদ্য ও মুদি পণ্য',
      code: 'CAT-GROC',
      status: 'active'
    }
  ];

  useEffect(() => {
    fetchCategories();
  }, [lang]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (e) {
      error(lang === 'bn' ? 'ক্যাটাগরি তালিকা লোড করতে সমস্যা হয়েছে।' : 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setNameBn(cat.name_bn || '');
    setCode(cat.code || '');
    setStatus(cat.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setNameBn('');
    setCode('');
    setStatus('active');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, {
          name,
          name_bn: nameBn,
          code,
          status,
        });
        success(lang === 'bn' ? 'ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!' : 'Category updated successfully!');
      } else {
        await api.post('/categories', {
          name,
          name_bn: nameBn,
          code,
          status,
        });
        success(lang === 'bn' ? 'নতুন ক্যাটাগরি তৈরি করা হয়েছে!' : 'New category created successfully!');
      }
      handleCancel();
      fetchCategories();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      success(lang === 'bn' ? 'ক্যাটাগরি মুছে ফেলা হয়েছে।' : 'Category deleted successfully.');
      setDeleteConfirmId(null);
      fetchCategories();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ হয়েছে।' : 'Failed to delete.'));
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.name_bn?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-600" />
            {t('categories')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'bn' ? 'পণ্য ক্যাটাগরি তৈরি ও পরিচালনা করুন' : 'Create and manage product categories'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowImport(!showImport)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition border ${
            showImport
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 shadow-sm'
          }`}
        >
          <FileJson className="w-4 h-4" />
          <span>{lang === 'bn' ? 'categories.json ইমপোর্ট' : 'Import categories.json'}</span>
        </button>
      </div>

      {showImport && (
        <InlineJsonImport
          title={lang === 'bn' ? 'ক্যাটাগরি বাল্ক ইমপোর্ট (categories.json)' : 'Category Bulk Import (categories.json)'}
          endpoint="/categories/import-json"
          sampleFilename="categories.json"
          sampleData={sampleCategories}
          onSuccess={() => fetchCategories()}
          onClose={() => setShowImport(false)}
        />
      )}

      {deleteConfirmId && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 flex items-center justify-between">
          <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
            {lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি মুছে ফেলতে চান?' : 'Are you sure you want to delete this category?'}
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
        {/* Left: Dedicated Form Card (NO MODAL POLICY) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingId
                ? (lang === 'bn' ? 'ক্যাটাগরি সম্পাদন' : 'Edit Category')
                : (lang === 'bn' ? 'নতুন ক্যাটাগরি যোগ করুন' : 'Add New Category')}
            </h2>
            {editingId && (
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'নাম (English) *' : 'Name (English) *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mobile Accessories"
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'}
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: মোবাইল এক্সেসরিজ"
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'কোড (ঐচ্ছিক)' : 'Code (Optional)'}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CAT-MOB"
                className="w-full py-2 px-3 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('status')}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">{t('active')}</option>
                <option value="inactive">{t('inactive')}</option>
              </select>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center justify-center gap-1.5 transition disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {editingId
                    ? (lang === 'bn' ? 'আপডেট করুন' : 'Update')
                    : (lang === 'bn' ? 'যোগ করুন' : 'Add Category')}
                </span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  {t('cancel')}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Categories Table */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? `মোট ${formatNumber(categories.length)} টি ক্যাটাগরি` : `Total ${formatNumber(categories.length)} Categories`}
            </span>
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'ক্যাটাগরি খুঁজুন...' : 'Search categories...'}
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
                  <th className="p-3.5">{lang === 'bn' ? 'ক্যাটাগরি নাম' : 'Category Name'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'কোড' : 'Code'}</th>
                  <th className="p-3.5 text-center">{lang === 'bn' ? 'পণ্য সংখ্যা' : 'Products'}</th>
                  <th className="p-3.5 text-center">{t('status')}</th>
                  <th className="p-3.5 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      {t('loading')}
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      {t('noData')}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div>{cat.name}</div>
                        {cat.name_bn && <div className="text-[11px] font-normal text-slate-400">{cat.name_bn}</div>}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {cat.code || '—'}
                      </td>
                      <td className="p-3.5 text-center font-bold text-indigo-600">
                        {cat.products_count || 0}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            cat.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(cat)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title={t('edit')}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(cat.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
export default Categories;
