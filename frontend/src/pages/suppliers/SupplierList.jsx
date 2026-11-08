import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Eye,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';

export const SupplierList = () => {
  const { user, hasPermission } = useAuth();
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { success, error } = useToast();

  const isSuperAdmin = user?.role?.slug === 'super-admin' || user?.email === 'admin@israfilbd.com';
  const canCreateSupplier = isSuperAdmin || hasPermission('suppliers.manage');
  const canDeleteSupplier = isSuperAdmin || hasPermission('suppliers.delete') || hasPermission('suppliers.manage');

  const [suppliers, setSuppliers] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_suppliers_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_suppliers_pagination');
      return cached ? JSON.parse(cached) : { current_page: 1, last_page: 1, total: 0 };
    } catch (e) {
      return { current_page: 1, last_page: 1, total: 0 };
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_suppliers_cache');
      return !cached || JSON.parse(cached).length === 0;
    } catch (e) {
      return true;
    }
  });

  // Multi-select & Delete Modal
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, isBulk: false });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSuppliers(pagination.current_page);
  }, [search, lang]);

  const fetchSuppliers = async (page = pagination.current_page) => {
    if (suppliers.length === 0) {
      setLoading(true);
    }
    try {
      const res = await api.get('/suppliers', {
        params: { page, search: search || undefined },
      });
      const loadedSuppliers = res.data.data || [];
      const loadedPagination = {
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      };
      setSuppliers(loadedSuppliers);
      setPagination(loadedPagination);

      try {
        const suppJson = JSON.stringify(loadedSuppliers);
        if (suppJson.length < 500000) {
          sessionStorage.setItem('israfil_suppliers_cache', suppJson);
          sessionStorage.setItem('israfil_suppliers_pagination', JSON.stringify(loadedPagination));
        }
      } catch (e) {}
    } catch (e) {
      error(lang === 'bn' ? 'সরবরাহকারী তালিকা লোড করতে সমস্যা হয়েছে।' : 'Failed to load supplier list.');
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
  const isAllSelected = suppliers.length > 0 && suppliers.every((s) => selectedIds.includes(s.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(suppliers.map((s) => s.id));
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
        const res = await api.post('/suppliers/bulk-delete', { ids: selectedIds });
        success(res.data.message || (lang === 'bn' ? 'নির্বাচিত সরবরাহকারী মুছে ফেলা হয়েছে।' : 'Suppliers deleted.'));
        setSelectedIds([]);
      } else if (deleteModal.item) {
        await api.delete(`/suppliers/${deleteModal.item.id}`);
        success(lang === 'bn' ? `"${deleteModal.item.name}" মুছে ফেলা হয়েছে।` : 'Supplier deleted successfully.');
        setSelectedIds((prev) => prev.filter((id) => id !== deleteModal.item.id));
      }
      setDeleteModal({ isOpen: false, item: null, isBulk: false });
      fetchSuppliers(pagination.current_page);
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
            <Truck className="w-7 h-7 text-indigo-600" />
            {t('supplierList')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? `মোট ${formatNumber(pagination.total)} জন নিবন্ধিত সরবরাহকারী ও দেনা হিসাব`
              : `Total ${formatNumber(pagination.total)} registered suppliers and payable balances`}
          </p>
        </div>

        {canCreateSupplier && (
          <Link
            to="/suppliers/new"
            className="py-2.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 self-start transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addSupplier')}</span>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'সরবরাহকারীর নাম, কোম্পানি বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by supplier, company or phone...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {canDeleteSupplier && selectedIds.length > 0 && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              {lang === 'bn'
                ? `${formatNumber(selectedIds.length)} টি সরবরাহকারী বাছাই করা হয়েছে`
                : `${selectedIds.length} supplier(s) selected`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="py-1 px-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              {lang === 'bn' ? 'বাছাই বাতিল' : 'Deselect'}
            </button>
            <button
              onClick={() => setDeleteModal({ isOpen: true, item: null, isBulk: true })}
              className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নির্বাচিতগুলো মুছুন' : 'Delete Selected'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Suppliers Table */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                {canDeleteSupplier && (
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                )}
                <th className="p-4">{lang === 'bn' ? 'সরবরাহকারী ও প্রতিষ্ঠান' : 'Supplier & Company'}</th>
                <th className="p-4">{lang === 'bn' ? 'মোবাইল' : 'Phone'}</th>
                <th className="p-4">{lang === 'bn' ? 'ঠিকানা' : 'Address'}</th>
                <th className="p-4 text-center">{lang === 'bn' ? 'মোট ক্রয়' : 'Purchases'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'দোকানের দেনা (Payable)' : 'Payable (Due)'}</th>
                <th className="p-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={canDeleteSupplier ? 7 : 6} className="p-8 text-center text-slate-400">
                    {t('loading')}
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={canDeleteSupplier ? 7 : 6} className="p-8 text-center text-slate-400">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => {
                  const hasDue = Number(s.current_balance) > 0;
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {canDeleteSupplier && (
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(s.id)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <div>{s.name}</div>
                        {s.company_name && <div className="text-[11px] text-slate-400 font-normal">{s.company_name}</div>}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">
                        {s.phone || '—'}
                      </td>
                      <td className="p-4 text-slate-500">
                        {s.address || '—'}
                      </td>
                      <td className="p-4 text-center font-bold text-indigo-600">
                        {s.purchases_count || 0} {lang === 'bn' ? 'টি' : 'orders'}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`font-black text-xs px-2.5 py-1 rounded-xl ${
                            hasDue
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'text-slate-500'
                          }`}
                        >
                          {formatCurrency(s.current_balance)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/suppliers/${s.id}`}
                            className="py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{lang === 'bn' ? 'বিবরণ' : 'Details'}</span>
                          </Link>
                          {canDeleteSupplier && (
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, item: s, isBulk: false })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
              onClick={() => fetchSuppliers(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchSuppliers(pagination.current_page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog Box */}
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

export default SupplierList;
