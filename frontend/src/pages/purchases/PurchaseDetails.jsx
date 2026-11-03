import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, ArrowLeft, Printer, Calendar, Truck } from 'lucide-react';
import api from '../../services/api';

export const PurchaseDetails = () => {
  const { id } = useParams();
  const { formatCurrency } = useLanguage();
  const { error } = useToast();

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const res = await api.get(`/purchases/${id}`);
        setPurchase(res.data);
      } catch (e) {
        error('ক্রয় চালান লোড করতে ব্যর্থ হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-slate-400">লোড হচ্ছে...</div>;
  if (!purchase) return <div className="p-12 text-center text-rose-500">চালান পাওয়া যায়নি।</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Link
            to="/purchases"
            className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ক্রয় চালান: {purchase.purchase_number}
            </h1>
            <p className="text-xs text-slate-500">তারিখ: {purchase.purchase_date}</p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="py-2 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5 transition"
        >
          <Printer className="w-4 h-4" />
          <span>প্রিন্ট করুন</span>
        </button>
      </div>

      <div id="printable-area" className="p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">সরবরাহকারী প্রতিষ্ঠান</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{purchase.supplier?.name}</div>
            <div className="text-xs text-slate-500">{purchase.supplier?.company_name}</div>
            <div className="text-xs text-slate-500">মোবাইল: {purchase.supplier?.phone}</div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-indigo-600">ISRAFIL BD SHOP</span>
            <div className="text-xs text-slate-500">ক্রয় চালান #{purchase.purchase_number}</div>
            <div className="text-xs text-slate-500">অপারেটর: {purchase.user?.name}</div>
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <th className="p-3">পণ্য</th>
              <th className="p-3 text-center">পরিমাণ</th>
              <th className="p-3 text-right">একক কেনা দর</th>
              <th className="p-3 text-right">মোট</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {purchase.items?.map((it) => (
              <tr key={it.id}>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">{it.product?.name}</td>
                <td className="p-3 text-center">{it.quantity} {it.product?.unit?.name_bn}</td>
                <td className="p-3 text-right">{formatCurrency(it.unit_cost)}</td>
                <td className="p-3 text-right font-bold">{formatCurrency(it.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500"><span>উপমোট:</span><span>{formatCurrency(purchase.total_amount)}</span></div>
            {purchase.discount_amount > 0 && (
              <div className="flex justify-between text-slate-500"><span>ছাড়:</span><span>-{formatCurrency(purchase.discount_amount)}</span></div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>সর্বমোট:</span><span>{formatCurrency(purchase.grand_total)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold"><span>পরিশোধিত:</span><span>{formatCurrency(purchase.paid_amount)}</span></div>
            {purchase.due_amount > 0 && (
              <div className="flex justify-between text-amber-600 font-bold"><span>সরবরাহকারীর দেনা:</span><span>{formatCurrency(purchase.due_amount)}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

