import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Receipt,
  ArrowLeft,
  Printer,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  User,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';

export const SaleInvoice = () => {
  const { id } = useParams();
  const { formatCurrency, formatNumber } = useLanguage();
  const { success, error } = useToast();

  const [sale, setSale] = useState(null);
  const [shopSettings, setShopSettings] = useState({});
  const [printFormat, setPrintFormat] = useState('80mm'); // '80mm', '58mm', 'a4'
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSale();
  }, [id]);

  const fetchSale = async () => {
    try {
      const res = await api.get(`/sales/${id}`);
      setSale(res.data.sale);
      setShopSettings(res.data.shop_settings || {});
      setRefundAmount(res.data.sale?.paid_amount || '');
    } catch (e) {
      error('চালানের তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post(`/sales/${id}/return`, {
        reason: returnReason,
        refund_amount: Number(refundAmount) || 0,
        payment_method: refundMethod,
      });

      success('বিক্রয় ফেরত সফলভাবে প্রক্রিয়া করা হয়েছে এবং পণ্য স্টকে ফেরত যোগ হয়েছে!');
      setShowReturnForm(false);
      fetchSale();
    } catch (err) {
      error(err.response?.data?.message || 'ফেরত প্রক্রিয়া ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">লোড হচ্ছে...</div>;
  if (!sale) return <div className="p-12 text-center text-rose-500">চালান পাওয়া যায়নি।</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            to="/sales"
            className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              চালান #{sale.invoice_number}
            </h1>
            <p className="text-xs text-slate-500">তারিখ: {new Date(sale.sale_date).toLocaleString('bn-BD')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setPrintFormat('80mm')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                printFormat === '80mm' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'
              }`}
            >
              ৮০ মিমি
            </button>
            <button
              onClick={() => setPrintFormat('58mm')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                printFormat === '58mm' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'
              }`}
            >
              ৫৮ মিমি
            </button>
            <button
              onClick={() => setPrintFormat('a4')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                printFormat === 'a4' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'
              }`}
            >
              A4 ইনভয়েস
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="py-2 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট করুন</span>
          </button>

          {sale.sale_status !== 'refunded' && (
            <button
              onClick={() => setShowReturnForm(!showReturnForm)}
              className="py-2 px-4 rounded-xl font-bold text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ফেরত (Return)</span>
            </button>
          )}
        </div>
      </div>

      {/* Return & Refund Box (NO MODAL POLICY) */}
      {showReturnForm && (
        <form
          onSubmit={handleReturnSubmit}
          className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 space-y-4 no-print"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-rose-900 dark:text-rose-100 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>বিক্রয় ফেরত ও রিফান্ড ফরম</span>
            </h3>
            <button type="button" onClick={() => setShowReturnForm(false)} className="text-xs text-rose-500 font-bold">
              বাতিল
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-rose-900 dark:text-rose-200">ফেরতের কারণ *</label>
              <input
                type="text"
                required
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="যেমন: ত্রুটিপূর্ণ পণ্য বা সাইজ অমিল"
                className="w-full py-2 px-3 text-xs rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-rose-900 dark:text-rose-200">ফেরতকৃত টাকার পরিমাণ (৳) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition disabled:opacity-60"
          >
            {isSubmitting ? 'প্রক্রিয়াধীন...' : 'ফেরত নিশ্চিত করুন ও স্টক বৃদ্ধি করুন'}
          </button>
        </form>
      )}

      {/* Main Printable Presentation Container */}
      <div id="printable-area" className="p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
        {printFormat === '80mm' && (
          <div className="receipt-80mm p-2">
            <div className="text-center pb-2 border-b border-dashed border-black">
              <div className="font-extrabold text-base">{shopSettings.shop_name || 'ISRAFIL BD SHOP'}</div>
              <div className="text-[10px]">{shopSettings.shop_address || 'দোকান নং #১২, সেন্ট্রাল প্লাজা, চট্টগ্রাম'}</div>
              <div className="text-[10px]">ফোন: {shopSettings.shop_phone || '+৮৮০ ১৭১১-২৩৪৫৬৭'}</div>
              <div className="text-[11px] font-bold mt-1">ক্যাশ মেমো (বিক্রয় চালান)</div>
            </div>

            <div className="py-1 text-[10px] space-y-0.5 border-b border-dashed border-black">
              <div>চালান: {sale.invoice_number}</div>
              <div>তারিখ: {new Date(sale.sale_date).toLocaleString('bn-BD')}</div>
              <div>গ্রাহক: {sale.customer_name}</div>
              {sale.customer_phone && <div>মোবাইল: {sale.customer_phone}</div>}
              <div>ক্যাশিয়ার: {sale.user?.name || 'ক্যাশিয়ার'}</div>
            </div>

            <table className="w-full my-2 text-[10px]">
              <thead>
                <tr className="border-b border-black text-left font-bold">
                  <th className="py-1">বিবরণ</th>
                  <th className="text-center">পরিমাণ</th>
                  <th className="text-right">মূল্য</th>
                </tr>
              </thead>
              <tbody>
                {sale.items?.map((it) => (
                  <tr key={it.id}>
                    <td className="py-0.5">{it.product_name}</td>
                    <td className="text-center">{it.quantity}</td>
                    <td className="text-right">৳{it.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-2 border-t border-dashed border-black text-[11px] space-y-1">
              <div className="flex justify-between"><span>উপমোট:</span><span>৳{sale.subtotal}</span></div>
              {sale.order_discount_amount > 0 && (
                <div className="flex justify-between"><span>ছাড়:</span><span>-৳{sale.order_discount_amount}</span></div>
              )}
              {sale.tax_amount > 0 && (
                <div className="flex justify-between"><span>ভ্যাট:</span><span>৳{sale.tax_amount}</span></div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                <span>সর্বমোট:</span><span>৳{sale.grand_total}</span>
              </div>
              <div className="flex justify-between text-[10px]"><span>পরিশোধিত:</span><span>৳{sale.paid_amount}</span></div>
              {sale.due_amount > 0 && (
                <div className="flex justify-between text-[10px] font-bold"><span>বকেয়া:</span><span>৳{sale.due_amount}</span></div>
              )}
              {sale.change_amount > 0 && (
                <div className="flex justify-between text-[10px]"><span>ফেরত:</span><span>৳{sale.change_amount}</span></div>
              )}
            </div>

            <div className="text-center text-[9px] pt-4 mt-2 border-t border-dashed border-black">
              {shopSettings.invoice_footer_note || 'ইসরাফিল বিডি শপে কেনাকাটার জন্য আন্তরিক ধন্যবাদ!'}
            </div>
          </div>
        )}

        {printFormat === '58mm' && (
          <div className="receipt-58mm p-1">
            <div className="text-center pb-1 border-b border-dashed border-black">
              <div className="font-extrabold text-sm">{shopSettings.shop_name || 'ISRAFIL BD SHOP'}</div>
              <div className="text-[9px]">চালান: {sale.invoice_number}</div>
              <div className="text-[9px]">{new Date(sale.sale_date).toLocaleDateString('bn-BD')}</div>
            </div>
            <div className="my-1">
              {sale.items?.map((it) => (
                <div key={it.id} className="flex justify-between text-[9px]">
                  <span>{it.product_name} x{it.quantity}</span>
                  <span>৳{it.total}</span>
                </div>
              ))}
            </div>
            <div className="pt-1 border-t border-dashed border-black text-[10px] font-bold flex justify-between">
              <span>মোট:</span><span>৳{sale.grand_total}</span>
            </div>
            <div className="text-center text-[8px] pt-2">ধন্যবাদ! আবার আসবেন।</div>
          </div>
        )}

        {printFormat === 'a4' && (
          <div className="invoice-a4 p-10 font-sans">
            <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-4">
              <div>
                <h1 className="text-2xl font-black text-indigo-700">{shopSettings.shop_name || 'ISRAFIL BD SHOP'}</h1>
                <p className="text-sm text-slate-600">{shopSettings.shop_address || 'দোকান নং #১২, সেন্ট্রাল প্লাজা, জিইসি মোড়, চট্টগ্রাম'}</p>
                <p className="text-sm text-slate-600">ফোন: {shopSettings.shop_phone || '+৮৮০ ১৭১১-২৩৪৫৬৭'}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold uppercase text-slate-800">ক্যাশ মেমো (ইনভয়েস)</span>
                <p className="text-sm font-semibold text-slate-600 mt-1">চালান #: {sale.invoice_number}</p>
                <p className="text-sm text-slate-500">তারিখ: {new Date(sale.sale_date).toLocaleString('bn-BD')}</p>
              </div>
            </div>

            <div className="my-6 p-4 rounded-xl bg-slate-50 flex justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">ক্রেতার বিবরণ</span>
                <div className="font-bold text-base text-slate-800">{sale.customer_name}</div>
                <div className="text-sm text-slate-600">{sale.customer_phone || 'ওয়াক-ইন কাস্টমার'}</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase">পেমেন্ট মেথড</span>
                <div className="font-bold text-base text-slate-800 capitalize">{sale.payments?.[0]?.payment_method || 'Cash'}</div>
                <div className="text-sm text-emerald-600 font-bold capitalize">{sale.payment_status}</div>
              </div>
            </div>

            <table className="w-full my-6 text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-left font-bold">
                  <th className="p-3">#</th>
                  <th className="p-3">পণ্য</th>
                  <th className="p-3 text-center">পরিমাণ</th>
                  <th className="p-3 text-right">দর</th>
                  <th className="p-3 text-right">মোট</th>
                </tr>
              </thead>
              <tbody>
                {sale.items?.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3 font-semibold">{item.product_name}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">৳{item.unit_price}</td>
                    <td className="p-3 text-right font-bold">৳{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-4">
              <div className="w-72 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600"><span>উপমোট:</span><span>৳{sale.subtotal}</span></div>
                {sale.order_discount_amount > 0 && (
                  <div className="flex justify-between text-slate-600"><span>ছাড়:</span><span>-৳{sale.order_discount_amount}</span></div>
                )}
                {sale.tax_amount > 0 && (
                  <div className="flex justify-between text-slate-600"><span>ভ্যাট (৫%):</span><span>৳{sale.tax_amount}</span></div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-800 pt-2">
                  <span>সর্বমোট:</span><span>৳{sale.grand_total}</span>
                </div>
                <div className="flex justify-between text-slate-600"><span>পরিশোধিত:</span><span>৳{sale.paid_amount}</span></div>
                {sale.due_amount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold"><span>বকেয়া:</span><span>৳{sale.due_amount}</span></div>
                )}
              </div>
            </div>

            <div className="mt-16 pt-6 border-t border-slate-300 flex justify-between items-end text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-700">শর্তাবলী:</p>
                <p>• {shopSettings.invoice_footer_note || 'বিক্রিত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমো সহ পরিবর্তনযোগ্য।'}</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1" />
                <span>ক্যাশিয়ার স্বাক্ষর</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

