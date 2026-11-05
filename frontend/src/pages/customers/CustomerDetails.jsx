import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';
import api from '../../services/api';
import { BackButton } from '../../components/common/BackButton';

export const CustomerDetails = () => {
  const { id } = useParams();
  const { formatCurrency, formatNumber } = useLanguage();
  const { success, error } = useToast();

  const [customer, setCustomer] = useState(null);
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
      error('গ্রাহকের তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleReceivePayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      error('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন।');
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

      success(`৳ ${payAmount} বকেয়া আদায় সফলভাবে রেকর্ড করা হয়েছে!`);
      setPayAmount('');
      setPayRef('');
      setPayNote('');
      fetchCustomer();
    } catch (err) {
      error(err.response?.data?.message || 'পেমেন্ট গ্রহণ ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">লোড হচ্ছে...</div>;
  }

  if (!customer) {
    return <div className="p-12 text-center text-rose-500">গ্রাহক পাওয়া যায়নি।</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton fallback="/customers" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {customer.name}
            </h1>
            <p className="text-xs text-slate-500">গ্রাহক প্রোফাইল ও সম্পূর্ণ লেনদেন লেজার</p>
          </div>
        </div>

        <Link
          to={`/customers/${customer.id}/edit`}
          className="py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'তথ্য পরিবর্তন' : 'Edit Customer'}</span>
        </Link>
      </div>

      {/* Top Profile & Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold text-lg">
            {customer.name[0]}
          </div>
          <div>
            <div className="font-bold text-base text-slate-900 dark:text-white">{customer.name}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <Phone className="w-3.5 h-3.5" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{customer.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Loyalty Points Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>লয়ালটি পয়েন্ট ব্যালেন্স</span>
            </span>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
              {customer.loyalty_points || 0} <span className="text-sm font-bold text-slate-400">pts</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            ছাড়ের মূল্য: <span className="font-bold text-emerald-600">{formatCurrency(((customer.loyalty_points || 0) * 0.10))}</span> (১০০ pt = ৳১০)
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">বর্তমান বকেয়া (Due Balance)</span>
            <div className="text-3xl font-black text-rose-600 mt-2">
              {formatCurrency(customer.current_balance)}
            </div>
          </div>
          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            বাকির সর্বোচ্চ সীমা: <span className="font-bold">{formatCurrency(customer.credit_limit)}</span>
          </div>
        </div>

        {/* Due Collection Card (NO MODAL POLICY) */}
        <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 shadow-card space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-sm">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            <span>বকেয়া টাকা আদায় ফরম</span>
          </div>

          <form onSubmit={handleReceivePayment} className="space-y-3">
            <input
              type="number"
              step="0.01"
              required
              placeholder="আদায়ের পরিমাণ (৳)"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-1.5">
              {['cash', 'bkash', 'bank'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayMethod(m)}
                  className={`py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                    payMethod === m ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-1 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>পেমেন্ট গ্রহণ করুন</span>
            </button>
          </form>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            বিক্রয় চালানসমূহ (Purchase History)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">চালান নম্বর</th>
                <th className="p-3">তারিখ</th>
                <th className="p-3 text-right">মোট টাকা</th>
                <th className="p-3 text-right">পরিশোধিত</th>
                <th className="p-3 text-right">বকেয়া</th>
                <th className="p-3 text-center">অবস্থা</th>
                <th className="p-3 text-right">ইনভয়েস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customer.sales?.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-slate-400">কোনো চালান নেই।</td></tr>
              ) : (
                customer.sales?.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{s.invoice_number}</td>
                    <td className="p-3 text-slate-500 font-mono">{new Date(s.sale_date).toLocaleDateString('bn-BD')}</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(s.grand_total)}</td>
                    <td className="p-3 text-right text-emerald-600 font-semibold">{formatCurrency(s.paid_amount)}</td>
                    <td className="p-3 text-right text-rose-600 font-bold">{formatCurrency(s.due_amount)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {s.payment_status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/sales/${s.id}`}
                        className="text-indigo-600 hover:text-indigo-700 font-bold"
                      >
                        ইনভয়েস দেখুন
                      </Link>
                    </td>
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

