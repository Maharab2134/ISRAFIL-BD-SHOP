import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Eye,
  CreditCard,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
  Edit,
  X,
  Save,
  UserCheck,
  MapPin,
  Mail,
} from 'lucide-react';
import api from '../../services/api';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { useAuth } from '../../context/AuthContext';

export const CustomerList = () => {
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { success, error } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.slug === 'super-admin' || user?.email === 'admin@israfilbd.com';

  const [customers, setCustomers] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_customers_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [search, setSearch] = useState('');
  const [hasDueOnly, setHasDueOnly] = useState(false);
  const [pagination, setPagination] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_customers_pagination');
      return cached ? JSON.parse(cached) : { current_page: 1, last_page: 1, total: 0 };
    } catch (e) {
      return { current_page: 1, last_page: 1, total: 0 };
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_customers_cache');
      return !cached || JSON.parse(cached).length === 0;
    } catch (e) {
      return true;
    }
  });

  // Multi-select & Delete Modal
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, isBulk: false });
  const [deleting, setDeleting] = useState(false);

  // Edit Customer Modal State
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    name_bn: '',
    phone: '',
    email: '',
    address: '',
    credit_limit: '10000',
    loyalty_points: '0',
    status: 'active',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setEditFormData({
      name: c.name || '',
      name_bn: c.name_bn || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      credit_limit: c.credit_limit !== null ? String(c.credit_limit) : '10000',
      loyalty_points: c.loyalty_points !== null ? String(c.loyalty_points) : '0',
      status: c.status || 'active',
    });
  };

  const handleCloseEdit = () => {
    setEditingCustomer(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      error(lang === 'bn' ? 'গ্রাহকের নাম আবশ্যক।' : 'Customer name is required.');
      return;
    }
    if (!editFormData.phone.trim()) {
      error(lang === 'bn' ? 'মোবাইল নম্বর আবশ্যক।' : 'Phone number is required.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await api.put(`/customers/${editingCustomer.id}`, {
        name: editFormData.name.trim(),
        name_bn: editFormData.name_bn.trim() || null,
        phone: editFormData.phone.trim(),
        email: editFormData.email.trim() || null,
        address: editFormData.address.trim() || null,
        credit_limit: editFormData.credit_limit ? Number(editFormData.credit_limit) : 0,
        loyalty_points: editFormData.loyalty_points ? parseInt(editFormData.loyalty_points, 10) : 0,
        status: editFormData.status,
      });

      const updated = res.data.customer;
      setCustomers((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      success(lang === 'bn' ? 'গ্রাহকের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Customer updated successfully!');
      handleCloseEdit();
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'গ্রাহকের তথ্য আপডেট করতে ব্যর্থ হয়েছে।' : 'Failed to update customer.');
      error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchCustomers(pagination.current_page);
  }, [search, hasDueOnly, lang]);

  const fetchCustomers = async (page = pagination.current_page) => {
    if (customers.length === 0) {
      setLoading(true);
    }
    try {
      const params = {
        page,
        search: search || undefined,
        has_due: hasDueOnly ? 1 : undefined,
      };
      const res = await api.get('/customers', { params });
      const loadedCustomers = res.data.data || [];
      const loadedPagination = {
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      };
      setCustomers(loadedCustomers);
      setPagination(loadedPagination);

      try {
        const custJson = JSON.stringify(loadedCustomers);
        if (custJson.length < 500000) {
          sessionStorage.setItem('israfil_customers_cache', custJson);
          sessionStorage.setItem('israfil_customers_pagination', JSON.stringify(loadedPagination));
        }
      } catch (e) {}
    } catch (e) {
      error(lang === 'bn' ? 'গ্রাহক তালিকা লোড করতে সমস্যা হয়েছে।' : 'Failed to load customer list.');
    } finally {
      setLoading(false);
    }
  };

  const allVisibleIds = customers.map((c) => c.id);
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
        const res = await api.post('/customers/bulk-delete', { ids: selectedIds });
        success(res.data.message || (lang === 'bn' ? 'নির্বাচিত গ্রাহক মুছে ফেলা হয়েছে।' : 'Customers deleted.'));
        setSelectedIds([]);
      } else if (deleteModal.item) {
        await api.delete(`/customers/${deleteModal.item.id}`);
        success(lang === 'bn' ? `"${deleteModal.item.name}" মুছে ফেলা হয়েছে।` : 'Customer deleted successfully.');
        setSelectedIds((prev) => prev.filter((id) => id !== deleteModal.item.id));
      }
      setDeleteModal({ isOpen: false, item: null, isBulk: false });
      fetchCustomers(pagination.current_page);
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
            <Users className="w-7 h-7 text-indigo-600" />
            {t('customerList')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? `মোট ${formatNumber(pagination.total)} জন নিবন্ধিত গ্রাহক ও তাদের বকেয়া লেজার`
              : `Total ${formatNumber(pagination.total)} registered customers and due balances`}
          </p>
        </div>

        <Link
          to="/customers/new"
          className="py-2.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 self-start transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addCustomer')}</span>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'গ্রাহকের নাম, মোবাইল নম্বর দিয়ে খুঁজুন...' : 'Search by name or phone...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <button
          onClick={() => setHasDueOnly(!hasDueOnly)}
          className={`py-2 px-4 rounded-xl text-xs font-bold border transition shrink-0 ${
            hasDueOnly
              ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {lang === 'bn' ? 'শুধুমাত্র বকেয়া যুক্ত গ্রাহক' : 'Customers with Due Only'}
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              {lang === 'bn'
                ? `${formatNumber(selectedIds.length)} টি গ্রাহক বাছাই করা হয়েছে`
                : `${selectedIds.length} customer(s) selected`}
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

      {/* Customers Table */}
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
                <th className="p-4">{lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'}</th>
                <th className="p-4">{lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}</th>
                <th className="p-4 text-center">{lang === 'bn' ? 'মোট ক্রয়' : 'Total Orders'}</th>
                <th className="p-4 text-center">{lang === 'bn' ? 'লয়ালটি পয়েন্ট' : 'Loyalty Points'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'বর্তমান বকেয়া (Due)' : 'Current Due'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'ক্রেডিট লিমিট' : 'Credit Limit'}</th>
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
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const hasDue = Number(c.current_balance) > 0;
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(c.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <div>{c.name}</div>
                        {c.address && <div className="text-[11px] text-slate-400 font-normal">{c.address}</div>}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">
                        {c.phone || '—'}
                      </td>
                      <td className="p-4 text-center font-bold text-indigo-600">
                        {c.sales_count} {lang === 'bn' ? 'টি' : 'orders'}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{c.loyalty_points || 0} pt</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`font-black text-xs px-2.5 py-1 rounded-xl ${
                            hasDue
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'text-slate-500'
                          }`}
                        >
                          {formatCurrency(c.current_balance)}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-500 font-medium">
                        {formatCurrency(c.credit_limit)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/customers/${c.id}`}
                            className="py-1.5 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition inline-flex items-center gap-1 text-xs"
                            title={lang === 'bn' ? 'লেজার দেখুন' : 'View Ledger'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{lang === 'bn' ? 'লেজার' : 'Ledger'}</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                            title={lang === 'bn' ? 'সম্পাদন করুন' : 'Edit Customer'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const hasSalesOrDue = (c.sales_count || 0) > 0 || Number(c.current_balance || 0) > 0;
                              if (!isSuperAdmin && hasSalesOrDue) {
                                error(lang === 'bn' ? 'এই গ্রাহকের বিক্রয় রেকর্ড অথবা বকেয়া ব্যালেন্স রয়েছে। এটি মুছে ফেলার অনুমতি শুধুমাত্র সুপার অ্যাডমিনের রয়েছে।' : 'This customer has sales or due balance. Only Super Admin can delete.');
                                return;
                              }
                              setDeleteModal({ isOpen: true, item: c, isBulk: false });
                            }}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              !isSuperAdmin && ((c.sales_count || 0) > 0 || Number(c.current_balance || 0) > 0)
                                ? 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800'
                                : 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            }`}
                            title={
                              !isSuperAdmin && ((c.sales_count || 0) > 0 || Number(c.current_balance || 0) > 0)
                                ? (lang === 'bn' ? 'সক্রিয় বিক্রয়/বকেয়া থাকায় কেবল সুপার অ্যাডমিন মুছতে পারবেন' : 'Only Super Admin can delete')
                                : (lang === 'bn' ? 'মুছে ফেলুন' : 'Delete')
                            }
                          >
                            <Trash2 className="w-4 h-4" />
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
              onClick={() => fetchCustomers(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchCustomers(pagination.current_page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'গ্রাহকের তথ্য সম্পাদন' : 'Edit Customer'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ID #{editingCustomer.id} • {editingCustomer.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/customers/${editingCustomer.id}/edit`}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  {lang === 'bn' ? 'পূর্ণাঙ্গ পেজ খুলুন ↗' : 'Full Page ↗'}
                </Link>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{lang === 'bn' ? 'গ্রাহকের নাম *' : 'Name *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500 font-medium"
                  />
                </div>

                {/* Bangla Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'বাংলা নাম' : 'Bangla Name'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.name_bn}
                    onChange={(e) => setEditFormData({ ...editFormData, name_bn: e.target.value })}
                    className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{lang === 'bn' ? 'মোবাইল নম্বর *' : 'Phone *'}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full py-2 px-3 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>{lang === 'bn' ? 'ইমেইল' : 'Email'}</span>
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500 font-mono"
                  />
                </div>

                {/* Credit Limit */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-violet-500" />
                    <span>{lang === 'bn' ? 'বাকির সীমা (Credit Limit ৳)' : 'Credit Limit (৳)'}</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={editFormData.credit_limit}
                    onChange={(e) => setEditFormData({ ...editFormData, credit_limit: e.target.value })}
                    className="w-full py-2 px-3 text-xs font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                  />
                </div>

                {/* Loyalty Points */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{lang === 'bn' ? 'লয়ালটি পয়েন্ট (pt)' : 'Points (pt)'}</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold ml-1">
                      (৳{(Number(editFormData.loyalty_points || 0) * 0.75).toFixed(0)})
                    </span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={editFormData.loyalty_points}
                    onChange={(e) => setEditFormData({ ...editFormData, loyalty_points: e.target.value })}
                    className="w-full py-2 px-3 text-xs font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                  >
                    <option value="active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
                    <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
                  </select>
                </div>

                {/* Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{lang === 'bn' ? 'ঠিকানা' : 'Address'}</span>
                  </label>
                  <textarea
                    rows="2"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                    placeholder={lang === 'bn' ? 'গ্রাহকের ঠিকানা...' : 'Address...'}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="py-2 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="py-2 px-5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition disabled:opacity-60 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdating ? (lang === 'bn' ? 'আপডেট হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'আপডেট করুন' : 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default CustomerList;
