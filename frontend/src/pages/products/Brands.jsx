import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { FolderTree, Plus, Edit, Trash2, Save, X, Search, FileJson } from 'lucide-react';
import api from '../../services/api';
import { InlineJsonImport } from '../../components/common/InlineJsonImport';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';

export const Brands = () => {
  const { t, lang, formatNumber } = useLanguage();
  const { success, error } = useToast();

  const [brands, setBrands] = useState([]);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [status, setStatus] = useState('active');
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, isBulk: false });
  const [deleting, setDeleting] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const sampleBrands = [
    {
      name: 'Samsung',
      name_bn: 'স্যামসাং',
      status: 'active'
    },
    {
      name: 'Unilever',
      name_bn: 'ইউনিলিভার',
      status: 'active'
    },
    {
      name: 'Pran',
      name_bn: 'প্রাণ',
      status: 'active'
    },
    {
      name: 'Square',
      name_bn: 'স্কয়ার',
      status: 'active'
    }
  ];

  useEffect(() => {
    fetchBrands();
  }, [lang]);

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands');
      setBrands(res.data || []);
    } catch (e) {
      error(lang === 'bn' ? 'ব্র্যান্ড তালিকা লোড করতে সমস্যা হয়েছে।' : 'Failed to load brands.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (b) => {
    setEditingId(b.id);
    setName(b.name);
    setNameBn(b.name_bn || '');
    setStatus(b.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setNameBn('');
    setStatus('active');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/brands/${editingId}`, { name, name_bn: nameBn, status });
        success(lang === 'bn' ? 'ব্র্যান্ড সফলভাবে আপডেট হয়েছে!' : 'Brand updated successfully!');
      } else {
        await api.post('/brands', { name, name_bn: nameBn, status });
        success(lang === 'bn' ? 'নতুন ব্র্যান্ড যুক্ত হয়েছে!' : 'New brand added successfully!');
      }
      handleCancel();
      fetchBrands();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBrands = brands.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return b.name?.toLowerCase().includes(q) || b.name_bn?.toLowerCase().includes(q);
  });

  const allVisibleIds = filteredBrands.map((b) => b.id);
  const isAllSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(selectedIds.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds([...new Set([...selectedIds, ...allVisibleIds])]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      if (deleteModal.isBulk) {
        const res = await api.post('/brands/bulk-delete', { ids: selectedIds });
        success(res.data.message || (lang === 'bn' ? 'নির্বাচিত ব্র্যান্ডগুলো মুছে ফেলা হয়েছে।' : 'Brands deleted.'));
        setSelectedIds([]);
      } else if (deleteModal.item) {
        await api.delete(`/brands/${deleteModal.item.id}`);
        success(lang === 'bn' ? `"${deleteModal.item.name}" মুছে ফেলা হয়েছে।` : 'Brand deleted successfully.');
        setSelectedIds((prev) => prev.filter((id) => id !== deleteModal.item.id));
      }
      setDeleteModal({ isOpen: false, item: null, isBulk: false });
      fetchBrands();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ হয়েছে।' : 'Failed to delete.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-indigo-600" />
            {t('brands')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'bn' ? 'পণ্য প্রস্তুতকারক ও ব্র্যান্ড পরিচালনা করুন' : 'Manage product brands and manufacturers'}
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
          <span>{lang === 'bn' ? 'brands.json ইমপোর্ট' : 'Import brands.json'}</span>
        </button>
      </div>

      {showImport && (
        <InlineJsonImport
          title={lang === 'bn' ? 'ব্র্যান্ড বাল্ক ইমপোর্ট (brands.json)' : 'Brand Bulk Import (brands.json)'}
          endpoint="/brands/import-json"
          sampleFilename="brands.json"
          sampleData={sampleBrands}
          onSuccess={() => fetchBrands()}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Bulk Action Bar when items are selected */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              {lang === 'bn' ? `মোট ${formatNumber(selectedIds.length)} টি ব্র্যান্ড নির্বাচিত হয়েছে` : `${selectedIds.length} brands selected`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {lang === 'bn' ? 'বাছাই বাতিল' : 'Deselect'}
            </button>
            <button
              type="button"
              onClick={() => setDeleteModal({ isOpen: true, item: null, isBulk: true })}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition flex items-center gap-1.5 shadow-sm shadow-rose-600/30 cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নির্বাচিতগুলো মুছুন' : 'Delete Selected'}</span>
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
                ? (lang === 'bn' ? 'ব্র্যান্ড সম্পাদন' : 'Edit Brand')
                : (lang === 'bn' ? 'নতুন ব্র্যান্ড যোগ করুন' : 'Add New Brand')}
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
                {lang === 'bn' ? 'নাম (English) *' : 'Brand Name (English) *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Walton"
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'নাম (বাংলা)' : 'Brand Name (Bangla)'}
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: ওয়ালটন"
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    : (lang === 'bn' ? 'যোগ করুন' : 'Add Brand')}
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

        {/* Right: Brands Table */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? `মোট ${formatNumber(brands.length)} টি ব্র্যান্ড` : `Total ${formatNumber(brands.length)} Brands`}
            </span>
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'ব্র্যান্ড খুঁজুন...' : 'Search brands...'}
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
                  <th className="p-3.5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      title={lang === 'bn' ? 'সবগুলো নির্বাচন করুন' : 'Select All'}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">{lang === 'bn' ? 'ব্র্যান্ড নাম' : 'Brand Name'}</th>
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
                ) : filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      {t('noData')}
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((b) => {
                    const isSelected = selectedIds.includes(b.id);
                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                          isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(b.id)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          <div>{b.name}</div>
                          {b.name_bn && <div className="text-[11px] font-normal text-slate-400">{b.name_bn}</div>}
                        </td>
                        <td className="p-3.5 text-center font-bold text-indigo-600">
                          {b.products_count || 0}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              b.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(b)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title={t('edit')}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ isOpen: true, item: b, isBulk: false })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title={t('delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      </div>

      {/* Delete Confirmation Dialog Box */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, isBulk: false })}
        onConfirm={handleConfirmDelete}
        itemName={deleteModal.item?.name}
        count={deleteModal.isBulk ? selectedIds.length : 1}
        loading={deleting}
      />
    </div>
  );
};
export default Brands;
