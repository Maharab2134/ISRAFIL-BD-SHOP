import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Barcode,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  CreditCard,
  Printer,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  RotateCcw,
  Percent,
  X,
  FileText,
} from 'lucide-react';
import api from '../../services/api';

export const PosTerminal = () => {
  const { t, formatCurrency, formatNumber } = useLanguage();
  const { success, error, warning } = useToast();

  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // null = walk-in
  const [walkInName, setWalkInName] = useState('ওয়াক-ইন কাস্টমার');
  const [orderDiscountType, setOrderDiscountType] = useState('fixed');
  const [orderDiscountValue, setOrderDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [txReference, setTxReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Completed Checkout State
  const [completedSale, setCompletedSale] = useState(null);
  const [receiptFormat, setReceiptFormat] = useState('80mm'); // '80mm', '58mm', 'a4'

  const barcodeInputRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/pos/data');
      setCategories(res.data.categories || []);
      setCustomers(res.data.customers || []);
      setProducts(res.data.products?.data || []);
    } catch (err) {
      error('পিওএস ডেটা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
      // Auto-focus barcode scanner
      setTimeout(() => barcodeInputRef.current?.focus(), 200);
    }
  };

  // Barcode Instant Lookup / Scanning (USB scanner triggers enter)
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    try {
      const res = await api.get(`/products/barcode/${encodeURIComponent(code)}`);
      addToCart(res.data);
      setBarcodeInput('');
    } catch (err) {
      error(`বারকোড '${code}' খুঁজে পাওয়া যায়নি!`);
      setBarcodeInput('');
    }
  };

  // Cart Operations
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (product.current_stock <= existing.quantity) {
          warning(`'${product.name}' এর স্টক সীমিত (${product.current_stock} টি)।`);
        }
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        if (product.current_stock <= 0) {
          warning(`সতর্কতা: '${product.name}' এর স্টক শূন্য!`);
        }
        return [
          ...prev,
          {
            product_id: product.id,
            name: product.name,
            name_bn: product.name_bn,
            barcode: product.barcode,
            unit_price: Number(product.selling_price),
            purchase_price: Number(product.purchase_price),
            tax_percent: Number(product.tax_percent || 0),
            unit: product.unit?.name_bn || 'পিস',
            quantity: 1,
            discount_amount: 0,
            current_stock: Number(product.current_stock),
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setOrderDiscountValue(0);
    setTenderedAmount('');
  };

  // Financial Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  const totalTax = cart.reduce(
    (acc, item) => acc + ((item.unit_price * item.quantity * item.tax_percent) / 100),
    0
  );

  let discountAmount = Number(orderDiscountValue) || 0;
  if (orderDiscountType === 'percentage' && discountAmount > 0) {
    discountAmount = (subtotal * discountAmount) / 100;
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + totalTax);
  const numericTendered = tenderedAmount === '' ? grandTotal : Number(tenderedAmount);
  const changeAmount = Math.max(0, numericTendered - grandTotal);
  const dueAmount = Math.max(0, grandTotal - numericTendered);

  // Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) {
      error('কার্ট খালি! অনুগ্রহ করে পণ্য যুক্ত করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer ? selectedCustomer.name : walkInName,
        customer_phone: selectedCustomer ? selectedCustomer.phone : null,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
        })),
        discount_type: orderDiscountType,
        discount_rate: orderDiscountType === 'percentage' ? orderDiscountValue : 0,
        discount_amount: discountAmount,
        paid_amount: numericTendered,
        payment_method: paymentMethod,
        transaction_reference: txReference,
      };

      const res = await api.post('/pos/checkout', payload);
      setCompletedSale(res.data.sale);
      success(t('invoiceSuccess'));
      clearCart();
    } catch (err) {
      const msg = err.response?.data?.message || 'চেকআউট সম্পন্ন করতে সমস্যা হয়েছে।';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
    const matchesSearch = productSearch
      ? p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.barcode.includes(productSearch) ||
        (p.name_bn && p.name_bn.includes(productSearch))
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* If completed sale, show Dedicated Success & Print Screen */}
      {completedSale ? (
        <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('invoiceSuccess')}
            </h2>
            <p className="text-sm text-slate-500">
              চালান নম্বর: <span className="font-bold text-indigo-600">{completedSale.invoice_number}</span>
            </p>
          </div>

          {/* Invoice Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">গ্রাহক:</span>
              <span className="font-semibold">{completedSale.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">মোট আইটেম:</span>
              <span className="font-semibold">{completedSale.total_items} টি</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>সর্বমোট মূল্য:</span>
              <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(completedSale.grand_total)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>পরিশোধিত: {formatCurrency(completedSale.paid_amount)}</span>
              {completedSale.due_amount > 0 && (
                <span className="text-rose-600 font-bold">বকেয়া: {formatCurrency(completedSale.due_amount)}</span>
              )}
              {completedSale.change_amount > 0 && (
                <span className="text-emerald-600 font-bold">ফেরত: {formatCurrency(completedSale.change_amount)}</span>
              )}
            </div>
          </div>

          {/* Receipt Format Switcher & Action Buttons */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-center">
              প্রিন্ট ফরম্যাট নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setReceiptFormat('80mm')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  receiptFormat === '80mm'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                ৮০ মিমি থার্মাল
              </button>
              <button
                onClick={() => setReceiptFormat('58mm')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  receiptFormat === '58mm'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                ৫৮ মিমি থার্মাল
              </button>
              <button
                onClick={() => setReceiptFormat('a4')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  receiptFormat === 'a4'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                A4 স্ট্যান্ডার্ড
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>রসিদ প্রিন্ট করুন</span>
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>পরবর্তী বিক্রয় (Next)</span>
              </button>
            </div>
          </div>

          {/* Hidden Printable Area with clean CSS styling */}
          <div id="printable-area" className="hidden print:block">
            {receiptFormat === '80mm' && (
              <div className="receipt-80mm p-2">
                <div className="text-center pb-2 border-b border-dashed border-black">
                  <div className="font-extrabold text-base">ইসরাফিল বিডি শপ</div>
                  <div className="text-[10px]">সেন্ট্রাল প্লাজা, জিইসি মোড়, চট্টগ্রাম</div>
                  <div className="text-[10px]">ফোন: +৮৮০ ১৭১১-২৩৪৫৬৭</div>
                  <div className="text-[11px] font-bold mt-1">ক্যাশ মেমো (ইনভয়েস)</div>
                </div>
                <div className="py-1 text-[10px] space-y-0.5 border-b border-dashed border-black">
                  <div>চালান: {completedSale.invoice_number}</div>
                  <div>তারিখ: {new Date(completedSale.sale_date).toLocaleString('bn-BD')}</div>
                  <div>গ্রাহক: {completedSale.customer_name}</div>
                  <div>ক্যাশিয়ার: {completedSale.user?.name || 'ক্যাশিয়ার'}</div>
                </div>
                <table className="w-full my-2 text-[10px]">
                  <thead>
                    <tr className="border-b border-black text-left">
                      <th className="py-1">বিবরণ</th>
                      <th className="text-center">পরিমাণ</th>
                      <th className="text-right">মূল্য</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedSale.items?.map((it) => (
                      <tr key={it.id}>
                        <td className="py-0.5">{it.product_name}</td>
                        <td className="text-center">{it.quantity}</td>
                        <td className="text-right">৳{it.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pt-2 border-t border-dashed border-black text-[11px] space-y-1">
                  <div className="flex justify-between"><span>উপমোট:</span><span>৳{completedSale.subtotal}</span></div>
                  {completedSale.order_discount_amount > 0 && (
                    <div className="flex justify-between"><span>ছাড়:</span><span>-৳{completedSale.order_discount_amount}</span></div>
                  )}
                  {completedSale.tax_amount > 0 && (
                    <div className="flex justify-between"><span>ভ্যাট:</span><span>৳{completedSale.tax_amount}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                    <span>সর্বমোট:</span><span>৳{completedSale.grand_total}</span>
                  </div>
                  <div className="flex justify-between text-[10px]"><span>পরিশোধিত:</span><span>৳{completedSale.paid_amount}</span></div>
                  {completedSale.change_amount > 0 && (
                    <div className="flex justify-between text-[10px]"><span>ফেরত:</span><span>৳{completedSale.change_amount}</span></div>
                  )}
                  {completedSale.due_amount > 0 && (
                    <div className="flex justify-between text-[10px] font-bold"><span>বকেয়া:</span><span>৳{completedSale.due_amount}</span></div>
                  )}
                </div>
                <div className="text-center text-[9px] pt-4 mt-2 border-t border-dashed border-black">
                  ইসরাফিল বিডি শপে কেনাকাটার জন্য আন্তরিক ধন্যবাদ!
                </div>
              </div>
            )}

            {receiptFormat === '58mm' && (
              <div className="receipt-58mm p-1">
                <div className="text-center pb-1 border-b border-dashed border-black">
                  <div className="font-extrabold text-sm">ইসরাফিল বিডি শপ</div>
                  <div className="text-[9px]">চালান: {completedSale.invoice_number}</div>
                  <div className="text-[9px]">{new Date(completedSale.sale_date).toLocaleDateString('bn-BD')}</div>
                </div>
                <div className="my-1">
                  {completedSale.items?.map((it) => (
                    <div key={it.id} className="flex justify-between text-[9px]">
                      <span>{it.product_name} x{it.quantity}</span>
                      <span>৳{it.total}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-1 border-t border-dashed border-black text-[10px] font-bold flex justify-between">
                  <span>মোট:</span><span>৳{completedSale.grand_total}</span>
                </div>
                <div className="text-center text-[8px] pt-2">ধন্যবাদ! আবার আসবেন।</div>
              </div>
            )}

            {receiptFormat === 'a4' && (
              <div className="invoice-a4 p-10 font-sans">
                <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-4">
                  <div>
                    <h1 className="text-2xl font-black text-indigo-700">ISRAFIL BD SHOP</h1>
                    <p className="text-sm text-slate-600">দোকান নং #১২, সেন্ট্রাল প্লাজা, জিইসি মোড়, চট্টগ্রাম</p>
                    <p className="text-sm text-slate-600">ফোন: +৮৮০ ১৭১১-২৩৪৫৬৭ | ইমেইল: info@israfilbd.com</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold uppercase text-slate-800">চালান / ক্যাশ মেমো</span>
                    <p className="text-sm font-semibold text-slate-600 mt-1">চালান #: {completedSale.invoice_number}</p>
                    <p className="text-sm text-slate-500">তারিখ: {new Date(completedSale.sale_date).toLocaleString('bn-BD')}</p>
                  </div>
                </div>

                <div className="my-6 p-4 rounded-xl bg-slate-50 flex justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">গ্রাহকের তথ্য</span>
                    <div className="font-bold text-base text-slate-800">{completedSale.customer_name}</div>
                    <div className="text-sm text-slate-600">{completedSale.customer_phone || 'ওয়াক-ইন কাস্টমার'}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase">পেমেন্ট মেথড</span>
                    <div className="font-bold text-base text-slate-800 capitalize">{completedSale.payments?.[0]?.payment_method || 'Cash'}</div>
                    <div className="text-sm text-emerald-600 font-bold capitalize">{completedSale.payment_status}</div>
                  </div>
                </div>

                <table className="w-full my-6 text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-left font-bold">
                      <th className="p-3">#</th>
                      <th className="p-3">পণ্য</th>
                      <th className="p-3 text-center">পরিমাণ</th>
                      <th className="p-3 text-right">একক দর</th>
                      <th className="p-3 text-right">মোট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedSale.items?.map((item, idx) => (
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
                    <div className="flex justify-between text-slate-600"><span>উপমোট:</span><span>৳{completedSale.subtotal}</span></div>
                    {completedSale.order_discount_amount > 0 && (
                      <div className="flex justify-between text-slate-600"><span>ছাড়:</span><span>-৳{completedSale.order_discount_amount}</span></div>
                    )}
                    {completedSale.tax_amount > 0 && (
                      <div className="flex justify-between text-slate-600"><span>ভ্যাট (৫%):</span><span>৳{completedSale.tax_amount}</span></div>
                    )}
                    <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-800 pt-2">
                      <span>সর্বমোট:</span><span>৳{completedSale.grand_total}</span>
                    </div>
                    <div className="flex justify-between text-slate-600"><span>পরিশোধিত:</span><span>৳{completedSale.paid_amount}</span></div>
                    {completedSale.due_amount > 0 && (
                      <div className="flex justify-between text-rose-600 font-bold"><span>বকেয়া:</span><span>৳{completedSale.due_amount}</span></div>
                    )}
                  </div>
                </div>

                <div className="mt-16 pt-6 border-t border-slate-300 flex justify-between items-end text-xs text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-700">শর্তাবলী:</p>
                    <p>• বিক্রিত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমো সহ অক্ষত অবস্থায় পরিবর্তনযোগ্য।</p>
                    <p>• পণ্য ক্রয়ের জন্য ধন্যবাদ!</p>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-1" />
                    <span>কর্তৃপক্ষের স্বাক্ষর</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Regular POS Terminal Layout */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Area (8 cols): Barcode Search, Categories & Products Grid */}
          <div className="xl:col-span-7 space-y-4">
            {/* Barcode Scanner Input */}
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <Barcode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder={t('barcodePlaceholder')}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm font-semibold rounded-2xl bg-white dark:bg-[#1E293B] border-2 border-indigo-500/40 focus:border-indigo-600 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition shadow-card"
              />
            </form>

            {/* Category Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-lg scrollbar-none">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === null
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  সব ক্যাটাগরি
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name_bn || cat.name}
                  </button>
                ))}
              </div>

              {/* Product Text Search */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className="p-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
                >
                  <div className="aspect-video w-full rounded-xl bg-slate-100 dark:bg-slate-800 mb-2 overflow-hidden relative">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                        {prod.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-white font-semibold">
                      স্টক: {prod.current_stock}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition">
                      {prod.name_bn || prod.name}
                    </h3>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {prod.barcode}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(prod.selling_price)}
                    </span>
                    <button className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Area (5 cols): Modern Cart & Checkout Panel */}
          <div className="xl:col-span-5 p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4">
            {/* Header: Customer Select & Cart Title */}
            <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('cart')} ({cart.length})
                  </span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition"
                  >
                    কার্ট খালি করুন
                  </button>
                )}
              </div>

              {/* Customer Selector */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedCustomer ? selectedCustomer.id : ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const found = customers.find((c) => c.id === id);
                    setSelectedCustomer(found || null);
                  }}
                  className="flex-1 py-1.5 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">ওয়াক-ইন কাস্টমার (সাধারণ ক্রেতা)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) {c.current_balance > 0 ? `[বকেয়া: ৳${c.current_balance}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-xs">{t('cartEmptyPrompt')}</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.name_bn || item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatCurrency(item.unit_price)} × {item.quantity} {item.unit}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product_id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-16 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="ml-2 p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Order Discount */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>উপমোট (Subtotal):</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(subtotal)}</span>
              </div>

              {/* Order Discount Row */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">অর্ডার ডিসকাউন্ট:</span>
                <div className="flex items-center gap-1">
                  <select
                    value={orderDiscountType}
                    onChange={(e) => setOrderDiscountType(e.target.value)}
                    className="py-1 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]"
                  >
                    <option value="fixed">৳ নির্দিষ্ট</option>
                    <option value="percentage">% শতাংশ</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={orderDiscountValue}
                    onChange={(e) => setOrderDiscountValue(Math.max(0, Number(e.target.value)))}
                    className="w-16 py-1 px-2 text-right rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
              </div>

              {totalTax > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>ভ্যাট (VAT):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(totalTax)}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>সর্বমোট (Grand Total):</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Method Tabs & Tendered */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-4 gap-1.5">
                {['cash', 'bkash', 'nagad', 'card'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold capitalize transition ${
                      paymentMethod === method
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {method === 'cash' ? 'ক্যাশ' : method === 'bkash' ? 'বিকাশ' : method === 'nagad' ? 'নগদ' : 'কার্ড'}
                  </button>
                ))}
              </div>

              {/* Tendered Amount & Change Display */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    প্রদত্ত টাকা (Tendered)
                  </label>
                  <input
                    type="number"
                    placeholder={`৳ ${grandTotal}`}
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(e.target.value)}
                    className="w-full py-2 px-3 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-right">
                    <span className="text-[10px] text-slate-400 block">
                      {dueAmount > 0 ? 'বকেয়া থাকবে' : 'ফেরত দিতে হবে'}
                    </span>
                    <span
                      className={`text-sm font-black ${
                        dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {dueAmount > 0 ? formatCurrency(dueAmount) : formatCurrency(changeAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>প্রক্রিয়াধীন...</span>
                  </>
                ) : (
                  <>
                    <span>পেমেন্ট ও চালান তৈরি করুন ({formatCurrency(grandTotal)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
