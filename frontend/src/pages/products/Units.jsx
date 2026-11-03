import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Scale, Plus, Edit, Trash2, Save, X, Search } from 'lucide-react';
import api from '../../services/api';

export const Units = () => {
  const { t, lang, formatNumber } = useLanguage();
  const { success, error } = useToast();

  const [units, setUnits] = useState([]);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('active');
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchUnits();
  }, [lang]);

  const fetchUnits = async () => {
    try {
      const res = await api.get('/units');
      setUnits(res.data || []);
    } catch (e) {
      error(lang === 'bn' ? 'একক তালিকা লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load units.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (u) => {
    setEditingId(u.id);
    setName(u.name);
    setNameBn(u.name_bn || '');
    setCode(u.code);
    setStatus(u.status);
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
        await api.put(`/units/${editingId}`, { name, name_bn: nameBn, code, status });
        success(lang === 'bn' ? 'একক সফলভাবে আপডেট হয়েছে!' : 'Unit updated successfully!');
      } else {
        await api.post('/units', { name, name_bn: nameBn, code, status });
        success(lang === 'bn' ? 'নতুন একক যুক্ত হয়েছে!' : 'New unit added successfully!');
      }
      handleCancel();
      fetchUnits();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/units/${id}`);
      success(lang === 'bn' ? 'একক মুছে ফেলা হয়েছে।' : 'Unit deleted successfully.');
      setDeleteConfirmId(null);
      fetchUnits();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ হয়েছে।' : 'Failed to delete.'));
    }
  };

  const filteredUnits = units.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.name_bn?.toLowerCase().includes(q) ||
      u.code?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Scale className="w-7 h-7 text-indigo-600" />
          {t('units')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {lang === 'bn' ? 'পণ্যের পরিমাপক একক (যেমন: পিস, কেজি, লিটার) পরিচালনা' : 'Manage measurement units (pcs, kg, ltr)'}
        </p>
      </div>

      {deleteConfirmId && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 flex items-center justify-between">
          <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
            {lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই এককটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this unit?'}
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
        {/* Left: Dedicated Form Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingId
                ? (lang === 'bn' ? 'একক সম্পাদন' : 'Edit Unit')
                : (lang === 'bn' ? 'নতুন একক যোগ করুন' : 'Add New Unit')}
            </h2>
            {editingId && (
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'এককের নাম (English) *' : 'Unit Name (English) *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Piece"
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'এককের নাম (বাংলা)' : 'Unit Name (Bangla)'}
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: পিস"
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'সংক্ষিপ্ত কোড *' : 'Short Code *'}
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. pcs"
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
                    : (lang === 'bn' ? 'যোগ করুন' : 'Add Unit')}
                </span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100"
                >
                  {t('cancel')}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Units Table */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? `মোট ${formatNumber(units.length)} টি একক` : `Total ${formatNumber(units.length)} Units`}
            </span>
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'একক খুঁজুন...' : 'Search units...'}
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
                  <th className="p-3.5">{lang === 'bn' ? 'একক নাম' : 'Unit Name'}</th>
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
                ) : filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      {t('noData')}
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div>{u.name}</div>
                        {u.name_bn && <div className="text-[11px] font-normal text-slate-400">{u.name_bn}</div>}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-indigo-600">
                        {u.code}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                        {u.products_count || 0}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            u.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title={t('edit')}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(u.id)}
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
export default Units;
