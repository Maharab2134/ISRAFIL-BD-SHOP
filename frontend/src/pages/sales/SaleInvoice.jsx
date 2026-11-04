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
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
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
  }, [id, lang]);

  const fetchSale = async () => {
    try {
      const res = await api.get(`/sales/${id}`);
      setSale(res.data.sale);
      setShopSettings(res.data.shop_settings || {});
      setRefundAmount(res.data.sale?.paid_amount || '');
    } catch (e) {
      error(lang === 'bn' ? 'চালানের তথ্য লোড করতে সমস্যা হয়েছে।' : 'Failed to load invoice details.');
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

      success(lang === 'bn' ? 'বিক্রয় ফেরত সফলভাবে প্রক্রিয়া করা হয়েছে এবং পণ্য স্টকে ফেরত যোগ হয়েছে!' : 'Sale return processed and items restored to stock!');
      setShowReturnForm(false);
      fetchSale();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'ফেরত প্রক্রিয়া ব্যর্থ হয়েছে।' : 'Return process failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">{t('loading')}</p>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-12 text-center text-rose-500 font-bold">
        {lang === 'bn' ? 'চালান পাওয়া যায়নি।' : 'Invoice not found.'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            to="/sales"
            className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-6 h-6 text-indigo-600" />
              <span>{lang === 'bn' ? `চালান #${sale.invoice_number}` : `Invoice #${sale.invoice_number}`}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'তারিখ:' : 'Date:'} {new Date(sale.sale_date).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setPrintFormat('80mm')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                printFormat === '80mm' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'
              }`}
            >
              80mm Thermal
            </button>
            <button
              onClick={() => setPrintFormat('58mm')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                printFormat === '58mm' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'
              }`}
            >
              58mm Thermal
            </button>
            <button
              onClick={() => setPrintFormat('a4')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                printFormat === 'a4' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'
              }`}
            >
              A4 Invoice
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="py-2 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print')}</span>
          </button>

          {sale.sale_status !== 'refunded' && (
            <button
              onClick={() => setShowReturnForm(!showReturnForm)}
              className="py-2 px-4 rounded-xl font-bold text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ফেরত (Return)' : 'Return & Refund'}</span>
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
              <span>{lang === 'bn' ? 'বিক্রয় ফেরত ও রিফান্ড ফরম' : 'Sale Return & Refund Form'}</span>
            </h3>
            <button type="button" onClick={() => setShowReturnForm(false)} className="text-xs text-rose-500 font-bold">
              {t('cancel')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-rose-900 dark:text-rose-200">
                {lang === 'bn' ? 'ফেরতের কারণ *' : 'Reason for Return *'}
              </label>
              <input
                type="text"
                required
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: ত্রুটিপূর্ণ পণ্য বা সাইজ অমিল' : 'e.g. Defective item, customer exchange'}
                className="w-full py-2 px-3 text-xs rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-rose-900 dark:text-rose-200">
                {lang === 'bn' ? 'ফেরতকৃত টাকার পরিমাণ (৳) *' : 'Refund Amount (৳) *'}
              </label>
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
            {isSubmitting
              ? (lang === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...')
              : (lang === 'bn' ? 'ফেরত নিশ্চিত করুন ও স্টক বৃদ্ধি করুন' : 'Confirm Return & Restock Items')}
          </button>
        </form>
      )}

      {/* Main Printable Presentation Container */}
      <div id="printable-area" className="p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
        {printFormat === '80mm' && (
          <div className="receipt-80mm p-2">
            <div className="text-center pb-2 border-b border-dashed border-black">
              <div className="font-extrabold text-base">{shopSettings.shop_name || 'ISRAFIL BD SHOP'}</div>
              <div className="text-[10px]">{shopSettings.shop_address || 'ঢাকা, বাংলাদেশ'}</div>
              <div className="text-[10px]">ফোন: {shopSettings.shop_phone || '+৮৮০ ১৭০০-০০০০০০'}</div>
              <div className="text-[11px] font-bold mt-1">
                {lang === 'bn' ? 'ক্যাশ মেমো (বিক্রয় চালান)' : 'CASH RECEIPT / INVOICE'}
              </div>
            </div>

            <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-black">
              <div>Invoice: {sale.invoice_number}</div>
              <div>Date: {new Date(sale.sale_date).toLocaleString()}</div>
              <div>Customer: {sale.customer_name}</div>
              {sale.customer_phone && <div>Phone: {sale.customer_phone}</div>}
              <div>Cashier: {sale.user?.name || 'Staff'}</div>
            </div>

            <table className="w-full my-2 text-[10px]">
              <thead>
                <tr className="border-b border-black text-left">
                  <th className="py-1">{lang === 'bn' ? 'পণ্য' : 'Item'}</th>
                  <th className="text-center">{lang === 'bn' ? 'পরিমাণ' : 'Qty'}</th>
                  <th className="text-right">{lang === 'bn' ? 'মোট' : 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                {sale.items?.map((it) => (
                  <tr key={it.id}>
                    <td className="py-1">{it.product_name}</td>
                    <td className="text-center">{it.quantity}</td>
                    <td className="text-right">৳{it.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-2 border-t border-dashed border-black text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>{lang === 'bn' ? 'উপমোট:' : 'Subtotal:'}</span>
                <span>৳{sale.subtotal}</span>
              </div>
              {sale.order_discount_amount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>{lang === 'bn' ? 'ডিসকাউন্ট:' : 'Discount:'}</span>
                  <span>-৳{sale.order_discount_amount}</span>
                </div>
              )}
              {sale.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'ভ্যাট / ট্যাক্স:' : 'Tax:'}</span>
                  <span>৳{sale.tax_amount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                <span>{lang === 'bn' ? 'সর্বমোট মূল্য:' : 'Grand Total:'}</span>
                <span>৳{sale.grand_total}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>{lang === 'bn' ? 'পরিশোধিত:' : 'Paid:'}</span>
                <span>৳{sale.paid_amount}</span>
              </div>
              {sale.change_amount > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span>{lang === 'bn' ? 'ফেরত:' : 'Change:'}</span>
                  <span>৳{sale.change_amount}</span>
                </div>
              )}
              {sale.due_amount > 0 && (
                <div className="flex justify-between text-[10px] font-bold text-rose-600">
                  <span>{lang === 'bn' ? 'বকেয়া:' : 'Due:'}</span>
                  <span>৳{sale.due_amount}</span>
                </div>
              )}
            </div>

            <div className="text-center text-[9px] pt-4 mt-2 border-t border-dashed border-black">
              {shopSettings.receipt_footer || 'Thank you for shopping with ISRAFIL BD SHOP!'}
            </div>
          </div>
        )}

        {printFormat === '58mm' && (
          <div className="receipt-58mm p-1 text-[9px]">
            <div className="text-center pb-1 border-b border-dashed border-black">
              <div className="font-extrabold text-xs">{shopSettings.shop_name || 'ISRAFIL BD SHOP'}</div>
              <div>Inv: {sale.invoice_number}</div>
              <div>{new Date(sale.sale_date).toLocaleDateString()}</div>
            </div>
            <div className="py-1 space-y-0.5 border-b border-dashed border-black">
              {sale.items?.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span className="truncate max-w-[120px]">{it.product_name} × {it.quantity}</span>
                  <span>৳{it.total}</span>
                </div>
              ))}
            </div>
            <div className="pt-1 space-y-0.5 font-bold">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>৳{sale.grand_total}</span>
              </div>
              <div className="flex justify-between font-normal">
                <span>Paid:</span>
                <span>৳{sale.paid_amount}</span>
              </div>
            </div>
            <div className="text-center text-[8px] pt-2 border-t border-dashed border-black mt-1">
              Thank You!
            </div>
          </div>
        )}

        {printFormat === 'a4' && (
          <div className="p-8 max-w-3xl mx-auto border border-slate-300">
            <div className="flex justify-between items-start pb-6 border-b border-slate-300">
              <div>
                <h1 className="text-2xl font-black text-indigo-700">{shopSettings.shop_name || 'ISRAFIL BD SHOP'}</h1>
                <p className="text-xs text-slate-600">{shopSettings.shop_address || 'ঢাকা, বাংলাদেশ'}</p>
                <p className="text-xs text-slate-600">{shopSettings.shop_phone || '+৮৮০ ১৭০০-০০০০০০'}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold uppercase text-slate-800">
                  {lang === 'bn' ? 'বিক্রয় চালান' : 'TAX INVOICE'}
                </span>
                <p className="text-xs font-semibold mt-1">Invoice #: {sale.invoice_number}</p>
                <p className="text-xs text-slate-500">Date: {new Date(sale.sale_date).toLocaleString()}</p>
              </div>
            </div>

            <div className="my-4 p-3 bg-slate-50 flex justify-between text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[10px]">
                  {lang === 'bn' ? 'ক্রেতা' : 'Customer'}
                </span>
                <div className="font-bold">{sale.customer_name}</div>
                {sale.customer_phone && <div className="text-slate-500">{sale.customer_phone}</div>}
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-500 uppercase block text-[10px]">
                  {lang === 'bn' ? 'ক্যাশিয়ার' : 'Cashier'}
                </span>
                <div className="font-bold">{sale.user?.name || 'Staff'}</div>
              </div>
            </div>

            <table className="w-full my-4 text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-left font-bold">
                  <th className="p-2">#</th>
                  <th className="p-2">{lang === 'bn' ? 'পণ্য' : 'Product'}</th>
                  <th className="p-2 text-center">{lang === 'bn' ? 'পরিমাণ' : 'Qty'}</th>
                  <th className="p-2 text-right">{lang === 'bn' ? 'একক দর' : 'Unit Price'}</th>
                  <th className="p-2 text-right">{lang === 'bn' ? 'মোট' : 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                {sale.items?.map((it, idx) => (
                  <tr key={it.id} className="border-b border-slate-200">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2 font-semibold">{it.product_name}</td>
                    <td className="p-2 text-center">{it.quantity}</td>
                    <td className="p-2 text-right">৳{it.unit_price}</td>
                    <td className="p-2 text-right font-bold">৳{it.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-4">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'উপমোট:' : 'Subtotal:'}</span>
                  <span>৳{sale.subtotal}</span>
                </div>
                {sale.order_discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span>{lang === 'bn' ? 'ডিসকাউন্ট:' : 'Discount:'}</span>
                    <span>-৳{sale.order_discount_amount}</span>
                  </div>
                )}
                {sale.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>{lang === 'bn' ? 'ট্যাক্স:' : 'Tax:'}</span>
                    <span>৳{sale.tax_amount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                  <span>{lang === 'bn' ? 'সর্বমোট মূল্য:' : 'Grand Total:'}</span>
                  <span>৳{sale.grand_total}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'পরিশোধিত:' : 'Paid:'}</span>
                  <span>৳{sale.paid_amount}</span>
                </div>
                {sale.due_amount > 0 && (
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>{lang === 'bn' ? 'বকেয়া:' : 'Due:'}</span>
                    <span>৳{sale.due_amount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleInvoice;
