import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { BarcodeSvg } from '../../components/common/BarcodeSvg';
import { BackButton } from '../../components/common/BackButton';

export const SaleInvoice = () => {
  const { id } = useParams();
  const { user, hasPermission } = useAuth();
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { success, error } = useToast();

  const isSuperAdmin = user?.role?.slug === 'super-admin' || user?.email === 'admin@israfilbd.com';
  const canApproveRefund = isSuperAdmin || hasPermission('sales.returns_approve');
  const canPrint = isSuperAdmin || hasPermission('sales.print') || hasPermission('pos.print');

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
          <BackButton fallback="/sales" />
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
          {canPrint && (
            <>
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
            </>
          )}

          {canApproveRefund && sale.sale_status !== 'refunded' && (
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
      {canApproveRefund && showReturnForm && (
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
        {(() => {
          const isSettingOn = (key, defaultVal = true) => {
            if (!shopSettings || shopSettings[key] === undefined) return defaultVal;
            return shopSettings[key] === '1' || shopSettings[key] === 1 || shopSettings[key] === true;
          };

          const itemDiscountTotal = sale.items?.reduce(
            (acc, it) => acc + (Number(it.discount_amount || 0) * Number(it.quantity || 1)),
            0
          ) || Number(sale.product_discount_total || 0) || 0;
          const pointsDiscount = Number(sale.points_discount_amount || 0);
          const orderDiscount = Number(sale.order_discount_amount || 0);
          const totalDiscount = itemDiscountTotal + pointsDiscount + orderDiscount;

          const totalQuantity = sale.items?.reduce(
            (acc, it) => acc + Number(it.quantity || 0),
            0
          ) || Number(sale.total_items || 0);

          const formattedTotalQty = Number(totalQuantity) % 1 === 0
            ? Number(totalQuantity)
            : Number(totalQuantity).toFixed(2);

          return (
            <>
              {/* 1. 80mm Thermal Slip */}
              {printFormat === '80mm' && (
                <div className="receipt-80mm p-2">
                  <div className="text-center pb-2 border-b border-dashed border-black">
                    {isSettingOn('show_shop_logo', true) && shopSettings.shop_logo && (
                      <img src={shopSettings.shop_logo} alt="Logo" className="w-12 h-12 mx-auto mb-1 object-contain" />
                    )}
                    <div className="font-extrabold text-base uppercase">{shopSettings.shop_name || 'ISRAFIL BD SHOP'}</div>
                    {isSettingOn('show_shop_tagline', true) && shopSettings.shop_tagline && (
                      <div className="text-[10px] text-gray-700">{shopSettings.shop_tagline}</div>
                    )}
                    <div className="text-[10px] text-gray-800 mt-0.5">
                      {isSettingOn('show_shop_address', true) && <span>{shopSettings.shop_address || 'ঢাকা, বাংলাদেশ'}</span>}
                      {isSettingOn('show_shop_phone', true) && <span> • ফোন: {shopSettings.shop_phone || '+৮৮০ ১৭০০-০০০০০০'}</span>}
                      {isSettingOn('show_shop_email', true) && shopSettings.shop_email && <span> • {shopSettings.shop_email}</span>}
                    </div>
                    {isSettingOn('show_vat_bin', true) && shopSettings.vat_bin_number && (
                      <div className="text-[10px] font-bold mt-0.5">BIN/VAT: {shopSettings.vat_bin_number}</div>
                    )}
                    <div className="text-[11px] font-bold mt-1 uppercase tracking-wider">
                      {shopSettings.receipt_header_title || (lang === 'bn' ? 'ক্যাশ মেমো / ক্যাশ রিসিপ্ট' : 'CASH RECEIPT / INVOICE')}
                    </div>
                  </div>

                  <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-black">
                    <div>Invoice: {sale.invoice_number}</div>
                    {isSettingOn('show_invoice_date_time', true) && (
                      <div>Date: {new Date(sale.sale_date).toLocaleString()}</div>
                    )}
                    {isSettingOn('show_customer_info', true) && (
                      <div>
                        <span>Customer: {sale.customer_name}</span>
                        {sale.customer_phone && <span className="ml-1">({sale.customer_phone})</span>}
                      </div>
                    )}
                    {isSettingOn('show_cashier_name', true) && (
                      <div>Cashier: {sale.user?.name || 'Staff'}</div>
                    )}
                  </div>

                  {/* Items Table: SL | Item Desc | Disc | Rate | Qnty | Amount */}
                  <table className="w-full my-2 text-[9.5px] table-fixed">
                    <colgroup>
                      <col style={{ width: '22px' }} />
                      <col />
                      <col style={{ width: '36px' }} />
                      <col style={{ width: '46px' }} />
                      <col style={{ width: '32px' }} />
                      <col style={{ width: '48px' }} />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-black text-left font-bold">
                        <th className="py-1 text-left">SL</th>
                        <th className="py-1 text-left">Item Desc</th>
                        <th className="py-1 text-right">Disc</th>
                        <th className="py-1 text-right">Rate</th>
                        <th className="py-1 text-center">Qnty</th>
                        <th className="py-1 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sale.items?.map((it, idx) => (
                        <tr key={it.id} className="border-b border-dashed border-gray-300">
                          <td className="py-1 align-top font-mono text-left">{idx + 1}</td>
                          <td className="py-1 align-top text-left font-semibold break-words pr-1">
                            {it.product_name}
                          </td>
                          <td className="py-1 align-top text-right font-mono">
                            {Number(it.discount_amount || 0) > 0 ? (Number(it.discount_amount) * Number(it.quantity || 1)).toFixed(2) : '0'}
                          </td>
                          <td className="py-1 align-top text-right font-mono">{Number(it.unit_price).toFixed(2)}</td>
                          <td className="py-1 align-top text-center font-mono">{it.quantity}</td>
                          <td className="py-1 align-top text-right font-mono font-bold">{Number(it.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-black font-bold">
                      {/* Subtotal Row: Subtotal | - | - | - | total qnty(just values) | Amount */}
                      <tr className="border-t border-black">
                        <td colSpan="4" className="pt-1 text-left font-bold">
                          {lang === 'bn' ? 'উপমোট' : 'Subtotal'}
                        </td>
                        <td className="pt-1 text-center font-mono font-bold">
                          {formattedTotalQty}
                        </td>
                        <td className="pt-1 text-right font-mono font-bold">
                          {Number(sale.subtotal).toFixed(2)}
                        </td>
                      </tr>

                      {/* Discount Row: Discount | - | - | - | | if thkhe Amount hobe */}
                      {totalDiscount > 0 && (
                        <tr>
                          <td colSpan="4" className="pt-0.5 text-left font-bold">
                            {lang === 'bn' ? 'ছাড় (Discount)' : 'Discount'}
                          </td>
                          <td className="pt-0.5 text-center"></td>
                          <td className="pt-0.5 text-right font-mono font-bold">
                            -{Number(totalDiscount).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  </table>

                  <div className="pt-1.5 border-t border-dashed border-black text-[11px] space-y-1">
                    {sale.tax_amount > 0 && (
                      <div className="flex justify-between">
                        <span>{lang === 'bn' ? 'ভ্যাট / ট্যাক্স:' : 'Tax:'}</span>
                        <span className="font-mono">৳{sale.tax_amount}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                      <span>{lang === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Grand Total:'}</span>
                      <span className="font-mono">৳{sale.grand_total}</span>
                    </div>

                    {isSettingOn('show_due_change', true) && (
                      <>
                        <div className="flex justify-between text-[10px]">
                          <span>{lang === 'bn' ? 'পরিশোধিত:' : 'Paid:'}</span>
                          <span className="font-mono">৳{sale.paid_amount}</span>
                        </div>
                        {sale.change_amount > 0 && (
                          <div className="flex justify-between text-[10px]">
                            <span>{lang === 'bn' ? 'ফেরত:' : 'Change:'}</span>
                            <span className="font-mono">৳{sale.change_amount}</span>
                          </div>
                        )}
                        {sale.due_amount > 0 && (
                          <div className="flex justify-between text-[10px] font-bold text-rose-600">
                            <span>{lang === 'bn' ? 'বকেয়া:' : 'Due:'}</span>
                            <span className="font-mono">৳{sale.due_amount}</span>
                          </div>
                        )}
                      </>
                    )}

                    {totalDiscount > 0 && (
                      <div className="text-center text-[10px] font-bold py-1 bg-gray-100 border border-gray-400 rounded my-1">
                        🎉 {lang === 'bn' ? `আপনি সর্বমোট ৳${totalDiscount} সাশ্রয় করেছেন!` : `You saved ৳${totalDiscount} on this purchase!`}
                      </div>
                    )}

                    {isSettingOn('show_loyalty_points', true) && (sale.points_earned > 0 || sale.points_redeemed > 0 || sale.customer_points_balance > 0) && (
                      <div className="pt-2 border-t border-dotted border-black text-[10px] space-y-0.5">
                        <div className="font-bold">{lang === 'bn' ? 'লয়ালটি রিওয়ার্ড তথ্য:' : 'Loyalty Reward Info:'}</div>
                        {sale.points_redeemed > 0 && (
                          <div className="flex justify-between font-semibold">
                            <span>{lang === 'bn' ? 'রিডিম করা পয়েন্ট:' : 'Points Redeemed:'}</span>
                            <span>-{sale.points_redeemed} pt (-৳{sale.points_discount_amount})</span>
                          </div>
                        )}
                        {sale.points_earned > 0 && (
                          <div className="flex justify-between font-semibold">
                            <span>{lang === 'bn' ? 'এই বিক্রয়ে অর্জিত:' : 'Points Earned:'}</span>
                            <span>+{sale.points_earned} pt</span>
                          </div>
                        )}
                        {sale.customer_points_balance !== null && sale.customer_points_balance !== undefined && (
                          <div className="flex justify-between font-bold">
                            <span>{lang === 'bn' ? 'মোট পয়েন্ট ব্যালেন্স:' : 'Current Points Balance:'}</span>
                            <span>{sale.customer_points_balance} pts</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-center text-[9px] pt-4 mt-2 border-t border-dashed border-black space-y-1">
                    <div>{shopSettings.receipt_footer || (lang === 'bn' ? 'আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ!' : 'Thank you for shopping with ISRAFIL BD SHOP!')}</div>
                    {isSettingOn('show_terms_conditions', true) && shopSettings.receipt_terms && (
                      <div className="text-[8px] italic text-gray-700">{shopSettings.receipt_terms}</div>
                    )}
                    {isSettingOn('show_receipt_barcode', true) && (
                      <div className="pt-2">
                        <BarcodeSvg code={sale.invoice_number} height={32} className="w-3/4 mx-auto" />
                        <div className="font-mono text-[9px] font-bold tracking-widest mt-0.5">{sale.invoice_number}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. 58mm Thermal Slip */}
              {printFormat === '58mm' && (
                <div className="receipt-58mm p-1 text-[9px]">
                  <div className="text-center pb-1 border-b border-dashed border-black">
                    <div className="font-extrabold text-xs">{shopSettings.shop_name || 'ISRAFIL BD SHOP'}</div>
                    {isSettingOn('show_vat_bin', true) && shopSettings.vat_bin_number && (
                      <div className="text-[8px]">BIN: {shopSettings.vat_bin_number}</div>
                    )}
                    <div>Inv: {sale.invoice_number}</div>
                    {isSettingOn('show_invoice_date_time', true) && (
                      <div>{new Date(sale.sale_date).toLocaleDateString()}</div>
                    )}
                  </div>
                  <table className="w-full my-1 text-[8.5px] leading-tight table-fixed">
                    <colgroup>
                      <col style={{ width: '16px' }} />
                      <col />
                      <col style={{ width: '28px' }} />
                      <col style={{ width: '36px' }} />
                      <col style={{ width: '24px' }} />
                      <col style={{ width: '38px' }} />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-black text-left font-bold">
                        <th className="py-0.5 text-left">SL</th>
                        <th className="py-0.5 text-left">Item Desc</th>
                        <th className="py-0.5 text-right">Disc</th>
                        <th className="py-0.5 text-right">Rate</th>
                        <th className="py-0.5 text-center">Qnty</th>
                        <th className="py-0.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sale.items?.map((it, idx) => (
                        <tr key={it.id} className="border-b border-dashed border-gray-300">
                          <td className="py-0.5 align-top font-mono text-left">{idx + 1}</td>
                          <td className="py-0.5 align-top text-left font-semibold break-words pr-0.5">
                            {it.product_name}
                          </td>
                          <td className="py-0.5 align-top text-right font-mono">
                            {Number(it.discount_amount || 0) > 0 ? (Number(it.discount_amount) * Number(it.quantity || 1)).toFixed(2) : '0'}
                          </td>
                          <td className="py-0.5 align-top text-right font-mono">{Number(it.unit_price).toFixed(2)}</td>
                          <td className="py-0.5 align-top text-center font-mono">{it.quantity}</td>
                          <td className="py-0.5 align-top text-right font-mono font-bold">{Number(it.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-black font-bold">
                      {/* Subtotal Row: Subtotal | - | - | - | total qnty(just values) | Amount */}
                      <tr className="border-t border-black">
                        <td colSpan="4" className="pt-0.5 text-left font-bold">
                          {lang === 'bn' ? 'উপমোট' : 'Subtotal'}
                        </td>
                        <td className="pt-0.5 text-center font-mono font-bold">
                          {formattedTotalQty}
                        </td>
                        <td className="pt-0.5 text-right font-mono font-bold">
                          {Number(sale.subtotal).toFixed(2)}
                        </td>
                      </tr>

                      {/* Discount Row: Discount | - | - | - | | if thkhe Amount hobe */}
                      {totalDiscount > 0 && (
                        <tr>
                          <td colSpan="4" className="pt-0.5 text-left font-bold">
                            {lang === 'bn' ? 'ছাড়' : 'Discount'}
                          </td>
                          <td className="pt-0.5 text-center"></td>
                          <td className="pt-0.5 text-right font-mono font-bold">
                            -{Number(totalDiscount).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                  <div className="pt-1 space-y-0.5 font-bold">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-mono">৳{sale.grand_total}</span>
                    </div>
                    {isSettingOn('show_due_change', true) && (
                      <>
                        <div className="flex justify-between font-normal text-[8px]">
                          <span>Paid:</span>
                          <span className="font-mono">৳{sale.paid_amount}</span>
                        </div>
                        {sale.change_amount > 0 && (
                          <div className="flex justify-between font-normal text-[8px]">
                            <span>Change:</span>
                            <span className="font-mono">৳{sale.change_amount}</span>
                          </div>
                        )}
                      </>
                    )}
                    {isSettingOn('show_loyalty_points', true) && (sale.points_earned > 0 || sale.points_redeemed > 0) && (
                      <div className="text-[8px] font-normal space-y-0.5 pt-0.5">
                        {sale.points_redeemed > 0 && (
                          <div>{lang === 'bn' ? 'রিডিম:' : 'Redeemed:'} -{sale.points_redeemed} pt (-৳{sale.points_discount_amount})</div>
                        )}
                        {sale.points_earned > 0 && (
                          <div>{lang === 'bn' ? 'অর্জিত:' : 'Earned:'} +{sale.points_earned} pt</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-center text-[8px] pt-2 border-t border-dashed border-black mt-1">
                    <div>{shopSettings.receipt_footer || 'Thank You!'}</div>
                    {isSettingOn('show_receipt_barcode', true) && (
                      <div className="pt-1">
                        <BarcodeSvg code={sale.invoice_number} height={26} className="w-4/5 mx-auto" />
                        <div className="font-mono text-[8px]">{sale.invoice_number}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. A4 Official Tax Invoice */}
              {printFormat === 'a4' && (
                <div className="p-8 max-w-3xl mx-auto border border-slate-300">
                  <div className="flex justify-between items-start pb-6 border-b border-slate-300">
                    <div>
                      {isSettingOn('show_shop_logo', true) && shopSettings.shop_logo && (
                        <img src={shopSettings.shop_logo} alt="Logo" className="w-16 h-16 mb-2 object-contain" />
                      )}
                      <h1 className="text-2xl font-black text-indigo-700">{shopSettings.shop_name || 'ISRAFIL BD SHOP'}</h1>
                      {isSettingOn('show_shop_tagline', true) && shopSettings.shop_tagline && (
                        <p className="text-xs text-slate-500">{shopSettings.shop_tagline}</p>
                      )}
                      <p className="text-xs text-slate-600">
                        {isSettingOn('show_shop_address', true) && <span>{shopSettings.shop_address || 'ঢাকা, বাংলাদেশ'}</span>}
                        {isSettingOn('show_shop_phone', true) && <span> • {shopSettings.shop_phone || '+৮৮০ ১৭০০-০০০০০০'}</span>}
                      </p>
                      {isSettingOn('show_vat_bin', true) && shopSettings.vat_bin_number && (
                        <p className="text-xs font-bold text-slate-700 mt-1">BIN/VAT Reg: {shopSettings.vat_bin_number}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold uppercase text-slate-800">
                        {shopSettings.receipt_header_title || (lang === 'bn' ? 'বিক্রয় চালান' : 'TAX INVOICE')}
                      </span>
                      <p className="text-xs font-semibold mt-1">Invoice #: {sale.invoice_number}</p>
                      {isSettingOn('show_invoice_date_time', true) && (
                        <p className="text-xs text-slate-500">Date: {new Date(sale.sale_date).toLocaleString()}</p>
                      )}
                      {isSettingOn('show_receipt_barcode', true) && (
                        <div className="mt-2 w-44 ml-auto">
                          <BarcodeSvg code={sale.invoice_number} height={32} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="my-4 p-3 bg-slate-50 flex justify-between text-xs">
                    <div>
                      {isSettingOn('show_customer_info', true) && (
                        <>
                          <span className="font-bold text-slate-500 uppercase block text-[10px]">
                            {lang === 'bn' ? 'ক্রেতা' : 'Customer'}
                          </span>
                          <div className="font-bold">{sale.customer_name}</div>
                          {sale.customer_phone && <div className="text-slate-500">{sale.customer_phone}</div>}
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      {isSettingOn('show_cashier_name', true) && (
                        <>
                          <span className="font-bold text-slate-500 uppercase block text-[10px]">
                            {lang === 'bn' ? 'ক্যাশিয়ার' : 'Cashier'}
                          </span>
                          <div className="font-bold">{sale.user?.name || 'Staff'}</div>
                        </>
                      )}
                    </div>
                  </div>

                  <table className="w-full my-4 text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                        <th className="p-2 w-10 text-left">SL</th>
                        <th className="p-2 text-left">Item Desc</th>
                        <th className="p-2 text-right">Disc</th>
                        <th className="p-2 text-right">Rate</th>
                        <th className="p-2 text-center">Qnty</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sale.items?.map((it, idx) => (
                        <tr key={it.id} className="border-t border-slate-200">
                          <td className="p-2 align-top font-mono w-10 text-left">{idx + 1}</td>
                          <td className="p-2 align-top text-left font-semibold text-slate-900 break-words">
                            {it.product_name}
                          </td>
                          <td className="p-2 align-top text-right font-mono text-emerald-600">
                            {Number(it.discount_amount || 0) > 0 ? `-৳${(Number(it.discount_amount) * Number(it.quantity || 1)).toFixed(2)}` : '0'}
                          </td>
                          <td className="p-2 align-top text-right font-mono">৳{Number(it.unit_price).toFixed(2)}</td>
                          <td className="p-2 align-top text-center font-mono">{it.quantity}</td>
                          <td className="p-2 align-top text-right font-bold font-mono">৳{Number(it.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-400 font-bold bg-slate-50">
                      {/* Subtotal: Subtotal | - | - | - | total qnty(just values) | Amount */}
                      <tr className="border-t-2 border-slate-400">
                        <td colSpan="4" className="p-2 text-left font-bold text-slate-800">
                          {lang === 'bn' ? 'উপমোট' : 'Subtotal'}
                        </td>
                        <td className="p-2 text-center font-mono font-bold text-slate-800">
                          {formattedTotalQty}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          ৳{Number(sale.subtotal).toFixed(2)}
                        </td>
                      </tr>

                      {/* Discount: Discount | - | - | - | | if thkhe Amount hobe */}
                      {totalDiscount > 0 && (
                        <tr className="border-t border-slate-200 bg-emerald-50/50">
                          <td colSpan="4" className="p-2 text-left font-bold text-emerald-800">
                            {lang === 'bn' ? 'সর্বমোট ছাড় (Total Discount)' : 'Discount'}
                          </td>
                          <td className="p-2 text-center"></td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-700">
                            -৳{Number(totalDiscount).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  </table>

                  <div className="flex justify-end mt-4">
                    <div className="w-72 space-y-1.5 text-xs">
                      {sale.tax_amount > 0 && (
                        <div className="flex justify-between">
                          <span>{lang === 'bn' ? 'ভ্যাট / ট্যাক্স (VAT):' : 'VAT / Tax:'}</span>
                          <span className="font-mono">৳{sale.tax_amount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-base border-t border-black pt-1">
                        <span>{lang === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Grand Total:'}</span>
                        <span className="font-mono">৳{sale.grand_total}</span>
                      </div>
                      {isSettingOn('show_due_change', true) && (
                        <>
                          <div className="flex justify-between">
                            <span>{lang === 'bn' ? 'পরিশোধিত:' : 'Paid:'}</span>
                            <span className="font-mono">৳{sale.paid_amount}</span>
                          </div>
                          {sale.change_amount > 0 && (
                            <div className="flex justify-between text-emerald-600">
                              <span>{lang === 'bn' ? 'ফেরত:' : 'Change:'}</span>
                              <span className="font-mono">৳{sale.change_amount}</span>
                            </div>
                          )}
                          {sale.due_amount > 0 && (
                            <div className="flex justify-between text-rose-600 font-bold">
                              <span>{lang === 'bn' ? 'বকেয়া:' : 'Due:'}</span>
                              <span className="font-mono">৳{sale.due_amount}</span>
                            </div>
                          )}
                        </>
                      )}
                      {isSettingOn('show_loyalty_points', true) && (sale.points_earned > 0 || sale.points_redeemed > 0) && (
                        <div className="space-y-1 pt-1 border-t border-slate-200 text-xs">
                          {sale.points_redeemed > 0 && (
                            <div className="flex justify-between text-amber-700 font-semibold">
                              <span>{lang === 'bn' ? 'রিডিম করা পয়েন্ট:' : 'Points Redeemed:'}</span>
                              <span>-{sale.points_redeemed} pt (-৳{sale.points_discount_amount})</span>
                            </div>
                          )}
                          {sale.points_earned > 0 && (
                            <div className="flex justify-between text-indigo-700 font-semibold">
                              <span>{lang === 'bn' ? 'এই বিক্রয়ে অর্জিত পয়েন্ট:' : 'Points Earned:'}</span>
                              <span>+{sale.points_earned} pt</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms & Footer */}
                  <div className="mt-8 pt-4 border-t border-slate-300 text-center text-xs text-slate-500 space-y-1">
                    <div>{shopSettings.receipt_footer || (lang === 'bn' ? 'আমাদের সাথে ব্যবসার জন্য ধন্যবাদ!' : 'Thank you for your business!')}</div>
                    {isSettingOn('show_terms_conditions', true) && shopSettings.receipt_terms && (
                      <div className="italic text-[10px] text-slate-400">{shopSettings.receipt_terms}</div>
                    )}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default SaleInvoice;
