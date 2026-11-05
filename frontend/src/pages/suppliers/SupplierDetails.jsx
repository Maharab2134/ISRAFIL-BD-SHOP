import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Truck,
  ArrowLeft,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import { BackButton } from '../../components/common/BackButton';

export const SupplierDetails = () => {
  const { id } = useParams();
  const { formatCurrency, formatNumber } = useLanguage();
  const { success, error } = useToast();

  const [supplier, setSupplier] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('bank');
  const [payRef, setPayRef] = useState('');
  const [payNote, setPayNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplier();
  }, [id]);

  const fetchSupplier = async () => {
    try {
      const res = await api.get(`/suppliers/${id}`);
      setSupplier(res.data);
    } catch (e) {
      error('সরবরাহকারীর তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handlePaySupplier = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      error('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/suppliers/${id}/payment`, {
        amount: Number(payAmount),
        payment_method: payMethod,
        reference: payRef,
        note: payNote,
      });

      success(`সরবরাহকারীকে ৳ ${payAmount} সফলভাবে প্রদান করা হয়েছে!`);
      setPayAmount('');
      setPayRef('');
      setPayNote('');
      fetchSupplier();
    } catch (err) {
      error(err.response?.data?.message || 'পেমেন্ট প্রদান ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">লোড হচ্ছে...</div>;
  }

  if (!supplier) {
    return <div className="p-12 text-center text-rose-500">সরবরাহকারী পাওয়া যায়নি।</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton fallback="/suppliers" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {supplier.name}
          </h1>
          <p className="text-xs text-slate-500">{supplier.company_name || 'সরবরাহকারী লেজার'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-lg">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-base text-slate-900 dark:text-white">{supplier.name}</div>
            <div className="text-xs text-slate-500">{supplier.company_name}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
              <Phone className="w-3.5 h-3.5" />
              <span>{supplier.phone}</span>
            </div>
            {supplier.address && (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{supplier.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payable Balance */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">দোকানের মোট দেনা (Payable)</span>
            <div className="text-3xl font-black text-amber-600 mt-2">
              {formatCurrency(supplier.current_balance)}
            </div>
          </div>
          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            মোট ক্রয় চালান: <span className="font-bold">{supplier.purchases?.length || 0} টি</span>
          </div>
        </div>

        {/* Pay Supplier Form (NO MODAL POLICY) */}
        <div className="p-6 rounded-3xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 shadow-card space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span>দেনা পরিশোধ ফরম</span>
          </div>

          <form onSubmit={handlePaySupplier} className="space-y-3">
            <input
              type="number"
              step="0.01"
              required
              placeholder="পরিশোধের পরিমাণ (৳)"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-1.5">
              {['bank', 'cash', 'bkash'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayMethod(m)}
                  className={`py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                    payMethod === m ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center justify-center gap-1 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>টাকা প্রদান সম্পন্ন করুন</span>
            </button>
          </form>
        </div>
      </div>

      {/* Purchases History */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ক্রয় চালানসমূহ (Purchase History)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">চালান নম্বর</th>
                <th className="p-3">তারিখ</th>
                <th className="p-3 text-right">মোট ক্রয়মূল্য</th>
                <th className="p-3 text-right">পরিশোধিত</th>
                <th className="p-3 text-right">দেনা</th>
                <th className="p-3 text-center">অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {supplier.purchases?.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-slate-400">কোনো ক্রয়ের রেকর্ড নেই।</td></tr>
              ) : (
                supplier.purchases?.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{p.purchase_number}</td>
                    <td className="p-3 text-slate-500 font-mono">{p.purchase_date}</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(p.grand_total)}</td>
                    <td className="p-3 text-right text-emerald-600 font-semibold">{formatCurrency(p.paid_amount)}</td>
                    <td className="p-3 text-right text-amber-600 font-bold">{formatCurrency(p.due_amount)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.payment_status}
                      </span>
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

