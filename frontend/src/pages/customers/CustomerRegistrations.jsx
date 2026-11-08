import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Gift,
  QrCode,
  Users,
  RefreshCw,
  Sliders,
  Check,
  Copy,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const CustomerRegistrations = () => {
  const { lang, formatNumber } = useLanguage();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected' | ''
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Details Modal/Slide-over
  const [activeRequest, setActiveRequest] = useState(null);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, page]);

  const fetchRequests = async (searchQuery = search) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: 15,
      };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/customer-registration/admin/requests', { params });
      if (res.data?.status === 'success') {
        setRequests(res.data.data?.data || []);
        setTotalPages(res.data.data?.last_page || 1);
        setCounts(res.data.counts || { all: 0, pending: 0, approved: 0, rejected: 0 });
      }
    } catch (err) {
      console.error(err);
      error(lang === 'bn' ? 'আবেদন তালিকা লোড করতে ব্যর্থ হয়েছে' : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests(search);
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/customer-registration/admin/requests/${id}/approve`);
      if (res.data?.status === 'success') {
        success(res.data.message || (lang === 'bn' ? 'আবেদন অনুমোদিত হয়েছে!' : 'Request approved!'));
        if (activeRequest?.id === id) {
          setActiveRequest(res.data.request);
        }
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || (lang === 'bn' ? 'অনুমোদন ব্যর্থ হয়েছে' : 'Approval failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalItem) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/customer-registration/admin/requests/${rejectModalItem.id}/reject`, {
        reason: rejectReason.trim() || undefined,
      });
      if (res.data?.status === 'success') {
        success(lang === 'bn' ? 'আবেদন বাতিল করা হয়েছে' : 'Request rejected');
        setRejectModalItem(null);
        setRejectReason('');
        if (activeRequest?.id === rejectModalItem.id) {
          setActiveRequest(res.data.request);
        }
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || (lang === 'bn' ? 'বাতিল ব্যর্থ হয়েছে' : 'Rejection failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading(true);
      const res = await api.post('/customer-registration/admin/requests/bulk-approve', {
        ids: selectedIds,
      });
      if (res.data?.status === 'success') {
        success(res.data.message || (lang === 'bn' ? 'নির্বাচিতগুলো অনুমোদিত হয়েছে' : 'Selected requests approved'));
        setSelectedIds([]);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || (lang === 'bn' ? 'বাল্ক অনুমোদন ব্যর্থ' : 'Bulk approval failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const pendingIds = requests.filter((r) => r.status === 'pending').map((r) => r.id);
    if (selectedIds.length === pendingIds.length && pendingIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    success(lang === 'bn' ? 'কপি করা হয়েছে!' : 'Copied!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {lang === 'bn' ? 'কাস্টমার রেজিস্ট্রেশন অনুমোদন' : 'Customer Registration Approvals'}
            </h1>
            {counts.pending > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs animate-pulse">
                {counts.pending}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'মোবাইল থেকে QR কোড স্ক্যান করে পাঠানো গ্রাহক মেম্বারশিপ আবেদনসমূহ পর্যালোচনা ও অনুমোদন করুন'
              : 'Review and approve customer membership applications submitted via mobile QR code scan'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/customers/form-builder"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-2 border border-indigo-200 dark:border-indigo-800 shadow-2xs"
          >
            <Sliders className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ফর্ম বিল্ডার ও QR কোড' : 'Form Builder & QR'}</span>
          </Link>

          <Link
            to="/customers"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'bn' ? 'গ্রাহক তালিকা' : 'Customers'}</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => { setStatusFilter('pending'); setPage(1); }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-2 ring-amber-400/30'
              : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold">{lang === 'bn' ? 'অপেক্ষমান আবেদন' : 'Pending Approvals'}</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {formatNumber(counts.pending)}
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('approved'); setPage(1); }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'approved'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-400/30'
              : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold">{lang === 'bn' ? 'অনুমোদিত সদস্য' : 'Approved Members'}</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatNumber(counts.approved)}
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('rejected'); setPage(1); }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-400/30'
              : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-bold">{lang === 'bn' ? 'বাতিলকৃত' : 'Rejected'}</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {formatNumber(counts.rejected)}
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === ''
              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-400/30'
              : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <span className="text-xs font-bold">{lang === 'bn' ? 'সর্বমোট আবেদন' : 'Total Requests'}</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatNumber(counts.all)}
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder={lang === 'bn' ? 'নাম, মোবাইল নম্বর বা আবেদন আইডি দিয়ে খুঁজুন...' : 'Search by name, phone, request ID...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'pending', label: lang === 'bn' ? 'অপেক্ষমান' : 'Pending' },
            { key: 'approved', label: lang === 'bn' ? 'অনুমোদিত' : 'Approved' },
            { key: 'rejected', label: lang === 'bn' ? 'বাতিল' : 'Rejected' },
            { key: '', label: lang === 'bn' ? 'সব' : 'All' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => fetchRequests()}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (When Pending items are selected) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
              {lang === 'bn'
                ? `মোট ${formatNumber(selectedIds.length)} টি অপেক্ষমান আবেদন নির্বাচিত`
                : `${selectedIds.length} pending requests selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {lang === 'bn' ? 'বাতিল' : 'Deselect'}
            </button>

            <button
              type="button"
              onClick={handleBulkApprove}
              disabled={actionLoading}
              className="px-4 py-1.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'এক ক্লিকে সব অনুমোদন করুন' : 'Bulk Approve All'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Requests Data Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      requests.filter((r) => r.status === 'pending').length > 0 &&
                      selectedIds.length === requests.filter((r) => r.status === 'pending').length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">{lang === 'bn' ? 'আবেদন নম্বর' : 'Request ID'}</th>
                <th className="p-4">{lang === 'bn' ? 'গ্রাহকের নাম ও ফোন' : 'Customer Name & Phone'}</th>
                <th className="p-4">{lang === 'bn' ? 'ঠিকানা ও ইমেইল' : 'Address / Email'}</th>
                <th className="p-4">{lang === 'bn' ? 'আবেদনের সময়' : 'Date / Time'}</th>
                <th className="p-4 text-center">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</span>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'কোনো আবেদন পাওয়া যায়নি' : 'No registration requests found'}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {lang === 'bn'
                        ? 'QR কোড স্ক্যান করে কাস্টমাররা ফর্ম জমা দিলে এখানে স্বয়ংক্রিয়ভাবে তালিকাভুক্ত হবে'
                        : 'Submissions from customer QR scans will appear here automatically'}
                    </p>
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  const isSelected = selectedIds.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        {r.status === 'pending' ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(r.id)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        <div className="flex items-center gap-1.5">
                          <span>{r.request_number}</span>
                          <button
                            type="button"
                            onClick={() => copyText(r.request_number)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            title="কপি করুন"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{r.name}</div>
                        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{r.phone}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        <div className="truncate max-w-[180px]">{r.address || '—'}</div>
                        {r.email && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px] mt-0.5">
                            {r.email}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-slate-500">
                        <div>{new Date(r.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(r.created_at).toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        {r.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{lang === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
                          </span>
                        ) : r.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-xs" title={r.rejection_reason}>
                            <XCircle className="w-3 h-3" />
                            <span>{lang === 'bn' ? 'বাতিল' : 'Rejected'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-xs animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>{lang === 'bn' ? 'অপেক্ষমান' : 'Pending'}</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => setActiveRequest(r)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Approve button */}
                          {r.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleApprove(r.id)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                                title="অনুমোদন করুন"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{lang === 'bn' ? 'অনুমোদন' : 'Approve'}</span>
                              </button>

                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => setRejectModalItem(r)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="বাতিল করুন"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            </>
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
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>পৃষ্ঠা {page} / {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
              >
                পূর্ববর্তী
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
              >
                পরবর্তী
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Slide-Over Drawer */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-white dark:bg-[#1E293B] shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    রেজিস্ট্রেশন আবেদন বিবরণ
                  </span>
                  <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    {activeRequest.request_number}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveRequest(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">বর্তমান স্ট্যাটাস</span>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    activeRequest.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeRequest.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeRequest.status === 'approved'
                    ? 'অনুমোদিত'
                    : activeRequest.status === 'rejected'
                    ? 'বাতিল'
                    : 'অপেক্ষমান'}
                </span>
              </div>

              {/* Customer Profile Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  গ্রাহকের প্রাথমিক তথ্য
                </h3>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">পূর্ণ নাম</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{activeRequest.name}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">মোবাইল নম্বর</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{activeRequest.phone}</span>
                  </div>

                  {activeRequest.email && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">ইমেইল</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{activeRequest.email}</span>
                    </div>
                  )}

                  {activeRequest.address && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">ঠিকানা</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{activeRequest.address}</span>
                    </div>
                  )}

                  {activeRequest.dob && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">জন্ম তারিখ</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{activeRequest.dob}</span>
                    </div>
                  )}

                  {activeRequest.gender && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">লিঙ্গ</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{activeRequest.gender}</span>
                    </div>
                  )}

                  {activeRequest.nid && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">এনআইডি (NID) নম্বর</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">{activeRequest.nid}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Form Answers */}
              {activeRequest.custom_data && Object.keys(activeRequest.custom_data).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    অতিরিক্ত কাস্টম ফিল্ডের উত্তর
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    {Object.entries(activeRequest.custom_data).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-slate-400 text-[11px] block">{k}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviewer Stamp */}
              {activeRequest.reviewed_at && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-500">
                  <div>পর্যালোচনা করেছেন: <strong>{activeRequest.reviewer?.name || 'Admin'}</strong></div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(activeRequest.reviewed_at).toLocaleString()}
                  </div>
                  {activeRequest.rejection_reason && (
                    <div className="text-rose-600 font-medium mt-1">
                      কারণ: {activeRequest.rejection_reason}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {activeRequest.status === 'pending' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleApprove(activeRequest.id)}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>অনুমোদন করুন</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => {
                      setRejectModalItem(activeRequest);
                      setActiveRequest(null);
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserX className="w-4 h-4" />
                    <span>বাতিল করুন</span>
                  </button>
                </div>
              )}

              {activeRequest.status === 'approved' && activeRequest.customer_id && (
                <Link
                  to={`/customers/${activeRequest.customer_id}`}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>গ্রাহক প্রোফাইল ও লেজার দেখুন</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Confirmation Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <UserX className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              আবেদন প্রত্যাখ্যান নিশ্চিত করুন
            </h3>
            <p className="text-xs text-slate-500">
              {rejectModalItem.name} ({rejectModalItem.phone}) এর মেম্বারশিপ আবেদনটি বাতিল করতে চান?
            </p>

            <div className="text-left space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                বাতিলের কারণ (ঐচ্ছিক)
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: ভুল মোবাইল নম্বর বা ডুপ্লিকেট আবেদন"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setRejectModalItem(null); setRejectReason(''); }}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                না, ফিরে যান
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                হ্যাঁ, বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRegistrations;

