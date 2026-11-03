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
  Sparkles,
  Zap,
  Tag,
  Coins,
  Receipt,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Package,
} from 'lucide-react';
import api from '../../services/api';

export const PosTerminal = () => {
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
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
  const categoryScrollRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, [lang]);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/pos/data');
      setCategories(res.data.categories || []);
      setCustomers(res.data.customers || []);
      setProducts(res.data.products?.data || []);
    } catch (err) {
      error(lang === 'bn' ? 'পিওএস ডেটা লোড করতে সমস্যা হয়েছে।' : 'Failed to load POS data.');
    } finally {
      setLoading(false);
      setTimeout(() => barcodeInputRef.current?.focus(), 250);
    }
  };

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth',
      });
    }
  };

  // Barcode Instant Lookup / Scanning (USB/Bluetooth scanner triggers Enter)
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    try {
      const res = await api.get(`/products/barcode/${encodeURIComponent(code)}`);
      addToCart(res.data);
      setBarcodeInput('');
    } catch (err) {
      error(
        lang === 'bn'
          ? `বারকোড '${code}' যুক্ত কোনো পণ্য পাওয়া যায়নি!`
          : `No product found with barcode '${code}'!`
      );
      setBarcodeInput('');
    }
  };

  // Cart Operations
  const addToCart = (product) => {
    if (Number(product.current_stock) <= 0) {
      warning(
        lang === 'bn'
          ? `সতর্কতা: '${product.name}' এর বর্তমান স্টক শূন্য!`
          : `Warning: '${product.name}' is currently out of stock!`
      );
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (Number(product.current_stock) <= existing.quantity) {
          warning(
            lang === 'bn'
              ? `'${product.name}' এর অবশিষ্ট স্টক সীমিত (${product.current_stock})`
              : `Limited stock remaining for '${product.name}' (${product.current_stock})`
          );
        }
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
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
            unit: lang === 'bn' ? (product.unit?.name_bn || 'পিস') : (product.unit?.name || 'pcs'),
            quantity: 1,
            discount_amount: 0,
            current_stock: Number(product.current_stock),
            image_url: product.image_url,
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

  const setExplicitQuantity = (productId, qty) => {
    const parsed = Math.max(1, parseInt(qty, 10) || 1);
    setCart((prev) =>
      prev.map((item) => (item.product_id === productId ? { ...item, quantity: parsed } : item))
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setOrderDiscountValue(0);
    setTenderedAmount('');
    setTxReference('');
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  // Financial Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  const totalTax = cart.reduce(
    (acc, item) => acc + (item.unit_price * item.quantity * item.tax_percent) / 100,
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

  // Quick Cash amount helper
  const addQuickCash = (amount) => {
    if (amount === 'exact') {
      setTenderedAmount(grandTotal.toString());
    } else {
      const current = Number(tenderedAmount) || 0;
      setTenderedAmount((current + amount).toString());
    }
  };

  // Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) {
      error(lang === 'bn' ? 'কার্ট খালি! অনুগ্রহ করে পণ্য যুক্ত করুন।' : 'Cart is empty! Please add products.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer ? selectedCustomer.name : (lang === 'bn' ? 'ওয়াক-ইন কাস্টমার' : 'Walk-in Customer'),
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
      const msg = err.response?.data?.message || (lang === 'bn' ? 'চেকআউট সম্পন্ন করতে সমস্যা হয়েছে।' : 'Failed to complete checkout.');
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
    <div className="w-full space-y-3">
      {/* If completed sale, show Dedicated Success & Print Screen */}
      {completedSale ? (
        <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t('invoiceSuccess')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'চালান নম্বর: ' : 'Invoice #: '}
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {completedSale.invoice_number}
              </span>
            </p>
          </div>

          {/* Invoice Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">{lang === 'bn' ? 'ক্রেতা:' : 'Customer:'}</span>
              <span className="font-semibold">{completedSale.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{lang === 'bn' ? 'মোট আইটেম:' : 'Total Items:'}</span>
              <span className="font-semibold">{completedSale.total_items} {lang === 'bn' ? 'টি' : 'items'}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>{lang === 'bn' ? 'সর্বমোট মূল্য:' : 'Grand Total:'}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">{formatCurrency(completedSale.grand_total)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pt-1">
              <span>{lang === 'bn' ? 'পরিশোধিত:' : 'Paid:'} {formatCurrency(completedSale.paid_amount)}</span>
              {completedSale.due_amount > 0 && (
                <span className="text-rose-600 font-bold">{lang === 'bn' ? 'বকেয়া:' : 'Due:'} {formatCurrency(completedSale.due_amount)}</span>
              )}
              {completedSale.change_amount > 0 && (
                <span className="text-emerald-600 font-bold">{lang === 'bn' ? 'ফেরত:' : 'Change:'} {formatCurrency(completedSale.change_amount)}</span>
              )}
            </div>
          </div>

          {/* Receipt Format Switcher & Action Buttons */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-center">
              {lang === 'bn' ? 'প্রিন্ট পেপার ফরম্যাট নির্বাচন করুন:' : 'Select Receipt Paper Size:'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setReceiptFormat('80mm')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  receiptFormat === '80mm'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                80mm Thermal
              </button>
              <button
                type="button"
                onClick={() => setReceiptFormat('58mm')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  receiptFormat === '58mm'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                58mm Thermal
              </button>
              <button
                type="button"
                onClick={() => setReceiptFormat('a4')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  receiptFormat === 'a4'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                A4 Invoice
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>{t('print')}</span>
              </button>
              <button
                onClick={() => {
                  setCompletedSale(null);
                  setTimeout(() => barcodeInputRef.current?.focus(), 150);
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('newSale')}</span>
              </button>
            </div>
          </div>

          {/* Hidden Printable Area with Clean CSS Stylesheet */}
          <div id="printable-area" className="hidden print:block text-black">
            {receiptFormat === '80mm' && (
              <div className="receipt-80mm p-2">
                <div className="text-center pb-2 border-b border-dashed border-black">
                  <div className="font-extrabold text-base">ISRAFIL BD SHOP</div>
                  <div className="text-[10px]">ঢাকা, বাংলাদেশ • ফোন: +৮৮০ ১৭০০-০০০০০০</div>
                  <div className="text-[11px] font-bold mt-1">CASH RECEIPT / ক্যাশ মেমো</div>
                </div>
                <div className="py-1 text-[10px] space-y-0.5 border-b border-dashed border-black">
                  <div>Invoice: {completedSale.invoice_number}</div>
                  <div>Date: {new Date(completedSale.sale_date).toLocaleString()}</div>
                  <div>Customer: {completedSale.customer_name}</div>
                  <div>Cashier: {completedSale.user?.name || 'Cashier'}</div>
                </div>
                <table className="w-full my-2 text-[10px]">
                  <thead>
                    <tr className="border-b border-black text-left">
                      <th className="py-1">Item</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Total</th>
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
                  <div className="flex justify-between"><span>Subtotal:</span><span>৳{completedSale.subtotal}</span></div>
                  {completedSale.order_discount_amount > 0 && (
                    <div className="flex justify-between"><span>Discount:</span><span>-৳{completedSale.order_discount_amount}</span></div>
                  )}
                  {completedSale.tax_amount > 0 && (
                    <div className="flex justify-between"><span>Tax:</span><span>৳{completedSale.tax_amount}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                    <span>Total:</span><span>৳{completedSale.grand_total}</span>
                  </div>
                  <div className="flex justify-between text-[10px]"><span>Paid:</span><span>৳{completedSale.paid_amount}</span></div>
                  {completedSale.change_amount > 0 && (
                    <div className="flex justify-between text-[10px]"><span>Change:</span><span>৳{completedSale.change_amount}</span></div>
                  )}
                  {completedSale.due_amount > 0 && (
                    <div className="flex justify-between text-[10px] font-bold"><span>Due:</span><span>৳{completedSale.due_amount}</span></div>
                  )}
                </div>
                <div className="text-center text-[9px] pt-4 mt-2 border-t border-dashed border-black">
                  Thank you for shopping with ISRAFIL BD SHOP!
                </div>
              </div>
            )}

            {receiptFormat === '58mm' && (
              <div className="receipt-58mm p-1 text-[9px]">
                <div className="text-center pb-1 border-b border-dashed border-black">
                  <div className="font-extrabold text-xs">ISRAFIL BD SHOP</div>
                  <div>Inv: {completedSale.invoice_number}</div>
                  <div>{new Date(completedSale.sale_date).toLocaleDateString()}</div>
                </div>
                <div className="py-1 space-y-0.5 border-b border-dashed border-black">
                  {completedSale.items?.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span className="truncate max-w-[120px]">{it.product_name} × {it.quantity}</span>
                      <span>৳{it.total}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-1 space-y-0.5 font-bold">
                  <div className="flex justify-between"><span>Total:</span><span>৳{completedSale.grand_total}</span></div>
                  <div className="flex justify-between font-normal"><span>Paid:</span><span>৳{completedSale.paid_amount}</span></div>
                </div>
                <div className="text-center text-[8px] pt-2 border-t border-dashed border-black mt-1">
                  Thank You!
                </div>
              </div>
            )}

            {receiptFormat === 'a4' && (
              <div className="p-8 max-w-3xl mx-auto border border-slate-300">
                <div className="flex justify-between items-start pb-6 border-b border-slate-300">
                  <div>
                    <h1 className="text-2xl font-black text-indigo-700">ISRAFIL BD SHOP</h1>
                    <p className="text-xs text-slate-600">ঢাকা, বাংলাদেশ • ফোন: +৮৮০ ১৭০০-০০০০০০</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold uppercase text-slate-800">TAX INVOICE</span>
                    <p className="text-xs font-semibold mt-1">Invoice #: {completedSale.invoice_number}</p>
                    <p className="text-xs text-slate-500">Date: {new Date(completedSale.sale_date).toLocaleString()}</p>
                  </div>
                </div>

                <div className="my-4 p-3 bg-slate-50 flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-500 uppercase block text-[10px]">Customer</span>
                    <div className="font-bold">{completedSale.customer_name}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-500 uppercase block text-[10px]">Payment Method</span>
                    <div className="font-bold capitalize">{completedSale.payments?.[0]?.payment_method || 'Cash'}</div>
                  </div>
                </div>

                <table className="w-full my-4 text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-left font-bold">
                      <th className="p-2">#</th>
                      <th className="p-2">Product</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedSale.items?.map((it, idx) => (
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
                    <div className="flex justify-between"><span>Subtotal:</span><span>৳{completedSale.subtotal}</span></div>
                    {completedSale.order_discount_amount > 0 && (
                      <div className="flex justify-between"><span>Discount:</span><span>-৳{completedSale.order_discount_amount}</span></div>
                    )}
                    <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                      <span>Total:</span><span>৳{completedSale.grand_total}</span>
                    </div>
                    <div className="flex justify-between"><span>Paid:</span><span>৳{completedSale.paid_amount}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Regular POS Terminal Screen - Spacious, Beautiful, Full Width */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
          {/* Left Column (8 or 9 cols): Barcode, Full-Width Categories & Product Grid */}
          <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-3">
            {/* Top Unified Control Bar: Barcode (Left), Text Search (Right), Live Scanner Status */}
            <div className="bg-white dark:bg-[#1E293B] p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
              {/* Barcode Scanner Input */}
              <form onSubmit={handleBarcodeSubmit} className="relative flex-1 w-full">
                <Barcode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-600" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder={lang === 'bn' ? 'বারকোড স্ক্যান করুন বা লিখুন (Enter চাপুন)...' : 'Scan barcode or enter manually (Press Enter)...'}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 text-sm font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </form>

              {/* Product Live Search */}
              <div className="relative w-full md:w-80 shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'পণ্য বা কোড দিয়ে খুঁজুন...' : 'Search products by name/code...'}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => setProductSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Clear Search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Live Scanner Ready Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{lang === 'bn' ? 'স্ক্যানার সক্রিয়' : 'Scanner Ready'}</span>
              </div>

              {/* Reload / Sync Button */}
              <button
                type="button"
                onClick={fetchInitialData}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
                title="Reload Products"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* FULL-WIDTH CATEGORY CHIPS BAR (No max-w-md constraint, smooth scrolling, left/right buttons) */}
            <div className="relative w-full flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="w-8 h-8 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-700 shrink-0 flex items-center justify-center transition shadow-sm"
                title="Previous Categories"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={categoryScrollRef}
                className="flex-1 flex items-center gap-2 overflow-x-auto py-1 no-scrollbar scroll-smooth"
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                    selectedCategory === null
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'সকল পণ্য' : 'All Items'}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedCategory === null
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {products.length}
                  </span>
                </button>

                {categories.map((cat) => {
                  const catCount = products.filter((p) => p.category_id === cat.id).length;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                          : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <span>{lang === 'bn' ? (cat.name_bn || cat.name) : cat.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {catCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="w-8 h-8 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-700 shrink-0 flex items-center justify-center transition shadow-sm"
                title="Next Categories"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Spacious Responsive Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 space-y-2">
                  <Package className="w-10 h-10 mx-auto opacity-30 stroke-1" />
                  <p className="text-sm font-semibold">
                    {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি।' : 'No products found matching criteria.'}
                  </p>
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const stock = Number(prod.current_stock);
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock <= Number(prod.alert_stock);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => addToCart(prod)}
                      className="p-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98] select-none"
                    >
                      {/* Image Box with robust onError Fallback */}
                      <div className="aspect-[4/3] w-full rounded-xl bg-slate-100 dark:bg-slate-800 mb-2 overflow-hidden relative border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                        {prod.image_url ? (
                          <img
                            src={prod.image_url}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800/80 ${
                            prod.image_url ? 'hidden' : 'flex'
                          }`}
                        >
                          <Package className="w-8 h-8 opacity-40 stroke-1 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {prod.name.substring(0, 3)}
                          </span>
                        </div>

                        {/* Stock Status Badge at Top-Right */}
                        <span
                          className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md ${
                            isOutOfStock
                              ? 'bg-rose-600/90 text-white'
                              : isLowStock
                              ? 'bg-amber-600/90 text-white'
                              : 'bg-emerald-600/90 text-white'
                          }`}
                        >
                          {lang === 'bn' ? `স্টক: ${stock}` : `Stock: ${stock}`}
                        </span>
                      </div>

                      {/* Product Title & Info */}
                      <div className="flex-1">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {lang === 'bn' ? (prod.name_bn || prod.name) : prod.name}
                        </h3>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                          <span>{prod.barcode}</span>
                          {prod.unit && <span>• {lang === 'bn' ? (prod.unit.name_bn || 'পিস') : (prod.unit.name || 'pcs')}</span>}
                        </div>
                      </div>

                      {/* Price & Add Action */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(prod.selling_price)}
                        </span>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column (4 or 3 cols): Dedicated Cart & Instant Checkout Panel */}
          <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 sticky top-20 max-h-[calc(100vh-85px)]">
            {/* Cart Header & Customer Selector */}
            <div className="space-y-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('cart')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black">
                    {cart.length}
                  </span>
                </div>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition"
                  >
                    {lang === 'bn' ? 'খালি করুন' : 'Clear'}
                  </button>
                )}
              </div>

              {/* Customer Selector */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedCustomer ? selectedCustomer.id : ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const found = customers.find((c) => c.id === id);
                    setSelectedCustomer(found || null);
                  }}
                  className="flex-1 py-1.5 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">
                    {lang === 'bn' ? 'ওয়াক-ইন কাস্টমার (সাধারণ ক্রেতা)' : 'Walk-in Customer (General)'}
                  </option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''} {c.current_balance > 0 ? `[${lang === 'bn' ? 'বকেয়া' : 'Due'}: ৳${c.current_balance}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 max-h-52 xl:max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-slate-400 space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto opacity-30 stroke-1" />
                  <p className="text-xs font-medium">{t('cartEmptyPrompt')}</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {lang === 'bn' ? (item.name_bn || item.name) : item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatCurrency(item.unit_price)} × {item.quantity} {item.unit}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => setExplicitQuantity(item.product_id, e.target.value)}
                        className="w-9 py-0.5 text-center font-bold bg-transparent border border-slate-200 dark:border-slate-700 rounded-md text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-16 text-right font-black text-slate-900 dark:text-white">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product_id)}
                      className="ml-2 p-1 text-slate-400 hover:text-rose-600 transition"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Order Discount */}
            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{lang === 'bn' ? 'উপমোট (Subtotal):' : 'Subtotal:'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(subtotal)}</span>
              </div>

              {/* Order Discount Row */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">{t('discount')}:</span>
                <div className="flex items-center gap-1">
                  <select
                    value={orderDiscountType}
                    onChange={(e) => setOrderDiscountType(e.target.value)}
                    className="py-1 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]"
                  >
                    <option value="fixed">৳ {lang === 'bn' ? 'টাকা' : 'Fixed'}</option>
                    <option value="percentage">% {lang === 'bn' ? 'শতাংশ' : 'Percent'}</option>
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
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('tax')}:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(totalTax)}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between items-center text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>{t('total')}:</span>
                <span className="text-xl text-indigo-600 dark:text-indigo-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Method Tabs & Quick Cash */}
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'cash', bn: 'ক্যাশ', en: 'Cash' },
                  { key: 'bkash', bn: 'বিকাশ', en: 'bKash' },
                  { key: 'nagad', bn: 'নগদ', en: 'Nagad' },
                  { key: 'card', bn: 'কার্ড', en: 'Card' },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setPaymentMethod(m.key)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition ${
                      paymentMethod === m.key
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lang === 'bn' ? m.bn : m.en}
                  </button>
                ))}
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => addQuickCash('exact')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition whitespace-nowrap"
                >
                  {lang === 'bn' ? 'বরাবর (Exact)' : 'Exact'}
                </button>
                {[50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => addQuickCash(amt)}
                    className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition whitespace-nowrap"
                  >
                    +৳{amt}
                  </button>
                ))}
              </div>

              {/* Tendered Amount & Change Display */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    {lang === 'bn' ? 'প্রদত্ত টাকা' : 'Tendered (৳)'}
                  </label>
                  <input
                    type="number"
                    placeholder={`৳ ${grandTotal}`}
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(e.target.value)}
                    className="w-full py-2 px-3 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-right">
                    <span className="text-[10px] text-slate-400 block">
                      {dueAmount > 0
                        ? (lang === 'bn' ? 'বকেয়া থাকবে' : 'Due Amount')
                        : (lang === 'bn' ? 'ফেরত দিন' : 'Change Return')}
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
                className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{lang === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {lang === 'bn'
                        ? `পেমেন্ট সম্পন্ন করুন (${formatCurrency(grandTotal)})`
                        : `Complete Checkout (${formatCurrency(grandTotal)})`}
                    </span>
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

export default PosTerminal;
