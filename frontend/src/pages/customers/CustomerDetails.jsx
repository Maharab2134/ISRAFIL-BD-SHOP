import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  ArrowLeft,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Receipt,
  CreditCard,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit,
  History,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import { BackButton } from '../../components/common/BackButton';

export const CustomerDetails = () => {
  const { id } = useParams();
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { isSuperAdmin, hasPermission } = useAuth();
  const { success, error } = useToast();

  const canEditCustomer = isSuperAdmin || hasPermission('customers.manage');

  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'payments'
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payRef, setPayRef] = useState('');
  const [payNote, setPayNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data);
    } catch (e) {
      error(lang === 'bn' ? 'গ্রাহকের তথ্য লোড করতে সমস্যা হয়েছে।' : 'Failed to load customer profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleReceivePayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      error(lang === 'bn' ? 'অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন।' : 'Please enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/customers/${id}/payment`, {
        amount: Number(payAmount),
        payment_method: payMethod,
        reference: payRef,
        note: payNote,
      });

      success(
        lang === 'bn'
          ? `৳ ${payAmount} বকেয়া আদায় সফলভাবে রেকর্ড করা হয়েছে!`
          : `৳ ${payAmount} payment recorded successfully!`
      );
      setPayAmount('');
      setPayRef('');
      setPayNote('');
      fetchCustomer();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'পেমেন্ট গ্রহণ ব্যর্থ হয়েছে।' : 'Payment receipt failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>{lang === 'bn' ? 'গ্রাহকের তথ্য লোড হচ্ছে...' : 'Loading customer profile...'}</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-12 text-center text-rose-500">
        {lang === 'bn' ? 'গ্রাহক পাওয়া যায়নি।' : 'Customer not found.'}
      </div>
    );
  }

  const initialChar = customer.name?.[0]?.toUpperCase() || 'C';
  const salesList = customer.sales || [];
  const paymentsList = customer.payments || [];
  const loyaltyPts = Number(customer.loyalty_points) || 0;
  const loyaltyValue = loyaltyPts * 0.75; // 100 pt = 75 BDT

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton fallback="/customers" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {customer.name}
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'bn' ? 'গ্রাহক প্রোফাইল ও সম্পূর্ণ লেনদেন লেজার' : 'Customer profile and full transaction ledger'}
            </p>
          </div>
        </div>

        {canEditCustomer && (
          <Link
            to={`/customers/${customer.id}/edit`}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition self-start sm:self-auto"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'তথ্য পরিবর্তন' : 'Edit Customer'}</span>
          </Link>
        )}
      </div>

      {/* Top Profile & Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Basic Info Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shadow-2xs">
            {initialChar}
          </div>
          <div>
            <div className="font-bold text-base text-slate-900 dark:text-white">{customer.name}</div>
            {customer.name_bn && customer.name_bn !== customer.name && (
              <div className="text-xs text-slate-400 font-medium">{customer.name_bn}</div>
            )}
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Loyalty Points Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'bn' ? 'লয়ালটি পয়েন্ট ব্যালেন্স' : 'Loyalty Points'}</span>
            </span>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono">
              {formatNumber(loyaltyPts)} <span className="text-sm font-bold text-slate-400">pts</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            {lang === 'bn' ? 'রিডিম ছাড় মূল্য:' : 'Redeem Value:'}{' '}
            <span className="font-bold text-emerald-600 font-mono">{formatCurrency(loyaltyValue)}</span>{' '}
            <span className="text-[11px] text-slate-400">(১০০ pt = ৳৭৫)</span>
          </div>
        </div>

        {/* Current Due Balance Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'বর্তমান বকেয়া (Due Balance)' : 'Current Due Balance'}
            </span>
            <div className={`text-3xl font-black mt-2 font-mono ${Number(customer.current_balance) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {formatCurrency(customer.current_balance || 0)}
            </div>
          </div>
          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>{lang === 'bn' ? 'বাকির সর্বোচ্চ সীমা:' : 'Credit Limit:'}</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
              {formatCurrency(customer.credit_limit || 0)}
            </span>
          </div>
        </div>

        {/* Due Collection Card (NO MODAL POLICY) */}
        <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 shadow-card space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-sm">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            <span>{lang === 'bn' ? 'বকেয়া টাকা আদায় ফরম' : 'Collect Due Payment'}</span>
          </div>

          <form onSubmit={handleReceivePayment} className="space-y-3">
            <input
              type="number"
              step="0.01"
              required
              placeholder={lang === 'bn' ? 'আদায়ের পরিমাণ (৳)' : 'Amount (৳)'}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'cash', label: lang === 'bn' ? 'ক্যাশ' : 'Cash' },
                { id: 'bkash', label: 'bKash' },
                { id: 'nagad', label: 'Nagad' },
                { id: 'bank', label: lang === 'bn' ? 'ব্যাংক' : 'Bank' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={`py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    payMethod === m.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'পেমেন্ট জমা করুন' : 'Record Payment')}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Ledger History Tabs: Sales vs Payments */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'গ্রাহকের লেজার ও হিসাব বিবরণী' : 'Customer Ledger & Statement'}
            </h2>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'বিক্রয় চালানসমূহ' : 'Sales Invoices'}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px]">
                {salesList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'বকেয়া আদায়ের রসিদ' : 'Payment Receipts'}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px]">
                {paymentsList.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Sales Invoices */}
        {activeTab === 'sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3">{lang === 'bn' ? 'চালান নম্বর' : 'Invoice No'}</th>
                  <th className="p-3">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="p-3 text-right">{lang === 'bn' ? 'মোট টাকা' : 'Grand Total'}</th>
                  <th className="p-3 text-right">{lang === 'bn' ? 'পরিশোধিত' : 'Paid'}</th>
                  <th className="p-3 text-right">{lang === 'bn' ? 'বকেয়া' : 'Due'}</th>
                  <th className="p-3 text-center">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
                  <th className="p-3 text-right">{lang === 'bn' ? 'ইনভয়েস' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salesList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      {lang === 'bn' ? 'কোনো বিক্রয় চালান পাওয়া যায়নি।' : 'No sales invoices recorded.'}
                    </td>
                  </tr>
                ) : (
                  salesList.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">
                        {s.invoice_number}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">
                        {s.sale_date ? new Date(s.sale_date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US') : '—'}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(s.grand_total)}
                      </td>
                      <td className="p-3 text-right text-emerald-600 font-semibold font-mono">
                        {formatCurrency(s.paid_amount)}
                      </td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">
                        {formatCurrency(s.due_amount)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            s.payment_status === 'paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : s.payment_status === 'partial'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {s.payment_status === 'paid'
                            ? (lang === 'bn' ? 'পরিশোধিত' : 'Paid')
                            : s.payment_status === 'partial'
                            ? (lang === 'bn' ? 'আংশিক' : 'Partial')
                            : (lang === 'bn' ? 'বকেয়া' : 'Due')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          to={`/sales/${s.id}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold hover:underline"
                        >
                          {lang === 'bn' ? 'ইনভয়েস দেখুন' : 'View Invoice'}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Due Payment Receipts */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3">{lang === 'bn' ? 'রসিদ নম্বর' : 'Receipt No'}</th>
                  <th className="p-3">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="p-3">{lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Method'}</th>
                  <th className="p-3 text-right">{lang === 'bn' ? 'পরিশোধিত টাকা' : 'Amount Paid'}</th>
                  <th className="p-3">{lang === 'bn' ? 'রেফারেন্স / নোট' : 'Reference / Note'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paymentsList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      {lang === 'bn' ? 'কোনো বকেয়া পরিশোধের রসিদ পাওয়া যায়নি।' : 'No payment records found.'}
                    </td>
                  </tr>
                ) : (
                  paymentsList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">
                        {p.payment_number || `REC-${p.id}`}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">
                        {p.payment_date ? new Date(p.payment_date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US') : '—'}
                      </td>
                      <td className="p-3 capitalize font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {p.payment_method || 'Cash'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-emerald-600 font-mono text-sm">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="p-3 text-slate-500 text-xs">
                        {p.note || p.reference || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
