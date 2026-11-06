import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  WalletCards,
  Plus,
  Search,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';

export const ExpenseList = () => {
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { success, error } = useToast();

  const [expenses, setExpenses] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_expenses_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_expenses_pagination');
      return cached ? JSON.parse(cached) : { current_page: 1, last_page: 1, total: 0 };
    } catch (e) {
      return { current_page: 1, last_page: 1, total: 0 };
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_expenses_cache');
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
    const fetchCats = async () => {
      try {
        const res = await api.get('/expense-categories');
        setCategories(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchExpenses(pagination.current_page);
  }, [search, selectedCat, startDate, endDate, lang]);

  const fetchExpenses = async (page = pagination.current_page) => {
    if (expenses.length === 0) {
      setLoading(true);
    }
    try {
      const params = {
        page,
        search: search || undefined,
        expense_category_id: selectedCat || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };
      const res = await api.get('/expenses', { params });
      const loadedExpenses = res.data.data || [];
      const loadedPagination = {
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      };
      setExpenses(loadedExpenses);
      setPagination(loadedPagination);

      try {
        const expJson = JSON.stringify(loadedExpenses);
        if (expJson.length < 500000) {
          sessionStorage.setItem('israfil_expenses_cache', expJson);
          sessionStorage.setItem('israfil_expenses_pagination', JSON.stringify(loadedPagination));
        }
      } catch (e) {}
    } catch (e) {
      error(lang === 'bn' ? 'খরচের তালিকা লোড করতে সমস্যা হয়েছে।' : 'Failed to load expense list.');
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
  const isAllSelected = expenses.length > 0 && expenses.every((ex) => selectedIds.includes(ex.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expenses.map((ex) => ex.id));
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
        const res = await api.post('/expenses/bulk-delete', { ids: selectedIds });
        success(res.data.message || (lang === 'bn' ? 'নির্বাচিত খরচ মুছে ফেলা হয়েছে।' : 'Expenses deleted.'));
        setSelectedIds([]);
      } else if (deleteModal.item) {
        await api.delete(`/expenses/${deleteModal.item.id}`);
        success(lang === 'bn' ? `"${deleteModal.item.title}" মুছে ফেলা হয়েছে।` : 'Expense deleted successfully.');
        setSelectedIds((prev) => prev.filter((id) => id !== deleteModal.item.id));
      }
      setDeleteModal({ isOpen: false, item: null, isBulk: false });
      fetchExpenses(pagination.current_page);
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
            <WalletCards className="w-7 h-7 text-indigo-600" />
            {t('expenseList')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'দোকান পরিচালনা ব্যয়, বিল, পরিবহন ও অন্যান্য খরচের হিসাব'
              : 'Store operating expenses, utility bills, rent, and overheads'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <Link
            to="/expenses/categories"
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition"
          >
            <FolderTree className="w-4 h-4" />
            <span>{t('expenseCategories')}</span>
          </Link>
          <Link
            to="/expenses/new"
            className="py-2.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addExpense')}</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'শিরোনাম বা বিবরণ...' : 'Search title or notes...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
        >
          <option value="">{lang === 'bn' ? 'সকল খরচের খাত' : 'All Categories'}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {lang === 'bn' ? (c.name_bn || c.name) : c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
        />
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              {lang === 'bn'
                ? `${formatNumber(selectedIds.length)} টি খরচ বাছাই করা হয়েছে`
                : `${selectedIds.length} expense(s) selected`}
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

      {/* Expenses Table */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="p-4">{lang === 'bn' ? 'খরচের খাত' : 'Category'}</th>
                <th className="p-4">{lang === 'bn' ? 'শিরোনাম ও বিবরণ' : 'Title & Notes'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'পরিমাণ (টাকা)' : 'Amount (৳)'}</th>
                <th className="p-4 text-center">{lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}</th>
                <th className="p-4">{lang === 'bn' ? 'দায়িত্বপ্রাপ্ত' : 'Recorded By'}</th>
                <th className="p-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    {t('loading')}
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                expenses.map((ex) => {
                  const isSelected = selectedIds.includes(ex.id);
                  return (
                    <tr
                      key={ex.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(ex.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-slate-500 font-mono">
                        {new Date(ex.expense_date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {lang === 'bn'
                          ? (ex.category?.name_bn || ex.category?.name || '—')
                          : (ex.category?.name || '—')}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{ex.title}</div>
                        {ex.notes && <div className="text-[11px] text-slate-400">{ex.notes}</div>}
                      </td>
                      <td className="p-4 text-right font-black text-rose-600 dark:text-rose-400">
                        {formatCurrency(ex.amount)}
                      </td>
                      <td className="p-4 text-center capitalize font-medium text-slate-600 dark:text-slate-300">
                        {ex.payment_method}
                      </td>
                      <td className="p-4 text-slate-500">
                        {ex.user?.name || '—'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, item: ex, isBulk: false })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              onClick={() => fetchExpenses(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchExpenses(pagination.current_page + 1)}
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
        itemName={deleteModal.item?.title}
        count={deleteModal.isBulk ? selectedIds.length : 1}
        loading={deleting}
      />
    </div>
  );
};

export default ExpenseList;
